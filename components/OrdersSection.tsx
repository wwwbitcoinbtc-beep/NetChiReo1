import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Edit2, Trash2, Loader, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import ApiClient from '../services/apiClient';

interface Order {
  id: string;
  orderNumber: string;
  description: string;
  amount: number;
  status: string;
  createdAt: string;
  updatedAt?: string;
}

export const OrdersSection: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiClient.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load orders';
      setError(message);
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const statusMap: { [key: string]: { bg: string; text: string; border: string; icon: React.ReactNode; dot: string } } = {
      'Pending': { 
        bg: 'bg-gradient-to-br from-yellow-50 to-orange-50', 
        text: 'text-yellow-700',
        border: 'border-yellow-200',
        icon: <Clock size={16} />,
        dot: 'bg-yellow-500'
      },
      'Confirmed': { 
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50', 
        text: 'text-blue-700',
        border: 'border-blue-200',
        icon: <CheckCircle size={16} />,
        dot: 'bg-blue-500'
      },
      'InProgress': { 
        bg: 'bg-gradient-to-br from-purple-50 to-indigo-50', 
        text: 'text-purple-700',
        border: 'border-purple-200',
        icon: <Zap size={16} />,
        dot: 'bg-purple-500'
      },
      'Completed': { 
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50', 
        text: 'text-green-700',
        border: 'border-green-200',
        icon: <CheckCircle size={16} />,
        dot: 'bg-green-500'
      },
      'Cancelled': { 
        bg: 'bg-gradient-to-br from-red-50 to-pink-50', 
        text: 'text-red-700',
        border: 'border-red-200',
        icon: <AlertCircle size={16} />,
        dot: 'bg-red-500'
      },
    };
    return statusMap[status] || { 
      bg: 'bg-gradient-to-br from-slate-50 to-slate-100', 
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Clock size={16} />,
      dot: 'bg-slate-500'
    };
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 relative overflow-hidden p-6 space-y-8">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl -z-10" />
      
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-4"
      >
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShoppingCart className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900">سفارشات</h1>
              <p className="text-slate-500 font-medium">مدیریت تمام سفارشات شما</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg shadow-lg shadow-blue-500/30 transition-all font-bold text-sm uppercase tracking-wide"
          >
            <Plus size={20} />
            سفارش جدید
          </motion.button>
        </div>
      </motion.div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl text-red-800 flex items-center gap-3 shadow-md"
          >
            <AlertCircle size={20} />
            <div>
              <p className="font-bold">خطا در بارگذاری</p>
              <p className="text-sm opacity-80">{error}</p>
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
              className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center shadow-lg"
            >
              <Loader className="w-8 h-8 text-white" />
            </motion.div>
            <p className="text-slate-600 font-medium">درحال بارگذاری سفارشات...</p>
          </motion.div>
        )}

        {/* Orders Grid */}
        {!loading && orders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {orders.map((order, idx) => {
              const statusConfig = getStatusConfig(order.status);
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + idx * 0.06, duration: 0.5 }}
                  whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                  className={`group relative overflow-hidden rounded-2xl border ${statusConfig.border} shadow-md hover:shadow-xl transition-all duration-300`}
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 ${statusConfig.bg} z-0`} />
                  
                  {/* Content */}
                  <div className="relative z-10 p-6 space-y-4">
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900">{order.orderNumber}</h3>
                          <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">شماره سفارش</p>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        className={`p-3 rounded-xl bg-white/80 backdrop-blur ${statusConfig.text} shadow-sm`}
                      >
                        {statusConfig.icon}
                      </motion.div>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/70 backdrop-blur rounded-lg">
                      <span className={`text-xs font-bold uppercase tracking-wider ${statusConfig.text}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Description */}
                    <div>
                      <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">{order.description}</p>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <motion.div
                        whileHover={{ translateY: -2 }}
                        className="p-3 bg-white/60 backdrop-blur rounded-lg"
                      >
                        <p className="text-xs text-slate-500 font-medium mb-0.5">مبلغ</p>
                        <p className="text-lg font-black text-slate-900">{order.amount.toLocaleString('fa-IR')}</p>
                        <p className="text-xs text-slate-400">تومان</p>
                      </motion.div>
                      <motion.div
                        whileHover={{ translateY: -2 }}
                        className="p-3 bg-white/60 backdrop-blur rounded-lg"
                      >
                        <p className="text-xs text-slate-500 font-medium mb-0.5">تاریخ</p>
                        <p className="text-lg font-bold text-slate-900">{new Date(order.createdAt).toLocaleDateString('fa-IR', { month: 'short', day: 'numeric' })}</p>
                        <p className="text-xs text-slate-400">سال {new Date(order.createdAt).getFullYear()}</p>
                      </motion.div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 pt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-blue-600 bg-blue-50/80 hover:bg-blue-100 rounded-lg transition-colors font-medium text-sm"
                      >
                        <Edit2 size={16} />
                        ویرایش
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-red-600 bg-red-50/80 hover:bg-red-100 rounded-lg transition-colors font-medium text-sm"
                      >
                        <Trash2 size={16} />
                        حذف
                      </motion.button>
                    </div>
                  </div>

                  {/* Highlight Effect */}
                  <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 border-white/50 rounded-2xl pointer-events-none" />
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && orders.length === 0 && !error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl border-2 border-dashed border-slate-300 shadow-lg p-12 text-center bg-gradient-to-br from-white to-slate-50"
          >
            {/* Decorative Background */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/20 rounded-full blur-3xl -z-10" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-100/20 rounded-full blur-3xl -z-10" />
            
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
            >
              <ShoppingCart className="w-10 h-10 text-blue-600" />
            </motion.div>
            
            <h3 className="text-2xl font-black text-slate-900 mb-2">هیچ سفارشی وجود ندارد</h3>
            <p className="text-slate-600 mb-6 text-lg">شروع کنید و یک سفارش جدید ایجاد کنید</p>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 hover:shadow-xl transition-all"
            >
              <Plus size={20} />
              ایجاد سفارش اول
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default OrdersSection;
