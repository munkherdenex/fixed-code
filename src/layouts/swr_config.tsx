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
        revalidateOnFocus: false,
        onError: async (error) => {
          if (error?.status === 401 && router.pathname.includes("dashboards")) {
            await trigger();
            await mutate(() => true, undefined, { revalidate: false });
            Cookies.remove("_customer_data_session", { path: "/" });
            localStorage.removeItem("currentTeamId");
            window.location.href = "/";
          }
        },
        onErrorRetry: (error, _key, _config, revalidate, { retryCount }) => {
          if (error?.status === 401) {
            return;
          }
          if (error?.status === 403) {
            return;
          }
          if (error?.status === 502) {
            return;
          }
          if (retryCount >= 3) return;
          setTimeout(() => revalidate({ retryCount }), 5000);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};

export default SWRConfigLayout;
