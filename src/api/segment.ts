import client from './client';

const segmentApi = {
  retargetCampaign: async () => {
    /*
      {
        "template_id": 0,
        "retarget_type": "clicked"
      }
    */
    const response = await client.post('/segments/retarget/');
    return response.data;
  },
}

export default segmentApi