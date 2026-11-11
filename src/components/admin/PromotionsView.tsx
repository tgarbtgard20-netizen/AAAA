/**
 * Aronium Management - Promotions & Actions View (العروض والاجراء • إدارة)
 */
import React, { useState } from 'react';
import { Heart, Plus, Tag, Calendar, Percent, Check, Trash2, Edit2 } from 'lucide-react';
import { Product } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface Promotion {
  id: string;
  name: string;
  type: 'DISCOUNT_PERCENT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y';
  value: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  targetCategory: string;
}

const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: 'promo-1',
    name: 'خصم موسم الأعياد على الساعات الفاخرة',
    type: 'DISCOUNT_PERCENT',
    value: 20,
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    isActive: true,
    targetCategory: 'ساعات',
  },
  {
    id: 'promo-2',
    name: 'عرض عطور هجاير الخاصة اشتر 2 واحصل على خصم 15%',
    type: 'DISCOUNT_PERCENT',
    value: 15,
    startDate: '2026-10-15',
    endDate: '2026-10-31',
    isActive: true,
    targetCategory: 'عطور',
  },
  {
    id: 'promo-3',
    name: 'تخفيضات أطقم وسلاسل الذهب 18k',
    type: 'FIXED_AMOUNT',
    value: 10,
    startDate: '2026-10-20',
    endDate: '2026-11-05',
    isActive: true,
    targetCategory: 'اكسسوارات',
  },
];

export const PromotionsView: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>(DEFAULT_PROMOTIONS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [promoName, setPromoName] = useState('');
  const [promoVal, setPromoVal] = useState('10');
  const [promoCat, setPromoCat] = useState('ساعات');

  const handleAddPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoName) return;
    const newP: Promotion = {
      id: 'promo-' + Date.now(),
      name: promoName,
      type: 'DISCOUNT_PERCENT',
      value: parseFloat(promoVal) || 10,
      startDate: '2026-10-27',
      endDate: '2026-12-31',
      isActive: true,
      targetCategory: promoCat,
    };
    setPromotions([newP, ...promotions]);
    setIsModalOpen(false);
    setPromoName('');
  };

  const handleToggle = (id: string) => {
    setPromotions(
      promotions.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
  };

  const handleDelete = (id: string) => {
    setPromotions(promotions.filter((p) => p.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* Action Toolbar */}
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>إضافة عرض ترويجي جديد</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400">
          العروض والخصومات الترويجية الخاصة بمتجر هجاير
        </div>
      </div>

      {/* Promotions Table */}
      <div className="flex-1 overflow-y-auto bg-[#17191d] p-4">
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg overflow-hidden">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#242933] text-gray-300 font-bold border-b border-[#313742]">
              <tr>
                <th className="py-2.5 px-3">اسم العرض الترويجي</th>
                <th className="py-2.5 px-3">نوع الخصم</th>
                <th className="py-2.5 px-3">القيمة</th>
                <th className="py-2.5 px-3">المجموعة المشمولة</th>
                <th className="py-2.5 px-3">تاريخ البدء</th>
                <th className="py-2.5 px-3">تاريخ الانتهاء</th>
                <th className="py-2.5 px-3 text-center">حالة العرض</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282d38]">
              {promotions.map((p) => (
                <tr key={p.id} className="hover:bg-[#222730] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    <Heart size={14} className="text-rose-400" />
                    <span>{p.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-gray-300">
                    {p.type === 'DISCOUNT_PERCENT' ? 'نسبة مئوية (%)' : 'مبلغ ثابت'}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-sm">
                    {p.value}%
                  </td>
                  <td className="py-2.5 px-3 text-cyan-300">{p.targetCategory}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-400">{p.startDate}</td>
                  <td className="py-2.5 px-3 font-mono text-gray-400">{p.endDate}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleToggle(p.id)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer ${
                        p.isActive
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                          : 'bg-gray-800 text-gray-400 border border-gray-700'
                      }`}
                    >
                      {p.isActive ? 'نشط الآن' : 'معطل'}
                    </button>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="text-rose-400 hover:text-rose-300 p-1 cursor-pointer"
                      title="حذف العرض"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#20252e] border border-[#384150] rounded-xl shadow-2xl w-full max-w-md p-4 text-xs space-y-3">
            <h3 className="font-bold text-sm text-white">إضافة عرض ترويجي جديد</h3>
            <form onSubmit={handleAddPromo} className="space-y-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">اسم العرض:</label>
                <input
                  type="text"
                  required
                  value={promoName}
                  onChange={(e) => setPromoName(e.target.value)}
                  placeholder="مثال: خصم الأسبوع على العطور"
                  className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">نسبة الخصم (%):</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={promoVal}
                  onChange={(e) => setPromoVal(e.target.value)}
                  className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">المجموعة المشمولة:</label>
                <select
                  value={promoCat}
                  onChange={(e) => setPromoCat(e.target.value)}
                  className="w-full h-9 bg-[#15171b] border border-[#384150] rounded px-3 text-white"
                >
                  <option value="ساعات">ساعات</option>
                  <option value="اكسسوارات">اكسسوارات</option>
                  <option value="شنط">شنط</option>
                  <option value="عطور">عطور</option>
                  <option value="مكياج">مكياج</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2e343f]">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded cursor-pointer"
                >
                  حفظ وتفعيل
                </button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#2a303a] text-gray-300 rounded cursor-pointer"
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
