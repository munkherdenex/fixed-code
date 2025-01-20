import useSWRMutation from "swr/mutation";
import segmentApi from "../api/segment";

export default function useCreateSegmentRetarget() {
  const { data, error, isMutating, trigger } = useSWRMutation(
    `/segments/retarget/`,
    async (
      _path,
      {
        arg,
      }: {
        arg: {
          template_id: number;
          retarget_type: "opened" | "not_opened" | "clicked" | "not_clicked";
        };
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
