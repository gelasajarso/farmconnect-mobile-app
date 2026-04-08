import { useState, useEffect, useCallback } from 'react';
import type { DeliveryResponse } from '../types';
import { getMyAssignments } from '../services/delivery.service';
import { extractApiError } from '../utils/errorHandling';

export function useDeliveries() {
  const [deliveries, setDeliveries] = useState<DeliveryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMyAssignments();
      setDeliveries(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { deliveries, loading, error, refetch: fetch };
}
