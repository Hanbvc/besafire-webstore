import { Link } from 'react-router-dom';
import { defaultVariant, hasPriceRange, isInStock, minPrice } from '../lib/catalog';
import { assetUrl, formatRupiah } from '../lib/format';
import { useCart } from '../state/CartContext';
import { useWishlist } from '../state/WishlistContext';
import type { Product } from '../types';
import { IconBagPlus, IconHeart } from './Icons';

export function ProductCard({ product }: { product: Product }) {
  const cart = useCart();
  const wishlist = useWishlist();
  const image = product.images[0];
  const inStock = isInStock(product);
  const wished = wishlist.has(product.id);
  const href = `/produk/${product.slug}`;

  const quickAdd = () => {
    const variant = defaultVariant(product);
    if (variant && variant.stock > 0) cart.add(product, variant);
  };

  return (
    <article className="card">
      <div className="card__media">
        <Link to={href} className="card__image" tabIndex={-1} aria-hidden="true">
          {image && (
            <img src={assetUrl(image.src)} alt="" width={1000} height={1000} loading="lazy" decoding="async" />
          )}
        </Link>
        {!inStock && <span className="card__flag">Stok habis</span>}
        <button
          type="button"
          className={`circle-btn card__wish${wished ? ' is-active' : ''}`}
          onClick={() => wishlist.toggle(product.id)}
          aria-pressed={wished}
          aria-label={wished ? `Hapus ${product.name} dari wishlist` : `Simpan ${product.name} ke wishlist`}
        >
          <IconHeart filled={wished} width={22} height={22} />
        </button>
        <button
          type="button"
          className="circle-btn card__add"
          onClick={quickAdd}
          disabled={!inStock}
          aria-label={`Tambah ${product.name} ke tas`}
        >
          <IconBagPlus width={24} height={24} />
        </button>
      </div>
      <h3 className="card__name">
        {/* Non-breaking space keeps the dash on the first line when the name wraps. */}
        <Link to={href}>{product.name.replace(' – ', '\u00A0– ')}</Link>
      </h3>
      <p className="card__price">
        {hasPriceRange(product) && 'Mulai '}
        {formatRupiah(minPrice(product))}
      </p>
    </article>
  );
}

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <ul className="grid">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </ul>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <ul className="grid" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <li key={i}>
          <div className="card__media card__media--skeleton" />
        </li>
      ))}
    </ul>
  );
}
