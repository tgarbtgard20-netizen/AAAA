import React, { useState } from 'react';
import {
  X,
  Download,
  Globe,
  Copy,
  Check,
  Package,
  FileArchive,
  ExternalLink,
  Laptop,
  Smartphone,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import { StorageService } from '../../services/storage';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type: 'success' | 'info' | 'error') => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentWebUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://ais-dev-komikw3z32iacxt2typ3ax-708536811255.europe-west1.run.app';

  const permanentWebUrl = 'https://ais-dev-komikw3z32iacxt2typ3ax-708536811255.europe-west1.run.app';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(permanentWebUrl);
      setCopiedLink(true);
      onShowToast('تم نسخ رابط التطبيق في الويب إلى الحافظة بنجاح!', 'success');
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      onShowToast('يمكنك نسخ الرابط مباشرة من المربع أدناه', 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#20242b] border border-[#3b414d] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17191d] border-b border-[#2e333d]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Globe size={22} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">
                ملف التطبيق ورابط الاستخدام في الويب
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                مؤسسة هجاير للتجاره • نظام نقاط البيع والمحاسبة الشامل
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Direct 1-Click Install Card (No unzipping needed) */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-teal-950/70 to-emerald-900/60 border border-emerald-500/60 rounded-xl p-4 space-y-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs md:text-sm font-bold text-emerald-300 flex items-center gap-2">
                <Smartphone size={18} className="text-emerald-400" />
                <span>تثبيت التطبيق فوراً على جهازك (بدون ملف مضغوط وبدون فك ضغط):</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-600 text-white">
                تثبيت فوري بضغطة زر
              </span>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed">
              لا داعي لتحميل أي ملف مضغوط ولا لفك الضغط! يمكنك تثبيت تطبيق <strong>مؤسسة هجاير</strong> مباشرة على هاتفك (أندرويد / سامسونج) أو شاشة الكمبيوتر ليصبح تطبيقاً مستقلاً تماماً بأيقونته الرسمية:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="bg-[#14181f]/80 p-3 rounded-lg border border-emerald-800/40 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <Smartphone size={14} />
                  <span>على الجوال (Samsung / Chrome / Android):</span>
                </div>
                <div className="text-[11px] text-gray-300 leading-normal">
                  اضغط على خيارات المتصفح <strong>(ثلاث نقاط ⋮)</strong> ثم اضغط على <strong>"تثبيت التطبيق"</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.
                </div>
              </div>

              <div className="bg-[#14181f]/80 p-3 rounded-lg border border-emerald-800/40 space-y-1">
                <div className="font-bold text-teal-400 flex items-center gap-1.5">
                  <Laptop size={14} />
                  <span>على الكمبيوتر (Chrome / Edge):</span>
                </div>
                <div className="text-[11px] text-gray-300 leading-normal">
                  اضغط على أيقونة التثبيت ⊕ بجوار شريط العنوان أو القائمة (⋮) ثم <strong>"تثبيت Hajayer POS"</strong> ليظهر على سطح المكتب كبرنامج مستقل.
                </div>
              </div>
            </div>
          </div>

          {/* Web Access Card */}
          <div className="bg-gradient-to-r from-[#17232a] to-[#1c2838] border border-cyan-700/50 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                <Globe size={16} />
                <span>رابط التطبيق المباشر للاستخدام في المتصفح والويب:</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                متصل ونشط 24/7
              </span>
            </div>

            <div className="flex items-center gap-2 bg-[#14161b] p-2 rounded-lg border border-[#313745]">
              <input
                type="text"
                readOnly
                value={permanentWebUrl}
                className="w-full bg-transparent text-xs text-gray-200 font-mono focus:outline-none select-all"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer"
              >
                {copiedLink ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedLink ? 'تم النسخ!' : 'نسخ الرابط'}</span>
              </button>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              يمكنك فتح هذا الرابط من أي كمبيوتر مكتبي، جهاز كاشير، هاتف ذكي أو جهاز لوحي (تابلت / آيباد) والعمل به مباشرة دون أي تثبيت.
            </p>
          </div>

          {/* Download Offline ZIP & Package Files */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-gray-300 flex items-center gap-2">
              <FileArchive size={16} className="text-amber-400" />
              <span>تحميل ملف التطبيق الكامل للكمبيوتر (تشغيل محلي Offline):</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Option 1: ZIP Archive */}
              <div className="p-4 bg-[#181a20] border border-[#2f3542] rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <FileArchive size={16} className="text-cyan-400" />
                      <span>حزمة التطبيق للكمبيوتر (ZIP)</span>
                    </span>
                    <span className="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      15 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    ملف مضغوط كامل يحتوي على جميع ملفات التطبيق والمكتبات للعمل على أجهزة ويندوز وماك بدون إنترنت.
                  </p>
                </div>

                <a
                  href="./hajayer-pos-system.zip"
                  download="hajayer-pos-system.zip"
                  onClick={() => onShowToast('بدأ تحميل ملف hajayer-pos-system.zip', 'success')}
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
                >
                  <Download size={16} />
                  <span>تحميل ملف التطبيق (ZIP)</span>
                </a>
              </div>

              {/* Option 2: Tar.gz Archive */}
              <div className="p-4 bg-[#181a20] border border-[#2f3542] rounded-xl flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white flex items-center gap-2">
                      <Package size={16} className="text-emerald-400" />
                      <span>حزمة سيرفر خفيف (TAR.GZ)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      5.5 MB
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    نسخة مضغوطة فائقة السرعة مخصصة للمطورين وأنظمة Linux والتوزيع السريع.
                  </p>
                </div>

                <a
                  href="./hajayer-pos-system.tar.gz"
                  download="hajayer-pos-system.tar.gz"
                  onClick={() => onShowToast('بدأ تحميل ملف hajayer-pos-system.tar.gz', 'success')}
                  className="w-full py-2.5 bg-[#25332b] hover:bg-[#2e4036] text-emerald-300 border border-emerald-700/50 font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Download size={16} />
                  <span>تحميل حزمة السيرفر (TAR.GZ)</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Data Backup JSON Download */}
          <div className="p-4 bg-[#181a20] border border-[#2f3542] rounded-xl flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <FileCode size={16} className="text-amber-400" />
                <span>نسخة احتياطية سريعة لبياناتك الحالية (JSON)</span>
              </div>
              <p className="text-[11px] text-gray-400">
                تحميل جميع الفواتير والمنتجات وحركات الخزينة المحفوظة حالياً في ملف نصي صغير.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const fname = StorageService.downloadBackupFile();
                onShowToast(`تم تنزيل النسخة الاحتياطية بنجاح: ${fname}`, 'success');
              }}
              className="px-4 py-2 bg-[#2d323e] hover:bg-[#383f4e] text-amber-300 border border-amber-700/40 font-bold text-xs rounded-lg flex items-center gap-2 shrink-0 transition-colors cursor-pointer"
            >
              <Download size={15} />
              <span>تصدير بيانات JSON</span>
            </button>
          </div>

          {/* Device Support Tips */}
          <div className="bg-[#15171b] p-3.5 rounded-xl border border-[#2b303c] text-xs text-gray-400 space-y-1.5">
            <div className="font-bold text-gray-300 flex items-center gap-2 text-[11px]">
              <ShieldCheck size={15} className="text-emerald-400" />
              <span>ملاحظات التثبيت والاستخدام:</span>
            </div>
            <ul className="list-disc list-inside space-y-1.5 text-[11px] text-gray-400 pr-1">
              <li><strong>على أجهزة الأندرويد وجوالات سامسونج:</strong> في متصفحك (Samsung Browser أو Chrome)، اضغط على خيارات المتصفح (⋮) ثم اختر <strong>"إضافة إلى الشاشة الرئيسية"</strong> أو <strong>"تثبيت كـ تطبيق"</strong> ليتم تثبيته فوراً كـ تطبيق APK كامل بأيقونة مستقلة على شاشة هاتفك ويعمل بملء الشاشة بدون شريط المتصفح!</li>
              <li><strong>في المتصفح:</strong> يمكنك تشغيل النظام فوراً عبر رابط الويب على أي جهاز بدون أي إعدادات إضافية.</li>
              <li><strong>على أجهزة الكمبيوتر:</strong> فك ضغط ملف ZIP وشغل الأمر <code className="text-cyan-300 font-mono">npm install && npm run dev</code> لتشغيله محلياً.</li>
              <li><strong>الطباعة والباركود:</strong> يدعم النظام طابعات الفواتير الحرارية وطابعات باركود الملصقات مباشرة.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#17191d] border-t border-[#2e333d] flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            الإصدار 2.4 • ترخيص تجاري لسوق العمل جاهز للنشر
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
