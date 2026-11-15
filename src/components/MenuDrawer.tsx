import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import site from '../data/site.json';
import { assetUrl } from '../lib/format';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import type { Collection } from '../types';
import { Drawer } from './Drawer';
import { IconChevronRight, IconSearch } from './Icons';

interface MenuDrawerProps {
  open: boolean;
  onClose: () => void;
  collections: Collection[];
}

export function MenuDrawer({ open, onClose, collections }: MenuDrawerProps) {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    const q = term.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : '/');
    setTerm('');
    onClose();
  };

  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      title="Menu"
      header={
        <img
          className="menu__logo"
          src={assetUrl('images/brand/logo-gold.png')}
          alt={site.brand}
          width={379}
          height={210}
        />
      }
    >
      <form className="menu__search" role="search" onSubmit={onSearch}>
        <label className="visually-hidden" htmlFor="menu-search">
          Cari produk
        </label>
        <input
          id="menu-search"
          type="search"
          placeholder="Cari scarf, warna, koleksi"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          autoComplete="off"
        />
        <button type="submit" className="icon-btn" aria-label="Cari">
          <IconSearch />
        </button>
      </form>

      <nav aria-label="Menu">
        <ul className="menu__list">
          <li>
            <Link to="/" onClick={onClose}>
              Semua Koleksi <IconChevronRight width={18} height={18} />
            </Link>
          </li>
          {collections.map((c) => (
            <li key={c.id}>
              <Link to={`/?koleksi=${encodeURIComponent(c.id)}`} onClick={onClose}>
                {c.name} <IconChevronRight width={18} height={18} />
              </Link>
            </li>
          ))}
          <li>
            <Link to="/wishlist" onClick={onClose}>
              Wishlist <IconChevronRight width={18} height={18} />
            </Link>
          </li>
          <li>
            <a
              href={buildWhatsAppUrl(site.whatsappNumber, `Halo ${site.brand}, saya ingin bertanya.`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Hubungi Kami <IconChevronRight width={18} height={18} />
            </a>
          </li>
        </ul>
      </nav>
    </Drawer>
  );
}
