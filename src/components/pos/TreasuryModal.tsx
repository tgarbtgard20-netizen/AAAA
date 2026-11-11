/**
 * Treasury & Cash Drawer Management Modal (الخزينة ودرج النقد)
 */
import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, PlusCircle, MinusCircle } from 'lucide-react';
import { CashMovement } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface TreasuryModalProps {
  isOpen: boolean;
  onClose: () => void;
  movements: CashMovement[];
  onAddMovement: (type: 'IN' | 'OUT', amount: number, reason: string) => void;
  currencySymbol: string;
  cashInDrawer: number;
  onClearMovements?: () => void;
}

export const TreasuryModal: React.FC<TreasuryModalProps> = ({
  isOpen,
  onClose,
  movements,
  onAddMovement,
  currencySymbol,
  cashInDrawer,
  onClearMovements,
}) => {
  const [activeTab, setActiveTab] = useState<'VIEW' | 'ADD'>('VIEW');
  const [movementType, setMovementType] = useState<'IN' | 'OUT'>('IN');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!amt || amt <= 0 || !reason.trim()) return;

    onAddMovement(movementType, amt, reason.trim());
    setAmount('');
    setReason('');
    setActiveTab('VIEW');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-xl overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <DollarSign size={18} className="text-emerald-400" />
            <span>إدارة الخزينة وحركة النقدية بالدرج</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Current Balance Banner */}
        <div className="p-4 bg-[#181a1f] border-b border-[#2e333d] flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400">الرصيد النقدي الفعلي بالدرج حالياً:</div>
            <div className="font-mono font-black text-2xl text-emerald-400 mt-0.5">
              {formatNumber(cashInDrawer)} {currencySymbol}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMovementType('IN');
                setActiveTab('ADD');
              }}
              className="px-3 py-1.5 bg-emerald-700/60 hover:bg-emerald-600 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              <ArrowDownRight size={14} />
              <span>إيداع نقدية</span>
            </button>
            <button
              onClick={() => {
                setMovementType('OUT');
                setActiveTab('ADD');
              }}
              className="px-3 py-1.5 bg-rose-800/60 hover:bg-rose-700 text-white text-xs font-bold rounded flex items-center gap-1 cursor-pointer"
            >
              <ArrowUpRight size={14} />
              <span>سحب نقدية</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          {activeTab === 'VIEW' ? (
            <div>
              <div className="text-xs font-semibold text-gray-300 mb-2">سجل حركات النقدية اليومية:</div>
              <div className="max-h-64 overflow-y-auto space-y-1.5 bg-[#17191d] border border-[#2e333d] rounded p-2">
                {movements.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-500">لا توجد حركات مسجلة اليوم</div>
                ) : (
                  movements.map((m) => (
                    <div
                      key={m.id}
                      className="p-2.5 rounded bg-[#20242b] border border-[#2e333d] flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className={`p-1 rounded ${
                            m.type === 'IN' || m.type === 'START'
                              ? 'bg-emerald-950 text-emerald-400'
                              : 'bg-rose-950 text-rose-400'
                          }`}
                        >
                          {m.type === 'IN' || m.type === 'START' ? (
                            <ArrowDownRight size={15} />
                          ) : (
                            <ArrowUpRight size={15} />
                          )}
                        </span>
                        <div>
                          <div className="font-bold text-gray-200">{m.reason}</div>
                          <div className="text-[10px] text-gray-400 mt-0.5">
                            {m.date} • بواسطة: {m.cashierName}
                          </div>
                        </div>
                      </div>

                      <div
                        className={`font-mono font-bold text-sm ${
                          m.type === 'IN' || m.type === 'START'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {m.type === 'OUT' || m.type === 'END' ? '-' : '+'}
                        {formatNumber(m.amount)} {currencySymbol}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMovementType('IN')}
                  className={`flex-1 py-2 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    movementType === 'IN'
                      ? 'bg-emerald-700/80 border-emerald-500 text-white'
                      : 'bg-[#1a1d22] border-[#383e4a] text-gray-400'
                  }`}
                >
                  <PlusCircle size={15} />
                  <span>إيداع بالخزينة (سند قبض)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMovementType('OUT')}
                  className={`flex-1 py-2 rounded text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                    movementType === 'OUT'
                      ? 'bg-rose-800/80 border-rose-500 text-white'
                      : 'bg-[#1a1d22] border-[#383e4a] text-gray-400'
                  }`}
                >
                  <MinusCircle size={15} />
                  <span>سحب مصاريف / عهدة (سند صرف)</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  المبلغ ({currencySymbol}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  autoFocus
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-10 bg-[#17191d] border border-[#383e4a] rounded px-3 text-sm font-mono text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">
                  البيان / سبب العملية *
                </label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="مثال: سحب مصاريف نظافة / شراء أدوات مكتبية / توريد نقدية للبنك"
                  className="w-full h-10 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('VIEW')}
                  className="flex-1 py-2 bg-[#282d36] text-xs font-semibold rounded text-gray-300"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white rounded"
                >
                  حفظ وتسجيل الحركة
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
