export interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  quantity: number;
  minStock: number;
  price: number;
  description?: string;
  supplier?: string;
  imageUrl?: string;
  notes?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StockHistoryEntry {
  id: string;
  productId: string;
  productName: string;
  previousQuantity: number;
  newQuantity: number;
  quantityChange: number;
  changeAmount?: number;
  changeType?: 'increase' | 'decrease' | 'set';
  type: 'restock' | 'sale' | 'adjustment' | 'addition' | 'removal';
  reason?: string;
  date: Date | string;
  timestamp?: Date | string;
  notes?: string;
  userId?: string;
  userName?: string;
}

export interface ProductFilter {
  searchTerm: string;
  category: string;
  stockStatus: StockStatus | 'all';
}

export type StockStatus = 'critical' | 'low' | 'sufficient';

export interface StockThresholds {
  critical: number;
  low: number;
}

export const DEFAULT_STOCK_THRESHOLDS: StockThresholds = {
  critical: 0,
  low: 10
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Clothing',
  'Food & Beverages',
  'Office Supplies',
  'Furniture',
  'Tools & Hardware',
  'Health & Beauty',
  'Sports & Outdoors',
  'Other'
];
