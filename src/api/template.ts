import client from "./client"

const templateApi = {
  testSend: async (templateId: number, testerIds: number[]) => {
    const response = await client.post('/templates/test_send/', {
      template_id: templateId,
      customer_ids: testerIds
    })
    return response
  }
}

export default templateApi;