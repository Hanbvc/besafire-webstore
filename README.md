# Besafire Scarves — Webstore

Etalase online Besafire Scarves: halaman koleksi, detail produk, wishlist, tas belanja,
dan pemesanan lewat WhatsApp. Dibangun dengan Vite, React, dan TypeScript.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```bash
npm install
npm run dev        # server pengembangan di http://localhost:5173
npm test           # unit test (katalog, tas belanja, format harga, tautan WhatsApp)
npm run typecheck
npm run build      # build produksi ke dist/
npm run preview    # melihat hasil build secara lokal
```

### Dua mode build

| Perintah | Routing | Kapan dipakai |
| --- | --- | --- |
| `npm run build` | URL bersih (`/produk/signature-square-maroon`) | Hosting di root domain. Server harus mengarahkan semua path ke `index.html` (SPA fallback). |
| `npm run build:static` | Hash (`#/produk/...`), aset relatif | Hosting statis tanpa aturan rewrite, atau di sub-folder. |

### Deploy ke Vercel

Impor repositori ini di <https://vercel.com/new>. Vercel mengenali Vite secara otomatis
(perintah build `npm run build`, keluaran `dist/`), jadi tidak ada pengaturan yang perlu diubah.
`vercel.json` mengarahkan semua path ke `index.html` agar tautan langsung seperti
`/produk/signature-square-maroon` tetap terbuka. Setiap push ke `main` otomatis ter-deploy.

## Yang perlu diisi sebelum tayang

1. **Nomor WhatsApp** di `src/data/site.json` (`whatsappNumber`, format internasional tanpa `+`,
   misalnya `62812...`). Selama kosong, tombol WhatsApp membuka pemilih kontak, bukan nomor toko.
2. **Katalog** di `src/data/products.json`. Nama produk, harga, stok, dan deskripsi saat ini adalah
   data contoh. Produk bertanda `"isSample": true` memakai foto hasil pewarnaan ulang dari foto
   Maroon untuk mengisi grid; hapus atau ganti dengan foto asli.
3. **Instagram** (opsional) di `src/data/site.json` (`instagramUrl`). Tautan hanya tampil jika diisi.

## Struktur

```
public/images/        foto produk dan aset brand (dirujuk dari data, bukan di-import)
src/data/             products.json (katalog), site.json (identitas toko)
src/types.ts          bentuk data katalog: Product, ProductVariant, Collection
src/lib/catalog.ts    satu-satunya pintu akses data produk
src/lib/cart.ts       logika tas belanja (murni, teruji)
src/lib/whatsapp.ts   penyusun tautan dan pesan pesanan
src/state/            konteks tas belanja dan wishlist (tersimpan di localStorage)
src/components/       header, drawer, kartu produk, footer
src/pages/            koleksi, detail produk, wishlist
src/styles/           tokens.css berisi palet dan tipografi brand
```

## Integrasi backoffice

UI tidak pernah membaca `products.json` secara langsung. Semua data lewat empat fungsi async
di bagian bawah `src/lib/catalog.ts`: `listProducts`, `getProductBySlug`, `listCollections`,
dan `listColorFamilies`. Untuk menyambungkan backoffice, ganti isi fungsi tersebut dengan
panggilan `fetch` ke API yang mengembalikan bentuk data di `src/types.ts`.

Catatan untuk tahap itu:

- Harga disimpan sebagai bilangan bulat Rupiah. Tas belanja hanya menyimpan id produk, id varian,
  dan jumlah; harga dan stok selalu diambil ulang dari katalog.
- Stok hanya dibatasi di sisi klien. Validasi stok dan harga final harus dilakukan di server
  saat pesanan dibuat.
- Pemesanan saat ini berupa pesan WhatsApp berisi ringkasan tas. Belum ada pembayaran online
  maupun pencatatan pesanan.
- Filter dan pengurutan berjalan di klien, cukup untuk katalog kecil. Pindahkan ke API
  jika jumlah produk sudah ratusan.
