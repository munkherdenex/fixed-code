import { useRouter } from "next/router";
import { createContext, useContext } from "react";
import useGetTemplates, { Template } from "../hooks/useGetTemplates";

const iniitialCampaignState: {
  data: Template | undefined;
  isLoading: boolean;
} = {
  data: undefined,
  isLoading: false,
};

export const campaignContext = createContext(iniitialCampaignState);

export const useCampaignContext = () => {
  return useContext(campaignContext);
};

export const CampaignProvider = ({ children }) => {
  const router = useRouter();
  const { data, isLoading } = useGetTemplates<Template>(router.query.id);

  return (
    <campaignContext.Provider
      value={{
        data,
        isLoading,
      }}
    >
      {children}
    </campaignContext.Provider>
  );
};
