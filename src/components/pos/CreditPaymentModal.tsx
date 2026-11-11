/**
 * Credit Payment Modal (F10 - آجل)
 * Handles customer credit sales, debt limits, and balance updates
 */
import React, { useState } from 'react';
import { X, Check, UserCheck, AlertTriangle, UserPlus } from 'lucide-react';
import { Customer } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface CreditPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  customers: Customer[];
  selectedCustomer: Customer;
  onSelectCustomer: (cust: Customer) => void;
  onConfirmCredit: (customerId: string, notes: string) => void;
  onAddNewCustomer: () => void;
  currencySymbol: string;
}

export const CreditPaymentModal: React.FC<CreditPaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onConfirmCredit,
  onAddNewCustomer,
  currencySymbol,
}) => {
  const [notes, setNotes] = useState('');
  const [searchCust, setSearchCust] = useState('');

  if (!isOpen) return null;

  const validCustomers = customers.filter(
    (c) => c.id !== 'c0' && (c.name.includes(searchCust) || c.phone.includes(searchCust))
  );

  const isGeneralCustomer = selectedCustomer.id === 'c0';
  const newBalance = (selectedCustomer.balance || 0) + grandTotal;
  const isOverLimit = selectedCustomer.creditLimit > 0 && newBalance > selectedCustomer.creditLimit;

  const handleConfirm = () => {
    if (isGeneralCustomer) {
      alert('لا يمكن إتمام البيع بالآجل للعميل النقدي العام. يرجى اختيار عميل مسجل أو إضافة عميل جديد.');
      return;
    }
    onConfirmCredit(selectedCustomer.id, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
          <div className="flex items-center gap-2">
            <span className="bg-[#2e7d32] text-white font-mono font-bold text-xs px-2 py-0.5 rounded">F10</span>
            <h2 className="font-bold text-base text-white">البيع بالآجل (حساب العميل)</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2c313a] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Invoice Total Banner */}
          <div className="bg-[#17191d] border border-[#2e333d] rounded-lg p-3 flex justify-between items-center">
            <span className="text-xs text-gray-400">إجمالي فاتورة الآجل:</span>
            <span className="font-mono font-black text-2xl text-emerald-400">
              {formatNumber(grandTotal)} <span className="text-xs font-normal text-emerald-300">{currencySymbol}</span>
            </span>
          </div>

          {/* Customer Selection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-gray-300">اختر العميل المسجل:</label>
              <button
                type="button"
                onClick={onAddNewCustomer}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <UserPlus size={14} />
                <span>إضافة عميل جديد</span>
              </button>
            </div>

            <input
              type="text"
              placeholder="ابحث عن العميل بالاسم أو رقم الهاتف..."
              value={searchCust}
              onChange={(e) => setSearchCust(e.target.value)}
              className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500 mb-2"
            />

            <div className="max-h-40 overflow-y-auto space-y-1 bg-[#17191d] border border-[#2e333d] rounded p-1">
              {validCustomers.map((cust) => {
                const isSelected = cust.id === selectedCustomer.id;
                return (
                  <div
                    key={cust.id}
                    onClick={() => onSelectCustomer(cust)}
                    className={`p-2 rounded flex items-center justify-between cursor-pointer text-xs transition-colors ${
                      isSelected
                        ? 'bg-[#293241] border border-cyan-500/80 text-white'
                        : 'hover:bg-[#20242a] text-gray-300'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        {cust.name}
                        {isSelected && <UserCheck size={14} className="text-cyan-400" />}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">{cust.phone}</div>
                    </div>
                    <div className="text-left">
                      <div className="text-[10px] text-gray-400">الرصيد الحالي المستحق:</div>
                      <div className={`font-mono font-bold ${cust.balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {formatNumber(cust.balance)} {currencySymbol}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Selected Customer Details */}
          {isGeneralCustomer ? (
            <div className="p-3 bg-amber-950/30 border border-amber-800/50 rounded flex items-start gap-2 text-xs text-amber-300">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <div>
                <strong>تنبيه:</strong> العميل الحالي هو (عميل نقدي عام). البيع بالآجل يتطلب تحديد عميل لديه حساب مسجل لمتابعة المديونية وكشف الحساب.
              </div>
            </div>
          ) : (
            <div className="bg-[#1a212d] border border-[#2c3e55] rounded-lg p-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">العميل المختار:</span>
                <span className="font-bold text-white">{selectedCustomer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">سقف الائتمان المسموح:</span>
                <span className="font-mono text-gray-200">
                  {selectedCustomer.creditLimit > 0 ? `${formatNumber(selectedCustomer.creditLimit)} ${currencySymbol}` : 'غير محدود'}
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-[#2e3d50]">
                <span className="text-gray-400">الرصيد الجديد بعد هذه الفاتورة:</span>
                <span className="font-mono font-bold text-base text-amber-400">
                  {formatNumber(newBalance)} {currencySymbol}
                </span>
              </div>

              {isOverLimit && (
                <div className="text-rose-400 font-semibold text-[11px] pt-1">
                  ⚠️ تجاوز العميل سقف الائتمان المحدد ({formatNumber(selectedCustomer.creditLimit)} {currencySymbol})
                </div>
              )}
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1">
              ملاحظات الفاتورة / تاريخ الاستحقاق:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="مثال: مستحق السداد خلال 15 يوم / استلام بالفرع الرئيسي"
              className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#282d36] hover:bg-[#333944] text-gray-300 font-semibold text-xs rounded transition-colors"
            >
              إلغاء
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isGeneralCustomer}
              className="flex-2 py-2.5 bg-[#2e7d32] hover:bg-[#388e3c] active:bg-[#1b5e20] disabled:opacity-40 text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Check size={16} />
              <span>تسجيل الفاتورة بالآجل (F10)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
