import api from './api';
import { USE_MOCK } from '../mock';
import {
  mockGetCatalog,
  mockGetProduct,
  mockGetFarmerProducts,
  mockCreateProduct,
} from '../mock/mockServices';
import type { CatalogItem, ProductPublicDTO, ProductCreate } from '../types';

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

export function serializeProductPublicDTO(dto: ProductPublicDTO): string {
  return JSON.stringify(dto);
}

export function parseProductPublicDTO(serialized: string): ProductPublicDTO {
  return JSON.parse(serialized) as ProductPublicDTO;
}
