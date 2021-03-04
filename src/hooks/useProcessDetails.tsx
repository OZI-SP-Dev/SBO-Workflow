import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { DocumentsApiConfig, IDocument } from "../api/DocumentsApi";
import { INote, IPerson, IProcess, Stages } from "../api/DomainObjects";
import { InputError, PrematureActionError } from "../api/InternalErrors";
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
    updateProcess: (process: IProcess) => Promise<void>,
    deleteProcess: () => Promise<void>,
    sendProcess: (newStage: Stages, assignee: IPerson, noteText: string) => Promise<void>,
    reworkProcess: (newStage: Stages, assignee: IPerson, noteText: string) => Promise<void>,
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

    const updateProcessStage = async (newStage: Stages, assignee: IPerson): Promise<IProcess> => {
        if (process) {
            let submitProcess: IProcess = {
                ...process,
                CurrentStage: newStage,
                CurrentAssignee: await userApi.getPersonDetails(assignee.EMail),
                CurrentStageStartDate: DateTime.local()
            };
            if (newStage === Stages.BUYER_REVIEW) {
                submitProcess.Buyer = submitProcess.CurrentAssignee;
            } else if (newStage === Stages.CO_INITIAL_REVIEW || newStage === Stages.CO_FINAL_REVIEW) {
                submitProcess.ContractingOfficer = submitProcess.CurrentAssignee;
            } else if (newStage === Stages.SBP_REVIEW) {
                submitProcess.SmallBusinessProfessional = submitProcess.CurrentAssignee;
            } else if (newStage === Stages.SBA_PCR_REVIEW) {
                submitProcess.SBAPCR = submitProcess.CurrentAssignee;
            } else if (newStage === Stages.COMPLETED) {
                submitProcess.Buyer = submitProcess.CurrentAssignee;
            }
            return await processApi.submitProcess(submitProcess);
        } else {
            throw new PrematureActionError("You cannot update a Process before we're done loading it!");
        }
    }

    const updateProcess = async (newProcess: IProcess) => {
        try {
            if (process) {
                if (newProcess.Id === process.Id) {
                    setProcess(await processApi.submitProcess({
                        ...newProcess,
                        Buyer: newProcess.Buyer.Id < 0 ? await userApi.getPersonDetails(newProcess.Buyer.EMail) : newProcess.Buyer,
                        ContractingOfficer: newProcess.ContractingOfficer.Id < 0 ? await userApi.getPersonDetails(newProcess.ContractingOfficer.EMail) : newProcess.ContractingOfficer,
                        SmallBusinessProfessional: newProcess.SmallBusinessProfessional.Id < 0 ? await userApi.getPersonDetails(newProcess.SmallBusinessProfessional.EMail) : newProcess.SmallBusinessProfessional,
                        CurrentAssignee: newProcess.CurrentAssignee.Id < 0 ? await userApi.getPersonDetails(newProcess.CurrentAssignee.EMail) : newProcess.CurrentAssignee,
                        SBAPCR: newProcess.SBAPCR && newProcess.SBAPCR.Id < 0 ? await userApi.getPersonDetails(newProcess.SBAPCR.EMail) : newProcess.SBAPCR
                    }));
                } else { // should never happen, but I didn't want to leave the possibility open
                    throw new InputError("You cannot update a different Process from this Process's page!")
                }
            } else {
                throw new PrematureActionError("You cannot update a Process before we're done loading it!");
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        }
    }

    const deleteProcess = async () => {
        try {
            if (process) {
                await processApi.deleteProcess(process.Id);
                setProcess(undefined);
            } else {
                throw new PrematureActionError("You cannot update a Process before we're done loading it!");
            }
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        }
    }

    const sendProcess = async (newStage: Stages, assignee: IPerson, noteText: string): Promise<void> => {
        try {
            let newProcess = await updateProcessStage(newStage, assignee);
            if (noteText) {
                let newNotes = [...notes];
                newNotes.unshift(await notesApi.submitNote(noteText, newProcess));
                setNotes(newNotes);
            }
            await email.sendAdvanceStageEmail(newProcess, newProcess.CurrentAssignee, noteText, await userApi.getCurrentUser());
            setProcess(newProcess);
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        }
    }

    const reworkProcess = async (newStage: Stages, assignee: IPerson, noteText: string): Promise<void> => {
        try {
            let newProcess = await updateProcessStage(newStage, assignee);
            if (noteText) {
                let newNotes = [...notes];
                newNotes.unshift(await notesApi.submitNote(noteText, newProcess));
                setNotes(newNotes);
            } else {
                throw new InputError("You must provide notes to Rework this Process!")
            }
            await email.sendRejectStageEmail(newProcess, newProcess.CurrentAssignee, noteText, await userApi.getCurrentUser());
            setProcess(newProcess);
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
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

    return { process, documents, notes, loading, updateProcess, deleteProcess, sendProcess, reworkProcess, submitDocument, deleteDocument, submitNote }
}