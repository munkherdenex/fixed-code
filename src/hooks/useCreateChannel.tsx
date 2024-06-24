import { BASE_URL } from "../constants";
import useSWRMutation from "swr/mutation";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export interface Channel {
  data: any;
  name: string;
  channel_type: string;
  team_id: string;
  created_by: number;
  updated_by: number;
}

export default function useCreateChannel() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/api/v1/dj/channels/`,
    async (path, { arg }: { arg: Channel }) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(arg),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json();

        const error = new Error(data?.error);

        error.status = res.status;

        throw error;
      }

      return res;
    },
  );

  useEffect(() => {
    if (error) {
      addToast({
        id: "create-channel-error",
        color: "danger",
        title: "An error occurred",
        text: error?.message,
      });
    }
  }, [error]);

  return {
    data: data,
    error,
    isMutating,
    trigger,
  };
}
