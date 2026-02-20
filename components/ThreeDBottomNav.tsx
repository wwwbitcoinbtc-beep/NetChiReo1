import React from 'react';
import { motion } from 'framer-motion';
import { Home, User, Users, Palette } from 'lucide-react';
import { AppView, UserRole } from '../types';

interface Props {
  currentView: AppView;
  onChangeView: (view: AppView) => void;
  userRole: UserRole | null;
}

export const ThreeDBottomNav: React.FC<Props> = ({ currentView, onChangeView, userRole }) => {
  
  const navItems = [
    { id: AppView.HOME, icon: Home, label: 'خانه' },
    { id: AppView.PROFILE, icon: User, label: 'پروفایل' },
    { id: AppView.DESIGN, icon: Palette, label: 'طراحی' },
  ];

  // If user is a Provider (Cafe Net), insert the Admin/Users tab in the middle
  if (userRole === UserRole.PROVIDER) {
    navItems.splice(2, 0, { id: AppView.USERS, icon: Users, label: 'پنل مدیریت' });
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-center items-end z-50 pointer-events-none">
      <div className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-glass rounded-3xl px-6 py-4 flex items-center gap-8 md:gap-12 pointer-events-auto transition-all duration-300 hover:scale-105">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className="relative group flex flex-col items-center justify-center outline-none"
            >
              <div className="relative">
                {/* 3D Active Indicator Background */}
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 -top-6 -bottom-2 bg-gradient-to-t from-blue-500/20 to-blue-400/5 rounded-xl blur-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Icon Container with 3D animation */}
                <motion.div
                  animate={{
                    y: isActive ? -12 : 0,
                    scale: isActive ? 1.2 : 1,
                    rotateX: isActive ? 10 : 0, // Slight 3D tilt
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className={`
                    relative z-10 p-3 rounded-2xl transition-all duration-300
                    ${isActive 
                      ? 'bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-neon text-white' 
                      : 'text-slate-500 hover:text-blue-500 bg-transparent'
                    }
                  `}
                >
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
              </div>

              {/* Label */}
              <motion.span
                animate={{
                  opacity: isActive ? 1 : 0,
                  y: isActive ? 0 : 10,
                  scale: isActive ? 1 : 0.8
                }}
                className="absolute -bottom-6 text-xs font-bold text-slate-600 whitespace-nowrap"
              >
                {item.label}
              </motion.span>
              
              {/* Reflection/Glow underneath */}
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -bottom-8 w-8 h-2 bg-blue-500/30 blur-lg rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};