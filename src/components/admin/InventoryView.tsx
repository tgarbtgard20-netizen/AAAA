/**
 * Aronium Management - Inventory View (مخزون • إدارة)
 * Full matching interface for stock management, adjustments, valuation & stock alerts
 */
import React, { useState } from 'react';
import {
  Archive,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Printer,
  FileText,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  PackageCheck,
  PackageX,
  SlidersHorizontal,
  Check,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import { Product, CompanySettings } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface InventoryViewProps {
  products: Product[];
  categories: string[];
  onUpdateProductStock: (productId: string, newStock: number) => void;
  currencySymbol: string;
  onClearAllProducts?: () => void;
  onAddNewProduct?: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  products,
  categories,
  onUpdateProductStock,
  currencySymbol,
  onClearAllProducts,
  onAddNewProduct,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState<'ALL' | 'AVAILABLE' | 'LOW' | 'OUT'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [newStockVal, setNewStockVal] = useState<number>(0);
  const [adjustmentReason, setAdjustmentReason] = useState<string>('جرد فعلي للمحل');

  // Filter products
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    const min = p.minStock ?? 5;
    if (stockStatusFilter === 'AVAILABLE' && p.stock <= min) return false;
    if (stockStatusFilter === 'LOW' && (p.stock <= 0 || p.stock > min)) return false;
    if (stockStatusFilter === 'OUT' && p.stock > 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.barcode.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Inventory Totals Calculations
  const totalItemCount = products.length;
  const totalStockQuantity = products.reduce((acc, p) => acc + p.stock, 0);
  const totalCostValuation = products.reduce((acc, p) => acc + p.costPrice * p.stock, 0);
  const totalRetailValuation = products.reduce((acc, p) => acc + p.salePrice * p.stock, 0);
  const lowStockCount = products.filter((p) => p.stock <= (p.minStock ?? 5) && p.stock > 0).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  const handleOpenAdjust = (p: Product) => {
    setEditingStockProduct(p);
    setNewStockVal(p.stock);
    setAdjustmentReason('تسوية جردية للمخزن');
  };

  const handleSaveStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStockProduct) {
      onUpdateProductStock(editingStockProduct.id, Number(newStockVal));
      setEditingStockProduct(null);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Top Action Toolbar matching Aronium management toolbar */}
      {/* Top Action Toolbar matching Aronium management toolbar */}
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
          {onAddNewProduct && (
            <button
              onClick={onAddNewProduct}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold transition-colors cursor-pointer shadow-sm shrink-0"
              title="إضافة صنف جديد للمخزون"
            >
              <Plus size={15} />
              <span>إضافة صنف جديد</span>
            </button>
          )}

          <button
            onClick={() => {
              const p = filteredProducts[0];
              if (p) handleOpenAdjust(p);
            }}
            disabled={filteredProducts.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2c333e] hover:bg-[#38414f] text-cyan-300 font-bold transition-colors cursor-pointer border border-[#3c4656] disabled:opacity-40 shrink-0"
          >
            <Plus size={15} />
            <span>تسوية جردية / تعديل رصيد</span>
          </button>

          <button
            onClick={() => {
              alert('تقرير جرد المخزون جاهز ومتطابق مع الفعلي.');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2c333e] hover:bg-[#38414f] text-gray-200 hover:text-white transition-colors cursor-pointer border border-[#3c4656] shrink-0"
          >
            <Archive size={15} />
            <span>محضر جرد المخزن</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2c333e] hover:bg-[#38414f] text-gray-200 hover:text-white transition-colors cursor-pointer border border-[#3c4656] shrink-0"
          >
            <Printer size={15} />
            <span>طباعة تقرير المخزون</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#2c333e] hover:bg-[#38414f] text-gray-200 hover:text-white transition-colors cursor-pointer border border-[#3c4656] shrink-0"
          >
            <FileText size={15} />
            <span>حفظ PDF</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-gray-400 font-mono text-[11px] shrink-0 mr-2">
          <span>عدد الأصناف بالمخزن:</span>
          <span className="font-bold text-white text-xs px-2 py-0.5 rounded bg-[#17191d] border border-[#313742]">
            {filteredProducts.length}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#1e2229] border-b border-[#313742] p-2.5 flex flex-wrap items-center gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث في المخزون بالاسم أو الكود أو الباركود..."
            className="w-full h-8 bg-[#15171b] border border-[#38414e] rounded px-3 pr-8 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <Search size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-[11px]">المجموعة:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 bg-[#15171b] border border-[#38414e] rounded px-2 text-white text-xs"
          >
            <option value="ALL">جميع المجموعات</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Stock status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400 text-[11px]">حالة الرصيد:</span>
          <select
            value={stockStatusFilter}
            onChange={(e) => setStockStatusFilter(e.target.value as any)}
            className="h-8 bg-[#15171b] border border-[#38414e] rounded px-2 text-white text-xs"
          >
            <option value="ALL">كل الحالات</option>
            <option value="AVAILABLE">متوفر بكمية كافية</option>
            <option value="LOW">منخفض (وصل للحد الأدنى)</option>
            <option value="OUT">نافد من المخزن (0)</option>
          </select>
        </div>

        {/* Reset filters */}
        {(selectedCategory !== 'ALL' || stockStatusFilter !== 'ALL' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedCategory('ALL');
              setStockStatusFilter('ALL');
              setSearchQuery('');
            }}
            className="text-[11px] text-cyan-400 hover:underline cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        )}
      </div>

      {/* Main Stock Table */}
      <div className="flex-1 overflow-y-auto bg-[#17191d]">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="bg-[#222730] text-gray-300 font-bold sticky top-0 border-b border-[#313742] z-10">
            <tr>
              <th className="py-2.5 px-3">كود الصنف</th>
              <th className="py-2.5 px-3">اسم الصنف</th>
              <th className="py-2.5 px-3">المجموعة</th>
              <th className="py-2.5 px-3">الباركود</th>
              <th className="py-2.5 px-3 text-center">الرصيد المتوفر</th>
              <th className="py-2.5 px-3 text-center">الحد الأدنى</th>
              <th className="py-2.5 px-3">سعر التكلفة</th>
              <th className="py-2.5 px-3">سعر البيع</th>
              <th className="py-2.5 px-3">قيمة التكلفة</th>
              <th className="py-2.5 px-3">قيمة البيع</th>
              <th className="py-2.5 px-3 text-center">حالة الصنف</th>
              <th className="py-2.5 px-3 text-center">إجراء</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252933]">
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={12} className="py-20 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-md mx-auto">
                    <div className="w-16 h-16 rounded-2xl bg-[#222731] border border-[#343e50] flex items-center justify-center text-cyan-400 shadow-inner">
                      <Archive size={32} />
                    </div>
                    <div className="text-base font-bold text-white">
                      المخزن فارغ تماماً حالياً (0 أصناف)
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed text-center">
                      تم تفريغ كافة المخزونات والأصناف بنجاح. يمكنك الآن البدء بإضافة أصنافك ومنتجاتك الجديدة بحرية.
                    </p>
                    {onAddNewProduct && (
                      <button
                        type="button"
                        onClick={onAddNewProduct}
                        className="mt-3 px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
                      >
                        <Plus size={16} />
                        <span>إضافة أول صنف جديد للمخزون الآن</span>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((p) => {
                const min = p.minStock ?? 5;
                const isOut = p.stock <= 0;
                const isLow = p.stock > 0 && p.stock <= min;
                const costTotal = p.costPrice * p.stock;
                const retailTotal = p.salePrice * p.stock;

                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#20242c] transition-colors group cursor-pointer"
                    onClick={() => handleOpenAdjust(p)}
                  >
                  <td className="py-2 px-3 font-mono text-gray-400">{p.code}</td>
                  <td className="py-2 px-3 font-bold text-white group-hover:text-cyan-300">
                    {p.name}
                  </td>
                  <td className="py-2 px-3 text-gray-300">
                    <span className="px-2 py-0.5 rounded bg-[#242b36] text-[11px] text-gray-300 border border-[#313a48]">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-gray-400">{p.barcode}</td>
                  <td className="py-2 px-3 font-mono font-bold text-center text-sm">
                    <span
                      className={`px-2.5 py-0.5 rounded-full ${
                        isOut
                          ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                          : isLow
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {p.stock} {p.unit || 'حبة'}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-mono text-center text-gray-400">{min}</td>
                  <td className="py-2 px-3 font-mono text-gray-300">
                    {formatNumber(p.costPrice)} {currencySymbol}
                  </td>
                  <td className="py-2 px-3 font-mono text-emerald-400 font-bold">
                    {formatNumber(p.salePrice)} {currencySymbol}
                  </td>
                  <td className="py-2 px-3 font-mono text-gray-300">
                    {formatNumber(costTotal)}
                  </td>
                  <td className="py-2 px-3 font-mono font-bold text-cyan-300">
                    {formatNumber(retailTotal)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {isOut ? (
                      <span className="text-[10px] text-rose-400 font-bold">نافد ❌</span>
                    ) : isLow ? (
                      <span className="text-[10px] text-amber-400 font-bold">منخفض ⚠️</span>
                    ) : (
                      <span className="text-[10px] text-emerald-400 font-bold">متوفر ✓</span>
                    )}
                  </td>
                  <td className="py-2 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleOpenAdjust(p)}
                      className="px-2 py-1 rounded bg-[#2b3340] hover:bg-[#384354] text-cyan-300 text-[11px] font-bold cursor-pointer transition-colors"
                      title="تسوية رصيد الصنف"
                    >
                      تعديل
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
      </div>

      {/* Summary Valuation Footer matching executive stats */}
      <footer className="h-14 bg-[#1e2229] border-t border-[#313742] px-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-gray-400 text-[11px] block">إجمالي قطع المخزن:</span>
            <span className="font-mono font-bold text-sm text-white">
              {formatNumber(totalStockQuantity)} قطعة
            </span>
          </div>

          <div className="border-r border-[#343b48] pr-6">
            <span className="text-gray-400 text-[11px] block">إجمالي قيمة التكلفة:</span>
            <span className="font-mono font-bold text-sm text-amber-300">
              {formatNumber(totalCostValuation)} {currencySymbol}
            </span>
          </div>

          <div className="border-r border-[#343b48] pr-6">
            <span className="text-gray-400 text-[11px] block">إجمالي القيمة البيعية للمخزون:</span>
            <span className="font-mono font-bold text-sm text-emerald-400">
              {formatNumber(totalRetailValuation)} {currencySymbol}
            </span>
          </div>

          <div className="border-r border-[#343b48] pr-6">
            <span className="text-gray-400 text-[11px] block">أصناف تحتاج إعادة طلب:</span>
            <span className="font-mono font-bold text-xs text-rose-400">
              {lowStockCount + outOfStockCount} صنف
            </span>
          </div>
        </div>

        <div className="text-[11px] text-gray-400">
          متجر هجاير • إدارة المخزون المباشرة
        </div>
      </footer>

      {/* Stock Adjustment Modal */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#20252e] border border-[#384150] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200">
            <div className="flex items-center justify-between px-4 py-3 bg-[#181a1f] border-b border-[#313742]">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Archive size={16} className="text-cyan-400" />
                <span>تسوية رصيد المخزن للصنف</span>
              </h3>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="text-gray-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStockAdjust} className="p-4 space-y-3.5 text-xs">
              <div className="bg-[#181a1f] p-3 rounded-lg border border-[#2e343f]">
                <div className="font-bold text-sm text-white">{editingStockProduct.name}</div>
                <div className="text-gray-400 mt-1 flex justify-between">
                  <span>الكود: {editingStockProduct.code}</span>
                  <span>الرصيد المسجل حالياً: <b className="text-cyan-400 font-mono">{editingStockProduct.stock}</b></span>
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">
                  الرصيد الفعلي الجديد بعد الجرد:
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={newStockVal}
                  onChange={(e) => setNewStockVal(parseInt(e.target.value) || 0)}
                  className="w-full h-10 bg-[#16181c] border border-[#3a4454] rounded-lg px-3 text-lg font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">سبب التسوية الجردية:</label>
                <select
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  className="w-full h-9 bg-[#16181c] border border-[#3a4454] rounded-lg px-3 text-white"
                >
                  <option value="جرد فعلي للمحل">جرد فعلي للمحل</option>
                  <option value="بضاعة تالفة أو منتهية">بضاعة تالفة أو منتهية</option>
                  <option value="فروقات إدخال مشتريات">فروقات إدخال مشتريات</option>
                  <option value="عينة ضيافة أو هدايا تسويقية">عينة ضيافة أو هدايا تسويقية</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2e343f]">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold rounded-lg transition-all cursor-pointer shadow"
                >
                  حفظ وتحديث الرصيد بالمخزن
                </button>
                <button
                  type="button"
                  onClick={() => setEditingStockProduct(null)}
                  className="px-4 py-2 bg-[#2a303a] hover:bg-[#343c49] text-gray-300 rounded-lg cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
