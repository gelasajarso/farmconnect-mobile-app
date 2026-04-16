import { useState, useEffect, useCallback } from 'react';
import type { OrderDTO } from '../types';
import { getOrders } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';

/**
 * Fetches orders and optionally filters client-side by a user ID.
 * Pass `filterById` + `filterField` to scope results to a specific
 * merchant or farmer without requiring separate API endpoints.
 */
export function useOrders(options?: {
  filterField?: 'merchant_id' | 'farmer_id';
  filterById?: string | null;
}) {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      const { filterField, filterById } = options ?? {};
      const filtered =
        filterField && filterById
          ? data.filter(o => o[filterField] === filterById)
          : data;
      setOrders(filtered);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [options?.filterField, options?.filterById]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, error, refetch: fetch };
}
