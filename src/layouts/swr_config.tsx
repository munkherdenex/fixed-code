import { useRouter } from "next/router";
import { useContext } from "react";
import { SWRConfig } from "swr";
import { authContext } from "../store/auth_store";

const SWRConfigLayout = ({ children }) => {
  const router = useRouter();
  const { removeUserTokenData } = useContext(authContext);

  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        onError: (error) => {
          if (error?.status === 401 && router.pathname.includes("/dashboard")) {
            removeUserTokenData();
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRConfigLayout;
