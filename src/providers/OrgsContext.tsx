import { createContext, useEffect, useState } from "react";
import { IOrg, OrgsApiConfig } from "../api/OrgsApi";


export interface IOrgsContext {
    orgs: IOrg[],
    loading: boolean
}

export const OrgsContext = createContext<Partial<IOrgsContext>>({ orgs: [], loading: true });
export const OrgsProvider: React.FunctionComponent = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [orgs, setOrgs] = useState<IOrg[]>([]);

    const orgsApi = OrgsApiConfig.getApi();

    const fetchOrgs = async () => {
        setOrgs(await orgsApi.fetchOrgs());
        setLoading(false);
    }

    useEffect(() => {
        fetchOrgs();
        // eslint-disable-next-line
    }, []);

    const orgsContext: IOrgsContext = {
        orgs,
        loading
    }

    return (<OrgsContext.Provider value={orgsContext}>{children}</OrgsContext.Provider>)
};

export const { Consumer } = OrgsContext