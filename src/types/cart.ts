export type CartLanguage = 'kannada' | 'english' | 'bilingual';

export interface CartItem {
  slug: string;
  language: CartLanguage;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
