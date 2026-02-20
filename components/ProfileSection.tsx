import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogOut, Award, Smartphone, Mail, AtSign, Calendar } from 'lucide-react';

interface Props {
  onLogout: () => void;
}

export const ProfileSection: React.FC<Props> = ({ onLogout }) => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const sessionData = localStorage.getItem('netchi_current_user');
    if (sessionData) {
        setUser(JSON.parse(sessionData));
    }
  }, []);

  // Fallback if no user found (shouldn't happen in authenticated state)
  const userData = user || { 
      name: 'کاربر مهمان', 
      username: 'guest', 
      role: 'Customer', 
      phone: '---', 
      email: '---',
      joinDate: '---'
  };

  return (
    <div className="w-full">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center mb-8 pt-4"
      >
        <div className="relative mb-4">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 shadow-2xl shadow-blue-500/40 rotate-3">
                <div className="w-full h-full bg-white rounded-[20px] overflow-hidden flex items-center justify-center">
                    {/* Dynamic Avatar */}
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`} className="w-full h-full object-cover" alt="Profile" />
                </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-2 rounded-xl shadow-lg rotate-12">
                <Award size={20} />
            </div>
        </div>
        <h2 className="text-2xl font-black text-slate-800">{userData.name}</h2>
        <p className="text-slate-500 text-sm font-medium mt-1">
            {userData.role === 'Provider' ? 'مدیر کافی‌نت' : 'کاربر عادی'}
        </p>
      </motion.div>

      {/* User Information Card */}
      <div className="bg-white rounded-3xl shadow-glass border border-white/50 p-6 mb-6">
          <h3 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">اطلاعات حساب کاربری</h3>
          
          <div className="space-y-4">
              <InfoRow icon={AtSign} label="نام کاربری" value={userData.username} />
              <InfoRow icon={Smartphone} label="شماره موبایل" value={userData.phone} />
              <InfoRow icon={Mail} label="ایمیل" value={userData.email} />
              <InfoRow icon={Calendar} label="تاریخ عضویت" value={userData.joinDate || '۱۴۰۲/۰۱/۰۱'} />
          </div>
      </div>

      {/* Menu Options */}
      <div className="space-y-3">
        <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full bg-white hover:bg-slate-50 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-colors"
        >
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-500">
                <Shield size={20} />
            </div>
            <span className="font-bold text-slate-700 text-sm flex-1 text-right">امنیت و رمز عبور</span>
            <div className="w-2 h-2 rounded-full bg-slate-200" />
        </motion.button>
        
        <button 
            onClick={() => {
                localStorage.removeItem('netchi_current_user'); // Clear session
                onLogout();
            }}
            className="w-full mt-8 p-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
        >
            <LogOut size={20} />
            <span>خروج از حساب</span>
        </button>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value }: any) => (
    <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-500">
            <div className="bg-slate-100 p-2 rounded-lg">
                <Icon size={16} />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="font-bold text-slate-700 dir-ltr font-mono text-sm">{value}</span>
    </div>
);