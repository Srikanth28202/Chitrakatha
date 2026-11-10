import type { Metadata } from 'next';
import { PaymentResultView } from '@/components/payment/payment-result-view';

export const metadata: Metadata = {
  title: 'Payment status',
  description: 'Check the latest status of your Chitrakatha payment.',
  robots: {
    index: false,
    follow: false,
  },
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function PaymentFailurePage({
  searchParams,
}: {
  searchParams: Promise<{
    orderNumber?: string | string[];
    reason?: string | string[];
    message?: string | string[];
  }>;
}) {
  const query = await searchParams;

  // The payment token is resolved from session storage on the client and is
  // never accepted through the URL.
  return (
    <PaymentResultView
      kind="failure"
      orderNumber={firstValue(query.orderNumber)}
      reason={firstValue(query.reason)}
      message={firstValue(query.message)?.slice(0, 300)}
    />
  );
}
