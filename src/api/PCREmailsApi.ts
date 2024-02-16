import { DateTime } from "luxon";
import { spWebContext } from "../providers/SPWebContext";
import { IPCREmail, IProcess } from "./DomainObjects";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";
import { UserApiConfig } from "./UserApi";

export const checkSBAPCRValid = (pcrEmail: string | undefined) => {
  if (pcrEmail === undefined || pcrEmail === "") {
    return "You must provide an Email for SBA PCR if sending to that stage";
  } else if (
    // Check that the value matches email address format, and ends in .gov or .mil
    // Based on https://www.oreilly.com/library/view/regular-expressions-cookbook/9781449327453/ch04s01.html
    !/^[\w!#$%&'*+/=?`{|}~^-]+(?:\.[\w!#$%&'*+/=?`{|}~^-]+)*@(?:[A-Z0-9-]+\.)+(gov|mil)$/i.test(
      pcrEmail
    )
  ) {
    return "SBA PCR Email address is not a valid .gov or .mil address";
  } else {
    return undefined;
  }
};

export interface IPCREmailsApi {
  /**
   * Gets the latest IPCREmail for the given IProcess.
   *
   * @param process The IProcess that the IPCREmail is associated with.
   */
  fetchPCREmailForProcess(process: IProcess): Promise<IPCREmail | undefined>;

  /**
   * Submits a new IPCREmail for the given IProcess.
   *
   * @param process The IProcess that the IPCREmail is associated with.
   */
  sendPCREmail(process: IProcess): Promise<IPCREmail>;

  /**
   * Deletes all of the IPCREmails for the given IProcess.
   *
   * @param process The IProcess that the IPCREmails are associated with.
   */
  deletePCREmailsForProcess(processId: number): Promise<void>;
}

/**
 * The interface that represents how an Email is formed when it is submitted and returned from submission.
 */
interface ISubmitEmail {
  Title: string;
  Status: string;
}

/**
 * The interface that represents how an Email is formed when it is returned from the SP GET endpoint or after POST new one.
 */
interface SPEmail {
  Id: number;
  Title: string;
  Status: string;
  Modified: string;
}

export default class PCREmailsApi implements IPCREmailsApi {
  private pcrEmailsList = spWebContext.lists.getByTitle("PCREmails");

  fetchPCREmailForProcess = async (process: IProcess) => {
    try {
      const emails = (
        await this.pcrEmailsList.items
          .select("Id", "Title", "Status", "Modified")
          .orderBy("Modified", false)
          .filter(`Title eq ${process.Id}`)
          .top(1)
          .get()
      ).map((n: SPEmail) => {
        return {
          Id: n.Id,
          Title: n.Title,
          Status: n.Status,
          Modified: DateTime.fromISO(n.Modified),
        };
      });

      // Return either the top most record if there is one, otherwise return undefined
      return emails.length === 1 ? emails[0] : undefined;
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to fetch the generated Emails for SBA PCR for the Process ${process.SolicitationNumber}`
      );
    }
  };

  sendPCREmail = async (process: IProcess): Promise<IPCREmail> => {
    try {
      let submitEmail: ISubmitEmail = {
        Title: process.Id.toString(),
        Status: "In Queue",
      };
      let returnedEmail: SPEmail = (
        await this.pcrEmailsList.items.add(submitEmail)
      ).data;
      return {
        Id: returnedEmail.Id,
        Title: returnedEmail.Title,
        Status: returnedEmail.Status,
        Modified: DateTime.fromISO(returnedEmail.Modified),
      };
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying generate Email to SBA PCR for the Process ${process.SolicitationNumber}`
      );
    }
  };

  deletePCREmailsForProcess = async (processId: number) => {
    try {
      let deletePCREmailsPromises: Promise<any>[] = [];
      let emails: { Id: number }[] = await this.pcrEmailsList.items
        .select("Id")
        .filter(`Title eq ${processId}`)
        .get();
      for (let email of emails) {
        deletePCREmailsPromises.push(
          this.pcrEmailsList.items.getById(email.Id).recycle()
        );
      }
      for (const deleteEmailPromise of deletePCREmailsPromises) {
        await deleteEmailPromise;
      }
    } catch (e) {
      throw getAPIError(
        e,
        `Error occurred while trying to delete the Emails for SBA PCR for the Process with ID ${processId}`
      );
    }
  };
}

export class PCREmailsApiDev implements IPCREmailsApi {
  userApi = UserApiConfig.getApi();
  emails: IPCREmail[] = [
    {
      Id: 1,
      Title: "4",
      Status: "Errored",
      Modified: DateTime.local().plus({ days: -1 }),
    },
  ];
  maxId = 1;

  fetchPCREmailForProcess = async (process: IProcess) => {
    await sleep();
    return this.emails
      .filter((email) => email.Title === process.Id.toString())
      .sort((a, b) => b.Modified.valueOf() - a.Modified.valueOf())[0];
  };

  sendPCREmail = async (process: IProcess): Promise<IPCREmail> => {
    await sleep();
    let email = {
      Id: ++this.maxId,
      Title: process.Id.toString(),
      Status: "In Queue",
      Modified: DateTime.local(),
    };
    this.emails.push(email);

    // Wait 10s then update the "In Queue" to "Complete", simulating the PowerAutomate completing
    setTimeout(() => (email.Status = "Complete"), 10000);
    return email;
  };

  deletePCREmailsForProcess = async (processId: number): Promise<void> => {
    await sleep();
    this.emails = this.emails.filter(
      (email) => email.Title !== processId.toString()
    );
  };
}

export class PCREmailsApiConfig {
  private static pcrEmailsApi: IPCREmailsApi;

  static getApi(): IPCREmailsApi {
    if (!this.pcrEmailsApi) {
      this.pcrEmailsApi =
        process.env.NODE_ENV === "development"
          ? new PCREmailsApiDev()
          : new PCREmailsApi();
    }
    return this.pcrEmailsApi;
  }
}
