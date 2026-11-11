/**
 * Dropdown menu for POS Admin, matching Screenshot 1 exactly
 */
import React from 'react';
import {
  Wrench,
  CheckSquare,
  Layers,
  Inbox,
  LogOut,
  User as UserIcon,
  Megaphone,
  Maximize2,
  Power,
  ExternalLink,
  Sliders,
  RotateCcw,
  Download,
  Upload,
  FileCode,
} from 'lucide-react';
import { User } from '../../types';
import { StorageService } from '../../services/storage';

interface PosAdminMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeUser: User;
  onOpenManagement: () => void;
  onOpenSalesHistory: () => void;
  onOpenOpenSales: () => void;
  onOpenTreasury: () => void;
  onOpenEndOfDay: () => void;
  onOpenUserInfo: () => void;
  onOpenBarcodeLabels?: () => void;
  onLogout: () => void;
  onToggleFullscreen: () => void;
  onToggleCommercial: () => void;
  isCommercial: boolean;
  onInitializeFreshStore?: () => void;
  onRefreshData?: () => void;
  onOpenDownloadModal?: () => void;
}

export const PosAdminMenu: React.FC<PosAdminMenuProps> = ({
  isOpen,
  onClose,
  activeUser,
  onOpenManagement,
  onOpenSalesHistory,
  onOpenOpenSales,
  onOpenTreasury,
  onOpenEndOfDay,
  onOpenUserInfo,
  onOpenBarcodeLabels,
  onLogout,
  onToggleFullscreen,
  onToggleCommercial,
  isCommercial,
  onInitializeFreshStore,
  onRefreshData,
  onOpenDownloadModal,
}) => {
  if (!isOpen) return null;

  const todayStr = '10/27/2026';

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[1px]"
        onClick={onClose}
      />

      {/* Menu Container */}
      <div
        className="fixed top-14 left-2 md:left-4 z-50 w-80 max-h-[85vh] overflow-y-auto bg-[#23272e] border border-[#3b414d] rounded-xl text-[#e3e5e8] shadow-2xl flex flex-col font-['Cairo',sans-serif] animate-in fade-in slide-in-from-top-2 duration-150 select-none text-right scrollbar-thin"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#1e2227] border-b border-[#3b414d]">
          <span className="font-bold text-base text-white tracking-wide">
            {activeUser.name}
          </span>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-[#2d323b]"
            title="إغلاق"
          >
            <ExternalLink size={17} className="rotate-180" />
          </button>
        </div>

        {/* Section: Management / Back Office */}
        <div className="p-1 border-b border-[#333842]">
          <button
            onClick={() => {
              onClose();
              onOpenManagement();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm font-semibold hover:bg-[#2c313a] text-amber-300 hover:text-amber-200 transition-colors group cursor-pointer"
          >
            <Wrench size={18} className="text-amber-400 group-hover:rotate-12 transition-transform" />
            <span>إدارة</span>
          </button>
        </div>

        {/* Section: Sales Operations */}
        <div className="p-1 border-b border-[#333842] space-y-0.5">
          <button
            onClick={() => {
              onClose();
              onOpenSalesHistory();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <CheckSquare size={17} className="text-gray-400" />
            <span>عرض سجل المبيعات</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenOpenSales();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <Layers size={17} className="text-gray-400" />
            <span>عرض المبيعات المفتوحة</span>
          </button>

          {onOpenBarcodeLabels && (
            <button
              onClick={() => {
                onClose();
                onOpenBarcodeLabels();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
            >
              <span className="font-mono font-bold text-base">#</span>
              <span>بطاقات الأسعار وطباعة الباركود</span>
            </button>
          )}

          <button
            onClick={() => {
              onClose();
              onOpenTreasury();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <Inbox size={17} className="text-gray-400" />
            <span>الخزينة</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenEndOfDay();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <span className="text-base">🚶‍♂️</span>
            <span>نهاية اليوم (إغلاق الدورة / Z-Report)</span>
          </button>
        </div>

        {/* Section: User info */}
        <div className="p-1 border-b border-[#333842] space-y-0.5">
          <div className="px-3 py-1 text-xs text-gray-400 font-medium">المستخدم</div>
          <button
            onClick={() => {
              onClose();
              onOpenUserInfo();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <UserIcon size={17} className="text-gray-400" />
            <span>معلومات المستخدم</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer"
          >
            <LogOut size={17} className="text-rose-400" />
            <span>تسجيل خروج / قفل النظام</span>
          </button>
        </div>

        {/* Section: Fresh Store Setup */}
        <div className="p-1 border-b border-[#333842]">
          <button
            onClick={() => {
              onClose();
              if (onInitializeFreshStore) onInitializeFreshStore();
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer"
          >
            <RotateCcw size={17} className="text-emerald-400" />
            <span className="font-bold">تهيئة متجر جديد (البدء من الفاتورة 1)</span>
          </button>
        </div>

        {/* Section: JSON Backup & Restore (حفظ واستيراد محلي) */}
        <div className="p-1 border-b border-[#333842] space-y-0.5">
          <div className="px-3 py-1 text-[11px] text-gray-400 font-semibold flex items-center justify-between">
            <span>النسخ الاحتياطي السريع (JSON)</span>
            <FileCode size={13} className="text-cyan-400" />
          </div>

          <button
            onClick={() => {
              try {
                const fname = StorageService.downloadBackupFile();
                alert(`تم أخذ نسخة احتياطية محلية وتنزيلها كملف:\n${fname}`);
                onClose();
              } catch (e: any) {
                alert('حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + e?.message);
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs hover:bg-[#2c313a] text-cyan-300 hover:text-cyan-200 transition-colors cursor-pointer"
          >
            <Download size={15} className="text-cyan-400 shrink-0" />
            <span className="font-bold">أخذ نسخة احتياطية (تصدير JSON)</span>
          </button>

          <label className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs hover:bg-[#2c313a] text-emerald-300 hover:text-emerald-200 transition-colors cursor-pointer">
            <Upload size={15} className="text-emerald-400 shrink-0" />
            <span className="font-bold">استرجاع نسخة سابقة (استيراد)</span>
            <input
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                e.target.value = '';
                if (window.confirm(`هل ترغب في استرجاع وتحديث بيانات النظام من الملف (${file.name})؟`)) {
                  const res = await StorageService.importFromJsonFile(file);
                  if (res.success) {
                    alert(res.message);
                    if (onRefreshData) onRefreshData();
                    onClose();
                  } else {
                    alert(res.message);
                  }
                }
              }}
            />
          </label>
        </div>

        {/* Section: System response */}
        <div className="p-1 border-b border-[#333842]">
          <button
            onClick={() => {
              onClose();
              alert('نظام هجاير لنقاط البيع والمبيعات جاهز ومتصل بالسيرفر المحلي بنجاح (الإصدار 2.4)');
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded text-sm hover:bg-[#2c313a] text-gray-200 hover:text-white transition-colors cursor-pointer"
          >
            <Megaphone size={17} className="text-cyan-400" />
            <span>استجابة ونبذة النظام</span>
          </button>
        </div>

        {/* Section: Download Offline App & Web Link */}
        <div className="p-1 border-b border-[#333842] space-y-1">
          {onOpenDownloadModal ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenDownloadModal();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 font-bold transition-colors cursor-pointer"
            >
              <span className="text-base">🌐</span>
              <span>ملف التطبيق ورابط الويب (Web/ZIP)</span>
            </button>
          ) : (
            <a
              href="./hajayer-pos-system.zip"
              download="hajayer-pos-system.zip"
              className="w-full flex items-center gap-3 px-3 py-2 rounded text-xs bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/40 text-cyan-300 hover:text-white transition-colors cursor-pointer"
            >
              <span className="text-base">📥</span>
              <span className="font-bold">تحميل النظام للكمبيوتر (ZIP)</span>
            </a>
          )}
        </div>

        {/* Date Display */}
        <div className="py-4 text-center font-bold text-gray-400 text-sm tracking-widest">
          {todayStr}
        </div>

        {/* Bottom Actions Row */}
        <div className="flex items-center justify-around py-2.5 px-3 bg-[#1e2227] border-t border-[#3b414d]">
          <button
            onClick={onToggleCommercial}
            className="p-1.5 text-gray-400 hover:text-amber-300 hover:bg-[#2d323b] rounded transition-colors"
            title="تبديل ترخيص سوق العمل"
          >
            <Sliders size={18} />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2d323b] rounded transition-colors"
            title="ملء الشاشة"
          >
            <Maximize2 size={18} />
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 rounded transition-colors"
            title="إيقاف التشغيل"
          >
            <Power size={18} />
          </button>
        </div>

        {/* Commercial Banner */}
        <div
          onClick={onToggleCommercial}
          className="bg-[#15181c] py-1.5 text-center text-[11px] text-gray-400 border-t border-[#2e333d] hover:bg-[#1a1e24] cursor-pointer transition-colors"
        >
          {isCommercial ? (
            <span className="text-emerald-400 font-bold">✓ نسخة تجارية مرخصة لسوق العمل (Commercial Active)</span>
          ) : (
            <span>This is a non-commercial session. (اضغط للتفعيل)</span>
          )}
        </div>
      </div>
    </>
  );
};
