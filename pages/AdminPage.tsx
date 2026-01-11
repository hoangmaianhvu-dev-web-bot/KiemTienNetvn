
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
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
      } else if (activeTab === 'announcements') {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data) setAnnouncements(data);
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleUpdateBalance = async (userId: string, currentBalance: number) => {
    const amount = prompt(`Nhập số dư mới cho người dùng (Hiện tại: ${currentBalance.toLocaleString()}đ):`, currentBalance.toString());
    if (amount === null || isNaN(Number(amount))) return;
    
    try {
      const { error } = await supabase.from('profiles').update({ balance: Number(amount) }).eq('id', userId);
      if (error) throw error;
      alert("Cập nhật số dư thành công!");
      fetchData();
    } catch (err: any) { alert("Lỗi: " + err.message); }
  };

  const handleActionWithdrawal = async (id: string, status: 'completed' | 'rejected') => {
    if (!window.confirm(`Xác nhận ${status === 'completed' ? 'DUYỆT' : 'HỦY'} lệnh rút này?`)) return;
    try {
      const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id);
      if (error) throw error;
      alert("Cập nhật thành công!");
      fetchData();
      fetchSystemStats();
    } catch (e) {}
  };

  const filteredMembers = members.filter(m => 
    m.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🛡️ HỆ THỐNG QUẢN TRỊ</p>
        <h1 className="text-4xl font-black text-white tracking-tighter">Admin <span className="text-gray-500">Dashboard</span></h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        {[
          { label: 'SỐ DƯ USER', value: `${systemStats.totalBalance.toLocaleString()}đ`, color: 'text-blue-500' },
          { label: 'TỔNG ĐÃ KIẾM', value: `${systemStats.totalEarned.toLocaleString()}đ`, color: 'text-green-500' },
          { label: 'NV HOÀN TẤT', value: systemStats.totalTasks, color: 'text-purple-500' },
          { label: 'THÀNH VIÊN', value: systemStats.totalMembers, color: 'text-blue-400' },
          { label: 'CHỜ DUYỆT', value: systemStats.pendingWithdrawals, color: 'text-yellow-500' },
        ].map((stat, i) => (
          <div key={i} className="p-8 rounded-[32px] border border-gray-800 bg-[#151a24] shadow-xl">
            <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#151a24] p-2 rounded-[24px] border border-gray-800 flex shadow-2xl overflow-x-auto mb-8">
        {['withdrawals', 'members', 'tasks', 'announcements'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)} 
            className={`px-8 py-4 rounded-[20px] text-[10px] font-black uppercase transition-all ${
              activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab === 'withdrawals' ? 'Lệnh rút' : tab === 'members' ? 'Thành viên' : tab === 'tasks' ? 'Nhiệm vụ' : 'Thông báo'}
          </button>
        ))}
      </div>

      <div className="bg-[#151a24] rounded-[38px] border border-gray-800 shadow-2xl overflow-hidden min-h-[500px]">
        {activeTab === 'members' && (
          <div className="p-8">
            <div className="mb-8 flex justify-between items-center px-4">
              <h3 className="text-white font-black text-xl uppercase">Danh sách thành viên</h3>
              <input 
                type="text" 
                placeholder="Tìm tên hoặc email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-blue-500"
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-6">Thành viên</th>
                    <th className="px-6 py-6 text-center">Số dư</th>
                    <th className="px-6 py-6 text-center">Nhiệm vụ</th>
                    <th className="px-6 py-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {filteredMembers.map(m => (
                    <tr key={m.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-6">
                        <p className="text-white font-bold">{m.full_name}</p>
                        <p className="text-gray-500 text-[10px]">{m.email}</p>
                      </td>
                      <td className="px-6 py-6 text-center text-green-500 font-black">{m.balance.toLocaleString()}đ</td>
                      <td className="px-6 py-6 text-center text-blue-500 font-black">{m.tasks_completed}</td>
                      <td className="px-6 py-6 text-right">
                        <button 
                          onClick={() => handleUpdateBalance(m.id, m.balance)}
                          className="bg-gray-800 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase transition-all"
                        >
                          Sửa số dư
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'withdrawals' && (
          <div className="p-8">
            <h3 className="text-white font-black text-xl uppercase px-4 mb-8">Quản lý lệnh rút tiền</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                  <tr>
                    <th className="px-6 py-6">Người rút</th>
                    <th className="px-6 py-6">Số tiền</th>
                    <th className="px-6 py-6">Thông tin nhận</th>
                    <th className="px-6 py-6">Trạng thái</th>
                    <th className="px-6 py-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/30">
                  {withdrawals.map(w => (
                    <tr key={w.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-6">
                        <p className="text-white font-bold">{w.profiles?.full_name}</p>
                        <p className="text-gray-500 text-[10px]">{w.profiles?.email}</p>
                      </td>
                      <td className="px-6 py-6 text-blue-500 font-black">{w.amount.toLocaleString()}đ</td>
                      <td className="px-6 py-6">
                        <p className="text-gray-400 text-[11px] font-bold">{w.method.toUpperCase()}</p>
                        <p className="text-gray-500 text-[10px]">{w.account_number}</p>
                      </td>
                      <td className="px-6 py-6">
                        <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                          w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                          w.status === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                          'bg-red-500/10 text-red-500 border border-red-500/20'
                        }`}>
                          {w.status === 'pending' ? 'Chờ duyệt' : w.status === 'completed' ? 'Đã thanh toán' : 'Bị từ chối'}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-right">
                        {w.status === 'pending' && (
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => handleActionWithdrawal(w.id, 'completed')} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg">Duyệt</button>
                            <button onClick={() => handleActionWithdrawal(w.id, 'rejected')} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg">Hủy</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
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
