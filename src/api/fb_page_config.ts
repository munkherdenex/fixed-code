import client from "./client";

interface FacebookLoginToken {
  user_access_token: string;
  app_scoped_user_id: string;
}

interface FBPageConfig {
  id?: number;
  created_by?: object;
  updated_by?: object;
  page_id: string;
  page_name: string | null;
  page_access_token: string;
  app_id: string | null;
  app_secret: string;
  verify_token: string | null;
  status: string;
  is_enabled: boolean;
  created_at?: string;
  updated_at?: string;
}

interface FBPageConfigResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FBPageConfig[];
}

const fbPageConfigApi = {
  getList: async (params?: any) => {
    const response = await client.get("/crm/facebook/config/", { params });
    return response.data;
  },
  
  getById: async (id: number) => {
    const response = await client.get(`/crm/facebook/config/${id}/`);
    return response.data;
  },
  
  create: async (payload: FBPageConfig) => {
    const response = await client.post("/crm/facebook/config/", payload);
    return response.data;
  },
  
  update: async (id: number, payload: Partial<FBPageConfig>) => {
    const response = await client.put(`/crm/facebook/config/${id}/`, payload);
    return response.data;
  },
  
  delete: async (id: number) => {
    const response = await client.delete(`/crm/facebook/config/${id}/`);
    return response.data;
  },
  
  toggleActive: async (id: number, isEnabled: boolean) => {
    const response = await client.put(`/crm/facebook/config/${id}/`, {
      is_enabled: isEnabled
    });
    return response.data;
  },

  saveConfig: async (payload: FacebookLoginToken) => {
    const response = await client.post("/crm/facebook/config/token/", payload);
    return response.data;
  }
};

export type { FBPageConfig, FBPageConfigResponse };
export default fbPageConfigApi;