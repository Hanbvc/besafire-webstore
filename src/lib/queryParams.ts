import { DEFAULT_SORT, isSortKey } from './catalog';
import type { CatalogQuery } from '../types';

/**
 * The collection page keeps its filter state in the URL so a filtered view
 * can be shared, bookmarked and restored with the back button.
 */

const KEYS = {
  search: 'q',
  collections: 'koleksi',
  colors: 'warna',
  inStock: 'stok',
  sort: 'urut',
} as const;

function list(value: string | null): string[] {
  return value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
}

export function parseCatalogQuery(params: URLSearchParams): Required<CatalogQuery> {
  const sort = params.get(KEYS.sort);
  return {
    search: params.get(KEYS.search)?.trim() ?? '',
    collectionIds: list(params.get(KEYS.collections)),
    colorFamilies: list(params.get(KEYS.colors)),
    inStockOnly: params.get(KEYS.inStock) === '1',
    sort: isSortKey(sort) ? sort : DEFAULT_SORT,
  };
}

export function toSearchParams(query: CatalogQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set(KEYS.search, query.search.trim());
  if (query.collectionIds?.length) params.set(KEYS.collections, query.collectionIds.join(','));
  if (query.colorFamilies?.length) params.set(KEYS.colors, query.colorFamilies.join(','));
  if (query.inStockOnly) params.set(KEYS.inStock, '1');
  if (query.sort && query.sort !== DEFAULT_SORT) params.set(KEYS.sort, query.sort);
  return params;
}

export function activeFilterCount(query: CatalogQuery): number {
  return (
    (query.collectionIds?.length ?? 0) +
    (query.colorFamilies?.length ?? 0) +
    (query.inStockOnly ? 1 : 0)
  );
}
