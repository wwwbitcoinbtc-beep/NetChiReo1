import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, User, Phone, Lock, KeyRound, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Auth({ onLogin }: { onLogin: (user: any) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  
  // Form states
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState('');

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !username || !password) {
      alert('لطفا تمامی فیلدها را پر کنید');
      return;
    }
    setStep('verify');
    // Simulate sending OTP
    setTimeout(() => alert('کد تایید تستی: 12345'), 500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'password') {
      if (!username || !password) {
        alert('نام کاربری و رمز عبور را وارد کنید');
        return;
      }
      onLogin({ name: 'علی محمدی', phone: '۰۹۱۲۳۴۵۶۷۸۹', role: 'VIP' });
    } else {
      if (!phone) {
        alert('شماره موبایل را وارد کنید');
        return;
      }
      setStep('verify');
      setTimeout(() => alert('کد تایید تستی: 12345'), 500);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '12345') {
      const name = mode === 'register' ? `${firstName} ${lastName}` : 'علی محمدی';
      const userPhone = phone || '۰۹۱۲۳۴۵۶۷۸۹';
      onLogin({ name, phone: userPhone, role: 'کاربر عادی' });
    } else {
      alert('کد وارد شده اشتباه است');
    }
  };

  return (
    <div className="h-screen w-full bg-slate-100 font-sans text-slate-800 overflow-y-auto overflow-x-hidden relative" dir="rtl">
      {/* Background Elements */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex items-center justify-center min-h-full p-4 sm:p-8 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border border-white p-6 sm:p-8 relative z-10"
        >
          <div className="flex flex-col items-center mb-6 sm:mb-8">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg mb-3 sm:mb-4">
              <Coffee size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-800">کافی‌نت پلاس</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {step === 'verify' ? 'تایید شماره موبایل' : mode === 'login' ? 'ورود به حساب کاربری' : 'ثبت‌نام حساب جدید'}
            </p>
          </div>

        <AnimatePresence mode="wait">
          {step === 'verify' ? (
            <motion.form 
              key="verify"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleVerifyOtp}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <p className="text-sm text-slate-600">کد تایید ۵ رقمی به شماره <span className="font-bold" dir="ltr">{phone}</span> ارسال شد.</p>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">کد تایید</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="12345"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-center text-2xl tracking-widest font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    dir="ltr"
                    maxLength={5}
                  />
                  <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  type="button"
                  onClick={() => setStep('form')}
                  className="px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                >
                  <ArrowRight size={20} />
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
                >
                  تایید و ورود
                </button>
              </div>
            </motion.form>
          ) : mode === 'login' ? (
            <motion.form 
              key="login"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleLoginSubmit}
              className="space-y-5"
            >
              <div className="flex p-1 bg-slate-100 rounded-xl mb-4 sm:mb-6">
                <button 
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  نام کاربری و رمز
                </button>
                <button 
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  رمز یکبار مصرف
                </button>
              </div>

              {loginMethod === 'password' ? (
                <>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">نام کاربری</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="نام کاربری خود را وارد کنید"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        dir="ltr"
                      />
                      <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">رمز عبور</label>
                    <div className="relative">
                      <input 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="رمز عبور خود را وارد کنید"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        dir="ltr"
                      />
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">شماره موبایل</label>
                  <div className="relative">
                    <input 
                      type="tel" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="09123456789"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      dir="ltr"
                    />
                    <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                  </div>
                </div>
              )}

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>ورود به حساب</span>
                <ArrowRight size={20} className="rotate-180" />
              </button>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-center text-xs text-slate-500 mb-3">حساب کاربری ندارید؟</p>
                <button 
                  type="button"
                  onClick={() => { setMode('register'); setStep('form'); }}
                  className="w-full py-2.5 rounded-xl border-2 border-indigo-200 text-indigo-600 font-bold hover:bg-indigo-50 transition-colors"
                >
                  ثبت‌نام کاربر جدید
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.form 
              key="register"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={handleRegisterSubmit}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نام</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="نام"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">نام خانوادگی</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="نام خانوادگی"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">شماره موبایل</label>
                <div className="relative">
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09123456789"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">نام کاربری</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="نام کاربری منحصر به فرد"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <User className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">رمز عبور</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="رمز عبور قوی (حداقل ۶ حرف)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 pr-12 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    dir="ltr"
                  />
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3.5 rounded-xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
              >
                <span>ادامه و تایید شماره</span>
                <ArrowRight size={20} className="rotate-180" />
              </button>

              <div className="pt-4 border-t border-slate-200">
                <button 
                  type="button"
                  onClick={() => { setMode('login'); setStep('form'); }}
                  className="w-full py-2.5 text-indigo-600 font-bold text-center hover:text-indigo-700 transition-colors"
                >
                  حساب کاربری دارید؟ وارد شوید
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
