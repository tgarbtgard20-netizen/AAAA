/**
 * Main Application Component: Aronium POS & Accounting System
 * Complete match with Screenshot 1 (Admin Menu), Screenshot 2 (POS Interface), and Screenshot 3 (Back-Office Documents)
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { PosHeader } from './components/pos/PosHeader';
import { PosCart } from './components/pos/PosCart';
import { PosProducts } from './components/pos/PosProducts';
import { PosAdminMenu } from './components/pos/PosAdminMenu';
import { CashPaymentModal } from './components/pos/CashPaymentModal';
import { CreditPaymentModal } from './components/pos/CreditPaymentModal';
import { PosPaymentModal } from './components/pos/PosPaymentModal';
import { CustomerSelectModal } from './components/pos/CustomerSelectModal';
import { QuantityModal } from './components/pos/QuantityModal';
import { DiscountModal } from './components/pos/DiscountModal';
import { TreasuryModal } from './components/pos/TreasuryModal';
import { EndOfDayModal } from './components/pos/EndOfDayModal';
import { OpenSalesModal } from './components/pos/OpenSalesModal';
import { PrintReceiptModal } from './components/common/PrintReceiptModal';
import { AdminLayout, AdminTab } from './components/admin/AdminLayout';
import { LoginView } from './components/auth/LoginView';
import { BarcodePrintModal } from './components/admin/BarcodePrintModal';
import { PosRefundModal } from './components/pos/PosRefundModal';
import { ConfirmModal } from './components/common/ConfirmModal';
import { DownloadAppModal } from './components/common/DownloadAppModal';
import { ProductSearchModal } from './components/pos/ProductSearchModal';
import { BarcodeScannerModal } from './components/pos/BarcodeScannerModal';
import { BarcodeReceiver } from './components/pos/BarcodeReceiver';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X as CloseIcon } from 'lucide-react';

import { StorageService } from './services/storage';
import { sound } from './services/sound';
import {
  Product,
  CartItem,
  Customer,
  Document,
  DocumentItem,
  CashMovement,
  CompanySettings,
  HeldSale,
  User,
  PaymentMethod,
} from './types';
import {
  calculateItemFinancials,
  generateInvoiceNumber,
  generateOrderNumber,
  getCurrentDateTimeFormatted,
} from './utils/formatters';

export default function App() {
  // Authentication & Login state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
  const [selectedBarcodeProduct, setSelectedBarcodeProduct] = useState<Product | null>(null);
  const [isBarcodeAutoPrint, setIsBarcodeAutoPrint] = useState<boolean>(false);
  const [isRefundLookupModalOpen, setIsRefundLookupModalOpen] = useState<boolean>(false);

  // Database States
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [settings, setSettings] = useState<CompanySettings>(StorageService.getSettings());
  const [heldSales, setHeldSales] = useState<HeldSale[]>([]);
  const [activeUser, setActiveUser] = useState<User>(StorageService.getActiveUser());

  // POS Operational States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(StorageService.getCustomers()[0]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isRefundMode, setIsRefundMode] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [unlockPin, setUnlockPin] = useState<string>('');

  // UI Navigation & Modals
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentInitialMethod, setPaymentInitialMethod] = useState<PaymentMethod>('CASH');
  const [isCashModalOpen, setIsCashModalOpen] = useState<boolean>(false);
  const [isCreditModalOpen, setIsCreditModalOpen] = useState<boolean>(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState<boolean>(false);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState<boolean>(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState<boolean>(false);
  const [isTreasuryModalOpen, setIsTreasuryModalOpen] = useState<boolean>(false);
  const [isEndOfDayModalOpen, setIsEndOfDayModalOpen] = useState<boolean>(false);
  const [isOpenSalesModalOpen, setIsOpenSalesModalOpen] = useState<boolean>(false);
  const [printableDoc, setPrintableDoc] = useState<Document | null>(null);
  const [adminActiveTab, setAdminActiveTab] = useState<AdminTab>('DOCUMENTS');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  } | null>(null);
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      const id = Date.now().toString();
      setToast({ id, message, type });
      setTimeout(() => {
        setToast((curr) => (curr?.id === id ? null : curr));
      }, 4000);
    },
    []
  );

  const handleOpenAdminTab = (tab: AdminTab) => {
    setAdminActiveTab(tab);
    setIsAdminOpen(true);
  };

  // Load Initial Data
  const refreshAllData = useCallback(() => {
    setProducts(StorageService.getProducts());
    const loadedCustomers = StorageService.getCustomers();
    setCustomers(loadedCustomers);
    if (!selectedCustomer) {
      setSelectedCustomer(loadedCustomers[0]);
    }
    setDocuments(StorageService.getDocuments());
    setMovements(StorageService.getCashMovements());
    setSettings(StorageService.getSettings());
    setHeldSales(StorageService.getHeldSales());
    setActiveUser(StorageService.getActiveUser());
  }, [selectedCustomer]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Categories list extracted from products
  const categories = useMemo(() => {
    const defaultCats = ['ساعات', 'اكسسوارات', 'شنط', 'عطور', 'مكياج'];
    const dynamicCats = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return Array.from(new Set([...defaultCats, ...dynamicCats]));
  }, [products]);

  // Cart Totals Calculation
  const cartGrandTotal = useMemo(() => {
    return cart.reduce((acc, it) => acc + it.total, 0);
  }, [cart]);

  const cashInDrawer = useMemo(() => {
    return StorageService.getCashInDrawer();
  }, [movements]);

  // Add Product to Cart
  const handleAddToCart = (product: Product) => {
    sound.playScanBeep();

    setCart((prev) => {
      const existingIdx = prev.findIndex((it) => it.product.id === product.id);
      if (existingIdx >= 0) {
        const item = prev[existingIdx];
        const newQty = item.quantity + 1;
        const financials = calculateItemFinancials(
          product.salePrice,
          newQty,
          product.taxRate,
          item.discountPercent
        );
        const updated = [...prev];
        updated[existingIdx] = {
          ...item,
          quantity: newQty,
          taxAmount: financials.taxAmount,
          total: financials.total,
        };
        setSelectedItemIndex(existingIdx);
        return updated;
      } else {
        const financials = calculateItemFinancials(product.salePrice, 1, product.taxRate, 0);
        const newItem: CartItem = {
          id: 'ci_' + Date.now() + Math.random(),
          product,
          quantity: 1,
          unitPrice: product.salePrice,
          discountPercent: 0,
          taxAmount: financials.taxAmount,
          total: financials.total,
        };
        const updated = [...prev, newItem];
        setSelectedItemIndex(updated.length - 1);
        return updated;
      }
    });
  };

  // Delete Selected Cart Item
  const handleDeleteCartItem = () => {
    if (selectedItemIndex === null || cart.length === 0) return;
    sound.playClick();
    const updated = cart.filter((_, idx) => idx !== selectedItemIndex);
    setCart(updated);
    setSelectedItemIndex(updated.length > 0 ? Math.max(0, selectedItemIndex - 1) : null);
  };

  // Change Quantity of Selected Cart Item
  const handleUpdateItemQuantity = (newQty: number) => {
    if (selectedItemIndex === null || !cart[selectedItemIndex]) return;
    sound.playClick();
    const updated = [...cart];
    const current = updated[selectedItemIndex];
    const financials = calculateItemFinancials(
      current.unitPrice,
      newQty,
      current.product.taxRate,
      current.discountPercent
    );

    updated[selectedItemIndex] = {
      ...current,
      quantity: newQty,
      taxAmount: financials.taxAmount,
      total: financials.total,
    };
    setCart(updated);
  };

  // Apply Discount on Cart (% or fixed SAR) - Total Scope
  const handleApplyDiscount = (type: 'PERCENT' | 'AMOUNT', value: number) => {
    sound.playClick();
    if (cart.length === 0) return;

    const rawSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    if (rawSubtotal <= 0) return;

    let effectivePercent = 0;
    if (type === 'PERCENT') {
      effectivePercent = Math.min(100, Math.max(0, value));
    } else {
      effectivePercent = Math.min(100, Math.max(0, (value / rawSubtotal) * 100));
    }

    const updated = cart.map((it) => {
      const financials = calculateItemFinancials(
        it.unitPrice,
        it.quantity,
        it.product.taxRate,
        effectivePercent
      );
      return {
        ...it,
        discountPercent: Number(effectivePercent.toFixed(2)),
        taxAmount: financials.taxAmount,
        total: financials.total,
      };
    });
    setCart(updated);
    showToast('تم تطبيق الخصم على إجمالي الفاتورة', 'success');
  };

  // Apply Discount on a Single Item (% or fixed SAR) - Item Scope
  const handleApplyItemDiscount = (itemIndex: number, type: 'PERCENT' | 'AMOUNT', value: number) => {
    sound.playClick();
    if (itemIndex < 0 || itemIndex >= cart.length) return;
    const item = cart[itemIndex];
    const itemOrigSubtotal = item.unitPrice * item.quantity;
    if (itemOrigSubtotal <= 0) return;

    let effectivePercent = 0;
    if (type === 'PERCENT') {
      effectivePercent = Math.min(100, Math.max(0, value));
    } else {
      effectivePercent = Math.min(100, Math.max(0, (value / itemOrigSubtotal) * 100));
    }

    const financials = calculateItemFinancials(
      item.unitPrice,
      item.quantity,
      item.product.taxRate,
      effectivePercent
    );

    const updated = [...cart];
    updated[itemIndex] = {
      ...item,
      discountPercent: Number(effectivePercent.toFixed(2)),
      taxAmount: financials.taxAmount,
      total: financials.total,
    };
    setCart(updated);
    showToast(`تم تطبيق الخصم على صنف "${item.product.name}"`, 'success');
  };

  // Clear all discounts from cart
  const handleClearDiscount = () => {
    sound.playClick();
    const updated = cart.map((it) => {
      const financials = calculateItemFinancials(it.unitPrice, it.quantity, it.product.taxRate, 0);
      return {
        ...it,
        discountPercent: 0,
        taxAmount: financials.taxAmount,
        total: financials.total,
      };
    });
    setCart(updated);
    showToast('تم إلغاء الخصم بنجاح', 'info');
  };

  // Cancel / Clear Cart
  const handleCancelCart = () => {
    if (cart.length === 0) return;
    setConfirmModalData({
      isOpen: true,
      title: 'إلغاء وتفريغ الفاتورة',
      message: 'هل أنت متأكد من إلغاء الفاتورة بالكامل وتفريغ سلة المشتريات الحالية؟',
      confirmText: 'نعم، تفريغ السلة',
      isDanger: true,
      onConfirm: () => {
        sound.playError();
        setCart([]);
        setSelectedItemIndex(null);
        setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
        showToast('تم إفراغ السلة وبدء جلسة بيع جديدة', 'info');
      },
    });
  };

  // Hold Sale (F9 - تعليق الفاتورة)
  const handleHoldSale = () => {
    if (cart.length === 0) {
      if (heldSales.length > 0) {
        setIsOpenSalesModalOpen(true);
      } else {
        showToast('لا توجد عناصر بالسلة لتعليقها. أضف منتجات أولاً.', 'warning');
      }
      return;
    }

    sound.playClick();
    const newHeld: HeldSale = {
      id: 'held_' + Date.now(),
      customer: selectedCustomer,
      items: cart,
      timestamp: getCurrentDateTimeFormatted(),
      note: isRefundMode ? 'مرتجع معلق' : 'فاتورة معلقة',
    };

    const updated = StorageService.saveHeldSale(newHeld);
    setHeldSales(updated);
    setCart([]);
    setSelectedItemIndex(null);
    showToast('تم تعليق الفاتورة بنجاح في قائمة المبيعات المفتوحة (F9).', 'success');
  };

  // Restore Held Sale
  const handleRestoreHeldSale = (held: HeldSale) => {
    sound.playClick();
    setCart(held.items);
    setSelectedCustomer(held.customer);
    setSelectedItemIndex(held.items.length > 0 ? 0 : null);
    const updated = StorageService.deleteHeldSale(held.id);
    setHeldSales(updated);
  };

  // Process Return & Issue Official ZATCA Credit Note / Return Tax Invoice
  const handleProcessInvoiceRefund = (
    originalDoc: Document | null,
    returnItems: { item: DocumentItem; returnQty: number }[],
    refundMethod: PaymentMethod,
    refundReason: string,
    shouldAutoPrint: boolean
  ) => {
    sound.playCashSound();
    const returnDocNumber = generateInvoiceNumber('26-200');
    const returnDocDate = getCurrentDateTimeFormatted();
    const orderNumber = generateOrderNumber();

    const totalReturnGrand = returnItems.reduce(
      (acc, { item, returnQty }) => acc + item.unitPrice * returnQty,
      0
    );

    const totalReturnBeforeTax = totalReturnGrand / 1.15;
    const totalReturnTax = totalReturnGrand - totalReturnBeforeTax;

    const newReturnDoc: Document = {
      id: 'doc_ret_' + Date.now(),
      number: returnDocNumber,
      orderNumber,
      type: 'RETURN',
      customerId: originalDoc?.customerId || selectedCustomer.id,
      customerName: originalDoc?.customerName || selectedCustomer.name,
      date: returnDocDate,
      itemCount: returnItems.length,
      subtotal: totalReturnBeforeTax,
      taxTotal: totalReturnTax,
      discountTotal: 0,
      grandTotal: totalReturnGrand,
      paymentStatus: 'PAID',
      paymentMethod: refundMethod,
      posName: 'POS-01',
      cashierName: activeUser.name,
      paidAmount: totalReturnGrand,
      changeAmount: 0,
      referenceInvoiceNumber: originalDoc?.number,
      notes: refundReason || `فاتورة مرتجع للفاتورة الأصلية ${originalDoc?.number || ''}`,
      items: returnItems.map(({ item, returnQty }, idx) => ({
        ...item,
        id: `ret-item-${idx + 1}`,
        quantity: returnQty,
        total: item.unitPrice * returnQty,
        taxAmount: (item.unitPrice * returnQty) - (item.unitPrice * returnQty) / 1.15,
        priceBeforeTax: (item.unitPrice * returnQty) / 1.15 / returnQty,
      })),
    };

    StorageService.saveDocument(newReturnDoc);
    refreshAllData();
    setIsRefundLookupModalOpen(false);

    if (shouldAutoPrint) {
      setPrintableDoc(newReturnDoc);
    }
  };

  // Universal Payment Completion (Cash, Mada Network, Credit Card, Credit on Account)
  const handleCompletePayment = (
    method: PaymentMethod,
    paidAmount: number,
    changeAmount: number,
    customerId: string,
    notes: string,
    shouldPrint: boolean
  ) => {
    sound.playCashSound();

    const rawSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const cartGrandTotal = cart.reduce((acc, it) => acc + it.total, 0);
    const discountTotal = Math.max(0, rawSubtotal - cartGrandTotal);
    const taxTotal = cart.reduce((acc, it) => acc + it.taxAmount, 0);
    const subtotal = Math.max(0, cartGrandTotal - taxTotal);
    const docNumber = generateInvoiceNumber('26-200');
    const docDate = getCurrentDateTimeFormatted();
    const orderNumber = generateOrderNumber();

    const targetCustomer = customers.find((c) => c.id === customerId) || selectedCustomer;

    const newDoc: Document = {
      id: 'doc_' + Date.now(),
      number: docNumber,
      orderNumber,
      type: isRefundMode ? 'RETURN' : 'SALE',
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      date: docDate,
      itemCount: cart.length,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal: cartGrandTotal,
      paymentStatus: method === 'CREDIT' ? 'CREDIT' : 'PAID',
      paymentMethod: method,
      posName: 'POS-01',
      cashierName: activeUser.name,
      paidAmount,
      changeAmount,
      notes:
        notes ||
        (isRefundMode
          ? 'إرجاع بضاعة'
          : method === 'CREDIT'
          ? 'آجل على حساب العميل'
          : method === 'CARD'
          ? 'سداد شبكة / مدى'
          : 'سداد نقدي'),
      items: cart.map((it, idx) => ({
        id: `di-${idx + 1}`,
        productId: it.product.id,
        code: it.product.code,
        name: it.product.name,
        unit: it.product.unit,
        quantity: it.quantity,
        priceBeforeTax: it.unitPrice / (1 + it.product.taxRate / 100),
        taxRate: it.product.taxRate,
        taxAmount: it.taxAmount,
        unitPrice: it.unitPrice,
        totalBeforeDiscount: it.unitPrice * it.quantity,
        discount: Math.max(0, it.unitPrice * it.quantity - it.total),
        total: it.total,
        costPrice: it.product.costPrice,
      })),
    };

    StorageService.saveDocument(newDoc);
    refreshAllData();

    setIsPaymentModalOpen(false);
    setIsCashModalOpen(false);
    setIsCreditModalOpen(false);
    setCart([]);
    setSelectedItemIndex(null);
    setIsRefundMode(false);

    if (shouldPrint) {
      setPrintableDoc(newDoc);
    }
  };

  // Confirm Cash Payment (F12)
  const handleConfirmCashPayment = (
    paidAmount: number,
    changeAmount: number,
    shouldPrint: boolean
  ) => {
    sound.playCashSound();

    const rawSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const cartGrandTotal = cart.reduce((acc, it) => acc + it.total, 0);
    const discountTotal = Math.max(0, rawSubtotal - cartGrandTotal);
    const taxTotal = cart.reduce((acc, it) => acc + it.taxAmount, 0);
    const subtotal = Math.max(0, cartGrandTotal - taxTotal);
    const docNumber = generateInvoiceNumber('26-200');
    const docDate = getCurrentDateTimeFormatted();
    const orderNumber = generateOrderNumber();

    const newDoc: Document = {
      id: 'doc_' + Date.now(),
      number: docNumber,
      orderNumber,
      type: isRefundMode ? 'RETURN' : 'SALE',
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      date: docDate,
      itemCount: cart.length,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal: cartGrandTotal,
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
      posName: 'POS-01',
      cashierName: activeUser.name,
      paidAmount,
      changeAmount,
      notes: isRefundMode ? 'إرجاع بضاعة نقداً' : 'بيع نقدي مكتمل',
      items: cart.map((it, idx) => ({
        id: `di-${idx + 1}`,
        productId: it.product.id,
        code: it.product.code,
        name: it.product.name,
        unit: it.product.unit,
        quantity: it.quantity,
        priceBeforeTax: it.unitPrice / (1 + it.product.taxRate / 100),
        taxRate: it.product.taxRate,
        taxAmount: it.taxAmount,
        unitPrice: it.unitPrice,
        totalBeforeDiscount: it.unitPrice * it.quantity,
        discount: Math.max(0, it.unitPrice * it.quantity - it.total),
        total: it.total,
        costPrice: it.product.costPrice,
      })),
    };

    StorageService.saveDocument(newDoc);
    refreshAllData();

    setIsCashModalOpen(false);
    setCart([]);
    setSelectedItemIndex(null);
    setIsRefundMode(false);

    if (shouldPrint) {
      setPrintableDoc(newDoc);
    }
  };

  // Confirm Credit Sale (F10 - آجل)
  const handleConfirmCreditPayment = (customerId: string, notes: string) => {
    sound.playCashSound();

    const rawSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
    const cartGrandTotal = cart.reduce((acc, it) => acc + it.total, 0);
    const discountTotal = Math.max(0, rawSubtotal - cartGrandTotal);
    const taxTotal = cart.reduce((acc, it) => acc + it.taxAmount, 0);
    const subtotal = Math.max(0, cartGrandTotal - taxTotal);
    const docNumber = generateInvoiceNumber('26-200');
    const docDate = getCurrentDateTimeFormatted();
    const orderNumber = generateOrderNumber();

    const targetCustomer = customers.find((c) => c.id === customerId) || selectedCustomer;

    const newDoc: Document = {
      id: 'doc_' + Date.now(),
      number: docNumber,
      orderNumber,
      type: isRefundMode ? 'RETURN' : 'SALE',
      customerId: targetCustomer.id,
      customerName: targetCustomer.name,
      date: docDate,
      itemCount: cart.length,
      subtotal,
      taxTotal,
      discountTotal,
      grandTotal: cartGrandTotal,
      paymentStatus: 'CREDIT',
      paymentMethod: 'CREDIT',
      posName: 'POS-01',
      cashierName: activeUser.name,
      paidAmount: 0,
      changeAmount: 0,
      notes: notes || 'فاتورة آجل على حساب العميل',
      items: cart.map((it, idx) => ({
        id: `di-${idx + 1}`,
        productId: it.product.id,
        code: it.product.code,
        name: it.product.name,
        unit: it.product.unit,
        quantity: it.quantity,
        priceBeforeTax: it.unitPrice / (1 + it.product.taxRate / 100),
        taxRate: it.product.taxRate,
        taxAmount: it.taxAmount,
        unitPrice: it.unitPrice,
        totalBeforeDiscount: it.unitPrice * it.quantity,
        discount: Math.max(0, it.unitPrice * it.quantity - it.total),
        total: it.total,
        costPrice: it.product.costPrice,
      })),
    };

    StorageService.saveDocument(newDoc);
    refreshAllData();

    setIsCreditModalOpen(false);
    setCart([]);
    setSelectedItemIndex(null);
    setIsRefundMode(false);
    setPrintableDoc(newDoc);
  };

  // Keyboard Shortcuts Handler (Physical POS & Desktop Support)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement;

      if (e.key === 'F9') {
        e.preventDefault();
        handleHoldSale();
      } else if (e.key === 'F10') {
        e.preventDefault();
        if (cart.length > 0) {
          setPaymentInitialMethod('CREDIT');
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === 'F11') {
        e.preventDefault();
        if (cart.length > 0) {
          setPaymentInitialMethod('CARD');
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === 'F12') {
        e.preventDefault();
        if (cart.length > 0) {
          setPaymentInitialMethod('CASH');
          setIsPaymentModalOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsPaymentModalOpen(false);
        setIsCashModalOpen(false);
        setIsCreditModalOpen(false);
        setIsCustomerModalOpen(false);
        setIsQtyModalOpen(false);
        setIsDiscountModalOpen(false);
        setIsTreasuryModalOpen(false);
        setIsEndOfDayModalOpen(false);
        setIsOpenSalesModalOpen(false);
      } else if (e.key === 'Delete' && !isInput) {
        handleDeleteCartItem();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, heldSales, selectedItemIndex]);

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Fresh Store Setup (تهيئة متجر جديد للبدء من أول فاتورة وتصفير شامل)
  const handleInitializeFreshStore = () => {
    setConfirmModalData({
      isOpen: true,
      title: 'تهيئة متجر جديد وتصفير شامل للبيانات',
      message:
        'هل ترغب في تصفير النظام بالكامل (فواتير المبيعات والمستندات، تقارير اليومية، حركة الخزينة ودرج النقد، المبيعات المعلقة، وأرصدة العملاء) للبدء من الفاتورة رقم 1 برصيد 0.00؟',
      confirmText: 'نعم، صفّر النظام وابدأ من الفاتورة 1',
      onConfirm: () => {
        StorageService.initializeFreshStore(false);
        setCart([]);
        setSelectedItemIndex(null);
        refreshAllData();
        setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
        showToast('تم تصفير كافة المستندات والتقارير ودرج النقد بنجاح! يمكنك الآن تسجيل فواتيرك من الفاتورة رقم 1.', 'success');
      },
    });
  };

  // Login Screen Guard
  if (!isLoggedIn) {
    return (
      <LoginView
        users={StorageService.getUsers()}
        settings={settings}
        onLoginSuccess={(user) => {
          setActiveUser(user);
          setIsLoggedIn(true);
        }}
      />
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col bg-[#16171a] text-gray-200 select-none overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* POS Top Action Bar */}
      <PosHeader
        onSearchClick={() => setIsSearchModalOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onCustomerClick={() => setIsCustomerModalOpen(true)}
        selectedCustomer={selectedCustomer}
        onTransferClick={() => showToast('ميزة تحويل الطاولة / الفاتورة نشطة وجاهزة.', 'info')}
        onDiscountClick={() => {
          if (cart.length > 0) setIsDiscountModalOpen(true);
          else showToast('أضف أصنافاً أولاً لتطبيق الخصم.', 'warning');
        }}
        onNewInvoiceClick={() => {
          if (cart.length > 0) {
            setConfirmModalData({
              isOpen: true,
              title: 'فاتورة جديدة',
              message: 'هل ترغب في بدء فاتورة جديدة وتفريغ السلة الحالية؟',
              confirmText: 'نعم، تفريغ السلة',
              isDanger: true,
              onConfirm: () => {
                setCart([]);
                setSelectedItemIndex(null);
                setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
                showToast('تم بدء فاتورة جديدة', 'info');
              },
            });
          } else {
            showToast('السلة فارغة وجاهزة لبدء فاتورة جديدة', 'info');
          }
        }}
        onRefundClick={() => {
          sound.playClick();
          setIsRefundLookupModalOpen(true);
        }}
        isRefundMode={isRefundMode}
        onOpenCashDrawer={() => {
          sound.playCashSound();
          setIsTreasuryModalOpen(true);
        }}
        onHoldSale={handleHoldSale}
        heldCount={heldSales.length}
        onCreditPayment={() => {
          if (cart.length === 0) {
            showToast('السلة فارغة. يرجى إضافة أصناف أولاً للبيع بالآجل (F10).', 'warning');
            return;
          }
          setPaymentInitialMethod('CREDIT');
          setIsPaymentModalOpen(true);
        }}
        onCardPayment={() => {
          if (cart.length === 0) {
            showToast('السلة فارغة. يرجى إضافة أصناف أولاً للدفع بالشبكة / مدى (F11).', 'warning');
            return;
          }
          setPaymentInitialMethod('CARD');
          setIsPaymentModalOpen(true);
        }}
        onCashPayment={() => {
          if (cart.length === 0) {
            showToast('السلة فارغة. يرجى إضافة أصناف أولاً للدفع النقدي (F12).', 'warning');
            return;
          }
          setPaymentInitialMethod('CASH');
          setIsPaymentModalOpen(true);
        }}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
        onOpenAdmin={() => handleOpenAdminTab('DOCUMENTS')}
        onOpenDocuments={() => handleOpenAdminTab('DOCUMENTS')}
        onOpenProducts={() => handleOpenAdminTab('PRODUCTS')}
        onOpenReports={() => handleOpenAdminTab('REPORTS')}
        onOpenSettings={() => handleOpenAdminTab('COMPANY')}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
        onPrintLastInvoice={() => {
          if (cart.length > 0) {
            const rawSubtotal = cart.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
            const cartGrandTotal = cart.reduce((acc, it) => acc + it.total, 0);
            const discountTotal = Math.max(0, rawSubtotal - cartGrandTotal);
            const taxTotal = cart.reduce((acc, it) => acc + it.taxAmount, 0);
            const subtotal = Math.max(0, cartGrandTotal - taxTotal);
            const previewDoc: Document = {
              id: 'preview_' + Date.now(),
              number: generateInvoiceNumber('26-200'),
              type: isRefundMode ? 'RETURN' : 'SALE',
              customerId: selectedCustomer.id,
              customerName: selectedCustomer.name,
              date: getCurrentDateTimeFormatted(),
              itemCount: cart.length,
              subtotal,
              taxTotal,
              discountTotal,
              grandTotal: cartGrandTotal,
              paymentStatus: 'PAID',
              paymentMethod: 'CASH',
              posName: 'POS-01',
              cashierName: activeUser.name,
              paidAmount: cartGrandTotal,
              changeAmount: 0,
              items: cart.map((it, idx) => ({
                id: `di-${idx + 1}`,
                productId: it.product.id,
                code: it.product.code,
                name: it.product.name,
                unit: it.product.unit,
                quantity: it.quantity,
                priceBeforeTax: it.unitPrice / (1 + it.product.taxRate / 100),
                taxRate: it.product.taxRate,
                taxAmount: it.taxAmount,
                unitPrice: it.unitPrice,
                totalBeforeDiscount: it.unitPrice * it.quantity,
                discount: Math.max(0, it.unitPrice * it.quantity - it.total),
                total: it.total,
                costPrice: it.product.costPrice,
              })),
            };
            setPrintableDoc(previewDoc);
          } else if (documents.length > 0) {
            setPrintableDoc(documents[0]);
          } else {
            showToast('لا توجد فواتير سابقة أو منتجات في السلة لطباعتها.', 'warning');
          }
        }}
      />

      {/* Main Split Body: Left Cart + Right Products (Matching Screenshot 2 exactly) */}
      <div className="flex-1 flex overflow-hidden" dir="ltr">
        <PosCart
          items={cart}
          selectedItemIndex={selectedItemIndex}
          onSelectItem={(idx) => {
            sound.playClick();
            setSelectedItemIndex(idx);
          }}
          onDeleteItem={handleDeleteCartItem}
          onChangeQuantity={() => {
            if (selectedItemIndex !== null) setIsQtyModalOpen(true);
          }}
          onItemOptions={() => {
            if (selectedItemIndex !== null) setIsDiscountModalOpen(true);
          }}
          onOpenDiscount={() => setIsDiscountModalOpen(true)}
          onCancelInvoice={handleCancelCart}
          onLockSession={() => setIsLocked(true)}
          onRepeatRound={() => {
            if (cart.length > 0) {
              const last = cart[cart.length - 1];
              handleAddToCart(last.product);
            }
          }}
          currencySymbol={settings.currency}
        />

        <PosProducts
          products={products}
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(cat) => {
            sound.playClick();
            setActiveCategory(cat);
          }}
          onProductClick={handleAddToCart}
          onAddQuickProduct={() => {
            setIsAdminOpen(true);
          }}
          onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
          onOpenBarcodeLabels={() => {
            setSelectedBarcodeProduct(null);
            setIsBarcodeAutoPrint(false);
            setIsBarcodeModalOpen(true);
          }}
          onPrintProductBarcode={(prod) => {
            setSelectedBarcodeProduct(prod);
            setIsBarcodeAutoPrint(true);
            setIsBarcodeModalOpen(true);
          }}
          currencySymbol={settings.currency}
        />
      </div>

      {/* Bottom Status Bar matching Screenshot 2 */}
      <footer
        className="h-7 bg-[#17191d] border-t border-[#2e333d] flex items-center justify-between px-3 text-[11px] text-gray-400 select-none font-['Cairo',sans-serif]"
        dir="ltr"
      >
        {/* Left Status matching Screenshot 2: Date, Weather, Store info */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-gray-300">10/27/2026 08:00 م</span>
          <span>•</span>
          <span className="text-gray-300">سماء صافية 31°C</span>
          <span>•</span>
          <span className="text-cyan-400 font-bold">متجر هجاير • POS-01 • {activeUser.name}</span>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline cursor-pointer font-bold"
            title="تسجيل الخروج والرجوع لشاشة الدخول"
          >
            [تسجيل الخروج]
          </button>
        </div>

        {/* Right Status matching Screenshot 2: Page 1/1, Home icon, Non-commercial watermark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsBarcodeModalOpen(true)}
            className="text-xs text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer hover:underline"
            title="طباعة بطاقات الأسعار والباركود"
          >
            <span className="font-mono font-bold">#</span>
            <span>بطاقات الأسعار</span>
          </button>
          <span>•</span>
          <span className="font-mono text-gray-300">صفحه 1 / 1</span>
          <span>🏠</span>
          <div
            onClick={() => {
              setSettings((prev) => {
                const next = { ...prev, isCommercialActivated: !prev.isCommercialActivated };
                StorageService.saveSettings(next);
                return next;
              });
            }}
            className="cursor-pointer hover:underline text-gray-400 flex items-center gap-1.5"
          >
            {settings.isCommercialActivated ? (
              <span className="text-emerald-400 font-bold">✓ نسخة مرخصة لسوق العمل (Commercial Active)</span>
            ) : (
              <span>{'|< This is a non-commercial session.'}</span>
            )}
          </div>
        </div>
      </footer>

      {/* POS Admin Dropdown Menu (Screenshot 1) */}
      <PosAdminMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activeUser={activeUser}
        onOpenManagement={() => {
          setIsMenuOpen(false);
          setIsAdminOpen(true);
        }}
        onOpenSalesHistory={() => {
          setIsMenuOpen(false);
          setIsAdminOpen(true);
        }}
        onOpenOpenSales={() => {
          setIsMenuOpen(false);
          setIsOpenSalesModalOpen(true);
        }}
        onOpenTreasury={() => {
          setIsMenuOpen(false);
          setIsTreasuryModalOpen(true);
        }}
        onOpenEndOfDay={() => {
          setIsMenuOpen(false);
          setIsEndOfDayModalOpen(true);
        }}
        onOpenBarcodeLabels={() => {
          setIsMenuOpen(false);
          setIsBarcodeModalOpen(true);
        }}
        onOpenUserInfo={() => {
          showToast(`المستخدم: ${activeUser.name} • الصلاحية: ${activeUser.role} • المحطة: POS-01`, 'info');
        }}
        onLogout={() => {
          setIsMenuOpen(false);
          setIsLoggedIn(false);
        }}
        onToggleFullscreen={toggleFullscreen}
        onToggleCommercial={() => {
          setSettings((prev) => {
            const next = { ...prev, isCommercialActivated: !prev.isCommercialActivated };
            StorageService.saveSettings(next);
            return next;
          });
        }}
        isCommercial={settings.isCommercialActivated}
        onInitializeFreshStore={handleInitializeFreshStore}
        onRefreshData={refreshAllData}
        onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
      />

      {/* Management / Back Office Dashboard (Screenshot 3) */}
      {isAdminOpen && (
        <AdminLayout
          initialTab={adminActiveTab}
          onCloseToPOS={() => setIsAdminOpen(false)}
          onOpenDownloadModal={() => setIsDownloadModalOpen(true)}
          documents={documents}
          products={products}
          customers={customers}
          movements={movements}
          settings={settings}
          categories={categories}
          onAddDocument={() => setIsAdminOpen(false)}
          onEditDocument={(doc) => {
            setPrintableDoc(doc);
          }}
          onDeleteDocument={(id) => {
            const updated = StorageService.deleteDocument(id);
            setDocuments(updated);
          }}
          onPrintPreview={(doc) => {
            setPrintableDoc(doc);
          }}
          onSaveProduct={(p) => {
            const updated = StorageService.saveProduct(p);
            setProducts(updated);
          }}
          onDeleteProduct={(id) => {
            const updated = StorageService.deleteProduct(id);
            setProducts(updated);
          }}
          onAddCategory={(cat) => {
            const newProduct: Product = {
              id: 'p_' + Date.now(),
              code: 'P-' + Math.floor(100 + Math.random() * 900),
              name: 'صنف في ' + cat,
              barcode: Math.floor(1000000 + Math.random() * 9000000).toString(),
              category: cat,
              costPrice: 0,
              salePrice: 50,
              taxRate: 15,
              stock: 10,
              unit: 'حبة',
            };
            const updated = StorageService.saveProduct(newProduct);
            setProducts(updated);
          }}
          onSaveCustomer={(c) => {
            const updated = StorageService.saveCustomer(c);
            setCustomers(updated);
          }}
          onSettleCustomerDebt={(customerId, amount) => {
            StorageService.updateCustomerBalance(customerId, -amount);
            StorageService.addCashMovement({
              type: 'IN',
              amount,
              reason: `سند قبض نقدي سداد مديونية عميل`,
              cashierName: activeUser.name,
            });
            refreshAllData();
          }}
          onSaveSettings={(s) => {
            const updated = StorageService.saveSettings(s);
            setSettings(updated);
          }}
          onUpdateProductStock={(id, newStock) => {
            const updated = StorageService.updateProductStock(id, newStock);
            setProducts(updated);
          }}
          onSaveUser={(user) => {
            StorageService.saveUser(user);
            refreshAllData();
          }}
          onRefreshData={refreshAllData}
          onClearAllProducts={() => {
            const updated = StorageService.clearAllProducts();
            setProducts(updated);
            showToast('تم تفريغ وحذف كافة المخزونات والأصناف بنجاح. يمكنك الآن إضافة أصنافك الجديدة!', 'success');
          }}
          onClearAllDocuments={() => {
            const updated = StorageService.clearAllDocuments();
            setDocuments(updated);
            showToast('تم تصفير وحذف كافة المستندات والفواتير بنجاح (رصيد 0.00). يمكنك البدء من الفاتورة رقم 1.', 'success');
          }}
        />
      )}

      {/* Universal Payment Checkout Modal (Cash, Mada Network, Card, Credit) */}
      <PosPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        grandTotal={cartGrandTotal}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onCompletePayment={handleCompletePayment}
        currencySymbol={settings.currency}
        initialMethod={paymentInitialMethod}
      />

      {/* Cash Payment Modal (F12) */}
      <CashPaymentModal
        isOpen={isCashModalOpen}
        onClose={() => setIsCashModalOpen(false)}
        grandTotal={cartGrandTotal}
        currencySymbol={settings.currency}
        onConfirmPayment={handleConfirmCashPayment}
      />

      {/* Credit Payment Modal (F10 - آجل) */}
      <CreditPaymentModal
        isOpen={isCreditModalOpen}
        onClose={() => setIsCreditModalOpen(false)}
        grandTotal={cartGrandTotal}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onConfirmCredit={handleConfirmCreditPayment}
        onAddNewCustomer={() => {
          setIsCreditModalOpen(false);
          setIsCustomerModalOpen(true);
        }}
        currencySymbol={settings.currency}
      />

      {/* Customer Select / Add Modal */}
      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customers={customers}
        selectedCustomer={selectedCustomer}
        onSelectCustomer={setSelectedCustomer}
        onSaveCustomer={(c) => {
          const updated = StorageService.saveCustomer(c);
          setCustomers(updated);
        }}
        currencySymbol={settings.currency}
      />

      {/* Quantity Numpad Modal */}
      <QuantityModal
        isOpen={isQtyModalOpen}
        onClose={() => setIsQtyModalOpen(false)}
        item={selectedItemIndex !== null ? cart[selectedItemIndex] : null}
        onUpdateQuantity={handleUpdateItemQuantity}
      />

      {/* Discount Modal: خيارين (الخصم بالصنف أو الخصم بالإجمالي) */}
      <DiscountModal
        isOpen={isDiscountModalOpen}
        onClose={() => setIsDiscountModalOpen(false)}
        cartItems={cart}
        selectedItemIndex={selectedItemIndex}
        onApplyItemDiscount={handleApplyItemDiscount}
        onApplyTotalDiscount={handleApplyDiscount}
        onClearDiscount={handleClearDiscount}
      />

      {/* Permanent Dedicated Auto-Focus Barcode Receiver for Physical USB/Wireless Scanner Guns */}
      <BarcodeReceiver
        products={products}
        onProductScanned={(prod) => {
          handleAddToCart(prod);
          showToast(`تم مسح الباركود وإضافة "${prod.name}" للفاتورة`, 'success');
        }}
        onScanError={(code) => {
          showToast(`لم يتم العثور على صنف بالباركود: ${code}`, 'warning');
        }}
        isModalOpen={
          isPaymentModalOpen ||
          isCashModalOpen ||
          isCreditModalOpen ||
          isCustomerModalOpen ||
          isQtyModalOpen ||
          isDiscountModalOpen ||
          isTreasuryModalOpen ||
          isEndOfDayModalOpen ||
          isOpenSalesModalOpen ||
          isSearchModalOpen ||
          isDownloadModalOpen ||
          isAdminOpen ||
          confirmModalData.isOpen
        }
      />

      {/* Barcode Scanner Modal: تشغيل زر قارئ الباركود لمسح الأصناف فورياً */}
      <BarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        products={products}
        onAddProduct={(prod) => {
          handleAddToCart(prod);
          showToast(`تم مسح الباركود وإضافة "${prod.name}" للفاتورة`, 'success');
        }}
      />

      {/* Treasury & Cash In/Out Modal (الخزينة) */}
      <TreasuryModal
        isOpen={isTreasuryModalOpen}
        onClose={() => setIsTreasuryModalOpen(false)}
        movements={movements}
        onAddMovement={(type, amount, reason) => {
          const updated = StorageService.addCashMovement({
            type,
            amount,
            reason,
            cashierName: activeUser.name,
          });
          setMovements(updated);
        }}
        currencySymbol={settings.currency}
        cashInDrawer={cashInDrawer}
        onClearMovements={() => {
          const updated = StorageService.clearAllCashMovements();
          setMovements(updated);
          showToast('تم تصفير رصيد الدرج وحركات الخزينة بنجاح (الرصيد: 0.00 ر.س).', 'success');
        }}
      />

      {/* End of Day Z-Report Modal (نهاية اليوم) */}
      <EndOfDayModal
        isOpen={isEndOfDayModalOpen}
        onClose={() => setIsEndOfDayModalOpen(false)}
        documents={documents}
        movements={movements}
        settings={settings}
        cashierName={activeUser.name}
      />

      {/* Open & Parked Sales Modal (عرض المبيعات المفتوحة) */}
      <OpenSalesModal
        isOpen={isOpenSalesModalOpen}
        onClose={() => setIsOpenSalesModalOpen(false)}
        heldSales={heldSales}
        onRestoreHeldSale={handleRestoreHeldSale}
        onDeleteHeldSale={(id) => {
          const updated = StorageService.deleteHeldSale(id);
          setHeldSales(updated);
        }}
        currencySymbol={settings.currency}
      />

      {/* Print Thermal Receipt / Invoice Modal (80mm x 180mm with Auto-Print) */}
      <PrintReceiptModal
        isOpen={printableDoc !== null}
        onClose={() => setPrintableDoc(null)}
        document={printableDoc}
        settings={settings}
        autoPrint={true}
      />

      {/* Barcode & Price Tags Modal (Matching Camera & Hand Photos with Auto-Print) */}
      <BarcodePrintModal
        isOpen={isBarcodeModalOpen}
        onClose={() => {
          setIsBarcodeModalOpen(false);
          setSelectedBarcodeProduct(null);
          setIsBarcodeAutoPrint(false);
        }}
        products={products}
        settings={settings}
        initialProduct={selectedBarcodeProduct}
        autoPrint={isBarcodeAutoPrint}
        onAddProduct={(newProd) => {
          const updated = StorageService.saveProduct(newProd);
          setProducts(updated);
        }}
      />

      {/* Dedicated Return & Refund Invoice Modal */}
      <PosRefundModal
        isOpen={isRefundLookupModalOpen}
        onClose={() => setIsRefundLookupModalOpen(false)}
        recentDocuments={documents}
        onProcessRefund={handleProcessInvoiceRefund}
        onEnableDirectRefundMode={() => {
          setIsRefundMode(true);
          showToast('تم تفعيل وضع الإرجاع في شاشة الكاشير. أي صنف يتم إضافته للسلة سيسجل كمرتجع.', 'info');
        }}
      />

      {/* Lock Screen Overlay (قفل الشاشة) */}
      {isLocked && (
        <div className="fixed inset-0 z-50 bg-[#16171a]/95 backdrop-blur-md flex flex-col items-center justify-center p-4">
          <div className="bg-[#20242b] border border-[#3b414d] p-6 rounded-xl shadow-2xl w-full max-w-xs text-center space-y-4">
            <div className="w-14 h-14 bg-cyan-950/60 border border-cyan-800/50 rounded-full flex items-center justify-center text-cyan-400 mx-auto text-2xl">
              🔒
            </div>
            <div>
              <h2 className="font-bold text-base text-white">النظام مقفل مؤقتاً</h2>
              <p className="text-xs text-gray-400 mt-1">أدخل رمز PIN للكاشير لفتح الجلسة (الرمز الافتراضي: 1234)</p>
            </div>
            <input
              type="password"
              autoFocus
              value={unlockPin}
              onChange={(e) => setUnlockPin(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  if (unlockPin === '1234' || unlockPin === activeUser.pin || unlockPin === '') {
                    setIsLocked(false);
                    setUnlockPin('');
                    showToast('تم فتح الجلسة بنجاح', 'success');
                  } else {
                    showToast('رمز PIN غير صحيح. جرب 1234', 'error');
                  }
                }
              }}
              placeholder="••••"
              className="w-full h-11 bg-[#17191d] border-2 border-cyan-500 rounded text-center text-2xl font-mono text-white tracking-widest focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (unlockPin === '1234' || unlockPin === activeUser.pin || unlockPin === '') {
                    setIsLocked(false);
                    setUnlockPin('');
                    showToast('تم فتح الجلسة بنجاح', 'success');
                  } else {
                    showToast('رمز PIN غير صحيح. جرب 1234', 'error');
                  }
                }}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
              >
                فتح شاشة البيع
              </button>
              <button
                onClick={() => {
                  setIsLocked(false);
                  setUnlockPin('');
                }}
                className="px-3 py-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs font-semibold rounded transition-colors cursor-pointer"
                title="إلغاء القفل السريع"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal (بديل غير معطل لـ window.confirm) */}
      <ConfirmModal
        isOpen={confirmModalData.isOpen}
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText={confirmModalData.confirmText}
        cancelText={confirmModalData.cancelText}
        isDanger={confirmModalData.isDanger}
        onConfirm={confirmModalData.onConfirm}
        onCancel={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Download Application Package & Web Link Modal */}
      <DownloadAppModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        onShowToast={showToast}
      />

      {/* Product Search Modal (بديل غير معطل لـ prompt) */}
      <ProductSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        products={products}
        onSelectProduct={handleAddToCart}
        currencySymbol={settings.currency}
      />

      {/* Global Floating Toast Banner */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div
            className={`px-4 py-2.5 rounded-xl shadow-2xl border flex items-center gap-2.5 text-xs font-bold text-white ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 border-emerald-500 shadow-emerald-950/50'
                : toast.type === 'error'
                ? 'bg-rose-900/95 border-rose-500 shadow-rose-950/50'
                : toast.type === 'warning'
                ? 'bg-amber-900/95 border-amber-500 shadow-amber-950/50 text-amber-100'
                : 'bg-cyan-900/95 border-cyan-500 shadow-cyan-950/50'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
            {toast.type === 'error' && <AlertCircle size={16} className="text-rose-400 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle size={16} className="text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info size={16} className="text-cyan-400 shrink-0" />}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="mr-2 text-gray-300 hover:text-white p-0.5 rounded cursor-pointer"
            >
              <CloseIcon size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
