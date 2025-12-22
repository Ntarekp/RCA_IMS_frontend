/**
 * User Service
 * API service for user profile and password management
 */

import { get, put, post } from '../client';
import { API_CONFIG } from '../config';

const ENDPOINT = '/api/auth';

export interface UserProfileResponse {
  email: string;
  role: string;
  enabled: boolean;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  department?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<UserProfileResponse> => {
  return get<UserProfileResponse>(`${ENDPOINT}/profile`);
};

/**
 * Update user profile
 */
export const updateProfile = async (profile: UpdateProfileRequest): Promise<any> => {
  return put<any>(`${ENDPOINT}/profile`, profile);
};

/**
 * Change user password
 */
export const changePassword = async (request: ChangePasswordRequest): Promise<any> => {
  return post<any>(`${ENDPOINT}/change-password`, request);
};

