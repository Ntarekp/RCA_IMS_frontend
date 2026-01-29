/**
 * Item Service
 * API service for item management operations
 */

import { get, post, put, patch, del } from '../client';
import { API_CONFIG } from '../config';
import {
  ItemDTO,
  CreateItemRequest,
  UpdateItemRequest,
  DamagedQuantityRequest,
} from '../types';

const ENDPOINT = API_CONFIG.ENDPOINTS.ITEMS;

/**
 * Get all items
 */
/**
 * Get all items with optional filters and sorting
 */
export const getAllItems = async (params?: {
  category?: string;
  status?: string;
  name?: string;
  sort?: string;
}): Promise<ItemDTO[]> => {
  let url = ENDPOINT;
  if (params) {
    const query = Object.entries(params)
      .filter(([_, v]) => v !== undefined && v !== null && v !== '')
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as string)}`)
      .join('&');
    if (query) url += `?${query}`;
  }
  return get<ItemDTO[]>(url);
};

/**
 * Get item by ID
 */
export const getItemById = async (id: number): Promise<ItemDTO> => {
  return get<ItemDTO>(`${ENDPOINT}/${id}`);
};

/**
 * Create new item
 */
export const createItem = async (
  item: CreateItemRequest
): Promise<ItemDTO> => {
  return post<ItemDTO>(ENDPOINT, item);
};

/**
 * Update existing item
 */
export const updateItem = async (
  id: number,
  item: UpdateItemRequest
): Promise<ItemDTO> => {
  return put<ItemDTO>(`${ENDPOINT}/${id}`, item);
};

/**
 * Delete item
 */
export const deleteItem = async (id: number, password?: string): Promise<void> => {
  if (password) {
    return del<void>(`${ENDPOINT}/${id}`, { password });
  }
  return del<void>(`${ENDPOINT}/${id}`);
};

/**
 * Record damaged quantity for an item
 */
export const recordDamagedQuantity = async (
  id: number,
  damagedQuantity: number
): Promise<ItemDTO> => {
  const request: DamagedQuantityRequest = { damagedQuantity };
  return patch<ItemDTO>(`${ENDPOINT}/${id}/damaged`, request);
};
