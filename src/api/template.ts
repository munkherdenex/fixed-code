import client from "./client"

const templateApi = {
  getList: async (limit = 5) => {
    const response = await client.get('/templates/', { params: { limit: limit } })
    return response
  },
  getStatCounts: async (templateId: number) => {
    const response = await client.get(`/templates/${templateId}/counts/`)
    return response.data
  },
  getStats: async () => {
    const response = await client.get('/templates/status_count/')
    return response
  },

  testSend: async (templateId: number, testerIds: number[]) => {
    const response = await client.post('/templates/test_send/', {
      template_id: templateId,
      customer_ids: testerIds
    })
    return response
  },

  toggleIsToAll: async (templateId: number, value: boolean) => {
    const response = await client.post(`/templates/${templateId}/send_to_all/`, {
      is_to_all: value
    })
    return response
  }
}

export default templateApi;