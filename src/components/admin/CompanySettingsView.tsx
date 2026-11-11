/**
 * Company Settings & Market Deployment View (إعدادات المنشأة وترخيص سوق العمل والنسخ الاحتياطي)
 */
import React, { useState } from 'react';
import {
  Building2,
  Save,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  Printer,
  DollarSign,
  Monitor,
  FileCode,
  Package,
  FileText,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { CompanySettings } from '../../types';
import { StorageService } from '../../services/storage';

interface CompanySettingsViewProps {
  settings: CompanySettings;
  onSaveSettings: (settings: CompanySettings) => void;
  onRefreshData: () => void;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  settings,
  onSaveSettings,
  onRefreshData,
}) => {
  const [formData, setFormData] = useState<CompanySettings>(settings);
  const [successMsg, setSuccessMsg] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const [backupStatus, setBackupStatus] = useState<{
    type: 'idle' | 'success' | 'error' | 'loading';
    message: string;
  }>({ type: 'idle', message: '' });

  // Export full database backup
  const handleExportFullBackup = () => {
    try {
      const filename = StorageService.downloadBackupFile();
      setBackupStatus({
        type: 'success',
        message: `تم تنزيل النسخة الاحتياطية الشاملة بنجاح باسم: ${filename}`,
      });
      setTimeout(() => setBackupStatus({ type: 'idle', message: '' }), 5000);
    } catch (e: any) {
      setBackupStatus({
        type: 'error',
        message: 'حدث خطأ أثناء تنزيل النسخة الاحتياطية: ' + (e?.message || ''),
      });
    }
  };

  // Export products only
  const handleExportProductsOnly = () => {
    try {
      const filename = StorageService.downloadProductsFile();
      setBackupStatus({
        type: 'success',
        message: `تم تنزيل نسخة المنتجات والأسعار بنجاح: ${filename}`,
      });
      setTimeout(() => setBackupStatus({ type: 'idle', message: '' }), 5000);
    } catch (e: any) {
      setBackupStatus({
        type: 'error',
        message: 'حدث خطأ أثناء تصدير المنتجات: ' + (e?.message || ''),
      });
    }
  };

  // Export invoices only
  const handleExportInvoicesOnly = () => {
    try {
      const filename = StorageService.downloadInvoicesFile();
      setBackupStatus({
        type: 'success',
        message: `تم تنزيل نسخة الفواتير والمبيعات بنجاح: ${filename}`,
      });
      setTimeout(() => setBackupStatus({ type: 'idle', message: '' }), 5000);
    } catch (e: any) {
      setBackupStatus({
        type: 'error',
        message: 'حدث خطأ أثناء تصدير الفواتير: ' + (e?.message || ''),
      });
    }
  };

  // Import backup file (.json)
  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value so user can re-select the same file if needed
    e.target.value = '';

    setBackupStatus({ type: 'loading', message: `جاري استيراد وتحليل ملف النسخة الاحتياطية (${file.name})...` });

    try {
      const res = await StorageService.importFromJsonFile(file);
      if (res.success) {
        setBackupStatus({
          type: 'success',
          message: res.message,
        });
        onRefreshData();
        setTimeout(() => setBackupStatus({ type: 'idle', message: '' }), 7000);
      } else {
        setBackupStatus({
          type: 'error',
          message: res.message || 'فشل في استيراد ملف النسخة الاحتياطية.',
        });
      }
    } catch (err: any) {
      setBackupStatus({
        type: 'error',
        message: 'حدث استثناء غير متوقع أثناء استيراد البيانات: ' + (err?.message || ''),
      });
    }
  };

  return (
    <div className="flex-1 p-6 overflow-y-auto bg-[#181a1f] text-gray-200 font-['Cairo',sans-serif]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#20242b] border border-[#313742] p-5 rounded-lg flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 size={22} className="text-cyan-400" />
              <span>إعدادات المنشأة وترخيص سوق العمل (Commercial Settings)</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              إعداد بيانات الفواتير الضريبية، العملة، والنسخ الاحتياطي الشامل للكمبيوتر
            </p>
          </div>
          {successMsg && (
            <div className="px-3 py-1.5 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <Check size={16} />
              <span>تم حفظ التعديلات بنجاح!</span>
            </div>
          )}
        </div>

        {/* Commercial Market License Card */}
        <div className="bg-gradient-to-r from-[#17231c] to-[#1d2938] border border-emerald-600/40 p-5 rounded-lg flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-600/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
              <ShieldCheck size={28} />
            </div>
            <div>
              <div className="font-bold text-white text-sm">حالة ترخيص النظام لسوق العمل</div>
              <div className="text-xs text-emerald-400 mt-0.5">
                نسخة تجارية كاملة الصلاحيات (Commercial Edition) جاهزة للنشر والتثبيت على أجهزة الكمبيوتر
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded bg-emerald-900/60 border border-emerald-500 text-emerald-300 font-bold text-xs">
              ✓ مفعلة ومطابقة للمواصفات
            </span>
          </div>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSubmit} className="bg-[#20242b] border border-[#313742] rounded-lg p-6 space-y-4">
          <h2 className="font-bold text-sm text-white border-b border-[#2e333d] pb-2">
            البيانات الأساسية للمتجر والفاتورة
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">اسم المؤسسة / المتجر *</label>
              <input
                type="text"
                required
                value={formData.commercialName}
                onChange={(e) => setFormData({ ...formData, commercialName: e.target.value })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">الرقم الضريبي (VAT Number) *</label>
              <input
                type="text"
                required
                value={formData.taxNumber}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">رقم السجل التجاري (CR Number)</label>
              <input
                type="text"
                value={formData.crNumber}
                onChange={(e) => setFormData({ ...formData, crNumber: e.target.value })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">رقم الهاتف والتواصل</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">العملة الافتراضية</label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                placeholder="ر.س / $ / د.ع"
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1">نسبة ضريبة القيمة المضافة الافتراضية (%)</label>
              <input
                type="number"
                value={formData.defaultTaxRate}
                onChange={(e) => setFormData({ ...formData, defaultTaxRate: parseFloat(e.target.value) || 15 })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white font-mono font-bold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">العنوان والفرع</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">ترويسة الفاتورة (Header)</label>
              <input
                type="text"
                value={formData.receiptHeader}
                onChange={(e) => setFormData({ ...formData, receiptHeader: e.target.value })}
                className="w-full h-9 bg-[#17191d] border border-[#383e4a] rounded px-3 text-xs text-white"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-300 mb-1">تذييل الفاتورة والشروط (Footer)</label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full bg-[#17191d] border border-[#383e4a] rounded p-2.5 text-xs text-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#2e333d] flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded flex items-center gap-2 cursor-pointer shadow-md transition-colors"
            >
              <Save size={16} />
              <span>حفظ إعدادات النظام</span>
            </button>
          </div>
        </form>

        {/* Backup & Deployment Card */}
        <div className="bg-[#20242b] border border-[#313742] rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2e333d] pb-2">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <FileCode size={18} className="text-cyan-400" />
              <span>النسخ الاحتياطي وتصدير واستيراد بيانات النظام (JSON)</span>
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              ملفات محلية آفلاين (.json)
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            يتيح لك نظام هجاير أخذ نسخة احتياطية محلية من جميع بيانات المتجر (المنتجات، الفواتير، الحسابات، والعملاء) وحفظها كملف <strong className="text-cyan-400 font-mono">.json</strong> على جهازك لحمايتها من الضياع أو نقلها لجهاز كمبيوتر آخر دون الحاجة لإنترنت.
          </p>

          {/* Status Banner */}
          {backupStatus.type !== 'idle' && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 transition-all ${
                backupStatus.type === 'success'
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                  : backupStatus.type === 'error'
                  ? 'bg-rose-950/80 border-rose-600 text-rose-200'
                  : 'bg-cyan-950/80 border-cyan-600 text-cyan-200 animate-pulse'
              }`}
            >
              {backupStatus.type === 'success' && <Check size={18} className="text-emerald-400 shrink-0" />}
              {backupStatus.type === 'error' && <AlertCircle size={18} className="text-rose-400 shrink-0" />}
              {backupStatus.type === 'loading' && <Loader2 size={18} className="animate-spin text-cyan-400 shrink-0" />}
              <div className="font-medium">{backupStatus.message}</div>
            </div>
          )}

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Download Full Backup */}
            <div className="p-3.5 bg-[#17191d] border border-[#2e3440] rounded-lg flex flex-col justify-between space-y-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Download size={15} className="text-cyan-400" />
                  <span>نسخة احتياطية شاملة للنظام</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  تشمل كامل الفواتير، المنتجات، العملاء، حركات الخزينة وإعدادات المنشأة.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportFullBackup}
                className="w-full py-2 bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-md"
              >
                <Download size={15} />
                <span>تحميل النسخة الشاملة (JSON)</span>
              </button>
            </div>

            {/* Import Backup */}
            <div className="p-3.5 bg-[#17191d] border border-[#2e3440] rounded-lg flex flex-col justify-between space-y-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Upload size={15} className="text-emerald-400" />
                  <span>استرجاع نسخة احتياطية من ملف محلي</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  اختر ملف JSON محفوظ سابقاً لاستعادة وتحديث بيانات النظام وفواتيره.
                </p>
              </div>
              <label className="w-full py-2 bg-[#2d3748] hover:bg-[#39465c] text-emerald-300 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors border border-gray-600 shadow-md">
                <Upload size={15} />
                <span>اختيار ملف JSON واسترجاع البيانات</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Export Invoices Only */}
            <div className="p-3.5 bg-[#17191d] border border-[#2e3440] rounded-lg flex flex-col justify-between space-y-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <FileText size={15} className="text-blue-400" />
                  <span>تصدير الفواتير والمبيعات فقط</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  حفظ سجل فواتير المبيعات والمرتجعات مع تفاصيل الأصناف في ملف JSON منفصل.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportInvoicesOnly}
                className="w-full py-2 bg-[#263140] hover:bg-[#2f3d50] text-blue-300 border border-blue-800/40 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <FileText size={15} />
                <span>تصدير سجل الفواتير (JSON)</span>
              </button>
            </div>

            {/* Export Products Only */}
            <div className="p-3.5 bg-[#17191d] border border-[#2e3440] rounded-lg flex flex-col justify-between space-y-2">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Package size={15} className="text-amber-400" />
                  <span>تصدير قائمة المنتجات والأسعار</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  حفظ بيانات الأصناف، الباركود، الكلفة، والأسعار في ملف JSON محلي.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportProductsOnly}
                className="w-full py-2 bg-[#2b2f38] hover:bg-[#343944] text-amber-300 border border-amber-800/40 font-bold text-xs rounded flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Package size={15} />
                <span>تصدير الأصناف والأسعار (JSON)</span>
              </button>
            </div>
          </div>

          {/* Reset System to Factory Defaults */}
          <div className="pt-3 border-t border-[#2e333d] flex items-center justify-between">
            <div className="text-[11px] text-gray-400">
              إعادة تهيئة المتجر واستعادة البيانات الافتراضية
            </div>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-rose-300 font-bold">تأكيد التصفير؟</span>
                <button
                  type="button"
                  onClick={() => {
                    StorageService.resetAll();
                    onRefreshData();
                    setConfirmReset(false);
                    setBackupStatus({
                      type: 'success',
                      message: 'تمت استعادة البيانات الافتراضية للمصنع بنجاح.',
                    });
                    setTimeout(() => setBackupStatus({ type: 'idle', message: '' }), 4000);
                  }}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded transition-colors cursor-pointer"
                >
                  نعم، تصفير الآن
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2.5 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded transition-colors cursor-pointer"
                >
                  تراجع
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3.5 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs rounded flex items-center gap-1.5 cursor-pointer transition-colors border border-rose-800/40"
              >
                <RotateCcw size={14} />
                <span>إعادة ضبط المصنع</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
