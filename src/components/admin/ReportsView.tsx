/**
 * Financial Reports & Accounting Statements (التقارير المحاسبية والقوائم المالية)
 */
import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  TrendingUp,
  CreditCard,
  Printer,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';
import { Document, Product, Customer, CompanySettings } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface ReportsViewProps {
  documents: Document[];
  products: Product[];
  customers: Customer[];
  settings: CompanySettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  documents,
  products,
  customers,
  settings,
}) => {
  const [selectedReport, setSelectedReport] = useState<'PL' | 'VAT' | 'SALES' | 'CUSTOMERS'>('PL');

  // Overall calculations
  const salesDocs = documents.filter((d) => d.type === 'SALE');
  const returnDocs = documents.filter((d) => d.type === 'RETURN');

  const grossSales = salesDocs.reduce((acc, d) => acc + d.grandTotal, 0);
  const returnsAmount = returnDocs.reduce((acc, d) => acc + d.grandTotal, 0);
  const netRevenue = grossSales - returnsAmount;

  const totalVat = documents.reduce((acc, d) => {
    return acc + (d.type === 'RETURN' ? -d.taxTotal : d.taxTotal);
  }, 0);

  const baseSales = netRevenue - totalVat;

  const totalCost = documents.reduce((acc, d) => {
    const docCost = d.items.reduce((s, it) => s + (it.costPrice || it.unitPrice * 0.6) * it.quantity, 0);
    return acc + (d.type === 'RETURN' ? -docCost : docCost);
  }, 0);

  const netOperatingProfit = baseSales - totalCost;

  // Payment Breakdown
  const cashTotal = documents
    .filter((d) => d.paymentMethod === 'CASH')
    .reduce((acc, d) => acc + (d.type === 'RETURN' ? -d.grandTotal : d.grandTotal), 0);

  const cardTotal = documents
    .filter((d) => d.paymentMethod === 'CARD')
    .reduce((acc, d) => acc + (d.type === 'RETURN' ? -d.grandTotal : d.grandTotal), 0);

  const creditTotal = documents
    .filter((d) => d.paymentMethod === 'CREDIT')
    .reduce((acc, d) => acc + (d.type === 'RETURN' ? -d.grandTotal : d.grandTotal), 0);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1b1e23] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]">
      {/* Top Tabs */}
      <div className="bg-[#20242b] border-b border-[#313742] p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedReport('PL')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              selectedReport === 'PL'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'bg-[#29303c] text-gray-300 hover:bg-[#343d4d]'
            }`}
          >
            الأرباح والخسائر (Income Statement)
          </button>

          <button
            onClick={() => setSelectedReport('VAT')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              selectedReport === 'VAT'
                ? 'bg-cyan-700 text-white shadow-md'
                : 'bg-[#29303c] text-gray-300 hover:bg-[#343d4d]'
            }`}
          >
            الإقرار الضريبي (VAT Report)
          </button>

          <button
            onClick={() => setSelectedReport('SALES')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              selectedReport === 'SALES'
                ? 'bg-blue-700 text-white shadow-md'
                : 'bg-[#29303c] text-gray-300 hover:bg-[#343d4d]'
            }`}
          >
            المبيعات حسب طرق الدفع
          </button>

          <button
            onClick={() => setSelectedReport('CUSTOMERS')}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-colors cursor-pointer ${
              selectedReport === 'CUSTOMERS'
                ? 'bg-amber-700 text-white shadow-md'
                : 'bg-[#29303c] text-gray-300 hover:bg-[#343d4d]'
            }`}
          >
            تقرير مديونيات العملاء
          </button>
        </div>

        <button
          onClick={() => window.print()}
          className="px-3 py-1.5 bg-[#2b3544] hover:bg-[#38465c] text-cyan-300 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-cyan-800/40"
        >
          <Printer size={15} />
          <span>طباعة التقرير</span>
        </button>
      </div>

      {/* Report Content */}
      <div className="flex-1 p-6 overflow-y-auto bg-[#141619]">
        {/* REPORT 1: Profit & Loss */}
        {selectedReport === 'PL' && (
          <div className="max-w-3xl mx-auto bg-[#1e2229] border border-[#313742] rounded-lg p-6 space-y-5">
            <div className="text-center border-b border-[#313742] pb-4">
              <h2 className="text-lg font-black text-white">قائمة الدخل والأرباح والخسائر الشاملة</h2>
              <p className="text-xs text-gray-400 mt-1">
                الفترة المحاسبية الحالية • {settings.commercialName || settings.name}
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-2 border-b border-[#2e3440]">
                <span className="font-bold text-gray-200">إجمالي المبيعات (شامل الضريبة):</span>
                <span className="font-mono font-bold text-emerald-400">
                  {formatNumber(grossSales)} {settings.currency}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2e3440] text-rose-400">
                <span>يخصم: مردودات ومبيعات مرتجعة:</span>
                <span className="font-mono">-{formatNumber(returnsAmount)} {settings.currency}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2e3440] font-bold text-white bg-[#171a1f] px-2 rounded">
                <span>صافي الإيرادات:</span>
                <span className="font-mono text-cyan-400">
                  {formatNumber(netRevenue)} {settings.currency}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2e3440] text-gray-400">
                <span>ضريبة القيمة المضافة المستحقة للهيئة (15%):</span>
                <span className="font-mono">-{formatNumber(totalVat)} {settings.currency}</span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2e3440]">
                <span className="text-gray-300">صافي المبيعات الأساسي بدون ضريبة:</span>
                <span className="font-mono font-bold text-gray-200">
                  {formatNumber(baseSales)} {settings.currency}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-[#2e3440] text-amber-400">
                <span>يخصم: تكلفة البضاعة المباعة (COGS):</span>
                <span className="font-mono">-{formatNumber(totalCost)} {settings.currency}</span>
              </div>

              <div className="flex justify-between py-3.5 bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-lg text-sm font-extrabold text-white mt-4">
                <span className="flex items-center gap-2">
                  <TrendingUp size={18} className="text-emerald-400" />
                  صافي الربح التشغيلي المحقق:
                </span>
                <span className="font-mono text-xl text-emerald-400">
                  {formatNumber(netOperatingProfit)} {settings.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 2: VAT Tax Declaration */}
        {selectedReport === 'VAT' && (
          <div className="max-w-3xl mx-auto bg-[#1e2229] border border-[#313742] rounded-lg p-6 space-y-5">
            <div className="text-center border-b border-[#313742] pb-4">
              <h2 className="text-lg font-black text-white">إقرار ضريبة القيمة المضافة (VAT Return)</h2>
              <p className="text-xs text-gray-400 mt-1">
                الرقم الضريبي للمنشأة: <strong className="font-mono text-cyan-400">{settings.taxNumber}</strong>
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-[#171a1f] p-3 rounded border border-[#2e3440]">
                <div className="flex justify-between font-bold text-gray-200 mb-1">
                  <span>المبيعات الخاضعة للنسبة الأساسية (15%):</span>
                  <span className="font-mono text-emerald-400">
                    {formatNumber(baseSales)} {settings.currency}
                  </span>
                </div>
                <div className="flex justify-between text-gray-400 text-[11px]">
                  <span>ضريبة المخرجات المحصلة:</span>
                  <span className="font-mono text-cyan-400">
                    {formatNumber(totalVat)} {settings.currency}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-cyan-950/30 border border-cyan-800/50 rounded-lg flex justify-between items-center text-sm font-bold">
                <span className="text-white">إجمالي الضريبة الواجبة السداد للهيئة:</span>
                <span className="font-mono text-2xl text-cyan-400">
                  {formatNumber(totalVat)} {settings.currency}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 3: Sales by payment method */}
        {selectedReport === 'SALES' && (
          <div className="max-w-3xl mx-auto bg-[#1e2229] border border-[#313742] rounded-lg p-6 space-y-5">
            <div className="text-center border-b border-[#313742] pb-4">
              <h2 className="text-lg font-black text-white">توزيع المبيعات حسب طرق الدفع</h2>
              <p className="text-xs text-gray-400 mt-1">نقد (Cash) • مدى وبطاقات • آجل (On Account)</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-4 bg-[#171a1f] border border-[#2e3440] rounded">
                <span className="text-xs text-gray-400 block mb-1">المبيعات النقدية</span>
                <span className="font-mono font-bold text-xl text-emerald-400">
                  {formatNumber(cashTotal)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">{settings.currency}</span>
              </div>

              <div className="p-4 bg-[#171a1f] border border-[#2e3440] rounded">
                <span className="text-xs text-gray-400 block mb-1">مدفوعات البطاقة / مدى</span>
                <span className="font-mono font-bold text-xl text-cyan-400">
                  {formatNumber(cardTotal)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">{settings.currency}</span>
              </div>

              <div className="p-4 bg-[#171a1f] border border-[#2e3440] rounded">
                <span className="text-xs text-gray-400 block mb-1">المبيعات بالآجل (ديون)</span>
                <span className="font-mono font-bold text-xl text-amber-400">
                  {formatNumber(creditTotal)}
                </span>
                <span className="text-[10px] text-gray-500 block mt-1">{settings.currency}</span>
              </div>
            </div>
          </div>
        )}

        {/* REPORT 4: Customer debts */}
        {selectedReport === 'CUSTOMERS' && (
          <div className="max-w-3xl mx-auto bg-[#1e2229] border border-[#313742] rounded-lg p-6 space-y-4">
            <div className="text-center border-b border-[#313742] pb-4">
              <h2 className="text-lg font-black text-white">كشف أعمار ديون ومستحقات العملاء</h2>
            </div>

            <div className="divide-y divide-[#2e3440] text-xs">
              {customers
                .filter((c) => c.balance > 0)
                .map((c) => (
                  <div key={c.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{c.name}</div>
                      <div className="text-gray-400 text-[11px] font-mono">{c.phone}</div>
                    </div>
                    <div className="text-left font-mono">
                      <div className="font-bold text-amber-400">
                        {formatNumber(c.balance)} {settings.currency}
                      </div>
                      <div className="text-[10px] text-gray-500">حد: {formatNumber(c.creditLimit)}</div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
