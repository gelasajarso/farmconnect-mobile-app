import api from './api';
import { USE_MOCK } from '../mock';
import {
  mockGetCatalog,
  mockGetProduct,
  mockGetFarmerProducts,
  mockCreateProduct,
  mockUpdateProduct,
  mockDeleteProduct,
} from '../mock/mockServices';
import type { CatalogItem, ProductPublicDTO, ProductCreate, ProductUpdate } from '../types';

export async function getCatalog(): Promise<CatalogItem[]> {
  if (USE_MOCK) return mockGetCatalog();
  const { data } = await api.get<CatalogItem[]>('/products/catalog');
  return data;
}

export async function getProduct(productId: string): Promise<ProductPublicDTO> {
  if (USE_MOCK) return mockGetProduct(productId);
  const { data } = await api.get<ProductPublicDTO>(`/products/${productId}`);
  return data;
}

export async function getFarmerProducts(farmerId: string): Promise<ProductPublicDTO[]> {
  if (USE_MOCK) return mockGetFarmerProducts(farmerId);
  const { data } = await api.get<ProductPublicDTO[]>(`/products/farmer/${farmerId}`);
  return data;
}

export async function createProduct(productData: ProductCreate): Promise<ProductPublicDTO> {
  if (USE_MOCK) return mockCreateProduct(productData);
  const { data } = await api.post<ProductPublicDTO>('/products', productData);
  return data;
}

/** Farmer only — ownership enforced in mock and backend */
export async function updateProduct(
  productId: string,
  farmerId: string,
  updates: ProductUpdate,
): Promise<ProductPublicDTO> {
  if (USE_MOCK) return mockUpdateProduct(productId, farmerId, updates);
  const { data } = await api.patch<ProductPublicDTO>(`/products/${productId}`, updates);
  return data;
}

/** Farmer only — ownership enforced in mock and backend */
export async function deleteProduct(
  productId: string,
  farmerId: string,
): Promise<void> {
  if (USE_MOCK) return mockDeleteProduct(productId, farmerId);
  await api.delete(`/products/${productId}`);
}

export function serializeProductPublicDTO(dto: ProductPublicDTO): string {
  return JSON.stringify(dto);
}

export function parseProductPublicDTO(serialized: string): ProductPublicDTO {
  return JSON.parse(serialized) as ProductPublicDTO;
}
