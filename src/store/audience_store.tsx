import { useRouter } from "next/router";
import { createContext, useContext } from "react";
import useGetCustomers, { CustomersType } from "../hooks/useGetCustomers";

const initialAudienceState: {
  data: CustomersType | undefined;
  isLoading: boolean;
} = {
  data: undefined,
  isLoading: false,
};

export const audienceContext = createContext(initialAudienceState);

export const useAudienceContext = () => {
  return useContext(audienceContext);
};

export const AudienceProvider = ({ children }) => {
  const router = useRouter();
  const { data, isLoading } = useGetCustomers<CustomersType>(router.query.id, {
    extended: "true",
  });

  return (
    <audienceContext.Provider
      value={{
        data,
        isLoading,
      }}
    >
      {children}
    </audienceContext.Provider>
  );
};
