import { useEffect, useState } from "react";
import { DocumentsApiConfig, IDocument } from "../api/DocumentsApi";
import { IProcess } from "../api/DomainObjects";
import { ProcessesApiConfig } from "../api/ProcessesApi";


export interface IProcessDetails {
    process?: IProcess,
    documents: IDocument[],
    loading: boolean,
    submitDocument: (file: File) => Promise<IDocument | undefined>,
    deleteDocument: (fileName: string) => Promise<void>
}

export function useProcessDetails(processId: number): IProcessDetails {

    const processApi = ProcessesApiConfig.getApi();
    const documentsApi = DocumentsApiConfig.getApi();
    const [process, setProcess] = useState<IProcess>();
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProcessDetails = async () => {
        setLoading(true);
        let process = await processApi.fetchProcessById(processId);
        if (process) {
            let documents = await documentsApi.fetchDocumentsForProcess(process);
            setProcess(process);
            setDocuments(documents);
        }
        setLoading(false);
    }

    const submitDocument = async (file: File) => {
        if (process) {
            let newDoc = await documentsApi.uploadDocument(process, file);
            let docs = documents;
            docs = docs.filter(doc => doc.LinkUrl !== newDoc.LinkUrl);
            docs.unshift(newDoc);
            setDocuments(docs);
            return newDoc;
        }
    }

    const deleteDocument = async (fileName: string): Promise<void> => {
        if (process) {
            await documentsApi.deleteDocument(process, fileName);
            setDocuments(documents.filter(doc => doc.Name !== fileName));
        }
    }

    useEffect(() => {
        fetchProcessDetails(); // eslint-disable-next-line
    }, [processId]);

    return { process, documents, loading, submitDocument, deleteDocument }
}