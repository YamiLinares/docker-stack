/**
 * Tipos basados en los recursos REALES de la API Laravel 12
 * (app/Http/Resources/*Resource.php y la especificación OpenAPI).
 * Los importes llegan como texto decimal ("149.99") para no perder precisión.
 */

export interface Product {
  id: number;
  sku: string;
  name: string;
  description: string | null;
  price: string;
  stock: number;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PaginationMeta {
  current_page: number;
  from: number | null;
  last_page: number;
  per_page: number;
  to: number | null;
  total: number;
}

export interface Paginated<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: "customer" | "admin";
  created_at: string | null;
  updated_at: string | null;
}

/** POST /auth/login y /auth/register */
export interface AuthTokenResponse {
  data: {
    access_token: string;
    token_type: "bearer";
    expires_in: number;
    user: User;
  };
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "processing" | "succeeded" | "failed" | "canceled";

export interface OrderItem {
  id: number;
  product_id: number | null;
  product_name: string;
  product_sku: string;
  unit_price: string;
  quantity: number;
  subtotal: string;
}

export interface Payment {
  id: number;
  order_id: number;
  provider: string;
  stripe_payment_intent_id: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  failure_message: string | null;
  paid_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Order {
  id: number;
  user_id: number;
  status: OrderStatus;
  currency: string;
  subtotal: string;
  total: string;
  items_count?: number;
  items?: OrderItem[];
  payments?: Payment[];
  paid_at: string | null;
  cancelled_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

/** POST /orders/{order}/payments */
export interface PaymentStartResponse {
  data: {
    payment: Payment;
    client_secret: string | null;
    publishable_key: string | null;
  };
  message: string;
}

/** Formato uniforme de error de la API: {"message", "code", "errors"?}. */
export interface ApiErrorBody {
  message?: string;
  code?: string;
  errors?: Record<string, string[] | string | number> | undefined;
}
