import client from "./client"

const audienceApi = {
  getAudiences: async () => {
    const response = await client.get('/customers/')
    return response
  },

  getAudience: async ([url, params]) => {
    const response = await client.get(`/customers/${params.id}/`, { params: { extended: params.extended } })
    return response.data
  },

  getTestAudiences: async ([k, params]) => {
    const response = await client.get(`/test_users/`, {params: params})
    return response.data
  },

  removeTestAudience: async ([k, params]) => {
    const response = await client.delete(`/test_users/${params.id}/`)
    return response.data
  },

  addTestAudience: async ([k, params]) => {
    const response = await client.post(`/test_users/${params.id}/`)
    return response.data
  }
}

export default audienceApi;