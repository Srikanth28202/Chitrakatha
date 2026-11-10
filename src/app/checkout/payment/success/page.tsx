import type { Metadata } from 'next';
import { PaymentResultView } from '@/components/payment/payment-result-view';

export const metadata: Metadata = {
  title: 'Payment successful',
  description: 'Your Chitrakatha payment has been verified.',
  robots: {
    index: false,
    follow: false,
  },
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderNumber?: string | string[];
  }>;
}) {
  const query = await searchParams;

  // The payment token is resolved from session storage on the client and is
  // never accepted through the URL.
  return (
    <PaymentResultView
      kind="success"
      orderNumber={firstValue(query.orderNumber)}
    />
  );
}
