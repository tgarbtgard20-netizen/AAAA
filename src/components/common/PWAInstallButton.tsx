import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, ShieldCheck } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  // If already running inside standalone app, show small badge or hide
  if (isInstalled) {
    return (
      <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-400" />
        <span>تطبيق مثبت ✓</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const res = await install();
      if (res) {
        setJustInstalled(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="تثبيت التطبيق على جهازك مباشرة بدون تحميل أو فك ضغط"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs md:text-sm font-bold shadow-md shadow-emerald-950/40 border border-emerald-400/40 transition active:scale-95 animate-pulse hover:animate-none"
      >
        <Smartphone className="w-4 h-4 text-emerald-200" />
        <span>تثبيت التطبيق فوراً</span>
      </button>

      {/* Direct Installation Guide Modal for mobile and desktop */}
      {showGuideModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setShowGuideModal(false)}
        >
          <div 
            className="w-full max-w-md bg-[#1f2128] border border-emerald-500/40 rounded-2xl p-6 text-white shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 left-4 p-1.5 rounded-lg bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">تثبيت التطبيق بدون فك ضغط</h3>
                <p className="text-xs text-gray-400">تثبيت فوري ومباشر على الشاشة الرئيسية لجهازك</p>
              </div>
            </div>

            <div className="space-y-3 my-4 text-sm text-gray-200">
              {isIOS ? (
                <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 space-y-2">
                  <div className="font-semibold text-emerald-400">خطوات التثبيت على iPhone / iPad:</div>
                  <div className="text-xs text-gray-300 leading-relaxed">
                    1. اضغط على زر المشاركة <strong>(Share / سهم للأعلى)</strong> في أسفل متصفح Safari.<br />
                    2. مرر للأسفل واضغط على <strong>"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</strong>.<br />
                    3. سيظهر تطبيق هجاير في شاشتك الرئيسية كتطبيق مستقل.
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800/80 rounded-xl p-4 border border-gray-700 space-y-3">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>خطوات التثبيت على أندرويد وSamsung وChrome:</span>
                  </div>
                  
                  <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
                    <div className="flex items-start gap-2 bg-[#18191c] p-2.5 rounded-lg border border-gray-700">
                      <span className="bg-emerald-600 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">1</span>
                      <div>اضغط على <strong>القائمة (ثلاث نقاط ⋮)</strong> أو الخطوط الثلاثة في متصفحك.</div>
                    </div>
                    <div className="flex items-start gap-2 bg-[#18191c] p-2.5 rounded-lg border border-gray-700">
                      <span className="bg-emerald-600 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">2</span>
                      <div>اختر <strong>"تثبيت التطبيق" (Install app)</strong> أو <strong>"إضافة إلى الشاشة الرئيسية"</strong>.</div>
                    </div>
                    <div className="flex items-start gap-2 bg-[#18191c] p-2.5 rounded-lg border border-gray-700">
                      <span className="bg-emerald-600 text-white font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">3</span>
                      <div>اضغط على <strong>"تثبيت"</strong> — سينزل التطبيق على هاتفك أو كمبيوترك فوراً بأيقونة هجاير الرسمية وبدون الحاجة لفك أي ضغط!</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg transition"
            >
              فهمت، شكراً لك
            </button>
          </div>
        </div>
      )}
    </>
  );
};
