import { Link, NavLink } from 'react-router-dom';
import site from '../data/site.json';
import { useCart } from '../state/CartContext';
import { useWishlist } from '../state/WishlistContext';
import type { Collection } from '../types';
import { IconBag, IconHeart, IconMenu } from './Icons';

interface HeaderProps {
  collections: Collection[];
  onOpenMenu: () => void;
}

export function Header({ collections, onOpenMenu }: HeaderProps) {
  const cart = useCart();
  const wishlist = useWishlist();

  return (
    <header className="site-header">
      <div className="container site-header__bar">
        <button type="button" className="icon-btn site-header__menu" onClick={onOpenMenu} aria-label="Buka menu">
          <IconMenu width={28} height={28} />
        </button>

        <Link to="/" className="wordmark" aria-label={`${site.brand}, ke beranda`}>
          {site.brand}
        </Link>

        <div className="site-header__actions">
          <Link
            to="/wishlist"
            className="icon-btn site-header__wishlist"
            aria-label={`Wishlist, ${wishlist.ids.length} produk`}
          >
            <IconHeart width={26} height={26} />
            {wishlist.ids.length > 0 && <span className="count-badge">{wishlist.ids.length}</span>}
          </Link>
          <button
            type="button"
            className="icon-btn"
            onClick={cart.open}
            aria-label={`Buka tas belanja, ${cart.count} barang`}
          >
            <IconBag width={28} height={28} />
            {cart.count > 0 && <span className="count-badge">{cart.count}</span>}
          </button>
        </div>
      </div>

      <nav className="site-nav" aria-label="Navigasi utama">
        <ul className="container site-nav__list">
          <li>
            <NavLink to="/" end>
              Semua Koleksi
            </NavLink>
          </li>
          {collections.map((c) => (
            <li key={c.id}>
              <Link to={`/?koleksi=${encodeURIComponent(c.id)}`}>{c.name}</Link>
            </li>
          ))}
          <li>
            <NavLink to="/wishlist">Wishlist</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}
