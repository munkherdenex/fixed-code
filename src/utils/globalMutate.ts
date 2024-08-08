import { mutate } from "swr";

export const globalMutate = async (path: string) => {
  await mutate(
    (key) => {
      if (`${key}`.includes(path)) {
        return true;
      }
      return false;
    }, // which cache keys are updated
    undefined, // update cache data to `undefined`
    { revalidate: true }, // do not revalidate
  );
};
