import type { OrderStatus, PaymentStatus } from '@/models/types';
import type { CartLanguage, CartItem } from './cart';

export type CheckoutCouponDiscountType = 'percentage' | 'flat';

export interface CheckoutLine {
  editionId: string;
  slug: string;
  titleEn: string;
  titleKn: string;
  coverUrl: string;
  language: CartLanguage;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  stock: number;
  maxQuantity: number;
}

export interface CheckoutTotals {
  basePrice: number;
  discountAmount: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
}

export interface CheckoutCouponResult {
  code: string;
  valid: boolean;
  discountType: CheckoutCouponDiscountType | null;
  discountValue: number;
  discountAmount: number;
  message?: string;
}

export interface CheckoutServiceability {
  pincode: string;
  serviceable: boolean;
  message?: string;
}

export interface CheckoutShippingSummary {
  freeShippingThreshold: number;
  standardFee: number;
  freeShippingApplied: boolean;
}

export interface CheckoutQuote {
  items: CheckoutLine[];
  totals: CheckoutTotals;
  coupon: CheckoutCouponResult | null;
  serviceability: CheckoutServiceability | null;
  shipping: CheckoutShippingSummary;
}

export interface QuoteRequestInput {
  items: CartItem[];
  pincode?: string;
  couponCode?: string;
  email?: string;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
}

export interface CheckoutAddress {
  line1: string;
  line2?: string;
  city: string;
  state: 'Karnataka';
  postalCode: string;
  country: 'India';
}

export interface PendingOrderRequest {
  items: CartItem[];
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  couponCode?: string;
  idempotencyKey: string;
}

export interface PendingOrderSummary {
  orderNumber: string;
  /**
   * Real order/payment statuses. Idempotent retries can return an order
   * that moved on (e.g. already captured), so the summary must not pretend
   * every returned order is fresh and pending.
   */
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentToken: string;
  items: CheckoutLine[];
  totals: CheckoutTotals;
  couponCode?: string;
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  createdAt: string;
  duplicate: boolean;
}
