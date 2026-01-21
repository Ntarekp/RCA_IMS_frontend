/**
 * File Service
 * API service for file upload operations
 */

import { post } from '../client';
import { API_CONFIG } from '../config';

const ENDPOINT = '/api/files';

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

  const response = await fetch(`${API_CONFIG.BASE_URL}${ENDPOINT}/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data: UploadResponse = await response.json();
  return data.fileUrl;
};
