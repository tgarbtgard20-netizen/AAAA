/**
 * Products Grid and Search / Category filter matching right area of Screenshot 2 (________________259f0147.jpg) exactly
 */
import React, { useState } from 'react';
import { Search, Barcode, Hash, Tag, Plus, Keyboard } from 'lucide-react';
import { Product } from '../../types';
import { formatNumber, findProductByBarcode } from '../../utils/formatters';

interface PosProductsProps {
  products: Product[];
  categories: string[];
  activeCategory: string | null;
  onSelectCategory: (cat: string | null) => void;
  onProductClick: (product: Product) => void;
  onAddQuickProduct: () => void;
  onOpenBarcodeLabels: () => void;
  onOpenBarcodeScanner?: () => void;
  onPrintProductBarcode?: (product: Product) => void;
  currencySymbol: string;
}

export const PosProducts: React.FC<PosProductsProps> = ({
  products,
  categories,
  activeCategory,
  onSelectCategory,
  onProductClick,
  onAddQuickProduct,
  onOpenBarcodeLabels,
  onOpenBarcodeScanner,
  onPrintProductBarcode,
  currencySymbol,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Default categories matching Screenshot 2: اكسسوارات | شنط | عطور | مكياج
  const displayCategories = ['اكسسوارات', 'شنط', 'عطور', 'مكياج'];

  // Filter products by category and search
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !activeCategory || p.category === activeCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.code.toLowerCase().includes(query) ||
      p.barcode.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // 1. Check if input is a barcode or product code across all products
      const barcodeMatch = findProductByBarcode(products, searchQuery);
      if (barcodeMatch) {
        onProductClick(barcodeMatch);
        setSearchQuery('');
        return;
      }

      // 2. If filtered list has matches
      if (filteredProducts.length === 1) {
        onProductClick(filteredProducts[0]);
        setSearchQuery('');
      } else if (filteredProducts.length > 0) {
        onProductClick(filteredProducts[0]);
        setSearchQuery('');
      }
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]"
      dir="ltr"
    >
      {/* Sub-header matching Screenshot 2: [✳] [||||||] [#] [🏷] | [Search input 🔍 ⌨] */}
      <div className="h-10 bg-[#252a32] border-b border-[#31363f] flex items-stretch px-1 gap-1">
        {/* Left Action Buttons matching Screenshot */}
        <div className="flex items-stretch divide-x divide-[#31363f] border-r border-[#31363f]">
          {/* 1. Asterisk / Show All */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`w-10 flex items-center justify-center transition-colors cursor-pointer ${
              activeCategory === null
                ? 'bg-cyan-900/60 text-cyan-300 font-black'
                : 'hover:bg-[#2f3540] text-cyan-400'
            }`}
            title="عرض جميع المنتجات (*)"
          >
            <span className="text-xl font-bold leading-none">✳</span>
          </button>

          {/* 2. Barcode Scan / تشغيل زر قارئ الباركود */}
          <button
            onClick={onOpenBarcodeScanner || onOpenBarcodeLabels}
            className="w-11 flex items-center justify-center bg-cyan-950/60 hover:bg-cyan-900 active:bg-cyan-800 text-cyan-400 hover:text-white transition-colors cursor-pointer group relative"
            title="تشغيل زر قارئ الباركود لمسح الأصناف فورياً (Barcode Scanner)"
          >
            <Barcode size={18} className="group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
          </button>

          {/* 3. Price Tags / بطاقات الأسعار */}
          <button
            onClick={onOpenBarcodeLabels}
            className="w-10 flex items-center justify-center hover:bg-[#2f3540] active:bg-[#3b4352] text-gray-300 hover:text-cyan-300 transition-colors cursor-pointer font-mono font-bold text-base"
            title="طباعة بطاقات الأسعار (#)"
          >
            #
          </button>

          {/* 4. Tag / Promotions */}
          <button
            onClick={() => {
              alert('قائمة العروض والخصومات الخاصة بمتجر هجاير نشطة.');
            }}
            className="w-10 flex items-center justify-center hover:bg-[#2f3540] active:bg-[#3b4352] text-gray-300 hover:text-emerald-400 transition-colors cursor-pointer"
            title="العروض والخصومات"
          >
            <Tag size={16} />
          </button>
        </div>

        {/* Search Bar with Barcode Scanner Indicator */}
        <div className="flex-1 flex items-center relative my-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="اكتب هنا للبحث أو وجّه قارئ الباركود مباشرة... (Scan Barcode)"
            className="w-full h-full bg-[#181a1f] border border-[#383e4a] focus:border-cyan-500 rounded px-3 pr-28 text-xs text-gray-100 placeholder-gray-400 focus:outline-none font-sans"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 text-gray-400">
            <span className="flex items-center gap-1 text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded font-mono font-bold" title="قارئ الباركود نشط وجاهز لاستقبال المسح المباشر">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>القارئ نشط</span>
            </span>
            <Search size={14} className="text-gray-300" />
            <Keyboard size={14} className="cursor-pointer hover:text-white" />
          </div>
        </div>
      </div>

      {/* Category Tabs Row (Exact matching Screenshot 2: اكسسوارات | شنط | عطور | مكياج) */}
      <div className="bg-[#1f232b] border-b border-[#31363f] flex items-stretch h-14" dir="rtl">
        {displayCategories.map((cat) => {
          const isSelected = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(isSelected ? null : cat)}
              className={`flex-1 flex items-center justify-center text-sm font-bold border-l border-[#31363f] transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#2f3644] text-cyan-300 border-b-4 border-b-cyan-500 shadow-inner'
                  : 'bg-[#222730] text-gray-300 hover:bg-[#2a303c] hover:text-white'
              }`}
            >
              <span>{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Products Grid Area */}
      <div className="flex-1 p-3 overflow-y-auto bg-[#181a1f]" dir="rtl">
        {filteredProducts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-16">
            <span className="text-base font-bold text-gray-200">
              {products.length === 0 ? 'المخزن فارغ • تم تفريغ كافة المخزونات والأصناف بنجاح' : 'لا توجد منتجات مطابقة في هذا التصنيف'}
            </span>
            <p className="text-xs text-gray-400 max-w-sm text-center">
              {products.length === 0 ? 'يمكنك الآن البدء بإضافة أصنافك ومنتجاتك الجديدة إما من شاشة المنتجات أو مباشرة عبر ملصقات الباركود.' : ''}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onAddQuickProduct}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-colors"
              >
                <span>+ إضافة صنف جديد (المنتجات)</span>
              </button>
              <button
                onClick={onOpenBarcodeLabels}
                className="px-4 py-2 rounded-lg bg-[#252a34] hover:bg-[#2f3542] border border-[#3b4352] text-cyan-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition-colors"
              >
                <span>🏷️ إضافة وطباعة ملصق باركود</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                role="button"
                tabIndex={0}
                onClick={() => onProductClick(p)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onProductClick(p);
                  }
                }}
                className="h-28 bg-[#23272f] hover:bg-[#2a303a] active:bg-[#323947] border border-[#31363f] hover:border-cyan-500 rounded p-2 flex flex-col justify-between text-right cursor-pointer transition-all active:scale-[0.98] shadow-sm group select-none"
              >
                <div>
                  <div className="text-[10px] text-gray-400 font-mono truncate">{p.code}</div>
                  <div className="font-bold text-xs text-white line-clamp-2 mt-0.5 leading-snug group-hover:text-cyan-300">
                    {p.name}
                  </div>
                </div>

                <div className="pt-1 border-t border-[#2d323b] flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {formatNumber(p.salePrice)}
                    </span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {p.barcode ? p.barcode.slice(-4) : ''}
                    </span>
                  </div>

                  {onPrintProductBarcode && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPrintProductBarcode(p);
                      }}
                      className="p-1 rounded bg-[#1c1f26] hover:bg-cyan-600 text-gray-400 hover:text-white transition-colors cursor-pointer"
                      title={`طباعة ملصق باركود ${p.name} فورياً`}
                    >
                      <Barcode size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
