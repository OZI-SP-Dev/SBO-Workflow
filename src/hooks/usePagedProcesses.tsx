import { useContext, useEffect, useState } from "react";
import { IPerson, IProcess, Person, ProcessTypes, Stages } from "../api/DomainObjects";
import { DateRange, IProcessesPage, ProcessesApiConfig, ProcessFilter } from "../api/ProcessesApi";
import { UserApiConfig } from "../api/UserApi";
import { ErrorsContext } from "../providers/ErrorsContext";
import { useEmail } from "./useEmail";

interface IProcessesFilters {
    page: number,
    fieldFilters: ProcessFilter[],
    // Name of the field that the results should be sorted by
    sortBy?: "SolicitationNumber" | "ProcessType" | "Buyer" | "Org" | "CurrentStage" | "CurrentAssignee" | "CurrentStageStartDate" | "Created" | "Modified",
    // Whether the sortBy field is applied in ascending order or not
    ascending?: boolean
}

export interface IPagedProcesses {
    processes: IProcess[],
    page: number,
    hasNext: boolean,
    loading: boolean,
    fetchCachedProcess(processId: number): IProcess | undefined,
    refreshPage(): void,
    addFilter(fieldName: "SolicitationNumber" | "ProcessType" | "Buyer" | "Org" | "CurrentStage" | "CurrentAssignee" | "CurrentStageStartDate" | "Created", filterValue: string | IPerson | DateRange | ProcessTypes | Stages, isStartsWith?: boolean): void,
    clearFilter(fieldName: "SolicitationNumber" | "ProcessType" | "Buyer" | "Org" | "CurrentStage" | "CurrentAssignee" | "CurrentStageStartDate" | "Created"): void,
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
        fieldFilters: [],
        sortBy: "Created",
        ascending: false
    });

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

    const addFilter = (fieldName: "SolicitationNumber" | "ProcessType" | "Buyer" | "Org" | "CurrentStage" | "CurrentAssignee" | "CurrentStageStartDate" | "Created", filterValue: string | IPerson | DateRange | ProcessTypes | Stages, isStartsWith?: boolean): void => {
        let newFilters = [...filters.fieldFilters];
        let oldFilterIndex = newFilters.findIndex(filter => filter.fieldName === fieldName);
        if (oldFilterIndex >= 0) {
            newFilters[oldFilterIndex].filterValue = filterValue;
            newFilters[oldFilterIndex].isStartsWith = isStartsWith;
        } else {
            newFilters.push({ fieldName: fieldName, filterValue: filterValue, isStartsWith: isStartsWith });
        }
        setFilters({ ...filters, fieldFilters: newFilters });
    }

    const clearFilter = (fieldName: "SolicitationNumber" | "ProcessType" | "Buyer" | "Org" | "CurrentStage" | "CurrentAssignee" | "CurrentStageStartDate" | "Created"): void => {
        setFilters({ ...filters, fieldFilters: filters.fieldFilters.filter(filter => filter.fieldName !== fieldName) });
    }

    const clearAllFilters = (): void => {
        setFilters({ ...filters, fieldFilters: [] });
    }

    const submitProcess = async (process: IProcess) => {
        try {
            let p = { ...process };
            // fetch the person details async to speed up the submit a little
            let co = getPersonDetails(p.ContractingOfficer);
            let sbp = getPersonDetails(p.SmallBusinessProfessional);
            let buyer = getPersonDetails(p.Buyer);
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

    const getPersonDetails = async (person: IPerson): Promise<IPerson> => {
        return new Person({ Id: await userApi.getUserId(person.EMail), Title: person.Title, EMail: person.EMail });
    }

    // TODO: Implement logic to handle other filter changes
    useEffect(() => {
        fetchProcessesPage(); // eslint-disable-next-line
    }, [filters.page]);

    return {
        processes: processes.length >= filters.page ? processes[filters.page - 1].results : [],
        page: filters.page,
        hasNext: processes.length >= filters.page ? processes[filters.page - 1].hasNext : false,
        loading,
        fetchCachedProcess,
        refreshPage: () => fetchProcessesPage(true),
        addFilter,
        clearFilter,
        clearAllFilters,
        incrementPage: () => setFilters({ ...filters, page: filters.page + 1 }),
        decrementPage: () => setFilters({ ...filters, page: filters.page - 1 }),
        submitProcess,
        deleteProcess
    }
}