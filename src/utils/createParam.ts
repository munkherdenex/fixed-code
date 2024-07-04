export const createParam = (params) => {
  const usp = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") {
      usp.append(key, value);
    }
  }

  usp.sort();
  return usp.toString();
};
