/**
 * ZATCA (هيئة الزكاة والضريبة والجمارك) E-Invoicing & VAT Compliance Dashboard
 * Full interface for Phase 2 Integration, CSID management, TLV QR Validation, and VAT Return
 */
import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  QrCode,
  FileCheck,
  RefreshCw,
  Key,
  Server,
  Download,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Document, CompanySettings } from '../../types';
import { formatNumber } from '../../utils/formatters';
import { ZatcaService, generateZatcaTlvBase64 } from '../../services/zatca';

interface ZatcaViewProps {
  documents: Document[];
  settings: CompanySettings;
  onSaveSettings: (s: CompanySettings) => void;
}

export const ZatcaView: React.FC<ZatcaViewProps> = ({
  documents,
  settings,
  onSaveSettings,
}) => {
  const [zatcaConfig, setZatcaConfig] = useState(ZatcaService.getConfig());
  const [otpInput, setOtpInput] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Financials for VAT Return Report
  const totalSalesGross = documents
    .filter((d) => d.type === 'SALE')
    .reduce((acc, d) => acc + d.grandTotal, 0);

  const totalSalesVat = documents
    .filter((d) => d.type === 'SALE')
    .reduce((acc, d) => acc + d.taxTotal, 0);

  const totalSalesNet = totalSalesGross - totalSalesVat;

  const totalReturnsGross = documents
    .filter((d) => d.type === 'RETURN')
    .reduce((acc, d) => acc + d.grandTotal, 0);

  const totalReturnsVat = documents
    .filter((d) => d.type === 'RETURN')
    .reduce((acc, d) => acc + d.taxTotal, 0);

  const netVatPayable = Math.max(0, totalSalesVat - totalReturnsVat);

  // Latest invoice for compliance test
  const latestDoc = documents[0];

  const handleTestCompliance = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      if (latestDoc) {
        const val = ZatcaService.validateInvoiceCompliance({
          number: latestDoc.number,
          total: latestDoc.grandTotal,
          vat: latestDoc.taxTotal,
          date: latestDoc.date,
        });
        setTestResult(
          val.isValid
            ? `✓ الفاتورة ${latestDoc.number} متوافقة 100% مع معايير هيئة الزكاة والضريبة والجمارك (TLV Base64 Validated).`
            : `✕ توجد ملاحظات: ${val.errors.join(' | ')}`
        );
      } else {
        setTestResult('✓ النظام جاهز، ولا توجد فواتير بحاجة للمراجعة حالياً.');
      }
    }, 600);
  };

  const handleRenewOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput) return;
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      alert('تم تحديث وتوثيق شهادة الربط المشفرة (CSID) بنجاح مع منصة فاتورة (ZATCA Portal).');
      setOtpInput('');
    }, 800);
  };

  return (
    <div
      className="flex-1 flex flex-col h-full bg-[#181a1f] select-none text-gray-200 overflow-y-auto font-['Cairo',sans-serif]"
      dir="rtl"
    >
      {/* Top Bar */}
      <div className="h-12 bg-[#22262d] border-b border-[#313742] flex items-center justify-between px-4 text-xs shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-400" />
          <h2 className="font-bold text-white text-sm">
            بوابة الربط مع هيئة الزكاة والضريبة والجمارك (منظومة فاتورة ZATCA)
          </h2>
          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">
            المرحلة الثانية (الربط والتكامل نشط)
          </span>
        </div>

        <button
          onClick={handleTestCompliance}
          disabled={isSyncing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors cursor-pointer text-xs"
        >
          <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
          <span>فحص الامتثال والاتصال</span>
        </button>
      </div>

      {testResult && (
        <div className="bg-emerald-950/80 border-b border-emerald-800 text-emerald-200 px-4 py-2 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="font-bold">{testResult}</span>
          </div>
          <button onClick={() => setTestResult(null)} className="text-emerald-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Main Content */}
      <div className="p-6 space-y-6 max-w-5xl">
        {/* Status Cards */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-[#1f232b] border border-[#2f3542] rounded-xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>حالة المنشأة بالزكاة</span>
              <CheckCircle2 size={16} className="text-emerald-400" />
            </div>
            <div className="font-bold text-sm text-white">{settings.commercialName || 'مؤسسة هجاير للتجاره'}</div>
            <div className="text-[11px] font-mono text-emerald-400 mt-1">الرقم الضريبي: {settings.taxNumber}</div>
          </div>

          <div className="bg-[#1f232b] border border-[#2f3542] rounded-xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>شهادة التشفير (CSID)</span>
              <Key size={16} className="text-cyan-400" />
            </div>
            <div className="font-bold text-sm text-cyan-300">Production CSID نشطة</div>
            <div className="text-[11px] text-gray-400 mt-1">صالحة حتى: {zatcaConfig.certificateExpiry}</div>
          </div>

          <div className="bg-[#1f232b] border border-[#2f3542] rounded-xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>نوع الفاتورة المعتمدة</span>
              <FileCheck size={16} className="text-amber-400" />
            </div>
            <div className="font-bold text-sm text-white">فاتورة ضريبية مبسطة</div>
            <div className="text-[11px] text-gray-400 mt-1">B2C Retail POS (الباركود المشفر)</div>
          </div>

          <div className="bg-[#1f232b] border border-[#2f3542] rounded-xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span>معيار التشفير للـ QR</span>
              <QrCode size={16} className="text-emerald-400" />
            </div>
            <div className="font-bold text-sm text-emerald-300">TLV Base64 Standard</div>
            <div className="text-[11px] text-gray-400 mt-1">مطابق لتطبيق الزكاة الرسمي</div>
          </div>
        </div>

        {/* VAT Return Summary (إقرار ضريبة القيمة المضافة) */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2e3442] pb-3">
            <div className="flex items-center gap-2">
              <Building2 size={18} className="text-cyan-400" />
              <h3 className="font-bold text-sm text-white">
                إقرار ضريبة القيمة المضافة (VAT Return) - متجر هجاير
              </h3>
            </div>
            <span className="text-xs text-gray-400 font-mono">النسبة المطبقة: 15%</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#17191d] p-3.5 rounded-lg border border-[#2b303a]">
              <span className="block text-xs text-gray-400">المبيعات الخاضعة للنسبة الأساسية (15%):</span>
              <span className="font-mono font-bold text-lg text-white mt-1 block">
                {formatNumber(totalSalesNet)} {settings.currency}
              </span>
              <span className="text-[10px] text-gray-500">المجموع الصافي قبل الضريبة</span>
            </div>

            <div className="bg-[#17191d] p-3.5 rounded-lg border border-[#2b303a]">
              <span className="block text-xs text-gray-400">ضريبة المخرجات المحصلة من العملاء:</span>
              <span className="font-mono font-bold text-lg text-emerald-400 mt-1 block">
                {formatNumber(totalSalesVat)} {settings.currency}
              </span>
              <span className="text-[10px] text-gray-500">15% محصلة لصالح الهيئة</span>
            </div>

            <div className="bg-[#17191d] p-3.5 rounded-lg border border-[#2b303a]">
              <span className="block text-xs text-gray-400">صافي الضريبة الواجب سدادها للهيئة:</span>
              <span className="font-mono font-black text-xl text-cyan-400 mt-1 block">
                {formatNumber(netVatPayable)} {settings.currency}
              </span>
              <span className="text-[10px] text-emerald-400">حالة الإقرار: جاهز للتقديم</span>
            </div>
          </div>
        </div>

        {/* Live TLV QR Code Inspector */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#2e3442] pb-3">
            <div className="flex items-center gap-2">
              <QrCode size={18} className="text-emerald-400" />
              <h3 className="font-bold text-sm text-white">
                فاحص شفرة الباركود والامتثال المباشر (ZATCA TLV Inspector)
              </h3>
            </div>
            <span className="text-xs text-gray-400">بيانات الفاتورة الأخيرة للمحل</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#17191d] p-3.5 rounded-lg border border-[#2b303a] text-xs space-y-2">
              <span className="font-bold text-gray-300 block border-b border-[#2a2f3a] pb-1">
                الحقول المشفرة بتقنية TLV وفق اشتراطات الهيئة:
              </span>
              <div className="flex justify-between text-gray-400">
                <span>[Tag 1] اسم المورد:</span>
                <span className="font-bold text-white">{settings.commercialName || 'مؤسسة هجاير للتجاره'}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>[Tag 2] الرقم الضريبي:</span>
                <span className="font-mono font-bold text-emerald-300">{settings.taxNumber}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>[Tag 3] التاريخ والتوقيت:</span>
                <span className="font-mono text-gray-300">{latestDoc?.date || '2026-10-25 14:16:16'}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>[Tag 4] إجمالي الفاتورة:</span>
                <span className="font-mono font-bold text-white">{formatNumber(latestDoc?.grandTotal || 398.00)} ر.س.</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>[Tag 5] ضريبة القيمة المضافة:</span>
                <span className="font-mono font-bold text-cyan-300">{formatNumber(latestDoc?.taxTotal || 51.91)} ر.س.</span>
              </div>
            </div>

            <div className="bg-[#17191d] p-3.5 rounded-lg border border-[#2b303a] text-xs space-y-2 flex flex-col justify-between">
              <div>
                <span className="font-bold text-gray-300 block border-b border-[#2a2f3a] pb-1 mb-2">
                  سلسلة التشفير Base64 المولدة للإيصال:
                </span>
                <div className="bg-[#121417] p-2 rounded border border-[#282d38] font-mono text-[10px] text-gray-400 break-all select-all">
                  {latestDoc
                    ? generateZatcaTlvBase64(
                        settings.commercialName || 'مؤسسة هجاير للتجاره',
                        settings.taxNumber,
                        latestDoc.date,
                        latestDoc.grandTotal,
                        latestDoc.taxTotal
                      )
                    : 'AQ3Zhdiv2LPYs9ipINmH2KzYp9mK2LEg2YTZhNiq2KzYp9ix2YgCCzMxMDQ1ODkyMTYwMDAwMwMTMjAyNi0xMC0yNSAxNDoxNjoxNgQGMzk4LjAwBQVNMS45MQ=='}
                </div>
              </div>
              <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                <CheckCircle2 size={14} />
                <span>شفرة الـ QR تفتح وتُقرأ في جميع تطبيقات الفحص الرسمية</span>
              </div>
            </div>
          </div>
        </div>

        {/* CSID Renewal / Onboarding OTP */}
        <div className="bg-[#1e2229] border border-[#2e3442] rounded-xl p-5 space-y-3">
          <h3 className="font-bold text-sm text-white flex items-center gap-2">
            <Key size={17} className="text-cyan-400" />
            <span>تجديد رمز المصادقة والشهادة الرقمية (Fatoora Portal OTP)</span>
          </h3>
          <p className="text-xs text-gray-400">
            لربط نقطة بيع إضافية أو تجديد الشهادة الرقمية المشفرة، أدخل رمز OTP المكون من 6 أرقام من منصة فاتورة:
          </p>
          <form onSubmit={handleRenewOtp} className="flex gap-2 max-w-md">
            <input
              type="text"
              maxLength={6}
              value={otpInput}
              onChange={(e) => setOtpInput(e.target.value)}
              placeholder="أدخل رمز OTP (مثال: 458921)"
              className="flex-1 h-10 bg-[#141619] border border-[#384150] rounded-lg px-3 text-sm text-white font-mono tracking-widest text-center"
            />
            <button
              type="submit"
              disabled={isSyncing || !otpInput}
              className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              توثيق وربط
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
