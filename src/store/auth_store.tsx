import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext } from "react";
import { mutate } from "swr";
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

export const AuthProvider = ({ children }) => {
  const router = useRouter();
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
    Cookies.remove("token");
    await mutate(() => true, undefined, { revalidate: false });
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
