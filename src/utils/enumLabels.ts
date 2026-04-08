import type { Category, Unit, QualityGrade, OrderStatus, DeliveryStatus, ProductStatus } from '../types';

export const CATEGORY_LABELS: Record<Category, string> = {
  GRAINS: 'Grains',
  VEGETABLES: 'Vegetables',
  FRUITS: 'Fruits',
  DAIRY: 'Dairy',
  MEAT: 'Meat',
  SPICES: 'Spices',
  OTHER: 'Other',
};

export const UNIT_LABELS: Record<Unit, string> = {
  KG: 'kg',
  TON: 'Ton',
  LITER: 'Liter',
  UNIT: 'Unit',
  CRATE: 'Crate',
  BAG: 'Bag',
};

export const QUALITY_GRADE_LABELS: Record<QualityGrade, string> = {
  GRADE_A: 'Grade A',
  GRADE_B: 'Grade B',
  GRADE_C: 'Grade C',
  PREMIUM: 'Premium',
  STANDARD: 'Standard',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Created',
  PENDING_PAYMENT: 'Pending Payment',
  FUNDED: 'Funded',
  CONFIRMED: 'Confirmed',
  IN_DELIVERY: 'In Delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Failed',
  RETURNED: 'Returned',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
};

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  ASSIGNED: 'Assigned',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled',
};

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  AVAILABLE: 'Available',
  LOW_STOCK: 'Low Stock',
  SOLD_OUT: 'Sold Out',
  EXPIRED: 'Expired',
  DISCONTINUED: 'Discontinued',
};
