import { createContext, useContext, useEffect, useState } from "react";
import { InternalError } from "../api/InternalErrors";
import { IOrg, OrgsApiConfig } from "../api/OrgsApi";
import { ErrorsContext } from "./ErrorsContext";

export interface IOrgsContext {
  orgs: IOrg[];
  loading: boolean;
}

export const OrgsContext = createContext<Partial<IOrgsContext>>({
  orgs: [],
  loading: true,
});
export const OrgsProvider: React.FunctionComponent = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [orgs, setOrgs] = useState<IOrg[]>([]);

  const errorsContext = useContext(ErrorsContext);
  const orgsApi = OrgsApiConfig.getApi();

  const fetchOrgs = async () => {
    try {
      setOrgs(await orgsApi.fetchOrgs());
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
    // eslint-disable-next-line
  }, []);

  const orgsContext: IOrgsContext = {
    orgs,
    loading,
  };

  return (
    <OrgsContext.Provider value={orgsContext}>{children}</OrgsContext.Provider>
  );
};

export const { Consumer } = OrgsContext;
