import client from "./client"

const contactLogApi = {
  getLogs: async () => {
    const response = await client.get('/crm/contact_log/')
    return response.data
  },

  getCalls: async () => {
    const response = await client.get('/crm/calls/')
    return response.data
  },

  getChats: async () => {
    const response = await client.get(`/crm/fbchat/chat/`)
    return response.data
  },

}

export default contactLogApi;