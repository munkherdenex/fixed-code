import useSWRMutation from "swr/mutation";
import segmentApi, { SegmentRetarget } from "../api/segment";

export default function useCreateSegmentRetarget() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/segments/retarget/`,
    async (
      _path,
      {
        arg,
      }: {
        arg: SegmentRetarget;
      },
    ) => {
      return segmentApi.retargetCampaign(arg);
    },
  );

  return {
    data,
    error,
    isMutating,
    trigger,
  };
}
