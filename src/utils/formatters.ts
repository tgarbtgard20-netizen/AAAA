/**
 * Formatting and calculation utilities for POS and Financial Accounting
 */

export function formatCurrency(amount: number, currency: string = 'ر.س'): string {
  const num = isNaN(amount) ? 0 : amount;
  return `${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency}`;
}

export function formatNumber(amount: number): string {
  const num = isNaN(amount) ? 0 : amount;
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function generateInvoiceNumber(prefix: string = '26-200'): string {
  const seq = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${String(seq).padStart(6, '0')}`;
}

export function generateOrderNumber(): number {
  return Math.floor(1800 + Math.random() * 200);
}

export function getCurrentDateTimeFormatted(): string {
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());
  let hours = now.getHours();
  const minutes = pad(now.getMinutes());
  const seconds = pad(now.getSeconds());
  const ampm = hours >= 12 ? 'م' : 'ص';
  hours = hours % 12 || 12;
  return `${month}/${day}/${year} ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
}

export function calculateItemFinancials(
  unitPrice: number,
  quantity: number,
  taxRatePercent: number = 15,
  discountPercent: number = 0,
  fixedDiscountAmount: number = 0
) {
  const lineSubtotal = unitPrice * quantity;
  const lineDiscount = fixedDiscountAmount > 0
    ? Math.min(lineSubtotal, fixedDiscountAmount)
    : lineSubtotal * (discountPercent / 100);
  const lineNet = Math.max(0, lineSubtotal - lineDiscount);

  const basePrice = lineNet / (1 + taxRatePercent / 100);
  const taxAmount = lineNet - basePrice;
  const priceBeforeTax = unitPrice / (1 + taxRatePercent / 100);

  return {
    priceBeforeTax: Number(priceBeforeTax.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    basePrice: Number(basePrice.toFixed(2)),
    discount: Number(lineDiscount.toFixed(2)),
    total: Number(lineNet.toFixed(2)),
  };
}

/**
 * Normalizes barcode input from physical scanners or keyboards,
 * converting Arabic digits (٠-٩) to English (0-9) and trimming control characters.
 */
export function normalizeBarcodeInput(str: string): string {
  if (!str) return '';
  return str
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/[\u200B-\u200D\uFEFF\r\n\t]/g, '')
    .trim();
}

/**
 * Searches for a product across the entire inventory matching barcode or code
 */
export function findProductByBarcode<T extends { barcode?: string; code?: string }>(
  products: T[],
  rawInput: string
): T | undefined {
  const clean = normalizeBarcodeInput(rawInput).toLowerCase();
  if (!clean) return undefined;

  // 1. Exact match on barcode
  let found = products.find(
    (p) => p.barcode && normalizeBarcodeInput(p.barcode).toLowerCase() === clean
  );
  if (found) return found;

  // 2. Exact match on product code
  found = products.find(
    (p) => p.code && normalizeBarcodeInput(p.code).toLowerCase() === clean
  );
  if (found) return found;

  // 3. Match without leading zeros (e.g. 00021451210 vs 21451210)
  const cleanNoZeros = clean.replace(/^0+/, '');
  if (cleanNoZeros) {
    found = products.find((p) => {
      const pBarcodeNoZeros = normalizeBarcodeInput(p.barcode || '').replace(/^0+/, '').toLowerCase();
      const pCodeNoZeros = normalizeBarcodeInput(p.code || '').replace(/^0+/, '').toLowerCase();
      return pBarcodeNoZeros === cleanNoZeros || pCodeNoZeros === cleanNoZeros;
    });
  }

  return found;
}

