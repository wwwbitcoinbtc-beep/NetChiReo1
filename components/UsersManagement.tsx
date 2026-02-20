import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Edit2, User, Phone, Mail, ChevronDown, MoreVertical, Shield } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  username: string;
  phone: string;
  email: string;
  role: 'Customer' | 'Provider';
  joinDate: string;
  status: 'Active' | 'Banned';
}

const mockUsers: UserData[] = [
  { id: '1', name: 'رضا حسینی', username: 'reza_hos', phone: '09121112233', email: 'reza@gmail.com', role: 'Customer', joinDate: '1402/10/01', status: 'Active' },
  { id: '2', name: 'سارا کریمی', username: 'sara_ka', phone: '09355556677', email: 'sara@yahoo.com', role: 'Customer', joinDate: '1402/11/15', status: 'Active' },
  { id: '3', name: 'کافی نت مرکزی', username: 'cafe_center', phone: '02144445555', email: 'admin@center.com', role: 'Provider', joinDate: '1401/05/20', status: 'Active' },
];

export const UsersManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);

  useEffect(() => {
    const storedUsers = localStorage.getItem('netchi_users');
    if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        // Merge mock data with real stored users for better demo experience
        setUsers([...parsedUsers.reverse(), ...mockUsers]);
    } else {
        setUsers(mockUsers);
    }
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.includes(searchTerm) || user.username.includes(searchTerm) || user.phone.includes(searchTerm)
  );

  return (
    <div className="w-full flex flex-col relative">
      <div className="mb-6 flex justify-between items-end">
        <div>
            <h2 className="text-2xl font-black text-slate-800">مدیریت کاربران</h2>
            <p className="text-slate-500 text-sm">لیست تمام اعضای پلتفرم نت‌چی</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3 mb-6">
        <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
            <Search size={20} />
        </div>
        <input 
            type="text" 
            placeholder="جستجو بر اساس نام، نام کاربری یا شماره..." 
            className="flex-1 outline-none text-slate-700 bg-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Users List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
                <motion.div
                    layoutId={`user-card-${user.id}`}
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    whileHover={{ scale: 1.02 }}
                    className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 cursor-pointer relative group overflow-hidden"
                >
                    <div className={`absolute top-0 right-0 w-2 h-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <div className="flex items-center gap-4 pr-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-lg overflow-hidden">
                             {/* Initials or Avatar */}
                             <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} alt="av" className="w-full h-full" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">{user.name}</h3>
                            <p className="text-xs text-slate-400 font-mono">@{user.username}</p>
                        </div>
                        <div className="mr-auto">
                            <MoreVertical size={16} className="text-slate-300" />
                        </div>
                    </div>
                </motion.div>
            ))
        ) : (
            <div className="col-span-full text-center text-slate-400 py-10">
                کاربری یافت نشد.
            </div>
        )}
      </div>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedUser(null)}
                    className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto"
                />
                
                {/* Modal Card */}
                {/* Centered with upward bias (mb-20) on mobile to clear bottom nav comfortably */}
                <motion.div
                    layoutId={`user-card-${selectedUser.id}`} 
                    className={`
                        pointer-events-auto bg-white shadow-2xl p-6 md:p-8 
                        w-full max-w-md md:w-[500px] 
                        rounded-[32px] md:rounded-[40px]
                        relative mb-20 md:mb-0
                    `}
                    initial={{ y: 50, opacity: 0, scale: 0.9 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 50, opacity: 0, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    {/* Handle bar for visual cue (optional) */}
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 md:hidden opacity-50" />
                    
                    <div className="flex flex-col items-center mb-6">
                        <div className="w-24 h-24 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full p-1 mb-3 shadow-lg shadow-blue-500/30">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-3xl font-black text-slate-700 overflow-hidden">
                                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.username}`} alt="av" className="w-full h-full" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-slate-800">{selectedUser.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold mt-2 ${selectedUser.role === 'Provider' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                            {selectedUser.role === 'Provider' ? 'مدیر کافی‌نت' : 'کاربر عادی'}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                        <InfoItem icon={User} label="نام کاربری" value={selectedUser.username} />
                        <InfoItem icon={Phone} label="موبایل" value={selectedUser.phone} />
                        <InfoItem icon={Mail} label="ایمیل" value={selectedUser.email} />
                        <InfoItem icon={Shield} label="وضعیت" value={selectedUser.status === 'Active' ? 'فعال' : 'مسدود'} color={selectedUser.status === 'Active' ? 'text-emerald-500' : 'text-red-500'} />
                    </div>

                    <div className="flex gap-3">
                        <button className="flex-1 bg-blue-50 text-blue-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                            <Edit2 size={18} />
                            ویرایش
                        </button>
                        <button className="flex-1 bg-red-50 text-red-600 font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-100 transition-colors">
                            <Trash2 size={18} />
                            حذف
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const InfoItem = ({ icon: Icon, label, value, color = 'text-slate-700' }: any) => (
    <div className="bg-slate-50 p-3 rounded-2xl">
        <div className="flex items-center gap-2 text-slate-400 mb-1 text-xs">
            <Icon size={14} />
            <span>{label}</span>
        </div>
        <div className={`font-bold text-sm truncate ${color}`}>{value}</div>
    </div>
);