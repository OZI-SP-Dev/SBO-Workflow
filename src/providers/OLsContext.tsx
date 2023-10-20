import { createContext, useContext, useEffect, useState } from "react";
import { InternalError } from "../api/InternalErrors";
import { IOL, OLsApiConfig } from "../api/OLsApi";
import { ErrorsContext } from "./ErrorsContext";

const SBO_CACHED_OL: string = "sboCachedOL";

export interface IOLsContext {
  ols: IOL[];
  currentOL: string;
  loading: boolean;
  setOL: (newOL: string) => void;
}

export const OLsContext = createContext<Partial<IOLsContext>>({
  ols: [],
  currentOL: "",
  loading: true,
  setOL: () => {},
});
export const OLsProvider: React.FunctionComponent = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [currentOL, setCurrentOL] = useState<string>(
    localStorage.getItem(SBO_CACHED_OL) ?? "WPAFB"
  );
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

  const setOL = (newOL: string) => {
    localStorage.setItem(SBO_CACHED_OL, newOL);
    setCurrentOL(newOL);
  };

  useEffect(() => {
    fetchOLs();
    // eslint-disable-next-line
  }, []);

  const olsContext: IOLsContext = {
    ols,
    currentOL,
    loading,
    setOL,
  };

  return (
    <OLsContext.Provider value={olsContext}>{children}</OLsContext.Provider>
  );
};

export const { Consumer } = OLsContext;
