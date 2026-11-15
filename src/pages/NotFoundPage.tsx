import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../lib/useDocumentTitle';

export function NotFoundPage() {
  useDocumentTitle('Halaman tidak ditemukan');
  return (
    <div className="container empty">
      <h1>Halaman tidak ditemukan</h1>
      <p>Alamat yang Anda buka tidak tersedia.</p>
      <Link to="/" className="btn btn--outline">
        Kembali ke Beranda
      </Link>
    </div>
  );
}
