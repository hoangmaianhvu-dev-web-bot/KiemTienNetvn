
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

  // Form states
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', reward: '', type: 'link', description: '', url: '', icon: '🔗' });
  const [annForm, setAnnForm] = useState({ title: '', content: '' });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'members') {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (data) setMembers(data);
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
    } catch (error) { console.error(error); }
    setLoading(false);
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annForm.title || !annForm.content) return alert('Vui lòng điền đủ thông tin');
    const { error } = await supabase.from('announcements').insert([annForm]);
    if (!error) {
      alert('Đã đăng thông báo!');
      setAnnForm({ title: '', content: '' });
      fetchData();
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!window.confirm('Xóa thông báo này?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    fetchData();
  };

  const handleAddTestMoney = async () => {
    const { error } = await supabase.from('profiles').update({ balance: 999999999 }).eq('id', profile.id);
    if (!error) {
      alert('Đã kích hoạt số dư Vô hạn cho Admin!');
      window.location.reload();
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...taskForm, reward: Number(taskForm.reward) };
    if (editingTaskId) {
      await supabase.from('tasks').update(payload).eq('id', editingTaskId);
    } else {
      await supabase.from('tasks').insert([payload]);
    }
    setEditingTaskId(null);
    setTaskForm({ title: '', reward: '', type: 'link', description: '', url: '', icon: '🔗' });
    fetchData();
  };

  const handleUpdateWithdrawal = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('withdrawals')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      alert('Cập nhật trạng thái thành công!');
      fetchData();
    } catch (err: any) {
      alert('Lỗi khi cập nhật: ' + err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🛡️ QUẢN TRỊ VIÊN</p>
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-black text-white">Bảng điều khiển</h1>
            <button onClick={handleAddTestMoney} className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-2 rounded-xl text-[10px] font-black hover:bg-yellow-500 hover:text-black transition-all">NẠP TIỀN TEST</button>
          </div>
        </div>
        <div className="bg-[#151a24] p-1.5 rounded-2xl border border-gray-800 flex shadow-2xl overflow-x-auto scrollbar-hide">
           {['members', 'withdrawals', 'tasks', 'announcements'].map((tab) => (
             <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)} 
                className={`px-6 py-3 rounded-xl text-[10px] font-black whitespace-nowrap transition-all ${activeTab === tab ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
             >
               {tab === 'members' ? 'THÀNH VIÊN' : tab === 'withdrawals' ? 'LỆNH RÚT' : tab === 'tasks' ? 'NHIỆM VỤ' : 'THÔNG BÁO'}
             </button>
           ))}
        </div>
      </div>

      {activeTab === 'announcements' && (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-[#151a24] p-8 rounded-[32px] border border-gray-800">
              <h3 className="text-xl font-bold text-white mb-6">Tạo thông báo mới</h3>
              <form onSubmit={handleCreateAnnouncement} className="space-y-4">
                <input type="text" value={annForm.title} onChange={e => setAnnForm({...annForm, title: e.target.value})} placeholder="Tiêu đề thông báo" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm" />
                <textarea value={annForm.content} onChange={e => setAnnForm({...annForm, content: e.target.value})} placeholder="Nội dung chi tiết..." className="w-full bg-gray-900 border border-gray-800 rounded-xl p-4 text-white text-sm h-40"></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl">ĐĂNG THÔNG BÁO</button>
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
            {announcements.map(ann => (
              <div key={ann.id} className="bg-[#151a24] p-6 rounded-3xl border border-gray-800 flex justify-between items-start group">
                <div>
                  <h4 className="text-white font-bold mb-2">{ann.title}</h4>
                  <p className="text-gray-500 text-sm whitespace-pre-wrap">{ann.content}</p>
                  <p className="text-[10px] text-gray-700 mt-4 font-bold">{new Date(ann.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => handleDeleteAnnouncement(ann.id)} className="text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-all font-bold">Xóa</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="bg-[#151a24] p-8 rounded-[32px] border border-gray-800 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">{editingTaskId ? 'Sửa nhiệm vụ' : 'Thêm nhiệm vụ'}</h3>
              <form onSubmit={handleSubmitTask} className="space-y-4">
                <input type="text" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} placeholder="Tiêu đề" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white text-sm" />
                <div className="grid grid-cols-2 gap-4">
                  <input type="number" value={taskForm.reward} onChange={e => setTaskForm({...taskForm, reward: e.target.value})} placeholder="Thưởng (đ)" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white text-sm" />
                  <select value={taskForm.type} onChange={e => setTaskForm({...taskForm, type: e.target.value as any})} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-white text-sm">
                    <option value="link">Link</option><option value="video">Video</option><option value="app">App</option><option value="social">Social</option>
                  </select>
                </div>
                <input type="text" value={taskForm.url} onChange={e => setTaskForm({...taskForm, url: e.target.value})} placeholder="Link URL" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white text-sm" />
                <textarea value={taskForm.description} onChange={e => setTaskForm({...taskForm, description: e.target.value})} placeholder="Mô tả" className="w-full bg-gray-900 border border-gray-800 rounded-xl p-3 text-white text-sm h-24"></textarea>
                <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl">{editingTaskId ? 'CẬP NHẬT' : 'TẠO MỚI'}</button>
                {editingTaskId && <button type="button" onClick={() => setEditingTaskId(null)} className="w-full text-gray-500 font-bold text-xs mt-2">Hủy chỉnh sửa</button>}
              </form>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-4">
             {tasks.map(t => (
               <div key={t.id} className="bg-[#151a24] p-6 rounded-3xl border border-gray-800 flex justify-between items-center group hover:border-blue-500/30 transition-all">
                  <div className="flex gap-4 items-center">
                    <div className="text-3xl">{t.icon}</div>
                    <div>
                      <h4 className="text-white font-bold">{t.title}</h4>
                      <p className="text-blue-500 font-black text-sm">{t.reward.toLocaleString()}đ • <span className="uppercase text-[9px] text-gray-600">{t.type}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => { setEditingTaskId(t.id); setTaskForm({...t, reward: t.reward.toString()}); }} className="bg-blue-600/10 text-blue-500 p-2 rounded-lg font-bold">Sửa</button>
                    <button onClick={() => { if(confirm('Xóa?')) supabase.from('tasks').delete().eq('id', t.id).then(() => fetchData()) }} className="bg-red-600/10 text-red-500 p-2 rounded-lg font-bold">Xóa</button>
                  </div>
               </div>
             ))}
          </div>
        </div>
      )}

      {(activeTab === 'members' || activeTab === 'withdrawals') && (
        <div className="bg-[#151a24] rounded-[40px] border border-gray-800 overflow-hidden shadow-2xl">
          <div className="p-10 overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">{activeTab === 'members' ? 'Thành viên' : 'Người rút'}</th>
                  <th className="pb-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">{activeTab === 'members' ? 'Số dư' : 'Thông tin thanh toán'}</th>
                  <th className="pb-6 text-gray-500 text-[10px] font-black uppercase tracking-widest">Trạng thái/Vai trò</th>
                  <th className="pb-6 text-gray-500 text-[10px] font-black uppercase tracking-widest text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {activeTab === 'members' ? members.map(m => (
                  <tr key={m.id} className="border-b border-gray-800/50">
                    <td className="py-6">
                      <p className="text-white font-bold">{m.full_name}</p>
                      <p className="text-gray-500 text-xs">{m.email}</p>
                    </td>
                    <td className="py-6 text-blue-500 font-black">{m.balance?.toLocaleString()}đ</td>
                    <td className="py-6"><span className={`px-3 py-1 rounded-full text-[8px] font-black ${m.role === 'admin' ? 'bg-red-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{m.role.toUpperCase()}</span></td>
                    <td className="py-6 text-right">---</td>
                  </tr>
                )) : withdrawals.map(w => (
                  <tr key={w.id} className="border-b border-gray-800/50">
                    <td className="py-6">
                      <p className="text-white font-bold">{w.profiles?.full_name}</p>
                      <p className="text-blue-500 font-black text-sm">{w.amount.toLocaleString()}đ</p>
                    </td>
                    <td className="py-6">
                      <p className="text-gray-400 text-xs font-bold uppercase">{w.method}</p>
                      {w.bank_name && <p className="text-gray-500 text-[10px]">{w.bank_name}</p>}
                      <p className="text-white text-xs font-mono">{w.account_number}</p>
                    </td>
                    <td className="py-6"><span className={`px-3 py-1 rounded-full text-[8px] font-black ${w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' : w.status === 'completed' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{w.status.toUpperCase()}</span></td>
                    <td className="py-6 text-right space-x-2">
                      {w.status === 'pending' && (
                        <>
                          <button onClick={() => handleUpdateWithdrawal(w.id, 'completed')} className="bg-green-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-green-700">DUYỆT</button>
                          <button onClick={() => handleUpdateWithdrawal(w.id, 'rejected')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-[10px] font-black hover:bg-red-700">HỦY</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {((activeTab === 'members' && members.length === 0) || (activeTab === 'withdrawals' && withdrawals.length === 0)) && (
              <div className="text-center py-20 text-gray-600 text-sm font-bold uppercase tracking-widest">Không có dữ liệu.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
