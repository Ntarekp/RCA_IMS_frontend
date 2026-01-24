/**
 * Custom hook for managing items
 */

import { useEffect, useState } from 'react';
import { getAllItems, createItem, updateItem, deleteItem } from '../api/services/itemService';
import { ItemDTO, CreateItemRequest } from '../api/types';
import { StockItem } from '../types';
import { mapItemDTOToStockItem } from '../utils/mappers';

export const useItems = () => {
  const [items, setItems] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Store last used filters/sorts for refetch
  const [lastParams, setLastParams] = useState<any>({});

  const fetchItems = async (params?: {
    category?: string;
    status?: string;
    name?: string;
    sort?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      setLastParams(params || {});
      const data = await getAllItems(params);
      const mappedItems = data.map(mapItemDTOToStockItem);
      setItems(mappedItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => fetchItems(lastParams);

  const addItem = async (itemData: CreateItemRequest) => {
    try {
      const newItem = await createItem(itemData);
      await refetch(); // Refresh list
      return mapItemDTOToStockItem(newItem);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create item');
    }
  };

  const updateItemById = async (id: number, itemData: Partial<CreateItemRequest>) => {
    try {
      const updated = await updateItem(id, itemData);
      await refetch(); // Refresh list
      return mapItemDTOToStockItem(updated);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update item');
    }
  };

  const removeItem = async (id: number, password?: string) => {
    try {
      await deleteItem(id, password);
      await refetch(); // Refresh list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete item');
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchItems();
    }
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems, // now accepts filters/sorts
    refetch,
    addItem,
    updateItem: updateItemById,
    deleteItem: removeItem,
  };
};
