import client from "./client"

const ticketTemplateApi = {
  getCompactList: async (is_active: boolean) => {
    const response = await client.get(`/crm/ticket/template/`, {
      params: { 'compact': true, 'is_active': is_active }
    })
    return response.data
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