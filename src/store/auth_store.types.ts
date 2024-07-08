export interface User {
  id: string;
  email: string;
  fname: string;
  lname: string;
  registration_date: string;
  role: string;
  status: string;
}

export interface Initial_Auth_Type {
  user: User | null;
  isLoading: boolean;
  getToken: () => string | null;
  setToken: (token: string) => void;
  removeToken: () => void;
  removeUserTokenData: () => void;
}
