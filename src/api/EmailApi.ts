import { sp } from "@pnp/sp";
import { IEmailProperties } from "@pnp/sp/sputilities";
import { ApiError, getAPIError } from "./InternalErrors";
import "@pnp/sp/sputilities";
import { IPerson } from "./DomainObjects";

declare var _spPageContextInfo: any;

export interface IEmailApi {
    readonly siteUrl: string,
    sendEmail: (to: IPerson[], subject: string, body: string, cc?: IPerson[], from?: IPerson) => Promise<void>
};

export class EmailApi implements IEmailApi {

    siteUrl: string = _spPageContextInfo.webAbsoluteUrl;

    constructor() {
        sp.setup({
            sp: {
                baseUrl: _spPageContextInfo.webAbsoluteUrl
            }
        });
    }

    getEmails(people: IPerson[]) {
        return people.map(p => p.EMail);
    }

    async sendEmail(to: IPerson[], subject: string, body: string, cc?: IPerson[], from?: IPerson): Promise<void> {
        try {
            let email: IEmailProperties = {
                To: this.getEmails(to),
                CC: cc ? this.getEmails(cc) : undefined,
                Subject: "SBO-Workflow " + subject,
                Body: body.replace(/\n/g, '<BR>'),
                From: from?.EMail,
                AdditionalHeaders: {
                    "content-type": "text/html"
                }
            }
            await sp.utility.sendEmail(email);
        } catch (e) {
            throw getAPIError(e, `Error trying to send Email with subject ${subject}`);
        }
    }
}

export class EmailApiDev implements IEmailApi {

    siteUrl: string = "localhost";

    sleep() {
        return new Promise(r => setTimeout(r, 500));
    }

    async sendEmail(): Promise<void> {
        await this.sleep();
        //Empty as there isn't really anything to do for it in dev.
    }
}

export class EmailApiConfig {
    private static emailApi: IEmailApi

    static getApi(): IEmailApi {
        if (!this.emailApi) {
            this.emailApi = process.env.NODE_ENV === 'development' ? new EmailApiDev() : new EmailApi();
        }
        return this.emailApi;
    }
}