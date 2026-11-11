/**
 * Open / Held Sales Modal (عرض المبيعات المفتوحة والمعلقة)
 */
import React from 'react';
import { X, Play, Trash2, Clock, ShoppingCart } from 'lucide-react';
import { HeldSale } from '../../types';
import { formatNumber } from '../../utils/formatters';

interface OpenSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  heldSales: HeldSale[];
  onRestoreHeldSale: (held: HeldSale) => void;
  onDeleteHeldSale: (id: string) => void;
  currencySymbol: string;
}

export const OpenSalesModal: React.FC<OpenSalesModalProps> = ({
  isOpen,
  onClose,
  heldSales,
  onRestoreHeldSale,
  onDeleteHeldSale,
  currencySymbol,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-lg overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1a1d22] border-b border-[#31363f]">
          <h2 className="font-bold text-base text-white flex items-center gap-2">
            <ShoppingCart size={18} className="text-amber-400" />
            <span>عرض الفواتير المعلقة والمفتوحة (Parked Sales)</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-3">
          {heldSales.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-sm">
              لا توجد فواتير معلقة حالياً في الانتظار.
            </div>
          ) : (
            heldSales.map((h) => {
              const totalAmount = h.items.reduce((acc, it) => acc + it.total, 0);
              return (
                <div
                  key={h.id}
                  className="bg-[#17191d] border border-[#2e333d] rounded-lg p-3.5 flex items-center justify-between gap-3 hover:border-[#3d4554] transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-white flex items-center gap-2">
                      <span>{h.customer.name}</span>
                      <span className="text-[10px] bg-[#293241] text-cyan-300 px-2 py-0.5 rounded font-mono">
                        {h.items.length} أصناف
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                      <Clock size={13} />
                      <span>{h.timestamp}</span>
                      {h.note && <span>• {h.note}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-left font-mono font-bold text-base text-emerald-400">
                      {formatNumber(totalAmount)} {currencySymbol}
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => {
                          onRestoreHeldSale(h);
                          onClose();
                        }}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors cursor-pointer"
                        title="استرجاع الفاتورة للسلة ومتابعة البيع"
                      >
                        <Play size={15} />
                      </button>
                      <button
                        onClick={() => onDeleteHeldSale(h.id)}
                        className="p-2 bg-rose-900/60 hover:bg-rose-800 text-rose-300 rounded transition-colors cursor-pointer"
                        title="حذف الفاتورة المعلقة"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
