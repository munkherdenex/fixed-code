import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext } from "react";
import { mutate } from "swr";
import useLogout from "../hooks/useLogout";
import useProfile from "../hooks/useProfile";
import { Initial_Auth_Type } from "./auth_store.types";

const initial_Auth_State: Initial_Auth_Type = {
  user: {
    id: "",
    email: "",
    registration_date: "",
    status: "",
    last_name: "",
    first_name: "",
    role: "",
  },
  getToken: () => "",
  setToken: () => {},
  removeToken: () => {},
  removeUserTokenData: () => {},
};

export const authContext = createContext(initial_Auth_State);

const pathPrefix = process.env.PATH_PREFIX;

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const { trigger } = useLogout();
  const { data: user } = useProfile();

  const getToken = () => {
    return Cookies.get("token");
  };

  const setToken = (token: string) => {
    Cookies.set("token", token);
  };

  const removeToken = () => {
    Cookies.remove("token");
  };

  const removeUserTokenData = async () => {
    await trigger();
    await mutate(() => true, undefined, { revalidate: false });
    Cookies.remove("token");
    Cookies.remove("_customer_data_session", { path: "/", domain: pathPrefix });
    localStorage.removeItem("currentTeamId");
    router.replace("/signin");
  };

  return (
    <authContext.Provider
      value={{
        user,
        getToken,
        setToken,
        removeToken,
        removeUserTokenData,
      }}
    >
      {children}
    </authContext.Provider>
  );
};
