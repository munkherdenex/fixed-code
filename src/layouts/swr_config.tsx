import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { mutate, SWRConfig } from "swr";
import useLogout from "../hooks/useLogout";

const SWRConfigLayout = ({ children }) => {
  const router = useRouter();
  const { trigger } = useLogout();

  return (
    <SWRConfig
      value={{
        onError: async (error) => {
          if (error?.status === 401 && router.pathname.includes("dashboards")) {
            await trigger();
            await mutate(() => true, undefined, { revalidate: false });
            Cookies.remove("_customer_data_session", { path: "/" });
            localStorage.removeItem("currentTeamId");
            window.location.href = "/";
          }
        },
        onErrorRetry: (error) => {
          if (error?.status === 401) {
            return;
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRConfigLayout;
