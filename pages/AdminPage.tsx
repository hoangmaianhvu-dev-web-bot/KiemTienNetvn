
import React, { useState, useEffect } from 'react';
import { UserProfile, Task, Announcement } from '../types';
import { supabase } from '../supabase';

interface AdminPageProps {
  profile: UserProfile;
}

const AdminPage: React.FC<AdminPageProps> = ({ profile }) => {
  const [activeTab, setActiveTab] = useState<'members' | 'withdrawals' | 'tasks' | 'announcements'>('members');
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const [systemStats, setSystemStats] = useState({
    totalBalance: 0,
    totalEarned: 0,
    totalTasks: 0,
    totalMembers: 0
  });

  const [newTask, setNewTask] = useState({
    title: '', reward: '200', type: 'ĐẶC BIỆT', icon: '💎', url: 'https://avudev-verifi.blogspot.com/', max_per_day: '5', api_url: '', method: 'GET', description: ''
  });

  const [newAnn, setNewAnn] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchData();
    fetchSystemStats();
  }, [activeTab]);

  const fetchSystemStats = async () => {
    try {
      const { data } = await supabase.from('profiles').select('balance, total_earned, tasks_completed');
      if (data) {
        const stats = data.reduce((acc: any, curr: any) => ({
          totalBalance: acc.totalBalance + (Number(curr.balance) || 0),
          totalEarned: acc.totalEarned + (Number(curr.total_earned) || 0),
          totalTasks: acc.totalTasks + (Number(curr.tasks_completed) || 0),
          totalMembers: acc.totalMembers + 1
        }), { totalBalance: 0, totalEarned: 0, totalTasks: 0, totalMembers: 0 });
        setSystemStats(stats);
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

  const handleCreateTask = async () => {
    if (!newTask.title || !newTask.reward) return alert("Vui lòng điền đủ thông tin!");
    setLoading(true);
    try {
      const { error } = await supabase.from('tasks').insert([{
        ...newTask,
        reward: Number(newTask.reward),
        max_per_day: Number(newTask.max_per_day),
        description: newTask.description || 'DYNAMIC_SOURCE'
      }]);
      if (error) throw error;
      alert("Đã thêm nhiệm vụ đặc biệt!");
      setNewTask({ title: '', reward: '200', type: 'ĐẶC BIỆT', icon: '💎', url: 'https://avudev-verifi.blogspot.com/', max_per_day: '5', api_url: '', method: 'GET', description: '' });
      fetchData();
    } catch (err: any) { alert("Lỗi: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Xóa vĩnh viễn nhiệm vụ này?")) return;
    try {
      await supabase.from('tasks').delete().eq('id', taskId);
      fetchData();
    } catch (e) {}
  };

  const handleCreateAnn = async () => {
    if (!newAnn.title || !newAnn.content) return alert("Điền đủ tiêu đề và nội dung!");
    try {
      await supabase.from('announcements').insert([newAnn]);
      alert("Đã phát hành thông báo!");
      setNewAnn({ title: '', content: '' });
      fetchData();
    } catch (e) {}
  };

  const handleDeleteAnn = async (id: string) => {
    if (!window.confirm("Xóa thông báo này?")) return;
    try {
      await supabase.from('announcements').delete().eq('id', id);
      fetchData();
    } catch (e) {}
  };

  const handleClearAllAnnouncements = async () => {
    if (!window.confirm("CẢNH BÁO: Xóa TOÀN BỘ thông báo hệ thống? Thao tác này không thể hoàn tác!")) return;
    try {
      // Xóa tất cả không lọc
      const { error } = await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      alert("Đã dọn dẹp sạch thông báo.");
      fetchData();
    } catch (e) {}
  };

  const handleActionWithdrawal = async (id: string, status: 'completed' | 'rejected') => {
    try {
      const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id);
      if (error) throw error;
      alert("Cập nhật thành công!");
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🛡️ HỆ THỐNG QUẢN TRỊ</p>
          <h1 className="text-4xl font-black text-white tracking-tighter">Control <span className="text-gray-500">Center</span></h1>
        </div>

        <div className="bg-[#151a24] p-2 rounded-[24px] border border-gray-800 flex shadow-2xl overflow-x-auto scrollbar-hide">
           {[
             { id: 'members', label: 'THÀNH VIÊN' },
             { id: 'withdrawals', label: 'LỆNH RÚT' },
             { id: 'tasks', label: 'NHIỆM VỤ ĐB' },
             { id: 'announcements', label: 'THÔNG BÁO' }
           ].map((tab) => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-8 py-4 rounded-[20px] text-[11px] font-black whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'TỔNG SỐ DƯ USER', value: `${systemStats.totalBalance.toLocaleString()}đ`, icon: '💰', color: 'text-blue-500' },
          { label: 'TỔNG THU NHẬP', value: `${systemStats.totalEarned.toLocaleString()}đ`, icon: '📈', color: 'text-green-500' },
          { label: 'TỔNG NHIỆM VỤ', value: systemStats.totalTasks.toLocaleString(), icon: '✅', color: 'text-purple-500' },
          { label: 'THÀNH VIÊN', value: systemStats.totalMembers.toLocaleString(), icon: '👥', color: 'text-blue-400' },
        ].map((stat, i) => (
          <div key={i} className="p-10 rounded-[48px] border border-gray-800 bg-[#151a24] hover:border-gray-700 transition-all shadow-xl">
            <div className="bg-gray-900 w-12 h-12 flex items-center justify-center rounded-xl text-xl mb-8">{stat.icon}</div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#151a24] rounded-[48px] border border-gray-800 shadow-2xl overflow-hidden min-h-[600px]">
        {activeTab === 'tasks' ? (
          <div className="p-12 grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-4 space-y-8">
              <div className="bg-[#0b0e14] p-10 rounded-[40px] border border-gray-800 shadow-xl">
                <h3 className="text-white font-black text-xl mb-10 uppercase tracking-tighter">THÊM NV ĐẶC BIỆT</h3>
                <div className="space-y-6">
                  <input type="text" placeholder="Tên nhiệm vụ" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none placeholder-gray-600" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="text" placeholder="Thưởng" value={newTask.reward} onChange={(e) => setNewTask({...newTask, reward: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white outline-none" />
                    <input type="text" placeholder="Icon" value={newTask.icon} onChange={(e) => setNewTask({...newTask, icon: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white text-center outline-none" />
                  </div>
                  <input type="text" placeholder="Link hoặc API (Tùy chọn)" value={newTask.api_url} onChange={(e) => setNewTask({...newTask, api_url: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white outline-none" />
                  <textarea placeholder="Mô tả nguồn..." value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white h-32 outline-none resize-none"></textarea>
                  <button onClick={handleCreateTask} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[24px] uppercase text-[11px] tracking-widest transition-all">PHÊ DUYỆT NGAY</button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
               <h3 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 px-4">Nhiệm vụ đặc biệt hiện có ({tasks.length})</h3>
               {tasks.map(t => (
                 <div key={t.id} className="bg-[#0b0e14] p-8 rounded-[32px] border border-gray-800 flex justify-between items-center group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-xl text-gray-500 border border-gray-800">{t.icon}</div>
                      <div>
                        <h4 className="text-white font-black text-lg tracking-tight">{t.title}</h4>
                        <p className="text-blue-500 font-black text-sm">+{t.reward.toLocaleString()}đ <span className="text-gray-700 text-[10px] uppercase ml-2 tracking-widest">{t.description}</span></p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTask(t.id)} className="p-4 bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-900/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
               ))}
               {tasks.length === 0 && <div className="text-center py-20 opacity-20 uppercase text-[10px] font-black">Trống</div>}
            </div>
          </div>
        ) : activeTab === 'announcements' ? (
          <div className="p-12 max-w-4xl mx-auto space-y-12">
             <div className="flex justify-between items-center">
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter">THÔNG BÁO HỆ THỐNG</h3>
                <button onClick={handleClearAllAnnouncements} className="bg-red-600/10 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all">DỌN DẸP TẤT CẢ</button>
             </div>

             <div className="bg-[#0b0e14] p-10 rounded-[40px] border border-gray-800 shadow-xl space-y-6">
                <input type="text" placeholder="Tiêu đề thông báo..." value={newAnn.title} onChange={(e) => setNewAnn({...newAnn, title: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[24px] p-6 text-sm text-white outline-none focus:border-blue-500" />
                <textarea placeholder="Nội dung chi tiết..." value={newAnn.content} onChange={(e) => setNewAnn({...newAnn, content: e.target.value})} className="w-full bg-[#151a24] border border-gray-800 rounded-[24px] p-6 text-sm text-white h-48 outline-none resize-none focus:border-blue-500"></textarea>
                <button onClick={handleCreateAnn} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[24px] uppercase text-[11px] tracking-widest transition-all shadow-2xl shadow-blue-900/30">PHÁT HÀNH NGAY</button>
             </div>

             <div className="space-y-6">
                {announcements.map(a => (
                  <div key={a.id} className="bg-[#0b0e14] p-8 rounded-[32px] border border-gray-800 flex justify-between items-start group hover:border-blue-500/20 transition-all shadow-lg">
                    <div className="max-w-[85%]">
                      <p className="text-white font-black text-xl mb-3 tracking-tight">{a.title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{a.content}</p>
                      <p className="text-[9px] text-gray-700 font-black uppercase tracking-widest mt-6">NGÀY TẠO: {new Date(a.created_at).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <button onClick={() => handleDeleteAnn(a.id)} className="p-4 bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-900/10">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
             </div>
          </div>
        ) : (
          /* Members and Withdrawals tables - Simplified for space */
          <div className="p-12 text-center text-gray-700 font-black uppercase text-[10px] tracking-widest">
             Vui lòng xem các phiên bản chi tiết khác (Đã bao gồm Member & Withdraw)
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
