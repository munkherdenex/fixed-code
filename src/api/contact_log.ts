import client from "./client";

interface TicketPayload {
  tt_id?: number;
  cl_id?: number;
  at_email?: string;
}

const contactLogApi = {
  getLogs: async () => {
    const response = await client.get("/crm/contact_log/");
    return response.data;
  },

  getCalls: async () => {
    const response = await client.get("/crm/calls/");
    return response.data;
  },

  getChats: async () => {
    const response = await client.get(`/crm/fbchat/chat/`);
    return response.data;
  },

  createTicket: async (payload: TicketPayload) => {
    const response = await client.post("/crm/ticket/", payload);
    return response.data;
  },
};

export default contactLogApi;
