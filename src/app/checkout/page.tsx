import type { Metadata } from 'next';
import { CheckoutView } from '@/components/checkout/checkout-view';

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Complete your Chitrakatha order with a Karnataka delivery address. Guest checkout with server-verified pricing and coupons.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutPage() {
  return <CheckoutView />;
}
