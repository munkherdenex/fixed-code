import client from "./client";

export interface TicketPayload {
  tt_id?: number;
  cl_id?: number;
  at_email?: string;
}
export interface ChatSendPayload {
  page_id: string;
  psid: number;
  text: string;
}

const contactLogApi = {
  getLogs: async () => {
    const response = await client.get("/crm/contact_log/");
    return response.data;
  },

  getCalls: async (params) => {
    const response = await client.get("/crm/calls/", { params });
    return response.data;
  },

  getCallById: async (id) => {
    const response = await client.get(`/crm/calls/${id}/`);
    return response.data;
  },

  getCallByCallId: async (call_id) => {
    const response = await client.get(`/crm/calls/by_call_id/${call_id}/`);
    return response.data;
  },

  updateContactLogById: async (id, body = null, status = null, sentiment = null) => {
    const response = await client.put(`/crm/contact_log/${id}/`, {
      ...(body !== undefined ? { body } : {}),
      ...(status !== undefined ? { status } : {}),
      ...(sentiment !== null ? { sentiment } : {})
    });
    return response.data;
  },

  getRootChatLogs: async (cursor: string, status?: string, source_id?: string) => {
    const response = await client.get("/crm/fbchat/chat/", 
      { params: {
        cursor, 
        status, 
        source_id 
      } 
    });
    return response.data;
  },

  getChatLogs: async (rootId: string, cursor: string) => {
    const response = await client.get(`/crm/fbchat/chat/${rootId}/`, {
      params: {
        cursor,
      },
    });
    return response.data;
  },

  assignPsidToCustomer: async (payload: any) => {
    const response = await client.post("/crm/fbchat/psid/", payload);
    return response.data;
  },

  sendChat: async (payload: ChatSendPayload) => {
    const response = await client.post("/crm/fbchat/send/", payload);
    return response.data;
  },

  createTicket: async (payload: TicketPayload) => {
    const response = await client.post("/crm/ticket/", payload);
    return response.data;
  },
};

export default contactLogApi;
