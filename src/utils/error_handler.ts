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
    let message: string;
    const error = new Error();

    if (res.headers.get("content-type")?.includes("application/json")) {
      data = await res.json();
      error.message = JSON.stringify(data);

      if (Array.isArray(data?.kind)) {
        message = data?.kind[0];
      }
      if (data.error) {
        message = data.error;
      }
      if (data.message) {
        message = data.message;
      }
      if (data.errors) {
        message = data.errors;
      }
      if (data.non_field_errors) {
        message = data.non_field_errors;
      }
      if (data.detail) {
        message = data.detail;
      }
    }

    error.status = res.status;

    if (showError) {
      addToast({
        id: "fields-list-error",
        color: "danger",
        title: `${error.status} An error occurred`,
        text: message,
      });
    }

    throw error;
  }

  try {
    return await res.json();
  } catch {
    return true;
  }
}
