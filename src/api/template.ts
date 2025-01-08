import client from "./client"

const templateApi = {
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