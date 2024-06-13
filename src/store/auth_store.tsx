import Cookies from "js-cookie";
import { useRouter } from "next/router";
import { createContext, useState } from "react";
import { mutate } from "swr";
import { Initial_Auth_Type, User } from "./auth_store.types";

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
  setUser: () => {},
  getToken: () => "",
  setToken: () => {},
  removeToken: () => {},
  setUserTokenData: () => {},
  removeUserTokenData: () => {},
};

export const authContext = createContext(initial_Auth_State);

export const AuthProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User>();

  const getToken = () => {
    return Cookies.get("token");
  };

  const setToken = (token: string) => {
    Cookies.set("token", token);
  };

  const removeToken = () => {
    Cookies.remove("token");
  };

  const setUserTokenData = (data: User, token: string) => {
    setUser(data);
    Cookies.set("token", token);
  };

  const removeUserTokenData = async () => {
    setUser({
      id: "",
      email: "",
      registration_date: "",
      status: "",
      last_name: "",
      first_name: "",
      role: "",
    });
    Cookies.remove("token");
    await mutate(() => true, undefined, { revalidate: false });
    router.replace("/");
  };

  return (
    <authContext.Provider
      value={{
        user,
        setUser,
        getToken,
        setToken,
        removeToken,
        setUserTokenData,
        removeUserTokenData,
      }}
    >
      {children}
    </authContext.Provider>
  );
};
