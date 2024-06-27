import { addToast } from "../components/toast";

export async function handleResponseNotOk(res: Response) {
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
      if (data.detail) {
        error.message = data.detail;
      }
    } catch (error) {}

    error.status = res.status;

    addToast({
      id: "fields-list-error",
      color: "danger",
      title: `${error.status} An error occurred`,
      text: error?.message,
    });
  }

  return res.json();
}
