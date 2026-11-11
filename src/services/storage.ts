/**
 * Storage and Database service with persistent LocalStorage and preloaded market data
 */
import {
  Product,
  Customer,
  Document,
  CashMovement,
  CompanySettings,
  HeldSale,
  User,
  SystemBackupData,
  ImportBackupResult,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'aronium_pos_products_v4',
  CUSTOMERS: 'aronium_pos_customers_v4',
  DOCUMENTS: 'aronium_pos_documents_v4',
  CASH_MOVEMENTS: 'aronium_pos_cash_movements_v4',
  SETTINGS: 'aronium_pos_settings_v4',
  HELD_SALES: 'aronium_pos_held_sales_v4',
  USERS: 'aronium_pos_users_v4',
  ACTIVE_USER: 'aronium_pos_active_user_v4',
};

const DEFAULT_SETTINGS: CompanySettings = {
  name: 'هجاير',
  commercialName: 'مؤسسة هجاير للتجاره',
  phone: '+966 56 340 9344',
  address: 'الرياض-طريق المدينة المنوره-البديعه 1',
  taxNumber: '310458921600003',
  crNumber: '1010457983',
  currency: 'ر.س.',
  receiptHeader: 'مؤسسة هجاير للتجاره',
  receiptFooter: 'الساعات ضمان 1 /سنة\nالاستشوارات ضمان 2 /سنة\nالاسترجاع خلال 24 ساعه\nالاستبدال خلال 3 /ايام واحضار اصل الفاتوره',
  defaultTaxRate: 15,
  isCommercialActivated: true,
};

const DEFAULT_USERS: User[] = [
  { id: 'u1', name: 'المدير العام (هجاير)', username: 'admin', password: '123', role: 'admin', pin: '1234' },
  { id: 'u2', name: 'أحمد الكاشير (وردية 1)', username: 'cashier', password: '123', role: 'cashier', pin: '0000' },
  { id: 'u3', name: 'سارة المحاسبة (المالية)', username: 'accountant', password: '123', role: 'manager', pin: '5555' },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'c0', name: 'عميل نقدي عام', phone: '0500000000', email: 'cash@store.com', balance: 0, creditLimit: 0 },
  { id: 'c1', name: 'عبدالله محمد الشمري', phone: '0554433221', email: 'abdullah@gmail.com', balance: 0.00, creditLimit: 3000, address: 'الرياض - حي الياسمين' },
  { id: 'c2', name: 'مؤسسة ريادة الأعمال', phone: '0567788990', email: 'contact@reyada.com', taxNumber: '300998877600003', balance: 0.00, creditLimit: 10000, address: 'جدة - شارع التحلية' },
  { id: 'c3', name: 'فاطمة العتيبي', phone: '0543322114', email: 'fatima@outlook.com', balance: 0.00, creditLimit: 1500, address: 'الدمام - حي الشاطئ' },
  { id: 'c4', name: 'خالد السبيعي', phone: '0599112233', email: 'khaled@yahoo.com', balance: 0.00, creditLimit: 2000, address: 'الرياض - حي النرجس' },
];

const DEFAULT_PRODUCTS: Product[] = [];

const DEFAULT_DOCUMENTS: Document[] = [];

const DEFAULT_CASH_MOVEMENTS: CashMovement[] = [];

