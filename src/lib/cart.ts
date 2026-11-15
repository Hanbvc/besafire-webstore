import type { CartItem, Product, ProductVariant } from '../types';

export const MAX_QTY_PER_LINE = 10;

export type CartAction =
  | { type: 'add'; productId: string; variantId: string; qty: number; stock: number }
  | { type: 'setQty'; productId: string; variantId: string; qty: number; stock: number }
  | { type: 'remove'; productId: string; variantId: string }
  | { type: 'clear' };

const sameLine = (a: Pick<CartItem, 'productId' | 'variantId'>, b: typeof a) =>
  a.productId === b.productId && a.variantId === b.variantId;

function clampQty(qty: number, stock: number): number {
  const ceiling = Math.max(0, Math.min(stock, MAX_QTY_PER_LINE));
  return Math.max(0, Math.min(Math.floor(qty), ceiling));
}

export function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const existing = state.find((item) => sameLine(item, action));
      const qty = clampQty((existing?.qty ?? 0) + action.qty, action.stock);
      if (qty === 0) return state;
      const line = { productId: action.productId, variantId: action.variantId, qty };
      return existing
        ? state.map((item) => (sameLine(item, action) ? line : item))
        : [...state, line];
    }
    case 'setQty': {
      const qty = clampQty(action.qty, action.stock);
      if (qty === 0) return state.filter((item) => !sameLine(item, action));
      return state.map((item) => (sameLine(item, action) ? { ...item, qty } : item));
    }
    case 'remove':
      return state.filter((item) => !sameLine(item, action));
    case 'clear':
      return [];
  }
}

/** Storage is user-controlled input: accept only well-formed lines. */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const items: CartItem[] = [];
  for (const entry of raw) {
    if (typeof entry !== 'object' || entry === null) continue;
    const { productId, variantId, qty } = entry as Record<string, unknown>;
    if (typeof productId !== 'string' || typeof variantId !== 'string') continue;
    if (typeof qty !== 'number' || !Number.isInteger(qty) || qty < 1) continue;
    if (items.some((item) => sameLine(item, { productId, variantId }))) continue;
    items.push({ productId, variantId, qty: Math.min(qty, MAX_QTY_PER_LINE) });
  }
  return items;
}

export interface CartLine {
  product: Product;
  variant: ProductVariant;
  qty: number;
  lineTotal: number;
}

/**
 * Joins stored cart items with the live catalogue. Prices and stock always
 * come from the catalogue, never from storage; lines whose product or variant
 * no longer exists (or is sold out) are dropped.
 */
export function resolveCart(items: readonly CartItem[], products: readonly Product[]): CartLine[] {
  const lines: CartLine[] = [];
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === item.variantId);
    if (!product || !variant) continue;
    const qty = clampQty(item.qty, variant.stock);
    if (qty === 0) continue;
    lines.push({ product, variant, qty, lineTotal: qty * variant.price });
  }
  return lines;
}

export const cartSubtotal = (lines: readonly CartLine[]) =>
  lines.reduce((sum, line) => sum + line.lineTotal, 0);

export const cartCount = (lines: readonly CartLine[]) =>
  lines.reduce((sum, line) => sum + line.qty, 0);
