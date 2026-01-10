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

  // Thống kê hệ thống
  const [systemStats, setSystemStats] = useState({
    totalBalance: 0,
    totalEarned: 0,
    totalTasks: 0,
    totalMembers: 0
  });

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ 
    title: '', 
    reward: '', 
    type: 'offer' as any, 
    description: '', 
    url: '', 
    icon: '🔗' 
  });
  const [annForm, setAnnForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchData();
    if (activeTab !== 'members') fetchSystemStats();
  }, [activeTab]);

  const fetchSystemStats = async () => {
    const { data } = await supabase.from('profiles').select('balance, total_earned, tasks_completed, role');
    if (data) {
      const stats = data.reduce((acc: any, curr: any) => {
        if (curr.role === 'admin') return acc;
        return {
          totalBalance: acc.totalBalance + (Number(curr.balance) || 0),
          totalEarned: acc.totalEarned + (Number(curr.total_earned) || 0),
          totalTasks: acc.totalTasks + (Number(curr.tasks_completed) || 0),
          totalMembers: acc.totalMembers + 1
        };
      }, { totalBalance: 0, totalEarned: 0, totalTasks: 0, totalMembers: 0 });
      setSystemStats(stats);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'members') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) {
          setMembers(data);
          const stats = data.reduce((acc: any, curr: any) => {
            if (curr.role === 'admin') return acc;
            return {
              totalBalance: acc.totalBalance + (Number(curr.balance) || 0),
              totalEarned: acc.totalEarned + (Number(curr.total_earned) || 0),
              totalTasks: acc.totalTasks + (Number(curr.tasks_completed) || 0),
              totalMembers: acc.totalMembers + 1
            };
          }, { totalBalance: 0, totalEarned: 0, totalTasks: 0, totalMembers: 0 });
          setSystemStats(stats);
        }
      } else if (activeTab === 'withdrawals') {
        const { data } = await supabase.from('withdrawals').select('*, profiles(full_name, email)').order('created_at', { ascending: false });
        if (data) setWithdrawals(data);
      } else if (activeTab === 'tasks') {
        const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
        if (data) setTasks(data);
      } else if (activeTab === 'announcements') {
        const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
        if (data) setAnnouncements(data);
      }
    } catch (error) { console.error("Fetch error:", error); }
    setLoading(false);
  };

  const handleUpdateWithdrawal = async (id: string, status: string) => {
    if (!window.confirm(`Xác nhận ${status === 'completed' ? 'Duyệt' : 'Hủy'} yêu cầu này?`)) return;
    const { error } = await supabase.from('withdrawals').update({ status }).eq('id', id);
    if (!error) {
      alert('Đã cập nhật trạng thái lệnh rút');
      fetchData();
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return alert('Vui lòng điền đủ thông tin');
    const { error } = await supabase.from('announcements').insert([annForm]);
    if (!error) {
      alert('Đã đăng thông báo!');
      setAnnForm({ title: '', content: '' });
      fetchData();
    } else {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Bạn chắc chắn muốn xóa thông báo này?')) return;
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (!error) {
      alert('Đã xóa thông báo!');
      fetchData();
    } else {
      alert("Lỗi: " + error.message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa nhiệm vụ này?')) return;
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (!error) {
      alert('Xóa nhiệm vụ thành công!');
      fetchData();
    } else {
      alert("Lỗi khi xóa: " + error.message);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Lọc bỏ ID để tránh xung đột khi insert
    const { title, reward, type, description, url, icon } = taskForm;
    const payload = { 
      title, 
      reward: Number(reward), 
      type, 
      description, 
      url, 
      icon 
    };

    if (editingTaskId) {
      const { error } = await supabase.from('tasks').update(payload).eq('id', editingTaskId);
      if (error) {
        alert("Lỗi cập nhật: " + error.message);
      } else {
        alert("Cập nhật nhiệm vụ thành công!");
        setEditingTaskId(null);
        setTaskForm({ title: '', reward: '', type: 'offer', description: '', url: '', icon: '🔗' });
        fetchData();
      }
    } else {
      const { error } = await supabase.from('tasks').insert([payload]);
      if (error) {
        alert("Lỗi thêm mới: " + error.message);
      } else {
        alert("Thêm nhiệm vụ thành công!");
        setTaskForm({ title: '', reward: '', type: 'offer', description: '', url: '', icon: '🔗' });
        fetchData();
      }
    }
  };

  const handleAddTestMoney = async () => {
    const { error } = await supabase.from('profiles').update({ balance: 999999999, role: 'admin' }).eq('id', profile.id);
    if (!error) {
      alert('Đã kích hoạt quyền năng tối cao cho Admin!');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🛡️ HỆ THỐNG QUẢN TRỊ</p>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-white tracking-tight">Quản lý <span className="text-gray-500">KiemTienNet</span></h1>
            <button onClick={handleAddTestMoney} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-blue-500 hover:text-white transition-all">BOM TIỀN ADMIN</button>
          </div>
        </div>
        <div className="bg-[#151a24] p-1.5 rounded-[20px] border border-gray-800 flex shadow-2xl overflow-x-auto scrollbar-hide">
           {['members', 'withdrawals', 'tasks', 'announcements'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)} 
                className={`px-8 py-3.5 rounded-[16px] text-[11px] font-black whitespace-nowrap transition-all ${
                  activeTab === tab 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                  : 'text-gray-500 hover:text-white'
                }`}
             >
               {tab === 'members' ? 'THÀNH VIÊN' : tab === 'withdrawals' ? 'LỆNH RÚT' : tab === 'tasks' ? 'NHIỆM VỤ' : 'THÔNG BÁO'}
             </button>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {[
          { label: 'TỔNG SỐ DƯ USER', value: `${systemStats.totalBalance.toLocaleString()}đ`, icon: '💰', color: 'text-blue-500', bg: 'bg-blue-500/5' },
          { label: 'TỔNG THU NHẬP USER', value: `${systemStats.totalEarned.toLocaleString()}đ`, icon: '📈', color: 'text-green-500', bg: 'bg-green-500/5' },
          { label: 'TỔNG NHIỆM VỤ XONG', value: systemStats.totalTasks.toLocaleString(), icon: '✅', color: 'text-purple-500', bg: 'bg-purple-500/5' },
          { label: 'TỔNG THÀNH VIÊN', value: systemStats.totalMembers.toLocaleString(), icon: '👥', color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
        ].map((stat, i) => (
          <div key={i} className={`p-8 rounded-[40px] border border-gray-800 transition-all shadow-xl ${stat.bg} group hover:border-gray-600`}>
            <div className="bg-gray-800/50 w-12 h-12 flex items-center justify-center rounded-2xl text-2xl mb-6 group-hover:scale-110 transition-transform">
              {stat.icon}
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-700 font-bold uppercase text-[10px] tracking-widest animate-pulse">Đang truy xuất database...</div>
      ) : (
        <>
          {activeTab === 'announcements' && (
            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-1">
                <div className="bg-[#151a24] p-8 rounded-[32px] border border-gray-800 shadow-xl">
                  <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight">Tạo bảng tin mới</h3>
                  <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                    <input type="text" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} placeholder="Tiêu đề..." className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none" />
                    <textarea value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} placeholder="Nội dung..." className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm h-40 focus:border-blue-500 outline-none"></textarea>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-colors">PHÁT HÀNH</button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                {announcements.map(ann => (
                  <div key={ann.id} className="bg-[#151a24] p-6 rounded-3xl border border-gray-800 flex justify-between items-start group hover:border-gray-700 transition-all">
                    <div>
                      <h4 className="text-white font-bold mb-2">{ann.title}</h4>
                      <p className="text-gray-500 text-sm whitespace-pre-wrap leading-relaxed">{ann.content}</p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all font-black text-[10px] uppercase hover:underline">Xóa thông báo</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              <div className="lg:col-span-1">
                <div className="bg-[#151a24] p-8 rounded-[32px] border border-gray-800 sticky top-24 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white uppercase tracking-tight">{editingTaskId ? 'Cập nhật' : 'Thêm'} nhiệm vụ</h3>
                    {editingTaskId && <button onClick={() => { setEditingTaskId(null); setTaskForm({ title: '', reward: '', type: 'offer', description: '', url: '', icon: '🔗' }); }} className="text-[10px] font-black text-gray-500 hover:text-white uppercase">Hủy sửa</button>}
                  </div>
                  <form onSubmit={handleSubmitTask} className="space-y-4">
                    <input type="text" required value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="Tên nhiệm vụ" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none" />
                    <div className="grid grid-cols-2 gap-4">
                      <input type="number" required value={taskForm.reward} onChange={e => setTaskForm({...taskForm, reward: e.target.value})} placeholder="Thưởng (VNĐ)" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none" />
                      <select value={taskForm.type} onChange={e => setTaskForm({...taskForm, type: e.target.value as any})} className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none">
                        <option value="offer">Ưu đãi</option>
                        <option value="regular">Thường</option>
                        <option value="special">Đặc biệt</option>
                        <option value="social">Mạng xã hội</option>
                      </select>
                    </div>
                    <input type="text" required value={taskForm.url} onChange={e => setTaskForm({...taskForm, url: e.target.value})} placeholder="Đường dẫn" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm focus:border-blue-500 outline-none" />
                    <textarea required value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} placeholder="Hướng dẫn..." className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm h-24 focus:border-blue-500 outline-none"></textarea>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/20">{editingTaskId ? 'CẬP NHẬT' : 'PHÊ DUYỆT'}</button>
                  </form>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-4">
                 {tasks.map(t => (
                   <div key={t.id} className="bg-[#151a24] p-6 rounded-3xl border border-gray-800 flex justify-between items-center group hover:border-blue-500/20 transition-all shadow-lg">
                      <div className="flex gap-4 items-center">
                        <div className="bg-gray-900 w-14 h-14 flex items-center justify-center rounded-2xl text-2xl border border-gray-800">{t.icon || '🔗'}</div>
                        <div>
                          <h4 className="text-white font-bold">{t.title}</h4>
                          <p className="text-blue-500 font-black text-sm">+{Number(t.reward).toLocaleString()}đ - <span className="text-gray-600 text-[10px] uppercase">{t.type}</span></p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setEditingTaskId(t.id); setTaskForm({...t, reward: t.reward.toString()}); }} className="bg-blue-600/10 text-blue-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase">Sửa</button>
                        <button onClick={() => handleDeleteTask(t.id)} className="bg-red-600/10 text-red-500 px-4 py-2 rounded-xl font-black text-[10px] uppercase">Xóa</button>
                      </div>
                   </div>
                 ))}
                 {tasks.length === 0 && <div className="text-center py-10 text-gray-600">Chưa có nhiệm vụ nào</div>}
              </div>
            </div>
          )}

          {(activeTab === 'members' || activeTab === 'withdrawals') && (
            <div className="bg-[#151a24] rounded-[48px] border border-gray-800 overflow-hidden shadow-2xl animate-in fade-in duration-500">
              <div className="p-10 overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="pb-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">{activeTab === 'members' ? 'Người dùng' : 'Tên & Số tiền'}</th>
                      <th className="pb-8 text-gray-500 text-[10px] font-black uppercase tracking-widest">Trạng thái</th>
                      <th className="pb-8 text-gray-500 text-[10px] font-black uppercase tracking-widest text-right">Quản lý</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'members' ? members.map(m => (
                      <tr key={m.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                        <td className="py-6">
                          <p className="text-white font-bold">{m.full_name}</p>
                          <p className="text-blue-500 font-black text-sm">{m.balance?.toLocaleString()}đ</p>
                        </td>
                        <td className="py-6"><span className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest ${m.role === 'admin' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{m.role.toUpperCase()}</span></td>
                        <td className="py-6 text-right">
                           <button className="text-gray-700 hover:text-white transition-colors">⋮</button>
                        </td>
                      </tr>
                    )) : withdrawals.map(w => (
                      <tr key={w.id} className="border-b border-gray-800/50 hover:bg-white/[0.02] transition-colors">
                        <td className="py-6">
                          <p className="text-white font-bold">{w.profiles?.full_name}</p>
                          <p className="text-blue-500 font-black">{Number(w.amount).toLocaleString()}đ</p>
                        </td>
                        <td className="py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black tracking-widest uppercase ${
                            w.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                            w.status === 'completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {w.status === 'pending' ? 'Đang chờ' : w.status === 'completed' ? 'Đã duyệt' : 'Đã hủy'}
                          </span>
                        </td>
                        <td className="py-6 text-right">
                          {w.status === 'pending' && (
                            <div className="flex gap-2 justify-end">
                              <button onClick={() => handleUpdateWithdrawal(w.id, 'completed')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">DUYỆT</button>
                              <button onClick={() => handleUpdateWithdrawal(w.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black">HỦY</button>
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
        </>
      )}
    </div>
  );
};

export default AdminPage;