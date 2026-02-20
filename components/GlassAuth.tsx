import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserRole } from '../types';
import { Smartphone, Lock, ArrowRight, CheckCircle2, Clock, User, UserPlus, LogIn, Mail, Key, ShieldAlert, X, Eye, EyeOff, Check } from 'lucide-react';

interface Props {
  onLogin: (role: UserRole) => void;
}

// Custom Toast Component for Beautiful Alerts
const CustomToast = ({ message, type, onClose }: { message: string, type: 'error' | 'success', onClose: () => void }) => (
    <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.8 }}
        className={`absolute top-6 left-6 right-6 z-50 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border flex items-center gap-3 ${
            type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-600' : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-600'
        }`}
    >
        <div className={`p-2 rounded-full ${type === 'error' ? 'bg-red-500' : 'bg-emerald-500'} text-white`}>
            {type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
        </div>
        <span className="flex-1 font-bold text-sm shadow-sm">{message}</span>
        <button onClick={onClose} className="p-1 hover:bg-black/5 rounded-full transition-colors">
            <X size={16} />
        </button>
    </motion.div>
);

export const GlassAuth: React.FC<Props> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CUSTOMER);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp'); // 'otp' or 'password'
  const [step, setStep] = useState<'input' | 'otp_verify'>('input');
  
  // Registration Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  // Login Fields (Password Method)
  const [loginIdentifier, setLoginIdentifier] = useState(''); // Email or Username
  const [loginPassword, setLoginPassword] = useState('');

  // OTP Logic
  const [otpInput, setOtpInput] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(90);

  // System State
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null);

  // Helper to show toast
  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
      setToast({ msg, type });
      setTimeout(() => setToast(null), 4000);
  };

  // --- LOCAL STORAGE HELPERS ---
  const getUsers = (): any[] => {
    const users = localStorage.getItem('netchi_users');
    return users ? JSON.parse(users) : [];
  };

  const saveUserToStorage = (user: any) => {
    const users = getUsers();
    users.push(user);
    localStorage.setItem('netchi_users', JSON.stringify(users));
  };
  
  const setCurrentSession = (user: any) => {
      localStorage.setItem('netchi_current_user', JSON.stringify(user));
  };
  // -----------------------------

  // Improved Username Handler
  const handleUsernameChange = (val: string) => {
      // 1. Check for Persian characters (Arabic/Persian Unicode block)
      if (/[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]/.test(val)) {
          showToast('لطفا کیبورد خود را انگلیسی کنید (فارسی مجاز نیست)', 'error');
          return; // Block input
      }

      // 2. Check for forbidden symbols: . / \
      if (/[/\\.]/.test(val)) {
          showToast('استفاده از نقطه (.) و اسلش (/ \\) مجاز نیست', 'error');
          return; // Block input
      }

      // If valid, update state
      setUsername(val);
  };

  // Password Validation Logic
  const checkPasswordStrength = (pass: string) => {
      return {
          length: pass.length >= 8,
          upper: /[A-Z]/.test(pass),
          lower: /[a-z]/.test(pass),
          number: /[0-9]/.test(pass),
          special: /[!@#$%^&*(),.?":{}|<>]/.test(pass),
      };
  };

  const handleRegister = () => {
      if (!fullName || !username || !email || !phone || !password) {
          showToast('لطفا تمام فیلدها را پر کنید.');
          return;
      }
      
      // Basic length check for username
      if (username.length < 3) {
          showToast('نام کاربری باید حداقل ۳ کاراکتر باشد.');
          return;
      }

      if (phone.length < 10) {
          showToast('شماره موبایل معتبر نیست.');
          return;
      }

      // Strict Password Validation
      const strength = checkPasswordStrength(password);
      if (!Object.values(strength).every(Boolean)) {
          showToast('رمز عبور به اندازه کافی قوی نیست. لطفا موارد ذکر شده را رعایت کنید.', 'error');
          return;
      }

      // ** CHECK DUPLICATES IN LOCAL STORAGE **
      const existingUsers = getUsers();
      if (existingUsers.find(u => u.username === username)) {
          showToast('این نام کاربری قبلا گرفته شده است.', 'error');
          return;
      }
      if (existingUsers.find(u => u.phone === phone)) {
          showToast('این شماره موبایل قبلا ثبت نام کرده است.', 'error');
          return;
      }
      
      // Proceed to OTP for verification
      const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(randomCode);
      setStep('otp_verify');
      setTimeLeft(90);
      setOtpInput('');
  };

  const handleLoginRequest = () => {
      const existingUsers = getUsers();
      const selectedRoleLabel = role === UserRole.CUSTOMER ? 'مشتری' : 'کافی‌نت';

      if (loginMethod === 'otp') {
          if (phone.length < 10) {
              showToast('شماره موبایل وارد شده صحیح نیست.');
              return;
          }
          
          // ** CHECK IF USER EXISTS FOR OTP LOGIN + STRICT ROLE CHECK **
          // First, check if user exists at all
          const userAnyRole = existingUsers.find(u => u.phone === phone);
          
          if (!userAnyRole) {
              showToast('کاربری با این شماره موبایل یافت نشد. لطفا ابتدا ثبت نام کنید.', 'error');
              return;
          }

          // STRICT ROLE CHECK
          if (userAnyRole.role !== role) {
               const correctRole = userAnyRole.role === UserRole.CUSTOMER ? 'مشتری' : 'کافی‌نت';
               showToast(`این شماره متعلق به حساب «${correctRole}» است. لطفا از تب بالا نقش را تغییر دهید.`, 'error');
               return;
          }

          const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
          setGeneratedOtp(randomCode);
          setStep('otp_verify');
          setTimeLeft(90);
          setOtpInput('');
      } else {
          // ** PASSWORD LOGIN VERIFICATION + STRICT ROLE CHECK **
          if (!loginIdentifier || !loginPassword) {
              showToast('لطفا نام کاربری و رمز عبور را وارد کنید.');
              return;
          }

          // Find user by credentials
          const user = existingUsers.find(u => 
              (u.username === loginIdentifier || u.email === loginIdentifier) && 
              u.password === loginPassword
          );

          if (!user) {
              showToast('نام کاربری یا رمز عبور اشتباه است.', 'error');
              return;
          }
          
          // STRICT ROLE CHECK
          if (user.role !== role) {
               const correctRole = user.role === UserRole.CUSTOMER ? 'مشتری' : 'کافی‌نت';
               showToast(`شما با نقش «${selectedRoleLabel}» تلاش کردید، اما حساب شما «${correctRole}» است. لطفا نقش را تغییر دهید.`, 'error');
               return;
          }
          
          // Successful Password Login
          setIsLoading(true);
          setTimeout(() => {
              setIsLoading(false);
              showToast(`خوش آمدید ${user.name}`, 'success');
              setCurrentSession(user); // Save session
              setTimeout(() => onLogin(user.role as UserRole), 1000);
          }, 1500);
      }
  };

  const handleOtpVerify = () => {
    if (otpInput !== generatedOtp) {
        showToast("کد تایید اشتباه است.");
        return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
        setIsLoading(false);
        
        let targetUser = null;

        // ** ACTION BASED ON MODE **
        if (authMode === 'register') {
            // Save new user to LocalStorage
            const newUser = {
                id: Date.now().toString(),
                name: fullName,
                username: username,
                email: email,
                phone: phone,
                password: password,
                role: role, // Role selected during registration
                joinDate: new Date().toLocaleDateString('fa-IR'),
                status: 'Active'
            };
            saveUserToStorage(newUser);
            targetUser = newUser;
            showToast('حساب کاربری با موفقیت ساخته شد!', 'success');
        } else {
            showToast('ورود با موفقیت انجام شد!', 'success');
             // Find the user to save session - STRICT ROLE MATCH ALREADY DONE IN PREVIOUS STEP
             const users = getUsers();
             targetUser = users.find(u => u.phone === phone && u.role === role);
        }

        if (targetUser) {
            setCurrentSession(targetUser); // Save session
            setTimeout(() => onLogin(targetUser.role), 500);
        } else {
             // Should not happen if logic is correct
             showToast('خطا در بازیابی اطلاعات کاربر', 'error');
        }
    }, 1500);
  };

  useEffect(() => {
    if (step === 'otp_verify' && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [step, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const toggleAuthMode = () => {
      setAuthMode(prev => prev === 'login' ? 'register' : 'login');
      // Reset states
      setStep('input');
      setToast(null);
  };

  const passwordStrength = checkPasswordStrength(password);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-4 md:p-6 relative overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Background */}
      <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-400/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <motion.div 
        initial={{ opacity: 0, y: 20, rotateX: 10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        className="w-full max-w-lg bg-white/40 backdrop-blur-xl border border-white/60 shadow-glass rounded-[40px] p-6 md:p-8 relative z-10 preserve-3d max-h-[90vh] overflow-y-auto no-scrollbar"
      >
        <AnimatePresence>
            {toast && <CustomToast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        </AnimatePresence>

        {/* Role Switcher - Always Visible */}
        <div className="flex bg-slate-100/50 p-1.5 rounded-full mb-6 relative">
            <div 
                className={`absolute inset-y-1.5 w-[calc(50%-6px)] bg-white shadow-sm rounded-full transition-all duration-300 ease-spring ${role === UserRole.CUSTOMER ? 'right-1.5' : 'right-[50%]'}`}
            />
            <button onClick={() => setRole(UserRole.CUSTOMER)} className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${role === UserRole.CUSTOMER ? 'text-blue-600' : 'text-slate-500'}`}>مشتری</button>
            <button onClick={() => setRole(UserRole.PROVIDER)} className={`flex-1 relative z-10 py-2 text-sm font-bold transition-colors ${role === UserRole.PROVIDER ? 'text-blue-600' : 'text-slate-500'}`}>کافی‌نت</button>
        </div>

        <div className="text-right mb-6">
            <h2 className="text-2xl font-black text-slate-800 mb-2">
                {step === 'otp_verify' ? 'تایید شماره موبایل' : (authMode === 'login' ? 'ورود به حساب' : 'ایجاد حساب کاربری')}
            </h2>
            <p className="text-slate-500 text-sm">
                {step === 'otp_verify' ? `کد ارسال شده به ${phone} را وارد کنید` : 'به دنیای اینترنت پرسرعت خوش آمدید'}
            </p>
        </div>

        <AnimatePresence mode="wait">
            {step === 'input' ? (
                <motion.div
                    key="input"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="space-y-4"
                >
                    {/* Login Method Tabs */}
                    {authMode === 'login' && (
                        <div className="flex justify-start gap-4 mb-4 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
                            <button onClick={() => setLoginMethod('otp')} className={`pb-2 text-sm font-bold transition-all whitespace-nowrap ${loginMethod === 'otp' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
                                ورود با شماره موبایل
                            </button>
                            <button onClick={() => setLoginMethod('password')} className={`pb-2 text-sm font-bold transition-all whitespace-nowrap ${loginMethod === 'password' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-400'}`}>
                                نام کاربری و رمز
                            </button>
                        </div>
                    )}

                    {/* REGISTRATION FORM */}
                    {authMode === 'register' && (
                        <div className="space-y-3">
                            <InputGroup icon={User} placeholder="نام و نام خانوادگی" value={fullName} onChange={setFullName} />
                            <InputGroup 
                                icon={UserPlus} 
                                placeholder="نام کاربری (انگلیسی)" 
                                value={username} 
                                onChange={handleUsernameChange} // Custom handler for validation
                                dir="ltr"
                            />
                            <InputGroup icon={Mail} placeholder="ایمیل" value={email} onChange={setEmail} dir="ltr" />
                            <InputGroup icon={Smartphone} placeholder="شماره موبایل" value={phone} onChange={setPhone} dir="ltr" type="tel" />
                            
                            <div className="relative">
                                <InputGroup icon={Lock} placeholder="رمز عبور" value={password} onChange={setPassword} dir="ltr" type="password" />
                                
                                {/* Password Requirement Checklist */}
                                {password.length > 0 && (
                                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                        <PasswordRequirement satisfied={passwordStrength.length} label="حداقل ۸ کاراکتر" />
                                        <PasswordRequirement satisfied={passwordStrength.upper} label="حرف بزرگ (A-Z)" />
                                        <PasswordRequirement satisfied={passwordStrength.lower} label="حرف کوچک (a-z)" />
                                        <PasswordRequirement satisfied={passwordStrength.number} label="عدد (0-9)" />
                                        <PasswordRequirement satisfied={passwordStrength.special} label="کاراکتر خاص (!@#)" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* LOGIN FORM - OTP */}
                    {authMode === 'login' && loginMethod === 'otp' && (
                        <InputGroup icon={Smartphone} placeholder="شماره موبایل" value={phone} onChange={setPhone} dir="ltr" type="tel" />
                    )}

                    {/* LOGIN FORM - PASSWORD */}
                    {authMode === 'login' && loginMethod === 'password' && (
                        <div className="space-y-3">
                            <InputGroup icon={User} placeholder="نام کاربری یا ایمیل" value={loginIdentifier} onChange={setLoginIdentifier} dir="ltr" />
                            <InputGroup icon={Key} placeholder="رمز عبور" value={loginPassword} onChange={setLoginPassword} type="password" dir="ltr" />
                        </div>
                    )}

                    <button 
                        onClick={authMode === 'register' ? handleRegister : handleLoginRequest}
                        className="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/> : (
                            <>
                                <span>{authMode === 'register' ? 'ثبت نام و دریافت کد' : 'ورود به حساب'}</span>
                                <ArrowRight size={18} className="rotate-180" />
                            </>
                        )}
                    </button>

                    <div className="pt-2 text-center">
                        <button 
                            onClick={toggleAuthMode}
                            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 w-full"
                        >
                            {authMode === 'login' ? (
                                <>
                                    <UserPlus size={16} />
                                    <span>حساب ندارید؟ ثبت نام کنید</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={16} />
                                    <span>حساب دارید؟ وارد شوید</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            ) : (
                /* OTP VERIFICATION STEP */
                <motion.div
                    key="otp"
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -50, opacity: 0 }}
                    className="space-y-4"
                >
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center mb-2">
                        <p className="text-xs text-blue-400 mb-1">کد تایید آزمایشی</p>
                        <p className="text-2xl font-black text-blue-600 tracking-widest font-mono">{generatedOtp}</p>
                    </div>

                    <div className="relative group">
                        <Lock className="absolute right-4 top-3.5 text-slate-400" size={20} />
                        <input 
                            type="text"
                            placeholder="- - - - - -"
                            maxLength={6}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            className="w-full bg-white/50 border border-white/40 focus:border-blue-400 outline-none rounded-2xl py-3 pr-12 pl-4 text-slate-700 transition-all focus:bg-white/80 font-bold text-lg tracking-[0.5em] text-center"
                            dir="ltr"
                        />
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium bg-slate-100/50 py-2 rounded-xl">
                        <Clock size={16} className={timeLeft < 30 ? "text-red-500 animate-pulse" : "text-slate-400"} />
                        <span className={timeLeft < 30 ? "text-red-500" : ""}>
                            {timeLeft > 0 ? `زمان: ${formatTime(timeLeft)}` : 'منقضی شد'}
                        </span>
                    </div>

                    <button 
                        onClick={handleOtpVerify}
                        disabled={isLoading || timeLeft === 0}
                        className="w-full bg-accent hover:bg-emerald-600 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (
                            <>
                                <span>تایید نهایی</span>
                                <CheckCircle2 size={18} />
                            </>
                        )}
                    </button>
                    
                    <button 
                        onClick={() => {
                            if (timeLeft === 0) {
                                const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
                                setGeneratedOtp(randomCode);
                                setTimeLeft(90);
                            } else {
                                setStep('input');
                            }
                        }} 
                        className="w-full text-slate-400 text-xs py-2 hover:text-blue-500"
                    >
                        {timeLeft === 0 ? 'ارسال مجدد کد' : 'ویرایش شماره موبایل'}
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// Reusable Input Component
const InputGroup = ({ icon: Icon, placeholder, value, onChange, type = "text", dir = "rtl" }: any) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordType = type === 'password';
    const inputType = isPasswordType ? (isPasswordVisible ? 'text' : 'password') : type;

    return (
        <div className="relative group">
            <Icon className="absolute right-4 top-3.5 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
                type={inputType}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-white/50 border border-white/40 focus:border-blue-400 outline-none rounded-2xl py-3 pr-12 pl-4 text-slate-700 placeholder:text-slate-400 transition-all focus:bg-white/80 text-right"
                dir={dir}
                style={isPasswordType ? { paddingLeft: '2.5rem' } : {}}
            />
            {isPasswordType && (
                <button 
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    className="absolute left-3 top-3.5 text-slate-400 hover:text-blue-600 transition-colors"
                    type="button"
                >
                    {isPasswordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            )}
        </div>
    );
};

const PasswordRequirement = ({ satisfied, label }: { satisfied: boolean, label: string }) => (
    <div className={`flex items-center gap-1.5 ${satisfied ? 'text-emerald-600' : 'text-slate-400'}`}>
        {satisfied ? <Check size={12} strokeWidth={3} /> : <div className="w-3 h-3 rounded-full border border-slate-300" />}
        <span className="font-medium">{label}</span>
    </div>
);