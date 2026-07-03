import { api } from "./api";
import { LoginFormValues } from "./schemas/auth";

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export async function login(values: LoginFormValues): Promise<AuthTokens>{
    const { data } = await api.post<AuthTokens>('/auth/login', values);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data;
}

export function logout(){
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
}

export function isAuthenticated(): boolean{
    return typeof window !== 'undefined' && !!localStorage.getItem('accessToken');
}