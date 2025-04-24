import { sp } from "@pnp/sp";
import "@pnp/sp/sputilities";
import { spWebContext } from "../providers/SPWebContext";
import { IPerson } from "./DomainObjects";
import { getAPIError } from "./InternalErrors";

declare var _spPageContextInfo: any;

export interface IEmailApi {
  readonly siteUrl: string;
  sendEmail: (
    to: IPerson[],
    subject: string,
    body: string,
    cc?: IPerson[]
  ) => Promise<void>;
}

export class EmailApi implements IEmailApi {
  siteUrl: string = _spPageContextInfo.webAbsoluteUrl;
  private sendEmailList = spWebContext.lists.getByTitle("Emails");

  constructor() {
    sp.setup({
      sp: {
        baseUrl: _spPageContextInfo.webAbsoluteUrl,
      },
    });
  }

  getEmails(people: IPerson[]) {
    return people.map((p) => p.EMail);
  }

  async sendEmail(
    to: IPerson[],
    subject: string,
    body: string,
    cc?: IPerson[]
  ): Promise<void> {
    const email = {
      To: this.getEmails(to).join(";"),
      CC: cc ? this.getEmails(cc).join(";") : undefined,
      Title: "SBAT-Workflow " + subject,
      Body: body.replace(/\n/g, "<BR>"),
    };
    console.log(email);
    try {
      await this.sendEmailList.items.add(email);
    } catch (e) {
      throw getAPIError(
        e,
        `Error trying to send Email with subject ${subject}`
      );
    }
  }
}

export class EmailApiDev implements IEmailApi {
  siteUrl: string = "localhost";

  sleep() {
    return new Promise((r) => setTimeout(r, 500));
  }

  async sendEmail(): Promise<void> {
    await this.sleep();
    //Empty as there isn't really anything to do for it in dev.
  }
}

export class EmailApiConfig {
  private static emailApi: IEmailApi;

  static getApi(): IEmailApi {
    if (!this.emailApi) {
      this.emailApi =
        process.env.NODE_ENV === "development"
          ? new EmailApiDev()
          : new EmailApi();
    }
    return this.emailApi;
  }
}
