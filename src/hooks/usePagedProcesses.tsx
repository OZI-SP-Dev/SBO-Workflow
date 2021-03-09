import { useContext, useEffect, useState } from "react";
import { IProcess } from "../api/DomainObjects";
import { FilterField, FilterValue, IProcessesPage, ProcessesApiConfig, ProcessFilter } from "../api/ProcessesApi";
import { UserApiConfig } from "../api/UserApi";
import { ErrorsContext } from "../providers/ErrorsContext";
import { useEmail } from "./useEmail";

interface IProcessesFilters {
    page: number,
    fieldFilters: ProcessFilter[],
    // Name of the field that the results should be sorted by
    sortBy?: FilterField,
    // Whether the sortBy field is applied in ascending order or not
    ascending?: boolean
}

export interface IPagedProcesses {
    processes: IProcess[],
    activeFilters: FilterField[],
    page: number,
    hasNext: boolean,
    loading: boolean,
    fetchCachedProcess(processId: number): IProcess | undefined,
    refreshPage(): void,
    sortBy(field?: FilterField, ascending?: boolean): void,
    addFilter(fieldName: FilterField, filterValue: FilterValue, isStartsWith?: boolean): void,
    clearFilter(fieldName: FilterField): void,
    clearAllFilters(): void,
    incrementPage(): void,
    decrementPage(): void,
    submitProcess(process: IProcess): Promise<IProcess>,
    deleteProcess(processId: number): Promise<void>
}

export function usePagedProcesses(): IPagedProcesses {

    const errorsContext = useContext(ErrorsContext);
    const email = useEmail();

    const processesApi = ProcessesApiConfig.getApi();
    const userApi = UserApiConfig.getApi();

    const [processes, setProcesses] = useState<IProcessesPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<IProcessesFilters>({
        page: 1,
        fieldFilters: []
    });
    const [refresh, setRefresh] = useState<boolean>(true);

    const fetchProcessesPage = async (refreshCache?: boolean) => {
        try {
            setLoading(true);
            let processesCopy = refreshCache ? [] : processes;
            if (processesCopy.length === 0) {
                processesCopy.push(await processesApi.fetchFirstPageOfProcesses(filters.fieldFilters, filters.sortBy, filters.ascending));
            }
            while (processesCopy.length < filters.page && processesCopy[processesCopy.length - 1].hasNext) {
                processesCopy.push(await processesCopy[processesCopy.length - 1].getNext());
            }
            setProcesses(processesCopy);
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        } finally {
            setLoading(false);
        }
    }

    const fetchCachedProcess = (processId: number): IProcess | undefined => {
        const processesPages = processes;
        for (const page of processesPages) {
            let process = page.results.find(p => p.Id === processId);
            if (process) {
                return process;
            }
        }
        return undefined;
    }

    const refreshPage = () => {
        setFilters({
            page: 1,
            fieldFilters: []
        });
        setRefresh(true);
    }

    const addFilter = (fieldName: FilterField, filterValue: FilterValue, isStartsWith?: boolean): void => {
        if (filterValue) {
            let newFilters = [...filters.fieldFilters];
            let oldFilterIndex = newFilters.findIndex(filter => filter.fieldName === fieldName);
            if (oldFilterIndex >= 0) {
                newFilters[oldFilterIndex].filterValue = filterValue;
                newFilters[oldFilterIndex].isStartsWith = isStartsWith;
            } else {
                newFilters.push({ fieldName: fieldName, filterValue: filterValue, isStartsWith: isStartsWith });
            }
            setFilters({ ...filters, page: 1, fieldFilters: newFilters });
        } else {
            clearFilter(fieldName);
        }
        setRefresh(true);
    }

    const clearFilter = (fieldName: FilterField): void => {
        if (filters.fieldFilters.some(filter => filter.fieldName === fieldName)) {
            setFilters({ ...filters, page: 1, fieldFilters: filters.fieldFilters.filter(filter => filter.fieldName !== fieldName) });
            setRefresh(true);
        }
    }

    const clearAllFilters = (): void => {
        setFilters({ ...filters, fieldFilters: [] });
        setRefresh(true);
    }

    const submitProcess = async (process: IProcess) => {
        try {
            let p = { ...process };
            // fetch the person details async to speed up the submit a little
            let co = userApi.getPersonDetails(p.ContractingOfficer.EMail);
            let sbp = userApi.getPersonDetails(p.SmallBusinessProfessional.EMail);
            let buyer = userApi.getPersonDetails(p.Buyer.EMail);
            p.ContractingOfficer = await co;
            p.SmallBusinessProfessional = await sbp;
            p.Buyer = await buyer;
            p.CurrentAssignee = await buyer;
            let submittedProcess = await processesApi.submitProcess(p);
            if (p.Buyer.Id !== (await userApi.getCurrentUser()).Id) {
                email.sendSubmitEmail(p);
            }
            let pages = [...processes];
            pages[0].results.unshift(submittedProcess);
            setProcesses(pages);
            return submittedProcess;
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
            throw e;
        }
    }

    const deleteProcess = async (processId: number) => {
        try {
            await processesApi.deleteProcess(processId);
            let pages = processes;
            for (let page of pages) {
                page.results.filter(process => process.Id !== processId);
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
            throw e;
        }
    }

    useEffect(() => {
        fetchProcessesPage(refresh);
        setRefresh(false); // eslint-disable-next-line
    }, [filters.page, filters.fieldFilters, filters.sortBy, filters.ascending]);

    return {
        processes: processes.length >= filters.page ? processes[filters.page - 1].results : [],
        activeFilters: filters.fieldFilters.map(filter => filter.fieldName),
        page: filters.page,
        hasNext: processes.length >= filters.page ? processes[filters.page - 1].hasNext : false,
        loading,
        fetchCachedProcess,
        refreshPage,
        sortBy: (field, ascending) => {
            setFilters({ ...filters, sortBy: field, ascending });
            setRefresh(true);
        },
        addFilter,
        clearFilter,
        clearAllFilters,
        incrementPage: () => setFilters({ ...filters, page: filters.page + 1 }),
        decrementPage: () => setFilters({ ...filters, page: filters.page - 1 }),
        submitProcess,
        deleteProcess
    }
}