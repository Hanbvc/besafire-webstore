import { cartSubtotal, type CartLine } from './cart';
import { formatRupiah } from './format';

/**
 * Builds a WhatsApp click-to-chat link. With no number configured the link
 * opens WhatsApp's contact picker instead of messaging an arbitrary number.
 */
export function buildWhatsAppUrl(number: string, text: string): string {
  const digits = number.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export function buildOrderMessage(lines: readonly CartLine[], brand: string): string {
  const rows = lines.map(
    (line, i) =>
      `${i + 1}. ${line.product.name} (${line.variant.label}) x${line.qty} = ${formatRupiah(line.lineTotal)}`,
  );
  return [
    `Halo ${brand}, saya ingin memesan:`,
    '',
    ...rows,
    '',
    `Subtotal: ${formatRupiah(cartSubtotal(lines))}`,
    '',
    'Mohon informasi ongkos kirim dan cara pembayarannya. Terima kasih.',
  ].join('\n');
}

export function buildProductInquiry(productName: string, brand: string): string {
  return `Halo ${brand}, saya ingin bertanya tentang produk ${productName}.`;
}
