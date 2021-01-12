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
    loading: boolean,
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

    const fetchProcessesPage = async () => {
        setLoading(true);
        let processesCopy = processes;
        if (processesCopy.length === 0) {
            processesCopy.push(await processesApi.fetchFirstPageOfProcesses());
        }
        while (processesCopy.length < filters.page && processesCopy[processesCopy.length - 1].hasNext) {
            processesCopy.push(await processesCopy[processesCopy.length - 1].getNext());
        }
        setProcesses(processesCopy);
        setLoading(false);
    }

    // TODO: Implement logic to handle other filter changes
    useEffect(() => {
        fetchProcessesPage();
    }, [filters.page]);

    return {
        processes: processes.length >= filters.page ? processes[filters.page - 1].results : [],
        page: filters.page,
        loading,
        incrementPage: () => setFilters({ ...filters, page: filters.page + 1 }),
        decrementPage: () => setFilters({ ...filters, page: filters.page - 1 }),
        submitProcess: processesApi.submitProcess,
        deleteProcess: processesApi.deleteProcess
    }
}