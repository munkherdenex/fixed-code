import client from "./client"

const analyticsApi = {
  getForTemplate: async ({templateId = null, start = null, interval = '1d', measurement = null, group_by_kind = false}) => {
    const response = await client.get('/analytics-v2/', {
      params: {
        interval: interval,
        start: start,
        template_id: templateId,
        measurement: measurement,
        group_by_kind: group_by_kind
      }
    })
    return response
  },
  getForCustomer: async ({customerId = null, start = null, interval = '1d'}) => {
    const response = await client.get('/analytics-v2/', {
      params: {
        interval: interval,
        start: start,
        customer_id: customerId 
      }
    })
    return response
  },
}


export default analyticsApi;