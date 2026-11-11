/**
 * POS Cart & Invoice Table matching left column of Screenshot 2 (________________259f0147.jpg)
 * With Discount positioned directly before Grand Total with % or SAR currency support
 */
import React from 'react';
import { X, Hash, MoreHorizontal, Trash2, Lock, RotateCw, Percent, Tag } from 'lucide-react';
import { CartItem } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface PosCartProps {
  items: CartItem[];
  selectedItemIndex: number | null;
  onSelectItem: (index: number) => void;
  onDeleteItem: () => void;
  onChangeQuantity: () => void;
  onItemOptions: () => void;
  onCancelInvoice: () => void;
  onLockSession: () => void;
  onRepeatRound: () => void;
  onOpenDiscount?: () => void;
  currencySymbol: string;
}

export const PosCart: React.FC<PosCartProps> = ({
  items,
  selectedItemIndex,
  onSelectItem,
  onDeleteItem,
  onChangeQuantity,
  onItemOptions,
  onCancelInvoice,
  onLockSession,
  onRepeatRound,
  onOpenDiscount,
  currencySymbol,
}) => {
  // Financial calculations
  const originalSubtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const grandTotal = items.reduce((acc, it) => acc + it.total, 0);
  const totalDiscount = Math.max(0, originalSubtotal - grandTotal);
  const taxTotal = items.reduce((acc, it) => acc + it.taxAmount, 0);
  const subtotalBeforeTax = Math.max(0, grandTotal - taxTotal);

  return (
    <div
      className="w-[380px] lg:w-[420px] bg-[#1d2025] border-r border-[#31363f] flex flex-col h-full select-none text-gray-200 font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Sub-toolbar above table: [حذف X] [الكمية] [---] (Screenshot 2) */}
      <div className="h-10 bg-[#252a32] border-b border-[#31363f] flex items-stretch divide-x divide-[#31363f] divide-x-reverse text-xs font-semibold">
        <button
          onClick={onDeleteItem}
          disabled={selectedItemIndex === null || items.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 hover:bg-rose-950/40 text-gray-200 hover:text-rose-400 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="حذف الصنف المحدد (Delete)"
        >
          <X size={15} className="text-rose-400" />
          <span>حذف</span>
        </button>

        <button
          onClick={onChangeQuantity}
          disabled={selectedItemIndex === null || items.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 hover:bg-[#2e3440] text-gray-200 hover:text-cyan-400 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
          title="تغيير الكمية للصنف المحدد"
        >
          <Hash size={15} />
          <span>الكمية</span>
        </button>

        <button
          onClick={onItemOptions}
          disabled={selectedItemIndex === null || items.length === 0}
          className="w-14 flex items-center justify-center hover:bg-[#2e3440] text-gray-400 hover:text-white disabled:opacity-40 cursor-pointer transition-colors"
          title="خيارات إضافية"
        >
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* Cart Items Table */}
      <div className="flex-1 overflow-y-auto bg-[#181a1f]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-500">
            <div className="w-12 h-12 rounded-full border border-dashed border-gray-600 flex items-center justify-center mb-3 text-gray-500">
              <Tag size={20} />
            </div>
            <p className="text-sm font-bold text-gray-400">لا توجد عناصر</p>
            <p className="text-[11px] text-gray-600 mt-1 max-w-[200px]">
              اختر أصنافاً من القائمة أو امسح الباركود لإضافتها إلى الفاتورة
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#272b33]">
            {items.map((item, idx) => {
              const isSelected = selectedItemIndex === idx;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(idx)}
                  className={`px-3 py-2.5 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#293444] text-white border-r-4 border-cyan-400'
                      : 'hover:bg-[#21252d] text-gray-200'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="font-bold text-xs truncate">{item.product.name}</div>
                    <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-cyan-300 font-semibold">
                        {item.quantity} × {formatNumber(item.unitPrice)}
                      </span>
                      {item.discountPercent > 0 && (
                        <span className="text-amber-400 text-[10px] font-bold bg-amber-950/60 px-1 rounded border border-amber-800">
                          خصم {item.discountPercent}%
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left font-mono font-bold text-sm text-emerald-400 pl-1">
                    {formatNumber(item.total)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Totals Summary Box - Exact placement: الخصم قبل الإجمالي مباشرة */}
      <div className="bg-[#1f232b] border-t border-[#31363f] p-3 text-xs space-y-1.5">
        {/* المجموع قبل الخصم */}
        <div className="flex justify-between items-center text-gray-300 font-medium">
          <span>المجموع</span>
          <span className="font-mono font-bold text-sm text-gray-200">
            {formatNumber(originalSubtotal)}
          </span>
        </div>

        {/* الخصم المباشر (قبل الإجمالي في واجهة البيع الأساسية) */}
        <div className="flex justify-between items-center bg-[#282d36] px-2.5 py-1.5 rounded border border-[#3b4352] transition-colors">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold flex items-center gap-1 text-xs">
              <Percent size={13} />
              <span>الخصم</span>
            </span>
            {onOpenDiscount && (
              <button
                onClick={onOpenDiscount}
                className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer font-bold transition-colors"
                title="تطبيق أو تعديل الخصم بالنسبة المئوية (%) أو بالريال السعودي"
              >
                {totalDiscount > 0 ? 'تعديل' : '+ تطبيق خصم'}
              </button>
            )}
          </div>
          <span className="font-mono font-bold text-sm text-amber-400">
            {totalDiscount > 0 ? `- ${formatNumber(totalDiscount)}` : '0.00'}
          </span>
        </div>

        {/* الضريبة */}
        <div className="flex justify-between items-center text-gray-300 font-medium">
          <span>ضريبة (15%)</span>
          <span className="font-mono font-bold text-sm text-gray-200">
            {formatNumber(taxTotal)}
          </span>
        </div>

        {/* Dashed divider */}
        <div className="border-t border-dashed border-gray-600 my-1 pt-1 flex justify-between items-center">
          <span className="font-bold text-sm text-white">الإجمالي</span>
          <span className="font-mono font-black text-xl text-emerald-400">
            {formatNumber(grandTotal)}
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons (Screenshot 2: إلغاء الفاتورة / قفل / كرر الجولة) */}
      <div className="h-11 bg-[#1a1d22] border-t border-[#31363f] flex items-stretch divide-x divide-[#31363f] divide-x-reverse text-xs font-semibold">
        {/* Cancel Sale / إلغاء الفاتورة (Red button with trash icon) */}
        <button
          onClick={onCancelInvoice}
          disabled={items.length === 0}
          className="flex-1 flex items-center justify-center gap-1.5 bg-[#8e2424] hover:bg-[#a62b2b] active:bg-[#721a1a] text-white disabled:opacity-40 disabled:bg-[#341d1d] cursor-pointer transition-colors shadow-inner"
          title="إلغاء الفاتورة بالكامل وتفريغ السلة"
        >
          <Trash2 size={14} />
          <span>...إلغاء الفاتورة</span>
        </button>

        {/* Lock Screen / قفل */}
        <button
          onClick={onLockSession}
          className="w-16 flex items-center justify-center gap-1 hover:bg-[#282e38] active:bg-[#333944] text-gray-300 hover:text-white cursor-pointer transition-colors"
          title="قفل شاشة الكاشير مؤقتاً"
        >
          <Lock size={14} />
          <span>قفل</span>
        </button>

        {/* Repeat Round / كرر الجولة */}
        <button
          onClick={onRepeatRound}
          disabled={items.length === 0}
          className="w-24 flex items-center justify-center gap-1 hover:bg-[#282e38] active:bg-[#333944] text-gray-300 hover:text-white disabled:opacity-40 cursor-pointer transition-colors"
          title="تكرار كمية الأصناف الأخيرة"
        >
          <RotateCw size={14} />
          <span>كرر الجولة</span>
        </button>
      </div>
    </div>
  );
};
