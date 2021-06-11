import { DateTime } from "luxon";
import { spWebContext } from "../providers/SPWebContext";
import { INote, IPerson, IProcess, Person } from "./DomainObjects";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";
import { UserApiConfig } from "./UserApi";

export interface INotesApi {
    /**
     * Gets all of the INotes for the given IProcess.
     * 
     * @param process The IProcess that the INotes are associated with.
     */
    fetchNotesForProcess(process: IProcess): Promise<INote[]>,

    /**
     * Submits a new INote for the given IProcess.
     * 
     * @param text The text of the note.
     * @param process The IProcess that the INote is associated with.
     */
    submitNote(text: string, process: IProcess): Promise<INote>

    /**
     * Deletes all of the INotes for the given IProcess.
     * 
     * @param process The IProcess that the INotes are associated with.
     */
    deleteNotesForProcess(processId: number): Promise<void>,
}

/**
 * The interface that represents how a Note is formed when it is submitted and returned from submission.
 */
interface ISubmitNote {
    Id?: number,
    ProcessId: number,
    Text: string,
    AuthorId?: number,
    Modified?: string
}

/**
 * The interface that represents how a Note is formed when it is returned from the SP GET endpoint.
 */
interface SPNote {
    Id: number,
    Process: { Id: number },
    Text: string,
    Author: IPerson,
    Modified: string
}

export default class NotesApi implements INotesApi {

    private notesList = spWebContext.lists.getByTitle("Notes");
    private userApi = UserApiConfig.getApi();

    fetchNotesForProcess = async (process: IProcess): Promise<INote[]> => {
        try {
            return (await this.notesList.items
                .select("Id", "Process/Id", "Text", "Author/Id", "Author/Title", "Author/EMail", "Modified")
                .orderBy("Modified", false)
                .expand("Process", "Author")
                .filter(`ProcessId eq ${process.Id}`).get()).map((n: SPNote) => {
                    return {
                        Id: n.Id,
                        ProcessId: n.Process.Id,
                        Text: n.Text,
                        Author: n.Author,
                        Modified: DateTime.fromISO(n.Modified)
                    }
                });
        } catch (e) {
            throw getAPIError(e, `Error occurred while trying to fetch the Notes for the Process ${process.SolicitationNumber}`);
        }
    }

    submitNote = async (text: string, process: IProcess): Promise<INote> => {
        try {
            let submitNote: ISubmitNote = {
                ProcessId: process.Id,
                Text: text,
            }
            let returnedNote = (await this.notesList.items.add(submitNote)).data;
            return {
                Id: returnedNote.Id,
                ProcessId: process.Id,
                Text: text,
                Author: await this.userApi.getCurrentUser(),
                Modified: DateTime.fromISO(returnedNote.Modified)
            }
        } catch (e) {
            throw getAPIError(e, `Error occurred while trying to submit a Note for the Process ${process.SolicitationNumber}`);
        }
    }

    deleteNotesForProcess = async (processId: number) => {
        try {
            let deleteNotesPromises: Promise<any>[] = [];
            let notes: {Id: number}[] = await this.notesList.items.select("Id").filter(`ProcessId eq ${processId}`).get();
            for (let note of notes) {
                deleteNotesPromises.push(this.notesList.items.getById(note.Id).delete());
            }
            for (const deleteNotePromise of deleteNotesPromises) {
                await deleteNotePromise;
            }
        } catch (e) {
            throw getAPIError(e, `Error occurred while trying to delete the Notes for the Process with ID ${processId}`);
        }
    }
}

export class NotesApiDev implements INotesApi {

    userApi = UserApiConfig.getApi();

    maxId = 4;

    notes: INote[] = [{
        Id: 1,
        ProcessId: 1,
        Text: "This is a note!",
        Author: new Person({
            Id: 1,
            Title: "Default User",
            EMail: "me@example.com"
        }),
        Modified: DateTime.local()
    }, {
        Id: 2,
        ProcessId: 2,
        Text: "This is a note!",
        Author: new Person({
            Id: 1,
            Title: "Default User",
            EMail: "me@example.com"
        }),
        Modified: DateTime.local()
    }, {
        Id: 3,
        ProcessId: 3,
        Text: "This is a note!",
        Author: new Person({
            Id: 1,
            Title: "Default User",
            EMail: "me@example.com"
        }),
        Modified: DateTime.local()
    }, {
        Id: 4,
        ProcessId: 4,
        Text: "This is a note!",
        Author: new Person({
            Id: 1,
            Title: "Default User",
            EMail: "me@example.com"
        }),
        Modified: DateTime.local()
    }];

    fetchNotesForProcess = async (process: IProcess): Promise<INote[]> => {
        await sleep();
        return this.notes.filter(note => note.ProcessId === process.Id);
    }

    submitNote = async (text: string, process: IProcess): Promise<INote> => {
        await sleep();
        let note = {
            Id: ++this.maxId,
            ProcessId: process.Id,
            Text: text,
            Author: await this.userApi.getCurrentUser(),
            Modified: DateTime.local()
        };
        this.notes.push(note);
        return note;
    }

    deleteNotesForProcess = async (processId: number): Promise<void> => {
        await sleep();
        this.notes = this.notes.filter(note => note.ProcessId !== processId);
    }
}

export class NotesApiConfig {
    private static notesApi: INotesApi

    static getApi(): INotesApi {
        if (!this.notesApi) {
            this.notesApi = process.env.NODE_ENV === 'development' ? new NotesApiDev() : new NotesApi();
        }
        return this.notesApi;
    }
}