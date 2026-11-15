import seed from '../data/products.json';
import type {
  CatalogData,
  CatalogQuery,
  Collection,
  ColorFamily,
  Product,
  ProductVariant,
  SortKey,
} from '../types';

/**
 * Catalogue access layer.
 *
 * Everything the UI knows about products goes through the async functions at
 * the bottom of this file. They read a bundled JSON seed today; when the
 * backoffice API exists, replace their bodies with `fetch` calls and leave the
 * rest of the app untouched.
 */

const catalog: CatalogData = seed;

export const DEFAULT_SORT: SortKey = 'terbaru';

export const SORT_OPTIONS: ReadonlyArray<{ key: SortKey; label: string }> = [
  { key: 'terbaru', label: 'Terbaru' },
  { key: 'harga-terendah', label: 'Harga terendah' },
  { key: 'harga-tertinggi', label: 'Harga tertinggi' },
  { key: 'nama', label: 'Nama A–Z' },
];

export function isSortKey(value: string | null | undefined): value is SortKey {
  return SORT_OPTIONS.some((option) => option.key === value);
}

export function minPrice(product: Product): number {
  return product.variants.reduce((min, v) => Math.min(min, v.price), Infinity);
}

/** True when variants differ in price, i.e. the card should say "Mulai Rp …". */
export function hasPriceRange(product: Product): boolean {
  return new Set(product.variants.map((v) => v.price)).size > 1;
}

export function isInStock(product: Product): boolean {
  return product.variants.some((v) => v.stock > 0);
}

/** Cheapest purchasable variant; falls back to the first one when sold out. */
export function defaultVariant(product: Product): ProductVariant | undefined {
  const available = product.variants.filter((v) => v.stock > 0);
  const pool = available.length > 0 ? available : product.variants;
  return pool.reduce<ProductVariant | undefined>(
    (best, v) => (best === undefined || v.price < best.price ? v : best),
    undefined,
  );
}

function matchesSearch(product: Product, needle: string): boolean {
  const haystack = [product.name, product.color.name, product.color.family, product.collectionId]
    .join(' ')
    .toLowerCase();
  return needle
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

const comparators: Record<SortKey, (a: Product, b: Product) => number> = {
  terbaru: (a, b) => b.createdAt.localeCompare(a.createdAt) || a.name.localeCompare(b.name, 'id'),
  'harga-terendah': (a, b) => minPrice(a) - minPrice(b) || a.name.localeCompare(b.name, 'id'),
  'harga-tertinggi': (a, b) => minPrice(b) - minPrice(a) || a.name.localeCompare(b.name, 'id'),
  nama: (a, b) => a.name.localeCompare(b.name, 'id'),
};

/** Pure filter + sort. Kept separate from data loading so it is easy to test. */
export function queryProducts(products: readonly Product[], query: CatalogQuery = {}): Product[] {
  const { search, collectionIds, colorFamilies, inStockOnly, sort = DEFAULT_SORT } = query;
  const needle = search?.trim();

  return products
    .filter((p) => !needle || matchesSearch(p, needle))
    .filter((p) => !collectionIds?.length || collectionIds.includes(p.collectionId))
    .filter((p) => !colorFamilies?.length || colorFamilies.includes(p.color.family))
    .filter((p) => !inStockOnly || isInStock(p))
    .sort(comparators[sort]);
}

export function colorFamiliesOf(products: readonly Product[]): ColorFamily[] {
  const seen = new Map<string, string>();
  for (const p of products) {
    if (!seen.has(p.color.family)) seen.set(p.color.family, p.color.hex);
  }
  return [...seen].map(([family, hex]) => ({ family, hex }));
}

/* ---- Data source (swap these for backoffice API calls) ------------------ */

export async function listProducts(query: CatalogQuery = {}): Promise<Product[]> {
  return queryProducts(catalog.products, query);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  return catalog.products.find((p) => p.slug === slug) ?? null;
}

export async function listCollections(): Promise<Collection[]> {
  return catalog.collections;
}

export async function listColorFamilies(): Promise<ColorFamily[]> {
  return colorFamiliesOf(catalog.products);
}
