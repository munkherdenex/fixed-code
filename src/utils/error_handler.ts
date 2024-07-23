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

    try {
      data = await res.json();

      if (Array.isArray(data?.kind)) {
        error.message = data?.kind[0];
      }
      if (data.error) {
        error.message = data.error;
      }
      if (data.message) {
        error.message = data.message;
      }
      if (data.errors) {
        error.message = data.errors;
      }
      if (data.non_field_errors) {
        error.message = data.non_field_errors;
      }
      if (data.detail) {
        error.message = data.detail;
      }
    } catch (error) {}

    error.status = res.status;

    if (showError) {
      addToast({
        id: "fields-list-error",
        color: "danger",
        title: `${error.status} An error occurred`,
        text: error?.message,
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
