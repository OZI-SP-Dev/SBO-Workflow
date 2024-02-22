import { DateTime } from "luxon";
import { useContext, useEffect, useState } from "react";
import { DocumentsApiConfig, IDocument } from "../api/DocumentsApi";
import {
  IPCREmail,
  INote,
  IPerson,
  IProcess,
  Stages,
} from "../api/DomainObjects";
import {
  InputError,
  InternalError,
  PrematureActionError,
} from "../api/InternalErrors";
import { NotesApiConfig } from "../api/NotesApi";
import { PCREmailsApiConfig } from "../api/PCREmailsApi";
import { ProcessesApiConfig } from "../api/ProcessesApi";
import { UserApiConfig } from "../api/UserApi";
import { ErrorsContext } from "../providers/ErrorsContext";
import { useEmail } from "./useEmail";

export interface IProcessDetails {
  process?: IProcess;
  documents: IDocument[];
  notes: INote[];
  pcrEmail?: IPCREmail;
  loading: boolean;
  getUpdatedProcess: () => Promise<void>;
  updateProcess: (process: IProcess) => Promise<void>;
  deleteProcess: () => Promise<void>;
  sendProcess: (
    newStage: Stages,
    assignee: IPerson | string,
    noteText: string,
    manuallySent: boolean
  ) => Promise<void>;
  reworkProcess: (
    newStage: Stages,
    assignee: IPerson,
    noteText: string
  ) => Promise<void>;
  submitDocument: (file: File) => Promise<IDocument | undefined>;
  getUpdatedDocuments: () => Promise<IDocument[] | undefined>;
  deleteDocument: (fileName: string) => Promise<void>;
  submitNote: (text: string) => Promise<INote | undefined>;
}

