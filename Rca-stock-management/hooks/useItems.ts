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

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllItems();
      const mappedItems = data.map(mapItemDTOToStockItem);
      setItems(mappedItems);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch items'));
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (itemData: CreateItemRequest) => {
    try {
      const newItem = await createItem(itemData);
      await fetchItems(); // Refresh list
      return mapItemDTOToStockItem(newItem);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create item');
    }
  };

  const updateItemById = async (id: number, itemData: Partial<CreateItemRequest>) => {
    try {
      const updated = await updateItem(id, itemData);
      await fetchItems(); // Refresh list
      return mapItemDTOToStockItem(updated);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update item');
    }
  };

  const removeItem = async (id: number) => {
    try {
      await deleteItem(id);
      await fetchItems(); // Refresh list
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete item');
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    addItem,
    updateItem: updateItemById,
    deleteItem: removeItem,
  };
};

