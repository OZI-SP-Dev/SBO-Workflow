import { sp } from "@pnp/sp";
import { IFile, IFileAddResult, IFiles } from "@pnp/sp/files";
import { IProcess } from "./DomainObjects";

export interface IDocumentsApi {
    fetchDocumentsForProcess(process: IProcess): Promise<IFiles>,
    uploadDocument(process: IProcess, file: File): Promise<IFile>,
    deleteDocument(process: IProcess, file: IFile): Promise<void>
}

export default class DocumentsApi implements IDocumentsApi {
    
    async fetchDocumentsForProcess(process: IProcess): Promise<IFiles> {
        return await sp.web.getFolderByServerRelativePath(`Processes/${process.SolicitationNumber}`).files();
    }

    async uploadDocument(process: IProcess, file: File): Promise<IFile> {
        return (await sp.web.getFolderByServerRelativePath(`Processes/${process.SolicitationNumber}`).files.add(file.name, file, true)).file;
    }

    async deleteDocument(process: IProcess, file: IFile): Promise<void> {
        await sp.web.getFolderByServerRelativePath(`Processes/${process.SolicitationNumber}`).files.getByName(file.name).delete();
    }
}