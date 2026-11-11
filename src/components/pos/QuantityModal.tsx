/**
 * Quantity & Line Item Adjustment Modal with Numpad
 */
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { CartItem } from '../../types';

interface QuantityModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: CartItem | null;
  onUpdateQuantity: (newQty: number) => void;
}

export const QuantityModal: React.FC<QuantityModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdateQuantity,
}) => {
  const [val, setVal] = useState<string>(item ? item.quantity.toString() : '1');

  if (!isOpen || !item) return null;

  const handleDigit = (digit: string) => {
    if (val === '0') setVal(digit);
    else setVal(val + digit);
  };

  const handleClear = () => {
    setVal('1');
  };

  const handleBackspace = () => {
    if (val.length > 1) {
      setVal(val.slice(0, -1));
    } else {
      setVal('1');
    }
  };

  const handleSave = () => {
    const q = parseFloat(val);
    if (q > 0) {
      onUpdateQuantity(q);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none" dir="rtl">
      <div className="bg-[#20242b] border border-[#3b414d] rounded-lg shadow-2xl w-full max-w-xs overflow-hidden text-gray-200">
        <div className="flex items-center justify-between px-4 py-3 bg-[#1a1d22] border-b border-[#31363f]">
          <h2 className="font-bold text-sm text-white">تعديل كمية الصنف</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="text-center font-bold text-xs text-gray-300 truncate">
            {item.product.name}
          </div>

          <div className="bg-[#17191d] border-2 border-cyan-500 rounded p-3 text-center">
            <span className="font-mono font-black text-3xl text-cyan-400">{val}</span>
            <span className="text-xs text-gray-400 mr-2">{item.product.unit}</span>
          </div>

          {/* Touch Numpad */}
          <div className="grid grid-cols-3 gap-2 font-mono font-bold text-lg">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  if (k === 'C') handleClear();
                  else if (k === '⌫') handleBackspace();
                  else handleDigit(k);
                }}
                className="h-12 bg-[#292f3b] hover:bg-[#353d4c] active:bg-cyan-800 border border-[#3b414d] rounded text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                {k}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-[#282d36] hover:bg-[#333944] text-xs font-semibold rounded text-gray-300"
            >
              إلغاء
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded flex items-center justify-center gap-1.5"
            >
              <Check size={16} />
              <span>تأكيد الكمية</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
