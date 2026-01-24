/**
 * File Service
 * API service for file upload operations
 */

import { post } from '../client';
import { API_CONFIG, getApiUrl } from '../config';

const ENDPOINT = '/files';

interface UploadResponse {
  fileUrl: string;
}

/**
 * Upload a file to the server
 * @param file The file to upload
 * @returns The URL of the uploaded file
 */
export const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);

  // We need to use fetch directly here because our client wrapper assumes JSON body
  // and sets Content-Type: application/json, which breaks multipart/form-data
  const token = localStorage.getItem('authToken');
  const headers: HeadersInit = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = getApiUrl(`${ENDPOINT}/upload`);
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    if (response.status === 401) {
        localStorage.removeItem('authToken');
        window.dispatchEvent(new Event('auth-error'));
        throw new Error('Session expired');
    }
    throw new Error('Failed to upload file');
  }

  const data: UploadResponse = await response.json();
  return data.fileUrl;
};
