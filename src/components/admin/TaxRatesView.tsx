/**
 * Aronium Management - Tax Rates View (معدلات الضرائب • إدارة)
 */
import React, { useState } from 'react';
import { Percent, ShieldCheck, Check } from 'lucide-react';
import { CompanySettings } from '../../types';

interface TaxRatesViewProps {
  settings: CompanySettings;
  onSaveSettings: (s: CompanySettings) => void;
}

export const TaxRatesView: React.FC<TaxRatesViewProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [taxRate, setTaxRate] = useState<number>(settings.defaultTaxRate || 15);
  const [taxNumber, setTaxNumber] = useState<string>(settings.taxNumber || '310458921600003');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      ...settings,
      defaultTaxRate: taxRate,
      taxNumber: taxNumber,
    });
    alert('تم حفظ إعدادات الضريبة بنجاح!');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-3 text-xs">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Percent size={16} className="text-cyan-400" />
          <span>معدلات الضرائب والفوترة الإلكترونية (هيئة الزكاة والضريبة والجمارك ZATCA)</span>
        </h2>
        <span className="text-gray-400 text-[11px]">النسبة القياسية المطبقة في المملكة العربية السعودية: 15%</span>
      </div>

      <div className="p-6 max-w-2xl">
        <form onSubmit={handleSave} className="bg-[#1e2229] border border-[#2e3442] rounded-xl p-5 space-y-4 text-xs">
          <div className="flex items-center gap-2 text-cyan-400 font-bold border-b border-[#2e3442] pb-2 text-sm">
            <ShieldCheck size={18} />
            <span>الامتثال للضريبة المضافة في متجر هجاير</span>
          </div>

          <div>
            <label className="block text-gray-300 font-bold mb-1">الرقم الضريبي للمنشأة (VAT Number):</label>
            <input
              type="text"
              required
              value={taxNumber}
              onChange={(e) => setTaxNumber(e.target.value)}
              className="w-full h-10 bg-[#15171b] border border-[#384150] rounded-lg px-3 text-white font-mono text-sm tracking-wider"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">رقم ضريبي قياسي يبدأ وينتهي بـ 3 ومكون من 15 خانة</span>
          </div>

          <div>
            <label className="block text-gray-300 font-bold mb-1">نسبة ضريبة القيمة المضافة الافتراضية (%):</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="100"
                required
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-28 h-10 bg-[#15171b] border border-[#384150] rounded-lg px-3 text-white font-mono text-center text-lg font-bold"
              />
              <span className="text-sm font-bold text-gray-300">% (القيمة المضافة 15%)</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#2e3442]">
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg transition-all cursor-pointer shadow-md"
            >
              حفظ التعديلات وتطبيقها على المبيعات
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
