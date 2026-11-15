import { Link } from 'react-router-dom';
import site from '../data/site.json';
import { MAX_QTY_PER_LINE } from '../lib/cart';
import { assetUrl, formatRupiah } from '../lib/format';
import { buildOrderMessage, buildWhatsAppUrl } from '../lib/whatsapp';
import { useCart } from '../state/CartContext';
import { Drawer } from './Drawer';
import { IconWhatsApp } from './Icons';
import { QtyStepper } from './QtyStepper';

export function CartDrawer() {
  const cart = useCart();
  const isEmpty = cart.lines.length === 0;

  return (
    <Drawer
      open={cart.isOpen}
      onClose={cart.close}
      side="right"
      title="Tas Belanja"
      footer={
        !isEmpty && (
          <>
            <div className="cart__subtotal">
              <span>Subtotal</span>
              <strong>{formatRupiah(cart.subtotal)}</strong>
            </div>
            <p className="cart__note">Ongkos kirim dikonfirmasi oleh admin saat pemesanan.</p>
            <a
              className="btn btn--primary btn--block"
              href={buildWhatsAppUrl(site.whatsappNumber, buildOrderMessage(cart.lines, site.brand))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp width={20} height={20} /> Pesan via WhatsApp
            </a>
          </>
        )
      }
    >
      {isEmpty ? (
        <div className="empty">
          <p>Tas belanja Anda masih kosong.</p>
          <Link to="/" className="btn btn--outline" onClick={cart.close}>
            Lihat Koleksi
          </Link>
        </div>
      ) : (
        <ul className="cart__lines">
          {cart.lines.map((line) => {
            const image = line.product.images[0];
            return (
              <li key={line.variant.id} className="cart-line">
                <Link to={`/produk/${line.product.slug}`} onClick={cart.close} className="cart-line__thumb">
                  {image && <img src={assetUrl(image.src)} alt="" width={96} height={96} loading="lazy" />}
                </Link>
                <div className="cart-line__info">
                  <Link to={`/produk/${line.product.slug}`} onClick={cart.close} className="cart-line__name">
                    {line.product.name}
                  </Link>
                  <span className="cart-line__variant">{line.variant.label}</span>
                  <span className="cart-line__price">{formatRupiah(line.variant.price)}</span>
                  <div className="cart-line__controls">
                    <QtyStepper
                      value={line.qty}
                      max={Math.min(line.variant.stock, MAX_QTY_PER_LINE)}
                      onChange={(qty) => cart.setQty(line, qty)}
                      label={`Jumlah ${line.product.name}`}
                    />
                    <button type="button" className="link-btn" onClick={() => cart.remove(line)}>
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Drawer>
  );
}
