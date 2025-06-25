import client from "./client";

const knowledgeApi = {
  getList: async (params: any) => {
    const response = await client.get("/crm/knowledge/", { params });
    return response.data;
  },
  getTagById: async (id: string) => {
    const response = await client.get(`/crm/tag/${id}/`);
    return response.data;
  },
  create: async (data: object) => {
    const response = await client.post("/crm/knowledge/", data);
    return response.data;
  },
  update: async (id: number, data: object) => {
    const response = await client.put(`/crm/knowledge/${id}/`, data);
    return response.data;
  },
  delete: async (id: number | string) => {
    const response = await client.delete(`/crm/knowledge/${id}/`);
    return response.data;
  }
};

export default knowledgeApi;
