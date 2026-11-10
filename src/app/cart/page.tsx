import type { Metadata } from 'next';
import { CartView } from '@/components/cart/cart-view';

export const metadata: Metadata = {
  title: 'Shopping Cart',
  description:
    'Review your Chitrakatha edition selections, adjust quantities and proceed to secure bilingual checkout.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return <CartView />;
}
