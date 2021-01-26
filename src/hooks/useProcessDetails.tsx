import { useEffect, useState } from "react";
import { IProcess } from "../api/DomainObjects";
import { ProcessesApiConfig } from "../api/ProcessesApi";


export interface IProcessDetails {
    process?: IProcess,
    loading: boolean
}

export function useProcessDetails(processId: number): IProcessDetails {

    const processApi = ProcessesApiConfig.getApi();
    const [process, setProcess] = useState<IProcess>();
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProcess = async () => {
        setLoading(true);
        setProcess(await processApi.fetchProcessById(processId));
        setLoading(false);
    }

    useEffect(() => {
        fetchProcess(); // eslint-disable-next-line
    }, [processId]);

    return { process, loading }
}