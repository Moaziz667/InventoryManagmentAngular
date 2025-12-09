/**
 * PRODUCT INTERFACE
 * Represents a single product in the inventory
 */
export interface Product {
  id: string;                          // Unique product ID
  name: string;                        // Product name
  category: string;                    // Category (Electronics, Furniture, etc.)
  sku: string;                         // Stock Keeping Unit (unique code)
  quantity: number;                    // Current quantity in stock
  minStock: number;                    // Alert level when stock gets low
  price: number;                       // Unit price
  description?: string;                // Product description (optional)
  supplier?: string;                   // Supplier name (optional)
  imageUrl?: string;                   // Product image URL (optional)
  notes?: string;                      // Additional notes (optional)
  createdAt: Date | string;            // When product was added
  updatedAt: Date | string;            // Last update timestamp
}

/**
 * STOCK HISTORY ENTRY INTERFACE
 * Records every change to product quantities
 * Helps track what changed, when, and why
 */
export interface StockHistoryEntry {
  id: string;                          // Unique history entry ID
  productId: string;                   // Which product was changed
  productName: string;                 // Product name (for easy reference)
  previousQuantity: number;            // Stock before change
  newQuantity: number;                 // Stock after change
  quantityChange: number;              // How much changed (can be positive or negative)
  changeAmount?: number;               // Absolute change amount
  changeType?: 'increase' | 'decrease' | 'set'; // Type of change
  type: 'restock' | 'sale' | 'adjustment' | 'addition' | 'removal'; // Reason for change
  reason?: string;                     // Detailed reason (optional)
  date: Date | string;                 // When it changed
  timestamp?: Date | string;           // Timestamp for sorting
  notes?: string;                      // Additional notes (optional)
  userId?: string;                     // Who made the change (optional)
  userName?: string;                   // Name of user who made the change (optional)
}

/**
 * PRODUCT FILTER INTERFACE
 * Used to filter products by search, category, and stock status
 */
export interface ProductFilter {
  searchTerm: string;                  // Search by product name or SKU
  category: string;                    // Filter by category ('all' or specific category)
  stockStatus: StockStatus | 'all';    // Filter by stock level ('all', 'critical', 'low', or 'sufficient')
}

/**
 * STOCK STATUS TYPE
 * - 'critical': Out of stock (quantity = 0)
 * - 'low': Below minimum stock level
 * - 'sufficient': Adequate stock available
 */
export type StockStatus = 'critical' | 'low' | 'sufficient';

/**
 * STOCK THRESHOLDS INTERFACE
 * Defines alert levels for low stock warnings
 */
export interface StockThresholds {
  critical: number;  // Quantity = 0
  low: number;       // Quantity below this number triggers "low stock" warning
}

// Default thresholds used throughout the app
export const DEFAULT_STOCK_THRESHOLDS: StockThresholds = {
  critical: 0,       // No stock
  low: 10            // Alert when 10 or fewer units
};

/**
 * PRODUCT CATEGORIES
 * All available categories for organizing products
 * Users can filter inventory by these categories
 */
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

