import { sp } from "@pnp/sp";
import { IFile, IFiles } from "@pnp/sp/files";
import { IProcess } from "./DomainObjects";
import { ApiError } from "./InternalErrors";

export interface IDocumentsApi {
    /**
     * Fetch all of the Documents associated with the given IProcess as IFiles.
     * 
     * @param process The IProcess that the Documents are being fetched for.
     */
    fetchDocumentsForProcess(process: IProcess): Promise<IFiles>,

    /**
     * Upload the given file for the given IProcess, if a file with the same name already exists then it will be overwritten
     * 
     * @param process The IProcess that the file is associated with
     * @param file The file being uploaded
     */
    uploadDocument(process: IProcess, file: File): Promise<IFile>,

    /**
     * Delete the given file for the given IProcess, this will remove the file from the application's persistence
     * 
     * @param process The IProcess that the file is associated with
     * @param file The IFile to be deleted
     */
    deleteDocument(process: IProcess, file: IFile): Promise<void>
}

export default class DocumentsApi implements IDocumentsApi {

    async fetchDocumentsForProcess(process: IProcess): Promise<IFiles> {
        try {
            return await sp.web.getFolderByServerRelativePath(`Processes/${process.SolicitationNumber}`).files();
        } catch (e) {
            console.error(`Error occurred while trying to fetch the Files for the Process ${process.SolicitationNumber}`);
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to fetch the Files for the Process ${process.SolicitationNumber}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to fetch the Files for the Process ${process.SolicitationNumber}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to fetch the Files for the Process ${process.SolicitationNumber}`);
            }
        }
    }

    async uploadDocument(process: IProcess, file: File): Promise<IFile> {
        try {
            return (await sp.web.getFolderByServerRelativePath(`Processes/${process.SolicitationNumber}`).files.add(file.name, file, true)).file;
        } catch (e) {
            console.error(`Error occurred while trying to upload the File ${file.name} for the Process ${process.SolicitationNumber}`);
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to upload the File ${file.name} for the Process ${process.SolicitationNumber}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to upload the File ${file.name} for the Process ${process.SolicitationNumber}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to upload the File ${file.name} for the Process ${process.SolicitationNumber}`);
            }
        }
    }

    async deleteDocument(process: IProcess, file: IFile): Promise<void> {
        try {
            await sp.web.getFolderByServerRelativePath(`Processes/${process.SolicitationNumber}`).files.getByName(file.name).delete();
        } catch (e) {
            console.error(`Error occurred while trying to delete the File ${file.name} for the Process ${process.SolicitationNumber}`);
            console.error(e);
            if (e instanceof Error) {
                throw new ApiError(e, `Error occurred while trying to delete the File ${file.name} for the Process ${process.SolicitationNumber}: ${e.message}`);
            } else if (typeof (e) === "string") {
                throw new ApiError(`Error occurred while trying to delete the File ${file.name} for the Process ${process.SolicitationNumber}: ${e}`);
            } else {
                throw new ApiError(`Unknown error occurred while trying to delete the File ${file.name} for the Process ${process.SolicitationNumber}`);
            }
        }
    }
}