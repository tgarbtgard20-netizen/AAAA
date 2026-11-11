/**
 * Aronium Management - Countries & Regions View (بلدان • إدارة)
 * Full interface for managing countries, currencies, and tax jurisdictions
 */
import React, { useState } from 'react';
import { Globe, Plus, Check, Edit2, Trash2, Search, MapPin } from 'lucide-react';

interface CountryItem {
  id: string;
  name: string;
  code2: string;
  code3: string;
  dialCode: string;
  currency: string;
  currencySymbol: string;
  isDefault: boolean;
}

const DEFAULT_COUNTRIES: CountryItem[] = [
  { id: 'sa', name: 'المملكة العربية السعودية', code2: 'SA', code3: 'SAU', dialCode: '+966', currency: 'SAR', currencySymbol: 'ر.س', isDefault: true },
  { id: 'ae', name: 'الإمارات العربية المتحدة', code2: 'AE', code3: 'ARE', dialCode: '+971', currency: 'AED', currencySymbol: 'د.إ', isDefault: false },
  { id: 'kw', name: 'الكويت', code2: 'KW', code3: 'KWT', dialCode: '+965', currency: 'KWD', currencySymbol: 'د.ك', isDefault: false },
  { id: 'bh', name: 'البحرين', code2: 'BH', code3: 'BHR', dialCode: '+973', currency: 'BHD', currencySymbol: 'د.ب', isDefault: false },
  { id: 'om', name: 'سلطنة عمان', code2: 'OM', code3: 'OMN', dialCode: '+968', currency: 'OMR', currencySymbol: 'ر.ع', isDefault: false },
  { id: 'qa', name: 'قطر', code2: 'QA', code3: 'QAT', dialCode: '+974', currency: 'QAR', currencySymbol: 'ر.ق', isDefault: false },
  { id: 'eg', name: 'جمهورية مصر العربية', code2: 'EG', code3: 'EGY', dialCode: '+20', currency: 'EGP', currencySymbol: 'ج.م', isDefault: false },
  { id: 'jo', name: 'المملكة الأردنية الهاشمية', code2: 'JO', code3: 'JOR', dialCode: '+962', currency: 'JOD', currencySymbol: 'د.أ', isDefault: false },
];

