import { useRouter } from "next/router";
import useSWRImmutable from "swr/immutable";
import { BASE_URL } from "../constants";
import { createParam } from "../utils/createParam";
import { handleResponseNotOk } from "../utils/error_handler";

export interface Product {
  id: number;
  name: string;
}

/**
 * Fetches the available product from the api
 * @param id - the id of the product
 * @param queryParam - the query parameters
 * @returns the data, error, isLoading and mutate function
 */
export default function useGetProducts<Type>(queryParam?: { [key: string]: string }): {
  data: Type;
  error: any;
  isLoading: boolean;
  mutate: () => Promise<Type>;
} {
  const router = useRouter();
  const preparedQueryParam = createParam(queryParam);
  const path = router.pathname.includes("dashboards")
    ? `/api/v1/products/?${preparedQueryParam}`
    : null;

  const { data, error, isLoading, mutate } = useSWRImmutable(
    //INFO: slash needs to be added to the end of the path
    path,
    async (path) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
        credentials: "include",
      });

      return handleResponseNotOk(res);
    },
  );

  return {
    data,
    error,
    isLoading,
    mutate,
  };
}
