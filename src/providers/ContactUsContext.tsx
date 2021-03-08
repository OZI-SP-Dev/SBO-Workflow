import { createContext, useEffect, useState } from "react";
import { ContactUsApiConfig, IContact } from "../api/ContactUsApi";

export interface IContactUsContext {
    contacts: IContact[],
    loading: boolean
}

export const ContactUsContext = createContext<IContactUsContext>({ contacts: [], loading: true });
export const ContactUsProvider: React.FunctionComponent = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState<IContact[]>([]);

    const contactUsApi = ContactUsApiConfig.getApi();

    const fetchContacts = async () => {
        setContacts(await contactUsApi.fetchContacts());
        setLoading(false);
    }

    useEffect(() => {
        fetchContacts();
        // eslint-disable-next-line
    }, []);

    const contactUsContext: IContactUsContext = {
        contacts,
        loading
    }

    return (<ContactUsContext.Provider value={contactUsContext}>{children}</ContactUsContext.Provider>)
};

export const { Consumer } = ContactUsContext