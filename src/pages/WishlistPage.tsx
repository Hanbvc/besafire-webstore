import { Link } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard';
import { listProducts } from '../lib/catalog';
import { useAsync } from '../lib/useAsync';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import { useWishlist } from '../state/WishlistContext';

export function WishlistPage() {
  const wishlist = useWishlist();
  const { data: products, error } = useAsync(() => listProducts(), []);
  const saved = products?.filter((p) => wishlist.has(p.id));

  useDocumentTitle('Wishlist');

  return (
    <>
      <Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: 'Wishlist' }]} />
      <section className="container catalog">
        <h1 className="page-title">Wishlist</h1>
        {error ? (
          <div className="empty" role="alert">
            <p>Wishlist gagal dimuat. Periksa koneksi Anda, lalu muat ulang halaman.</p>
          </div>
        ) : !saved ? (
          <ProductGridSkeleton count={2} />
        ) : saved.length === 0 ? (
          <div className="empty">
            <p>Belum ada produk yang disimpan. Ketuk ikon hati pada produk untuk menyimpannya di sini.</p>
            <Link to="/" className="btn btn--outline">
              Lihat Koleksi
            </Link>
          </div>
        ) : (
          <ProductGrid products={saved} />
        )}
      </section>
    </>
  );
}
