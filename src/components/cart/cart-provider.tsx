'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CART_LIMITS, STORAGE_KEYS } from '@/config/constants';
import type { CartItem, CartLanguage } from '@/types/cart';

export type CartMutationResult =
  | { ok: true }
  | { ok: false; reason: 'invalid' | 'quantity_limit' | 'cart_limit' };

interface CartContextValue {
  items: CartItem[];
  isReady: boolean;
  totalQuantity: number;
  addItem: (input: {
    slug: string;
    language: CartLanguage;
    quantity?: number;
  }) => CartMutationResult;
  updateQuantity: (slug: string, language: CartLanguage, quantity: number) => void;
  removeItem: (slug: string, language: CartLanguage) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const VALID_LANGUAGES: CartLanguage[] = ['kannada', 'english', 'bilingual'];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isCartLanguage(value: unknown): value is CartLanguage {
  return typeof value === 'string' && VALID_LANGUAGES.includes(value as CartLanguage);
}

function sanitizeQuantity(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return Math.min(parsed, CART_LIMITS.MAX_QUANTITY_PER_ITEM);
}

function sanitizeItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];

  const merged = new Map<string, CartItem>();

  for (const candidate of value) {
    if (!candidate || typeof candidate !== 'object') continue;

    const record = candidate as Record<string, unknown>;
    const slug = typeof record.slug === 'string' ? record.slug.trim().toLowerCase() : '';
    const language = record.language;
    const quantity = sanitizeQuantity(record.quantity);

    if (!SLUG_PATTERN.test(slug) || !isCartLanguage(language) || quantity === null) {
      continue;
    }

    const key = `${slug}::${language}`;
    const existing = merged.get(key);
    const nextQuantity = Math.min(
      (existing?.quantity ?? 0) + quantity,
      CART_LIMITS.MAX_QUANTITY_PER_ITEM
    );

    merged.set(key, {
      slug,
      language,
      quantity: nextQuantity,
    });
  }

  return Array.from(merged.values()).slice(0, CART_LIMITS.MAX_ITEMS);
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isReady, setIsReady] = useState(false);

  // Mirror of `items` that is always current, even between renders, so
  // synchronous mutation results (e.g. rapid consecutive addItem calls)
  // are computed against the latest state instead of a stale closure.
  const itemsRef = React.useRef<CartItem[]>([]);

  const commitItems = useCallback((next: CartItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CART);
      if (stored) {
        commitItems(sanitizeItems(JSON.parse(stored)));
      }
    } catch {
      // Ignore unavailable or malformed storage.
    } finally {
      setIsReady(true);
    }
  }, [commitItems]);

  useEffect(() => {
    if (!isReady) return;

    try {
      localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(items));
    } catch {
      // Storage may be unavailable in private or restricted browsing modes.
    }
  }, [items, isReady]);

  const addItem = useCallback<CartContextValue['addItem']>(
    ({ slug, language, quantity = 1 }) => {
      const normalizedSlug = slug.trim().toLowerCase();
      const normalizedQuantity = sanitizeQuantity(quantity);

      if (!SLUG_PATTERN.test(normalizedSlug) || !isCartLanguage(language) || !normalizedQuantity) {
        return { ok: false, reason: 'invalid' };
      }

      const currentItems = itemsRef.current;
      const existingIndex = currentItems.findIndex(
        (item) => item.slug === normalizedSlug && item.language === language
      );

      if (existingIndex === -1 && currentItems.length >= CART_LIMITS.MAX_ITEMS) {
        return { ok: false, reason: 'cart_limit' };
      }

      if (existingIndex === -1) {
        commitItems([
          ...currentItems,
          {
            slug: normalizedSlug,
            language,
            quantity: normalizedQuantity,
          },
        ]);
        return { ok: true };
      }

      const existing = currentItems[existingIndex];
      const nextQuantity = existing.quantity + normalizedQuantity;

      if (nextQuantity > CART_LIMITS.MAX_QUANTITY_PER_ITEM) {
        return { ok: false, reason: 'quantity_limit' };
      }

      commitItems(
        currentItems.map((item, index) =>
          index === existingIndex ? { ...item, quantity: nextQuantity } : item
        )
      );

      return { ok: true };
    },
    [commitItems]
  );

  const updateQuantity = useCallback(
    (slug: string, language: CartLanguage, quantity: number) => {
      const nextQuantity = sanitizeQuantity(quantity);

      if (nextQuantity === null) {
        commitItems(
          itemsRef.current.filter((item) => !(item.slug === slug && item.language === language))
        );
        return;
      }

      commitItems(
        itemsRef.current.map((item) =>
          item.slug === slug && item.language === language
            ? { ...item, quantity: nextQuantity }
            : item
        )
      );
    },
    [commitItems]
  );

  const removeItem = useCallback(
    (slug: string, language: CartLanguage) => {
      commitItems(itemsRef.current.filter((item) => !(item.slug === slug && item.language === language)));
    },
    [commitItems]
  );

  const clearCart = useCallback(() => {
    commitItems([]);
  }, [commitItems]);

  const totalQuantity = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      isReady,
      totalQuantity,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [items, isReady, totalQuantity, addItem, updateQuantity, removeItem, clearCart]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
}
