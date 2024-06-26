export async function handleResponseNotOk(res) {
  if (!res.ok) {
    const data = await res.json();

    const error = new Error();

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

    error.status = res.status;

    throw error;
  }

  return res;
}
