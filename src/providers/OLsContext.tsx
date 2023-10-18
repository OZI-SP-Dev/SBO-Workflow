import { createContext, useContext, useEffect, useState } from "react";
import { InternalError } from "../api/InternalErrors";
import { IOL, OLsApiConfig } from "../api/OLsApi";
import { ErrorsContext } from "./ErrorsContext";

export interface IOLsContext {
  ols: IOL[];
  loading: boolean;
}

export const OLsContext = createContext<Partial<IOLsContext>>({
  ols: [],
  loading: true,
});
export const OLsProvider: React.FunctionComponent = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [ols, setOLs] = useState<IOL[]>([]);

  const errorsContext = useContext(ErrorsContext);
  const olsApi = OLsApiConfig.getApi();

  const fetchOLs = async () => {
    try {
      setOLs(await olsApi.fetchOLs());
    } catch (e) {
      if (errorsContext.reportError) {
        errorsContext.reportError(e as InternalError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOLs();
    // eslint-disable-next-line
  }, []);

  const olsContext: IOLsContext = {
    ols,
    loading,
  };

  return (
    <OLsContext.Provider value={olsContext}>{children}</OLsContext.Provider>
  );
};

export const { Consumer } = OLsContext;