export function useProcessDetails(processId: number): IProcessDetails {
  const errorsContext = useContext(ErrorsContext);

  const processApi = ProcessesApiConfig.getApi();
  const documentsApi = DocumentsApiConfig.getApi();
  const notesApi = NotesApiConfig.getApi();
  const pcrEmailsApi = PCREmailsApiConfig.getApi();
  const userApi = UserApiConfig.getApi();
  const email = useEmail();
  const [process, setProcess] = useState<IProcess>();
  const [documents, setDocuments] = useState<IDocument[]>([]);
  const [notes, setNotes] = useState<INote[]>([]);
  const [pcrEmail, setPCREmail] = useState<IPCREmail>();
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProcessDetails = async () => {
    try {
      setLoading(true);
      let updatedProcess = await processApi.fetchProcessById(processId);
      if (updatedProcess) {
        let documents = documentsApi.fetchDocumentsForProcess(updatedProcess);
        let notes = notesApi.fetchNotesForProcess(updatedProcess);
        // If we are at the PCR stage, then get most recent email record to display status, otherwise we don't need to fetch it
        if (updatedProcess.CurrentStage === Stages.SBA_PCR_REVIEW) {
          setPCREmail(
            await pcrEmailsApi.fetchPCREmailForProcess(updatedProcess)
          );
        }
        setProcess(updatedProcess);
        setDocuments(await documents);
        setNotes(await notes);
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getUpdatedProcess = async () => {
    try {
      setLoading(true);
      let updatedProcess = await processApi.fetchProcessById(processId);
      if (updatedProcess) {
        setProcess(updatedProcess);
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    } finally {
      setLoading(false);
    }
  };

  const updateProcessStage = async (
    newStage: Stages,
    /** Pass a string for PCR Email, and an IPerson for all other stages */
    assignee: IPerson | string
  ): Promise<IProcess> => {
    if (process) {
      let assigneeObj: IPerson;
      let pcrEmail: string = "";
      if (typeof assignee === "string") {
        //If it is a string, then we got a PCREmail as the value, so set assignee to current user
        assigneeObj = await userApi.getCurrentUser();
        pcrEmail = assignee;
      } else {
        //If we didn't get a string, then it is an IPerson object
        assigneeObj = { ...assignee };
      }
      let submitProcess: IProcess = {
        ...process,
        CurrentStage: newStage,
        CurrentAssignee: await userApi.getPersonDetails(assigneeObj.EMail),
        CurrentStageStartDate: DateTime.local(),
      };
      if (newStage === Stages.BUYER_REVIEW || newStage === Stages.COMPLETED) {
        submitProcess.Buyer = submitProcess.CurrentAssignee;
      } else if (
        newStage === Stages.CO_INITIAL_REVIEW ||
        newStage === Stages.CO_FINAL_REVIEW
      ) {
        submitProcess.ContractingOfficer = submitProcess.CurrentAssignee;
      } else if (newStage === Stages.SBP_REVIEW) {
        submitProcess.SmallBusinessProfessional = submitProcess.CurrentAssignee;
      } else if (newStage === Stages.SBA_PCR_REVIEW) {
        submitProcess.SBAPCREmail = pcrEmail;
      }
      return await processApi.submitProcess(submitProcess);
    } else {
      throw new PrematureActionError(
        "You cannot update a Process before we're done loading it!"
      );
    }
  };

  const updateProcess = async (newProcess: IProcess) => {
    try {
      if (process) {
        if (newProcess.Id === process.Id) {
          setProcess(
            await processApi.submitProcess({
              ...newProcess,
              Buyer:
                newProcess.Buyer.Id < 0
                  ? await userApi.getPersonDetails(newProcess.Buyer.EMail)
                  : newProcess.Buyer,
              ContractingOfficer:
                newProcess.ContractingOfficer.Id < 0
                  ? await userApi.getPersonDetails(
                      newProcess.ContractingOfficer.EMail
                    )
                  : newProcess.ContractingOfficer,
              SmallBusinessProfessional:
                newProcess.SmallBusinessProfessional.Id < 0
                  ? await userApi.getPersonDetails(
                      newProcess.SmallBusinessProfessional.EMail
                    )
                  : newProcess.SmallBusinessProfessional,
              CurrentAssignee:
                newProcess.CurrentAssignee.Id < 0
                  ? await userApi.getPersonDetails(
                      newProcess.CurrentAssignee.EMail
                    )
                  : newProcess.CurrentAssignee,
            })
          );
        } else {
          // should never happen, but I didn't want to leave the possibility open
          throw new InputError(
            "You cannot update a different Process from this Process's page!"
          );
        }
      } else {
        throw new PrematureActionError(
          "You cannot update a Process before we're done loading it!"
        );
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    }
  };

  const deleteProcess = async () => {
    try {
      if (process) {
        await processApi.deleteProcess(process.Id);
        setProcess(undefined);
      } else {
        throw new PrematureActionError(
          "You cannot update a Process before we're done loading it!"
        );
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
      throw e;
    }
  };

  const sendProcess = async (
    newStage: Stages,
    assignee: IPerson | string,
    noteText: string,
    manuallySent: boolean
  ): Promise<void> => {
    try {
      let newProcess = await updateProcessStage(newStage, assignee);
      let newNotes = [...notes];
      if (noteText) {
        newNotes.unshift(await notesApi.submitNote(noteText, newProcess));
      }

      // Document in notes that files were manually sent if they were
      if (manuallySent) {
        newNotes.unshift(
          await notesApi.submitNote(
            "Documents manually sent to " +
              newProcess.SBAPCREmail +
              " as they exceeded 35MB.",
            newProcess
          )
        );
      }

      // If we added any notes, then update state
      if (noteText || manuallySent) {
        setNotes(newNotes);
      }

      // Send an email via the tool if moving to any stage other than PCR -- or if we are moving to SBA PCR and files were manually sent
      if (newStage !== Stages.SBA_PCR_REVIEW || manuallySent === true) {
        await email.sendAdvanceStageEmail(
          newProcess,
          newProcess.CurrentAssignee,
          noteText,
          await userApi.getCurrentUser()
        );
      } else {
        // We are moving to SBA_PCR_REVIEW so send the emails via PowerAutomate by staging a record -- unless they were manually sent
        await sendPCREmail();
      }
      setProcess(newProcess);
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    }
  };

  const reworkProcess = async (
    newStage: Stages,
    assignee: IPerson,
    noteText: string
  ): Promise<void> => {
    try {
      let newProcess = await updateProcessStage(newStage, assignee);
      if (noteText) {
        let newNotes = [...notes];
        newNotes.unshift(await notesApi.submitNote(noteText, newProcess));
        setNotes(newNotes);
      } else {
        throw new InputError("You must provide notes to Rework this Process!");
      }
      await email.sendRejectStageEmail(
        newProcess,
        newProcess.CurrentAssignee,
        noteText,
        await userApi.getCurrentUser()
      );
      setProcess(newProcess);
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    }
  };

  const submitDocument = async (file: File) => {
    try {
      if (process) {
        let newDoc = await documentsApi.uploadDocument(process, file);
        let docs = documents;
        docs = docs.filter((doc) => doc.LinkUrl !== newDoc.LinkUrl);
        docs.unshift(newDoc);
        setDocuments(docs);
        return newDoc;
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
      throw e;
    }
  };

  const getUpdatedDocuments = async (): Promise<IDocument[] | undefined> => {
    try {
      let updatedDocuments: IDocument[] = [];
      if (process) {
        updatedDocuments = await documentsApi.fetchDocumentsForProcess(process);
        if (updatedDocuments) {
          setDocuments(updatedDocuments);
        }
      }
      return updatedDocuments;
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteDocument = async (fileName: string): Promise<void> => {
    try {
      if (process) {
        await documentsApi.deleteDocument(process, fileName);
        setDocuments(documents.filter((doc) => doc.Name !== fileName));
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
      throw e;
    }
  };

  const submitNote = async (text: string) => {
    try {
      if (process) {
        let newNote = await notesApi.submitNote(text, process);
        let newNotes = notes;
        newNotes = newNotes.filter((n) => n.Id !== newNote.Id);
        newNotes.unshift(newNote);
        setNotes(newNotes);
        return newNote;
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
      throw e;
    }
  };

  const sendPCREmail = async () => {
    try {
      if (process) {
        let newEmail = await pcrEmailsApi.sendPCREmail(process);
        setPCREmail(newEmail);
        return newEmail;
      }
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
      throw e;
    }
  };

  useEffect(() => {
    fetchProcessDetails(); // eslint-disable-next-line
  }, [processId]);

  return {
    process,
    documents,
    notes,
    pcrEmail,
    loading,
    getUpdatedProcess,
    updateProcess,
    deleteProcess,
    sendProcess,
    reworkProcess,
    submitDocument,
    getUpdatedDocuments,
    deleteDocument,
    submitNote,
  };
}
