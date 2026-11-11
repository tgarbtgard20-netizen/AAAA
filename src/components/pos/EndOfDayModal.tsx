/**
 * End Of Day (Z-Report) Daily Closing Modal (نهاية اليوم وتقفيل الحسابات)
 */
import React from 'react';
import { X, Printer, CheckCircle, TrendingUp, DollarSign, CreditCard, Clock } from 'lucide-react';
import { Document, CashMovement, CompanySettings } from '../../types';
import { formatNumber, formatCurrency } from '../../utils/formatters';

interface EndOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: Document[];
  movements: CashMovement[];
  settings: CompanySettings;
  cashierName: string;
}

export const EndOfDayModal: React.FC<EndOfDayModalProps> = ({
  isOpen,
  onClose,
  documents,
  movements,
  settings,
  cashierName,
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const todayDocs = documents.filter((d) => d.date.startsWith(todayStr));

  const salesDocs = todayDocs.filter((d) => d.type === 'SALE');
  const returnDocs = todayDocs.filter((d) => d.type === 'RETURN');

  const totalSalesRevenue = salesDocs.reduce((acc, d) => acc + d.grandTotal, 0);
  const totalReturns = returnDocs.reduce((acc, d) => acc + d.grandTotal, 0);
  const netSalesRevenue = totalSalesRevenue - totalReturns;

  const totalVat = todayDocs.reduce((acc, d) => {
    return acc + (d.type === 'RETURN' ? -d.taxTotal : d.taxTotal);
  }, 0);

  const cashSales = todayDocs
    .filter((d) => d.paymentMethod === 'CASH')
    .reduce((acc, d) => acc + (d.type === 'RETURN' ? -d.grandTotal : d.grandTotal), 0);

  const cardSales = todayDocs
    .filter((d) => d.paymentMethod === 'CARD')
    .reduce((acc, d) => acc + (d.type === 'RETURN' ? -d.grandTotal : d.grandTotal), 0);

  const creditSales = todayDocs
    .filter((d) => d.paymentMethod === 'CREDIT')
    .reduce((acc, d) => acc + (d.type === 'RETURN' ? -d.grandTotal : d.grandTotal), 0);

  // Cash drawer calculation
  const drawerTotal = movements.reduce((acc, m) => {
    if (m.type === 'START' || m.type === 'IN') return acc + m.amount;
    if (m.type === 'OUT' || m.type === 'END') return acc - m.amount;
    return acc;
  }, 0);

  const handlePrintZReport = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚶‍♂️</span>
            <h2 className="font-bold text-base text-white">إغلاق نهاية اليوم (تقرير الدورة المحاسبية Z-Report)</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Metadata */}
          <div className="bg-[#17191d] border border-[#2e333d] rounded-lg p-3 text-xs flex justify-between text-gray-300">
            <div>
              <span className="text-gray-400">التاريخ: </span>
              <span className="font-mono font-bold">{todayStr}</span>
            </div>
            <div>
              <span className="text-gray-400">الكاشير المسؤول: </span>
              <span className="font-bold text-cyan-400">{cashierName}</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#181a1f] border border-[#2e333d] rounded p-3 text-center">
              <span className="text-xs text-gray-400 block mb-1">صافي المبيعات اليومية</span>
              <span className="font-mono font-extrabold text-2xl text-emerald-400">
                {formatNumber(netSalesRevenue)} <span className="text-xs text-emerald-300">{settings.currency}</span>
              </span>
            </div>

            <div className="bg-[#181a1f] border border-[#2e333d] rounded p-3 text-center">
              <span className="text-xs text-gray-400 block mb-1">إجمالي ضريبة القيمة المضافة</span>
              <span className="font-mono font-extrabold text-2xl text-cyan-400">
                {formatNumber(totalVat)} <span className="text-xs text-cyan-300">{settings.currency}</span>
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="bg-[#17191d] border border-[#2e333d] rounded-lg divide-y divide-[#2a2f38] text-xs">
            <div className="p-2.5 flex justify-between">
              <span className="text-gray-300">عدد فواتير المبيعات:</span>
              <span className="font-mono font-bold text-white">{salesDocs.length} فاتورة</span>
            </div>
            <div className="p-2.5 flex justify-between">
              <span className="text-gray-300">عدد فواتير المرتجعات:</span>
              <span className="font-mono font-bold text-rose-400">{returnDocs.length} مرتجع</span>
            </div>
            <div className="p-2.5 flex justify-between bg-[#1d222b]">
              <span className="text-gray-200 font-semibold flex items-center gap-1.5">
                <DollarSign size={14} className="text-emerald-400" />
                المتحصلات النقدية (كاش):
              </span>
              <span className="font-mono font-bold text-emerald-400">
                {formatNumber(cashSales)} {settings.currency}
              </span>
            </div>
            <div className="p-2.5 flex justify-between bg-[#1d222b]">
              <span className="text-gray-200 font-semibold flex items-center gap-1.5">
                <CreditCard size={14} className="text-cyan-400" />
                مدفوعات البطاقات الإلكترونية (مدى):
              </span>
              <span className="font-mono font-bold text-cyan-400">
                {formatNumber(cardSales)} {settings.currency}
              </span>
            </div>
            <div className="p-2.5 flex justify-between bg-[#1d222b]">
              <span className="text-gray-200 font-semibold">المبيعات بالآجل (ديون على العملاء):</span>
              <span className="font-mono font-bold text-amber-400">
                {formatNumber(creditSales)} {settings.currency}
              </span>
            </div>
            <div className="p-3 flex justify-between bg-[#242b36] font-bold">
              <span className="text-white">الرصيد الفعلي المتوقع بالدرج:</span>
              <span className="font-mono text-base text-emerald-300">
                {formatNumber(drawerTotal)} {settings.currency}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#282d36] hover:bg-[#333944] text-xs font-semibold rounded text-gray-300 transition-colors"
            >
              إغلاق
            </button>
            <button
              onClick={handlePrintZReport}
              className="flex-2 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
            >
              <Printer size={16} />
              <span>طباعة تقرير الإغلاق اليومي (Z-Report)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
