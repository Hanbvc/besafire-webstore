import type { CatalogQuery, Collection, ColorFamily } from '../types';
import { Drawer } from './Drawer';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  query: Required<CatalogQuery>;
  onChange: (patch: Partial<CatalogQuery>) => void;
  onReset: () => void;
  collections: Collection[];
  colorFamilies: ColorFamily[];
  resultCount: number;
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function FilterDrawer({
  open,
  onClose,
  query,
  onChange,
  onReset,
  collections,
  colorFamilies,
  resultCount,
}: FilterDrawerProps) {
  return (
    <Drawer
      open={open}
      onClose={onClose}
      side="left"
      title="Filter"
      footer={
        <div className="filter__actions">
          <button type="button" className="btn btn--outline" onClick={onReset}>
            Hapus Semua
          </button>
          <button type="button" className="btn btn--primary" onClick={onClose}>
            Lihat {resultCount} Produk
          </button>
        </div>
      }
    >
      <fieldset className="filter__group">
        <legend>Koleksi</legend>
        {collections.map((c) => (
          <label key={c.id} className="check">
            <input
              id={`filter-koleksi-${c.id}`}
              type="checkbox"
              checked={query.collectionIds.includes(c.id)}
              onChange={() => onChange({ collectionIds: toggle(query.collectionIds, c.id) })}
            />
            <span>{c.name}</span>
          </label>
        ))}
      </fieldset>

      <fieldset className="filter__group">
        <legend>Warna</legend>
        <div className="swatches">
          {colorFamilies.map((c) => (
            <label key={c.family} className="swatch">
              <input
                id={`filter-warna-${c.family.replace(/\s+/g, '-').toLowerCase()}`}
                type="checkbox"
                checked={query.colorFamilies.includes(c.family)}
                onChange={() => onChange({ colorFamilies: toggle(query.colorFamilies, c.family) })}
              />
              <span className="swatch__dot" style={{ backgroundColor: c.hex }} />
              <span className="swatch__label">{c.family}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter__group">
        <legend>Ketersediaan</legend>
        <label className="check">
          <input
            id="filter-stok"
            type="checkbox"
            checked={query.inStockOnly}
            onChange={() => onChange({ inStockOnly: !query.inStockOnly })}
          />
          <span>Hanya yang tersedia</span>
        </label>
      </fieldset>
    </Drawer>
  );
}
