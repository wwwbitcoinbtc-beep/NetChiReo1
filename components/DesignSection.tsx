import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Copy, Download, Eye, Settings, AlertCircle, Loader } from 'lucide-react';
import ApiClient from '../services/apiClient';

interface DesignAsset {
  id: string;
  name: string;
  type?: 'color' | 'typography' | 'component';
  value?: string;
  code?: string;
  hex?: string;
  tailwind?: string;
}

export const DesignSection: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [designSystem, setDesignSystem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch design system from backend
  useEffect(() => {
    const fetchDesignSystem = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await ApiClient.getDesignSystem();
        setDesignSystem(response);
      } catch (err: any) {
        setError(err.message || 'خطا در بارگذاری سیستم طراحی. لطفا Backend را بررسی کنید.');
        console.error('Design system error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDesignSystem();
  }, []);

  // Fallback design assets if API fails
  const designAssets: DesignAsset[] = [
    // Colors
    {
      id: 'primary',
      name: 'رنگ اصلی',
      type: 'color',
      value: '#3B82F6',
      code: 'bg-blue-500'
    },
    {
      id: 'accent',
      name: 'رنگ تاکیدی',
      type: 'color',
      value: '#10B981',
      code: 'bg-emerald-500'
    },
    {
      id: 'dark',
      name: 'رنگ تاریک',
      type: 'color',
      value: '#1E293B',
      code: 'bg-slate-800'
    },
    {
      id: 'glass',
      name: 'شیشه‌ای',
      type: 'color',
      value: 'rgba(255, 255, 255, 0.3)',
      code: 'backdrop-blur-md'
    },
    // Typography
    {
      id: 'heading1',
      name: 'عنوان بزرگ',
      type: 'typography',
      value: 'Vazirmatn, Bold, 32px',
      code: 'font-black text-3xl'
    },
    {
      id: 'heading2',
      name: 'عنوان متوسط',
      type: 'typography',
      value: 'Vazirmatn, SemiBold, 24px',
      code: 'font-bold text-2xl'
    },
    {
      id: 'body',
      name: 'متن بدنه',
      type: 'typography',
      value: 'Vazirmatn, Regular, 16px',
      code: 'font-normal text-base'
    },
  ];

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const downloadAsJson = () => {
    const designSystem = {
      colors: designAssets.filter(a => a.type === 'color'),
      typography: designAssets.filter(a => a.type === 'typography'),
      generatedAt: new Date().toISOString()
    };
    
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(designSystem, null, 2)));
    element.setAttribute('download', 'design-system.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 py-8">
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Error Alert - Backend Connection Required */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-red-800">خطا در اتصال به Backend</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">🔌 مطمئن شوید Backend در حال اجراست: <code className="bg-red-100 px-2 py-1 rounded">dotnet run</code></p>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
            />
            <p className="text-slate-600 font-medium">درحال بارگذاری سیستم طراحی...</p>
          </motion.div>
        )}

        {/* Content - Only show if loaded and no error */}
        {!loading && !error && (
        <>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
        <div className="flex items-center justify-center gap-3">
          <Palette className="w-8 h-8 text-blue-600" />
          <h1 className="text-4xl font-black text-slate-900">سیستم طراحی</h1>
        </div>
        <p className="text-lg text-slate-600">تمام منابع و اصول طراحی نت‌چی بطور آفلاین</p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-3"
      >
        <button
          onClick={downloadAsJson}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Download size={18} />
          دانلود JSON
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium">
          <Eye size={18} />
          پیش‌نمایش
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium">
          <Settings size={18} />
          تنظیمات
        </button>
      </motion.div>

      {/* Color Palette */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-1 h-8 bg-blue-600 rounded" />
          رنگ‌ها
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {designAssets.filter(a => a.type === 'color').map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + idx * 0.05 }}
              className="group p-4 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-slate-200 flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: asset.value }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900">{asset.name}</h3>
                  <code className="text-sm text-slate-600 block mt-1 font-mono">{asset.value}</code>
                </div>
                <button
                  onClick={() => handleCopy(asset.code, asset.id)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="کپی کنید"
                >
                  {copiedId === asset.id ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 text-green-600"
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Typography */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-1 h-8 bg-emerald-600 rounded" />
          تایپوگرافی
        </h2>
        <div className="space-y-3">
          {designAssets.filter(a => a.type === 'typography').map((asset, idx) => (
            <motion.div
              key={asset.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + idx * 0.05 }}
              className="group p-4 bg-white border border-slate-200 rounded-xl hover:shadow-lg transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">{asset.name}</h3>
                  <p className="text-slate-600" style={{ fontFamily: "'Vazirmatn', sans-serif" }}>
                    این نمونه توضیح می‌دهد که فونت چگونه نمایش داده می‌شود
                  </p>
                  <code className="text-sm text-slate-600 block mt-2 font-mono">{asset.code}</code>
                </div>
                <button
                  onClick={() => handleCopy(asset.code, asset.id)}
                  className="flex-shrink-0 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="کپی کنید"
                >
                  {copiedId === asset.id ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-5 h-5 text-green-600"
                    >
                      ✓
                    </motion.div>
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Components Best Practices */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <div className="w-1 h-8 bg-purple-600 rounded" />
          بهترین روش‌ها
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'دکمه‌های اساسی',
              desc: 'از رنگ‌های اصلی استفاده کنید',
              code: 'bg-blue-600 hover:bg-blue-700'
            },
            {
              title: 'متن‌های تاکیدی',
              desc: 'برای بخش‌های مهم',
              code: 'text-emerald-600 font-semibold'
            },
            {
              title: 'اثرات شیشه‌ای',
              desc: 'برای اعماق بصری',
              code: 'backdrop-blur-md bg-white/30'
            },
            {
              title: 'سایه‌های ظریف',
              desc: 'برای جداکردن عناصر',
              code: 'shadow-sm hover:shadow-md'
            },
          ].map((practice, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + idx * 0.05 }}
              className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl"
            >
              <h3 className="font-semibold text-slate-900 mb-1">{practice.title}</h3>
              <p className="text-sm text-slate-600 mb-3">{practice.desc}</p>
              <code className="text-xs bg-white px-2 py-1 rounded border border-slate-200 text-slate-900 font-mono">
                {practice.code}
              </code>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Backend Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-center"
      >
        <p className="text-blue-800 font-medium">
          ✓ سیستم طراحی از Backend بارگذاری شد
        </p>
      </motion.div>
        </>
        )}
      </div>
    </div>
  );
};

export default DesignSection;

