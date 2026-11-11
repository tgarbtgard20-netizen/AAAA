/**
 * Master Admin Management Layout matching Screenshot 3
 */
import React, { useState } from 'react';
import {
  ArrowRight,
  X,
  LayoutDashboard,
  FileText,
  Package,
  Archive,
  BarChart3,
  Users,
  Heart,
  ShieldCheck,
  CreditCard,
  Globe,
  Percent,
  Building2,
  Download,
} from 'lucide-react';
import { Document, Product, Customer, CashMovement, CompanySettings, User } from '../../types';
import { DocumentsView } from './DocumentsView';
import { DashboardView } from './DashboardView';
import { ProductsView } from './ProductsView';
import { ReportsView } from './ReportsView';
import { CustomersView } from './CustomersView';
import { CompanySettingsView } from './CompanySettingsView';
import { InventoryView } from './InventoryView';
import { PromotionsView } from './PromotionsView';
import { SecurityUsersView } from './SecurityUsersView';
import { PaymentTypesView } from './PaymentTypesView';
import { CountriesView } from './CountriesView';
import { TaxRatesView } from './TaxRatesView';
import { ZatcaView } from './ZatcaView';
import { BarcodePrintModal } from './BarcodePrintModal';
import { StorageService } from '../../services/storage';
import { PWAInstallButton } from '../common/PWAInstallButton';

export type AdminTab =
  | 'DASHBOARD'
  | 'DOCUMENTS'
  | 'PRODUCTS'
  | 'INVENTORY'
  | 'REPORTS'
  | 'CUSTOMERS'
  | 'PROMOTIONS'
  | 'SECURITY'
  | 'PAYMENTS'
  | 'COUNTRIES'
  | 'TAXES'
  | 'ZATCA'
  | 'COMPANY';

