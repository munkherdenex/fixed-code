import client from "./client";

export interface SegmentRetarget {
  template_id: number;
  retarget_type: "opened" | "no_opened" | "clicked" | "not_clicked";
}

const segmentApi = {
  retargetCampaign: async (payload: SegmentRetarget) => {
    const response = await client.post("/segment/retarget/", payload);
    return response.data;
  },
};

export default segmentApi;
