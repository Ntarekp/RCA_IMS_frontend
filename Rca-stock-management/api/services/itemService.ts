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
export const getAllItems = async (): Promise<ItemDTO[]> => {
  return get<ItemDTO[]>(ENDPOINT);
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
export const deleteItem = async (id: number): Promise<void> => {
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

