import { useEffect, useState } from "react";
import { IProcess } from "../api/DomainObjects";
import { IProcessesPage, ProcessesApiConfig } from "../api/ProcessesApi";

interface IProcessesFilters {
    page: number,
    fieldFilters: {
        // Name of the field that the filter is being applied for
        fieldName: string,
        // The value of the search for filtering
        filterValue: string
    }[],
    // Name of the field that the results should be sorted by
    sortBy: string,
    // Whether the sortBy field is applied in ascending order or not
    ascending: boolean
}

export interface IPagedProcesses {
    processes: IProcess[],
    page: number,
    hasNext: boolean,
    loading: boolean,
    fetchCachedProcess(processId: number): IProcess | undefined,
    refreshPage(): void,
    incrementPage(): void,
    decrementPage(): void,
    submitProcess(process: IProcess): Promise<IProcess>,
    deleteProcess(processId: number): Promise<void>
}

export function usePagedProcesses(): IPagedProcesses {

    const processesApi = ProcessesApiConfig.getApi();

    const [processes, setProcesses] = useState<IProcessesPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<IProcessesFilters>({
        page: 1,
        fieldFilters: [],
        sortBy: "Created",
        ascending: false
    });

    const fetchProcessesPage = async (refreshCache?: boolean) => {
        setLoading(true);
        let processesCopy = refreshCache ? [] : processes;
        if (processesCopy.length === 0) {
            processesCopy.push(await processesApi.fetchFirstPageOfProcesses());
        }
        while (processesCopy.length < filters.page && processesCopy[processesCopy.length - 1].hasNext) {
            processesCopy.push(await processesCopy[processesCopy.length - 1].getNext());
        }
        setProcesses(processesCopy);
        setLoading(false);
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

    const submitProcess = async (process: IProcess) => {
        let submittedProcess = await processesApi.submitProcess(process);
        let pages = processes;
        pages[0].results.unshift(submittedProcess);
        setProcesses(pages);
        return submittedProcess;
    }

    const deleteProcess = async (processId: number) => {
        await processesApi.deleteProcess(processId);
        let pages = processes;
        for (let page of pages) {
            page.results.filter(process => process.Id !== processId);
        }
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
        refreshPage : () => fetchProcessesPage(true),
        incrementPage: () => setFilters({ ...filters, page: filters.page + 1 }),
        decrementPage: () => setFilters({ ...filters, page: filters.page - 1 }),
        submitProcess,
        deleteProcess
    }
}