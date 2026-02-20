import React, { useState, useEffect } from 'react';
import { ThreeDBottomNav } from './components/ThreeDBottomNav';
import { GlassAuth } from './components/GlassAuth';
import { HeroSection } from './components/HeroSection';
import { ProfileSection } from './components/ProfileSection';
import { UsersManagement } from './components/UsersManagement';
import { DesignSection } from './components/DesignSection';
import { DesktopLayout } from './components/DesktopLayout';
import { AppView, UserRole } from './types';
import { Bell, Menu } from 'lucide-react';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isMobile, setIsMobile] = useState(true);

  // Handle Responsive Check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLoginSuccess = (role: UserRole) => {
    setUserRole(role);
    setIsLoggedIn(true);
    // Redirect Providers to Users panel for better UX, or Home
    if (role === UserRole.PROVIDER) {
        setCurrentView(AppView.USERS);
    } else {
        setCurrentView(AppView.PROFILE); // Default to profile or home
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentView(AppView.HOME);
  };

  const renderContent = () => {
    switch (currentView) {
      case AppView.HOME:
        return <HeroSection />;
      case AppView.PROFILE:
        return <ProfileSection onLogout={handleLogout} />;
      case AppView.USERS:
        return <UsersManagement />;
      case AppView.DESIGN:
        return <DesignSection />;
      default:
        return <HeroSection />;
    }
  };

  // 1. Not Logged In -> Show Auth Screen
  if (!isLoggedIn) {
    return (
      <div className="w-full h-screen bg-[#F8FAFC]">
        <GlassAuth onLogin={handleLoginSuccess} />
      </div>
    );
  }

  // 2. Logged In AND Desktop (Web Mode)
  if (!isMobile) {
    return (
      <DesktopLayout currentView={currentView} onChangeView={setCurrentView} userRole={userRole}>
        {renderContent()}
      </DesktopLayout>
    );
  }

  // 3. Logged In AND Mobile (Android Mode)
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#eef2f6] p-0 md:p-8 font-sans">
      {/* Phone Container Frame for Mobile View */}
      <div className="relative w-full h-[100dvh] bg-[#F8FAFC] shadow-2xl overflow-hidden flex flex-col">
        
        {/* Mobile Top Bar - Native App Feel */}
        <div className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-4 z-20 shrink-0">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                    <span className="font-bold text-lg">N</span>
                </div>
                <div>
                    <h1 className="font-black text-slate-800 text-sm">نت‌چی</h1>
                    <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                        {userRole === UserRole.PROVIDER ? 'پنل مدیریت' : 'نسخه موبایل'}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white" />
                </button>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 p-0.5">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userRole}`} className="w-full h-full rounded-full bg-white" alt="Avatar" />
                </div>
            </div>
        </div>

        {/* Main Content Area - Scrollable */}
        {/* INCREASED PADDING BOTTOM TO pb-40 TO CLEAR NAV BAR */}
        <main className="flex-1 overflow-y-auto no-scrollbar scroll-smooth relative z-0 pb-40">
          <div className="p-4 min-h-full">
            {renderContent()}
          </div>
        </main>

        {/* Bottom Navigation - Only shows when logged in on Mobile */}
        <ThreeDBottomNav 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          userRole={userRole}
        />
        
        {/* Ambient background glow */}
        <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-blue-50/50 to-purple-50/50 pointer-events-none -z-10" />
      </div>
    </div>
  );
};

export default App;