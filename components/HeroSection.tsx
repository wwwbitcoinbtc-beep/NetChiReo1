import React from 'react';
import { motion } from 'framer-motion';
import { Wifi, MapPin, Clock } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="w-full">
      {/* Mobile-only visual greeting (optional, since we now have a top bar) */}
      <div className="mb-6 md:hidden">
         <h2 className="text-2xl font-black text-slate-800">سلام، خوش اومدی! 👋</h2>
         <p className="text-slate-500 text-sm">امروز چه کاری میخوای انجام بدی؟</p>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Hero Card */}
        <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-full aspect-[4/3] md:aspect-[3/1] bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[32px] p-6 md:p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/30 mb-8 preserve-3d group"
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:translate-x-1/3 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-400/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/3 group-hover:-translate-x-1/4 transition-transform duration-700" />
            
            <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                    <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-medium mb-3 border border-white/20">
                        نسخه جدید ۲.۰
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight mb-2">
                        سریع‌ترین راه<br/>پیدا کردن کافی‌نت
                    </h2>
                </div>
                
                <div className="flex gap-4 md:w-1/2 lg:w-1/3">
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                        <Clock size={20} className="mb-2 text-cyan-300" />
                        <div className="text-xl font-bold">۲۴/۷</div>
                        <div className="text-[10px] opacity-80">سرویس دهی</div>
                    </div>
                    <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10 hover:bg-white/20 transition-colors">
                        <MapPin size={20} className="mb-2 text-pink-300" />
                        <div className="text-xl font-bold">۱۵۰+</div>
                        <div className="text-[10px] opacity-80">شعبه فعال</div>
                    </div>
                </div>
            </div>
            
            {/* Desktop Decoration Image */}
            <img 
                src="https://picsum.photos/200/200" 
                className="absolute left-10 top-1/2 -translate-y-1/2 w-48 h-48 rounded-2xl shadow-2xl -rotate-6 opacity-90 hidden md:block border-4 border-white/20 backdrop-blur-md" 
                alt="Decoration"
            />
        </motion.div>

        {/* Categories / Actions */}
        <h3 className="font-bold text-slate-800 text-lg mb-4">خدمات ویژه</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { title: 'ثبت نام کنکور', icon: Wifi, color: 'bg-orange-500' },
                { title: 'انتخاب واحد', icon: MapPin, color: 'bg-purple-500' },
                { title: 'خدمات ارزی', icon: Clock, color: 'bg-emerald-500' },
                { title: 'پرینت آنلاین', icon: Zap, color: 'bg-rose-500', isIconComp: true }
            ].map((item, idx) => (
                <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 flex md:flex-col items-center md:items-start gap-4 hover:shadow-lg transition-all cursor-pointer group hover:-translate-y-1"
                >
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl ${item.color} flex items-center justify-center text-white shadow-lg shadow-gray-200 group-hover:scale-110 transition-transform duration-300`}>
                       <item.icon size={24} />
                    </div>
                    <span className="font-bold text-slate-700 text-sm md:text-base">{item.title}</span>
                </motion.div>
            ))}
        </div>
      </div>
    </div>
  );
};

// Quick helper for icon
const Zap = ({ size, className }: { size: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
);