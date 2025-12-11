// src/types/app.d.ts

export type UserRole = "kid_seller" | "parent_guardian" | "buyer" | "admin";
export type ProductStatus = "draft" | "pending_approval" | "approved" | "rejected" | "active" | "sold_out";
export type ParentApprovalStatus = "pending" | "approved" | "rejected";
export type StorefrontStatus = "draft" | "active" | "inactive";
export type OrderStatus = "pending" | "completed" | "cancelled";
export type PaymentStatus = "succeeded" | "failed";
export type PayoutStatus = "pending" | "processed";

export interface User {
  user_id: string;
  email: string;
  password_hash: string; // In a real app, this would be hashed and never exposed
  display_name: string;
  birthday: string; // YYYY-MM-DD
  role: UserRole;
  parent_id?: string; // FK to User for Kid Sellers (email for mock)
  created_date: string; // ISO date string
  last_modified_date: string; // ISO date string
  email_verified: boolean;
}

export interface Storefront {
  storefront_id: string;
  kid_seller_id: string; // FK to User
  display_name: string;
  description: string;
  shareable_url: string;
  created_date: string; // ISO date string
  last_modified_date: string; // ISO date string
  status: StorefrontStatus;
}

export interface ProductListing {
  product_id: string;
  storefront_id: string; // FK to Storefront
  name: string;
  description: string;
  price: number; // decimal
  quantity_available: number; // integer
  photo_urls: string[];
  size?: string; // New: e.g., "Small", "10x12 inches"
  materials?: string; // New: e.g., "Cotton yarn, plastic beads"
  time_required?: string; // New: e.g., "2 hours to make", "Ships in 3-5 days"
  created_date: string; // ISO date string
  last_modified_date: string; // ISO date string
  status: ProductStatus;
  parent_approval_status: ParentApprovalStatus;
  parent_approved_by_user_id?: string; // FK to User
  parent_approval_date?: string; // ISO date string
  storefront_name?: string; // Added for display convenience
}

export interface CartItem {
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  photo_url: string; // For display in cart
  storefront_display_name: string; // For display in cart
  max_quantity: number; // Max quantity available for this product
}

export interface Order {
  order_id: string;
  buyer_user_id?: string; // FK to User, nullable for guest
  storefront_id: string; // FK to Storefront
  order_date: string; // ISO date string
  total_price: number; // decimal
  status: OrderStatus;
  payment_transaction_id: string; // FK to PaymentTransaction
  items: OrderItem[]; // Embedded for simplicity in mock data
}

export interface OrderItem {
  order_item_id: string;
  order_id: string; // FK to Order
  product_id: string; // FK to Product Listing
  quantity: number; // integer
  unit_price: number; // decimal
}

export interface PaymentTransaction {
  transaction_id: string;
  order_id: string; // FK to Order
  stripe_charge_id: string; // Simulated Stripe ID
  amount: number; // decimal
  currency: string;
  status: PaymentStatus;
  transaction_date: string; // ISO date string
  payout_status: PayoutStatus;
}

export interface AppData {
  users: User[];
  storefronts: Storefront[];
  product_listings: ProductListing[];
  orders: Order[];
  payment_transactions: PaymentTransaction[];
}