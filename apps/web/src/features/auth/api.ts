import { UserRole } from '@nurses/shared';
import { apiClient } from '../../lib/api-client';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  sub: string;
  email: string;
  role: UserRole;
}

export async function login(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const { data } = await apiClient.post<AuthTokens>('/auth/login', {
    email,
    password,
  });
  return data;
}

export async function fetchMe(): Promise<AuthUser> {
  const { data } = await apiClient.get<AuthUser>('/auth/me');
  return data;
}
