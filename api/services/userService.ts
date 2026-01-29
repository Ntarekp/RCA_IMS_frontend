/**
 * User Service
 * API service for user profile and password management
 */

import { get, put, post, del } from '../client';
import { UserProfile } from '../../types';
import { API_CONFIG } from '../config';

const ENDPOINT = API_CONFIG.ENDPOINTS.AUTH;
const ADMIN_ENDPOINT = API_CONFIG.ENDPOINTS.ADMIN + '/users';

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
  location?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  twoFactorAuth?: boolean;
  theme?: string;
  language?: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface CreateUserRequest {
    name: string;
    email: string;
    password?: string;
    role: 'ADMIN' | 'USER';
    department?: string;
    phone?: string;
}

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<UserProfile> => {
  return get<UserProfile>(`${ENDPOINT}/profile`);
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

/**
 * Get all users (Admin only)
 */
export const getUsers = async (): Promise<UserProfile[]> => {
    return get<UserProfile[]>(ADMIN_ENDPOINT);
};

/**
 * Create a new user (Admin only)
 */
export const createUser = async (user: CreateUserRequest): Promise<UserProfile> => {
    return post<UserProfile>(ADMIN_ENDPOINT, user);
};

/**
 * Delete a user (Admin only)
 */
export const deleteUser = async (userId: number): Promise<void> => {
    return del<void>(`${ADMIN_ENDPOINT}/${userId}`);
};
