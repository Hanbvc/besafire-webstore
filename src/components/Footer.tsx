import { Link } from 'react-router-dom';
import site from '../data/site.json';
import { assetUrl } from '../lib/format';
import { buildWhatsAppUrl } from '../lib/whatsapp';
import type { Collection } from '../types';

export function Footer({ collections }: { collections: Collection[] }) {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <div className="site-footer__brand">
          <img
            src={assetUrl('images/brand/logo-gold.png')}
            alt={site.brand}
            width={379}
            height={210}
            loading="lazy"
          />
          <p>{site.tagline}</p>
        </div>

        <nav aria-label="Belanja">
          <h2>Belanja</h2>
          <ul>
            <li>
              <Link to="/">Semua Koleksi</Link>
            </li>
            {collections.map((c) => (
              <li key={c.id}>
                <Link to={`/?koleksi=${encodeURIComponent(c.id)}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link to="/wishlist">Wishlist</Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Bantuan">
          <h2>Bantuan</h2>
          <ul>
            <li>
              <a
                href={buildWhatsAppUrl(site.whatsappNumber, `Halo ${site.brand}, saya ingin bertanya.`)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Chat via WhatsApp
              </a>
            </li>
            {site.instagramUrl && (
              <li>
                <a href={site.instagramUrl} target="_blank" rel="noopener noreferrer">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <p className="site-footer__legal container">
        © {new Date().getFullYear()} {site.brand}
      </p>
    </footer>
  );
}
