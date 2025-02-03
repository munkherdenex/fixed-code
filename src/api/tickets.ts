import client from "./client"

const ticketsApi = {
  create: async (templateId: number, data: object) => {
    const response = await client.post(`/crm/ticket/`, {tt_id: templateId, ...data})
    return response
  }
}

export default ticketsApi;