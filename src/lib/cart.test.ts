import { describe, expect, it } from 'vitest';
import {
  cartCount,
  cartReducer,
  cartSubtotal,
  MAX_QTY_PER_LINE,
  resolveCart,
  sanitizeCart,
} from './cart';
import type { CartItem, Product } from '../types';

const line = (productId: string, variantId: string, qty: number): CartItem => ({ productId, variantId, qty });

const products: Product[] = [
  {
    id: 'p1',
    slug: 'p1',
    name: 'Signature Square – Maroon',
    collectionId: 'signature',
    color: { name: 'Maroon', family: 'Merah', hex: '#7a1f2b' },
    description: '',
    details: [],
    images: [],
    variants: [
      { id: 'v1', sku: 'S1', label: 'Scarf', price: 325_000, stock: 3 },
      { id: 'v2', sku: 'S2', label: 'Scarf + Gift Box', price: 395_000, stock: 0 },
    ],
    createdAt: '2026-01-01T00:00:00.000Z',
  },
];

describe('cartReducer', () => {
  it('adds a new line and merges repeat adds of the same variant', () => {
    let state = cartReducer([], { type: 'add', productId: 'p1', variantId: 'v1', qty: 1, stock: 5 });
    state = cartReducer(state, { type: 'add', productId: 'p1', variantId: 'v1', qty: 2, stock: 5 });
    state = cartReducer(state, { type: 'add', productId: 'p1', variantId: 'v2', qty: 1, stock: 5 });
    expect(state).toEqual([line('p1', 'v1', 3), line('p1', 'v2', 1)]);
  });

  it('never exceeds available stock or the per-line cap', () => {
    const limited = cartReducer([line('p1', 'v1', 2)], {
      type: 'add', productId: 'p1', variantId: 'v1', qty: 5, stock: 3,
    });
    expect(limited).toEqual([line('p1', 'v1', 3)]);

    const capped = cartReducer([], { type: 'add', productId: 'p1', variantId: 'v1', qty: 99, stock: 500 });
    expect(capped[0]?.qty).toBe(MAX_QTY_PER_LINE);
  });

  it('ignores adds for sold-out variants and non-positive quantities', () => {
    const state = [line('p1', 'v1', 1)];
    expect(cartReducer(state, { type: 'add', productId: 'p1', variantId: 'v2', qty: 1, stock: 0 })).toBe(state);
    expect(cartReducer([], { type: 'add', productId: 'p1', variantId: 'v1', qty: 0, stock: 5 })).toEqual([]);
    expect(cartReducer([], { type: 'add', productId: 'p1', variantId: 'v1', qty: -2, stock: 5 })).toEqual([]);
  });

  it('sets quantity, removing the line when it drops to zero', () => {
    const state = [line('p1', 'v1', 2), line('p1', 'v2', 1)];
    expect(cartReducer(state, { type: 'setQty', productId: 'p1', variantId: 'v1', qty: 9, stock: 4 })).toEqual([
      line('p1', 'v1', 4),
      line('p1', 'v2', 1),
    ]);
    expect(cartReducer(state, { type: 'setQty', productId: 'p1', variantId: 'v1', qty: 0, stock: 4 })).toEqual([
      line('p1', 'v2', 1),
    ]);
  });

  it('removes a single line and clears everything', () => {
    const state = [line('p1', 'v1', 2), line('p1', 'v2', 1)];
    expect(cartReducer(state, { type: 'remove', productId: 'p1', variantId: 'v2' })).toEqual([line('p1', 'v1', 2)]);
    expect(cartReducer(state, { type: 'clear' })).toEqual([]);
  });
});

describe('sanitizeCart', () => {
  it('rejects anything that is not a list of well-formed lines', () => {
    expect(sanitizeCart(null)).toEqual([]);
    expect(sanitizeCart('[]')).toEqual([]);
    expect(sanitizeCart({ productId: 'p1' })).toEqual([]);
    expect(
      sanitizeCart([
        null,
        'x',
        { productId: 'p1', variantId: 'v1', qty: 2 },
        { productId: 'p1', variantId: 'v1', qty: 1 }, // duplicate line
        { productId: 'p1', variantId: 'v2', qty: 1.5 },
        { productId: 'p1', variantId: 'v2', qty: -1 },
        { productId: 7, variantId: 'v2', qty: 1 },
        { productId: 'p1', variantId: 'v3', qty: 500, price: 1 },
      ]),
    ).toEqual([line('p1', 'v1', 2), line('p1', 'v3', MAX_QTY_PER_LINE)]);
  });
});

describe('resolveCart', () => {
  it('prices lines from the catalogue and drops unknown or sold-out entries', () => {
    const lines = resolveCart(
      [line('p1', 'v1', 5), line('p1', 'v2', 1), line('p1', 'gone', 1), line('gone', 'v1', 1)],
      products,
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatchObject({ qty: 3, lineTotal: 975_000 });
    expect(cartSubtotal(lines)).toBe(975_000);
    expect(cartCount(lines)).toBe(3);
  });

  it('returns an empty cart while the catalogue is still loading', () => {
    expect(resolveCart([line('p1', 'v1', 1)], [])).toEqual([]);
  });
});