interface AdminLayoutProps {
  initialTab?: AdminTab;
  onCloseToPOS: () => void;
  documents: Document[];
  products: Product[];
  customers: Customer[];
  movements: CashMovement[];
  settings: CompanySettings;
  categories: string[];
  users?: User[];
  onAddDocument: () => void;
  onEditDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onPrintPreview: (doc: Document) => void;
  onSaveProduct: (p: Product) => void;
  onDeleteProduct: (id: string) => void;
  onAddCategory: (category: string) => void;
  onSaveCustomer: (c: Customer) => void;
  onSettleCustomerDebt: (customerId: string, amount: number) => void;
  onSaveSettings: (s: CompanySettings) => void;
  onRefreshData: () => void;
  onUpdateProductStock?: (productId: string, newStock: number) => void;
  onSaveUser?: (user: User) => void;
  onOpenDownloadModal?: () => void;
  onClearAllProducts?: () => void;
  onClearAllDocuments?: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  initialTab = 'DOCUMENTS',
  onCloseToPOS,
  documents,
  products,
  customers,
  movements,
  settings,
  categories,
  users,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onPrintPreview,
  onSaveProduct,
  onDeleteProduct,
  onAddCategory,
  onSaveCustomer,
  onSettleCustomerDebt,
  onSaveSettings,
  onRefreshData,
  onUpdateProductStock,
  onSaveUser,
  onOpenDownloadModal,
  onClearAllProducts,
  onClearAllDocuments,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);
  const [isBarcodeLabelsOpen, setIsBarcodeLabelsOpen] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const getTabTitle = (tab: AdminTab): string => {
    switch (tab) {
      case 'DASHBOARD':
        return 'لوحة القيادة';
      case 'DOCUMENTS':
        return 'مستندات';
      case 'PRODUCTS':
        return 'منتجات';
      case 'INVENTORY':
        return 'مخزون';
      case 'REPORTS':
        return 'التقارير';
      case 'CUSTOMERS':
        return 'العملاء والموردين';
      case 'PROMOTIONS':
        return 'العروض والاجزاء';
      case 'SECURITY':
        return 'المستخدمين والامن';
      case 'PAYMENTS':
        return 'انواع الدفع';
      case 'COUNTRIES':
        return 'بلدان';
      case 'TAXES':
        return 'معدلات الضرائب';
      case 'ZATCA':
        return 'الزكاة والضريبة (ZATCA)';
      case 'COMPANY':
        return 'شركتي';
    }
  };

  const navItems: { tab: AdminTab; label: string; icon: React.ReactNode }[] = [
    { tab: 'DASHBOARD', label: 'لوحة القيادة', icon: <LayoutDashboard size={18} /> },
    { tab: 'DOCUMENTS', label: 'مستندات', icon: <FileText size={18} /> },
    { tab: 'PRODUCTS', label: 'منتجات', icon: <Package size={18} /> },
    { tab: 'INVENTORY', label: 'مخزون', icon: <Archive size={18} /> },
    { tab: 'REPORTS', label: 'التقارير', icon: <BarChart3 size={18} /> },
    { tab: 'CUSTOMERS', label: 'العملاء والموردين', icon: <Users size={18} /> },
    { tab: 'PROMOTIONS', label: 'العروض والاجزاء', icon: <Heart size={18} /> },
    { tab: 'SECURITY', label: 'المستخدمين والامن', icon: <ShieldCheck size={18} /> },
    { tab: 'PAYMENTS', label: 'انواع الدفع', icon: <CreditCard size={18} /> },
    { tab: 'COUNTRIES', label: 'بلدان', icon: <Globe size={18} /> },
    { tab: 'TAXES', label: 'معدلات الضرائب', icon: <Percent size={18} /> },
    { tab: 'ZATCA', label: 'الزكاة والضريبة (ZATCA)', icon: <ShieldCheck size={18} className="text-emerald-400" /> },
    { tab: 'COMPANY', label: 'شركتي', icon: <Building2 size={18} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#16181b] text-gray-200 select-none font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Header matching Screenshot 3: [← العودة لشاشة الكاشير والمبيعات (POS)] and [✕] */}
      <header className="h-12 bg-[#181a1f] border-b border-[#2d323b] flex items-center justify-between px-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onCloseToPOS}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-600 rounded-lg text-white transition-colors cursor-pointer text-xs font-bold shadow-md"
            title="الرجوع إلى نقطة البيع وشاشة الكاشير (POS)"
          >
            <ArrowRight size={17} />
            <span>🛒 العودة لشاشة الكاشير والمبيعات (POS)</span>
          </button>
          <span className="text-gray-500">•</span>
          <span className="font-bold text-xs text-white">{getTabTitle(activeTab)}</span>
        </div>

        <div className="flex items-center gap-2">
          <PWAInstallButton />

          {onOpenDownloadModal && (
            <button
              onClick={onOpenDownloadModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#242b36] hover:bg-[#2f3948] text-cyan-300 border border-cyan-700/50 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
              title="تحميل حزمة التطبيق ورابط الويب المباشر"
            >
              <Download size={14} className="text-cyan-400" />
              <span>تحميل النظام والرابط</span>
            </button>
          )}

          <button
            onClick={onCloseToPOS}
            className="p-1.5 hover:bg-[#282d36] rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
            title="إغلاق والرجوع لشاشة الكاشير"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* Main Split Layout: Sidebar Navigation + Active Content View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Navigation matching Screenshot 3 exactly */}
        <aside className="w-56 bg-[#1f2228] border-l border-[#2e333d] flex flex-col select-none overflow-y-auto divide-y divide-[#2a2f38]">
          <div className="py-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.tab;
              return (
                <button
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#293444] text-cyan-400 border-r-4 border-cyan-400 shadow-sm'
                      : 'text-gray-300 hover:bg-[#252930] hover:text-white'
                  }`}
                >
                  <span className={isActive ? 'text-cyan-400' : 'text-gray-400'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="p-3 text-[11px] text-gray-500 mt-auto">
            <span>مؤسسة هجاير للتجاره • v2.4</span>
            <div className="text-[10px] text-emerald-500 mt-0.5">نظام نقاط البيع والمبيعات</div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#181a1f]">
          {activeTab === 'DOCUMENTS' && (
            <DocumentsView
              documents={documents}
              products={products}
              customers={customers}
              onAddDocument={onAddDocument}
              onEditDocument={onEditDocument}
              onDeleteDocument={onDeleteDocument}
              onPrintPreview={onPrintPreview}
              currencySymbol={settings.currency}
              onClearAllDocuments={onClearAllDocuments}
            />
          )}

          {activeTab === 'DASHBOARD' && (
            <DashboardView
              documents={documents}
              products={products}
              customers={customers}
              movements={movements}
              settings={settings}
              onNavigateToPOS={onCloseToPOS}
              onNavigateToDocuments={() => setActiveTab('DOCUMENTS')}
            />
          )}

          {activeTab === 'PRODUCTS' && (
            <ProductsView
              products={products}
              categories={categories}
              onSaveProduct={onSaveProduct}
              onDeleteProduct={onDeleteProduct}
              onOpenBarcodeLabels={() => setIsBarcodeLabelsOpen(true)}
              onAddCategory={onAddCategory}
              currencySymbol={settings.currency}
              onRefreshData={onRefreshData}
              onClearAllProducts={onClearAllProducts}
            />
          )}

          {activeTab === 'INVENTORY' && (
            <InventoryView
              products={products}
              categories={categories}
              onUpdateProductStock={(id, stock) => {
                if (onUpdateProductStock) {
                  onUpdateProductStock(id, stock);
                } else {
                  StorageService.updateProductStock(id, stock);
                  onRefreshData();
                }
              }}
              currencySymbol={settings.currency}
              onClearAllProducts={onClearAllProducts}
              onAddNewProduct={() => setActiveTab('PRODUCTS')}
            />
          )}

          {activeTab === 'REPORTS' && (
            <ReportsView
              documents={documents}
              products={products}
              customers={customers}
              settings={settings}
            />
          )}

          {activeTab === 'CUSTOMERS' && (
            <CustomersView
              customers={customers}
              onSaveCustomer={onSaveCustomer}
              onSettleDebt={onSettleCustomerDebt}
              currencySymbol={settings.currency}
            />
          )}

          {activeTab === 'PROMOTIONS' && (
            <PromotionsView />
          )}

          {activeTab === 'SECURITY' && (
            <SecurityUsersView
              users={users || StorageService.getUsers()}
              onSaveUser={(u) => {
                if (onSaveUser) {
                  onSaveUser(u);
                } else {
                  StorageService.saveUser(u);
                  onRefreshData();
                }
              }}
            />
          )}

          {activeTab === 'PAYMENTS' && (
            <PaymentTypesView />
          )}

          {activeTab === 'COUNTRIES' && (
            <CountriesView />
          )}

          {activeTab === 'TAXES' && (
            <TaxRatesView
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'ZATCA' && (
            <ZatcaView
              documents={documents}
              settings={settings}
              onSaveSettings={onSaveSettings}
            />
          )}

          {activeTab === 'COMPANY' && (
            <CompanySettingsView
              settings={settings}
              onSaveSettings={onSaveSettings}
              onRefreshData={onRefreshData}
            />
          )}
        </main>
      </div>

      {/* Barcode & Price Tags Modal (Screenshot 1) */}
      <BarcodePrintModal
        isOpen={isBarcodeLabelsOpen}
        onClose={() => setIsBarcodeLabelsOpen(false)}
        products={products}
        settings={settings}
      />
    </div>
  );
};
