import client from "./client";

export interface SegmentRetarget {
  template_id: number;
  retarget_type: "opened" | "not_opened" | "clicked" | "not_clicked";
}

const segmentApi = {
  retargetCampaign: async (payload: SegmentRetarget) => {
    /*
      {
        "template_id": 0,
        "retarget_type": "clicked"
      }
    */
    const response = await client.post("/segments/retarget/", payload);
    return response.data;
  },
};

export default segmentApi;
