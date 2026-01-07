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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Login user
 */
export const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
  return post<LoginResponse>(`${ENDPOINT}/login`, credentials);
};

/**
 * Request password reset
 */
export const forgotPassword = async (
  payload: ForgotPasswordRequest
): Promise<void> => {
  return post<void>(`${ENDPOINT}/forgot-password`, payload);
};

/**
 * Reset password with token
 */
export const resetPassword = async (
  payload: ResetPasswordRequest
): Promise<void> => {
  return post<void>(`${ENDPOINT}/reset-password`, payload);
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
