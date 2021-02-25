import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { DocumentsApiConfig, IDocument } from "../api/DocumentsApi";
import { INote, IPerson, IProcess, Stages } from "../api/DomainObjects";
import { PrematureActionError } from "../api/InternalErrors";
import { NotesApiConfig } from "../api/NotesApi";
import { ProcessesApiConfig } from "../api/ProcessesApi";
import { UserApiConfig } from "../api/UserApi";
import { ErrorsContext } from "../providers/ErrorsContext";
import { useEmail } from "./useEmail";


export interface IProcessDetails {
    process?: IProcess,
    documents: IDocument[],
    notes: INote[],
    loading: boolean,
    sendProcess: (newStage: Stages, assignee: IPerson, noteText: string) => Promise<void>,
    submitDocument: (file: File) => Promise<IDocument | undefined>,
    deleteDocument: (fileName: string) => Promise<void>,
    submitNote: (text: string) => Promise<INote | undefined>
}

export function useProcessDetails(processId: number): IProcessDetails {

    const errorsContext = useContext(ErrorsContext);

    const processApi = ProcessesApiConfig.getApi();
    const documentsApi = DocumentsApiConfig.getApi();
    const notesApi = NotesApiConfig.getApi();
    const userApi = UserApiConfig.getApi();
    const email = useEmail();
    const [process, setProcess] = useState<IProcess>();
    const [documents, setDocuments] = useState<IDocument[]>([]);
    const [notes, setNotes] = useState<INote[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const fetchProcessDetails = async () => {
        try {
            setLoading(true);
            let updatedProcess = await processApi.fetchProcessById(processId);
            if (updatedProcess) {
                let documents = documentsApi.fetchDocumentsForProcess(updatedProcess);
                let notes = notesApi.fetchNotesForProcess(updatedProcess);
                setProcess(updatedProcess);
                setDocuments(await documents);
                setNotes(await notes);
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        } finally {
            setLoading(false);
        }
    }

    const sendProcess = async (newStage: Stages, assignee: IPerson, noteText: string): Promise<void> => {
        try {
            if (process) {
                let submitProcess: IProcess = {
                    ...process,
                    CurrentStage: newStage, CurrentAssignee: await userApi.getPersonDetails(assignee.EMail),
                    CurrentStageStartDate: DateTime.local()
                };
                if (newStage === Stages.CO_INITIAL_REVIEW || newStage === Stages.CO_FINAL_REVIEW) {
                    submitProcess.ContractingOfficer = submitProcess.CurrentAssignee;
                } else if (newStage === Stages.SBP_REVIEW) {
                    submitProcess.SmallBusinessProfessional = submitProcess.CurrentAssignee;
                } else if (newStage === Stages.SBA_PCR_REVIEW) {
                    submitProcess.SBAPCR = submitProcess.CurrentAssignee;
                }
                let newProcess = await processApi.submitProcess(submitProcess);
                if (noteText) {
                    let newNotes = [...notes];
                    newNotes.unshift(await notesApi.submitNote(noteText, newProcess));
                    setNotes(newNotes);
                }
                await email.sendAdvanceStageEmail(newProcess, assignee, noteText, await userApi.getCurrentUser());
                setProcess(newProcess);
            } else {
                throw new PrematureActionError("You cannot send a Process before we're done loading it!");
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        } finally {
            setLoading(false);
        }
    }

    const submitDocument = async (file: File) => {
        try {
            if (process) {
                let newDoc = await documentsApi.uploadDocument(process, file);
                let docs = documents;
                docs = docs.filter(doc => doc.LinkUrl !== newDoc.LinkUrl);
                docs.unshift(newDoc);
                setDocuments(docs);
                return newDoc;
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
            throw e;
        }
    }

    const deleteDocument = async (fileName: string): Promise<void> => {
        try {
            if (process) {
                await documentsApi.deleteDocument(process, fileName);
                setDocuments(documents.filter(doc => doc.Name !== fileName));
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
            throw e;
        }
    }

    const submitNote = async (text: string) => {
        try {
            if (process) {
                let newNote = await notesApi.submitNote(text, process);
                let newNotes = notes;
                newNotes = newNotes.filter(n => n.Id !== newNote.Id);
                newNotes.unshift(newNote);
                setNotes(newNotes);
                return newNote;
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
            throw e;
        }
    }

    useEffect(() => {
        fetchProcessDetails(); // eslint-disable-next-line
    }, [processId]);

    return { process, documents, notes, loading, sendProcess, submitDocument, deleteDocument, submitNote }
}