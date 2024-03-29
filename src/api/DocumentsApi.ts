import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/files/folder";
import { DateTime } from "luxon";
import { IPerson, IProcess, Person } from "./DomainObjects";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";
import { UserApiConfig } from "./UserApi";

export interface IDocument {
  Name: string;
  ModifiedBy: IPerson;
  Modified: DateTime;
  LinkUrl: string;
  UniqueId: string;
  Length: string;
}

export interface IDocumentsApi {
  /**
   * Fetch all of the Documents associated with the given IProcess as IFiles.
   *
   * @param process The IProcess that the Documents are being fetched for.
   */
  fetchDocumentsForProcess(process: IProcess): Promise<IDocument[]>;

  /**
   * Upload the given file for the given IProcess, if a file with the same name already exists then it will be overwritten
   *
   * @param process The IProcess that the file is associated with
   * @param file The file being uploaded
   */
  uploadDocument(process: IProcess, file: File): Promise<IDocument>;

  /**
   * Delete the given file for the given IProcess, this will remove the file from the application's persistence
   *
   * @param process The IProcess that the file is associated with
   * @param file The IFile to be deleted
   */
  deleteDocument(process: IProcess, fileName: string): Promise<void>;
}

export default class DocumentsApi implements IDocumentsApi {
  fetchDocumentsForProcess = async (
    process: IProcess
  ): Promise<IDocument[]> => {
    try {
      const path = "Processes/" + process.SolicitationNumber;
      const files = await sp.web
        .getFolderByServerRelativePath(path)
        .files.select(
          "Name",
          "TimeLastModified",
          "ServerRelativeUrl",
          "ModifiedBy",
          "UniqueId",
          "Length"
        )
        .expand("ModifiedBy")
        .get();

      return files.map((file: any) => {
        return {
          Name: file.Name,
          ModifiedBy: new Person(file.ModifiedBy),
          Modified: DateTime.fromISO(file.TimeLastModified),
          LinkUrl: file.ServerRelativeUrl,
          UniqueId: file.UniqueId,
          Length: file.Length,
        };
      });
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to fetch the Files for the Process ${process.SolicitationNumber}`
      );
    }
  };

  uploadDocument = async (
    process: IProcess,
    file: File
  ): Promise<IDocument> => {
    try {
      let spFile: any = await (
        await sp.web
          .getFolderByServerRelativePath(
            `Processes/${process.SolicitationNumber}`
          )
          .files.add(file.name, file, true)
      ).file
        .select(
          "Name",
          "TimeLastModified",
          "ServerRelativeUrl",
          "ModifiedBy",
          "UniqueId",
          "Length"
        )
        .expand("ModifiedBy")
        .get();
      return {
        Name: spFile.Name,
        ModifiedBy: new Person(spFile.ModifiedBy),
        Modified: DateTime.fromISO(spFile.TimeLastModified),
        LinkUrl: spFile.ServerRelativeUrl,
        UniqueId: spFile.UniqueId,
        Length: spFile.Length,
      };
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to upload the File ${file.name} for the Process ${process.SolicitationNumber}`
      );
    }
  };

  deleteDocument = async (
    process: IProcess,
    fileName: string
  ): Promise<void> => {
    try {
      await sp.web
        .getFolderByServerRelativePath(
          `Processes/${process.SolicitationNumber}`
        )
        .files.getByName(fileName)
        .delete();
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to delete the File ${fileName} for the Process ${process.SolicitationNumber}`
      );
    }
  };
}

export class DocumentsApiDev implements IDocumentsApi {
  userApi = UserApiConfig.getApi();

  documents: IDocument[] = [
    {
      Name: "dd2579.pdf",
      ModifiedBy: new Person({
        Id: 1,
        Title: "Jeremy Clark",
        EMail: "me@yahoo.com",
      }),
      Modified: DateTime.local(),
      LinkUrl: "/dd2579.pdf",
      UniqueId: "ID",
      Length: "1000",
    },
    {
      Name: "Draft_ISP_Checklist.docx",
      ModifiedBy: new Person({
        Id: 1,
        Title: "Jeremy Clark",
        EMail: "me@yahoo.com",
      }),
      Modified: DateTime.local(),
      LinkUrl: "/Draft_ISP_Checklist.docx",
      UniqueId: "ID",
      Length: "1000",
    },
  ];

  fetchDocumentsForProcess = async (
    process: IProcess
  ): Promise<IDocument[]> => {
    await sleep();
    return [...this.documents];
  };

  uploadDocument = async (
    process: IProcess,
    file: File
  ): Promise<IDocument> => {
    await sleep();
    let newDoc = {
      Name: file.name,
      ModifiedBy: new Person(await this.userApi.getCurrentUser()),
      Modified: DateTime.local(),
      LinkUrl: "/" + file.name,
      UniqueId: "ID",
      Length: "1000",
    };
    this.documents.push(newDoc);
    return newDoc;
  };

  deleteDocument = async (
    process: IProcess,
    fileName: string
  ): Promise<void> => {
    await sleep();
    this.documents = this.documents.filter((doc) => doc.Name !== fileName);
  };
}

export class DocumentsApiConfig {
  private static documentsApi: IDocumentsApi;

  static getApi(): IDocumentsApi {
    if (!this.documentsApi) {
      this.documentsApi =
        process.env.NODE_ENV === "development"
          ? new DocumentsApiDev()
          : new DocumentsApi();
    }
    return this.documentsApi;
  }
}
