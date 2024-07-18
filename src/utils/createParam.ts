/**
 * @param params {Object} - Object with key value pairs
 * @returns {string} - Returns a string with key value pairs
 */
export function createParam(params: { [key: string]: string }) {
  if (!params) {
    return "";
  }
  const usp = new URLSearchParams();

  for (const [key, value] of Object?.entries(params)) {
    if (value !== undefined && value !== "") {
      usp.append(key, value);
    }
  }

  usp.sort();
  return usp.toString();
}
