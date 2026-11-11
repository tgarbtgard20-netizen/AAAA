/**
 * Dual Mode Discount Modal:
 * 1. الخصم بالصنف (Discount on a specific item)
 * 2. الخصم بالإجمالي (Discount on the entire invoice/cart)
 * With Percent (%) or Fixed Saudi Riyals (ر.س.) for both
 */
import React, { useState, useEffect } from 'react';
import { X, Percent, Check, Banknote, Trash2, Tag, ShoppingCart } from 'lucide-react';
import { CartItem } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  selectedItemIndex: number | null;
  onApplyItemDiscount: (itemIndex: number, type: 'PERCENT' | 'AMOUNT', value: number) => void;
  onApplyTotalDiscount: (type: 'PERCENT' | 'AMOUNT', value: number) => void;
  onClearDiscount: () => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  selectedItemIndex,
  onApplyItemDiscount,
  onApplyTotalDiscount,
  onClearDiscount,
}) => {
  // Main target mode: 'ITEM' (الخصم بالصنف) vs 'TOTAL' (الخصم بالإجمالي)
  const [targetScope, setTargetScope] = useState<'ITEM' | 'TOTAL'>('TOTAL');
  // Selected cart item index when discounting by item
  const [activeItemIdx, setActiveItemIdx] = useState<number>(0);
  // Calculation unit: 'PERCENT' (%) vs 'AMOUNT' (ر.س.)
  const [discountType, setDiscountType] = useState<'PERCENT' | 'AMOUNT'>('PERCENT');
  const [inputValue, setInputValue] = useState<string>('10');

  // Sync initial state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (selectedItemIndex !== null && selectedItemIndex >= 0 && selectedItemIndex < cartItems.length) {
        setActiveItemIdx(selectedItemIndex);
        setTargetScope('ITEM');
      } else {
        setActiveItemIdx(0);
        setTargetScope('TOTAL');
      }
      setDiscountType('PERCENT');
      setInputValue('10');
    }
  }, [isOpen, selectedItemIndex, cartItems.length]);

  if (!isOpen) return null;

  const currentCartSubtotal = cartItems.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0);
  const currentTotalPaid = cartItems.reduce((acc, it) => acc + it.total, 0);
  const currentTotalDiscount = Math.max(0, currentCartSubtotal - currentTotalPaid);

  const selectedItem = cartItems[activeItemIdx] || cartItems[0] || null;
  const itemSubtotal = selectedItem ? selectedItem.unitPrice * selectedItem.quantity : 0;

  const quickPercentages = [5, 10, 15, 20, 25, 50];
  const quickAmounts = [5, 10, 20, 35, 50, 100];

  const numericVal = parseFloat(inputValue) || 0;

  // Calculate discount for preview based on scope
  const targetBase = targetScope === 'ITEM' ? itemSubtotal : currentCartSubtotal;
  const calculatedDiscountSAR =
    discountType === 'PERCENT'
      ? (targetBase * numericVal) / 100
      : Math.min(targetBase, numericVal);
  const netAfterDiscount = Math.max(0, targetBase - calculatedDiscountSAR);

  const handleApply = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (targetScope === 'ITEM') {
      onApplyItemDiscount(activeItemIdx, discountType, numericVal);
    } else {
      onApplyTotalDiscount(discountType, numericVal);
    }
    onClose();
  };

  const handleClearAll = () => {
    onClearDiscount();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#20242b] border border-[#3b414d] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171a1f] border-b border-[#31363f]">
          <h2 className="font-bold text-sm text-white flex items-center gap-2">
            <Percent size={18} className="text-amber-400" />
            <span>خيارات الخصم (بالصنف أو بالإجمالي)</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Main Scope Selector: الخصم بالصنف vs الخصم بالإجمالي */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              نوع الخصم المطلوب:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#15171b] p-1.5 rounded-xl border border-[#313742]">
              {/* خيار 1: الخصم بالصنف */}
              <button
                type="button"
                onClick={() => {
                  setTargetScope('ITEM');
                  setInputValue('10');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  targetScope === 'ITEM'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Tag size={16} />
                <span>الخصم بالصنف</span>
              </button>

              {/* خيار 2: الخصم بالإجمالي */}
              <button
                type="button"
                onClick={() => {
                  setTargetScope('TOTAL');
                  setInputValue('10');
                }}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  targetScope === 'TOTAL'
                    ? 'bg-cyan-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ShoppingCart size={16} />
                <span>الخصم بالإجمالي</span>
              </button>
            </div>
          </div>

          {/* Item Selector Dropdown (Shown when 'ITEM' mode is active) */}
          {targetScope === 'ITEM' && (
            <div className="bg-[#171a20] border border-[#2e3442] p-3 rounded-xl space-y-2">
              <label className="block text-xs font-bold text-amber-300">
                اختر الصنف من الفاتورة لتطبيق الخصم عليه:
              </label>
              <select
                value={activeItemIdx}
                onChange={(e) => setActiveItemIdx(parseInt(e.target.value, 10))}
                className="w-full h-10 bg-[#121418] border border-amber-500/60 rounded-lg px-3 text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              >
                {cartItems.map((it, idx) => (
                  <option key={it.id || idx} value={idx}>
                    {idx + 1}. {it.product.name} ({it.quantity} × {formatNumber(it.unitPrice)} = {formatNumber(it.quantity * it.unitPrice)} ر.س.)
                  </option>
                ))}
              </select>
              {selectedItem && (
                <div className="flex justify-between items-center text-[11px] text-gray-400 pt-1">
                  <span>سعر الصنف الأصلي ({selectedItem.quantity} قطعة):</span>
                  <span className="font-mono font-bold text-gray-200">
                    {formatNumber(itemSubtotal)} ر.س.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Calculation Type Toggle: % vs ر.س. */}
          <div className="grid grid-cols-2 gap-2 bg-[#15171b] p-1 rounded-lg border border-[#313742]">
            <button
              type="button"
              onClick={() => {
                setDiscountType('PERCENT');
                setInputValue('10');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                discountType === 'PERCENT'
                  ? 'bg-purple-700 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Percent size={14} />
              <span>نسبة مئوية (%)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setDiscountType('AMOUNT');
                setInputValue('20');
              }}
              className={`flex items-center justify-center gap-1.5 py-2 rounded-md font-bold text-xs transition-all cursor-pointer ${
                discountType === 'AMOUNT'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Banknote size={14} />
              <span>مبلغ بالريال (ر.س.)</span>
            </button>
          </div>

          {/* Input field */}
          <form onSubmit={handleApply} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5">
                {discountType === 'PERCENT'
                  ? `أدخل نسبة الخصم (${targetScope === 'ITEM' ? 'على الصنف' : 'على الإجمالي'}):`
                  : `أدخل قيمة الخصم المباشر بالريال (${targetScope === 'ITEM' ? 'على الصنف' : 'على الإجمالي'}):`}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max={discountType === 'PERCENT' ? '100' : targetBase}
                  step="any"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full h-12 bg-[#15171b] border-2 border-amber-500 rounded-xl px-4 text-center font-mono font-black text-2xl text-white focus:outline-none"
                  autoFocus
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">
                  {discountType === 'PERCENT' ? '%' : 'ر.س.'}
                </span>
              </div>
            </div>

            {/* Quick buttons */}
            <div className="grid grid-cols-3 gap-2">
              {discountType === 'PERCENT'
                ? quickPercentages.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setInputValue(p.toString())}
                      className={`py-2 bg-[#282d36] hover:bg-[#343b47] border rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                        inputValue === p.toString()
                          ? 'border-amber-400 text-amber-300 bg-amber-950/40'
                          : 'border-[#383e4a] text-gray-200'
                      }`}
                    >
                      {p}%
                    </button>
                  ))
                : quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setInputValue(amt.toString())}
                      className={`py-2 bg-[#282d36] hover:bg-[#343b47] border rounded-lg font-mono font-bold text-xs transition-colors cursor-pointer ${
                        inputValue === amt.toString()
                          ? 'border-emerald-400 text-emerald-300 bg-emerald-950/40'
                          : 'border-[#383e4a] text-gray-200'
                      }`}
                    >
                      {amt} ر.س.
                    </button>
                  ))}
            </div>

            {/* Calculation summary preview */}
            <div className="bg-[#16181d] border border-[#2d323d] rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>
                  {targetScope === 'ITEM'
                    ? `سعر صنف "${selectedItem?.product.name || 'الصنف'}" قبل الخصم:`
                    : 'إجمالي الفاتورة قبل الخصم:'}
                </span>
                <span className="font-mono font-bold text-gray-300">
                  {formatNumber(targetBase)} ر.س.
                </span>
              </div>
              <div className="flex justify-between text-amber-400 font-bold">
                <span>قيمة الخصم المحسوبة:</span>
                <span className="font-mono text-sm">
                  - {formatNumber(calculatedDiscountSAR)} ر.س.
                </span>
              </div>
              <div className="border-t border-dashed border-gray-700 pt-2 flex justify-between font-bold text-white text-sm">
                <span>
                  {targetScope === 'ITEM' ? 'السعر النهائي للصنف:' : 'السعر النهائي للفاتورة:'}
                </span>
                <span className="font-mono text-emerald-400 text-base">
                  {formatNumber(netAfterDiscount)} ر.س.
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              {currentTotalDiscount > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-3 py-2.5 bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="إلغاء جميع الخصومات الحالية"
                >
                  <Trash2 size={14} />
                  <span>إلغاء الخصم</span>
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-[#282d36] hover:bg-[#333944] text-xs font-semibold rounded-xl text-gray-300 cursor-pointer transition-colors"
              >
                رجوع
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Check size={16} />
                <span>
                  {targetScope === 'ITEM' ? 'تطبيق الخصم على الصنف' : 'تطبيق الخصم على الإجمالي'}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
