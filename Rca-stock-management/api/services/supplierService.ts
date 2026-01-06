/**
 * Supplier Service
 * API service for supplier management operations
 */

import { get, post, put, del } from '../client';
import { API_CONFIG } from '../config';
import { Supplier } from '../../types';

const ENDPOINT = '/api/suppliers';

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
export const createSupplier = async (supplier: Omit<Supplier, 'id'>): Promise<Supplier> => {
  const dto: SupplierDTO = {
    name: supplier.name,
    contactPerson: supplier.contact, // Mapping contact to contactPerson
    phone: '0000000000', // Placeholder if not in UI, or map from UI
    email: supplier.email,
    itemsSupplied: supplier.itemsSupplied.join(', '),
    active: true
  };
  
  // If UI has phone, use it. The Supplier interface has 'contact' which seems to be phone or person.
  // Let's assume 'contact' in Supplier interface is phone number based on MOCK data, 
  // but backend expects contactPerson AND phone.
  // We need to update the frontend form to capture both or map intelligently.
  // For now, let's map 'contact' to 'phone' and use 'name' or a placeholder for contactPerson if missing.
  
  // Correction based on SupplierCard.tsx:
  // SupplierCard shows `supplier.contact` with a Phone icon. So `contact` is phone.
  // It shows `supplier.name` as company name.
  // It doesn't seem to have a separate contact person field in the UI yet.
  // We should update the UI to capture contact person.
  
  // Let's update the DTO mapping to be robust
  const payload: SupplierDTO = {
      name: supplier.name,
      contactPerson: supplier.name, // Fallback if not provided
      phone: supplier.contact,
      email: supplier.email,
      itemsSupplied: supplier.itemsSupplied.join(', '),
      active: true
  };

  const response = await post<SupplierDTO>(ENDPOINT, payload);
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
