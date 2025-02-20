import client from "./client";

const tagApi = {
  create: async (payload: any) => {
    const response = await client.post(`/crm/tag/`, payload);
    return response;
  },
  delete: async (id) => {
    const response = await client.delete(`/crm/tag/${id}/`);
    return response;
  },
  getTags: async (params: any) => {
    const response = await client.get("/crm/tag/", { params });
    return response.data;
  },
  getTagById: async (id: string) => {
    const response = await client.get(`/crm/tag/${id}/`);
    return response.data;
  },
};

export default tagApi;
