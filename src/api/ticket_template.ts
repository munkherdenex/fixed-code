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
  },

  getTicketTabs: async () => {
    // const response = await client.get(`/crm/ticket/template/tabs/`)
    // return response.data

    return [
      {
        name: "Санал хүсэлт",
        id: 2
      },
      {
        name: "Асуудал",
        id: 3
      },
      {
        name: "Санхүүгийн асуудал",
        id: 4
      },
      {
        name: "Гомдол",
        id: 17
      },
      {
        name: "Хамтран ажиллах хүсэлт",
        id: 18
      },
      {
        name: "Худалдан авалт",
        id: 19
      },
      {
        name: "Буцаалт",
        id: 20
      },
      {
        name: "санал",
        id: 21
      },
      {
        name: "Лавлагаа",
        id: 22
      },
      
    ]
  }
}

export default ticketTemplateApi;