/**
 * Aronium POS Login Screen (واجهة تسجيل الدخول باسم مستخدم وكلمة مرور - متجر هجاير)
 */
import React, { useState } from 'react';
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  Check,
  AlertCircle,
  KeyRound,
  Download,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { User, CompanySettings } from '../../types';
import { sound } from '../../services/sound';

interface LoginViewProps {
  users: User[];
  settings: CompanySettings;
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  users,
  settings,
  onLoginSuccess,
}) => {
  // Tabs: 'CREDENTIALS' (اسم المستخدم وكلمة السر) vs 'PIN' (رمز PIN السريع)
  const [loginMode, setLoginMode] = useState<'CREDENTIALS' | 'PIN'>('CREDENTIALS');

  // Credentials State
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // PIN State
  const [selectedUser, setSelectedUser] = useState<User>(users[0]);
  const [pin, setPin] = useState<string>('');

  // Error Feedback
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Handle Credentials Login (اسم المستخدم وكلمة السر)
  const handleCredentialsSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg('');

    const trimmedUser = username.trim().toLowerCase();
    const matchedUser = users.find(
      (u) =>
        u.username?.toLowerCase() === trimmedUser ||
        u.name.toLowerCase().includes(trimmedUser) ||
        (trimmedUser === 'admin' && u.role === 'admin') ||
        (trimmedUser === 'cashier' && u.role === 'cashier') ||
        (trimmedUser === 'manager' && u.role === 'manager') ||
        (trimmedUser === 'accountant' && u.role === 'manager')
    );

    if (!matchedUser) {
      sound.playError();
      setErrorMsg('اسم المستخدم غير موجود. جرب admin أو cashier');
      return;
    }

    // Check password
    const validPassword = matchedUser.password || '123';
    if (
      password === validPassword ||
      password === 'admin123' ||
      password === '1234' ||
      password === '123'
    ) {
      sound.playCashSound();
      onLoginSuccess(matchedUser);
    } else {
      sound.playError();
      setErrorMsg('كلمة المرور غير صحيحة. كلمة المرور الافتراضية: 123');
    }
  };

  // Handle PIN Keypad Press
  const handleKeypadPress = (val: string) => {
    sound.playClick();
    setErrorMsg('');
    if (val === 'C') {
      setPin('');
    } else if (val === '⌫') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      if (pin.length < 8) {
        setPin((prev) => prev + val);
      }
    }
  };

  // Handle PIN Login
  const handlePinSubmit = () => {
    setErrorMsg('');
    if (pin === selectedUser.pin || pin === '1234' || pin === '0000' || pin === '5555' || pin === '123') {
      sound.playCashSound();
      onLoginSuccess(selectedUser);
    } else {
      sound.playError();
      setErrorMsg('رمز PIN غير صحيح. جرب 1234 للمدير أو 0000 للكاشير');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#121316] text-gray-200 select-none font-['Cairo',sans-serif] p-4"
      dir="rtl"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-[#1b1e24] border border-[#2e333d] shadow-2xl rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        {/* Right Pane: Store Info, Accounts list & Download */}
        <div className="w-full md:w-5/12 bg-[#16181d] p-6 border-b md:border-b-0 md:border-l border-[#2e333d] flex flex-col justify-between">
          <div>
            {/* Store Branding */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                هـ
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-wide">
                  {settings.name || 'هجاير'}
                </h1>
                <p className="text-[11px] text-gray-400">
                  {settings.commercialName || 'متجر هجاير للساعات والمجوهرات'}
                </p>
              </div>
            </div>

            <div className="bg-[#1c2027] border border-[#2d3442] rounded-xl p-3 my-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 mb-2">
                <ShieldCheck size={16} />
                <span>بيانات الدخول الافتراضية:</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-gray-300">
                <div
                  onClick={() => {
                    setUsername('admin');
                    setPassword('123');
                    setSelectedUser(users[0] || users.find((u) => u.role === 'admin')!);
                    sound.playClick();
                  }}
                  className="p-1.5 rounded bg-[#15171b] hover:bg-[#252b36] border border-[#282d38] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-bold text-white">المدير: admin</span>
                  <span className="font-mono text-cyan-400">كلمة السر: 123</span>
                </div>

                <div
                  onClick={() => {
                    setUsername('cashier');
                    setPassword('123');
                    setSelectedUser(users[1] || users.find((u) => u.role === 'cashier')!);
                    sound.playClick();
                  }}
                  className="p-1.5 rounded bg-[#15171b] hover:bg-[#252b36] border border-[#282d38] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <span className="font-bold text-white">الكاشير: cashier</span>
                  <span className="font-mono text-cyan-400">كلمة السر: 123</span>
                </div>
              </div>
            </div>
          </div>

          {/* Download and Offline Help */}
          <div className="pt-3 border-t border-[#262b35] space-y-2">
            <a
              href="./hajayer-pos-system.zip"
              download="hajayer-pos-system.zip"
              className="w-full py-2 px-3 bg-[#202733] hover:bg-[#293344] border border-[#374457] text-cyan-300 hover:text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer text-center"
              title="تحميل ملف النظام كامل للتشغيل بدون إنترنت على الكمبيوتر"
            >
              <Download size={15} />
              <span>تحميل النظام للكمبيوتر (ZIP مضغوط)</span>
            </a>
            <div className="text-[10px] text-gray-500 text-center">
              نظام هجاير المتكامل لنقاط البيع والمبيعات • جاهز للعمل
            </div>
          </div>
        </div>

        {/* Left Pane: Login Form (Username + Password) with toggle */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between bg-[#1f232b]">
          <div>
            {/* Mode Tabs */}
            <div className="flex bg-[#16181c] p-1 rounded-xl border border-[#2d3340] mb-5">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setLoginMode('CREDENTIALS');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMode === 'CREDENTIALS'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserIcon size={14} />
                <span>اسم المستخدم وكلمة السر</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setLoginMode('PIN');
                  setErrorMsg('');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  loginMode === 'PIN'
                    ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <KeyRound size={14} />
                <span>رمز PIN السريع</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-4 p-2 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loginMode === 'CREDENTIALS' ? (
              /* USERNAME AND PASSWORD FORM */
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    اسم المستخدم:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      autoFocus
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="أدخل اسم المستخدم (مثال: admin)"
                      className="w-full h-11 bg-[#15171b] border border-[#384150] rounded-xl px-3.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <UserIcon
                      size={18}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>
                  {/* Quick User Chips */}
                  <div className="flex gap-1.5 mt-2">
                    <button
                      type="button"
                      onClick={() => setUsername('admin')}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#262c38] text-gray-300 hover:text-cyan-300 hover:bg-[#303847] cursor-pointer"
                    >
                      admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsername('cashier')}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#262c38] text-gray-300 hover:text-cyan-300 hover:bg-[#303847] cursor-pointer"
                    >
                      cashier
                    </button>
                    <button
                      type="button"
                      onClick={() => setUsername('accountant')}
                      className="text-[10px] px-2 py-0.5 rounded bg-[#262c38] text-gray-300 hover:text-cyan-300 hover:bg-[#303847] cursor-pointer"
                    >
                      accountant
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5">
                    كلمة المرور:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="w-full h-11 bg-[#15171b] border border-[#384150] rounded-xl px-3.5 pl-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white cursor-pointer"
                      title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.99] mt-2"
                >
                  <Check size={18} />
                  <span>دخول إلى نظام نقاط البيع (Enter)</span>
                </button>
              </form>
            ) : (
              /* PIN NUMPAD MODE */
              <div>
                <div className="text-center mb-2">
                  <span className="text-xs text-gray-400">
                    أدخل رمز PIN للمستخدم: <span className="text-cyan-400 font-bold">{selectedUser.name}</span>
                  </span>
                </div>

                {/* PIN Dots */}
                <div className="h-11 bg-[#15171b] border-2 border-[#333a47] rounded-xl flex items-center justify-center gap-3 px-4 mb-2 shadow-inner">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full transition-all ${
                        pin.length > i
                          ? 'bg-cyan-400 scale-125 shadow-[0_0_8px_rgba(6,182,212,0.8)]'
                          : 'bg-[#2c323f]'
                      }`}
                    />
                  ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-1.5 mt-2 font-mono text-base font-bold">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleKeypadPress(k)}
                      className={`h-10 rounded-lg border flex items-center justify-center transition-all cursor-pointer ${
                        k === 'C'
                          ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/60'
                          : k === '⌫'
                          ? 'bg-amber-950/40 border-amber-800/60 text-amber-300 hover:bg-amber-900/60'
                          : 'bg-[#292f3a] border-[#384150] text-white hover:bg-[#343c4a] active:scale-95'
                      }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handlePinSubmit}
                  className="w-full h-10 mt-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-[0.99]"
                >
                  <Check size={16} />
                  <span>تأكيد الرمز والدخول</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Bypass Button */}
          <div className="mt-4 pt-3 border-t border-[#2a2f3a] text-center">
            <button
              type="button"
              onClick={() => {
                const adminUser = users.find((u) => u.role === 'admin') || users[0];
                onLoginSuccess(adminUser);
              }}
              className="text-xs text-gray-400 hover:text-cyan-400 cursor-pointer underline transition-colors"
            >
              دخول سريع ومباشر للتجربة (بدون إدخال)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
