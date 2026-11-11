/**
 * Cash Payment Modal (F12 - نقداً)
 * Includes quick cash denomination chips, change calculation, and receipt printing
 */
import React, { useState, useEffect } from 'react';
import { X, Check, Printer, DollarSign } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  currencySymbol: string;
  onConfirmPayment: (paidAmount: number, changeAmount: number, printReceipt: boolean) => void;
}

export const CashPaymentModal: React.FC<CashPaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  currencySymbol,
  onConfirmPayment,
}) => {
  const [paidInput, setPaidInput] = useState<string>('');
  const [shouldPrint, setShouldPrint] = useState<boolean>(true);

  useEffect(() => {
    if (isOpen) {
      setPaidInput(grandTotal.toString());
    }
  }, [isOpen, grandTotal]);

  if (!isOpen) return null;

  const paidNum = parseFloat(paidInput) || 0;
  const change = Math.max(0, paidNum - grandTotal);
  const isSufficient = paidNum >= grandTotal;

  const quickAmounts = [
    grandTotal,
    Math.ceil(grandTotal / 10) * 10,
    50,
    100,
    200,
    500,
  ].filter((v, idx, arr) => arr.indexOf(v) === idx && v >= grandTotal);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isSufficient) return;
    onConfirmPayment(paidNum, change, shouldPrint);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
          <div className="flex items-center gap-2">
            <span className="bg-[#2e7d32] text-white font-mono font-bold text-xs px-2 py-0.5 rounded">F12</span>
            <h2 className="font-bold text-base text-white">الدفع النقدي (نقداً)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2c313a] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Total Due Display */}
          <div className="bg-[#17191d] border border-[#2e333d] rounded-lg p-3 text-center">
            <span className="text-xs text-gray-400 block mb-0.5">المبلغ المطلوب سداده</span>
            <span className="font-mono font-black text-3xl text-emerald-400">
              {formatNumber(grandTotal)} <span className="text-sm font-normal text-emerald-300">{currencySymbol}</span>
            </span>
          </div>

          {/* Paid Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              المبلغ المستلم من العميل
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                autoFocus
                value={paidInput}
                onChange={(e) => setPaidInput(e.target.value)}
                className="w-full h-12 bg-[#17191d] border-2 border-cyan-500 rounded-lg px-4 text-center font-mono font-bold text-2xl text-white focus:outline-none"
                placeholder="0.00"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-bold">
                {currencySymbol}
              </span>
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-2 pt-1">
            {quickAmounts.slice(0, 5).map((amt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPaidInput(amt.toString())}
                className="flex-1 min-w-[70px] py-1.5 px-2 bg-[#282d36] hover:bg-[#343b47] active:bg-cyan-900 border border-[#3b414d] rounded font-mono text-xs font-bold text-gray-200 transition-colors"
              >
                {formatNumber(amt)}
              </button>
            ))}
          </div>

          {/* Change Calculation (الباقي) */}
          <div className="bg-[#1a231f] border border-emerald-900/60 rounded-lg p-3 flex items-center justify-between">
            <span className="text-sm font-bold text-gray-300">المبلغ المتبقي للعميل (الباقي):</span>
            <span className={`font-mono font-bold text-2xl ${change > 0 ? 'text-amber-400' : 'text-gray-400'}`}>
              {formatNumber(change)} <span className="text-xs font-normal">{currencySymbol}</span>
            </span>
          </div>

          {!isSufficient && (
            <p className="text-xs text-rose-400 font-semibold text-center">
              المبلغ المدفوع أقل من إجمالي الفاتورة!
            </p>
          )}

          {/* Print toggle */}
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={shouldPrint}
              onChange={(e) => setShouldPrint(e.target.checked)}
              className="rounded bg-[#17191d] border-[#383e4a] text-cyan-500 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <Printer size={15} className="text-gray-400" />
            <span>طباعة إيصال الفاتورة تلقائياً بعد إنهاء العملية</span>
          </label>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#282d36] hover:bg-[#333944] text-gray-300 font-semibold text-sm rounded transition-colors"
            >
              إلغاء (Esc)
            </button>
            <button
              type="submit"
              disabled={!isSufficient}
              className="flex-2 py-2.5 bg-[#2e7d32] hover:bg-[#388e3c] active:bg-[#1b5e20] disabled:opacity-40 text-white font-bold text-sm rounded flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Check size={18} />
              <span>إتمام الدفع وطباعة الفاتورة (Enter)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
