import api from './api';
import type { CatalogItem, ProductPublicDTO, ProductCreate } from '../types';

export async function getCatalog(): Promise<CatalogItem[]> {
  const { data } = await api.get<CatalogItem[]>('/products/catalog');
  return data;
}

export async function getProduct(productId: string): Promise<ProductPublicDTO> {
  const { data } = await api.get<ProductPublicDTO>(`/products/${productId}`);
  return data;
}

export async function getFarmerProducts(farmerId: string): Promise<ProductPublicDTO[]> {
  const { data } = await api.get<ProductPublicDTO[]>(`/products/farmer/${farmerId}`);
  return data;
}

export async function createProduct(productData: ProductCreate): Promise<ProductPublicDTO> {
  const { data } = await api.post<ProductPublicDTO>('/products', productData);
  return data;
}

/**
 * Serialize a ProductPublicDTO to a human-readable string.
 * Used for the round-trip property test (Property 12).
 */
export function serializeProductPublicDTO(dto: ProductPublicDTO): string {
  return JSON.stringify(dto);
}

/**
 * Parse a serialized ProductPublicDTO string back to an object.
 */
export function parseProductPublicDTO(serialized: string): ProductPublicDTO {
  return JSON.parse(serialized) as ProductPublicDTO;
}
