export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  compare_price?: number;
  cost_price?: number;
  stock: number;
  status: 'draft' | 'published' | 'archived';
  category?: Category;
  categories?: Category[];
  brand?: Brand;
  images: ProductImage[];
  variants: ProductVariant[];
  tags: string[];
  is_featured: boolean;
  short_description?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id?: string;
  url: string;
  is_primary: boolean;
  sort_order?: number;
  alt_text?: string;
}

export interface ProductVariant {
  id?: string;
  product_id?: string;
  sku: string;
  price: number;
  compare_price?: number;
  stock: number;
  attributes: Record<string, string>;
  is_active?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id?: string;
  children?: Category[];
  sort_order: number;
  is_active: boolean;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  order_number: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discount: number;
  shipping_cost: number;
  tax: number;
  status: string;
  payment_status: string;
  shipping_status: string;
  shipping_method?: string;
  shipping_method_name?: string;
  shipping_address?: Address;
  billing_address?: Address;
  shipments?: Shipment[];
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Shipment {
  id: string;
  tracking_number?: string;
  carrier?: string;
  status?: string;
  shipped_at?: string;
  meta_data?: {
    label_url?: string;
    invoice_url?: string;
    shiprocket_order_id?: string;
    shipment_id?: string;
    courier_id?: string;
  };
}

export interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
  meta_data?: Record<string, any>;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  total_orders: number;
  total_spent: number;
  status: string;
  created_at: string;
}

export interface Address {
  id: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  is_default: boolean;
}

export interface Coupon {
  id: string;
  code: string;
  discount_type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  starts_at: string;
  expires_at: string;
  is_active: boolean;
}

export interface Review {
  id: string;
  product_id: string;
  customer: Customer;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

export interface DashboardStats {
  revenue_today: number;
  revenue_month: number;
  orders_today: number;
  orders_pending: number;
  total_customers: number;
  total_products: number;
  low_stock_count: number;
  conversion_rate: number;
  revenue_chart: { date: string; revenue: number }[];
  sales_chart: { date: string; sales: number }[];
  top_products: { id: string; name: string; revenue: number }[];
  latest_orders: Order[];
  inventory_alerts: { product: string; stock: number }[];
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}
