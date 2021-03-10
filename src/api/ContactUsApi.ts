import { spWebContext } from "../providers/SPWebContext";
import { IPerson } from "./DomainObjects";
import { getAPIError } from "./InternalErrors";
import { sleep } from "./ProcessesApiDev";

export interface IContact {
    Title: string,
    Contact: IPerson
}

export interface IContactUsApi {
    fetchContacts(): Promise<IContact[]>
}

export class ContactUsApi implements IContactUsApi {

    private contactsList = spWebContext.lists.getByTitle("ContactUs");

    fetchContacts = (): Promise<IContact[]> => {
        try {
            return this.contactsList.items
                .select("Title", "Contact/Id", "Contact/Title", "Contact/EMail")
                .expand("Contact")
                .get();
        } catch (e) {
            throw getAPIError(e, "Error occurred while trying to fetch the Contacts for reporting bugs");
        }
    }
}

export class ContactUsApiDev implements IContactUsApi {
    fetchContacts = async (): Promise<IContact[]> => {
        await sleep();
        return [{ Title: "Jeremy", Contact: { Id: 1, Title: "Jeremy Clark", EMail: "yuh@me.com" } }]
    }
}

export class ContactUsApiConfig {
    private static contactUsApi: IContactUsApi

    static getApi(): IContactUsApi {
        if (!this.contactUsApi) {
            this.contactUsApi = process.env.NODE_ENV === 'development' ? new ContactUsApiDev() : new ContactUsApi();
        }
        return this.contactUsApi;
    }
}