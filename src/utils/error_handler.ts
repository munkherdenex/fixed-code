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

    error.status = res.status;

    if (res?.headers?.get("content-type") === "application/json") {
      data = await res.json();
      error.message = JSON.stringify(data);
    }

    if (showError) {
      addToast({
        id: "fields-list-error",
        color: "danger",
        title: `${error?.status}: An error occurred`,
        text: error?.message,
      });
    }

    if (res?.status === 404 && router?.pathname !== "/dashboards") {
      router.replace("/dashboards");
      return;
    }

    throw error;
  }

  if (res?.headers.get("content-type") === "application/json") {
    return await res.json();
  }

  return res.text();
}
