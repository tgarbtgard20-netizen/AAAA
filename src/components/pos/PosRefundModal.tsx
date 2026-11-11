/**
 * Dedicated Refund & Return Invoice Management Modal
 * Allows searching by original invoice number, selecting returned items,
 * and issuing an official ZATCA Credit Note / Return Tax Invoice with auto-print.
 */
import React, { useState } from 'react';
import {
  RotateCcw,
  Search,
  X,
  FileText,
  CheckCircle2,
  AlertCircle,
  Printer,
  Calendar,
  User,
  ShoppingBag,
  ArrowRight,
  CreditCard,
  Banknote,
  Clock,
} from 'lucide-react';
import { Document, DocumentItem, PaymentMethod } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface PosRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  recentDocuments: Document[];
  onProcessRefund: (
    originalDoc: Document | null,
    returnItems: { item: DocumentItem; returnQty: number }[],
    refundMethod: PaymentMethod,
    refundReason: string,
    autoPrint: boolean
  ) => void;
  onEnableDirectRefundMode: () => void;
}

export const PosRefundModal: React.FC<PosRefundModalProps> = ({
  isOpen,
  onClose,
  recentDocuments,
  onProcessRefund,
  onEnableDirectRefundMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({});
  const [refundMethod, setRefundMethod] = useState<PaymentMethod>('CASH');
  const [refundReason, setRefundReason] = useState('إرجاع بضاعة بحالة جيدة (مطابق لسياسة الاسترجاع)');
  const [autoPrint, setAutoPrint] = useState(true);

  if (!isOpen) return null;

  // Filter sales invoices (not returns) for lookup
  const salesInvoices = recentDocuments.filter((d) => d.type === 'SALE');

  const filteredInvoices = salesInvoices.filter((d) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.trim().toLowerCase();
    return (
      d.number.toLowerCase().includes(q) ||
      (d.customerName && d.customerName.toLowerCase().includes(q)) ||
      (d.orderNumber && d.orderNumber.toString().includes(q))
    );
  });

  const handleSelectInvoice = (doc: Document) => {
    setSelectedDoc(doc);
    // Initialize return quantities to 0
    const initialQty: Record<string, number> = {};
    doc.items.forEach((it) => {
      initialQty[it.id] = 0;
    });
    setReturnQuantities(initialQty);
  };

  const handleToggleAllItems = () => {
    if (!selectedDoc) return;
    const allSelected = selectedDoc.items.every(
      (it) => (returnQuantities[it.id] || 0) === it.quantity
    );
    const updated: Record<string, number> = {};
    selectedDoc.items.forEach((it) => {
      updated[it.id] = allSelected ? 0 : it.quantity;
    });
    setReturnQuantities(updated);
  };

  const handleQtyChange = (itemId: string, maxQty: number, val: number) => {
    const safeVal = Math.max(0, Math.min(maxQty, val));
    setReturnQuantities((prev) => ({
      ...prev,
      [itemId]: safeVal,
    }));
  };

  // Calculate return totals
  const itemsToReturn = selectedDoc
    ? selectedDoc.items
        .filter((it) => (returnQuantities[it.id] || 0) > 0)
        .map((it) => ({
          item: it,
          returnQty: returnQuantities[it.id] || 0,
        }))
    : [];

  const totalReturnAmount = itemsToReturn.reduce(
    (acc, { item, returnQty }) => acc + item.unitPrice * returnQty,
    0
  );

  const handleSubmitRefund = () => {
    if (itemsToReturn.length === 0) {
      alert('يرجى تحديد صنف واحد على الأقل لإرجاعه وتحديد الكمية.');
      return;
    }

    onProcessRefund(selectedDoc, itemsToReturn, refundMethod, refundReason, autoPrint);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 select-none overflow-hidden font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#1b1e24] border border-[#3b414d] rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col text-gray-200 overflow-hidden">
        {/* Header */}
        <header className="h-14 bg-[#16181d] border-b border-[#2d323c] flex items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <RotateCcw size={20} />
            </div>
            <div>
              <h1 className="font-bold text-base text-white flex items-center gap-2">
                <span>إرجاع بضاعة وإصدار فاتورة مرتجع (إشعار دائن)</span>
              </h1>
              <p className="text-[11px] text-gray-400">
                متوافق مع هيئة الزكاة والضريبة والجمارك (ZATCA) وضوابط الاسترجاع بمتجر هجاير
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onEnableDirectRefundMode();
                onClose();
              }}
              className="text-xs bg-[#252b36] hover:bg-rose-900/40 text-rose-300 border border-rose-800/40 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold cursor-pointer transition-colors"
              title="تفعيل وضع الإرجاع في شاشة البيع لمسح الباركود مباشرة"
            >
              <span>🔄 تفعيل الإرجاع الحر بالباركود</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[#282d36] text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Body Split */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left / Column 1: Search & Invoice List */}
          <div className="w-80 bg-[#16181d] border-l border-[#2e333d] flex flex-col">
            <div className="p-3 border-b border-[#2e333d]">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث برقم الفاتورة (مثال: 26-200-000595)"
                  className="w-full h-9 bg-[#101215] border border-[#393f4c] rounded-lg px-3 pl-8 text-xs text-white placeholder-gray-500 font-mono focus:border-rose-500 focus:outline-none"
                />
                <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <div className="text-[10px] text-gray-400 mt-1 flex justify-between">
                <span>الفواتير المسجلة ({filteredInvoices.length})</span>
                <span>اختر فاتورة للبدء</span>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#252a33]">
              {filteredInvoices.length === 0 ? (
                <div className="p-6 text-center text-gray-500 text-xs">
                  لا توجد فواتير مبيعات مطابقة
                </div>
              ) : (
                filteredInvoices.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => handleSelectInvoice(doc)}
                      className={`w-full p-3 text-right transition-all cursor-pointer block ${
                        isSelected
                          ? 'bg-rose-950/40 border-r-4 border-r-rose-500 text-white'
                          : 'hover:bg-[#1f232b] text-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-mono font-bold text-xs text-white">
                          {doc.number}
                        </span>
                        <span className="font-mono font-bold text-xs text-emerald-400">
                          {formatNumber(doc.grandTotal)} ر.س.
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-gray-400">
                        <span>{doc.customerName || 'عميل نقدي عام'}</span>
                        <span className="font-mono">{doc.date.split(' ')[0]}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 mt-0.5 truncate">
                        {doc.items.map((i) => i.name).join(' • ')}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right / Column 2: Selected Invoice Details & Items to Return */}
          <div className="flex-1 flex flex-col bg-[#1d2027] overflow-hidden">
            {selectedDoc ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Invoice Meta Banner */}
                <div className="p-4 bg-[#181a20] border-b border-[#2d323c] flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-white">
                        فاتورة رقم: {selectedDoc.number}
                      </span>
                      <span className="text-[11px] bg-emerald-950/80 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded font-mono font-bold">
                        مدفوعة ({formatNumber(selectedDoc.grandTotal)} ر.س.)
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-gray-400">
                      <span className="flex items-center gap-1 font-mono">
                        <Calendar size={13} /> {selectedDoc.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <User size={13} /> {selectedDoc.customerName}
                      </span>
                      <span>الكاشير: {selectedDoc.cashierName}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleToggleAllItems}
                    className="text-xs bg-[#242933] hover:bg-[#303644] text-cyan-300 px-3 py-1.5 rounded-lg border border-[#3b4352] font-bold cursor-pointer transition-colors"
                  >
                    تحديد الكل / إلغاء الكل
                  </button>
                </div>

                {/* Items Return Table */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <h3 className="font-bold text-xs text-gray-300 mb-2 flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-rose-400" />
                    <span>حدد الأصناف والكميات المراد استرجاعها:</span>
                  </h3>

                  <div className="border border-[#313642] rounded-xl overflow-hidden bg-[#16181d]">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-[#121418] text-gray-400 font-bold border-b border-[#313642]">
                        <tr>
                          <th className="p-2.5">الصنف</th>
                          <th className="p-2.5 text-center">الكمية بالفاتورة</th>
                          <th className="p-2.5 text-left">سعر الحبة</th>
                          <th className="p-2.5 text-center">كمية المرتجع</th>
                          <th className="p-2.5 text-left">مبلغ الإرجاع</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#242832]">
                        {selectedDoc.items.map((it) => {
                          const returnQty = returnQuantities[it.id] || 0;
                          const isReturning = returnQty > 0;
                          return (
                            <tr
                              key={it.id}
                              className={`transition-colors ${
                                isReturning ? 'bg-rose-950/25' : 'hover:bg-[#1a1d24]'
                              }`}
                            >
                              <td className="p-2.5 font-bold text-white">
                                <div>{it.name}</div>
                                <div className="text-[10px] text-gray-500 font-mono">{it.code}</div>
                              </td>
                              <td className="p-2.5 text-center font-mono font-bold text-gray-300">
                                {it.quantity}
                              </td>
                              <td className="p-2.5 text-left font-mono text-gray-300">
                                {formatNumber(it.unitPrice)} ر.س.
                              </td>
                              <td className="p-2.5 text-center">
                                <div className="inline-flex items-center border border-[#3a414f] rounded-lg overflow-hidden bg-[#101215]">
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(it.id, it.quantity, returnQty - 1)}
                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    min="0"
                                    max={it.quantity}
                                    value={returnQty}
                                    onChange={(e) =>
                                      handleQtyChange(it.id, it.quantity, parseInt(e.target.value) || 0)
                                    }
                                    className="w-12 h-7 bg-transparent text-center font-mono font-bold text-white text-xs focus:outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleQtyChange(it.id, it.quantity, returnQty + 1)}
                                    className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-white hover:bg-gray-800 cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </td>
                              <td className="p-2.5 text-left font-mono font-black text-rose-400">
                                {returnQty > 0
                                  ? `${formatNumber(it.unitPrice * returnQty)} ر.س.`
                                  : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Return Options: Method, Reason */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Refund Method */}
                    <div className="bg-[#16181d] border border-[#313642] rounded-xl p-3">
                      <label className="block text-xs font-bold text-gray-300 mb-2">
                        طريقة إرجاع المبلغ للعميل:
                      </label>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setRefundMethod('CASH')}
                          className={`py-2 px-1 rounded-lg border font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            refundMethod === 'CASH'
                              ? 'bg-rose-950/60 border-rose-500 text-white'
                              : 'bg-[#1e222a] border-[#363d4a] text-gray-400 hover:text-white'
                          }`}
                        >
                          <Banknote size={16} />
                          <span>نقداً (Cash)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRefundMethod('CARD')}
                          className={`py-2 px-1 rounded-lg border font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            refundMethod === 'CARD'
                              ? 'bg-rose-950/60 border-rose-500 text-white'
                              : 'bg-[#1e222a] border-[#363d4a] text-gray-400 hover:text-white'
                          }`}
                        >
                          <CreditCard size={16} />
                          <span>شبكة / مدى</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRefundMethod('CREDIT')}
                          className={`py-2 px-1 rounded-lg border font-bold flex flex-col items-center gap-1 cursor-pointer transition-all ${
                            refundMethod === 'CREDIT'
                              ? 'bg-rose-950/60 border-rose-500 text-white'
                              : 'bg-[#1e222a] border-[#363d4a] text-gray-400 hover:text-white'
                          }`}
                        >
                          <Clock size={16} />
                          <span>رصيد دائن</span>
                        </button>
                      </div>
                    </div>

                    {/* Reason */}
                    <div className="bg-[#16181d] border border-[#313642] rounded-xl p-3">
                      <label className="block text-xs font-bold text-gray-300 mb-2">
                        سبب الإرجاع:
                      </label>
                      <input
                        type="text"
                        value={refundReason}
                        onChange={(e) => setRefundReason(e.target.value)}
                        placeholder="سبب الاسترجاع..."
                        className="w-full h-9 bg-[#101215] border border-[#393f4c] rounded-lg px-3 text-xs text-white"
                      />
                      <p className="text-[10px] text-gray-500 mt-1">
                        سيتم إرجاع المنتجات تلقائياً لمخزون المستودع وتسجيل العملية في سجلات الزكاة.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer Controls & Confirm */}
                <div className="p-4 bg-[#14161b] border-t border-[#2d323c] flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-[11px] text-gray-400 block">إجمالي مبلغ المرتجع المسترد:</span>
                      <span className="font-mono font-black text-xl text-rose-400">
                        {formatNumber(totalReturnAmount)} ر.س.
                      </span>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs text-gray-300 cursor-pointer bg-[#20242e] px-3 py-1.5 rounded-lg border border-[#39404f]">
                      <input
                        type="checkbox"
                        checked={autoPrint}
                        onChange={(e) => setAutoPrint(e.target.checked)}
                        className="accent-rose-500 rounded"
                      />
                      <span className="font-bold">طباعة فاتورة المرتجع تلقائياً 🖨️</span>
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-bold cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleSubmitRefund}
                      disabled={itemsToReturn.length === 0}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-red-600 hover:from-rose-600 hover:to-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-black shadow-lg flex items-center gap-2 cursor-pointer transition-all"
                    >
                      <Printer size={16} />
                      <span>إصدار وطباعة فاتورة المرتجع (80mm)</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-[#181b22] border border-[#2d3340] flex items-center justify-center text-gray-500">
                  <Search size={28} />
                </div>
                <h3 className="font-bold text-sm text-gray-300">اختر فاتورة من القائمة للبدء</h3>
                <p className="text-xs text-gray-500 max-w-sm">
                  يمكنك البحث برقم الفاتورة (مثال: 26-200-000595) لتحميل أصنافها واختيار ما يرغب العميل بإرجاعه، أو التبديل للإرجاع الحر بالباركود.
                </p>
                <button
                  onClick={() => {
                    onEnableDirectRefundMode();
                    onClose();
                  }}
                  className="mt-2 px-4 py-2 bg-[#252b36] hover:bg-rose-900/40 text-rose-300 border border-rose-800/50 rounded-lg text-xs font-bold cursor-pointer"
                >
                  أو فتح وضع الإرجاع الحر بالباركود الآن
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
