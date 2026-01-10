
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
    title: '', reward: '200', type: 'THƯỜNG', icon: '🔗', url: 'https://avudev-verifi.blogspot.com/', max_per_day: '5', api_url: '', method: 'GET', description: ''
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
        description: newTask.description || newTask.title.split('(')[1]?.split(')')[0] || 'SOURCE'
      }]);
      if (error) throw error;
      alert("Nhiệm vụ đã được phê duyệt!");
      setNewTask({ title: '', reward: '200', type: 'THƯỜNG', icon: '🔗', url: 'https://avudev-verifi.blogspot.com/', max_per_day: '5', api_url: '', method: 'GET', description: '' });
      fetchData();
    } catch (err: any) { alert("Lỗi: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn nhiệm vụ này không?")) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      alert("Đã xóa nhiệm vụ!");
      fetchData();
    } catch (err: any) {
      alert("Lỗi khi xóa: " + err.message);
    }
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

  const handleDeleteAnnouncement = async (annId: string) => {
    if (!window.confirm("Xóa thông báo này vĩnh viễn?")) return;
    try {
      const { error } = await supabase.from('announcements').delete().eq('id', annId);
      if (error) throw error;
      alert("Đã xóa thông báo!");
      fetchData();
    } catch (e) {}
  };

  const handleClearAllAnnouncements = async () => {
    if (!window.confirm("Xóa TẤT CẢ thông báo hệ thống? Thao tác này không thể hoàn tác!")) return;
    try {
      const { error } = await supabase.from('announcements').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      if (error) throw error;
      alert("Đã xóa toàn bộ thông báo!");
      fetchData();
    } catch (e) {}
  };

  const handleActionWithdrawal = async (id: string, status: 'completed' | 'rejected') => {
    try {
      const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id);
      if (error) throw error;
      alert("Đã cập nhật lệnh rút!");
      fetchData();
    } catch (e) {}
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-lg animate-pulse"></span> HỆ THỐNG QUẢN TRỊ
          </p>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-white tracking-tighter">Quản lý <span className="text-gray-500">KiemTienNet</span></h1>
            <button className="bg-[#1c2431] hover:bg-gray-800 text-blue-500 text-[9px] font-black px-4 py-2 rounded-xl border border-blue-500/10 transition-all uppercase tracking-widest mt-1 shadow-lg">
              BOM TIỀN ADMIN
            </button>
          </div>
        </div>

        <div className="bg-[#151a24] p-1.5 rounded-[22px] border border-gray-800 flex shadow-2xl overflow-x-auto scrollbar-hide">
           {[
             { id: 'members', label: 'THÀNH VIÊN' },
             { id: 'withdrawals', label: 'LỆNH RÚT' },
             { id: 'tasks', label: 'NHIỆM VỤ' },
             { id: 'announcements', label: 'THÔNG BÁO' }
           ].map((tab) => (
             <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                className={`px-8 py-3.5 rounded-[18px] text-[11px] font-black whitespace-nowrap transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-gray-500 hover:text-white'
                }`}
             >
               {tab.label}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'TỔNG SỐ DƯ USER', value: `${systemStats.totalBalance.toLocaleString()}đ`, icon: '💰', color: 'text-blue-500', iconBg: 'bg-blue-500/10' },
          { label: 'TỔNG THU NHẬP USER', value: `${systemStats.totalEarned.toLocaleString()}đ`, icon: '📈', color: 'text-green-500', iconBg: 'bg-green-500/10' },
          { label: 'TỔNG NHIỆM VỤ XONG', value: systemStats.totalTasks.toLocaleString(), icon: '✅', color: 'text-purple-500', iconBg: 'bg-purple-500/10' },
          { label: 'TỔNG THÀNH VIÊN', value: systemStats.totalMembers.toLocaleString(), icon: '👥', color: 'text-blue-400', iconBg: 'bg-blue-400/10' },
        ].map((stat, i) => (
          <div key={i} className="p-10 rounded-[42px] border border-gray-800 transition-all shadow-xl bg-[#151a24] group hover:border-gray-700">
            <div className={`${stat.iconBg} w-14 h-14 flex items-center justify-center rounded-2xl text-2xl mb-8 group-hover:scale-110 transition-transform`}>{stat.icon}</div>
            <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-3xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="bg-[#151a24] rounded-[48px] border border-gray-800 shadow-2xl overflow-hidden min-h-[600px]">
        {activeTab === 'tasks' ? (
          <div className="p-10 grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-4">
              <div className="bg-[#0b0e14] p-10 rounded-[40px] border border-gray-800 shadow-2xl">
                <h3 className="text-white font-black text-2xl mb-12 uppercase tracking-tighter">THÊM NHIỆM VỤ</h3>
                <div className="space-y-6">
                  <input 
                    type="text" placeholder="Tên nhiệm vụ" 
                    value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none placeholder-gray-600" 
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="text" placeholder="Thưởng (VNĐ)" 
                      value={newTask.reward} onChange={(e) => setNewTask({...newTask, reward: e.target.value})}
                      className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none placeholder-gray-600" 
                    />
                    <div className="relative">
                      <select 
                        value={newTask.type} onChange={(e) => setNewTask({...newTask, type: e.target.value})}
                        className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-gray-300 outline-none focus:border-blue-500 appearance-none font-black"
                      >
                        <option value="ƯU ĐÃI">Ưu đãi</option>
                        <option value="THƯỜNG">Thường</option>
                        <option value="ĐẶC BIỆT">Đặc biệt</option>
                        <option value="MXH">MXH</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      type="number" placeholder="Lượt làm/Ngày" 
                      value={newTask.max_per_day} onChange={(e) => setNewTask({...newTask, max_per_day: e.target.value})}
                      className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none placeholder-gray-600" 
                    />
                    <input 
                      type="text" placeholder="Icon Emoji" 
                      value={newTask.icon} onChange={(e) => setNewTask({...newTask, icon: e.target.value})}
                      className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none text-center" 
                    />
                  </div>
                  <input 
                    type="text" placeholder="Đường dẫn" 
                    value={newTask.url} onChange={(e) => setNewTask({...newTask, url: e.target.value})}
                    className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none placeholder-gray-600" 
                  />
                  <textarea 
                    placeholder="Hướng dẫn..." 
                    value={newTask.description} onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white h-32 focus:border-blue-500 outline-none resize-none"
                  ></textarea>
                  <button 
                    onClick={handleCreateTask}
                    className="w-full bg-[#2563eb] hover:bg-blue-600 text-white font-black py-6 rounded-[24px] uppercase text-[12px] tracking-[0.2em] shadow-2xl transition-all"
                  >
                    PHÊ DUYỆT
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
               {tasks.length === 0 && <p className="text-gray-500 text-center py-10 font-bold">Chưa có nhiệm vụ tùy chỉnh.</p>}
               {tasks.map(t => (
                 <div key={t.id} className="bg-[#0b0e14] p-8 rounded-[32px] border border-gray-800 flex justify-between items-center group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-xl text-gray-500 border border-gray-800">{t.icon}</div>
                      <div>
                        <h4 className="text-white font-black text-lg tracking-tight">{t.title}</h4>
                        <p className="text-blue-500 font-black text-sm">+{t.reward.toLocaleString()}đ <span className="text-gray-700 text-[10px] uppercase ml-2 tracking-widest">- {t.description} | Max: {t.max_per_day}</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteTask(t.id)}
                      className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      title="Xóa nhiệm vụ"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                 </div>
               ))}
            </div>
          </div>
        ) : activeTab === 'members' ? (
          <div className="p-10 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-8 text-gray-700 text-[10px] font-black uppercase tracking-widest pl-4">NGƯỜI DÙNG</th>
                  <th className="pb-8 text-gray-700 text-[10px] font-black uppercase tracking-widest text-center">LOẠI</th>
                  <th className="pb-8 text-gray-700 text-[10px] font-black uppercase tracking-widest text-right pr-4">SỐ DƯ</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-b border-gray-800/30 hover:bg-white/[0.01] transition-colors group">
                    <td className="py-8 pl-4">
                      <p className="text-white font-black text-sm">{m.full_name}</p>
                      <p className="text-gray-600 text-[10px] mt-1">{m.email}</p>
                    </td>
                    <td className="py-8 text-center">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black tracking-widest uppercase ${m.role === 'admin' ? 'bg-[#ef4444] text-white' : 'bg-gray-800 text-gray-500'}`}>
                        {m.role === 'admin' ? 'ADMIN' : 'USER'}
                      </span>
                    </td>
                    <td className="py-8 text-right pr-4">
                      <p className="text-blue-500 font-black text-sm">{m.balance?.toLocaleString()}đ</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : activeTab === 'withdrawals' ? (
          <div className="p-10 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-8 text-gray-700 text-[10px] font-black uppercase tracking-widest pl-4">THÔNG TIN RÚT</th>
                  <th className="pb-8 text-gray-700 text-[10px] font-black uppercase tracking-widest text-center">TRẠNG THÁI</th>
                  <th className="pb-8 text-gray-700 text-[10px] font-black uppercase tracking-widest text-right pr-4">HÀNH ĐỘNG</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-gray-800/30">
                    <td className="py-6 pl-4">
                      <p className="text-white font-black text-sm">{w.profiles?.full_name}</p>
                      <p className="text-blue-500 font-black text-xs">{w.amount?.toLocaleString()}đ - {w.method?.toUpperCase()}</p>
                      <p className="text-gray-600 text-[10px] mt-1">{w.bank_name}: {w.account_number}</p>
                    </td>
                    <td className="py-6 text-center">
                      <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase ${w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : w.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {w.status === 'pending' ? 'CHỜ DUYỆT' : w.status === 'completed' ? 'THÀNH CÔNG' : 'ĐÃ HỦY'}
                      </span>
                    </td>
                    <td className="py-6 text-right pr-4">
                      {w.status === 'pending' && (
                        <div className="flex gap-2 justify-end">
                          <button onClick={() => handleActionWithdrawal(w.id, 'completed')} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-[8px] font-black">DUYỆT</button>
                          <button onClick={() => handleActionWithdrawal(w.id, 'rejected')} className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-[8px] font-black">HỦY</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 max-w-4xl mx-auto">
             <div className="flex justify-between items-center mb-12">
                <h3 className="text-white font-black text-2xl uppercase tracking-tighter">QUẢN LÝ THÔNG BÁO</h3>
                <button 
                  onClick={handleClearAllAnnouncements}
                  className="bg-red-600/10 text-red-500 border border-red-500/20 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  XÓA TẤT CẢ THÔNG BÁO
                </button>
             </div>

             <div className="bg-[#0b0e14] p-10 rounded-[40px] border border-gray-800 shadow-2xl mb-16">
               <div className="space-y-6">
                  <input 
                    type="text" placeholder="Tiêu đề thông báo..." 
                    value={newAnn.title} onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
                    className="w-full bg-[#151a24] border border-gray-800 rounded-[24px] p-6 text-sm text-white outline-none focus:border-blue-500 transition-all" 
                  />
                  <textarea 
                    placeholder="Nội dung thông báo..." 
                    value={newAnn.content} onChange={(e) => setNewAnn({...newAnn, content: e.target.value})}
                    className="w-full bg-[#151a24] border border-gray-800 rounded-[24px] p-6 text-sm text-white h-48 outline-none focus:border-blue-500 transition-all resize-none"
                  ></textarea>
                  <button onClick={handleCreateAnn} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[24px] uppercase text-[12px] tracking-[0.2em] shadow-2xl transition-all">PHÁT HÀNH NGAY</button>
               </div>
             </div>

             <div className="space-y-4">
                <h4 className="text-gray-600 text-[10px] font-black uppercase tracking-widest ml-4 mb-6">DANH SÁCH HIỆN CÓ</h4>
                {announcements.map(a => (
                  <div key={a.id} className="bg-[#0b0e14] p-8 rounded-[32px] border border-gray-800 flex justify-between items-start group">
                    <div className="max-w-[80%]">
                      <p className="text-white font-black text-lg mb-2">{a.title}</p>
                      <p className="text-gray-500 text-sm leading-relaxed">{a.content}</p>
                      <p className="text-[9px] text-gray-700 font-bold uppercase mt-4 tracking-widest">
                        Ngày tạo: {new Date(a.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleDeleteAnnouncement(a.id)}
                      className="p-3 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-lg"
                      title="Xóa thông báo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                {announcements.length === 0 && <p className="text-center py-20 text-gray-600 font-bold">Không có thông báo nào.</p>}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
