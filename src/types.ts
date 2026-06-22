/**
 * Tipos TypeScript para o SDK Alpa
 */

export interface AlpaConfig {
  apiKey: string;
  baseUrl?: string;
  version?: string;
  timeout?: number;
}

export interface PaymentLinkSettings {
  pixEnabled?: boolean;
  boletoEnabled?: boolean;
  creditCardEnabled?: boolean;
  maxInstallments?: number;
  interestFreeInstallments?: number;
  interestRate?: number;
  requirePhone?: boolean;
  requireAddress?: boolean;
}

interface BaseCreatePaymentLinkRequest {
  title: string;
  description?: string;
  currency?: string;
  expiresAt?: Date | string;
  redirectUrl?: string;
  settings?: PaymentLinkSettings;
  status?: 'ACTIVE' | 'INACTIVE';
  metaPixelCode?: string;
  stockQuantity?: number;
  stockEnabled?: boolean;
}

export interface CreatePaymentLinkWithAmountRequest extends BaseCreatePaymentLinkRequest {
  /** Valor em centavos inteiros (ex: 9900 = R$ 99,00) */
  amountCents: number;
  /** @deprecated Use `amountCents`. Mantido como alias por compatibilidade. */
  amount?: number;
  products?: never;
}

export interface CreatePaymentLinkWithProductsRequest extends BaseCreatePaymentLinkRequest {
  /** Valor em centavos inteiros (opcional quando há `products`). */
  amountCents?: number;
  /** @deprecated Use `amountCents`. */
  amount?: number;
  products: Array<{
    productId: string;
    quantity: number;
  }>;
}

export type CreatePaymentLinkRequest =
  | CreatePaymentLinkWithAmountRequest
  | CreatePaymentLinkWithProductsRequest;

export interface UpdatePaymentLinkRequest {
  title?: string;
  description?: string;
  /** Valor em centavos inteiros (ex: 9900 = R$ 99,00) */
  amountCents?: number;
  /** @deprecated Use `amountCents`. */
  amount?: number;
  status?: 'ACTIVE' | 'INACTIVE';
  expiresAt?: Date | string;
  redirectUrl?: string;
  settings?: PaymentLinkSettings;
}

export interface PaymentLink {
  id: string;
  /** URL pública do checkout (ex: https://checkout.usealpa.com/pay/abc123). */
  url?: string;
  slug?: string;
  title: string;
  description?: string;
  /** Valor em centavos inteiros (ex: 9900 = R$ 99,00) */
  amountCents: number;
  /** @deprecated Campo legado; use `amountCents`. */
  amount?: number;
  currency?: string;
  status: 'ACTIVE' | 'INACTIVE';
  expiresAt?: string;
  redirectUrl?: string;
  createdAt: string;
  updatedAt: string;
  settings?: PaymentLinkSettings;
  products?: Array<{
    productId: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      price: number;
    };
  }>;
}

export interface CreateTransactionRequest {
  product: string;
  amountCents: number;
  paymentMethod?: 'PIX' | 'CARD' | 'BOLETO';
  /** Dados do cliente (campos planos — formato canônico). */
  clientName?: string;
  clientEmail?: string;
  clientDocument?: string;
  clientPhone?: string;
  paymentLinkId?: string;
  installments?: number;
  dueDate?: Date | string;
  metadata?: Record<string, unknown>;
  couponCode?: string;
}

