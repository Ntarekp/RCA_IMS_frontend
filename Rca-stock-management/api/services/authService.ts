/**
 * Auth Service
 * API service for authentication operations
 */

import { post } from '../client';
import { API_CONFIG } from '../config';

const ENDPOINT = '/api/auth';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  email: string;
  role: string;
  message: string;
}

/**
 * Login user
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return post<LoginResponse>(`${ENDPOINT}/login`, credentials);
};

/**
 * Validate token
 */
export const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINT}/validate`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

