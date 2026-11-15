import { describe, expect, it } from 'vitest';
import {
  colorFamiliesOf,
  defaultVariant,
  getProductBySlug,
  hasPriceRange,
  isInStock,
  listProducts,
  minPrice,
  queryProducts,
} from './catalog';
import type { Product } from '../types';

function product(overrides: Partial<Product> & Pick<Product, 'id'>): Product {
  return {
    slug: overrides.id,
    name: overrides.id,
    collectionId: 'signature',
    color: { name: 'Maroon', family: 'Merah', hex: '#7a1f2b' },
    description: '',
    details: [],
    images: [],
    variants: [{ id: `${overrides.id}-v`, sku: 'SKU', label: 'Scarf', price: 100_000, stock: 1 }],
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const variant = (id: string, price: number, stock: number) => ({ id, sku: id, label: id, price, stock });

const a = product({
  id: 'a',
  name: 'Signature Square – Maroon',
  createdAt: '2026-03-01T00:00:00.000Z',
  variants: [variant('a1', 325_000, 0), variant('a2', 395_000, 4)],
});
const b = product({
  id: 'b',
  name: 'Heritage Square – Navy',
  collectionId: 'heritage',
  color: { name: 'Navy', family: 'Biru', hex: '#1b1d4a' },
  createdAt: '2026-02-01T00:00:00.000Z',
  variants: [variant('b1', 250_000, 2)],
});
const c = product({
  id: 'c',
  name: 'Signature Square – Charcoal',
  color: { name: 'Charcoal', family: 'Abu-abu', hex: '#44464f' },
  createdAt: '2026-04-01T00:00:00.000Z',
  variants: [variant('c1', 500_000, 0)],
});
const all = [a, b, c];
const ids = (products: Product[]) => products.map((p) => p.id);

describe('pricing and stock helpers', () => {
  it('reports the lowest variant price and whether prices differ', () => {
    expect(minPrice(a)).toBe(325_000);
    expect(hasPriceRange(a)).toBe(true);
    expect(hasPriceRange(b)).toBe(false);
  });

  it('treats a product as in stock when any variant has stock', () => {
    expect(isInStock(a)).toBe(true);
    expect(isInStock(c)).toBe(false);
  });

  it('picks the cheapest purchasable variant, not just the cheapest', () => {
    expect(defaultVariant(a)?.id).toBe('a2');
    expect(defaultVariant(c)?.id).toBe('c1');
  });
});

describe('queryProducts', () => {
  it('sorts newest first by default without mutating the input', () => {
    expect(ids(queryProducts(all))).toEqual(['c', 'a', 'b']);
    expect(ids(all)).toEqual(['a', 'b', 'c']);
  });

  it('sorts by price in both directions and by name', () => {
    expect(ids(queryProducts(all, { sort: 'harga-terendah' }))).toEqual(['b', 'a', 'c']);
    expect(ids(queryProducts(all, { sort: 'harga-tertinggi' }))).toEqual(['c', 'a', 'b']);
    expect(ids(queryProducts(all, { sort: 'nama' }))).toEqual(['b', 'c', 'a']);
  });

  it('filters by collection, colour family and availability together', () => {
    expect(ids(queryProducts(all, { collectionIds: ['heritage'] }))).toEqual(['b']);
    expect(ids(queryProducts(all, { colorFamilies: ['Merah', 'Biru'] }))).toEqual(['a', 'b']);
    expect(ids(queryProducts(all, { inStockOnly: true }))).toEqual(['a', 'b']);
    expect(queryProducts(all, { collectionIds: ['heritage'], colorFamilies: ['Merah'] })).toEqual([]);
  });

  it('matches every search term, case-insensitively, across name and colour', () => {
    expect(ids(queryProducts(all, { search: '  SIGNATURE maroon ' }))).toEqual(['a']);
    expect(ids(queryProducts(all, { search: 'biru' }))).toEqual(['b']);
    expect(queryProducts(all, { search: 'tidak ada' })).toEqual([]);
  });

  it('treats empty filter lists as "no filter"', () => {
    expect(queryProducts(all, { collectionIds: [], colorFamilies: [], search: '   ' })).toHaveLength(3);
  });
});

describe('colorFamiliesOf', () => {
  it('returns each family once, in first-seen order', () => {
    const families = colorFamiliesOf([a, { ...b, color: a.color }, c]);
    expect(families.map((f) => f.family)).toEqual(['Merah', 'Abu-abu']);
  });
});

describe('seed catalogue integrity', () => {
  it('has unique ids, slugs and variant ids, positive prices and at least one image', async () => {
    const products = await listProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
    expect(new Set(products.map((p) => p.slug)).size).toBe(products.length);

    const variantIds = products.flatMap((p) => p.variants.map((v) => v.id));
    expect(new Set(variantIds).size).toBe(variantIds.length);

    for (const p of products) {
      expect(p.images.length, p.slug).toBeGreaterThan(0);
      expect(p.variants.length, p.slug).toBeGreaterThan(0);
      expect(Number.isNaN(Date.parse(p.createdAt)), p.slug).toBe(false);
      for (const v of p.variants) {
        expect(Number.isInteger(v.price) && v.price > 0, v.id).toBe(true);
        expect(Number.isInteger(v.stock) && v.stock >= 0, v.id).toBe(true);
      }
    }
  });

  it('resolves products by slug and returns null for unknown slugs', async () => {
    const [first] = await listProducts();
    expect((await getProductBySlug(first!.slug))?.id).toBe(first!.id);
    expect(await getProductBySlug('tidak-ada')).toBeNull();
  });
});
