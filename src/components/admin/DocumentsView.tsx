/**
 * Management Documents View matching Screenshot 3 EXACTLY
 */
import React, { useState } from 'react';
import {
  Plus,
  Printer,
  Eye,
  FileText,
  Edit2,
  Trash2,
  Search,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  FileCode,
} from 'lucide-react';
import { Document, Product, Customer } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { StorageService } from '../../services/storage';

interface DocumentsViewProps {
  documents: Document[];
  products: Product[];
  customers: Customer[];
  onAddDocument: () => void;
  onEditDocument: (doc: Document) => void;
  onDeleteDocument: (id: string) => void;
  onPrintPreview: (doc: Document) => void;
  currencySymbol: string;
  onClearAllDocuments?: () => void;
}

export const DocumentsView: React.FC<DocumentsViewProps> = ({
  documents,
  products,
  customers,
  onAddDocument,
  onEditDocument,
  onDeleteDocument,
  onPrintPreview,
  currencySymbol,
  onClearAllDocuments,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    documents.length > 0 ? documents[0].id : null
  );

  // Filters state (Screenshot 3 filter inputs)
  const [filterProduct, setFilterProduct] = useState('ALL');
  const [filterCustomer, setFilterCustomer] = useState('ALL');
  const [filterInvoiceNum, setFilterInvoiceNum] = useState('');
  const [filterUser, setFilterUser] = useState('ALL');
  const [filterDocType, setFilterDocType] = useState('ALL');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('ALL');
  const [filterDateFrom, setFilterDateFrom] = useState('2026-10-27');
  const [filterDateTo, setFilterDateTo] = useState('2026-10-27');

  // Filter logic
  const filteredDocs = documents.filter((doc) => {
    if (filterProduct !== 'ALL') {
      const hasProduct = doc.items.some((it) => it.productId === filterProduct);
      if (!hasProduct) return false;
    }
    if (filterCustomer !== 'ALL' && doc.customerId !== filterCustomer) return false;
    if (
      filterInvoiceNum.trim() &&
      !doc.number.toLowerCase().includes(filterInvoiceNum.trim().toLowerCase())
    ) {
      return false;
    }
    if (filterDocType !== 'ALL' && doc.type !== filterDocType) return false;
    if (filterPaymentStatus !== 'ALL' && doc.paymentStatus !== filterPaymentStatus) return false;
    return true;
  });

  const selectedDoc = documents.find((d) => d.id === selectedDocId) || filteredDocs[0] || null;

  const handleClearFilters = () => {
    setFilterProduct('ALL');
    setFilterCustomer('ALL');
    setFilterInvoiceNum('');
    setFilterUser('ALL');
    setFilterDocType('ALL');
    setFilterPaymentStatus('ALL');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1b1e23] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]">
      {/* Top Action Toolbar (Screenshot 3 buttons: إضافة، طباعة، معاينة قبل الطباعة، احفظ PDF، تعديل) */}
      <div className="h-14 bg-[#23272e] border-b border-[#313742] flex items-center px-4 gap-2 text-xs">
        {/* + إضافة */}
        <button
          onClick={onAddDocument}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b313a] hover:bg-[#343b46] active:bg-cyan-900 text-cyan-400 font-bold transition-colors cursor-pointer border border-[#38404d]"
          >
            <Plus size={16} />
            <span>إضافة</span>
          </button>

          {/* طباعة */}
          <button
            type="button"
            onClick={() => {
              const docToPrint = selectedDoc || (filteredDocs.length > 0 ? filteredDocs[0] : null);
              if (docToPrint) onPrintPreview(docToPrint);
            }}
            disabled={!selectedDoc && filteredDocs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white font-bold disabled:opacity-40 transition-colors cursor-pointer border border-emerald-600/60 shadow-sm"
            title="طباعة الفاتورة"
          >
            <Printer size={16} />
            <span>طباعة الفاتورة</span>
          </button>

          {/* معاينة قبل الطباعة */}
          <button
            type="button"
            onClick={() => {
              const docToPrint = selectedDoc || (filteredDocs.length > 0 ? filteredDocs[0] : null);
              if (docToPrint) onPrintPreview(docToPrint);
            }}
            disabled={!selectedDoc && filteredDocs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b313a] hover:bg-[#343b46] text-gray-200 disabled:opacity-40 transition-colors cursor-pointer border border-[#38404d]"
            title="معاينة الفاتورة قبل الطباعة"
          >
            <Eye size={16} />
            <span>معاينة قبل الطباعة</span>
          </button>

          {/* احفظ PDF */}
          <button
            type="button"
            onClick={() => {
              const docToPrint = selectedDoc || (filteredDocs.length > 0 ? filteredDocs[0] : null);
              if (docToPrint) onPrintPreview(docToPrint);
            }}
            disabled={!selectedDoc && filteredDocs.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b313a] hover:bg-[#343b46] text-gray-200 disabled:opacity-40 transition-colors cursor-pointer border border-[#38404d]"
            title="تصدير وحفظ الفاتورة كملف PDF"
          >
            <FileText size={16} />
            <span>احفظ PDF</span>
          </button>

          {/* تعديل */}
          <button
            onClick={() => {
              if (selectedDoc) onEditDocument(selectedDoc);
            }}
            disabled={!selectedDoc}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b313a] hover:bg-[#343b46] text-gray-200 disabled:opacity-40 transition-colors cursor-pointer border border-[#38404d]"
          >
            <Edit2 size={15} />
            <span>تعديل</span>
          </button>

          {/* تصدير JSON */}
          <button
            onClick={() => {
              try {
                StorageService.downloadJsonFile(
                  {
                    system: 'Hajayer POS - Invoices Export',
                    exportDate: new Date().toISOString(),
                    count: filteredDocs.length,
                    documents: filteredDocs,
                  },
                  `Hajayer_Invoices_${new Date().toISOString().substring(0, 10)}.json`
                );
              } catch (err: any) {
                alert('فشل في تصدير الفواتير: ' + err?.message);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2b313a] hover:bg-[#343b46] text-cyan-300 transition-colors cursor-pointer border border-[#38404d]"
            title="تصدير الفواتير المعروضة كملف JSON محلي"
          >
            <Download size={15} />
            <span>تصدير JSON</span>
          </button>
        </div>

      {/* Filter Row matching Screenshot 3 */}
      <div className="bg-[#1e2227] border-b border-[#313742] p-3 text-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
          {/* المنتج */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">المنتج</label>
            <select
              value={filterProduct}
              onChange={(e) => setFilterProduct(e.target.value)}
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-xs text-white"
            >
              <option value="ALL">جميع المنتجات</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* العميل */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">العميل</label>
            <select
              value={filterCustomer}
              onChange={(e) => setFilterCustomer(e.target.value)}
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-xs text-white"
            >
              <option value="ALL">كل العملاء</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* رقم الفاتورة */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">رقم الفاتورة</label>
            <input
              type="text"
              placeholder="رقم الفاتورة..."
              value={filterInvoiceNum}
              onChange={(e) => setFilterInvoiceNum(e.target.value)}
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-xs text-white font-mono"
            />
          </div>

          {/* المستخدم */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">المستخدم</label>
            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-xs text-white"
            >
              <option value="ALL">جميع المستخدمين</option>
              <option value="admin">POS - Admin</option>
            </select>
          </div>

          {/* نوع الفاتورة */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">نوع الفاتورة</label>
            <select
              value={filterDocType}
              onChange={(e) => setFilterDocType(e.target.value)}
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-xs text-white"
            >
              <option value="ALL">جميع الفواتير</option>
              <option value="SALE">فاتورة مبيعات</option>
              <option value="RETURN">فاتورة مرتجع</option>
              <option value="PURCHASE">فاتورة مشتريات</option>
              <option value="QUOTE">عرض أسعار</option>
            </select>
          </div>

          {/* حالة الدفع */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">حالة الدفع</label>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-xs text-white"
            >
              <option value="ALL">كل التعاملات</option>
              <option value="PAID">مدفوعة نقداً/بطاقة</option>
              <option value="CREDIT">آجل / غير مسدد</option>
            </select>
          </div>

          {/* الفترة */}
          <div>
            <label className="block text-[11px] text-gray-400 mb-1">الفترة</label>
            <input
              type="text"
              readOnly
              value="10/27/2026 - 10/27/2026"
              className="w-full h-8 bg-[#16181b] border border-[#383e4a] rounded px-2 text-[11px] text-gray-300 font-mono text-center"
            />
          </div>

          {/* Buttons: بحث / مسح */}
          <div className="flex items-end gap-1">
            <button
              onClick={() => {}}
              className="flex-1 h-8 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded flex items-center justify-center gap-1 cursor-pointer"
            >
              <Search size={14} />
              <span>بحث</span>
            </button>
            <button
              onClick={handleClearFilters}
              className="h-8 px-2.5 bg-[#2a2f38] hover:bg-[#343b46] text-gray-300 rounded flex items-center justify-center cursor-pointer"
              title="مسح الفلاتر"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grids Split Area (Screenshot 3 Upper Grid: الفواتير | Lower Grid: الأصناف) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Upper Grid: الفواتير (Documents List) */}
        <div className="flex-1 flex flex-col min-h-[220px] border-b-2 border-[#2b303a]">
          {/* Section Title */}
          <div className="bg-[#181a1f] px-3 py-1.5 border-b border-[#2e333d] flex items-center justify-between text-xs font-bold text-gray-300">
            <span>الفواتير والمستندات ({filteredDocs.length})</span>
            <span className="text-[11px] text-gray-400 font-normal">
              اضغط على أي فاتورة لعرض تفاصيل الأصناف المضمنة بأسفل الشاشة
            </span>
          </div>

          {/* Table Container */}
          <div className="flex-1 overflow-auto bg-[#141619]">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-[#1e2229] text-gray-300 sticky top-0 border-b border-[#313742] z-10 font-bold">
                <tr>
                  <th className="p-2 w-10 text-center">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="p-2">ID</th>
                  <th className="p-2 text-center">العدد</th>
                  <th className="p-2">رقم الفاتورة</th>
                  <th className="p-2">نوع الفاتورة</th>
                  <th className="p-2 text-center">مدفوعة</th>
                  <th className="p-2">العميل</th>
                  <th className="p-2">التاريخ</th>
                  <th className="p-2">POS</th>
                  <th className="p-2 text-left">الإجمالي</th>
                  <th className="p-2 text-center">نوع الدفع</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a33]">
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-12 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-gray-400">
                        <div className="p-3 bg-[#1e2229] border border-[#2e3442] rounded-full text-emerald-400 font-bold text-lg">
                          0.00
                        </div>
                        <div className="font-bold text-sm text-gray-200">
                          {documents.length === 0
                            ? 'تم تصفير كافة المستندات والفواتير بنجاح'
                            : 'لا توجد فواتير مطابقة لخيارات البحث'}
                        </div>
                        <p className="text-xs text-gray-400 max-w-sm">
                          {documents.length === 0
                            ? 'سجل الفواتير خالٍ تماماً وجاهز لتسجيل المبيعات من الفاتورة الأولى رقم 1. اضغط «إضافة» بالأعلى أو توجّه لشاشة الكاشير.'
                            : 'جرّب تعديل الفلاتر أو مسح شروط البحث لإظهار النتائج.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const isSelected = selectedDoc && selectedDoc.id === doc.id;
                    return (
                      <tr
                        key={doc.id}
                        onClick={() => setSelectedDocId(doc.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#263140] text-white font-semibold'
                            : 'hover:bg-[#1c1f24] text-gray-300'
                        }`}
                      >
                        <td className="p-2 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => setSelectedDocId(doc.id)}
                            className="rounded"
                          />
                        </td>
                        <td className="p-2 font-mono text-[11px] text-gray-400">{doc.id}</td>
                        <td className="p-2 text-center font-mono">{doc.itemCount || doc.items.length}</td>
                        <td className="p-2 font-mono font-bold text-cyan-400">{doc.number}</td>
                        <td className="p-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              doc.type === 'SALE'
                                ? 'bg-emerald-950 text-emerald-300'
                                : doc.type === 'RETURN'
                                ? 'bg-rose-950 text-rose-300'
                                : 'bg-blue-950 text-blue-300'
                            }`}
                          >
                            {doc.type === 'SALE'
                              ? 'مبيعات'
                              : doc.type === 'RETURN'
                              ? 'مرتجع'
                              : doc.type === 'PURCHASE'
                              ? 'مشتريات'
                              : 'عرض سعر'}
                          </span>
                        </td>
                        <td className="p-2 text-center">
                          {doc.paymentStatus === 'PAID' ? (
                            <span className="text-emerald-400 font-bold">✓ نعم</span>
                          ) : (
                            <span className="text-amber-400 font-bold">آجل (لا)</span>
                          )}
                        </td>
                        <td className="p-2 font-medium">{doc.customerName}</td>
                        <td className="p-2 font-mono text-[11px] text-gray-400">{doc.date}</td>
                        <td className="p-2 font-mono text-[11px]">{doc.posName || 'POS-01'}</td>
                        <td className="p-2 text-left font-mono font-bold text-emerald-400">
                          {formatNumber(doc.grandTotal)} {currencySymbol}
                        </td>
                        <td className="p-2 text-center font-medium">
                          {doc.paymentMethod === 'CASH'
                            ? 'نقداً'
                            : doc.paymentMethod === 'CARD'
                            ? 'بطاقة'
                            : doc.paymentMethod === 'CREDIT'
                            ? 'آجل'
                            : 'تحويل'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Lower Grid: الأصناف (Items in Selected Document) */}
        <div className="h-48 md:h-56 flex flex-col bg-[#141619]">
          <div className="bg-[#181a1f] px-3 py-1.5 border-b border-[#2e333d] flex items-center justify-between text-xs font-bold text-gray-300">
            <span>
              الأصناف في الفاتورة المحددة ({selectedDoc?.items.length || 0}) — رقم الفاتورة:{' '}
              <span className="text-cyan-400 font-mono">{selectedDoc?.number || '—'}</span>
            </span>
            {selectedDoc && (
              <span className="text-emerald-400 font-mono text-xs">
                إجمالي الأصناف: {formatNumber(selectedDoc.grandTotal)} {currencySymbol}
              </span>
            )}
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-right text-xs border-collapse">
              <thead className="bg-[#1e2229] text-gray-300 sticky top-0 border-b border-[#313742] z-10 font-bold">
                <tr>
                  <th className="p-2">ID</th>
                  <th className="p-2">كود الصنف</th>
                  <th className="p-2">أسم الصنف</th>
                  <th className="p-2 text-center">وحدة القياس</th>
                  <th className="p-2 text-center">الكمية</th>
                  <th className="p-2 text-left">السعر قبل الضريبة</th>
                  <th className="p-2 text-left">ضريبة</th>
                  <th className="p-2 text-left">السعر</th>
                  <th className="p-2 text-left">الإجمالي قبل الخصم</th>
                  <th className="p-2 text-left">خصم</th>
                  <th className="p-2 text-left">الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#262a33]">
                {!selectedDoc || selectedDoc.items.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-6 text-center text-gray-500">
                      حدد فاتورة من الجدول العلوي لعرض أصنافها
                    </td>
                  </tr>
                ) : (
                  selectedDoc.items.map((it, idx) => (
                    <tr key={idx} className="hover:bg-[#1a1d22] text-gray-300">
                      <td className="p-2 font-mono text-[11px] text-gray-500">{it.id || idx + 1}</td>
                      <td className="p-2 font-mono text-cyan-400">{it.code}</td>
                      <td className="p-2 font-semibold text-white">{it.name}</td>
                      <td className="p-2 text-center text-gray-400">{it.unit || 'حبة'}</td>
                      <td className="p-2 text-center font-mono font-bold text-amber-300">
                        {it.quantity}
                      </td>
                      <td className="p-2 text-left font-mono">
                        {formatNumber(it.priceBeforeTax)}
                      </td>
                      <td className="p-2 text-left font-mono text-cyan-300">
                        {formatNumber(it.taxAmount)}
                      </td>
                      <td className="p-2 text-left font-mono">
                        {formatNumber(it.unitPrice)}
                      </td>
                      <td className="p-2 text-left font-mono">
                        {formatNumber(it.totalBeforeDiscount || it.unitPrice * it.quantity)}
                      </td>
                      <td className="p-2 text-left font-mono text-rose-400">
                        {it.discount > 0 ? formatNumber(it.discount) : '0.00'}
                      </td>
                      <td className="p-2 text-left font-mono font-extrabold text-emerald-400">
                        {formatNumber(it.total)} {currencySymbol}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
