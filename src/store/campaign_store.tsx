import { useRouter } from "next/router";
import { createContext, useCallback, useContext } from "react";
import useGetTemplates, { Template } from "../hooks/useGetTemplates";
import templateApi from '../api/template';

const iniitialCampaignState: {
  data: Template | undefined;
  toggleIsToAll: () => void;
  isLoading: boolean;
} = {
  data: undefined,
  toggleIsToAll: undefined,
  isLoading: false,
};

export const campaignContext = createContext(iniitialCampaignState);

export const useCampaignContext = () => {
  return useContext(campaignContext);
};

export const CampaignProvider = ({ children }) => {
  const router = useRouter();
  const { data, isLoading, mutate } = useGetTemplates<Template>(router.query.id);

  const toggleIsToAll = async () => {
    const response = await templateApi.toggleIsToAll(data.id, !data.is_to_all);
    console.log(response);
    mutate();
  };

  return (
    <campaignContext.Provider
      value={{
        data,
        toggleIsToAll,
        isLoading,
      }}
    >
      {children}
    </campaignContext.Provider>
  );
};
