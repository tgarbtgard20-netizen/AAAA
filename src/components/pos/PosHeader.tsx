/**
 * Header top action bar of Aronium POS matching Screenshot 2 (________________259f0147.jpg) exactly
 */
import React from 'react';
import {
  Search,
  User,
  ArrowRightLeft,
  Percent,
  Plus,
  RotateCcw,
  Archive,
  Menu,
  MoreHorizontal,
  Download,
  Barcode,
} from 'lucide-react';
import { Customer } from '../../types';
import { PWAInstallButton } from '../common/PWAInstallButton';

interface PosHeaderProps {
  onSearchClick: () => void;
  onOpenBarcodeScanner?: () => void;
  onCustomerClick: () => void;
  selectedCustomer: Customer;
  onTransferClick: () => void;
  onDiscountClick: () => void;
  onNewInvoiceClick: () => void;
  onRefundClick: () => void;
  isRefundMode: boolean;
  onOpenCashDrawer: () => void;
  onHoldSale: () => void;
  heldCount: number;
  onCreditPayment: () => void;
  onCardPayment?: () => void;
  onCashPayment: () => void;
  onToggleMenu: () => void;
  onOpenAdmin?: () => void;
  onOpenDocuments?: () => void;
  onOpenProducts?: () => void;
  onOpenReports?: () => void;
  onOpenSettings?: () => void;
  onOpenDownloadModal?: () => void;
  onPrintLastInvoice?: () => void;
}

