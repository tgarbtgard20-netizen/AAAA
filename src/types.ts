/**
 * Types definition for Aronium POS & Accounting System
 */

export interface Product {
  id: string;
  code: string;
  name: string;
  barcode: string;
  category: string;
  costPrice: number;
  salePrice: number;
  taxRate: number; // e.g. 15 for 15%
  stock: number;
  unit: string; // e.g. 'حبة', 'قطعة', 'طقم'
  image?: string;
  minStock?: number;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  taxAmount: number;
  total: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  balance: number; // positive = owes us (debt), negative = credit
  creditLimit: number;
}

export type DocumentType = 'SALE' | 'RETURN' | 'PURCHASE' | 'QUOTE';
export type PaymentStatus = 'PAID' | 'CREDIT' | 'PARTIAL';
export type PaymentMethod = 'CASH' | 'CARD' | 'CREDIT' | 'TRANSFER';

export interface DocumentItem {
  id: string;
  productId: string;
  code: string;
  name: string;
  unit: string;
  quantity: number;
  priceBeforeTax: number;
  taxRate: number;
  taxAmount: number;
  unitPrice: number;
  totalBeforeDiscount: number;
  discount: number;
  total: number;
  costPrice?: number;
}

export interface Document {
  id: string;
  number: string;
  orderNumber?: number;
  type: DocumentType;
  customerId: string;
  customerName: string;
  date: string; // ISO string or YYYY-MM-DD HH:mm
  items: DocumentItem[];
  itemCount: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  posName: string;
  cashierName: string;
  paidAmount: number;
  changeAmount: number;
  referenceInvoiceNumber?: string;
  notes?: string;
}

export interface CashMovement {
  id: string;
  type: 'IN' | 'OUT' | 'START' | 'END';
  amount: number;
  reason: string;
  date: string;
  cashierName: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: 'admin' | 'cashier' | 'manager';
  pin: string;
}

export interface CompanySettings {
  name: string;
  commercialName: string;
  phone: string;
  address: string;
  taxNumber: string;
  crNumber: string; // Commercial Registration
  currency: string;
  receiptHeader: string;
  receiptFooter: string;
  defaultTaxRate: number;
  isCommercialActivated: boolean;
}

export interface HeldSale {
  id: string;
  customer: Customer;
  items: CartItem[];
  timestamp: string;
  note?: string;
}

export interface SystemBackupData {
  version: string;
  system: string;
  appName?: string;
  exportDate: string;
  exportTimestamp: number;
  metadata?: {
    totalProducts: number;
    totalDocuments: number;
    totalCustomers: number;
    totalCashMovements?: number;
    companyName: string;
    currency: string;
  };
  products: Product[];
  documents: Document[];
  customers: Customer[];
  cashMovements?: CashMovement[];
  settings?: CompanySettings;
  users?: User[];
  heldSales?: HeldSale[];
}

export interface ImportBackupResult {
  success: boolean;
  message: string;
  counts?: {
    products?: number;
    documents?: number;
    customers?: number;
    cashMovements?: number;
    users?: number;
    heldSales?: number;
  };
  errors?: string[];
}
