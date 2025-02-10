import client from "./client";

const ticketApi = {
  create: async (templateId: number, data: object) => {
    const response = await client.post(`/crm/ticket/`, { tt_id: templateId, ...data });
    return response;
  },
  update: async (id, payload) => {
    const response = await client.put(`/crm/ticket/${id}/`, payload);
    return response;
  },
  getTickets: async (params: any) => {
    const response = await client.get("/crm/ticket/", { params });
    return response.data;
  },
  getTicketById: async (id: string) => {
    const response = await client.get(`/crm/ticket/${id}/`);
    return response.data;
  },
};

export default ticketApi;