export interface Transaction {
  id: string;
  displayId?: string;
  product?: string;
  amountCents: number;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED' | 'CHARGEBACK';
  paymentMethod: string;
  clientName?: string;
  clientEmail?: string;
  clientDocument?: string;
  clientPhone?: string;
  paymentLink?: {
    id: string;
    title: string;
    slug: string;
  };
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  /** Código PIX copia-e-cola (quando paymentMethod = PIX). */
  pixCopiaECola?: string;
  /** Expiração do PIX. */
  pixExpiresAt?: string;
  boletoBarcode?: string;
  boletoUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  /** Preço em centavos inteiros (ex: 9900 = R$ 99,00). */
  price: number;
  stockQuantity?: number;
  stockEnabled?: boolean;
  isDigital?: boolean;
  imageUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
  stockEnabled?: boolean;
  isDigital?: boolean;
  imageUrl?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface ValidateCouponRequest {
  code: string;
  amountCents: number;
  paymentLinkId?: string;
  productIds?: string[]; // Product IDs to resolve coupon ambiguity
}

export interface CouponValidation {
  valid: boolean;
  discountCents?: number;
  discountPercentage?: number;
  finalAmountCents?: number;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNext?: boolean;
    hasPrevious?: boolean;
    cursor?: string;
    nextCursor?: string;
  };
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface WebhookEvent {
  id: string;
  type: string;
  data: any;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  document?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  document?: string;
  phone?: string;
}

// ─── Coupons ───────────────────────────────────────────────────────────────

export interface Coupon {
  id: string;
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses?: number;
  usedCount: number;
  expiresAt?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCouponRequest {
  code: string;
  discountType: 'PERCENTAGE' | 'FIXED';
  discountValue: number;
  maxUses?: number;
  expiresAt?: Date | string;
}

// ─── Subscriptions ─────────────────────────────────────────────────────────

export type SubscriptionStatus = 'ACTIVE' | 'CANCELLED' | 'PAUSED' | 'PAST_DUE' | 'TRIALING';
export type SubscriptionInterval = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface CreateSubscriptionRequest {
  planId: string;
  clientId?: string;
  client?: {
    name: string;
    email: string;
    document?: string;
    phone?: string;
  };
  paymentMethod?: 'CREDIT_CARD' | 'PIX' | 'BOLETO';
  couponCode?: string;
  metadata?: Record<string, unknown>;
}

export interface Subscription {
  id: string;
  status: SubscriptionStatus;
  planId: string;
  plan?: {
    id: string;
    name: string;
    amountCents: number;
    interval: SubscriptionInterval;
    intervalCount: number;
  };
  clientId?: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  cancelledAt?: string;
  pausedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SubscriptionMetrics {
  totalActive: number;
  totalCancelled: number;
  totalPaused: number;
  mrr: number;
  churnRate?: number;
}

// ─── Checkouts ─────────────────────────────────────────────────────────────

export interface CreateCheckoutRequest {
  name: string;
  paymentLinkId?: string;
  settings?: {
    pixEnabled?: boolean;
    boletoEnabled?: boolean;
    creditCardEnabled?: boolean;
    maxInstallments?: number;
    requirePhone?: boolean;
    requireAddress?: boolean;
    showOrderBumps?: boolean;
  };
  customization?: {
    primaryColor?: string;
    logoUrl?: string;
    backgroundUrl?: string;
  };
}

export interface Checkout {
  id: string;
  name: string;
  paymentLinkId?: string;
  settings?: CreateCheckoutRequest['settings'];
  customization?: CreateCheckoutRequest['customization'];
  createdAt: string;
  updatedAt: string;
}

// ─── Offers ────────────────────────────────────────────────────────────────

export interface CreateOrderBumpRequest {
  productId: string;
  title?: string;
  description?: string;
  discountCents?: number;
  discountPercentage?: number;
  position?: number;
}

export interface OrderBump {
  id: string;
  checkoutId: string;
  productId: string;
  title?: string;
  description?: string;
  discountCents?: number;
  discountPercentage?: number;
  position: number;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpsellRequest {
  productId: string;
  title?: string;
  description?: string;
  discountCents?: number;
  discountPercentage?: number;
}

export interface Upsell {
  id: string;
  checkoutId: string;
  productId: string;
  title?: string;
  description?: string;
  discountCents?: number;
  discountPercentage?: number;
  downsell?: Downsell;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DownsellRequest {
  productId: string;
  title?: string;
  description?: string;
  discountCents?: number;
  discountPercentage?: number;
}

export interface Downsell {
  id: string;
  productId: string;
  title?: string;
  description?: string;
  discountCents?: number;
  discountPercentage?: number;
  product?: {
    id: string;
    name: string;
    price: number;
  };
  createdAt: string;
  updatedAt: string;
}

// ─── Withdrawals ───────────────────────────────────────────────────────────

export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface CreateWithdrawalRequest {
  amountCents: number;
  pixKey?: string;
  bankAccount?: {
    bank: string;
    agency: string;
    account: string;
    accountType: 'CHECKING' | 'SAVINGS';
    document: string;
    name: string;
  };
}

export interface Withdrawal {
  id: string;
  amountCents: number;
  status: WithdrawalStatus;
  pixKey?: string;
  bankAccount?: CreateWithdrawalRequest['bankAccount'];
  processedAt?: string;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalBalance {
  availableCents: number;
  pendingCents: number;
  totalCents: number;
}

// ─── Wallet ────────────────────────────────────────────────────────────────

export interface WalletSummary {
  balanceCents: number;
  pendingCents: number;
  totalReceivedCents: number;
  totalWithdrawnCents: number;
}

export interface WalletEntry {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amountCents: number;
  description: string;
  balanceAfterCents: number;
  createdAt: string;
  reference?: {
    type: string;
    id: string;
  };
}
