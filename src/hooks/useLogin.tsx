import { BASE_URL } from "../constants";
import useSWRMutation from 'swr/mutation';

export default function useLogin<Type>() {
    const { data, error, isMutating, trigger } = useSWRMutation(`/api/v1/login`, async (path, { arg }: { arg: Type }) => {
        const res = await fetch(`${BASE_URL}${path}`, {
            method: "POST",
            headers: new Headers({ 'content-type': 'application/json' }),
            body: JSON.stringify(arg),
        });
        return res;
    });

    return {
        data: data,
        error,
        isMutating,
        trigger,
    };
}