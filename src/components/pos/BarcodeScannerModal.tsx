/**
 * Barcode Scanner Modal with Live Camera and Fast Hardware Scanner Gun support
 */
import React, { useState, useEffect, useRef } from 'react';
import { X, Barcode, Camera, Check, AlertCircle, ShoppingCart, Search, RefreshCw } from 'lucide-react';
import { Product } from '../../types';
import { sound } from '../../services/sound';
import { formatNumber } from '../../utils/formatters';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onAddProduct: (product: Product) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  products,
  onAddProduct,
}) => {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);
  const [scannedHistory, setScannedHistory] = useState<Array<{ product: Product; time: string }>>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraPermissionError, setCameraPermissionError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<number | null>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setBarcodeInput('');
      setErrorMsg('');
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
      return () => clearTimeout(t);
    } else {
      stopCamera();
    }
  }, [isOpen]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      window.clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraPermissionError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
      }
      setCameraActive(true);

      // Check for native BarcodeDetector API support
      if ('BarcodeDetector' in window) {
        try {
          // @ts-expect-error - BarcodeDetector browser API
          const detector = new window.BarcodeDetector({
            formats: ['code_128', 'ean_13', 'ean_8', 'qr_code', 'upc_a', 'upc_e'],
          });

          scanIntervalRef.current = window.setInterval(async () => {
            if (!videoRef.current || videoRef.current.readyState < 2) return;
            try {
              const barcodes = await detector.detect(videoRef.current);
              if (barcodes && barcodes.length > 0) {
                const code = barcodes[0].rawValue;
                if (code) {
                  handleCodeDetected(code);
                }
              }
            } catch {
              // Ignore frame detection errors
            }
          }, 350);
        } catch {
          // BarcodeDetector initialization fallback
        }
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      setCameraPermissionError('تعذر الوصول للكاميرا. يرجى التأكد من منح الإذن أو استخدام الإدخال اليدوي/قارئ الباركود.');
      setCameraActive(false);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const handleCodeDetected = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    // Search product by barcode or code
    const found = products.find(
      (p) =>
        p.barcode.toLowerCase() === trimmed.toLowerCase() ||
        p.code.toLowerCase() === trimmed.toLowerCase()
    );

    if (found) {
      sound.playScanBeep();
      onAddProduct(found);
      setLastScannedProduct(found);
      setErrorMsg('');
      setBarcodeInput('');
      setScannedHistory((prev) => [
        { product: found, time: new Date().toLocaleTimeString('ar-SA') },
        ...prev.slice(0, 7),
      ]);
    } else {
      sound.playError();
      setErrorMsg(`لم يتم العثور على منتج بالباركود: ${trimmed}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    handleCodeDetected(barcodeInput);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none font-['Cairo',sans-serif]"
      dir="rtl"
    >
      <div className="bg-[#1e2229] border border-[#3b4352] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-gray-200 animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#171a1f] border-b border-[#31363f]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/50 flex items-center justify-center text-cyan-400">
              <Barcode size={22} />
            </div>
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <span>قارئ وماسح الباركود السريع</span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  متصل وجاهز
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                امسح بمسدس الباركود (Laser) أو عبر كاميرا الجهاز مباشرة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Hardware Scanner & Input Box */}
          <form onSubmit={handleSubmit} className="space-y-2">
            <label className="block text-xs font-bold text-gray-200">
              <span>مسح أو كتابة رقم الباركود:</span>
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={barcodeInput}
                onChange={(e) => {
                  setBarcodeInput(e.target.value);
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="امسح الباركود الآن أو اكتب الرقم واضغط Enter..."
                className="w-full h-13 bg-[#131519] border-2 border-cyan-500/70 focus:border-cyan-400 rounded-xl px-4 pl-24 text-center font-mono font-bold text-lg text-white focus:outline-none placeholder:text-gray-500 placeholder:text-xs"
                autoFocus
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 px-3.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow transition-all"
              >
                <Check size={14} />
                <span>إضافة</span>
              </button>
            </div>
            <p className="text-[11px] text-cyan-400/90 flex items-center gap-1.5">
              <span>💡 مسدس الباركود اليدوي سيعمل فورياً بمجرد توجيهه على ملصق الصنف.</span>
            </p>
          </form>

          {/* Camera Scanner Toggle and Viewfinder */}
          <div className="bg-[#171a20] border border-[#2d3340] rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-cyan-400" />
                <span className="text-xs font-bold text-gray-200">مسح الباركود عبر الكاميرا</span>
              </div>
              <button
                type="button"
                onClick={toggleCamera}
                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  cameraActive
                    ? 'bg-rose-900/60 hover:bg-rose-800 text-rose-200 border border-rose-700'
                    : 'bg-[#2a303c] hover:bg-[#343c4b] text-gray-200 border border-gray-600'
                }`}
              >
                {cameraActive ? (
                  <>
                    <X size={13} />
                    <span>إيقاف الكاميرا</span>
                  </>
                ) : (
                  <>
                    <Camera size={13} />
                    <span>تشغيل الكاميرا</span>
                  </>
                )}
              </button>
            </div>

            {cameraPermissionError && (
              <div className="p-2.5 bg-amber-950/40 border border-amber-800 rounded-lg text-amber-300 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{cameraPermissionError}</span>
              </div>
            )}

            {cameraActive && (
              <div className="relative rounded-xl overflow-hidden bg-black border border-cyan-500/50 aspect-video flex items-center justify-center">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                />
                {/* Viewfinder Overlay with Laser Line */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-3/4 h-3/5 border-2 border-cyan-400/80 rounded-lg relative overflow-hidden shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-cyan-300"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-cyan-300"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-cyan-300"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-cyan-300"></div>
                    {/* Animated Scanning Laser */}
                    <div className="w-full h-0.5 bg-red-500 shadow-[0_0_8px_#ef4444] animate-pulse"></div>
                  </div>
                </div>
                <div className="absolute bottom-2 inset-x-0 text-center pointer-events-none">
                  <span className="bg-black/70 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
                    وجّه الباركود داخل الإطار
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Feedback & Error */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Last Successfully Scanned Product Card */}
          {lastScannedProduct && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-700/70 rounded-xl flex items-center justify-between animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-900/60 border border-emerald-500/50 flex items-center justify-center text-emerald-300 font-bold">
                  <ShoppingCart size={18} />
                </div>
                <div>
                  <div className="text-xs font-black text-white flex items-center gap-2">
                    <span>{lastScannedProduct.name}</span>
                    <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">
                      تمت الإضافة ✓
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400 font-mono mt-0.5">
                    الباركود: {lastScannedProduct.barcode} • السعر: {formatNumber(lastScannedProduct.salePrice)} ر.س.
                  </div>
                </div>
              </div>
              <div className="text-left font-mono font-black text-emerald-400 text-base">
                {formatNumber(lastScannedProduct.salePrice)} ر.س
              </div>
            </div>
          )}

          {/* Scanned History in this session */}
          {scannedHistory.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-400 px-1">
                <span>سجل الأصناف الممسوحة في هذه الجلسة ({scannedHistory.length}):</span>
              </div>
              <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {scannedHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-[#15171c] border border-[#2b303b] px-3 py-1.5 rounded-lg text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                      <span className="font-semibold text-gray-200">{item.product.name}</span>
                      <span className="font-mono text-[10px] text-gray-500">({item.product.barcode})</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-emerald-400 font-bold">{formatNumber(item.product.salePrice)} ر.س</span>
                      <span className="text-[10px] text-gray-500">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick-Scan Suggestions from Store Inventory */}
          {products.length > 0 && (
            <div className="pt-2 border-t border-[#2b303a] space-y-2">
              <span className="text-[11px] font-bold text-gray-400 block">
                أصناف سريعة من المخزون للاختبار السريع:
              </span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                {products.slice(0, 6).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleCodeDetected(p.barcode || p.code)}
                    className="px-2.5 py-1 bg-[#262c37] hover:bg-cyan-900/60 border border-[#3b4354] hover:border-cyan-500 rounded-lg text-xs text-gray-300 hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Barcode size={13} className="text-cyan-400" />
                    <span>{p.name}</span>
                    <span className="font-mono text-[10px] text-gray-400">({p.barcode})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 bg-[#171a1f] border-t border-[#31363f]">
          <span className="text-[11px] text-gray-400">
            يمكنك ترك هذه النافذة مفتوحة ومسح أصناف متعددة تباعاً
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
          >
            إغلاق ومتابعة الفاتورة
          </button>
        </div>
      </div>
    </div>
  );
};
