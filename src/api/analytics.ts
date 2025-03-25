import client from "./client"

const analyticsApi = {
  getForTemplate: async ({templateId = null, start = null, interval = '1d', measurement = null, kind = null, group_by_kind = false}) => {
    const response = await client.get('/analytics-v2/', {
      params: {
        interval: interval,
        start: start,
        template_id: templateId,
        group_by_kind: group_by_kind,
        measurement: measurement,
        kind: kind
      }
    })
    return response
  },
  getForCustomer: async ({customerId = null, start = null, interval = '1d'}) => {
    const response = await client.get('/analytics-v2/', {
      params: {
        interval: interval,
        start: start,
        measurement: ['customer_create', 'customer_update'].join(','),
        customer_id: customerId,
      }
    })
    return response
  },
} 


export default analyticsApi;