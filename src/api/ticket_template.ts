import client from "./client"

const ticketTemplateApi = {
  getCompactList: async (is_active: boolean) => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const response = await client.get(`/crm/ticket/template/`, {
      params: { 'compact': true, 'is_active': is_active, limit: 20 }
    })
    return response
  },

  getTemplateById: async (id: number) => {
    const response = await client.get(`/crm/ticket/template/${id}/`)
    return response.data
  },

  update: async (templateId: number, data: object) => {
    const response = await client.post(`/crm/ticket/template/${templateId}/`, data)
    return response.data
  }
}

export default ticketTemplateApi;