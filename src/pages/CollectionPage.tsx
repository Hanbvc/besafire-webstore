import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Breadcrumb } from '../components/Breadcrumb';
import { FilterDrawer } from '../components/FilterDrawer';
import { IconChevronDown, IconFilter } from '../components/Icons';
import { ProductGrid, ProductGridSkeleton } from '../components/ProductCard';
import site from '../data/site.json';
import { isSortKey, listColorFamilies, listProducts, SORT_OPTIONS } from '../lib/catalog';
import { assetUrl } from '../lib/format';
import { activeFilterCount, parseCatalogQuery, toSearchParams } from '../lib/queryParams';
import { useAsync } from '../lib/useAsync';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import type { CatalogQuery, Collection } from '../types';

export function CollectionPage({ collections }: { collections: Collection[] }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filterOpen, setFilterOpen] = useState(false);

  const query = parseCatalogQuery(searchParams);
  const queryKey = toSearchParams(query).toString();
  const { data: products, loading, error } = useAsync(() => listProducts(query), [queryKey]);
  const { data: colorFamilies } = useAsync(listColorFamilies, []);

  const update = (patch: Partial<CatalogQuery>) =>
    setSearchParams(toSearchParams({ ...query, ...patch }), { replace: true });
  const reset = () => setSearchParams(toSearchParams({ sort: query.sort }), { replace: true });

  const onlyCollection =
    query.collectionIds.length === 1
      ? collections.find((c) => c.id === query.collectionIds[0])
      : undefined;
  const heading = query.search
    ? `Hasil pencarian "${query.search}"`
    : (onlyCollection?.name ?? 'Semua Koleksi');
  const filterCount = activeFilterCount(query);

  useDocumentTitle(heading);

  return (
    <>
      <Breadcrumb items={[{ label: 'Beranda', to: '/' }, { label: heading }]} />

      <section className="hero container" aria-label={site.brand}>
        <img
          src={assetUrl('images/brand/hero-bags.webp')}
          alt="Tas belanja Besafire Scarves warna abu muda dan navy dengan monogram emas"
          width={1206}
          height={621}
          fetchPriority="high"
        />
      </section>

      <h1 className="visually-hidden">{heading}</h1>

      <div className="toolbar">
        <div className="container toolbar__inner">
          <button type="button" className="toolbar__filter" onClick={() => setFilterOpen(true)}>
            <IconFilter width={26} height={26} />
            <span>Filter{filterCount > 0 && ` (${filterCount})`}</span>
          </button>
          <label className="toolbar__sort">
            <span className="visually-hidden">Urutkan</span>
            <select
              id="sort"
              value={query.sort}
              onChange={(e) => isSortKey(e.target.value) && update({ sort: e.target.value })}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
            <IconChevronDown width={20} height={20} />
          </label>
        </div>
      </div>

      <section className="container catalog" aria-label="Daftar produk" aria-busy={loading}>
        {query.search && (
          <p className="catalog__summary">
            {products?.length ?? 0} produk untuk "{query.search}".{' '}
            <button type="button" className="link-btn" onClick={() => update({ search: '' })}>
              Hapus pencarian
            </button>
          </p>
        )}

        {error ? (
          <div className="empty" role="alert">
            <p>Produk gagal dimuat. Periksa koneksi Anda, lalu muat ulang halaman.</p>
          </div>
        ) : !products ? (
          <ProductGridSkeleton />
        ) : products.length === 0 ? (
          <div className="empty">
            <p>Tidak ada produk yang cocok dengan pilihan Anda.</p>
            <button
              type="button"
              className="btn btn--outline"
              onClick={() => setSearchParams(new URLSearchParams(), { replace: true })}
            >
              Hapus Semua Filter
            </button>
          </div>
        ) : (
          <ProductGrid products={products} />
        )}
      </section>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        query={query}
        onChange={update}
        onReset={reset}
        collections={collections}
        colorFamilies={colorFamilies ?? []}
        resultCount={products?.length ?? 0}
      />
    </>
  );
}
