import { useState, useEffect, useCallback } from 'react';
import type { CatalogItem, ProductPublicDTO } from '../types';
import { getCatalog, getProduct, getFarmerProducts } from '../services/product.service';
import { extractApiError } from '../utils/errorHandling';

export function useCatalog() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCatalog();
      setProducts(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}

export function useProductDetail(productId: string) {
  const [product, setProduct] = useState<ProductPublicDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProduct(productId);
      setProduct(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { product, loading, error, refetch: fetch };
}

export function useFarmerProducts(farmerId: string | null) {
  const [products, setProducts] = useState<ProductPublicDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    if (!farmerId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getFarmerProducts(farmerId);
      setProducts(data);
    } catch (err) {
      setError(extractApiError(err).message);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => { fetch(); }, [fetch]);

  return { products, loading, error, refetch: fetch };
}
