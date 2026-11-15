/**
 * Catalog domain types. These mirror the shape the storefront expects from
 * the backoffice API, so swapping the JSON seed for HTTP calls only touches
 * `lib/catalog.ts`.
 */

export interface ProductVariant {
  id: string;
  sku: string;
  label: string;
  /** Price in whole Rupiah (IDR has no minor unit in practice). */
  price: number;
  stock: number;
}

export interface ProductImage {
  /** Absolute URL, or a path relative to the site base (see `assetUrl`). */
  src: string;
  alt: string;
}

export interface ProductColor {
  name: string;
  /** Broad colour group used by the colour filter, e.g. "Merah". */
  family: string;
  hex: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  collectionId: string;
  color: ProductColor;
  description: string;
  details: string[];
  images: ProductImage[];
  variants: ProductVariant[];
  /** ISO 8601 timestamp; drives the "Terbaru" sort. */
  createdAt: string;
  /** Placeholder catalogue entry — remove before going live. */
  isSample?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
}

export interface CatalogData {
  collections: Collection[];
  products: Product[];
}

export type SortKey = 'terbaru' | 'harga-terendah' | 'harga-tertinggi' | 'nama';

export interface CatalogQuery {
  search?: string;
  collectionIds?: string[];
  colorFamilies?: string[];
  inStockOnly?: boolean;
  sort?: SortKey;
}

export interface ColorFamily {
  family: string;
  hex: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  qty: number;
}
