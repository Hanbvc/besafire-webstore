import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, HashRouter, Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/CartDrawer';
import { FloatingButtons } from './components/FloatingButtons';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { MenuDrawer } from './components/MenuDrawer';
import { listCollections } from './lib/catalog';
import { useAsync } from './lib/useAsync';
import { CollectionPage } from './pages/CollectionPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProductPage } from './pages/ProductPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartProvider } from './state/CartContext';
import { WishlistProvider } from './state/WishlistContext';

// Hash routing needs no server rewrite rules; see `build:static` in the README.
const Router = import.meta.env.VITE_ROUTER === 'hash' ? HashRouter : BrowserRouter;

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function Shell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: collections = [] } = useAsync(listCollections, []);
  const openMenu = useCallback(() => setMenuOpen(true), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  return (
    <>
      <ScrollToTop />
      <a
        className="skip-link"
        href="#konten"
        onClick={(event) => {
          // Handled in script so it also works under hash routing.
          event.preventDefault();
          document.getElementById('konten')?.focus();
        }}
      >
        Lewati ke konten
      </a>
      <Header collections={collections} onOpenMenu={openMenu} />
      <main id="konten" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<CollectionPage collections={collections} />} />
          <Route path="/produk/:slug" element={<ProductPage collections={collections} />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer collections={collections} />
      <FloatingButtons />
      <MenuDrawer open={menuOpen} onClose={closeMenu} collections={collections} />
      <CartDrawer />
    </>
  );
}

export function App() {
  return (
    <Router>
      <WishlistProvider>
        <CartProvider>
          <Shell />
        </CartProvider>
      </WishlistProvider>
    </Router>
  );
}
