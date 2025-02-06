import client from "./client";

const ticketApi = {
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
