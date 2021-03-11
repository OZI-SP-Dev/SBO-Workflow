import { createContext, useContext, useEffect, useState } from "react";
import { ContactUsApiConfig, IContact } from "../api/ContactUsApi";
import { ErrorsContext } from "./ErrorsContext";

export interface IContactUsContext {
    contacts: IContact[],
    loading: boolean
}

export const ContactUsContext = createContext<IContactUsContext>({ contacts: [], loading: true });
export const ContactUsProvider: React.FunctionComponent = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [contacts, setContacts] = useState<IContact[]>([]);

    const errorsContext = useContext(ErrorsContext);
    const contactUsApi = ContactUsApiConfig.getApi();

    const fetchContacts = async () => {
        try {
            setContacts(await contactUsApi.fetchContacts());
        } catch (e) {
            if (errorsContext.reportError) {
                errorsContext.reportError(e);
            }
        } finally {
            setLoading(false);
        }
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