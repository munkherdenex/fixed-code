import client from "./client";

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

const tagApi = {
  create: async (payload: any) => {
    const response = await client.post(`/crm/tag/`, payload);
    return response.data;
  },
  delete: async (id) => {
    const response = await client.delete(`/crm/tag/${id}/`);
    return response;
  },
  getTags: async (params: any = {}) => {
    const response = await client.get("/crm/tag/", { params });
    return response.data;
  },
  getTagById: async (id: string) => {
    const response = await client.get(`/crm/tag/${id}/`);
    return response.data;
  },
  updateTagById: async (tagObject: Tag) => {
    const response = await client.put(`/crm/tag/${tagObject.id}/`, tagObject);
    return response.data;
  },
};

export default tagApi;