export const StorageService = {
  getProducts(): Product[] {
    // Check if initial reset has taken place to wipe old mock inventory
    const isReset = localStorage.getItem('hajayer_inventory_cleared_v1');
    if (!isReset) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      localStorage.setItem('hajayer_inventory_cleared_v1', 'true');
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  clearAllProducts(): Product[] {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
    localStorage.setItem('hajayer_inventory_cleared_v1', 'true');
    return [];
  },

  saveProduct(product: Product): Product[] {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === product.id);
    let updated: Product[];
    if (idx >= 0) {
      updated = [...products];
      updated[idx] = product;
    } else {
      updated = [product, ...products];
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
    return updated;
  },

  deleteProduct(id: string): Product[] {
    const products = this.getProducts().filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    return products;
  },

  updateStock(items: { productId: string; quantity: number }[]): void {
    const products = this.getProducts();
    items.forEach((item) => {
      const p = products.find((x) => x.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },

  getCustomers(): Customer[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(DEFAULT_CUSTOMERS));
      return DEFAULT_CUSTOMERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_CUSTOMERS;
    }
  },

  saveCustomer(customer: Customer): Customer[] {
    const customers = this.getCustomers();
    const idx = customers.findIndex((c) => c.id === customer.id);
    let updated: Customer[];
    if (idx >= 0) {
      updated = [...customers];
      updated[idx] = customer;
    } else {
      updated = [...customers, customer];
    }
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(updated));
    return updated;
  },

  updateCustomerBalance(customerId: string, deltaAmount: number): Customer[] {
    const customers = this.getCustomers();
    const c = customers.find((x) => x.id === customerId);
    if (c) {
      c.balance = Number((c.balance + deltaAmount).toFixed(2));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
    return customers;
  },

  getDocuments(): Document[] {
    // Migration: zero out previous mock documents, cash movements, held sales, and customer debts
    const isReset = localStorage.getItem('hajayer_docs_and_sales_zero_v4');
    if (!isReset) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify([]));
      const customers = this.getCustomers().map((c) => ({ ...c, balance: 0 }));
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
      localStorage.setItem('hajayer_docs_and_sales_zero_v4', 'true');
      return [];
    }

    const raw = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  clearAllDocuments(): Document[] {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem('hajayer_docs_and_sales_zero_v4', 'true');
    return [];
  },

  clearAllCashMovements(): CashMovement[] {
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify([]));
    return [];
  },

  clearAllHeldSales(): HeldSale[] {
    localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify([]));
    return [];
  },

  resetAllCustomerBalances(): Customer[] {
    const customers = this.getCustomers().map((c) => ({ ...c, balance: 0 }));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    return customers;
  },

  zeroOutAllSalesAndFinance(): {
    documents: Document[];
    cashMovements: CashMovement[];
    heldSales: HeldSale[];
    customers: Customer[];
  } {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify([]));
    const customers = this.getCustomers().map((c) => ({ ...c, balance: 0 }));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem('hajayer_docs_and_sales_zero_v4', 'true');
    return {
      documents: [],
      cashMovements: [],
      heldSales: [],
      customers,
    };
  },

  saveDocument(doc: Document): Document[] {
    const docs = this.getDocuments();
    const idx = docs.findIndex((d) => d.id === doc.id);
    let updated: Document[];
    if (idx >= 0) {
      updated = [...docs];
      updated[idx] = doc;
    } else {
      updated = [doc, ...docs];
    }
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(updated));

    // Update stock when completing a sale
    if (doc.type === 'SALE') {
      this.updateStock(doc.items.map((it) => ({ productId: it.productId, quantity: it.quantity })));
    } else if (doc.type === 'RETURN') {
      // Return increases stock
      const products = this.getProducts();
      doc.items.forEach((it) => {
        const p = products.find((x) => x.id === it.productId);
        if (p) p.stock += it.quantity;
      });
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }

    // If Credit (آجل), update customer balance
    if (doc.paymentStatus === 'CREDIT' && doc.customerId && doc.customerId !== 'c0') {
      this.updateCustomerBalance(doc.customerId, doc.grandTotal);
    }

    // If Cash, register cash movement
    if (doc.paymentMethod === 'CASH' && doc.paidAmount > 0) {
      const netCash = doc.grandTotal;
      this.addCashMovement({
        type: doc.type === 'RETURN' ? 'OUT' : 'IN',
        amount: netCash,
        reason: `فاتورة ${doc.number} (${doc.type === 'RETURN' ? 'مرتجع' : 'مبيعات'})`,
        cashierName: doc.cashierName,
      });
    }

    return updated;
  },

  deleteDocument(id: string): Document[] {
    const docs = this.getDocuments().filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(docs));
    return docs;
  },

  getCashMovements(): CashMovement[] {
    const isReset = localStorage.getItem('hajayer_docs_and_sales_zero_v4');
    if (!isReset) {
      localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify([]));
      return [];
    }
    const raw = localStorage.getItem(STORAGE_KEYS.CASH_MOVEMENTS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify([]));
      return [];
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  addCashMovement(item: Omit<CashMovement, 'id' | 'date'>): CashMovement[] {
    const current = this.getCashMovements();
    const now = new Date();
    const dateStr = now.toISOString().replace('T', ' ').substring(0, 16);
    const newMovement: CashMovement = {
      ...item,
      id: 'cm-' + Date.now(),
      date: dateStr,
    };
    const updated = [newMovement, ...current];
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify(updated));
    return updated;
  },

  getCashInDrawer(): number {
    const movements = this.getCashMovements();
    return movements.reduce((acc, curr) => {
      if (curr.type === 'START' || curr.type === 'IN') return acc + curr.amount;
      if (curr.type === 'OUT' || curr.type === 'END') return acc - curr.amount;
      return acc;
    }, 0);
  },

  getHeldSales(): HeldSale[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HELD_SALES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveHeldSale(held: HeldSale): HeldSale[] {
    const current = this.getHeldSales();
    const updated = [held, ...current];
    localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify(updated));
    return updated;
  },

  deleteHeldSale(id: string): HeldSale[] {
    const current = this.getHeldSales().filter((h) => h.id !== id);
    localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify(current));
    return current;
  },

  getSettings(): CompanySettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
      return DEFAULT_SETTINGS;
    }
    try {
      const parsed = JSON.parse(raw);
      if (parsed.phone === '0551234567') {
        parsed.phone = '+966 56 340 9344';
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(parsed));
      }
      return parsed;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: CompanySettings): CompanySettings {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  },

  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_USERS;
    }
  },

  saveUser(user: User): User[] {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    let updated: User[];
    if (idx >= 0) {
      updated = [...users];
      updated[idx] = user;
    } else {
      updated = [...users, user];
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return updated;
  },

  deleteUser(userId: string): User[] {
    const updated = this.getUsers().filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(updated));
    return updated;
  },

  updateProductStock(productId: string, newStock: number): Product[] {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx >= 0) {
      products[idx] = { ...products[idx], stock: newStock };
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    }
    return products;
  },

  getActiveUser(): User {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_USER);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // fallback
      }
    }
    return DEFAULT_USERS[0];
  },

  setActiveUser(user: User): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_USER, JSON.stringify(user));
  },

  // Create structured system backup data object
  createBackupPayload(): SystemBackupData {
    const products = this.getProducts();
    const documents = this.getDocuments();
    const customers = this.getCustomers();
    const cashMovements = this.getCashMovements();
    const settings = this.getSettings();
    const users = this.getUsers();
    const heldSales = this.getHeldSales();
    const now = new Date();

    return {
      version: '2.4.0',
      system: 'Hajayer POS & Accounting System',
      appName: 'مؤسسة هجاير للتجاره - نظام المبيعات ونقاط البيع',
      exportDate: now.toISOString(),
      exportTimestamp: now.getTime(),
      metadata: {
        totalProducts: products.length,
        totalDocuments: documents.length,
        totalCustomers: customers.length,
        totalCashMovements: cashMovements.length,
        companyName: settings.commercialName || settings.name,
        currency: settings.currency || 'ر.س.',
      },
      products,
      documents,
      customers,
      cashMovements,
      settings,
      users,
      heldSales,
    };
  },

  // Export full backup as formatted JSON string
  exportAllData(options?: { pretty?: boolean }): string {
    const data = this.createBackupPayload();
    return JSON.stringify(data, null, options?.pretty === false ? 0 : 2);
  },

  // Export products specifically as JSON
  exportProductsJson(pretty: boolean = true): string {
    const products = this.getProducts();
    const payload = {
      system: 'Hajayer POS - Products Export',
      exportDate: new Date().toISOString(),
      count: products.length,
      products,
    };
    return JSON.stringify(payload, null, pretty ? 2 : 0);
  },

  // Export documents (invoices) specifically as JSON
  exportDocumentsJson(pretty: boolean = true): string {
    const documents = this.getDocuments();
    const payload = {
      system: 'Hajayer POS - Invoices Export',
      exportDate: new Date().toISOString(),
      count: documents.length,
      documents,
    };
    return JSON.stringify(payload, null, pretty ? 2 : 0);
  },

  // Helper to trigger direct local file download for any JSON data
  downloadJsonFile(data: string | object, filename: string): void {
    try {
      const jsonStr = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to download JSON file:', err);
      throw err;
    }
  },

  // Export and download full system backup as a local .json file
  downloadBackupFile(customFilename?: string): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    const filename = customFilename || `Hajayer_POS_Backup_${dateStr}.json`;
    const data = this.exportAllData();
    this.downloadJsonFile(data, filename);
    return filename;
  },

  // Export and download products as a local .json file
  downloadProductsFile(customFilename?: string): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = customFilename || `Hajayer_Products_${dateStr}.json`;
    const data = this.exportProductsJson();
    this.downloadJsonFile(data, filename);
    return filename;
  },

  // Export and download documents/invoices as a local .json file
  downloadInvoicesFile(customFilename?: string): string {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const filename = customFilename || `Hajayer_Invoices_${dateStr}.json`;
    const data = this.exportDocumentsJson();
    this.downloadJsonFile(data, filename);
    return filename;
  },

  // Import and restore from JSON string or object
  importData(
    jsonInput: string | object,
    options?: { mode?: 'replace' | 'merge' }
  ): ImportBackupResult {
    const isMerge = options?.mode === 'merge';
    const counts: NonNullable<ImportBackupResult['counts']> = {};
    const errors: string[] = [];

    let parsed: any;
    if (typeof jsonInput === 'string') {
      try {
        parsed = JSON.parse(jsonInput);
      } catch (e: any) {
        return {
          success: false,
          message: 'فشل في تحليل ملف JSON: تنسيق الملف غير صالح.',
          errors: [e?.message || 'Invalid JSON syntax'],
        };
      }
    } else {
      parsed = jsonInput;
    }

    if (!parsed || typeof parsed !== 'object') {
      return {
        success: false,
        message: 'محتوى الملف غير صالح ولا يحتوي على بيانات صالحة للنظام.',
      };
    }

    try {
      // 1. Process Products (supports parsed.products array or direct array of products)
      const incomingProducts = Array.isArray(parsed)
        ? parsed
        : Array.isArray(parsed.products)
        ? parsed.products
        : null;

      if (incomingProducts && incomingProducts.length >= 0) {
        if (isMerge) {
          const current = this.getProducts();
          const map = new Map(current.map((p) => [p.id, p]));
          incomingProducts.forEach((p: Product) => {
            if (p && p.id && p.name) map.set(p.id, p);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          counts.products = merged.length;
        } else {
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(incomingProducts));
          counts.products = incomingProducts.length;
        }
      }

      // 2. Process Documents / Invoices
      if (Array.isArray(parsed.documents)) {
        if (isMerge) {
          const current = this.getDocuments();
          const map = new Map(current.map((d) => [d.id, d]));
          parsed.documents.forEach((d: Document) => {
            if (d && d.id && d.number) map.set(d.id, d);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(merged));
          counts.documents = merged.length;
        } else {
          localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(parsed.documents));
          counts.documents = parsed.documents.length;
        }
      }

      // 3. Process Customers
      if (Array.isArray(parsed.customers)) {
        if (isMerge) {
          const current = this.getCustomers();
          const map = new Map(current.map((c) => [c.id, c]));
          parsed.customers.forEach((c: Customer) => {
            if (c && c.id && c.name) map.set(c.id, c);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(merged));
          counts.customers = merged.length;
        } else {
          localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(parsed.customers));
          counts.customers = parsed.customers.length;
        }
      }

      // 4. Process Cash Movements
      if (Array.isArray(parsed.cashMovements)) {
        if (isMerge) {
          const current = this.getCashMovements();
          const map = new Map(current.map((m) => [m.id, m]));
          parsed.cashMovements.forEach((m: CashMovement) => {
            if (m && m.id) map.set(m.id, m);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify(merged));
          counts.cashMovements = merged.length;
        } else {
          localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify(parsed.cashMovements));
          counts.cashMovements = parsed.cashMovements.length;
        }
      }

      // 5. Process Company Settings
      if (parsed.settings && typeof parsed.settings === 'object') {
        const current = this.getSettings();
        const mergedSettings: CompanySettings = {
          ...current,
          ...parsed.settings,
        };
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(mergedSettings));
      }

      // 6. Process Users
      if (Array.isArray(parsed.users) && parsed.users.length > 0) {
        if (isMerge) {
          const current = this.getUsers();
          const map = new Map(current.map((u) => [u.id, u]));
          parsed.users.forEach((u: User) => {
            if (u && u.id && u.username) map.set(u.id, u);
          });
          const merged = Array.from(map.values());
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(merged));
          counts.users = merged.length;
        } else {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed.users));
          counts.users = parsed.users.length;
        }
      }

      // 7. Process Held Sales (Open sales)
      if (Array.isArray(parsed.heldSales)) {
        localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify(parsed.heldSales));
        counts.heldSales = parsed.heldSales.length;
      }

      // Check if anything was imported
      const hasAny = Object.keys(counts).length > 0 || parsed.settings;
      if (!hasAny) {
        return {
          success: false,
          message: 'الملف لا يحتوي على جداول بيانات معروفة (منتجات، فواتير، عملاء، أو إعدادات).',
        };
      }

      const summaryParts: string[] = [];
      if (counts.products !== undefined) summaryParts.push(`${counts.products} منتج`);
      if (counts.documents !== undefined) summaryParts.push(`${counts.documents} فاتورة`);
      if (counts.customers !== undefined) summaryParts.push(`${counts.customers} عميل`);
      if (counts.cashMovements !== undefined) summaryParts.push(`${counts.cashMovements} حركة خزينة`);

      return {
        success: true,
        message: `تم استيراد واسترجاع بيانات النظام بنجاح (${summaryParts.join('، ')}).`,
        counts,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        message: 'حدث خطأ أثناء حفظ البيانات المستوردة في الذاكرة المحلية.',
        errors: [err?.message || 'Storage write error'],
      };
    }
  },

  // Read a JSON File asynchronously and import its contents
  async importFromJsonFile(
    file: File,
    options?: { mode?: 'replace' | 'merge' }
  ): Promise<ImportBackupResult> {
    return new Promise((resolve) => {
      if (!file) {
        resolve({ success: false, message: 'لم يتم تحديد أي ملف للاستيراد.' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) {
          resolve({ success: false, message: 'ملف النسخة الاحتياطية فارغ.' });
          return;
        }
        const result = this.importData(text, options);
        resolve(result);
      };

      reader.onerror = () => {
        resolve({
          success: false,
          message: 'تعذر قراءة الملف من الجهاز. يرجى التأكد من صلاحيات الملف والمحاولة مرة أخرى.',
        });
      };

      reader.readAsText(file, 'utf-8');
    });
  },

  initializeFreshStore(wipeProducts: boolean = false): void {
    localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CASH_MOVEMENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.HELD_SALES, JSON.stringify([]));
    const customers = this.getCustomers().map((c) => ({ ...c, balance: 0 }));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    localStorage.setItem('hajayer_docs_and_sales_zero_v4', 'true');
    if (wipeProducts) {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
      localStorage.setItem('hajayer_inventory_cleared_v1', 'true');
    }
  },

  resetAll(): void {
    localStorage.clear();
  }
};
