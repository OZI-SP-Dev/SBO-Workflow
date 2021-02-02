import { useEffect, useState } from "react";
import { DocumentsApiConfig, IDocument } from "../api/DocumentsApi";
import { INote, IProcess } from "../api/DomainObjects";
import { NotesApiConfig } from "../api/NotesApi";
import { ProcessesApiConfig } from "../api/ProcessesApi";


export interface IProcessDetails {
    process?: IProcess,
    documents: IDocument[],
    notes: INote[],
    loading: boolean,
    submitDocument: (file: File) => Promise<IDocument | undefined>,
    deleteDocument: (fileName: string) => Promise<void>,
    submitNote: (text: string) => Promise<INote | undefined>
}

export function useProcessDetails(processId: number): IProcessDetails {

    const processApi = ProcessesApiConfig.getApi();
    const documentsApi = DocumentsApiConfig.getApi();
    const notesApi = NotesApiConfig.getApi();
    const [process, setProcess] = useState<IProcess>();
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [notes, setNotes] = useState<INote[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProcessDetails = async () => {
        setLoading(true);
        let process = await processApi.fetchProcessById(processId);
        if (process) {
            let documents = documentsApi.fetchDocumentsForProcess(process);
            let notes = notesApi.fetchNotesForProcess(process);
            setProcess(process);
            setDocuments(await documents);
            setNotes(await notes);
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

    const submitNote = async (text: string) => {
        if (process) {
            let newNote = await notesApi.submitNote(text, process);
            let newNotes = notes;
            newNotes = newNotes.filter(n => n.Id !== newNote.Id);
            newNotes.unshift(newNote);
            setNotes(newNotes);
            return newNote;
        }
    }

    useEffect(() => {
        fetchProcessDetails(); // eslint-disable-next-line
    }, [processId]);

    return { process, documents, notes, loading, submitDocument, deleteDocument, submitNote }
}