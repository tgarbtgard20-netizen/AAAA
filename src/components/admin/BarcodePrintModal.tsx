/**
 * Barcode & Price Tags Printing Screen matching Screenshot 1 (بطاقات الأسعار)
 * and physical jewelry tag strip in hand (IMG-20261027-WA0111.jpg)
 */
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight,
  X,
  Printer,
  Save,
  ChevronFirst,
  ChevronLast,
  ChevronLeft,
  ChevronRight,
  Sliders,
  Check,
  PlusCircle,
  Sparkles,
  Layers,
  Copy,
  Tag,
} from 'lucide-react';
import { Product, CompanySettings } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface BarcodePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  settings: CompanySettings;
  onAddProduct?: (product: Product) => void;
  initialProduct?: Product | null;
  autoPrint?: boolean;
}

export const BarcodePrintModal: React.FC<BarcodePrintModalProps> = ({
  isOpen,
  onClose,
  products,
  settings,
  onAddProduct,
  initialProduct,
  autoPrint = false,
}) => {
  // Mode: 'ROLL_STRIP' (ملصق مفرد) vs 'CODES_INVOICE' (فاتورة الأكواد 80mm) vs 'CATALOG_GRID'
  const [activeMode, setActiveMode] = useState<'ROLL_STRIP' | 'CODES_INVOICE' | 'CATALOG_GRID'>('ROLL_STRIP');

  // Custom Barcode Generator State (Defaults match 1325_710b74a5.jpg: طقم زركون 349.00 ر.س 21451210)
  const [customName, setCustomName] = useState('طقم زركون');
  const [customPrice, setCustomPrice] = useState(349.0);
  const [customBarcode, setCustomBarcode] = useState('21451210');
  const [customCopies, setCustomCopies] = useState(2);
  const [selectedProductId, setSelectedProductId] = useState<string>('p-watch-1145');
  const [autoPrintActive, setAutoPrintActive] = useState<boolean>(autoPrint);

  // Sync initialProduct if provided
  React.useEffect(() => {
    if (initialProduct) {
      setCustomName(initialProduct.name);
      setCustomPrice(initialProduct.salePrice);
      setCustomBarcode(initialProduct.barcode || initialProduct.code);
      setSelectedProductId(initialProduct.id);
      setActiveMode('ROLL_STRIP');
    }
  }, [initialProduct]);

  const handlePrint = () => {
    const originalTitle = window.document.title;
    window.document.title = `${settings.commercialName || 'مؤسسة هجاير للتجاره'} - ملصق باركود ${customName}`;
    window.print();
    setTimeout(() => {
      window.document.title = originalTitle;
    }, 1500);
  };

  // Auto-Print Effect when modal opens if autoPrint is active (Requirement: وطباعه الباركورد للمنتجات تلقائئ)
  React.useEffect(() => {
    if (isOpen && autoPrintActive) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoPrintActive]);

  // Keyboard Escape Handler to exit easily on desktop and devices
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Config state matching Screenshot 1 (بطاقات الأسعار)
  const [paperSize, setPaperSize] = useState('Custom');
  const [pageWidth, setPageWidth] = useState(50);
  const [pageHeight, setPageHeight] = useState(25);
  const [isRollPaper, setIsRollPaper] = useState(true);

  // Margins
  const [marginTop, setMarginTop] = useState(0);
  const [marginBottom, setMarginBottom] = useState(0);
  const [marginLeft, setMarginLeft] = useState(0);
  const [marginRight, setMarginRight] = useState(8);

  // Layout
  const [columns, setColumns] = useState(1); // 1 column for strip
  const [labelWidth, setLabelWidth] = useState(50);
  const [labelHeight, setLabelHeight] = useState(25);
  const [rowSpacing, setRowSpacing] = useState(2);
  const [colSpacing, setColSpacing] = useState(0);

  // Display toggles
  const [showProductName, setShowProductName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showSkuCode, setShowSkuCode] = useState(false);
  const [showBarcode, setShowBarcode] = useState(true);
  const [showTaxInclusive, setShowTaxInclusive] = useState(false);
  const [showBorders, setShowBorders] = useState(true);

  // Barcode type & font sizes (Default small name & crisp barcode for compact sticker labels)
  const [barcodeType, setBarcodeType] = useState('CODE 128');
  const [nameSize, setNameSize] = useState(10.5);
  const [priceSize, setPriceSize] = useState(12);

  // Pagination for catalog grid
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(products.length / itemsPerPage) || 1;
  const currentProducts = products.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  // Helper to generate realistic barcode bars SVG (Tall, bold, scannable bars)
  const renderBarcodeSvg = (code: string, heightClass = 'h-14') => {
    let seed = 0;
    for (let i = 0; i < code.length; i++) {
      seed += code.charCodeAt(i);
    }

    const bars: { width: number; isBlack: boolean }[] = [];
    // Start guard
    bars.push({ width: 2.5, isBlack: true });
    bars.push({ width: 1.5, isBlack: false });
    bars.push({ width: 2.5, isBlack: true });

    // Data bars segment 1
    for (let i = 0; i < 28; i++) {
      const w = ((seed + i * 7) % 3) + 1.2;
      bars.push({ width: w, isBlack: i % 2 === 0 });
    }

    // Center divider guard
    bars.push({ width: 1.5, isBlack: false });
    bars.push({ width: 2.5, isBlack: true });
    bars.push({ width: 1.5, isBlack: false });

    // Data bars segment 2
    for (let i = 0; i < 28; i++) {
      const w = ((seed + i * 5) % 3) + 1.2;
      bars.push({ width: w, isBlack: i % 2 === 0 });
    }

    // End guard
    bars.push({ width: 2.5, isBlack: true });
    bars.push({ width: 1.5, isBlack: false });
    bars.push({ width: 2.5, isBlack: true });

    const totalWidth = bars.reduce((acc, b) => acc + b.width, 0);

    return (
      <svg
        viewBox={`0 0 ${totalWidth} 50`}
        className={`w-full ${heightClass} object-contain my-0.5 text-black`}
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
              height="50"
              fill="#000000"
            />
          );
        })}
      </svg>
    );
  };

  // Load existing product into the quick barcode form
  const handleSelectProduct = (pId: string) => {
    setSelectedProductId(pId);
    const found = products.find((p) => p.id === pId);
    if (found) {
      setCustomName(found.name);
      setCustomPrice(found.salePrice);
      setCustomBarcode(found.barcode);
    }
  };

  // Generate random barcode
  const handleGenerateRandomBarcode = () => {
    const random = Math.floor(10000000 + Math.random() * 90000000).toString();
    setCustomBarcode(random);
  };

  // Save custom barcode to product list
  const handleSaveAsProduct = () => {
    if (!customName.trim() || !customBarcode.trim()) {
      setStatusMessage('يرجى كتابة اسم الصنف ورقم الباركود.');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    const newProd: Product = {
      id: 'p_custom_' + Date.now(),
      code: 'BAR-' + customBarcode.slice(-4),
      name: customName.trim(),
      barcode: customBarcode.trim(),
      category: 'اكسسوارات',
      costPrice: Math.round(customPrice * 0.6),
      salePrice: Number(customPrice),
      taxRate: 15,
      stock: 50,
      unit: 'حبة',
    };

    if (onAddProduct) {
      onAddProduct(newProd);
    }
    setStatusMessage(`تم حفظ صنف "${customName}" في قائمة المنتجات بنجاح!`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  // Critical: If modal is not open, do not render anything to avoid covering the screen
  if (!isOpen) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-1.5 sm:p-3 select-none overflow-hidden font-['Cairo',sans-serif] print:hidden"
        dir="rtl"
      >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#1b1e24] border border-[#3b414d] rounded-xl shadow-2xl w-full max-w-6xl h-[96vh] flex flex-col text-gray-200 overflow-hidden relative"
      >
        {/* Top Header */}
        <header className="h-14 bg-[#17191d] border-b border-[#2e333d] flex items-center justify-between px-3 gap-2 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            {/* Quick Back to POS Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252b36] hover:bg-rose-900/80 border border-[#3d4657] hover:border-rose-500 text-white font-bold transition-all cursor-pointer text-xs shrink-0 shadow-sm"
              title="رجوع لشاشة المبيعات والكاشير"
            >
              <ArrowRight size={17} className="text-cyan-400" />
              <span>رجوع للكاشير</span>
            </button>

            <h1 className="font-bold text-xs sm:text-sm text-white flex items-center gap-1.5 shrink-0">
              <Tag size={15} className="text-cyan-400 hidden sm:inline" />
              <span>طباعة الباركود • متجر هجاير</span>
            </h1>

            {/* Mode Switcher Tabs */}
            <div className="hidden lg:flex bg-[#252b36] p-0.5 rounded-lg text-xs border border-[#363e4e] mr-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMode('ROLL_STRIP');
                  setColumns(1);
                }}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeMode === 'ROLL_STRIP'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🏷</span>
                <span>ملصق مفرد</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('CODES_INVOICE');
                  setColumns(1);
                }}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeMode === 'CODES_INVOICE'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>🧾</span>
                <span>فاتورة الأكواد (80mm)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMode('CATALOG_GRID');
                  setColumns(4);
                }}
                className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  activeMode === 'CATALOG_GRID'
                    ? 'bg-cyan-600 text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>📄</span>
                <span>شبكة الكتالوج</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Presets matching images */}
            <div className="hidden xl:flex items-center gap-1.5 text-[11px] bg-[#121417] p-1 rounded-lg border border-[#303744]">
              <span className="text-gray-400 px-1 font-bold">نماذج:</span>
              <button
                type="button"
                onClick={() => {
                  setCustomName('ساعه نسائي');
                  setCustomPrice(149.0);
                  setCustomBarcode('1145');
                  setActiveMode('ROLL_STRIP');
                }}
                className="px-2 py-0.5 rounded bg-amber-950/70 text-amber-300 hover:bg-amber-900 border border-amber-700/50 cursor-pointer font-bold"
              >
                ⌚ ساعه (149)
              </button>
              <button
                type="button"
                onClick={() => {
                  setCustomName('سلس');
                  setCustomPrice(35.0);
                  setCustomBarcode('21458475');
                  setActiveMode('ROLL_STRIP');
                }}
                className="px-2 py-0.5 rounded bg-cyan-950/70 text-cyan-300 hover:bg-cyan-900 border border-cyan-700/50 cursor-pointer font-bold"
              >
                📿 سلس (35)
              </button>
            </div>

            {/* Auto Print Toggle */}
            <label className="hidden sm:flex items-center gap-1 text-xs text-gray-300 cursor-pointer bg-[#242933] px-2 py-1 rounded-lg border border-[#3b4352]" title="الطباعة التلقائية الفورية">
              <input
                type="checkbox"
                checked={autoPrintActive}
                onChange={(e) => setAutoPrintActive(e.target.checked)}
                className="accent-cyan-500 rounded"
              />
              <span className="text-[10px] font-bold">تلقائية ⚡</span>
            </label>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">طباعة فورية</span>
              <span className="sm:hidden">طباعة</span>
            </button>

            {/* Prominent High-Visibility Exit / Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all shadow-lg active:scale-95 cursor-pointer border-2 border-rose-300 shrink-0"
              title="إغلاق الشاشة والرجوع فوراً"
            >
              <X size={18} className="stroke-[3]" />
              <span className="font-black text-sm">خروج ✕</span>
            </button>
          </div>
        </header>

        {/* Floating High-Contrast Mobile Exit Button (Ensures user can always exit on small/landscape screens) */}
        <button
          type="button"
          onClick={onClose}
          className="sm:hidden absolute top-2 left-2 z-50 flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-full shadow-2xl border-2 border-white animate-pulse active:scale-90 cursor-pointer"
          title="خروج فوري من القائمة"
        >
          <X size={16} className="stroke-[3]" />
          <span>خروج ✕</span>
        </button>

        {/* Main Content: Left Settings Sidebar + Right Live Preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Settings Sidebar */}
          <aside className="w-80 bg-[#1e2229] border-l border-[#2e333d] p-4 flex flex-col justify-between overflow-y-auto text-xs space-y-4">
            {activeMode === 'ROLL_STRIP' ? (
              /* QUICK BARCODE CREATOR & PRINTER (IMG-20261027-WA0111.jpg) */
              <div className="space-y-4">
                <div className="bg-[#17191d] border border-cyan-800/40 rounded-xl p-3 shadow-inner">
                  <h3 className="font-bold text-cyan-400 text-xs mb-2 flex items-center gap-1.5">
                    <Sparkles size={15} />
                    <span>إضافة وطباعة باركود صنف سريع:</span>
                  </h3>
                  <p className="text-[11px] text-gray-400 mb-2">
                    طباعة ملصق الباركود الحراري بنفس الحجم والشكل (طقم زركون 349.00 .ر.س).
                  </p>

                  {/* Size Presets - 50x25mm is the exact physical size from 1325.jpg */}
                  <div className="mb-3 p-2 bg-[#121417] rounded-lg border border-[#303846]">
                    <div className="text-[11px] text-cyan-300 font-bold mb-1.5 flex items-center justify-between">
                      <span>🏷️ مقاس الملصق الحراري:</span>
                      <span className="font-mono text-[10px] text-amber-300">{pageWidth} × {pageHeight} مم</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setPageWidth(50);
                          setPageHeight(25);
                          setLabelWidth(50);
                          setLabelHeight(25);
                        }}
                        className={`p-1.5 rounded border text-right transition-all cursor-pointer ${
                          pageWidth === 50 && pageHeight === 25
                            ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-sm'
                            : 'bg-[#181b22] border-[#2c3442] text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold">50 × 25 مم (القياسي)</div>
                        <div className="text-[9px] opacity-80 text-amber-200">نفس الصورة 1325 ✨</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPageWidth(40);
                          setPageHeight(25);
                          setLabelWidth(40);
                          setLabelHeight(25);
                        }}
                        className={`p-1.5 rounded border text-right transition-all cursor-pointer ${
                          pageWidth === 40 && pageHeight === 25
                            ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-sm'
                            : 'bg-[#181b22] border-[#2c3442] text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold">40 × 25 مم</div>
                        <div className="text-[9px] opacity-80">ملصق متوسط</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPageWidth(38);
                          setPageHeight(25);
                          setLabelWidth(38);
                          setLabelHeight(25);
                        }}
                        className={`p-1.5 rounded border text-right transition-all cursor-pointer ${
                          pageWidth === 38 && pageHeight === 25
                            ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-sm'
                            : 'bg-[#181b22] border-[#2c3442] text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold">38 × 25 مم</div>
                        <div className="text-[9px] opacity-80">ملصق صغير</div>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setPageWidth(80);
                          setPageHeight(50);
                          setLabelWidth(80);
                          setLabelHeight(50);
                        }}
                        className={`p-1.5 rounded border text-right transition-all cursor-pointer ${
                          pageWidth === 80 && pageHeight === 50
                            ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-sm'
                            : 'bg-[#181b22] border-[#2c3442] text-gray-300 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold">80 × 50 مم</div>
                        <div className="text-[9px] opacity-80">ملصق عريض</div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">
                        اختيار من منتجات المتجر:
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => handleSelectProduct(e.target.value)}
                        className="w-full h-8 bg-[#121417] border border-[#383e4a] rounded px-2 text-xs text-white"
                      >
                        <option value="">-- أو اكتب يدوياً أدناه --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} - {formatNumber(p.salePrice)} ر.س ({p.barcode})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 font-bold mb-1">
                        اسم الصنف على الملصق:
                      </label>
                      <input
                        type="text"
                        value={customName}
                        onChange={(e) => setCustomName(e.target.value)}
                        placeholder="مثال: سلس أو ساعة أو عطر"
                        className="w-full h-8 bg-[#121417] border border-[#383e4a] rounded px-2 text-xs text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 font-bold mb-1">
                        السعر (ر.س):
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                        placeholder="35.00"
                        className="w-full h-8 bg-[#121417] border border-[#383e4a] rounded px-2 text-xs text-white font-mono font-bold"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[11px] text-gray-300 font-bold">
                          رقم الباركود:
                        </label>
                        <button
                          type="button"
                          onClick={handleGenerateRandomBarcode}
                          className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                        >
                          توليد جديد 🎲
                        </button>
                      </div>
                      <input
                        type="text"
                        value={customBarcode}
                        onChange={(e) => setCustomBarcode(e.target.value)}
                        placeholder="21458475"
                        className="w-full h-8 bg-[#121417] border border-[#383e4a] rounded px-2 text-xs text-cyan-300 font-mono tracking-wider font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] text-gray-300 font-bold mb-1">
                        عدد الملصقات في الشريط:
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={customCopies}
                          onChange={(e) => setCustomCopies(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-20 h-8 bg-[#121417] border border-[#383e4a] rounded text-center text-white font-mono font-bold"
                        />
                        <span className="text-[11px] text-gray-400">ملصق (افتراضي: 4 مثل الصورة)</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveAsProduct}
                      className="w-full py-1.5 bg-[#273142] hover:bg-[#323e52] border border-[#3c4a63] text-cyan-300 text-[11px] font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer mt-2"
                    >
                      <PlusCircle size={14} />
                      <span>حفظ كصنف دائم في المتجر</span>
                    </button>
                  </div>
                </div>

                {/* Display Adjustments */}
                <div className="bg-[#17191d] border border-[#2e333d] rounded-xl p-3 space-y-2">
                  <span className="font-bold text-gray-300 block text-xs mb-1">خيارات مظهر الملصق:</span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showBorders}
                      onChange={(e) => setShowBorders(e.target.checked)}
                      className="rounded bg-[#121417] text-cyan-500"
                    />
                    <span className="text-gray-300">إظهار حدود الملصق الخارجي</span>
                  </label>

                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>حجم خط الاسم:</span>
                      <span className="font-mono text-cyan-400">{nameSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="18"
                      value={nameSize}
                      onChange={(e) => setNameSize(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                      <span>حجم خط السعر:</span>
                      <span className="font-mono text-cyan-400">{priceSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="11"
                      max="18"
                      value={priceSize}
                      onChange={(e) => setPriceSize(parseInt(e.target.value))}
                      className="w-full accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              /* ARONIUM LITE FULL DESIGNER (Screenshot 1) */
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-gray-200 text-xs border-b border-[#2e333d] pb-1">
                    التنسيق
                  </h3>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">Paper size</label>
                    <select
                      value={paperSize}
                      onChange={(e) => setPaperSize(e.target.value)}
                      className="w-full h-8 bg-[#121417] border border-[#383e4a] rounded px-2 text-xs text-white"
                    >
                      <option value="Custom">Custom (مخصص)</option>
                      <option value="Roll">Roll 50x25 mm</option>
                      <option value="A4">A4 Sheet</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Page width</label>
                      <input
                        type="number"
                        value={pageWidth}
                        onChange={(e) => setPageWidth(parseInt(e.target.value) || 50)}
                        className="w-full h-7 bg-[#121417] border border-[#383e4a] rounded px-2 text-center text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-gray-400 mb-1">Page height</label>
                      <input
                        type="number"
                        value={pageHeight}
                        onChange={(e) => setPageHeight(parseInt(e.target.value) || 25)}
                        className="w-full h-7 bg-[#121417] border border-[#383e4a] rounded px-2 text-center text-white font-mono"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-[11px] text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRollPaper}
                      onChange={(e) => setIsRollPaper(e.target.checked)}
                      className="rounded bg-[#121417] border-[#383e4a] text-cyan-500"
                    />
                    <span>Print on roll paper (unlimited height)</span>
                  </label>
                </div>

                {/* Margins Box */}
                <div className="bg-[#15171b] border border-[#2e333d] rounded p-2 text-center text-[10px]">
                  <span className="text-gray-400 block mb-1 font-bold">الهوامش (بالميليمترات)</span>
                  <div className="flex flex-col items-center gap-1">
                    <div>
                      <span className="text-[9px] text-gray-400 block">أعلى</span>
                      <input
                        type="number"
                        value={marginTop}
                        onChange={(e) => setMarginTop(parseInt(e.target.value) || 0)}
                        className="w-12 h-6 bg-[#1f2228] border border-[#383e4a] rounded text-center text-white font-mono"
                      />
                    </div>
                    <div className="flex items-center justify-between w-full px-2">
                      <div>
                        <span className="text-[9px] text-gray-400 block">يسار</span>
                        <input
                          type="number"
                          value={marginLeft}
                          onChange={(e) => setMarginLeft(parseInt(e.target.value) || 0)}
                          className="w-12 h-6 bg-[#1f2228] border border-[#383e4a] rounded text-center text-white font-mono"
                        />
                      </div>
                      <div className="w-8 h-8 border border-dashed border-gray-600 rounded flex items-center justify-center text-gray-500 text-[10px]">
                        ورقة
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block">يمين</span>
                        <input
                          type="number"
                          value={marginRight}
                          onChange={(e) => setMarginRight(parseInt(e.target.value) || 0)}
                          className="w-12 h-6 bg-[#1f2228] border border-[#383e4a] rounded text-center text-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <span className="text-[9px] text-gray-400 block">أسفل</span>
                      <input
                        type="number"
                        value={marginBottom}
                        onChange={(e) => setMarginBottom(parseInt(e.target.value) || 0)}
                        className="w-12 h-6 bg-[#1f2228] border border-[#383e4a] rounded text-center text-white font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Columns */}
                <div>
                  <div className="flex justify-between text-[11px] text-gray-400 mb-1">
                    <span>الأعمدة:</span>
                    <span className="font-mono font-bold text-cyan-400">{columns}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={columns}
                    onChange={(e) => setColumns(parseInt(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-1.5 pt-2 border-t border-[#2e333d]">
                  <span className="block text-gray-400 font-bold mb-1">عرض:</span>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">Product name</span>
                    <input
                      type="checkbox"
                      checked={showProductName}
                      onChange={(e) => setShowProductName(e.target.checked)}
                      className="rounded bg-[#141619] text-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">Price</span>
                    <input
                      type="checkbox"
                      checked={showPrice}
                      onChange={(e) => setShowPrice(e.target.checked)}
                      className="rounded bg-[#141619] text-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">باركود</span>
                    <input
                      type="checkbox"
                      checked={showBarcode}
                      onChange={(e) => setShowBarcode(e.target.checked)}
                      className="rounded bg-[#141619] text-cyan-500"
                    />
                  </label>
                  <label className="flex items-center justify-between cursor-pointer">
                    <span className="text-gray-300">Borders</span>
                    <input
                      type="checkbox"
                      checked={showBorders}
                      onChange={(e) => setShowBorders(e.target.checked)}
                      className="rounded bg-[#141619] text-cyan-500"
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-2 border-t border-[#2e333d]">
              <button
                onClick={handlePrint}
                className="w-full py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Printer size={16} />
                <span>طباعة الملصقات المحددة</span>
              </button>
            </div>
          </aside>

          {/* Right Live Preview Area */}
          <main className="flex-1 flex flex-col bg-[#14161a] overflow-hidden">
            {/* Toolbar above preview */}
            <div className="h-10 bg-[#1c1f26] border-b border-[#2e333d] flex items-center justify-between px-4">
              <div className="flex items-center gap-2 text-xs text-gray-300 font-bold">
                <span>معاينة الطباعة:</span>
                <span className="text-cyan-400">
                  {activeMode === 'ROLL_STRIP'
                    ? `ملصق باركود المنتج: ${customName} (${customCopies} قطع)`
                    : `عرض شبكي (${products.length} صنف)`}
                </span>
              </div>

              {activeMode === 'CATALOG_GRID' && (
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <button
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronFirst size={16} />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <span className="font-mono text-gray-300 px-2">
                    {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                    className="p-1 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLast size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Printable Container */}
            <div
              className="flex-1 p-6 overflow-y-auto bg-[#2b2e35] flex justify-center items-start"
              id="barcode-printable-area"
            >
              {activeMode === 'CODES_INVOICE' ? (
                /* UNIFIED 72/80MM COMPACT CODES & BARCODES INVOICE (Safe Margins, Centered) */
                <div className="w-[72mm] max-w-[72mm] min-w-[72mm] bg-white text-black font-sans text-xs px-3 py-3 shadow-2xl rounded-sm print:shadow-none print:w-[72mm] print:max-w-[72mm] mx-auto flex flex-col justify-between">
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

                    {/* Meta */}
                    <div className="space-y-0.5 text-[9.5px] text-black font-mono">
                      <div className="flex justify-between items-center">
                        <span>رقم الوثيقة:</span>
                        <span className="font-bold">BAR-{customBarcode.slice(-4) || '1145'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>التاريخ:</span>
                        <span>{new Date().toISOString().split('T')[0]}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>عدد الملصقات:</span>
                        <span className="font-bold">{customCopies} ملصق</span>
                      </div>
                    </div>

                    {/* Dashed divider */}
                    <div className="border-t border-dashed border-black my-1"></div>

                    {/* Selected Item with Small Name & Big Barcode */}
                    <div className="p-2 border border-gray-400 rounded bg-gray-50 text-black space-y-1 my-1.5">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-semibold text-gray-800 leading-tight break-words max-w-[70%]">
                          {customName}
                        </span>
                        <span className="font-mono text-[10.5px] font-black text-black">
                          {formatNumber(customPrice * customCopies)} ر.س.
                        </span>
                      </div>

                      {/* Barcode Graphic for Scanner - Big & Tall */}
                      <div className="flex flex-col items-center justify-center bg-white py-1.5 border border-gray-300 rounded my-1 shadow-xs">
                        <div className="w-[94%]">{renderBarcodeSvg(customBarcode, 'h-14')}</div>
                        <div className="font-mono text-[10px] font-black text-black tracking-widest mt-0.5">
                          كود الصنف: {customBarcode}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-mono text-gray-800">
                        <span>الكمية: {customCopies} قطعة</span>
                        <span>السعر الإفرادي: {formatNumber(customPrice)} ر.س.</span>
                      </div>
                    </div>

                    {/* Dashed divider */}
                    <div className="border-t border-dashed border-black my-1"></div>

                    {/* Totals Section: STRICT ORDER AS SPECIFIED:
                        1. المبلغ الإجمالي
                        2. الخصم
                        3. الصافي النهائي المطلوب / المتبقي
                    */}
                    <div className="space-y-1 text-[11px] text-black font-mono bg-cyan-50/80 p-2 rounded border-2 border-cyan-800 my-1.5">
                      {/* 1. المبلغ الإجمالي */}
                      <div className="flex justify-between items-center pb-1 border-b border-cyan-300">
                        <span className="font-bold text-[10.5px]">المبلغ الإجمالي (قبل الخصم):</span>
                        <span className="font-black text-[12px]">
                          {formatNumber(customPrice * customCopies)} ر.س.
                        </span>
                      </div>

                      {/* 2. الخصم */}
                      <div className="flex justify-between items-center pb-1 border-b border-cyan-300">
                        <span className="font-bold text-[10.5px]">الخصم الممنوح:</span>
                        <span className="font-black text-[11.5px] text-gray-800">0.00 ر.س.</span>
                      </div>

                      {/* 3. الصافي النهائي المطلوب */}
                      <div className="flex justify-between items-center pt-0.5">
                        <span className="font-black text-[11px] text-black">
                          الصافي النهائي المطلوب:
                        </span>
                        <span className="font-black text-[12.5px] bg-yellow-200 px-1.5 py-0.5 rounded border border-yellow-500 text-black">
                          {formatNumber(customPrice * customCopies)} ر.س.
                        </span>
                      </div>
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
                    </div>
                  </div>
                </div>
              ) : activeMode === 'ROLL_STRIP' ? (
                /* EXACT STRIP LAYOUT: Copy-Paste 1:1 of 1325.jpg (50x25mm Label) */
                <div className="flex flex-col items-center space-y-4">
                  <div className="text-center">
                    <span className="text-[11px] text-cyan-300 font-bold bg-[#17191d] px-3 py-1 rounded-full border border-cyan-800/50">
                      🏷️ معاينة ملصق الباركود الحراري • مقاس {pageWidth} × {pageHeight} مم (مطابق للصورة 1325)
                    </span>
                  </div>

                  <div className="p-4 bg-[#1e222a] rounded-xl border border-[#363e4c] space-y-3 flex flex-col items-center">
                    {Array.from({ length: customCopies }).map((_, idx) => (
                      <div
                        key={idx}
                        className="bg-white text-black p-2 flex flex-col items-center justify-between text-center select-none shadow-lg rounded-[6px] border border-gray-300"
                        style={{
                          width: `${Math.max(180, pageWidth * 4.4)}px`,
                          height: `${Math.max(90, pageHeight * 4.4)}px`,
                        }}
                      >
                        {/* 1. اسم الصنف بالمنتصف تماماً كما بالصورة 1325.jpg */}
                        <div
                          className="font-bold text-black font-['Cairo',sans-serif] leading-tight break-words max-w-[95%] px-1 text-center"
                          style={{ fontSize: `${nameSize}px` }}
                        >
                          {customName || 'طقم زركون'}
                        </div>

                        {/* 2. السعر واضح ومميز بالمنتصف مع .ر.س تماماً كما بالصورة 1325.jpg */}
                        <div
                          className="font-mono font-bold text-black leading-tight mt-0.5 text-center"
                          style={{ fontSize: `${priceSize}px` }}
                        >
                          {formatNumber(customPrice)} <span className="text-[10px] font-bold font-sans">.ر.س</span>
                        </div>

                        {/* 3. باركود عريض بالمنتصف سريع القراءة بالماسح */}
                        <div className="w-[84%] my-0.5 flex justify-center">
                          {renderBarcodeSvg(customBarcode || '21451210', 'h-10 sm:h-11')}
                        </div>

                        {/* 4. أرقام الباركود واضحة أسفل الخطوط بالمنتصف تماماً */}
                        <div className="text-[11px] font-mono tracking-widest text-black font-bold text-center leading-none">
                          {customBarcode || '21451210'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* CATALOG GRID MODE (MATCHING SCREENSHOT 1) */
                <div
                  className="grid gap-3 mx-auto"
                  style={{
                    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                    maxWidth: `${columns * 220}px`,
                  }}
                >
                  {currentProducts.map((p) => (
                    <div
                      key={p.id}
                      className={`bg-[#fdfdfd] text-gray-900 rounded p-2 flex flex-col justify-between text-center select-none shadow-md ${
                        showBorders ? 'border border-gray-400' : ''
                      }`}
                      style={{ minHeight: '110px' }}
                    >
                      <div className="text-[9px] text-gray-500 font-bold">
                        {settings.name || 'هجاير'}
                      </div>

                      {showProductName && (
                        <div
                          className="font-bold text-gray-950 truncate px-1"
                          style={{ fontSize: `${nameSize}px` }}
                        >
                          {p.name}
                        </div>
                      )}

                      {showPrice && (
                        <div
                          className="font-mono font-extrabold text-gray-900 leading-tight"
                          style={{ fontSize: `${priceSize}px` }}
                        >
                          {formatNumber(p.salePrice)} <span className="text-[10px] font-normal">ر.س</span>
                        </div>
                      )}

                      {showBarcode && (
                        <div className="mt-1 pt-1 border-t border-gray-200">
                          {renderBarcodeSvg(p.barcode)}
                          <div className="text-[10px] font-mono tracking-widest text-gray-800 font-bold -mt-0.5">
                            {p.barcode}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="h-10 bg-[#16181d] border-t border-[#2e333d] flex items-center justify-between px-3 text-[11px] text-gray-300 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1 bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white font-bold rounded flex items-center gap-1.5 text-xs cursor-pointer shadow transition-colors"
                >
                  <X size={14} />
                  <span>إغلاق وخروج من الشاشة (Exit)</span>
                </button>
                <span className="font-mono text-gray-400 hidden sm:inline">
                  {activeMode === 'ROLL_STRIP'
                    ? `ملصقات الشريط: ${customCopies} قطعة جاهزة للطباعة`
                    : `إجمالي منتجات الكتالوج: ${products.length}`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {statusMessage && (
                  <span className="text-emerald-400 font-bold bg-emerald-950/80 border border-emerald-700/50 px-2.5 py-0.5 rounded text-xs animate-pulse">
                    ✓ {statusMessage}
                  </span>
                )}
                <span className="text-emerald-400 font-bold hidden md:inline">
                  ✓ وضع ملصقات هجاير نشط (Hajayer Label Ready)
                </span>
              </div>
            </footer>
          </main>
        </div>
      </div>
    </div>

      {/* Direct Isolated Body Portal for Unclipped Barcode Printing */}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            id="barcode-print-portal"
            className="hidden print:block"
            dir="rtl"
          >
            {activeMode === 'ROLL_STRIP' ? (
              <div className="flex flex-col items-center justify-start">
                {Array.from({ length: customCopies }).map((_, idx) => (
                  <div
                    key={idx}
                    style={{
                      width: `${pageWidth}mm`,
                      height: `${pageHeight}mm`,
                      maxWidth: `${pageWidth}mm`,
                      maxHeight: `${pageHeight}mm`,
                    }}
                    className="bg-white text-black p-1 flex flex-col items-center justify-between text-center select-none overflow-hidden mx-auto page-break-after-always break-after-page"
                  >
                    {/* 1. اسم الصنف بالمنتصف تماماً كما بالصورة 1325.jpg */}
                    <div
                      className="font-bold text-black font-['Cairo',sans-serif] leading-tight break-words max-w-[96%] truncate text-center"
                      style={{ fontSize: `${nameSize}px` }}
                    >
                      {customName || 'طقم زركون'}
                    </div>

                    {/* 2. السعر بالمنتصف مع .ر.س تماماً كما بالصورة 1325.jpg */}
                    <div
                      className="font-mono font-bold text-black leading-none text-center mt-0.5"
                      style={{ fontSize: `${priceSize}px` }}
                    >
                      {formatNumber(customPrice)} <span className="text-[10px] font-sans font-bold">.ر.س</span>
                    </div>

                    {/* 3. باركود عريض ومضبوط بالمنتصف عالي التباين للمسح السريع */}
                    <div className="w-[84%] my-0.5 flex justify-center">
                      {renderBarcodeSvg(customBarcode || '21451210', 'h-8 sm:h-9')}
                    </div>

                    {/* 4. كود الباركود أسفل الخطوط بالمنتصف */}
                    <div className="text-[10.5px] font-mono tracking-widest text-black font-bold leading-none text-center">
                      {customBarcode || '21451210'}
                    </div>
                  </div>
                ))}
              </div>
            ) : activeMode === 'CODES_INVOICE' ? (
              <div className="w-[76mm] max-w-[76mm] min-w-[76mm] bg-white text-black font-sans text-xs p-3 mx-auto">
                <div className="text-center space-y-0.5 pb-1">
                  <h1 className="font-black text-[13px] text-black font-['Cairo',sans-serif]">
                    {settings.commercialName || 'مؤسسة هجاير للتجاره'}
                  </h1>
                  <p className="text-[9.5px] font-bold text-black font-mono">
                    السجل التجاري: {settings.crNumber || '1010457983'}
                  </p>
                  <div className="bg-cyan-900 text-white font-black text-[10px] py-0.5 px-2 rounded my-0.5">
                    🏷️ فاتورة أكواد وباركود الأصناف
                  </div>
                </div>

                <div className="border-t-2 border-black my-1"></div>

                <div className="space-y-0.5 text-[9.5px] text-black font-mono">
                  <div className="flex justify-between items-center">
                    <span>رقم الوثيقة:</span>
                    <span className="font-bold">BAR-{customBarcode.slice(-4) || '1145'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>التاريخ:</span>
                    <span>{new Date().toISOString().split('T')[0]}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>عدد الملصقات:</span>
                    <span className="font-bold">{customCopies} ملصق</span>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-1"></div>

                {/* Card matching 1325_710b74a5.jpg */}
                <div className="p-3 border-2 border-black rounded-lg bg-white text-black space-y-1 text-center my-2">
                  <div className="font-bold text-[12px] text-black leading-tight break-words px-1 font-['Cairo',sans-serif]">
                    {customName || 'طقم زركون'}
                  </div>
                  <div className="font-mono font-black text-[13px] text-black leading-tight pt-0.5">
                    {formatNumber(customPrice)} <span className="text-[10px] font-sans font-bold">ر.س.</span>
                  </div>
                  <div className="flex flex-col items-center justify-center py-1">
                    <div className="w-[94%]">{renderBarcodeSvg(customBarcode || '21451210', 'h-13')}</div>
                    <div className="font-mono text-[11px] font-black text-black tracking-widest mt-0.5">
                      {customBarcode || '21451210'}
                    </div>
                  </div>
                </div>

                <div className="border-t border-dashed border-black my-1"></div>

                <div className="border border-black p-2 rounded my-1.5 space-y-1 text-black font-mono">
                  <div className="flex justify-between items-center text-[10.5px]">
                    <span className="font-bold">المبلغ الإجمالي :</span>
                    <span className="font-black text-[11.5px]">{formatNumber(customPrice * customCopies)} ر.س.</span>
                  </div>
                  <div className="border border-black rounded p-1.5 flex justify-between items-center text-[11px] bg-yellow-100/60 mt-1">
                    <span className="font-black">الصافي النهائي المطلوب :</span>
                    <span className="font-black text-[12px]">{formatNumber(customPrice * customCopies)} ر.س.</span>
                  </div>
                </div>

                <div className="border border-black rounded p-1.5 text-center text-black space-y-1 mt-1 bg-gray-50/80">
                  <div className="font-black text-[9px] text-black border-b border-black pb-0.5">
                    🛡️ سياسة الضمان والاستبدال والاسترجاع 🛡️
                  </div>
                  <div className="space-y-0.5 text-[8px] text-right font-bold leading-relaxed px-0.5">
                    <div>• الساعات: ضمان شامل لمدة سنة كاملة (1 سنة).</div>
                    <div>• الأجهزة والاستشوارات: ضمان معتمد سنتين (2 سنة).</div>
                    <div>• الاسترجاع خلال 24 ساعة والاستبدال خلال 3 أيام.</div>
                  </div>
                  <div className="border-t border-dashed border-gray-400 pt-0.5 text-center font-bold text-[8.5px] text-gray-900">
                    شكراً لزيارتكم • متجر هجاير يتمنى لكم يوماً سعيداً ✨
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="grid gap-3 mx-auto p-4"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                  maxWidth: `${columns * 220}px`,
                }}
              >
                {currentProducts.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white text-black rounded p-2 flex flex-col justify-between text-center border border-black page-break-inside-avoid break-inside-avoid"
                    style={{ minHeight: '110px' }}
                  >
                    <div className="font-bold text-[11px] font-['Cairo',sans-serif] leading-tight break-words">
                      {p.name}
                    </div>
                    <div className="font-mono font-black text-black text-[11.5px] mt-0.5">
                      {formatNumber(p.salePrice)} ر.س.
                    </div>
                    <div className="w-[94%] my-0.5 mx-auto">
                      {renderBarcodeSvg(p.barcode || p.code || '21451210', 'h-10')}
                    </div>
                    <div className="text-[10px] font-mono tracking-widest text-black font-black">
                      {p.barcode || p.code || '21451210'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>,
          window.document.body
        )}
    </>
  );
};
