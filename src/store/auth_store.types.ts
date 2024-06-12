export interface profile_type {
    last_name: string;
    first_name: string;
    birth_day: Date;
    phone: number;
    state: string;
    username: string;
    csrf_token: string | null;
}

export interface initial_Auth_Type {
    user: profile_type | null;
    login: (formData: any) => void;
    error: any;
    loading: boolean;
    logout: () => void;
    removeTokenData: () => void;
}