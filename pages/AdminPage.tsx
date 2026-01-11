
import React, { useState, useEffect } from 'react';
import { UserProfile, Task, Announcement, Withdrawal } from '../types';
import { supabase } from '../supabase';

interface AdminPageProps {
  profile: UserProfile;
}

const AdminPage: React.FC<AdminPageProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'withdrawals' | 'tasks' | 'announcements'>('withdrawals');
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Form thêm nhiệm vụ mới
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    reward: 200,
    max_per_day: 3,
    description: 'ĐẶC BIỆT',
    api_url: '',
    icon: '💎',
    method: 'GET',
    type: 'ĐẶC BIỆT'
  });

  const [systemStats, setSystemStats] = useState({
    totalBalance: 0,
    totalEarned: 0,
    totalTasks: 0,
    totalMembers: 0,
    pendingWithdrawals: 0
  });

  useEffect(() => {
    fetchData();
    fetchSystemStats();
  }, [activeTab]);

  const fetchSystemStats = async () => {
    try {
      const { data: profiles } = await supabase.from('profiles').select('balance, total_earned, tasks_completed');
      const { count: pendingCount } = await supabase.from('withdrawals').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      if (profiles) {
        const stats = profiles.reduce((acc: any, curr: any) => ({
          totalBalance: acc.totalBalance + (Number(curr.balance) || 0),
          totalEarned: acc.totalEarned + (Number(curr.total_earned) || 0),
          totalTasks: acc.totalTasks + (Number(curr.tasks_completed) || 0),
          totalMembers: acc.totalMembers + 1
        }), { totalBalance: 0, totalEarned: 0, totalTasks: 0, totalMembers: 0 });
        setSystemStats({ ...stats, pendingWithdrawals: pendingCount || 0 });
      }
    } catch (e) {}
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'members') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setMembers(data);
      } else if (activeTab === 'withdrawals') {
        const { data } = await supabase.from('withdrawals').select('*, profiles(full_name, email, balance)').order('created_at', { ascending: false });
        if (data) setWithdrawals(data);
      } else if (activeTab === 'tasks') {
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (data) setTasks(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('tasks').insert([newTask]);
      if (error) throw error;
      alert("Đã thêm nhiệm vụ đặc biệt thành công!");
      setNewTask({ title: '', reward: 200, max_per_day: 3, description: 'ĐẶC BIỆT', api_url: '', icon: '💎', method: 'GET', type: 'ĐẶC BIỆT' });
      fetchData();
    } catch (err: any) { alert("Lỗi: " + err.message); }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Xóa nhiệm vụ này vĩnh viễn?")) return;
    try {
      await supabase.from('tasks').delete().eq('id', id);
      fetchData();
    } catch (e) {}
  };

  const handleUpdateBalance = async (userId: string, currentBalance: number) => {
    const amount = prompt(`Nhập số dư mới cho user (Hiện tại: ${currentBalance.toLocaleString()}đ):`, currentBalance.toString());
    if (amount === null || isNaN(Number(amount))) return;
    await supabase.from('profiles').update({ balance: Number(amount) }).eq('id', userId);
    fetchData();
    fetchSystemStats();
  };

  const handleActionWithdrawal = async (id: string, status: 'completed' | 'rejected') => {
    if (!window.confirm(`Xác nhận thao tác này?`)) return;
    await supabase.from('withdrawals').update({ status }).eq('id', id);
    fetchData();
    fetchSystemStats();
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.referral_code?.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🛡️ HỆ THỐNG QUẢN TRỊ ADMIN</p>
        <h1 className="text-4xl font-black text-white tracking-tighter">Bảng <span className="text-gray-500">Điều Khiển</span></h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {[
          { label: 'SỐ DƯ USER', value: `${systemStats.totalBalance.toLocaleString()}đ`, color: 'text-blue-500' },
          { label: 'TỔNG ĐÃ KIẾM', value: `${systemStats.totalEarned.toLocaleString()}đ`, color: 'text-green-500' },
          { label: 'NV HOÀN TẤT', value: systemStats.totalTasks, color: 'text-purple-500' },
          { label: 'THÀNH VIÊN', value: systemStats.totalMembers, color: 'text-blue-400' },
          { label: 'LỆNH CHỜ', value: systemStats.pendingWithdrawals, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[32px] border border-gray-800 bg-[#151a24] shadow-xl">
            <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#151a24] p-2 rounded-[24px] border border-gray-800 flex shadow-2xl overflow-x-auto mb-8 no-scrollbar">
        {[
          { id: 'withdrawals', label: 'Rút tiền' },
          { id: 'members', label: 'Thành viên' },
          { id: 'tasks', label: 'Quản lý Nhiệm vụ' }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="bg-[#151a24] rounded-[38px] border border-gray-800 shadow-2xl overflow-hidden min-h-[600px]">
        {activeTab === 'tasks' && (
          <div className="p-10">
            <h3 className="text-white font-black text-xl uppercase mb-8 flex items-center gap-3">
               <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
               Thêm nhiệm vụ đặc biệt
            </h3>
            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16 bg-gray-900/50 p-10 rounded-[32px] border border-gray-800 shadow-inner">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Tiêu đề nhiệm vụ</label>
                 <input placeholder="VD: Nhiệm vụ VIP 01" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full bg-gray-800 border-none rounded-xl p-5 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Tiền thưởng (đ)</label>
                 <input placeholder="200" type="number" value={newTask.reward} onChange={e => setNewTask({...newTask, reward: Number(e.target.value)})} className="w-full bg-gray-800 border-none rounded-xl p-5 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Giới hạn lượt/ngày</label>
                 <input placeholder="3" type="number" value={newTask.max_per_day} onChange={e => setNewTask({...newTask, max_per_day: Number(e.target.value)})} className="w-full bg-gray-800 border-none rounded-xl p-5 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Mô tả nhãn (VD: VIP)</label>
                 <input placeholder="ĐẶC BIỆT" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full bg-gray-800 border-none rounded-xl p-5 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500" required />
               </div>
               <div className="space-y-2 md:col-span-2">
                 <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">API URL rút gọn</label>
                 <input placeholder="https://api.domain.com/shorten?api=YOUR_KEY&url=" value={newTask.api_url} onChange={e => setNewTask({...newTask, api_url: e.target.value})} className="w-full bg-gray-800 border-none rounded-xl p-5 text-white text-sm outline-none focus:ring-1 focus:ring-blue-500 md:col-span-2" />
               </div>
               <button type="submit" className="bg-blue-600 text-white font-black py-5 rounded-2xl uppercase tracking-widest text-[11px] md:col-span-2 hover:bg-blue-700 shadow-xl shadow-blue-900/20 transition-all">Tạo nhiệm vụ ngay</button>
            </form>

            <h3 className="text-white font-black text-xl uppercase mb-8 flex items-center gap-3">
               <span className="w-1.5 h-6 bg-green-500 rounded-full"></span>
               Nhiệm vụ đang hoạt động
            </h3>
            <div className="space-y-4">
              {tasks.map(t => (
                <div key={t.id} className="flex items-center justify-between p-8 bg-[#0b0e14] border border-gray-800 rounded-3xl group hover:border-gray-700 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="w-12 h-12 bg-gray-800/50 rounded-xl flex items-center justify-center text-xl">
                        {t.icon || '💎'}
                      </div>
                      <div>
                        <p className="text-white font-bold">{t.title}</p>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">THƯỞNG: {t.reward}đ • LƯỢT: {t.max_per_day}/ngày</p>
                      </div>
                   </div>
                   <button onClick={() => handleDeleteTask(t.id)} className="text-red-500 font-black text-[10px] uppercase border border-red-500/20 px-6 py-3 rounded-xl hover:bg-red-500/10 transition-all">Xóa</button>
                </div>
              ))}
              {tasks.length === 0 && (
                <div className="text-center py-20 bg-gray-900/20 rounded-[32px] border border-gray-800 border-dashed">
                  <p className="text-gray-600 font-black text-[10px] uppercase tracking-widest">Không có nhiệm vụ đặc biệt nào</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="p-10">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <h3 className="text-white font-black text-xl uppercase">Thành viên hệ thống</h3>
              <input placeholder="Tìm theo tên hoặc mã ref..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-80 bg-gray-900 border border-gray-800 rounded-2xl px-8 py-4 text-xs text-white focus:border-blue-500 outline-none transition-all" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                  <tr><th className="px-8 py-6">Thành viên</th><th className="px-8 py-6 text-center">Số dư</th><th className="px-8 py-6 text-right">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-8"><p className="text-white font-bold">{m.full_name}</p><p className="text-gray-500 text-[10px] mt-1">{m.email} • Ref: {m.referral_code}</p></td>
                      <td className="px-8 py-8 text-center text-green-500 font-black text-lg">{m.balance.toLocaleString()}đ</td>
                      <td className="px-8 py-8 text-right"><button onClick={() => handleUpdateBalance(m.id, m.balance)} className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Sửa số dư</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="p-10">
            <h3 className="text-white font-black text-xl uppercase mb-10">Lệnh rút tiền mới nhất</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                  <tr><th className="px-8 py-6">Người rút</th><th className="px-8 py-6">Số tiền</th><th className="px-8 py-6">Thông tin</th><th className="px-8 py-6 text-right">Thao tác</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-8 py-8">
                        <p className="text-white font-bold">{w.profiles?.full_name}</p>
                        <p className="text-gray-500 text-[10px] mt-1">{w.profiles?.email}</p>
                      </td>
                      <td className="px-8 py-8 text-blue-500 font-black text-xl">{w.amount.toLocaleString()}đ</td>
                      <td className="px-8 py-8 text-gray-400 text-[11px] font-bold uppercase tracking-widest">
                        {w.method} <br />
                        <span className="text-gray-600 font-mono text-[10px] normal-case">{w.account_number}</span>
                      </td>
                      <td className="px-8 py-8 text-right">
                        {w.status === 'pending' ? (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleActionWithdrawal(w.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Duyệt</button>
                            <button onClick={() => handleActionWithdrawal(w.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all">Hủy</button>
                          </div>
                        ) : (
                          <span className={`text-[8px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${w.status === 'completed' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                            {w.status === 'completed' ? 'Thành công' : 'Bị từ chối'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {withdrawals.length === 0 && (
                    <tr><td colSpan={4} className="py-20 text-center text-gray-600 text-[10px] font-black uppercase tracking-widest">Không có dữ liệu rút tiền</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
