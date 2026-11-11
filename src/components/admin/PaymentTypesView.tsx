/**
 * Aronium Management - Payment Types View (أنواع الدفع • إدارة)
 */
import React, { useState } from 'react';
import { CreditCard, Banknote, Smartphone, Plus, Check, Trash2, Edit2 } from 'lucide-react';

interface PaymentType {
  id: string;
  name: string;
  code: string;
  isQuickCash: boolean;
  marksAsPaid: boolean;
  opensDrawer: boolean;
  isActive: boolean;
}

const DEFAULT_PAYMENTS: PaymentType[] = [
  { id: 'pay-1', name: 'نقداً (Cash)', code: 'CASH', isQuickCash: true, marksAsPaid: true, opensDrawer: true, isActive: true },
  { id: 'pay-2', name: 'مدى / بطاقة بنكية (Mada / Card)', code: 'CARD', isQuickCash: false, marksAsPaid: true, opensDrawer: false, isActive: true },
  { id: 'pay-3', name: 'آجل / حساب عميل (Credit)', code: 'CREDIT', isQuickCash: false, marksAsPaid: false, opensDrawer: false, isActive: true },
  { id: 'pay-4', name: 'تحويل بنكي / حوالة (Bank Transfer)', code: 'TRANSFER', isQuickCash: false, marksAsPaid: true, opensDrawer: false, isActive: true },
];

export const PaymentTypesView: React.FC = () => {
  const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>(DEFAULT_PAYMENTS);

  const handleToggle = (id: string) => {
    setPaymentTypes(paymentTypes.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Bar */}
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-3 text-xs">
        <h2 className="font-bold text-white flex items-center gap-2">
          <CreditCard size={16} className="text-cyan-400" />
          <span>أنواع وطرق الدفع المعتمدة في نقاط البيع (متجر هجاير)</span>
        </h2>
        <span className="text-gray-400 text-[11px]">مضبوطة ومطابقة لأنظمة المدفوعات السعودية (مدى، نقد، آجل)</span>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto bg-[#17191d] p-4">
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg overflow-hidden">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#242933] text-gray-300 font-bold border-b border-[#313742]">
              <tr>
                <th className="py-2.5 px-3">طريقة الدفع</th>
                <th className="py-2.5 px-3">الرمز</th>
                <th className="py-2.5 px-3 text-center">فتح درج النقد</th>
                <th className="py-2.5 px-3 text-center">اعتبار الفاتورة مدفوعة</th>
                <th className="py-2.5 px-3 text-center">الحالة في الكاشير</th>
                <th className="py-2.5 px-3 text-center">التبديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282d38]">
              {paymentTypes.map((p) => (
                <tr key={p.id} className="hover:bg-[#222730] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    {p.code === 'CASH' ? <Banknote size={15} className="text-emerald-400" /> : <CreditCard size={15} className="text-cyan-400" />}
                    <span>{p.name}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-cyan-300">{p.code}</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">{p.opensDrawer ? 'نعم ✓' : 'لا'}</td>
                  <td className="py-2.5 px-3 text-center text-gray-300">{p.marksAsPaid ? 'مدفوعة بالكامل' : 'ذمم مدينة (آجل)'}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${p.isActive ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800' : 'bg-gray-800 text-gray-400'}`}>
                      {p.isActive ? 'مفعلة' : 'معطلة'}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => handleToggle(p.id)}
                      className="px-2 py-0.5 rounded bg-[#2c333f] hover:bg-[#384252] text-xs text-cyan-300 font-bold cursor-pointer"
                    >
                      {p.isActive ? 'تعطيل' : 'تفعيل'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
