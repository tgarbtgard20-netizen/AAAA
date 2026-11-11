/**
 * Customers & Suppliers Management View (العملاء والموردين وكشوف الحسابات)
 */
import React, { useState } from 'react';
import { Users, Plus, Search, DollarSign, Phone, Check, CreditCard } from 'lucide-react';
import { Customer } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface CustomersViewProps {
  customers: Customer[];
  onSaveCustomer: (customer: Customer) => void;
  onSettleDebt: (customerId: string, amount: number) => void;
  currencySymbol: string;
}

export const CustomersView: React.FC<CustomersViewProps> = ({
  customers,
  onSaveCustomer,
  onSettleDebt,
  currencySymbol,
}) => {
  const [search, setSearch] = useState('');
  const [settleCustId, setSettleCustId] = useState<string | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // New customer form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [creditLimit, setCreditLimit] = useState('2000');

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  );

  const handleSettleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!settleCustId) return;
    const amt = parseFloat(settleAmount);
    if (!amt || amt <= 0) return;

    onSettleDebt(settleCustId, amt);
    setSettleCustId(null);
    setSettleAmount('');
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCust: Customer = {
      id: 'c_' + Date.now(),
      name: name.trim(),
      phone: phone.trim() || '0500000000',
      address: address.trim(),
      taxNumber: taxNumber.trim(),
      balance: 0,
      creditLimit: parseFloat(creditLimit) || 1000,
    };

    onSaveCustomer(newCust);
    setIsAddOpen(false);
    setName('');
    setPhone('');
    setAddress('');
    setTaxNumber('');
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#1b1e23] select-none text-gray-200 overflow-hidden font-['Cairo',sans-serif]">
      {/* Top Bar */}
      <div className="p-4 bg-[#20242b] border-b border-[#313742] flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={() => setIsAddOpen(true)}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
        >
          <Plus size={16} />
          <span>إضافة عميل جديد</span>
        </button>

        <div className="relative w-72">
          <input
            type="text"
            placeholder="ابحث عن عميل..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 bg-[#16181b] border border-[#383e4a] rounded px-3 pr-9 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto bg-[#141619]">
        <table className="w-full text-right text-xs border-collapse">
          <thead className="bg-[#1e2229] text-gray-300 sticky top-0 border-b border-[#313742] z-10 font-bold">
            <tr>
              <th className="p-3">اسم العميل / الشركة</th>
              <th className="p-3">رقم الهاتف</th>
              <th className="p-3">العنوان</th>
              <th className="p-3">الرقم الضريبي</th>
              <th className="p-3 text-left">سقف الائتمان</th>
              <th className="p-3 text-left">الرصيد الحالي المستحق</th>
              <th className="p-3 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#262a33]">
            {filtered.map((c) => (
              <tr key={c.id} className="hover:bg-[#1f232a] text-gray-300">
                <td className="p-3 font-bold text-white flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#2a3240] text-cyan-400 flex items-center justify-center font-bold text-xs">
                    {c.name.charAt(0)}
                  </div>
                  {c.name}
                </td>
                <td className="p-3 font-mono text-gray-400">{c.phone}</td>
                <td className="p-3 text-gray-400">{c.address || '—'}</td>
                <td className="p-3 font-mono text-gray-400">{c.taxNumber || '—'}</td>
                <td className="p-3 text-left font-mono">
                  {c.creditLimit > 0 ? `${formatNumber(c.creditLimit)} ${currencySymbol}` : 'غير محدود'}
                </td>
                <td className="p-3 text-left font-mono font-black">
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      c.balance > 0 ? 'bg-amber-950 text-amber-300' : 'bg-emerald-950 text-emerald-300'
                    }`}
                  >
                    {formatNumber(c.balance)} {currencySymbol}
                  </span>
                </td>
                <td className="p-3 text-center">
                  {c.balance > 0 && (
                    <button
                      onClick={() => {
                        setSettleCustId(c.id);
                        setSettleAmount(c.balance.toString());
                      }}
                      className="px-2.5 py-1 bg-cyan-700/80 hover:bg-cyan-600 text-white rounded text-[11px] font-bold cursor-pointer transition-colors"
                    >
                      سند قبض / سداد
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Settle Debt Modal */}
      {settleCustId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
          <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden text-gray-200">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d22] border-b border-[#31363f]">
              <h3 className="font-bold text-sm text-white">سند قبض نقدي (سداد مديونية)</h3>
              <button onClick={() => setSettleCustId(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  المبلغ المسدد نقداً ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={settleAmount}
                  onChange={(e) => setSettleAmount(e.target.value)}
                  className="w-full h-11 bg-[#17191d] border-2 border-cyan-500 rounded px-3 text-center font-mono font-bold text-xl text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSettleCustId(null)}
                  className="flex-1 py-2 bg-[#282d36] text-xs font-semibold rounded text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded"
                >
                  تأكيد التحصيل وتخفيض الدين
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
          <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden text-gray-200">
            <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d22] border-b border-[#31363f]">
              <h3 className="font-bold text-sm text-white">إضافة عميل جديد</h3>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">اسم العميل / الشركة *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">سقف الائتمان ({currencySymbol})</label>
                  <input
                    type="number"
                    value={creditLimit}
                    onChange={(e) => setCreditLimit(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">العنوان</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">الرقم الضريبي</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={(e) => setTaxNumber(e.target.value)}
                  className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2e333d]">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 py-2 bg-[#282d36] text-xs font-semibold rounded text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded"
                >
                  حفظ العميل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
