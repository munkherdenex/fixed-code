import { createContext, useContext } from "react";
import useTeams from "../hooks/useTeams";
import { Teams } from "./teams_store.types";

const iniitialApiKeysState: {
  adminTeams: Teams[] | undefined;
  isLoading: boolean;
} = {
  adminTeams: undefined,
  isLoading: false,
};

export const apiKeyContext = createContext(iniitialApiKeysState);

export const useApiKeysContext = () => {
  return useContext(apiKeyContext);
};

export const ApiKeyProvider = ({ children }) => {
  const { data, isLoading } = useTeams<Teams[]>(undefined, {
    admin: "true",
  });

  return (
    <apiKeyContext.Provider
      value={{
        adminTeams: data,
        isLoading,
      }}
    >
      {children}
    </apiKeyContext.Provider>
  );
};
