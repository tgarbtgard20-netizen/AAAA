/**
 * Executive Management Dashboard View matching Screenshot (٢٠٢٦١٠٢٧_١٩٥٣٣٨.jpg) EXACTLY
 */
import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  RotateCcw,
  Maximize2,
  TrendingUp,
  Package,
  Users,
  Clock,
  PieChart as PieIcon,
} from 'lucide-react';
import { Document, Product, Customer, CashMovement, CompanySettings } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface DashboardViewProps {
  documents: Document[];
  products: Product[];
  customers: Customer[];
  movements: CashMovement[];
  settings: CompanySettings;
  onNavigateToPOS: () => void;
  onNavigateToDocuments: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  documents,
  products,
  customers,
  movements,
  settings,
  onNavigateToPOS,
  onNavigateToDocuments,
}) => {
  const [topProductLimit, setTopProductLimit] = useState(5);
  const [hourlyMetric, setHourlyMetric] = useState<'كمية' | 'مبلغ'>('كمية');

  // Real dynamic calculations from documents
  const salesDocs = documents.filter((d) => d.type === 'SALE');
  const returnDocs = documents.filter((d) => d.type === 'RETURN');

  const totalSalesRevenue =
    salesDocs.reduce((acc, d) => acc + d.grandTotal, 0) -
    returnDocs.reduce((acc, d) => acc + d.grandTotal, 0);

  const totalPiecesSold = documents.reduce((acc, d) => {
    const docQty = d.items.reduce((sum, it) => sum + (d.type === 'RETURN' ? -it.quantity : it.quantity), 0);
    return acc + docQty;
  }, 0);

  // Group by month
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthColors = [
    'bg-emerald-500', 'bg-teal-500', 'bg-lime-400', 'bg-green-500',
    'bg-emerald-400', 'bg-cyan-500', 'bg-blue-400', 'bg-purple-400',
    'bg-pink-400', 'bg-sky-400', 'bg-indigo-400', 'bg-violet-400'
  ];

  const monthlyTotals: { [key: number]: number } = {};
  for (let m = 0; m < 12; m++) monthlyTotals[m] = 0;

  documents.forEach((d) => {
    try {
      const dateObj = new Date(d.date.replace(' ', 'T'));
      const m = isNaN(dateObj.getMonth()) ? 9 : dateObj.getMonth();
      const factor = d.type === 'RETURN' ? -1 : 1;
      monthlyTotals[m] = (monthlyTotals[m] || 0) + d.grandTotal * factor;
    } catch {
      // fallback
    }
  });

  const monthlyData = monthNames.map((month, idx) => ({
    month,
    val: Math.max(0, monthlyTotals[idx] || 0),
    color: monthColors[idx],
  }));

  const maxVal = Math.max(1, ...monthlyData.map((d) => d.val));

  // Find best month
  let bestMonth = '—';
  let bestMonthVal = 0;
  monthlyData.forEach((d) => {
    if (d.val > bestMonthVal) {
      bestMonthVal = d.val;
      bestMonth = d.month;
    }
  });

  // Top Products dynamically computed from documents
  const productSalesMap = new Map<string, { name: string; total: number; qty: number }>();
  documents.forEach((d) => {
    const factor = d.type === 'RETURN' ? -1 : 1;
    d.items.forEach((it) => {
      const existing = productSalesMap.get(it.name) || { name: it.name, total: 0, qty: 0 };
      existing.total += it.total * factor;
      existing.qty += it.quantity * factor;
      productSalesMap.set(it.name, existing);
    });
  });

  const topProductsList = Array.from(productSalesMap.values())
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, topProductLimit);

  // Top Customers dynamically computed
  const customerSalesMap = new Map<string, number>();
  documents.forEach((d) => {
    const factor = d.type === 'RETURN' ? -1 : 1;
    const name = d.customerName || 'عميل نقدي عام';
    customerSalesMap.set(name, (customerSalesMap.get(name) || 0) + d.grandTotal * factor);
  });

  const maxCustAmount = Math.max(1, ...Array.from(customerSalesMap.values()));
  const topCustomers = Array.from(customerSalesMap.entries())
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount,
      percent: Math.min(100, Math.round((amount / maxCustAmount) * 100)),
    }));

  // Categories breakdown
  const catMap = new Map<string, number>();
  let catTotalVal = 0;
  documents.forEach((d) => {
    const factor = d.type === 'RETURN' ? -1 : 1;
    d.items.forEach((it) => {
      const p = products.find((prod) => prod.id === it.productId);
      const cat = p?.category || 'عام';
      const itemVal = it.total * factor;
      catMap.set(cat, (catMap.get(cat) || 0) + itemVal);
      catTotalVal += itemVal;
    });
  });

  const categoryBreakdownColors = ['bg-cyan-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-purple-500'];
  const categoryBreakdown = Array.from(catMap.entries())
    .filter(([_, val]) => val > 0)
    .map(([name, val], idx) => ({
      name,
      share: catTotalVal > 0 ? Math.round((val / catTotalVal) * 100) : 0,
      color: categoryBreakdownColors[idx % categoryBreakdownColors.length],
    }));

  const todayDisplayStr = new Date().toLocaleDateString('ar-SA');

  return (
    <div
      className="flex-1 p-3 overflow-y-auto bg-[#17191d] text-gray-200 space-y-3 font-['Cairo',sans-serif] select-none"
      dir="rtl"
    >
      {/* Upper Panel: Monthly Sales */}
      <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg p-3">
        <div className="flex flex-col md:flex-row items-stretch gap-4">
          {/* Left Chart Area */}
          <div className="flex-1 flex flex-col justify-between">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide">
                  المبيعات الشهرية - {new Date().getFullYear()}
                </h2>
                <p className="text-[11px] text-gray-400">بيانات المبيعات مجمعة حسب الشهر (محدثة حياً)</p>
              </div>
              {documents.length === 0 && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  تم التصفير - رصيد 0.00
                </span>
              )}
            </div>

            {/* Monthly Bar Chart */}
            <div className="h-36 flex items-end justify-between gap-1.5 pt-4 px-2">
              {monthlyData.map((d) => {
                const heightPercent = maxVal > 1 && d.val > 0 ? Math.round((d.val / maxVal) * 100) : 0;
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <span className="text-[9px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.round(d.val)}
                    </span>
                    <div
                      className={`w-full ${d.val > 0 ? d.color : 'bg-gray-800'} rounded-t transition-all hover:brightness-125`}
                      style={{ height: `${d.val > 0 ? Math.max(12, heightPercent) : 4}%` }}
                    />
                    <span className="text-[10px] text-gray-400 font-mono mt-1">{d.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="text-center text-[10px] text-gray-500 font-mono -mt-1">شهر</div>
          </div>

          {/* Right KPI Card */}
          <div className="w-full md:w-64 bg-[#181a1f] border border-[#2c3340] rounded-lg p-4 flex flex-col justify-between text-left" dir="ltr">
            <div>
              <span className="text-xs text-gray-400 block font-sans">إجمالي المبيعات الفعلية</span>
              <div className="font-mono font-black text-2xl sm:text-3xl text-emerald-400 tracking-wider mt-0.5">
                {formatNumber(totalSalesRevenue)} <span className="text-sm font-sans text-gray-300">{settings.currency}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#292f3a] text-right" dir="rtl">
              <span className="text-[11px] text-gray-400 block">الشهر الأفضل أداء:</span>
              <div className="text-sm font-black text-white font-mono tracking-wider mt-0.5">
                {bestMonth}
              </div>
              <div className="text-sm font-bold text-emerald-400 font-mono">
                {formatNumber(bestMonthVal)} <span className="text-[10px] text-emerald-200">{settings.currency}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Period Header Bar */}
      <div className="bg-[#222730] border border-[#2f3543] rounded-md px-3 py-1.5 flex items-center justify-between text-xs text-gray-300">
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-cyan-400" />
          <span className="font-bold">لوحة القيادة ومؤشرات الأداء المباشرة ({todayDisplayStr})</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToPOS}
            className="text-[11px] text-emerald-400 hover:underline font-bold cursor-pointer"
          >
            فتح الكاشير والبدء في البيع ➔
          </button>
        </div>
      </div>

      {/* Middle Grid of 3 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: أهم المنتجات (Top Products) */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#2d3340] pb-2 mb-2">
            <h3 className="font-bold text-xs text-white">أهم المنتجات الأكثر مبيعاً</h3>
            <div className="flex items-center gap-1 text-[11px] bg-[#17191d] border border-[#333b49] rounded px-2 py-0.5 text-gray-300">
              <span>{topProductLimit}</span>
              <ChevronDown size={12} />
            </div>
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex justify-between text-[11px] font-bold text-gray-400 border-b border-[#2a2f3a] pb-1">
              <span>المنتج</span>
              <span>مجموع المبيعات</span>
            </div>
            {topProductsList.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500">
                لا توجد مبيعات مسجلة حتى الآن (0.00)
              </div>
            ) : (
              topProductsList.map((p, i) => (
                <div key={i} className="flex justify-between items-center text-xs py-1 border-b border-[#252933]">
                  <span className="text-gray-200 truncate max-w-[180px]">{p.name}</span>
                  <span className="font-mono font-bold text-cyan-300">{formatNumber(p.total)} {settings.currency}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Card 2: المبيعات بالساعة */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-[#2d3340] pb-2 mb-2">
            <h3 className="font-bold text-xs text-white">المبيعات وحركات اليوم</h3>
            <div className="flex items-center gap-1 text-[11px] bg-[#17191d] border border-[#333b49] rounded px-2 py-0.5 text-gray-300">
              <span>{documents.length} فاتورة</span>
            </div>
          </div>

          <div className="h-32 flex items-center justify-center text-center p-2">
            {documents.length === 0 ? (
              <div className="space-y-1">
                <div className="text-2xl font-mono font-bold text-gray-400">0.00</div>
                <div className="text-[11px] text-gray-500">لا توجد عمليات مبيعات اليوم</div>
              </div>
            ) : (
              <div className="w-full flex items-end justify-center gap-6 h-full pt-4">
                <div className="flex flex-col items-center gap-1 h-full justify-end w-16">
                  <span className="text-xs font-mono font-bold text-cyan-400">{documents.length}</span>
                  <div className="w-full bg-cyan-500 rounded-t h-[75%]" />
                  <span className="text-[10px] text-gray-400 font-mono">اليوم</span>
                </div>
              </div>
            )}
          </div>
          <div className="text-center text-[10px] text-gray-500 font-mono">حركات البيع</div>
        </div>

        {/* Card 3: إجمالي المبيعات (كمية) */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg p-3 flex flex-col justify-between text-center">
          <div className="border-b border-[#2d3340] pb-2 text-right">
            <h3 className="font-bold text-xs text-white">إجمالي القطع المباعة</h3>
          </div>

          <div className="py-6 flex flex-col items-center justify-center">
            <span className="font-mono font-black text-5xl sm:text-6xl text-white tracking-wider">
              {Math.max(0, totalPiecesSold)}
            </span>
            <span className="text-xs text-gray-400 mt-2 font-bold">
              {totalPiecesSold === 0 ? 'لا توجد قطع مباعة (النظام مصفر)' : 'قطعة مباعة خلال الدورة'}
            </span>
          </div>

          <div className="pt-2 border-t border-[#2a2f3a] text-right text-[11px] text-emerald-400 flex justify-between">
            <span>حالة الدورة: {documents.length === 0 ? 'جاهزة وجديدة' : 'نشطة'}</span>
            <span className="font-mono">{documents.length} فواتير</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid of 2 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Card 4: أهم مجموعات المنتجات */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg p-3">
          <h3 className="font-bold text-xs text-white">أهم مجموعات المنتجات</h3>
          <p className="text-[10px] text-gray-400 mb-3">توزيع المبيعات حسب المجموعات والتصنيفات</p>

          {categoryBreakdown.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              لا توجد مبيعات مصنفة حتى الآن
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-full border-8 border-cyan-500 border-t-emerald-500 border-l-amber-500 flex items-center justify-center text-xs font-bold text-white">
                100%
              </div>

              <div className="flex-1 space-y-1.5 text-xs">
                {categoryBreakdown.map((cat, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`} />
                      <span className="text-gray-300">{cat.name}</span>
                    </div>
                    <span className="font-mono text-gray-400">{cat.share}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Card 5: كبار العملاء */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg p-3">
          <h3 className="font-bold text-xs text-white">كبار العملاء</h3>
          <p className="text-[10px] text-gray-400 mb-3">العملاء الأكثر شراءً في الفترة الحالية</p>

          {topCustomers.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-500">
              لا توجد مبيعات مرتبطة بالعملاء حتى الآن
            </div>
          ) : (
            <div className="space-y-2 text-xs">
              {topCustomers.map((c, i) => (
                <div key={i} className="space-y-0.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-gray-200 font-bold">{c.name}</span>
                    <span className="font-mono text-cyan-300">{formatNumber(c.amount)} {settings.currency}</span>
                  </div>
                  <div className="w-full h-2 bg-[#17191d] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-cyan-600 rounded-full"
                      style={{ width: `${c.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
