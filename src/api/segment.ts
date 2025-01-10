import client from './client';

const segmentApi = {
  getSegments: async () => {
    /*
    {
      "id": 1,
      "name": "Retargeted - clicked on 'Test campaign name'", 
      "condition": {
        "opened": true,
        "clicked": true
      }
      "retarget_template_id": 1
    }
    */
    const response = await client.post('/segments/retarget/');
    return response;
  },
}

export default segmentApi