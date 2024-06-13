import useSWR from "swr";
import { BASE_URL } from "../constants";
import { useEffect } from "react";
import { addToast } from "../components/toast";

export default function useProfile() {
  const { data, error, isLoading } = useSWR(`/api/v1/users`, async (path) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "content-type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const data = await res.json();

      const error = new Error(data?.error);

      error.status = res.status;

      throw error;
    }

    return res.json();
  });

  useEffect(() => {
    if (error) {
      addToast({
        id: "profile-error",
        color: "danger",
        title: "An error occurred",
        text: error?.message,
      });
    }
  }, [error]);

  return {
    data,
    error,
    isLoading,
  };
}
