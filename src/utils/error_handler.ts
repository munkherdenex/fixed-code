import router from "next/router";
import { addToast } from "../components/toast";

/**
 * @param res - Response object
 * @param showError - boolean to show error message
 * @returns Promise<any>
 * @description Handle response not ok
 */
export async function handleResponseNotOk(res: Response, showError: boolean = true) {
  if (!res.ok) {
    let data: any;
    const error = new Error();

    if (res?.status === 404 && router?.pathname !== "/dashboards") {
      router.replace("/dashboards");
      return;
    }
    if (res?.headers?.get("content-type") === "application/json") {
      data = await res.json();
      error.message = JSON.stringify(data);
    }

    error.status = res.status;

    if (showError) {
      addToast({
        id: "fields-list-error",
        color: "danger",
        title: `${error?.status} An error occurred`,
        text: error?.message,
      });
    }

    throw error;
  }

  if (res?.headers.get("content-type") === "application/json") {
    return await res.json();
  }

  return res.text();
}
