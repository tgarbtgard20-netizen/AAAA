/**
 * Master Payment Checkout Modal for Aronium POS
 * Supports: نقداً (Cash), شبكة / مدى (Mada), بطاقة (Card), آجل (Credit), and Multi/Split Payment
 */
import React, { useState, useEffect } from 'react';
import {
  X,
  Banknote,
  CreditCard,
  Smartphone,
  UserCheck,
  Check,
  Printer,
  Calculator,
  ShieldCheck,
  Split,
} from 'lucide-react';
import { Customer, PaymentMethod } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface PosPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  grandTotal: number;
  customers: Customer[];
  selectedCustomer: Customer;
  onCompletePayment: (
    method: PaymentMethod,
    paidAmount: number,
    changeAmount: number,
    customerId: string,
    notes: string,
    shouldPrint: boolean
  ) => void;
  currencySymbol: string;
  initialMethod?: PaymentMethod;
}

export const PosPaymentModal: React.FC<PosPaymentModalProps> = ({
  isOpen,
  onClose,
  grandTotal,
  customers,
  selectedCustomer,
  onCompletePayment,
  currencySymbol,
  initialMethod = 'CASH',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(initialMethod);
  const [cashReceived, setCashReceived] = useState<string>(grandTotal.toString());
  const [targetCustomerId, setTargetCustomerId] = useState<string>(selectedCustomer.id);
  const [notes, setNotes] = useState<string>('');
  const [shouldPrint, setShouldPrint] = useState<boolean>(true);

  // Split payment state
  const [splitCashAmount, setSplitCashAmount] = useState<string>('');
  const [splitCardAmount, setSplitCardAmount] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setSelectedMethod(initialMethod);
      setCashReceived(grandTotal.toString());
      setTargetCustomerId(selectedCustomer.id);
      setNotes('');
      setSplitCashAmount((grandTotal / 2).toFixed(2));
      setSplitCardAmount((grandTotal / 2).toFixed(2));
    }
  }, [isOpen, grandTotal, initialMethod, selectedCustomer]);

  if (!isOpen) return null;

  const quickCashAmounts = [
    grandTotal,
    Math.ceil(grandTotal / 10) * 10,
    Math.ceil(grandTotal / 50) * 50,
    Math.ceil(grandTotal / 100) * 100,
    50,
    100,
    200,
    500,
  ].filter((v, i, a) => v >= grandTotal && a.indexOf(v) === i);

  const numericCashReceived = parseFloat(cashReceived) || 0;
  const changeAmount = Math.max(0, numericCashReceived - grandTotal);

  const handleFinish = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    let finalPaid = grandTotal;
    let finalChange = 0;

    if (selectedMethod === 'CASH') {
      finalPaid = numericCashReceived;
      finalChange = changeAmount;
    } else if (selectedMethod === 'CREDIT') {
      finalPaid = 0;
      finalChange = 0;
    } else {
      // CARD or TRANSFER
      finalPaid = grandTotal;
      finalChange = 0;
    }

    onCompletePayment(
      selectedMethod,
      finalPaid,
      finalChange,
      targetCustomerId,
      notes,
      shouldPrint
    );
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#1f2228] border border-[#3b414d] rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#17191d] border-b border-[#2e333d]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Banknote size={18} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white">سداد الفاتورة وإتمام العملية</h2>
              <p className="text-[11px] text-gray-400">اختر طريقة السداد المعتمدة (نقد • شبكة • بطاقة • آجل)</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Grand Total Banner */}
        <div className="bg-gradient-to-r from-[#17202a] via-[#1a2530] to-[#17202a] p-4 border-b border-[#2d3440] flex items-center justify-between">
          <span className="text-gray-300 font-bold text-sm">المبلغ الإجمالي المطلوب سداده:</span>
          <span className="font-mono font-black text-2xl text-emerald-400">
            {formatNumber(grandTotal)} {currencySymbol}
          </span>
        </div>

        {/* Payment Methods Grid */}
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-4 gap-2">
            {/* 1. نقداً */}
            <button
              type="button"
              onClick={() => {
                setSelectedMethod('CASH');
                setCashReceived(grandTotal.toString());
              }}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'CASH'
                  ? 'bg-emerald-950/70 border-emerald-500 text-white shadow-lg ring-2 ring-emerald-500/30'
                  : 'bg-[#252a33] border-[#343b47] text-gray-300 hover:bg-[#2c3340] hover:text-white'
              }`}
            >
              <Banknote size={22} className={selectedMethod === 'CASH' ? 'text-emerald-400' : 'text-gray-400'} />
              <span className="font-bold text-xs mt-1">نقداً (Cash)</span>
              <span className="text-[10px] text-gray-400 font-mono">F12</span>
            </button>

            {/* 2. شبكة / مدى */}
            <button
              type="button"
              onClick={() => setSelectedMethod('CARD')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'CARD'
                  ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg ring-2 ring-cyan-500/30'
                  : 'bg-[#252a33] border-[#343b47] text-gray-300 hover:bg-[#2c3340] hover:text-white'
              }`}
            >
              <CreditCard size={22} className={selectedMethod === 'CARD' ? 'text-cyan-400' : 'text-gray-400'} />
              <span className="font-bold text-xs mt-1">شبكة / مدى</span>
              <span className="text-[10px] text-gray-400 font-mono">F11</span>
            </button>

            {/* 3. بطاقة ائتمانية / فيزا */}
            <button
              type="button"
              onClick={() => setSelectedMethod('CARD')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'CARD'
                  ? 'bg-blue-950/70 border-blue-500 text-white shadow-lg'
                  : 'bg-[#252a33] border-[#343b47] text-gray-300 hover:bg-[#2c3340] hover:text-white'
              }`}
            >
              <CreditCard size={22} className="text-blue-400" />
              <span className="font-bold text-xs mt-1">بطاقة فيزا/ماستر</span>
              <span className="text-[10px] text-gray-400 font-mono">بطاقة بنك</span>
            </button>

            {/* 4. آجل */}
            <button
              type="button"
              onClick={() => setSelectedMethod('CREDIT')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                selectedMethod === 'CREDIT'
                  ? 'bg-amber-950/70 border-amber-500 text-white shadow-lg ring-2 ring-amber-500/30'
                  : 'bg-[#252a33] border-[#343b47] text-gray-300 hover:bg-[#2c3340] hover:text-white'
              }`}
            >
              <UserCheck size={22} className={selectedMethod === 'CREDIT' ? 'text-amber-400' : 'text-gray-400'} />
              <span className="font-bold text-xs mt-1">آجل (دين)</span>
              <span className="text-[10px] text-gray-400 font-mono">F10</span>
            </button>
          </div>

          {/* Details based on selected payment method */}
          {selectedMethod === 'CASH' && (
            <div className="bg-[#17191d] border border-[#2e333d] rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  المبلغ المستلم من العميل نقداً:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full h-11 bg-[#121417] border-2 border-emerald-500 rounded-lg px-3 text-center font-mono font-black text-xl text-white focus:outline-none"
                    autoFocus
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">
                    {currencySymbol}
                  </span>
                </div>
              </div>

              {/* Quick Cash Buttons */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setCashReceived(amt.toString())}
                    className={`px-3 py-1.5 bg-[#252a33] hover:bg-[#303742] border rounded font-mono text-xs font-bold transition-colors cursor-pointer ${
                      cashReceived === amt.toString() ? 'border-emerald-400 text-emerald-300' : 'border-[#384150] text-gray-300'
                    }`}
                  >
                    {amt} {currencySymbol}
                  </button>
                ))}
              </div>

              {/* Change / الباقي */}
              <div className="flex items-center justify-between bg-[#1f242d] p-3 rounded-lg border border-[#313845] mt-2">
                <span className="font-bold text-xs text-gray-300">المتبقي للعميل (الباقي):</span>
                <span className="font-mono font-black text-lg text-amber-400">
                  {formatNumber(changeAmount)} {currencySymbol}
                </span>
              </div>
            </div>
          )}

          {selectedMethod === 'CARD' && (
            <div className="bg-[#17191d] border border-[#2e333d] rounded-xl p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
                <Smartphone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">الدفع عبر أجهزة نقاط البيع (مدى / فيزا)</h4>
                <p className="text-xs text-gray-400 mt-0.5">
                  مرر بطاقة العميل أو الجوال على جهاز الشبكة. سيتم ترحيل الفاتورة كـ مسددة بالكامل.
                </p>
                <div className="mt-2 text-xs font-mono font-bold text-cyan-300">
                  المبلغ الموجه للجهاز: {formatNumber(grandTotal)} {currencySymbol}
                </div>
              </div>
            </div>
          )}

          {selectedMethod === 'CREDIT' && (
            <div className="bg-[#17191d] border border-[#2e333d] rounded-xl p-4 space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  اختر العميل لتسجيل المديونية عليه:
                </label>
                <select
                  value={targetCustomerId}
                  onChange={(e) => setTargetCustomerId(e.target.value)}
                  className="w-full h-10 bg-[#121417] border border-[#384150] rounded-lg px-3 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.balance > 0 ? `(عليه سابقاً: ${formatNumber(c.balance)} ر.س)` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1">
                  ملاحظات أو رقم سند الآجل:
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: آجل يسدد نهاية الشهر / اتفاق مبيعات"
                  className="w-full h-9 bg-[#121417] border border-[#384150] rounded-lg px-3 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Options: Print receipt toggle */}
          <div className="flex items-center justify-between bg-[#191c22] px-3.5 py-2.5 rounded-lg border border-[#2c323d] text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={shouldPrint}
                onChange={(e) => setShouldPrint(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 focus:ring-cyan-500"
              />
              <span className="font-bold text-gray-200 flex items-center gap-1.5">
                <Printer size={15} className="text-cyan-400" />
                <span>طباعة الفاتورة الحرارية فوراً بعد الحفظ</span>
              </span>
            </label>
            <span className="text-[11px] text-gray-400">معتمدة مع باركود الزكاة والضريبة</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="px-5 py-3.5 bg-[#17191d] border-t border-[#2e333d] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-bold rounded-lg transition-colors cursor-pointer"
          >
            إلغاء
          </button>

          <button
            type="button"
            onClick={handleFinish}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg transition-all cursor-pointer"
          >
            <Check size={16} />
            <span>تأكيد وطباعة الفاتورة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
