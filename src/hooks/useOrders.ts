import { useState, useEffect, useCallback } from 'react';
import type { OrderDTO } from '../types';
import { getOrders } from '../services/order.service';
import { extractApiError } from '../utils/errorHandling';

export function useOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { orders, loading, error, refetch: fetch };
}
