import { describe, expect, it } from 'vitest';
import { resolveCart } from './cart';
import { formatRupiah } from './format';
import { activeFilterCount, parseCatalogQuery, toSearchParams } from './queryParams';
import { buildOrderMessage, buildWhatsAppUrl } from './whatsapp';
import type { Product } from '../types';

describe('formatRupiah', () => {
  it('uses Indonesian thousands separators and no decimals', () => {
    expect(formatRupiah(325_000)).toBe('Rp 325.000');
    expect(formatRupiah(1_250_000)).toBe('Rp 1.250.000');
    expect(formatRupiah(0)).toBe('Rp 0');
  });
});

describe('catalogue query params', () => {
  it('round-trips a full query', () => {
    const query = {
      search: 'navy',
      collectionIds: ['signature', 'heritage'],
      colorFamilies: ['Merah Muda'],
      inStockOnly: true,
      sort: 'harga-terendah' as const,
    };
    expect(parseCatalogQuery(toSearchParams(query))).toEqual(query);
  });

  it('omits defaults so the plain collection URL stays clean', () => {
    expect(toSearchParams({ sort: 'terbaru', collectionIds: [], search: ' ' }).toString()).toBe('');
  });

  it('falls back to defaults for missing or unknown values', () => {
    expect(parseCatalogQuery(new URLSearchParams('urut=acak&stok=ya&koleksi=,,'))).toEqual({
      search: '',
      collectionIds: [],
      colorFamilies: [],
      inStockOnly: false,
      sort: 'terbaru',
    });
  });

  it('counts active filters, excluding search and sort', () => {
    expect(
      activeFilterCount({ search: 'x', sort: 'nama', collectionIds: ['a'], colorFamilies: ['b', 'c'], inStockOnly: true }),
    ).toBe(4);
  });
});

describe('WhatsApp links', () => {
  const product: Product = {
    id: 'p1',
    slug: 'p1',
    name: 'Signature Square – Maroon',
    collectionId: 'signature',
    color: { name: 'Maroon', family: 'Merah', hex: '#7a1f2b' },
    description: '',
    details: [],
    images: [],
    variants: [{ id: 'v1', sku: 'S1', label: 'Scarf + Gift Box', price: 395_000, stock: 5 }],
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  it('strips formatting from the number and encodes the message', () => {
    const url = buildWhatsAppUrl('+62 812-3456-7890', 'Halo & selamat\nsiang?');
    expect(url).toBe('https://wa.me/6281234567890?text=Halo%20%26%20selamat%0Asiang%3F');
  });

  it('falls back to the contact picker when no number is configured', () => {
    expect(buildWhatsAppUrl('', 'Halo')).toBe('https://wa.me/?text=Halo');
  });

  it('lists every line with quantity, line total and subtotal', () => {
    const lines = resolveCart([{ productId: 'p1', variantId: 'v1', qty: 2 }], [product]);
    const message = buildOrderMessage(lines, 'Besafire Scarves');
    expect(message).toContain('Halo Besafire Scarves, saya ingin memesan:');
    expect(message).toContain('1. Signature Square – Maroon (Scarf + Gift Box) x2 = Rp 790.000');
    expect(message).toContain('Subtotal: Rp 790.000');
  });
});
