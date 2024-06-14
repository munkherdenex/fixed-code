export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  registration_date: string;
  role: string;
  status: string;
}

export interface Initial_Auth_Type {
  user: User | null;
  getToken: () => string | null;
  setToken: (token: string) => void;
  removeToken: () => void;
  removeUserTokenData: () => void;
}
