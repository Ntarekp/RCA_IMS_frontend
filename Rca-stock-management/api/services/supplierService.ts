/**
 * Supplier Service
 * API service for supplier management operations
 */

import { get, post, put, del } from '../client';
import { API_CONFIG } from '../config';
import { Supplier } from '../../types';

const ENDPOINT = API_CONFIG.ENDPOINTS.SUPPLIERS;

export interface SupplierDTO {
  id?: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  itemsSupplied?: string;
  active?: boolean;
}

/**
 * Get all active suppliers
 */
export const getAllSuppliers = async (): Promise<Supplier[]> => {
  const dtos = await get<SupplierDTO[]>(ENDPOINT);
  return dtos.map(mapDTOToSupplier);
};

/**
 * Create new supplier
 */
export const createSupplier = async (supplier: any): Promise<Supplier> => {
  // The UI form sends: name, contact (phone), email, itemsSupplied (array), contactPerson
  const dto: SupplierDTO = {
    name: supplier.name,
    contactPerson: supplier.contactPerson || supplier.name, // Use contactPerson from form or fallback
    phone: supplier.contact, // 'contact' in frontend type maps to phone
    email: supplier.email,
    itemsSupplied: Array.isArray(supplier.itemsSupplied) ? supplier.itemsSupplied.join(', ') : supplier.itemsSupplied,
    active: true
  };

  const response = await post<SupplierDTO>(ENDPOINT, dto);
  return mapDTOToSupplier(response);
};

/**
 * Update existing supplier
 */
export const updateSupplier = async (id: string, supplier: Partial<Supplier>): Promise<Supplier> => {
  const payload: Partial<SupplierDTO> = {};
  if (supplier.name) payload.name = supplier.name;
  if (supplier.contact) payload.phone = supplier.contact;
  if (supplier.email) payload.email = supplier.email;
  if (supplier.itemsSupplied) payload.itemsSupplied = supplier.itemsSupplied.join(', ');

  const response = await put<SupplierDTO>(`${ENDPOINT}/${id}`, payload);
  return mapDTOToSupplier(response);
};

/**
 * Deactivate (soft delete) supplier
 */
export const deleteSupplier = async (id: string): Promise<void> => {
  return del<void>(`${ENDPOINT}/${id}`);
};

// Mapper
const mapDTOToSupplier = (dto: SupplierDTO): Supplier => ({
  id: dto.id?.toString() || '',
  name: dto.name,
  contact: dto.phone, // Mapping phone back to contact for frontend
  email: dto.email,
  itemsSupplied: dto.itemsSupplied ? dto.itemsSupplied.split(',').map(s => s.trim()) : [],
  // Add other fields if needed
});
