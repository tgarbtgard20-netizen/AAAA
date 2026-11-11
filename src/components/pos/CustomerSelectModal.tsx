/**
 * Customer Selection and Management Modal
 */
import React, { useState } from 'react';
import { X, UserPlus, Phone, Search, Check, DollarSign } from 'lucide-react';
import { Customer } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface CustomerSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomer: Customer;
  onSelectCustomer: (c: Customer) => void;
  onSaveCustomer: (c: Customer) => void;
  currencySymbol: string;
}

export const CustomerSelectModal: React.FC<CustomerSelectModalProps> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomer,
  onSelectCustomer,
  onSaveCustomer,
  currencySymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('1000');
  const [newAddress, setNewAddress] = useState('');
  const [newTaxNumber, setNewTaxNumber] = useState('');

  if (!isOpen) return null;

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newCustomer: Customer = {
      id: 'c_' + Date.now(),
      name: newName.trim(),
      phone: newPhone.trim() || '0500000000',
      address: newAddress.trim(),
      taxNumber: newTaxNumber.trim(),
      balance: 0,
      creditLimit: parseFloat(newCreditLimit) || 1000,
    };

    onSaveCustomer(newCustomer);
    onSelectCustomer(newCustomer);
    setIsAddingNew(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
    setNewTaxNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-xl overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
          <h2 className="font-bold text-base text-white">إدارة واختيار العملاء (Customers)</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#2c313a] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5">
          {!isAddingNew ? (
            <>
              {/* Search & Add buttons */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="ابحث بالاسم أو رقم الهاتف..."
                    className="w-full h-10 bg-[#17191d] border border-[#383e4a] rounded px-3 pr-9 text-xs text-gray-100 placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                  />
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(true)}
                  className="h-10 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <UserPlus size={16} />
                  <span>عميل جديد</span>
                </button>
              </div>

              {/* Customer List */}
              <div className="max-h-72 overflow-y-auto space-y-1.5 divide-y divide-[#2a2f38]">
                {filtered.map((cust) => {
                  const isSelected = cust.id === selectedCustomer.id;
                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        onSelectCustomer(cust);
                        onClose();
                      }}
                      className={`pt-2 p-2.5 rounded flex items-center justify-between cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-[#293241] border border-cyan-500 text-white'
                          : 'hover:bg-[#1a1d22] text-gray-300'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {cust.name}
                          {isSelected && <span className="text-[10px] bg-cyan-900 text-cyan-200 px-1.5 py-0.5 rounded">محدد حالياً</span>}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1"><Phone size={12} /> {cust.phone}</span>
                          {cust.address && <span>📍 {cust.address}</span>}
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="text-[11px] text-gray-400">الرصيد / المديونية:</div>
                        <div className={`font-mono font-bold text-sm ${cust.balance > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {formatNumber(cust.balance)} {currencySymbol}
                        </div>
                        <div className="text-[10px] text-gray-500">حد: {formatNumber(cust.creditLimit)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Add New Customer Form */
            <form onSubmit={handleAddNew} className="space-y-3">
              <h3 className="font-bold text-sm text-cyan-400 border-b border-[#2e333d] pb-2">
                بيانات العميل الجديد
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="مثال: صالح العلي"
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">رقم الجوال *</label>
                  <input
                    type="text"
                    required
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="05xxxxxxxx"
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">سقف الائتمان (الحد الأقصى للآجل)</label>
                  <input
                    type="number"
                    value={newCreditLimit}
                    onChange={(e) => setNewCreditLimit(e.target.value)}
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">الرقم الضريبي (إن وجد)</label>
                  <input
                    type="text"
                    value={newTaxNumber}
                    onChange={(e) => setNewTaxNumber(e.target.value)}
                    placeholder="300xxxxxxxxxxxx"
                    className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">العنوان / الحي</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="مثال: الرياض - حي الملقا"
                  className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#2e333d]">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="flex-1 py-2 bg-[#282d36] hover:bg-[#333944] text-xs font-semibold rounded text-gray-300"
                >
                  رجوع للقائمة
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded flex items-center justify-center gap-1.5"
                >
                  <Check size={16} />
                  <span>حفظ وتحديد العميل</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
