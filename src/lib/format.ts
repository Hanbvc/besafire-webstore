const rupiah = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });

/** 325000 -> "Rp 325.000" */
export function formatRupiah(amount: number): string {
  return `Rp ${rupiah.format(amount)}`;
}

/** Resolves catalogue image paths against the deployed base URL. */
export function assetUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith('data:')) return path;
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`;
}
