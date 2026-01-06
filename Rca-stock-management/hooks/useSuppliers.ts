/**
 * Custom hook for managing suppliers
 */

import { useEffect, useState } from 'react';
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier, SupplierDTO } from '../api/services/supplierService';
import { Supplier } from '../types';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllSuppliers();
      setSuppliers(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch suppliers'));
    } finally {
      setLoading(false);
    }
  };

  const addSupplier = async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = await createSupplier(supplierData);
      await fetchSuppliers(); // Refresh list
      return newSupplier;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create supplier');
    }
  };

  const updateSupplierById = async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updated = await updateSupplier(id, supplierData);
      await fetchSuppliers(); // Refresh list
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update supplier');
    }
  };

  const deactivateSupplier = async (id: string) => {
    try {
      await deleteSupplier(id);
      await fetchSuppliers(); // Refresh list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to deactivate supplier');
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    addSupplier,
    updateSupplier: updateSupplierById,
    deactivateSupplier,
  };
};
