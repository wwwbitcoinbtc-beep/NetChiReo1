import React from 'react';
import { AppView, UserRole } from '../types';
import { Home, User, Zap, Bell, Search, Users } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  userRole: UserRole | null;
  children: React.ReactNode;
}

export const DesktopLayout: React.FC<Props> = ({ currentView, onChangeView, userRole, children }) => {
  const menuItems = [
    { id: AppView.HOME, icon: Home, label: 'داشبورد' },
    { id: AppView.PROFILE, icon: User, label: 'پروفایل کاربری' },
  ];

  // Add "Users Management" only for Providers
  if (userRole === UserRole.PROVIDER) {
      menuItems.push({ id: AppView.USERS, icon: Users, label: 'مدیریت کاربران' });
  }

  return (
    <div className="flex w-full h-screen bg-[#F0F2F5] overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-l border-white/50 shadow-2xl z-20 flex flex-col p-6">
        <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                <Zap size={24} fill="currentColor" />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-800">نت‌چی</h1>
                <span className="text-xs text-slate-400 font-medium tracking-wide">
                    {userRole === UserRole.PROVIDER ? 'PANEL ADMIN' : 'WEB PANEL'}
                </span>
            </div>
        </div>

        <nav className="flex-1 space-y-2">
            {menuItems.map((item) => {
                const isActive = currentView === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onChangeView(item.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group relative overflow-hidden ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}
                    >
                        {isActive && <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-full" />}
                        <item.icon size={22} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                        <span className="font-bold text-sm">{item.label}</span>
                    </button>
                );
            })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm border-b border-white/50">
            <div className="flex items-center gap-4 w-96 bg-white border-none rounded-2xl px-4 py-2.5 shadow-sm">
                <Search size={20} className="text-slate-400" />
                <input type="text" placeholder="جستجو در خدمات..." className="bg-transparent outline-none w-full text-sm placeholder:text-slate-400" />
            </div>

            <div className="flex items-center gap-4">
                <button className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-sm hover:text-blue-600 transition-colors relative">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                </button>
                <div className="flex items-center gap-3 pr-4 border-r border-slate-200">
                    <div className="text-left hidden md:block">
                        <div className="text-sm font-bold text-slate-700">علی محمدی</div>
                        <div className="text-xs text-slate-400">{userRole === UserRole.PROVIDER ? 'مدیر سیستم' : 'کاربر عادی'}</div>
                    </div>
                    <img src="https://picsum.photos/200/200" className="w-10 h-10 rounded-xl object-cover shadow-sm border-2 border-white" alt="Avatar" />
                </div>
            </div>
        </header>

        {/* Dynamic Content Container */}
        <div className="flex-1 overflow-y-auto p-8 relative">
             {/* Use React.Children to inject styling or just render */}
             <motion.div
                key={currentView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
             >
                 {children}
             </motion.div>
        </div>
      </main>
    </div>
  );
};