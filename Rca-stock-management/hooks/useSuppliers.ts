/**
 * Custom hook for managing suppliers
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  getAllSuppliers, 
  getInactiveSuppliers,
  createSupplier, 
  updateSupplier, 
  deleteSupplier, 
  deactivateSupplier as apiDeactivateSupplier,
  reactivateSupplier as apiReactivateSupplier
} from '../api/services/supplierService';
import { Supplier } from '../types';

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [inactiveSuppliers, setInactiveSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [active, inactive] = await Promise.all([
        getAllSuppliers(),
        getInactiveSuppliers()
      ]);
      setSuppliers(active);
      setInactiveSuppliers(inactive);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch suppliers'));
    } finally {
      setLoading(false);
    }
  }, []);

  const addSupplier = useCallback(async (supplierData: Omit<Supplier, 'id'>) => {
    try {
      const newSupplier = await createSupplier(supplierData);
      await fetchSuppliers(); // Refresh list
      return newSupplier;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create supplier');
    }
  }, [fetchSuppliers]);

  const updateSupplierById = useCallback(async (id: string, supplierData: Partial<Supplier>) => {
    try {
      const updated = await updateSupplier(id, supplierData);
      await fetchSuppliers(); // Refresh list
      return updated;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update supplier');
    }
  }, [fetchSuppliers]);

  const deactivateSupplier = useCallback(async (id: string, password: string) => {
    try {
      await apiDeactivateSupplier(id, password);
      await fetchSuppliers(); // Refresh list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to deactivate supplier');
    }
  }, [fetchSuppliers]);

  const reactivateSupplier = useCallback(async (id: string) => {
    try {
      await apiReactivateSupplier(id);
      await fetchSuppliers(); // Refresh list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to reactivate supplier');
    }
  }, [fetchSuppliers]);

  const hardDeleteSupplier = useCallback(async (id: string, password: string) => {
    try {
      await deleteSupplier(id, password);
      await fetchSuppliers(); // Refresh list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete supplier');
    }
  }, [fetchSuppliers]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchSuppliers();
    }
  }, [fetchSuppliers]);

  return {
    suppliers,
    inactiveSuppliers,
    loading,
    error,
    refetch: fetchSuppliers,
    addSupplier,
    updateSupplier: updateSupplierById,
    deactivateSupplier,
    reactivateSupplier,
    hardDeleteSupplier,
  };
};
