import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Printer, Coffee, Gamepad2, 
  Home, User, Bell, Clock, CreditCard, 
  Scan, Wallet, Zap, X, ChevronLeft,
  CheckCircle2, AlertCircle, LogOut, Menu
} from 'lucide-react';
import Auth from './components/NewAuth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const notifications = [
    { id: 1, title: 'سیستم ۰۵ رزرو شد', time: '۱۰ دقیقه پیش', type: 'success', read: false },
    { id: 2, title: 'موجودی شما رو به اتمام است', time: '۱ ساعت پیش', type: 'warning', read: true },
    { id: 3, title: 'تخفیف ۵۰٪ آخر هفته', time: 'دیروز', type: 'info', read: true },
  ];

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setActiveTab('home');
  };

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab setActiveTab={setActiveTab} />;
      case 'reserve': return <ReserveTab />;
      case 'console': return <ConsoleTab />;
      case 'deposit': return <DepositTab />;
      case 'profile': return <ProfileTab user={user} onLogout={handleLogout} />;
      default: return <HomeTab setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-slate-100 overflow-hidden font-sans text-slate-800" dir="rtl">
      
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden lg:flex w-72 bg-white shadow-[8px_0_24px_rgba(0,0,0,0.02)] flex-col z-20 relative">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
            <Coffee size={20} />
          </div>
          <h1 className="text-xl font-bold text-slate-800">کافی‌نت پلاس</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <DesktopNavItem icon={<Home size={20} />} label="پیشخوان" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <DesktopNavItem icon={<Monitor size={20} />} label="رزرو سیستم" active={activeTab === 'reserve'} onClick={() => setActiveTab('reserve')} />
          <DesktopNavItem icon={<Gamepad2 size={20} />} label="کنسول بازی" active={activeTab === 'console'} onClick={() => setActiveTab('console')} />
          <DesktopNavItem icon={<Wallet size={20} />} label="افزایش موجودی" active={activeTab === 'deposit'} onClick={() => setActiveTab('deposit')} />
          <DesktopNavItem icon={<User size={20} />} label="پروفایل کاربری" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={() => setActiveTab('deposit')}
            className="w-full py-3 rounded-xl bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2"
          >
            <Zap size={18} className="fill-indigo-600" />
            شارژ سریع
          </button>
        </div>
      </aside>

      {/* --- Mobile Sidebar --- */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-0 w-72 h-full bg-white shadow-2xl flex flex-col z-40 lg:hidden">
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                <h1 className="text-lg font-bold">کافی‌نت پلاس</h1>
                <button onClick={() => setSidebarOpen(false)} className="text-slate-400"><X size={24} /></button>
              </div>
              <nav className="flex-1 p-4 space-y-2">
                <MobileNavItem icon={<Home size={20} />} label="پیشخوان" active={activeTab === 'home'} onClick={() { setActiveTab('home'); setSidebarOpen(false); }} />
                <MobileNavItem icon={<Monitor size={20} />} label="رزرو سیستم" active={activeTab === 'reserve'} onClick={() { setActiveTab('reserve'); setSidebarOpen(false); }} />
                <MobileNavItem icon={<Gamepad2 size={20} />} label="کنسول بازی" active={activeTab === 'console'} onClick={() { setActiveTab('console'); setSidebarOpen(false); }} />
                <MobileNavItem icon={<Wallet size={20} />} label="افزایش موجودی" active={activeTab === 'deposit'} onClick={() { setActiveTab('deposit'); setSidebarOpen(false); }} />
                <MobileNavItem icon={<User size={20} />} label="پروفایل کاربری" active={activeTab === 'profile'} onClick={() { setActiveTab('profile'); setSidebarOpen(false); }} />
              </nav>
              <div className="p-4 border-t space-y-2">
                <button onClick={() => handleLogout()} className="w-full py-2 rounded-lg bg-red-50 text-red-600 font-bold hover:bg-red-100 flex items-center justify-center gap-2">
                  <LogOut size={18} /> خروج
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50/50">
        
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-4 sm:px-8 py-4 flex justify-between items-center z-30 sticky top-0">
          <div className="flex items-center gap-3 lg:hidden">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-slate-100">
              <Menu size={24} />
            </button>
          </div>
          
          <div className="hidden lg:block flex-1">
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'home' && 'پیشخوان'}
              {activeTab === 'deposit' && 'افزایش موجودی'}
              {activeTab === 'reserve' && 'رزرو سیستم'}
              {activeTab === 'console' && 'کنسول بازی'}
              {activeTab === 'profile' && 'پروفایل کاربری'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative"
              >
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-slate-100"></span>
              </button>

              {/* Notifications */}
              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden" onClick={() => setShowNotifications(false)} />
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-screen sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                        <h3 className="font-bold text-slate-800">اعلان‌ها</h3>
                        <button onClick={() => setShowNotifications(false)} className="lg:hidden text-slate-400"><X size={20} /></button>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map(notif => (
                          <div key={notif.id} className={`p-4 border-b border-slate-50 hover:bg-slate-50 flex gap-3 ${!notif.read ? 'bg-indigo-50/30' : ''}`}>
                            <div className="mt-0.5">
                              {notif.type === 'success' && <CheckCircle2 size={18} className="text-emerald-500" />}
                              {notif.type === 'warning' && <AlertCircle size={18} className="text-rose-500" />}
                              {notif.type === 'info' && <Bell size={18} className="text-indigo-500" />}
                            </div>
                            <div>
                              <p className={`text-sm ${!notif.read ? 'font-bold' : 'text-slate-600'}`}>{notif.title}</p>
                              <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <button onClick={() => handleLogout()} className="p-2.5 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors hidden sm:block" title="خروج">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>

        {/* Mobile Bottom Nav */}
        <nav className="lg:hidden bg-white border-t border-slate-200 p-3 flex justify-around sticky bottom-0 z-20">
          {[
            { id: 'home', icon: Home, label: 'پیشخوان' },
            { id: 'reserve', icon: Monitor, label: 'رزرو' },
            { id: 'deposit', icon: Wallet, label: 'شارژ' },
            { id: 'profile', icon: User, label: 'حساب' }
          ].map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-colors ${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400'}`}
            >
              <item.icon size={24} />
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </nav>
      </main>
    </div>
  );
}

// Components
const DesktopNavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
      active ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const HomeTab = ({ setActiveTab }: any) => (
  <div className="p-4 sm:p-8 space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[
        { icon: Monitor, label: 'سیستم‌های کامپیوتر', color: 'indigo', count: 12, active: 8 },
        { icon: Printer, label: 'پرینتر‌ها', color: 'purple', count: 5, active: 3 },
        { icon: Gamepad2, label: 'کنسول‌های بازی', color: 'pink', count: 4, active: 2 }
      ].map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-lg transition-all cursor-pointer`} onClick={() => setActiveTab('reserve')}>
          <div className={`w-12 h-12 rounded-xl bg-${item.color}-100 text-${item.color}-600 flex items-center justify-center mb-3`}>
            <item.icon size={24} />
          </div>
          <h3 className="font-bold text-slate-800 mb-2">{item.label}</h3>
          <p className={`text-sm text-${item.color}-600`}>{item.active} از {item.count} در حال استفاده</p>
        </motion.div>
      ))}
    </div>

    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
      <h3 className="text-2xl font-bold mb-2">خوش آمدید!</h3>
      <p className="text-white/80">موجودی شما: <span className="font-bold text-lg">۵۰,۰۰۰ تومان</span></p>
    </motion.div>
  </div>
);

const ReserveTab = () => (
  <div className="p-4 sm:p-8">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-xl text-slate-800 mb-4">رزرو سیستم</h3>
      <p className="text-slate-600">سیستم‌های موجود برای رزرو آماده است.</p>
    </div>
  </div>
);

const ConsoleTab = () => (
  <div className="p-4 sm:p-8">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-xl text-slate-800 mb-4">کنسول‌های بازی</h3>
      <p className="text-slate-600">لیست کنسول‌های بازی در دسترس.</p>
    </div>
  </div>
);

const DepositTab = () => (
  <div className="p-4 sm:p-8">
    <div className="bg-white rounded-2xl border border-slate-200 p-6">
      <h3 className="font-bold text-xl text-slate-800 mb-4">افزایش موجودی</h3>
      <div className="space-y-3">
        {[10000, 20000, 50000, 100000].map((amount) => (
          <button key={amount} className="w-full p-4 border-2 border-slate-200 rounded-xl hover:border-indigo-600 hover:bg-indigo-50 transition-all text-slate-800 font-bold">
            {amount.toLocaleString('fa-IR')} تومان
          </button>
        ))}
      </div>
    </div>
  </div>
);

const ProfileTab = ({ user, onLogout }: any) => (
  <div className="p-4 sm:p-8">
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-slate-200 p-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold">
          {user?.name?.charAt(0)}
        </div>
        <div>
          <h3 className="font-bold text-xl text-slate-800">{user?.name}</h3>
          <p className="text-slate-500">{user?.phone}</p>
        </div>
      </div>
      <div className="border-t border-slate-200 pt-6 space-y-4">
        <div className="flex justify-between">
          <span className="text-slate-600">نقش کاربری</span>
          <span className="font-bold text-slate-800">{user?.role}</span>
        </div>
        <button onClick={onLogout} className="w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold hover:bg-red-100 transition-colors">خروج از حساب</button>
      </div>
    </motion.div>
  </div>
);