export const CountriesView: React.FC = () => {
  const [countries, setCountries] = useState<CountryItem[]>(DEFAULT_COUNTRIES);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<CountryItem | null>(null);

  const [formName, setFormName] = useState('');
  const [formCode2, setFormCode2] = useState('');
  const [formCode3, setFormCode3] = useState('');
  const [formDial, setFormDial] = useState('');
  const [formCurrency, setFormCurrency] = useState('');
  const [formSymbol, setFormSymbol] = useState('');

  const filtered = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code2.toLowerCase().includes(search.toLowerCase()) ||
      c.code3.toLowerCase().includes(search.toLowerCase()) ||
      c.currency.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingCountry(null);
    setFormName('');
    setFormCode2('');
    setFormCode3('');
    setFormDial('+');
    setFormCurrency('');
    setFormSymbol('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: CountryItem) => {
    setEditingCountry(c);
    setFormName(c.name);
    setFormCode2(c.code2);
    setFormCode3(c.code3);
    setFormDial(c.dialCode);
    setFormCurrency(c.currency);
    setFormSymbol(c.currencySymbol);
    setIsModalOpen(true);
  };

  const handleSetDefault = (id: string) => {
    setCountries(countries.map((c) => ({ ...c, isDefault: c.id === id })));
  };

  const handleDelete = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الدولة؟')) {
      setCountries(countries.filter((c) => c.id !== id));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;

    if (editingCountry) {
      setCountries(
        countries.map((c) =>
          c.id === editingCountry.id
            ? {
                ...c,
                name: formName,
                code2: formCode2.toUpperCase(),
                code3: formCode3.toUpperCase(),
                dialCode: formDial,
                currency: formCurrency.toUpperCase(),
                currencySymbol: formSymbol,
              }
            : c
        )
      );
    } else {
      const newCountry: CountryItem = {
        id: 'c_' + Date.now(),
        name: formName,
        code2: formCode2.toUpperCase(),
        code3: formCode3.toUpperCase(),
        dialCode: formDial,
        currency: formCurrency.toUpperCase(),
        currencySymbol: formSymbol,
        isDefault: countries.length === 0,
      };
      setCountries([...countries, newCountry]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]" dir="rtl">
      {/* Top Toolbar */}
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors cursor-pointer shadow-sm"
          >
            <Plus size={15} />
            <span>إضافة دولة جديدة</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="بحث في البلدان والرموز..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-56 h-8 bg-[#16181b] border border-[#313742] rounded px-7 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <Search size={14} className="absolute right-2 top-2 text-gray-400" />
          </div>
          <span className="text-[11px] text-gray-400">إجمالي البلدان: {countries.length}</span>
        </div>
      </div>

      {/* Main Content Table */}
      <div className="flex-1 overflow-y-auto bg-[#17191d] p-4">
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-lg overflow-hidden shadow">
          <table className="w-full text-right text-xs border-collapse">
            <thead className="bg-[#242933] text-gray-300 font-bold border-b border-[#313742]">
              <tr>
                <th className="py-2.5 px-3">الدولة</th>
                <th className="py-2.5 px-3 text-center">رمز ISO-2</th>
                <th className="py-2.5 px-3 text-center">رمز ISO-3</th>
                <th className="py-2.5 px-3 text-center">مفتاح الاتصال</th>
                <th className="py-2.5 px-3 text-center">العملة الرسمية</th>
                <th className="py-2.5 px-3 text-center">رمز العملة</th>
                <th className="py-2.5 px-3 text-center">الدولة الافتراضية</th>
                <th className="py-2.5 px-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#282d38]">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-[#222730] transition-colors">
                  <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                    <Globe size={15} className={c.isDefault ? 'text-emerald-400' : 'text-gray-400'} />
                    <span>{c.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono text-cyan-300">{c.code2}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-gray-400">{c.code3}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-emerald-300" dir="ltr">{c.dialCode}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-gray-200">{c.currency}</td>
                  <td className="py-2.5 px-3 text-center font-bold text-cyan-400">{c.currencySymbol}</td>
                  <td className="py-2.5 px-3 text-center">
                    {c.isDefault ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
                        <Check size={11} />
                        الافتراضية
                      </span>
                    ) : (
                      <button
                        onClick={() => handleSetDefault(c.id)}
                        className="text-[10px] text-gray-400 hover:text-cyan-400 underline cursor-pointer"
                      >
                        تعيين كافتراضية
                      </button>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenEdit(c)}
                        className="p-1 hover:bg-[#2e3442] rounded text-gray-300 hover:text-white transition-colors cursor-pointer"
                        title="تعديل الدولة"
                      >
                        <Edit2 size={14} />
                      </button>
                      {!c.isDefault && (
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1 hover:bg-rose-950/60 rounded text-rose-400 hover:text-rose-200 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit Country */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="w-full max-w-md bg-[#1e2229] border border-[#313742] rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="h-11 bg-[#252a33] border-b border-[#313742] px-4 flex items-center justify-between">
              <span className="font-bold text-white text-xs">
                {editingCountry ? 'تعديل بيانات الدولة' : 'إضافة دولة جديدة للنظام'}
              </span>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">اسم الدولة بالعربية:</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: المملكة العربية السعودية"
                  className="w-full h-8 bg-[#15171b] border border-[#384150] rounded px-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">رمز ISO (حرفين):</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formCode2}
                    onChange={(e) => setFormCode2(e.target.value)}
                    placeholder="SA"
                    className="w-full h-8 bg-[#15171b] border border-[#384150] rounded px-2.5 text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">رمز ISO (3 أحرف):</label>
                  <input
                    type="text"
                    maxLength={3}
                    value={formCode3}
                    onChange={(e) => setFormCode3(e.target.value)}
                    placeholder="SAU"
                    className="w-full h-8 bg-[#15171b] border border-[#384150] rounded px-2.5 text-white uppercase font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">مفتاح الاتصال:</label>
                  <input
                    type="text"
                    value={formDial}
                    onChange={(e) => setFormDial(e.target.value)}
                    placeholder="+966"
                    className="w-full h-8 bg-[#15171b] border border-[#384150] rounded px-2.5 text-white font-mono"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">اسم العملة:</label>
                  <input
                    type="text"
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    placeholder="SAR"
                    className="w-full h-8 bg-[#15171b] border border-[#384150] rounded px-2.5 text-white uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">رمز العملة:</label>
                  <input
                    type="text"
                    value={formSymbol}
                    onChange={(e) => setFormSymbol(e.target.value)}
                    placeholder="ر.س"
                    className="w-full h-8 bg-[#15171b] border border-[#384150] rounded px-2.5 text-white font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="h-12 bg-[#252a33] border-t border-[#313742] px-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs"
              >
                حفظ الدولة
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
