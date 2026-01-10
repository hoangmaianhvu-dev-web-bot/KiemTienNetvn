
import React, { useState, useEffect } from 'react';
import { UserProfile, Task, Announcement } from '../types';
import { supabase } from '../supabase';

interface AdminPageProps {
  profile: UserProfile;
}

const REAL_10_TASKS = [
  { title: 'Nhiệm vụ 1 (Link4m)', reward: 200, max_per_day: 2, type: 'ƯU ĐÃI', icon: '💎', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: LINK4M' },
  { title: 'Nhiệm vụ 2 (YeuMoney)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: YEUMONEY' },
  { title: 'Nhiệm vụ 3 (Linktot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', json_key: 'url', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: LINKTOT' },
  { title: 'Nhiệm vụ 4 (4mmo)', reward: 200, max_per_day: 2, type: 'ĐẶC BIỆT', icon: '🔥', api_url: 'https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: 4MMO' },
  { title: 'Nhiệm vụ 5 (Xlink)', reward: 200, max_per_day: 2, type: 'MXH', icon: '📱', api_url: 'https://xlink.co/api?token=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', json_key: 'url', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: XLINK' },
  { title: 'Nhiệm vụ 6 (Linkngon)', reward: 200, max_per_day: 5, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', json_key: 'url', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: LINKNGON' },
  { title: 'Nhiệm vụ 7 (TrafficTot)', reward: 200, max_per_day: 3, type: 'ĐẶC BIỆT', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten?api_key=8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', method: 'POST', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: TRAFFICTOT' },
  { title: 'Nhiệm vụ 8 (Kiemtienngay)', reward: 200, max_per_day: 2, type: 'MXH', icon: '📱', api_url: 'https://kiemtienngay.com/apiv1?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: KIEMTIENNGAY' },
  { title: 'Nhiệm vụ 9 (Layma)', reward: 200, max_per_day: 2, type: 'ƯU ĐÃI', icon: '💎', api_url: 'https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=f4b53bc4126c32ec5b7211a7430ba898&format=json&url=', method: 'GET', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: LAYMA' },
  { title: 'Nhiệm vụ 10 (Yeulink)', reward: 200, max_per_day: 4, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', json_key: 'shortenedUrl', url: 'https://avudev-verifi.blogspot.com/', description: 'NGUỒN: YEULINK' },
];

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
        description: newTask.description || `NGUỒN: ${newTask.type}`
      }]);
      if (error) throw error;
      alert("Nhiệm vụ đã được phê duyệt!");
      setNewTask({ title: '', reward: '200', type: 'THƯỜNG', icon: '🔗', url: 'https://avudev-verifi.blogspot.com/', max_per_day: '5', api_url: '', method: 'GET', description: '' });
      fetchData();
    } catch (err: any) { alert("Lỗi: " + err.message); }
    finally { setLoading(false); }
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

  const handleActionWithdrawal = async (id: string, status: 'completed' | 'rejected') => {
    try {
      await supabase.from('withdrawals').update({ status }).eq('id', id);
      alert("Đã cập nhật trạng thái lệnh rút!");
      fetchData();
    } catch (e) {}
  };

  const handleResetTo10Tasks = async () => {
    if (!window.confirm("Xóa tất cả nhiệm vụ hiện tại và nạp 10 nhiệm vụ rút gọn link chuẩn?")) return;
    setLoading(true);
    try {
      await supabase.from('tasks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      const { error } = await supabase.from('tasks').insert(REAL_10_TASKS);
      if (error) throw error;
      alert("Đã nạp 10 nhiệm vụ thành công!");
      fetchData();
    } catch (err: any) { alert("Lỗi: " + err.message); }
    finally { setLoading(false); }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Xóa nhiệm vụ này?")) return;
    await supabase.from('tasks').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Giống Ảnh */}
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

        {/* Tab Menu Giống Ảnh */}
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

      {/* Stats Cards Giống Ảnh */}
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
        {activeTab === 'members' && (
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
        )}

        {activeTab === 'withdrawals' && (
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
        )}

        {activeTab === 'tasks' && (
          <div className="p-10 grid lg:grid-cols-12 gap-10">
            {/* Form Thêm Nhiệm Vụ Đúng Ảnh Mẫu */}
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
                      type="text" placeholder="Icon (Emoji)" 
                      value={newTask.icon} onChange={(e) => setNewTask({...newTask, icon: e.target.value})}
                      className="w-full bg-[#151a24] border border-gray-800 rounded-[20px] p-6 text-sm text-white focus:border-blue-500 outline-none text-center" 
                    />
                  </div>
                  <input 
                    type="text" placeholder="Đường dẫn đích" 
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
                  <button 
                    onClick={handleResetTo10Tasks} 
                    className="w-full bg-gray-800/30 hover:bg-gray-800 text-gray-600 font-black py-4 rounded-[20px] uppercase text-[9px] tracking-[0.1em] transition-all"
                  >
                    CÀI LẠI 10 NHIỆM VỤ MẪU
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4 max-h-[800px] overflow-y-auto pr-2 scrollbar-hide">
               {tasks.map(t => (
                 <div key={t.id} className="bg-[#0b0e14] p-8 rounded-[32px] border border-gray-800 flex justify-between items-center group hover:border-blue-500/20 transition-all">
                    <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center text-xl text-gray-500 border border-gray-800">{t.icon}</div>
                      <div>
                        <h4 className="text-white font-black text-lg tracking-tight">{t.title}</h4>
                        <p className="text-blue-500 font-black text-sm">+{t.reward.toLocaleString()}đ <span className="text-gray-700 text-[10px] uppercase ml-2 tracking-widest">- {t.type} | Max: {t.max_per_day}</span></p>
                      </div>
                    </div>
                    <button onClick={() => handleDeleteTask(t.id)} className="text-red-900 font-black text-[10px] uppercase tracking-widest hover:text-red-500 transition-colors">XÓA</button>
                 </div>
               ))}
            </div>
          </div>
        )}

        {activeTab === 'announcements' && (
          <div className="p-10 max-w-2xl mx-auto">
             <h3 className="text-white font-black text-2xl mb-12 uppercase tracking-tighter">PHÁT HÀNH THÔNG BÁO</h3>
             <div className="space-y-6">
                <input 
                  type="text" placeholder="Tiêu đề thông báo..." 
                  value={newAnn.title} onChange={(e) => setNewAnn({...newAnn, title: e.target.value})}
                  className="w-full bg-[#0b0e14] border border-gray-800 rounded-[24px] p-6 text-sm text-white outline-none focus:border-blue-500 transition-all" 
                />
                <textarea 
                  placeholder="Nội dung thông báo..." 
                  value={newAnn.content} onChange={(e) => setNewAnn({...newAnn, content: e.target.value})}
                  className="w-full bg-[#0b0e14] border border-gray-800 rounded-[24px] p-6 text-sm text-white h-48 outline-none focus:border-blue-500 transition-all resize-none"
                ></textarea>
                <button onClick={handleCreateAnn} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[24px] uppercase text-[12px] tracking-[0.2em] shadow-2xl transition-all">PHÁT HÀNH NGAY</button>
             </div>

             <div className="mt-16 space-y-4">
                <h4 className="text-gray-700 text-[10px] font-black uppercase tracking-widest mb-6">LỊCH SỬ THÔNG BÁO</h4>
                {announcements.map(a => (
                  <div key={a.id} className="bg-[#0b0e14] p-6 rounded-3xl border border-gray-800">
                     <p className="text-white font-bold text-sm mb-2">{a.title}</p>
                     <p className="text-gray-600 text-xs line-clamp-2">{a.content}</p>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
