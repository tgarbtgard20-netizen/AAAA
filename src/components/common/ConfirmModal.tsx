import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'تأكيد',
  cancelText = 'إلغاء',
  isDanger = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#20242b] border border-[#3b414d] rounded-xl shadow-2xl w-full max-w-md overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#17191d] border-b border-[#2e333d]">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isDanger
                  ? 'bg-rose-950/80 border border-rose-700/60 text-rose-400'
                  : 'bg-cyan-950/80 border border-cyan-700/60 text-cyan-400'
              }`}
            >
              <AlertTriangle size={15} />
            </div>
            <h3 className="font-bold text-sm text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line">{message}</p>
        </div>

        <div className="px-5 py-3 bg-[#17191d] border-t border-[#2e333d] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#2a2f3a] hover:bg-[#343a47] text-gray-300 hover:text-white text-xs font-semibold rounded transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 text-white text-xs font-bold rounded flex items-center gap-1.5 shadow-md transition-colors cursor-pointer ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-cyan-600 hover:bg-cyan-500'
            }`}
          >
            <Check size={15} />
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
