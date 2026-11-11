import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, Plus, Barcode } from 'lucide-react';
import { Product } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  currencySymbol: string;
}

export const ProductSearchModal: React.FC<ProductSearchModalProps> = ({
  isOpen,
  onClose,
  products,
  onSelectProduct,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearchTerm('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = searchTerm.trim().toLowerCase();
  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.barcode.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#20242b] border border-[#3b414d] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Search Input */}
        <div className="p-4 bg-[#17191d] border-b border-[#2e333d] flex items-center gap-3">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              placeholder="ابحث بالاسم أو الباركود أو الكود أو المجموعة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 bg-[#131518] border border-[#394050] focus:border-cyan-500 rounded-xl px-4 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none"
            />
            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl hover:bg-gray-800 text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto divide-y divide-[#282d38] p-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              <Package size={36} className="mx-auto mb-2 opacity-40 text-gray-400" />
              <p className="text-sm font-semibold">لم يتم العثور على أي صنف مطابق لـ "{searchTerm}"</p>
              <p className="text-xs text-gray-600 mt-1">تأكد من كتابة الاسم أو الباركود بدقة</p>
            </div>
          ) : (
            filtered.map((prod) => (
              <div
                key={prod.id}
                onClick={() => {
                  onSelectProduct(prod);
                  onClose();
                }}
                className="p-3 hover:bg-[#283244] rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#14161a] border border-[#313642] flex items-center justify-center overflow-hidden shrink-0">
                    {prod.image ? (
                      <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package size={18} className="text-gray-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                      {prod.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="bg-[#1b1e24] px-1.5 py-0.5 rounded text-[10px]">
                        {prod.category}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[11px] flex items-center gap-1">
                        <Barcode size={12} className="text-gray-500" />
                        {prod.barcode}
                      </span>
                      <span>•</span>
                      <span>المتوفر: {prod.stock}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left font-mono">
                    <span className="text-sm font-bold text-emerald-400">
                      {formatNumber(prod.salePrice)}
                    </span>
                    <span className="text-[11px] text-gray-400 mr-1">{currencySymbol}</span>
                  </div>
                  <button
                    type="button"
                    className="p-2 rounded-lg bg-cyan-600/30 group-hover:bg-cyan-600 text-cyan-300 group-hover:text-white transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#17191d] border-t border-[#2e333d] flex items-center justify-between text-xs text-gray-400">
          <span>نتائج البحث: {filtered.length} صنف</span>
          <span>اضغط على أي صنف لإضافته مباشرة إلى سلة المبيعات</span>
        </div>
      </div>
    </div>
  );
};
