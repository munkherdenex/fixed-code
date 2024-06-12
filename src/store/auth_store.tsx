import { createContext } from "react";
import { initial_Auth_Type } from "./auth_store.types";

const initial_Auth_State: initial_Auth_Type = {
    user: {
        last_name: '',
        first_name: '',
        birth_day: new Date,
        phone: 0,
        state: '',
        username: '',
        csrf_token: null,
    },
    error: undefined,
    loading: false,

    login: () => {
        return;
    },

    logout: () => {
        return;
    },
    removeTokenData: () => {
        return;
    },
}

export const Context = createContext(initial_Auth_State);
