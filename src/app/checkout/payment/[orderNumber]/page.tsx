import type { Metadata } from 'next';
import { PaymentView } from '@/components/payment/payment-view';

export const metadata: Metadata = {
  title: 'Pay for your order',
  description:
    'Complete your pending Chitrakatha order securely with Razorpay. Payment amounts are server-verified.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CheckoutPaymentPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  // The payment access token is intentionally NOT accepted from the URL. It
  // is resolved from session storage on the client so it never leaks into
  // browser history, logs, or shared links.
  return <PaymentView orderNumber={orderNumber} />;
}
