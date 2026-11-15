import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
  type ReactNode,
} from 'react';
import {
  cartCount,
  cartReducer,
  cartSubtotal,
  resolveCart,
  sanitizeCart,
  type CartLine,
} from '../lib/cart';
import { listProducts } from '../lib/catalog';
import { readJson, writeJson } from '../lib/storage';
import { useAsync } from '../lib/useAsync';
import type { Product, ProductVariant } from '../types';

const STORAGE_KEY = 'besafire.cart.v1';

interface CartContextValue {
  lines: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  add: (product: Product, variant: ProductVariant, qty?: number) => void;
  setQty: (line: CartLine, qty: number) => void;
  remove: (line: CartLine) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, dispatch] = useReducer(cartReducer, undefined, () =>
    sanitizeCart(readJson(STORAGE_KEY)),
  );
  const [isOpen, setOpen] = useState(false);
  // Lines are priced from the live catalogue, not from what was stored.
  const { data: products } = useAsync(() => listProducts(), []);

  useEffect(() => {
    writeJson(STORAGE_KEY, items);
  }, [items]);

  const lines = useMemo(() => resolveCart(items, products ?? []), [items, products]);

  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);

  const add = useCallback((product: Product, variant: ProductVariant, qty = 1) => {
    dispatch({ type: 'add', productId: product.id, variantId: variant.id, qty, stock: variant.stock });
    setOpen(true);
  }, []);

  const setQty = useCallback((line: CartLine, qty: number) => {
    dispatch({
      type: 'setQty',
      productId: line.product.id,
      variantId: line.variant.id,
      qty,
      stock: line.variant.stock,
    });
  }, []);

  const remove = useCallback((line: CartLine) => {
    dispatch({ type: 'remove', productId: line.product.id, variantId: line.variant.id });
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: cartCount(lines),
      subtotal: cartSubtotal(lines),
      isOpen,
      open,
      close,
      add,
      setQty,
      remove,
    }),
    [lines, isOpen, open, close, add, setQty, remove],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
