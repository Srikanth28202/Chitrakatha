import type {
  CheckoutAddress,
  CheckoutCustomer,
  CheckoutLine,
  CheckoutTotals,
} from './checkout';
import type { OrderStatus, PaymentStatus } from '@/models/Order';
import type { PaymentRecordStatus } from '@/models/Payment';

export interface PaymentInitRequest {
  orderNumber: string;
  paymentToken: string;
}

export interface PaymentInitResponse {
  keyId: string;
  razorpayOrderId: string;
  orderNumber: string;
  amount: number;
  currency: string;
  description: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  existing: boolean;
}

export interface PaymentVerifyRequest extends PaymentInitRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface PaymentVerificationResult {
  orderNumber: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  paymentRecordStatus: PaymentRecordStatus;
  providerPaymentId: string;
  alreadyProcessed: boolean;
}

export interface PublicPaymentStatus {
  orderNumber: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  items: CheckoutLine[];
  totals: CheckoutTotals;
  customer: CheckoutCustomer;
  address: CheckoutAddress;
  createdAt: string;
  payment: {
    recordStatus: PaymentRecordStatus | null;
    providerPaymentId?: string;
    verifiedAt?: string;
    failureReason?: string;
  };
}
