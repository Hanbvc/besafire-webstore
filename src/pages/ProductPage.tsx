import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { IconHeart, IconWhatsApp } from '../components/Icons';
import { ProductGrid } from '../components/ProductCard';
import { QtyStepper } from '../components/QtyStepper';
import site from '../data/site.json';
import { MAX_QTY_PER_LINE } from '../lib/cart';
import { defaultVariant, getProductBySlug, listProducts } from '../lib/catalog';
import { assetUrl, formatRupiah } from '../lib/format';
import { useAsync } from '../lib/useAsync';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { buildProductInquiry, buildWhatsAppUrl } from '../lib/whatsapp';
import { useCart } from '../state/CartContext';
import { useWishlist } from '../state/WishlistContext';
import type { Collection, Product } from '../types';

export function ProductPage({ collections }: { collections: Collection[] }) {
  const { slug = '' } = useParams();
  const { data: product, loading, error } = useAsync(() => getProductBySlug(slug), [slug]);

  useDocumentTitle(product?.name);

  if (error) {
    return (
      <div className="container empty" role="alert">
        <p>Produk gagal dimuat. Periksa koneksi Anda, lalu muat ulang halaman.</p>
      </div>
    );
  }
  if (loading && !product) return <div className="container pdp pdp--loading" aria-busy="true" />;
  if (!product) {
    return (
      <div className="container empty">
        <h1>Produk tidak ditemukan</h1>
        <p>Produk ini mungkin sudah tidak tersedia.</p>
        <Link to="/" className="btn btn--outline">
          Lihat Koleksi
        </Link>
      </div>
    );
  }

  // Keyed so variant, quantity and gallery state reset when the product changes.
  return <ProductDetail key={product.id} product={product} collections={collections} />;
}

function ProductDetail({ product, collections }: { product: Product; collections: Collection[] }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const [variantId, setVariantId] = useState(() => defaultVariant(product)?.id);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const { data: catalogue } = useAsync(() => listProducts(), []);

  const variant = product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const maxQty = Math.min(variant?.stock ?? 0, MAX_QTY_PER_LINE);
  const soldOut = maxQty === 0;
  const collection = collections.find((c) => c.id === product.collectionId);
  const wished = wishlist.has(product.id);
  const image = product.images[activeImage] ?? product.images[0];
  // Same collection first, then the rest of the catalogue (sort is stable).
  const sameCollection = (p: Product) => Number(p.collectionId === product.collectionId);
  const others = (catalogue ?? [])
    .filter((p) => p.id !== product.id)
    .sort((a, b) => sameCollection(b) - sameCollection(a))
    .slice(0, 4);

  // Keep the chosen quantity valid when switching to a variant with less stock.
  useEffect(() => {
    setQty((current) => Math.max(1, Math.min(current, maxQty || 1)));
  }, [maxQty]);

  return (
    <>
      <Breadcrumb
        items={[
          { label: 'Beranda', to: '/' },
          ...(collection ? [{ label: collection.name, to: `/?koleksi=${collection.id}` }] : []),
          { label: product.name },
        ]}
      />

      <article className="container pdp">
        <div className="pdp__gallery">
          <div className="pdp__image">
            {image && <img src={assetUrl(image.src)} alt={image.alt} width={1000} height={1000} />}
          </div>
          {product.images.length > 1 && (
            <ul className="pdp__thumbs">
              {product.images.map((img, i) => (
                <li key={img.src}>
                  <button
                    type="button"
                    className={i === activeImage ? 'is-active' : undefined}
                    onClick={() => setActiveImage(i)}
                    aria-label={`Lihat gambar ${i + 1} dari ${product.images.length}`}
                    aria-current={i === activeImage}
                  >
                    <img src={assetUrl(img.src)} alt="" width={96} height={96} loading="lazy" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pdp__info">
          {collection && <p className="pdp__eyebrow">{collection.name}</p>}
          <h1 className="pdp__name">{product.name}</h1>
          <p className="pdp__price">{variant ? formatRupiah(variant.price) : ''}</p>

          {product.variants.length > 1 && (
            <fieldset className="pdp__variants">
              <legend>Pilihan</legend>
              <div className="pills">
                {product.variants.map((v) => (
                  <label key={v.id} className="pill">
                    <input
                      id={`variant-${v.id}`}
                      type="radio"
                      name="variant"
                      value={v.id}
                      checked={v.id === variant?.id}
                      disabled={v.stock === 0}
                      onChange={() => setVariantId(v.id)}
                    />
                    <span>
                      {v.label}
                      {v.stock === 0 && ' (habis)'}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <div className="pdp__buy">
            {!soldOut && (
              <QtyStepper value={qty} max={maxQty} onChange={setQty} label="Jumlah" />
            )}
            <button
              type="button"
              className="btn btn--primary pdp__add"
              disabled={soldOut || !variant}
              onClick={() => variant && cart.add(product, variant, qty)}
            >
              {soldOut ? 'Stok Habis' : 'Tambah ke Tas'}
            </button>
            <button
              type="button"
              className={`btn btn--outline btn--icon${wished ? ' is-active' : ''}`}
              onClick={() => wishlist.toggle(product.id)}
              aria-pressed={wished}
              aria-label={wished ? 'Hapus dari wishlist' : 'Simpan ke wishlist'}
            >
              <IconHeart filled={wished} />
            </button>
          </div>

          {!soldOut && variant && variant.stock <= 5 && (
            <p className="pdp__stock">Tersisa {variant.stock} buah.</p>
          )}

          <a
            className="pdp__ask"
            href={buildWhatsAppUrl(site.whatsappNumber, buildProductInquiry(product.name, site.brand))}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsApp width={20} height={20} /> Tanya produk ini via WhatsApp
          </a>

          <details className="accordion" open>
            <summary>Deskripsi</summary>
            <p>{product.description}</p>
          </details>
          <details className="accordion">
            <summary>Detail Produk</summary>
            <ul>
              <li>Warna: {product.color.name}</li>
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
              {variant && <li>SKU: {variant.sku}</li>}
            </ul>
          </details>
          <details className="accordion">
            <summary>Pemesanan &amp; Pengiriman</summary>
            <p>
              Pesanan dikonfirmasi melalui WhatsApp. Admin kami akan menginformasikan ongkos kirim dan cara
              pembayaran setelah pesanan diterima.
            </p>
          </details>
        </div>
      </article>

      {others.length > 0 && (
        <section className="container related" aria-labelledby="related-title">
          <h2 id="related-title">Mungkin Anda Suka</h2>
          <ProductGrid products={others} />
        </section>
      )}
    </>
  );
}
