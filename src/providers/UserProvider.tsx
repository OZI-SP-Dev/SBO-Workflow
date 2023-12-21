import { createContext, FunctionComponent, useEffect, useState } from "react";
import { IPerson } from "../api/DomainObjects";
import { UserApiConfig } from "../api/UserApi";

export interface IUserContext {
  user?: IPerson;
  owner: boolean;
  loading: boolean;
}

export const UserContext = createContext<Partial<IUserContext>>({
  loading: true,
});
export const UserProvider: FunctionComponent = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<IPerson>();
  const [owner, setOwner] = useState<boolean>(false);

  const userApi = UserApiConfig.getApi();

  const fetchUser = async () => {
    setUser(await userApi.getCurrentUser());
    setOwner(await userApi.isOwner());
    setLoading(false);
  };

  useEffect(() => {
    fetchUser(); // eslint-disable-next-line
  }, []);

  const userContext: IUserContext = {
    user,
    owner,
    loading,
  };

  return (
    <UserContext.Provider value={userContext}>{children}</UserContext.Provider>
  );
};

export const { Consumer } = UserContext;