export const PosHeader: React.FC<PosHeaderProps> = ({
  onSearchClick,
  onOpenBarcodeScanner,
  onCustomerClick,
  selectedCustomer,
  onTransferClick,
  onDiscountClick,
  onNewInvoiceClick,
  onRefundClick,
  isRefundMode,
  onOpenCashDrawer,
  onHoldSale,
  heldCount,
  onCreditPayment,
  onCardPayment,
  onCashPayment,
  onToggleMenu,
  onOpenAdmin,
  onOpenDocuments,
  onOpenProducts,
  onOpenReports,
  onOpenSettings,
  onOpenDownloadModal,
  onPrintLastInvoice,
}) => {
  return (
    <header
      className="h-14 bg-[#1e2227] border-b border-[#31363f] flex items-stretch justify-between select-none text-gray-200 font-['Cairo',sans-serif]"
      dir="ltr"
    >
      {/* Left Section: Menu/Settings Button + Store Title + Main POS Actions */}
      <div className="flex items-stretch divide-x divide-[#31363f]">
        {/* زر الإعدادات والقائمة الرئيسية على الجهة اليسرى */}
        <button
          onClick={onToggleMenu}
          className="flex items-center gap-2 px-3.5 bg-[#171a1f] hover:bg-[#262c36] active:bg-[#343b48] transition-all cursor-pointer text-white border-r border-[#31363f] group"
          title="الإعدادات والقائمة الرئيسية"
        >
          <Menu size={20} className="text-cyan-400 group-hover:text-white transition-colors" />
          <span className="text-xs font-bold text-gray-100">الإعدادات</span>
        </button>

        {/* App Title */}
        <div className="px-3 flex items-center gap-2 bg-[#171a1f] border-r border-[#31363f] text-gray-300 font-bold text-xs">
          <div className="w-5 h-5 rounded bg-cyan-600 flex items-center justify-center text-white text-[11px] font-black">
            هـ
          </div>
          <span className="font-black text-white tracking-wide">متجر هجاير</span>
        </div>

        {/* 1. Search / البحث */}
        <button
          onClick={onSearchClick}
          className="flex flex-col items-center justify-center px-4 py-1 hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer group"
          title="البحث عن صنف (F2)"
        >
          <Search size={17} className="text-gray-300 group-hover:text-white" />
          <span className="text-[11px] font-semibold mt-0.5">البحث</span>
        </button>

        {/* Barcode Scanner / قارئ الباركود */}
        {onOpenBarcodeScanner && (
          <button
            onClick={onOpenBarcodeScanner}
            className="flex flex-col items-center justify-center px-3.5 py-1 bg-cyan-950/40 hover:bg-cyan-900/60 active:bg-cyan-800 text-cyan-300 hover:text-white transition-colors cursor-pointer group border-r border-[#31363f]"
            title="تشغيل قارئ وماسح الباركود السريع (Barcode Scanner)"
          >
            <Barcode size={17} className="text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold mt-0.5">قارئ الباركود</span>
          </button>
        )}

        {/* 2. Customer */}
        <button
          onClick={onCustomerClick}
          className="flex flex-col items-center justify-center px-4 py-1 hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer group relative max-w-[130px]"
          title="اختيار أو إضافة عميل"
        >
          <User size={17} className="text-gray-300 group-hover:text-amber-400" />
          <span className="text-[11px] font-semibold mt-0.5 truncate w-full text-center">
            {selectedCustomer.name.length > 9 ? selectedCustomer.name.substring(0, 9) + '..' : selectedCustomer.name}
          </span>
          {selectedCustomer.balance > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] px-1 rounded-full font-mono">
              دين
            </span>
          )}
        </button>

        {/* 3. Transfer / تحويل */}
        <button
          onClick={onTransferClick}
          className="flex flex-col items-center justify-center px-4 py-1 hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer group"
          title="تحويل الفاتورة أو الطاولة"
        >
          <ArrowRightLeft size={17} className="text-gray-300 group-hover:text-cyan-400" />
          <span className="text-[11px] font-semibold mt-0.5">تحويل</span>
        </button>

        {/* 4. Discount / الخصم */}
        <button
          onClick={onDiscountClick}
          className="flex flex-col items-center justify-center px-4 py-1 hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer group"
          title="تطبيق خصم إجمالي أو نسبة"
        >
          <Percent size={17} className="text-gray-300 group-hover:text-emerald-400" />
          <span className="text-[11px] font-semibold mt-0.5">الخصم</span>
        </button>

        {/* 5. New Invoice / فاتورة جديدة */}
        <button
          onClick={onNewInvoiceClick}
          className="flex flex-col items-center justify-center px-4 py-1 hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer group"
          title="فاتورة جديدة / تفريغ السلة"
        >
          <Plus size={18} className="text-gray-300 group-hover:text-white" />
          <span className="text-[11px] font-semibold mt-0.5">فاتورة جديدة</span>
        </button>

        {/* 6. Refund / استرداد */}
        <button
          onClick={onRefundClick}
          className={`flex flex-col items-center justify-center px-4 py-1 transition-colors cursor-pointer group ${
            isRefundMode
              ? 'bg-rose-900/60 text-white border-b-2 border-rose-500'
              : 'hover:bg-[#2c313a] active:bg-[#383f4b]'
          }`}
          title="استرداد / إرجاع بضاعة"
        >
          <RotateCcw
            size={17}
            className={isRefundMode ? 'text-rose-300' : 'text-gray-300 group-hover:text-rose-400'}
          />
          <span className="text-[11px] font-semibold mt-0.5">
            {isRefundMode ? 'إرجاع نشط' : 'استرداد'}
          </span>
        </button>

        {/* 7. Separator (---) */}
        <div className="flex items-center justify-center px-2 text-gray-500">
          <MoreHorizontal size={14} />
        </div>

        {/* 8. Cash Drawer / درج النقد */}
        <button
          onClick={onOpenCashDrawer}
          className="flex flex-col items-center justify-center px-4 py-1 hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer group"
          title="فتح درج النقد وتسجيل حركة (الخزينة)"
        >
          <Archive size={17} className="text-gray-300 group-hover:text-white" />
          <span className="text-[11px] font-semibold mt-0.5">درج النقد</span>
        </button>
      </div>

      {/* Center Section: App utilities (تثبيت التطبيق ورابط التحميل) */}
      <div className="flex items-center gap-2 px-2 overflow-x-auto scrollbar-none" dir="rtl">
        <PWAInstallButton />

        {onOpenDownloadModal && (
          <button
            type="button"
            onClick={onOpenDownloadModal}
            className="px-3 py-1.5 bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900 hover:to-blue-900 text-cyan-200 border border-cyan-600/60 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm"
            title="تحميل ملف التطبيق الكامل للكمبيوتر ورابط الاستخدام في الويب"
          >
            <Download size={14} className="text-cyan-400" />
            <span>تحميل التطبيق والرابط</span>
          </button>
        )}
      </div>

      {/* Right Section: F9, F10 (Green), F11 (Blue Mada), F12 (Black Cash), Menu */}
      <div className="flex items-stretch divide-x divide-[#31363f]">
        {/* F9 تعليق الفاتورة */}
        <button
          onClick={onHoldSale}
          className="flex flex-col items-center justify-center px-4 py-1 bg-[#23272e] hover:bg-[#2c313a] active:bg-[#383f4b] transition-colors cursor-pointer relative"
          title="تعليق / حفظ الفاتورة الحالية (F9)"
        >
          <span className="font-mono font-bold text-sm tracking-wide text-gray-200">F9</span>
          <span className="text-[11px] text-gray-300">تعليق الفاتورة</span>
          {heldCount > 0 && (
            <span className="absolute top-1 left-1 bg-amber-500 text-black font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-mono animate-pulse">
              {heldCount}
            </span>
          )}
        </button>

        {/* F10 آجل (Vibrant Green Button matching screenshot) */}
        <button
          onClick={onCreditPayment}
          className="flex flex-col items-center justify-center px-6 py-1 bg-[#3ba239] hover:bg-[#43b441] active:bg-[#2f882d] text-white transition-colors cursor-pointer shadow-inner"
          title="دفع آجل / دين على العميل (F10)"
        >
          <span className="font-mono font-black text-base tracking-wider leading-tight">F10</span>
          <span className="text-xs font-bold leading-tight">آجل</span>
        </button>

        {/* F11 شبكة / مدى / بطاقة */}
        <button
          onClick={onCardPayment}
          className="flex flex-col items-center justify-center px-6 py-1 bg-[#1e4e79] hover:bg-[#25639a] active:bg-[#163c5d] text-white transition-colors cursor-pointer shadow-inner"
          title="دفع شبكة / مدى / بطاقة (F11)"
        >
          <span className="font-mono font-black text-base tracking-wider leading-tight">F11</span>
          <span className="text-xs font-bold leading-tight">شبكة/مدى</span>
        </button>

        {/* F12 نقدا (Solid dark button matching screenshot) */}
        <button
          onClick={onCashPayment}
          className="flex flex-col items-center justify-center px-6 py-1 bg-[#191c22] hover:bg-[#252a33] active:bg-[#121418] text-white transition-colors cursor-pointer"
          title="دفع نقدي سريع (F12)"
        >
          <span className="font-mono font-black text-base tracking-wider leading-tight">F12</span>
          <span className="text-xs font-bold text-gray-200 leading-tight">نقدا</span>
        </button>

        {/* Hamburger Menu Toggle (Exact from Screenshot 2 top right) */}
        <button
          onClick={onToggleMenu}
          className="flex items-center justify-center px-4 bg-[#191c22] hover:bg-[#252a33] active:bg-[#121418] transition-colors cursor-pointer text-gray-300 hover:text-white"
          title="القائمة الرئيسية"
        >
          <Menu size={20} />
        </button>
      </div>
    </header>
  );
};
