/**
 * Unified Single-Size Receipt Component:
 * Matches Aronium & Hajayer Store Receipts:
 * - Sales Receipt (فاتورة المبيعات - مقاس موحد 80mm)
 * - Return Receipt (فاتورة المرتجع - مقاس موحد 80mm)
 * - Codes & Barcode Receipt (فاتورة الأكواد والباركود - مقاس موحد 80mm)
 *
 * Summary Order:
 * 1. المبلغ الإجمالي
 * 2. الخصم
 * 3. المتبقي
 */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Printer, FileText, QrCode, Tag, CheckCircle2 } from 'lucide-react';
import { Document, CompanySettings } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { generateZatcaTlvBase64, generateQrMatrix } from '../../services/zatca';

interface PrintReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document | null;
  settings: CompanySettings;
  autoPrint?: boolean;
}

export const PrintReceiptModal: React.FC<PrintReceiptModalProps> = ({
  isOpen,
  onClose,
  document,
  settings,
  autoPrint = true,
}) => {
  // Format: Unified 80mm Standard ('THERMAL'), Unified 80mm Codes Receipt ('CODES'), or Official A4 ('A4')
  const [printFormat, setPrintFormat] = useState<'THERMAL' | 'CODES' | 'A4'>('THERMAL');
  const [autoPrintActive, setAutoPrintActive] = useState<boolean>(autoPrint);

  const handlePrint = React.useCallback(() => {
    try {
      const originalTitle = window.document.title;
      window.document.title = `${settings.commercialName || 'مؤسسة هجاير للتجاره'} - ${
        document?.type === 'RETURN' ? 'فاتورة مرتجع' : printFormat === 'CODES' ? 'فاتورة الأكواد' : 'فاتورة مبيعات'
      } ${document?.number || ''}`;
      window.print();
      setTimeout(() => {
        window.document.title = originalTitle;
      }, 1500);
    } catch (e) {
      console.error('Print trigger error:', e);
      window.print();
    }
  }, [settings.commercialName, document, printFormat]);

  // Auto-Print Effect when modal is opened
  React.useEffect(() => {
    if (isOpen && document && autoPrintActive) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, document, autoPrintActive, handlePrint]);

  // Keyboard shortcut (Enter / P / Escape)
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Enter') {
        const active = window.document.activeElement;
        if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handlePrint, onClose]);

  if (!isOpen || !document) return null;

  const isReturn = document.type === 'RETURN';
  const totalItemCount = document.items.reduce((acc, it) => acc + it.quantity, 0);

  // Financial Calculations for Summary:
  // 1. المبلغ الإجمالي (قبل الخصم)
  const totalBeforeAllDiscounts =
    document.items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0) ||
    document.grandTotal + (document.discountTotal || 0);
  const grossTotal = totalBeforeAllDiscounts;

  // 2. الخصم الموحد الشامل لجميع المنتجات والعربة
  const totalAllDiscounts = Math.max(
    0,
    totalBeforeAllDiscounts - document.grandTotal
  ) || (document.discountTotal || 0);
  const discountAmount = totalAllDiscounts;

  // المدفوع
  const netPaid = document.paidAmount !== undefined ? document.paidAmount : document.grandTotal;

  // 3. المتبقي
  let remainingAmount = 0;
  let remainingLabel = 'المتبقي:';

  if (isReturn) {
    remainingAmount = document.paidAmount || document.grandTotal;
    remainingLabel = 'المتبقي (المسترد للعميل):';
  } else if (document.paymentMethod === 'CREDIT') {
    remainingAmount = Math.max(0, document.grandTotal - (document.paidAmount || 0));
    remainingLabel = 'المتبقي (آجل في الذمة):';
  } else if (document.changeAmount && document.changeAmount > 0) {
    remainingAmount = document.changeAmount;
    remainingLabel = 'المتبقي (الباقي للعميل):';
  } else {
    remainingAmount = Math.max(0, document.grandTotal - (document.paidAmount || document.grandTotal));
    remainingLabel = 'المتبقي:';
  }

  // Official ZATCA QR
  const zatcaTlv = generateZatcaTlvBase64(
    settings.commercialName || 'مؤسسة هجاير للتجاره',
    settings.taxNumber || '310458921600003',
    document.date,
    document.grandTotal,
    document.taxTotal
  );
  const qrMatrix = generateQrMatrix(zatcaTlv, 25);

  // Helper to generate large, bold, scannable barcode matching photo ______053fb773.jpg
  const renderReceiptBarcode = (code: string) => {
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed += code.charCodeAt(i);
    }

    const bars: { width: number; isBlack: boolean }[] = [];
    // Start guard
    bars.push({ width: 3, isBlack: true });
    bars.push({ width: 2, isBlack: false });
    bars.push({ width: 3, isBlack: true });

    // Data bars segment 1
    for (let i = 0; i < 30; i++) {
      const w = ((seed + i * 7) % 3.5) + 1.5;
      bars.push({ width: w, isBlack: i % 2 === 0 });
    }

    // Center divider guard
    bars.push({ width: 2, isBlack: false });
    bars.push({ width: 3, isBlack: true });
    bars.push({ width: 2, isBlack: false });

    // Data bars segment 2
    for (let i = 0; i < 30; i++) {
      const w = ((seed + i * 5) % 3.5) + 1.5;
      bars.push({ width: w, isBlack: i % 2 === 0 });
    }

    // End guard
    bars.push({ width: 3, isBlack: true });
    bars.push({ width: 2, isBlack: false });
    bars.push({ width: 3, isBlack: true });

    const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

    return (
      <svg
        viewBox={`0 0 ${totalWidth} 55`}
        className="w-[90%] h-14 sm:h-16 object-contain text-black"
        preserveAspectRatio="none"
      >
        {bars.map((bar, idx) => {
          const currentX = bars.slice(0, idx).reduce((acc, b) => acc + b.width, 0);
          if (!bar.isBlack) return null;
          return (
            <rect
              key={idx}
              x={currentX}
              y="0"
              width={bar.width}
              height="55"
              fill="#000000"
            />
          );
        })}
      </svg>
    );
  };

  // Render Helpers: Used for both On-Screen Modal Preview and Direct Unclipped Body Portal Printing
  const renderThermalReceipt = (isModalPreview: boolean) => (
    <div
      className={
        isModalPreview
          ? "w-[74mm] max-w-[74mm] min-w-[74mm] bg-white text-black font-sans text-[13px] px-3.5 py-3.5 shadow-2xl rounded-sm mx-auto flex flex-col justify-between"
          : "w-full max-w-full bg-white text-black font-sans text-[13px] flex flex-col justify-between"
      }
      id={isModalPreview ? "preview-receipt" : "printable-receipt"}
    >
      <div>
        {/* Header - Centered & Gathered tightly in the center */}
        <div className="text-center max-w-[90%] mx-auto space-y-0.5 pb-1">
          <h1 className="font-black text-[15px] text-black tracking-wide font-['Cairo',sans-serif]">
            {settings.commercialName || 'مؤسسة هجاير للتجاره'}
          </h1>
          <p className="text-[11px] font-semibold text-black">
            السجل التجاري: {settings.crNumber || '1010457983'}
          </p>
          <p className="text-[10.5px] text-black leading-tight">
            {settings.address || 'الرياض-طريق المدينة المنوره-البديعه 1'}
          </p>
          <p className="text-[12.5px] font-bold pt-0.5 text-black">
            {isReturn ? 'فاتورة مرتجع ضريبية مبسطة' : 'فاتورة ضريبية مبسطة'}
          </p>
          {isReturn && (
            <p className="text-[10px] font-bold text-red-600 font-mono">
              (إشعار دائن - Credit Note)
            </p>
          )}
        </div>

        {/* Solid divider line */}
        <div className="border-t border-black my-1"></div>

        {/* Invoice Meta: التاريخ ومستخدم ورقم الطلب (مستخدم فقط بدون اسم) */}
        <div className="text-right space-y-0.5 text-[11.5px] text-black font-mono px-0.5">
          {document.referenceInvoiceNumber && (
            <div className="text-red-600 font-bold">
              <span className="font-sans">مرجع الفاتورة الأصلية: </span>
              <span>{document.referenceInvoiceNumber}</span>
            </div>
          )}
          <div>
            <span>{document.date.includes('م') || document.date.includes('ص') ? document.date : `${document.date} م`}</span>
          </div>
          <div>
            <span className="font-sans font-bold">مستخدم</span>
          </div>
          <div>
            <span className="font-sans font-semibold">رقم الطلب: </span>
            <span className="font-bold">{document.orderNumber || '1879'}</span>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-black my-1"></div>

        {/* Products List:
            Line 1: Item name right-aligned alone (e.g. اسوارة, ساعه نسائي)
            Line 2: Right: quantity x unitPrice .ر.س | Left: total price .ر.س
        */}
        {/* Products List:
            Line 1: Item name right-aligned alone (e.g. اسوارة, ساعه نسائي)
            Line 2: Right: quantity x unitPrice .ر.س | Left: total price .ر.س
        */}
        <div className="space-y-1.5 my-1.5">
          {document.items.map((it, idx) => (
            <div key={idx} className="text-black space-y-0.5">
              {/* 1. اسم الصنف على اليمين بمفرده بخط أوضح وأكبر */}
              <div className="text-right font-bold text-[12.5px] text-black leading-snug">
                {it.name}
              </div>

              {/* 2. الكمية × السعر على اليمين والإجمالي على اليسار */}
              <div className="flex justify-between items-center text-[11.5px] font-mono text-black">
                <span>
                  {it.quantity} x {formatNumber(it.unitPrice)} .ر.س
                </span>
                <span className="font-bold">
                  {formatNumber(it.quantity * it.unitPrice)} .ر.س
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Dashed divider line */}
        <div className="border-t border-dashed border-black my-1"></div>

        {/* Total Item Count */}
        <div className="text-right text-[12px] font-bold text-black font-mono py-0.5 px-0.5">
          <span className="font-sans">عدد المنتجات: </span>
          <span>{totalItemCount}</span>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-black my-1"></div>

        {/* Totals Section: بخانة واحدة لجميع المنتجات كما طلب:
            1. السعر الإجمالي
            2. الخصم
            3. السعر النهائي
        */}
        <div className="space-y-1 text-black font-mono">
          {/* 1. السعر الإجمالي (المبلغ الإجمالي قبل الخصم) */}
          <div className="flex justify-between items-center text-[12px]">
            <span className="font-sans font-semibold">السعر الإجمالي:</span>
            <span className="font-bold">{formatNumber(totalBeforeAllDiscounts)} .ر.س</span>
          </div>

          {/* 2. الخصم (بخانة واحدة لجميع المنتجات) */}
          <div className="flex justify-between items-center text-[12px]">
            <span className="font-sans font-semibold">الخصم:</span>
            <span className={`font-bold ${totalAllDiscounts > 0 ? 'text-red-700' : 'text-black'}`}>
              {totalAllDiscounts > 0 ? `-${formatNumber(totalAllDiscounts)}` : '0.00'} .ر.س
            </span>
          </div>

          {/* خط فاصل */}
          <div className="border-t border-black my-0.5"></div>

          {/* 3. السعر النهائي (الصافي النهائي المطلوب) */}
          <div className="flex justify-between items-center font-bold text-[13.5px] py-1 border border-black px-1.5 rounded-sm bg-gray-50/50">
            <span className="font-sans font-black">السعر النهائي:</span>
            <span className="text-[14.5px] font-black">{formatNumber(document.grandTotal)} .ر.س</span>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-black my-1"></div>

        {/* Payment details */}
        <div className="space-y-0.5 text-[11.5px] font-mono text-black">
          <div className="flex justify-between items-center">
            <span className="font-sans font-semibold">
              {document.paymentMethod === 'CARD'
                ? ':مدى'
                : document.paymentMethod === 'CREDIT'
                ? ':آجل'
                : ':نقدا'}
            </span>
            <span>{formatNumber(netPaid)} .ر.س</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-sans font-semibold">:المبلغ المدفوع</span>
            <span>{formatNumber(netPaid)} .ر.س</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between items-center text-emerald-800 font-bold">
              <span className="font-mono">You saved:</span>
              <span>{formatNumber(discountAmount)} .ر.س</span>
            </div>
          )}
          {(!isReturn && (remainingAmount > 0 || document.paymentMethod === 'CREDIT')) && (
            <div className="flex justify-between items-center">
              <span className="font-sans">:المتبقي</span>
              <span>{formatNumber(remainingAmount)} .ر.س</span>
            </div>
          )}
        </div>

        {/* Large High-Contrast Barcode */}
        <div className="my-2.5 flex flex-col items-center">
          {renderReceiptBarcode(document.number)}
          <span className="font-mono text-[13px] font-bold text-black mt-1 tracking-widest text-center">
            {document.number}
          </span>
        </div>

        {/* Large Official ZATCA QR Code */}
        <div className="flex flex-col items-center justify-center my-2.5">
          <div className="w-28 h-28 sm:w-32 sm:h-32 p-1 border border-black bg-white flex items-center justify-center">
            <svg viewBox="0 0 25 25" className="w-full h-full text-black">
              {qrMatrix.map((row, r) =>
                row.map((cell, c) =>
                  cell ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width="1"
                      height="1"
                      fill="currentColor"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>
        </div>

        {/* Policy Section EXACT TEXT */}
        <div className="text-right text-[10.5px] text-black font-semibold space-y-0.5 mt-2 pt-1">
          <div>الساعات ضمان 1 /سنة</div>
          <div>الاستشوارات ضمان 2 /سنة</div>
          <div>الاسترجاع خلال 24 ساعه</div>
          <div>الاستبدال خلال 3 /ايام واحضار اصل الفاتوره</div>
        </div>

        {/* WhatsApp Store Contact - Small font & small WhatsApp icon */}
        <div className="mt-2 pt-1.5 border-t border-dashed border-black/50 flex items-center justify-center gap-1.5 text-[9.5px] text-black">
          <svg
            className="w-3.5 h-3.5 fill-current text-black flex-shrink-0"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span className="font-semibold">للتواصل عبر الواتساب:</span>
          <span dir="ltr" className="font-mono font-bold">+966 56 340 9344</span>
        </div>
      </div>
    </div>
  );

  const renderCodesReceipt = (isModalPreview: boolean) => (
    <div
      className={
        isModalPreview
          ? "w-[74mm] max-w-[74mm] min-w-[74mm] bg-white text-black font-sans text-xs px-3.5 py-3.5 shadow-2xl rounded-sm mx-auto flex flex-col justify-between"
          : "w-full max-w-full bg-white text-black font-sans text-xs flex flex-col justify-between"
      }
      id={isModalPreview ? "preview-codes-receipt" : "printable-codes-receipt"}
    >
      <div>
        {/* Header */}
        <div className="text-center space-y-0.5 pb-1">
          <h1 className="font-black text-[13px] text-black tracking-wide font-['Cairo',sans-serif]">
            {settings.commercialName || 'مؤسسة هجاير للتجاره'}
          </h1>
          <p className="text-[9.5px] font-bold text-black font-mono">
            السجل التجاري: {settings.crNumber || '1010457983'}
          </p>
          <div className="bg-cyan-900 text-white font-black text-[10px] py-0.5 px-2 rounded my-0.5">
            🏷️ فاتورة أكواد وباركود الأصناف
          </div>
          <p className="text-[8.5px] text-gray-700">
            وثيقة تدقيق الأكواد والأسعار والباركود الرسمية
          </p>
        </div>

        {/* Divider */}
        <div className="border-t-2 border-black my-1"></div>

        {/* Invoice Meta */}
        <div className="space-y-0.5 text-[9.5px] text-black font-mono">
          <div className="flex justify-between items-center">
            <span>رقم الفاتورة:</span>
            <span className="font-bold">{document.number}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>التاريخ:</span>
            <span>{document.date}</span>
          </div>
          <div className="flex justify-between items-center font-sans">
            <span>الكاشير:</span>
            <span className="font-bold">{document.cashierName || 'Admin'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>العميل:</span>
            <span>{document.customerName || 'عميل نقدي'}</span>
          </div>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-black my-1"></div>

        {/* Codes & Barcodes Items List matching 1325_710b74a5.jpg */}
        <div className="space-y-3 my-2">
          {document.items.map((it, idx) => {
            const itemBarcode = it.code || '21451210';
            const itemOrigTotal = it.unitPrice * it.quantity;
            const itemDiscount =
              it.discount && it.discount > 0
                ? it.discount
                : itemOrigTotal > it.total
                ? itemOrigTotal - it.total
                : 0;

            return (
              <div
                key={idx}
                className="p-3 border-2 border-black rounded-lg bg-white text-black space-y-1 text-center shadow-xs"
              >
                {/* 1. اسم الصنف بالمنتصف تماماً كما بالصورة */}
                <div className="font-bold text-[12px] text-black leading-tight break-words px-1 font-['Cairo',sans-serif]">
                  {it.name}
                </div>

                {/* 2. السعر بالمنتصف مع .ر.س كما بالصورة 1325.jpg */}
                <div className="font-mono font-bold text-[13px] text-black leading-tight pt-0.5">
                  {formatNumber(it.unitPrice)} <span className="text-[10px] font-sans font-bold">.ر.س</span>
                </div>

                {/* 3. باركود عريض وكبير بالمنتصف للمسح السريع */}
                <div className="flex flex-col items-center justify-center py-1">
                  <svg className="w-[92%] h-13" viewBox="0 0 160 50" preserveAspectRatio="none">
                    <rect x="5" y="0" width="2.5" height="46" fill="black" />
                    <rect x="9" y="0" width="1.5" height="46" fill="black" />
                    <rect x="13" y="0" width="3.5" height="46" fill="black" />
                    <rect x="18" y="0" width="1.5" height="46" fill="black" />
                    <rect x="22" y="0" width="2.5" height="46" fill="black" />
                    <rect x="26" y="0" width="4.5" height="46" fill="black" />
                    <rect x="33" y="0" width="1.5" height="46" fill="black" />
                    <rect x="36" y="0" width="3.5" height="46" fill="black" />
                    <rect x="41" y="0" width="2.5" height="46" fill="black" />
                    <rect x="45" y="0" width="1.5" height="46" fill="black" />
                    <rect x="49" y="0" width="3.5" height="46" fill="black" />
                    <rect x="54" y="0" width="2.5" height="46" fill="black" />
                    <rect x="58" y="0" width="4.5" height="46" fill="black" />
                    <rect x="64" y="0" width="1.5" height="46" fill="black" />
                    <rect x="68" y="0" width="3.5" height="46" fill="black" />
                    <rect x="73" y="0" width="2.5" height="46" fill="black" />
                    <rect x="77" y="0" width="4.5" height="46" fill="black" />
                    <rect x="83" y="0" width="2.5" height="46" fill="black" />
                    <rect x="87" y="0" width="3.5" height="46" fill="black" />
                    <rect x="92" y="0" width="1.5" height="46" fill="black" />
                    <rect x="96" y="0" width="3.5" height="46" fill="black" />
                    <rect x="101" y="0" width="2.5" height="46" fill="black" />
                    <rect x="105" y="0" width="4.5" height="46" fill="black" />
                    <rect x="111" y="0" width="1.5" height="46" fill="black" />
                    <rect x="115" y="0" width="3.5" height="46" fill="black" />
                    <rect x="120" y="0" width="2.5" height="46" fill="black" />
                    <rect x="125" y="0" width="4.5" height="46" fill="black" />
                    <rect x="131" y="0" width="2.5" height="46" fill="black" />
                    <rect x="136" y="0" width="3.5" height="46" fill="black" />
                    <rect x="142" y="0" width="2.5" height="46" fill="black" />
                    <rect x="147" y="0" width="3.5" height="46" fill="black" />
                    <rect x="153" y="0" width="2.5" height="46" fill="black" />
                  </svg>
                  {/* 4. كود الباركود أسفل الخطوط بالمنتصف */}
                  <div className="font-mono text-[11px] font-black text-black tracking-widest mt-0.5">
                    {itemBarcode}
                  </div>
                </div>

                {/* معلومات إضافية للتدقيق */}
                <div className="flex justify-between items-center text-[9px] font-mono text-gray-700 pt-1 border-t border-dashed border-gray-300">
                  <span>الكمية: {it.quantity} {it.unit || 'حبة'}</span>
                  {itemDiscount > 0 && (
                    <span className="text-red-700 font-bold">خصم: -{formatNumber(itemDiscount)}</span>
                  )}
                  <span>الإجمالي: {formatNumber(it.total)} ر.س.</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-black my-1"></div>

        {/* Total Count */}
        <div className="flex justify-between items-center text-[10px] font-bold text-black font-mono">
          <span>إجمالي عدد الأصناف:</span>
          <span>{totalItemCount} قطعة</span>
        </div>

        {/* Totals Section: STRICT ORDER AS SPECIFIED:
            1. المبلغ الإجمالي
            2. الخصم
            3. الصافي النهائي المطلوب / المتبقي
        */}
        <div className="space-y-1 text-[11px] text-black font-mono bg-cyan-50/80 p-2 rounded border-2 border-cyan-800 my-1.5">
          {/* 1. المبلغ الإجمالي */}
          <div className="flex justify-between items-center pb-1 border-b border-cyan-300">
            <span className="font-bold text-[10.5px]">المبلغ الإجمالي (قبل الخصم):</span>
            <span className="font-black text-[12px]">{formatNumber(grossTotal)} ر.س.</span>
          </div>

          {/* 2. الخصم */}
          <div className="flex justify-between items-center pb-1 border-b border-cyan-300">
            <span className="font-bold text-[10.5px]">الخصم الممنوح:</span>
            <span
              className={`font-black text-[11.5px] ${
                discountAmount > 0
                  ? 'text-red-700 bg-red-100 px-1 rounded'
                  : 'text-gray-800'
              }`}
            >
              {discountAmount > 0 ? `-${formatNumber(discountAmount)}` : '0.00'} ر.س.
            </span>
          </div>

          {/* 3. الصافي النهائي المطلوب */}
          <div className="flex justify-between items-center pt-0.5">
            <span className="font-black text-[11px] text-black">
              الصافي النهائي المطلوب:
            </span>
            <span className="font-black text-[12.5px] bg-yellow-200 px-1.5 py-0.5 rounded border border-yellow-500 text-black">
              {formatNumber(document.grandTotal)} ر.س.
            </span>
          </div>

          {/* المتبقي إن وجد */}
          {(remainingAmount > 0 || document.paymentMethod === 'CREDIT') && (
            <div className="flex justify-between items-center pt-1 border-t border-dashed border-cyan-400 text-[10px]">
              <span className="font-bold text-gray-800">{remainingLabel}</span>
              <span className="font-black text-[11px] text-black">
                {formatNumber(remainingAmount)} ر.س.
              </span>
            </div>
          )}
        </div>

        {/* تفاصيل السداد */}
        <div className="flex justify-between items-center text-[9px] text-gray-700 font-mono px-0.5 pb-0.5">
          <span>المبلغ المدفوع:</span>
          <span>{formatNumber(netPaid)} ر.س.</span>
        </div>

        {/* ZATCA QR Code */}
        <div className="flex flex-col items-center justify-center my-1.5">
          <div className="w-18 h-18 p-1 border border-black bg-white flex items-center justify-center">
            <svg viewBox="0 0 25 25" className="w-full h-full text-black">
              {qrMatrix.map((row, r) =>
                row.map((cell, c) =>
                  cell ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width="1"
                      height="1"
                      fill="currentColor"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>
          <span className="text-[7.5px] text-gray-800 font-mono mt-0.5 font-bold">
            رمز التحقق الضريبي لهيئة الزكاة والدخل
          </span>
        </div>

        {/* Structured Warranty and Return Policy Section */}
        <div className="border border-black rounded p-1.5 text-center text-black space-y-1 mt-1 bg-gray-50/80">
          <div className="font-black text-[9px] text-black border-b border-black pb-0.5 flex items-center justify-center gap-1">
            <span>🛡️ سياسة الضمان والاستبدال والاسترجاع 🛡️</span>
          </div>
          <div className="space-y-0.5 text-[8px] text-right font-bold leading-relaxed px-0.5">
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <span>الساعات: ضمان شامل لمدة سنة كاملة (1 سنة).</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <span>الأجهزة والاستشوارات: ضمان معتمد سنتين (2 سنة).</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <span>الاسترجاع: متاح خلال 24 ساعة من الشراء.</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-black shrink-0"></span>
              <span>الاستبدال: خلال 3 أيام مع ضرورة إحضار أصل الفاتورة.</span>
            </div>
          </div>
          <div className="border-t border-dashed border-gray-400 pt-0.5 text-center font-bold text-[8.5px] text-gray-900">
            شكراً لزيارتكم • متجر هجاير يتمنى لكم يوماً سعيداً ✨
          </div>
          <div className="pt-0.5 flex items-center justify-center gap-1 text-[8px] text-gray-900 border-t border-gray-200">
            <svg
              className="w-3 h-3 fill-current text-black flex-shrink-0"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            <span>للتواصل عبر الواتساب:</span>
            <span dir="ltr" className="font-mono font-bold">+966 56 340 9344</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderA4Invoice = (isModalPreview: boolean) => (
    <div
      className={
        isModalPreview
          ? "w-[540px] bg-white text-gray-950 font-['Cairo',sans-serif] p-6 shadow-xl rounded text-xs space-y-4"
          : "w-full max-w-full bg-white text-gray-950 font-['Cairo',sans-serif] p-6 rounded text-xs space-y-4"
      }
      id={isModalPreview ? "preview-a4-invoice" : "printable-a4-invoice"}
    >
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-gray-900 pb-3">
        <div>
          <h1 className="text-2xl font-black text-gray-950">
            {settings.commercialName || 'مؤسسة هجاير للتجاره'}
          </h1>
          <p className="text-xs font-bold text-gray-800">
            {settings.address || 'الرياض-طريق المدينة المنوره-البديعه 1'}
          </p>
          <p className="text-[11px] text-gray-600">هاتف: {settings.phone}</p>
          <p className="text-[11px] font-bold text-gray-900">
            الرقم الضريبي: {settings.taxNumber}
          </p>
          <p className="text-[11px] text-gray-700 font-mono">
            السجل التجاري: {settings.crNumber || '1010457983'}
          </p>
        </div>

        <div className="text-left space-y-1">
          <div
            className={`${
              isReturn ? 'bg-red-700' : 'bg-gray-900'
            } text-white font-bold px-3 py-1 rounded text-center text-xs`}
          >
            {isReturn ? 'إشعار دائن (فاتورة مرتجع رسمية)' : 'فاتورة ضريبية رسمية'}
          </div>
          <div className="text-[11px] pt-1">
            <span className="text-gray-500">رقم الفاتورة: </span>
            <span className="font-mono font-bold text-black">{document.number}</span>
          </div>
          <div className="text-[11px]">
            <span className="text-gray-500">التاريخ: </span>
            <span className="font-mono">{document.date}</span>
          </div>
          <div className="text-[11px]">
            <span className="text-gray-500">العميل: </span>
            <span className="font-bold text-black">{document.customerName}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-right border border-gray-300">
        <thead className="bg-gray-100 border-b border-gray-300 font-bold">
          <tr>
            <th className="p-2 border-l border-gray-300">#</th>
            <th className="p-2 border-l border-gray-300">كود الصنف</th>
            <th className="p-2 border-l border-gray-300">اسم الصنف</th>
            <th className="p-2 border-l border-gray-300 text-center">الكمية</th>
            <th className="p-2 border-l border-gray-300 text-left">السعر</th>
            <th className="p-2 text-left">الإجمالي</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {document.items.map((it, idx) => (
            <tr key={idx}>
              <td className="p-2 border-l border-gray-200 font-mono">{idx + 1}</td>
              <td className="p-2 border-l border-gray-200 font-mono font-bold text-cyan-900">
                {it.code || '—'}
              </td>
              <td className="p-2 border-l border-gray-200 font-semibold">{it.name}</td>
              <td className="p-2 border-l border-gray-200 text-center font-mono">
                {it.quantity}
              </td>
              <td className="p-2 border-l border-gray-200 text-left font-mono">
                {formatNumber(it.unitPrice)} ر.س.
              </td>
              <td className="p-2 text-left font-mono font-bold">
                {formatNumber(it.total)} ر.س.
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary with EXACT ORDER: 1. المبلغ الإجمالي 2. الخصم 3. المتبقي */}
      <div className="flex justify-between items-start pt-2">
        <div className="w-1/2 space-y-1 text-[11px] text-gray-700">
          <p className="font-bold text-gray-900">سياسة الضمان والاسترجاع:</p>
          <p>• الساعات ضمان 1 /سنة</p>
          <p>• الاستشوارات ضمان 2 /سنة</p>
          <p>• الاسترجاع خلال 24 ساعه</p>
          <p>• الاستبدال خلال 3 /ايام واحضار اصل الفاتوره</p>
        </div>

        <div className="w-1/2 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-200 font-mono text-xs">
          {/* 1. المبلغ الإجمالي */}
          <div className="flex justify-between font-bold text-sm text-gray-950">
            <span>{isReturn ? 'إجمالي المرتجع:' : 'المبلغ الإجمالي:'}</span>
            <span>{formatNumber(grossTotal)} ر.س.</span>
          </div>

          {/* 2. الخصم */}
          <div className="flex justify-between text-rose-600 font-bold">
            <span>الخصم:</span>
            <span>
              {discountAmount > 0 ? `-${formatNumber(discountAmount)}` : '0.00'} ر.س.
            </span>
          </div>

          {/* المدفوع */}
          <div className="flex justify-between text-gray-700 text-[11px]">
            <span>المبلغ المدفوع:</span>
            <span>{formatNumber(netPaid)} ر.س.</span>
          </div>

          {/* 3. المتبقي */}
          <div className="border-t-2 border-gray-900 pt-1.5 flex justify-between font-black text-sm text-gray-950">
            <span>{remainingLabel}</span>
            <span>{formatNumber(remainingAmount)} ر.س.</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* On-Screen Modal Window (Hidden completely during Print) */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 select-none overflow-y-auto font-['Cairo',sans-serif] print:hidden"
        dir="rtl"
      >
        <div className="bg-[#20242b] border border-[#3b414d] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
          {/* Top Header & Unified Format Switcher */}
          <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-[#17191d] border-b border-[#2e333d] gap-2">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5">
                <Printer size={16} className={isReturn ? 'text-rose-400' : 'text-cyan-400'} />
                <span>
                  {isReturn
                    ? 'طباعة فاتورة مرتجع (إشعار دائن)'
                    : printFormat === 'CODES'
                    ? 'طباعة فاتورة الأكواد والباركود'
                    : 'طباعة فاتورة المبيعات'}
                </span>
              </h2>

              {/* Toggle format: Single Unified Size 80mm Thermal, Codes Invoice 80mm, or Official A4 */}
              <div className="flex bg-[#272c36] p-0.5 rounded-lg text-xs border border-[#383f4d]">
                <button
                  type="button"
                  onClick={() => setPrintFormat('THERMAL')}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    printFormat === 'THERMAL'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="فاتورة المبيعات / المرتجع بالمقاس الموحد 80mm"
                >
                  <span>🧾</span>
                  <span>المقاس الموحد (80mm)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintFormat('CODES')}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    printFormat === 'CODES'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="فاتورة الأكواد والباركود بالمقاس الموحد 80mm"
                >
                  <span>🏷️</span>
                  <span>فاتورة الأكواد</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPrintFormat('A4')}
                  className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    printFormat === 'A4'
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                  title="طباعة على ورق A4 رسمي"
                >
                  <span>📄</span>
                  <span>رسمي (A4)</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* زر الطباعة الفوري المباشر في أعلى النافذة */}
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:from-emerald-700 active:to-teal-700 text-white rounded-lg text-xs font-black shadow-lg cursor-pointer transition-all border border-emerald-400/60"
                title="طباعة الفاتورة على الطابعة فوراً (Enter / Print)"
              >
                <Printer size={16} />
                <span>🖨️ طباعة الفاتورة الآن</span>
              </button>

              <label
                className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer bg-[#272c36] px-2.5 py-1 rounded-lg border border-[#3b414d]"
                title="طباعة أمر الطباعة تلقائياً عند إتمام العملية"
              >
                <input
                  type="checkbox"
                  checked={autoPrintActive}
                  onChange={(e) => setAutoPrintActive(e.target.checked)}
                  className="accent-cyan-500 rounded"
                />
                <span className="text-[11px] font-bold">طباعة تلقائية ⚡</span>
              </label>

              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Preview Area */}
          <div className="p-4 max-h-[75vh] overflow-y-auto bg-[#2b2e35] flex justify-center">
            {printFormat === 'THERMAL' && renderThermalReceipt(true)}
            {printFormat === 'CODES' && renderCodesReceipt(true)}
            {printFormat === 'A4' && renderA4Invoice(true)}
          </div>

          {/* Footer Action Buttons */}
          <div className="px-5 py-3.5 bg-[#17191d] border-t border-[#2e333d] flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {printFormat === 'THERMAL'
                ? 'طباعة المقاس الموحد الحراري (80mm)'
                : printFormat === 'CODES'
                ? 'طباعة فاتورة الأكواد والباركود (80mm)'
                : 'طباعة الفاتورة الرسمية (A4)'}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-xs font-bold text-gray-200 transition-colors cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-6 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-xs font-black text-white flex items-center gap-2 shadow-xl transition-all cursor-pointer border border-emerald-400/60"
              >
                <Printer size={16} />
                <span>طباعة الفاتورة الآن (Print)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Body Portal for 100% Unclipped, Centered Thermal Printing */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            id="thermal-print-portal"
            className={`hidden print:block ${printFormat === 'A4' ? 'format-a4' : ''}`}
            dir="rtl"
          >
            {printFormat === 'THERMAL' && renderThermalReceipt(false)}
            {printFormat === 'CODES' && renderCodesReceipt(false)}
            {printFormat === 'A4' && renderA4Invoice(false)}
          </div>,
          window.document.body
        )}
    </>
  );
};
