
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// 1. ĐỊNH NGHĨA 10 MÃ UUID CỐ ĐỊNH THEO CHUẨN 8-4-4-4-12
const TASK_IDS = [
  "550e8400-e29b-41d4-a716-446655440001", // Link4m
  "550e8400-e29b-41d4-a716-446655440002", // YeuMoney
  "550e8400-e29b-41d4-a716-446655440003", // LaymaNet
  "550e8400-e29b-41d4-a716-446655440004", // KiemTienNgay
  "550e8400-e29b-41d4-a716-446655440005", // 4MMO
  "550e8400-e29b-41d4-a716-446655440006", // LinkTot
  "550e8400-e29b-41d4-a716-446655440007", // XLink
  "550e8400-e29b-41d4-a716-446655440008", // LinkNgonIO
  "550e8400-e29b-41d4-a716-446655440009", // TrafficTot
  "550e8400-e29b-41d4-a716-446655440010"  // Yeulink
];

const DEST_URL = "https://avudev-verifi.blogspot.com/";

const HARDCODED_TASKS: Task[] = [
  { id: TASK_IDS[0], title: 'Nhiệm vụ 1 (Link4m)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M', url: DEST_URL, json_key: 'shortenedUrl' },
  { id: TASK_IDS[1], title: 'Nhiệm vụ 2 (YeuMoney)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY', url: DEST_URL, json_key: 'shortenedUrl' },
  { id: TASK_IDS[2], title: 'Nhiệm vụ 3 (LaymaNet)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://layma.net/api?api=f4b53bc4126c32ec5b7211a7430ba898&url=', method: 'GET', description: 'LAYMANET', url: DEST_URL, json_key: 'shortenedUrl' },
  { id: TASK_IDS[3], title: 'Nhiệm vụ 4 (KiemTienNgay)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.vn/api?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY', url: DEST_URL, json_key: 'shortenedUrl' },
  { id: TASK_IDS[4], title: 'Nhiệm vụ 5 (4MMO)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.vn/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: 'MMO4', url: DEST_URL, json_key: 'shortenedUrl' },
  { id: TASK_IDS[5], title: 'Nhiệm vụ 6 (LinkTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT', url: DEST_URL, json_key: 'url' },
  { id: TASK_IDS[6], title: 'Nhiệm vụ 7 (XLink)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.top/api?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK', url: DEST_URL, json_key: 'url' },
  { id: TASK_IDS[7], title: 'Nhiệm vụ 8 (LinkNgonIO)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', description: 'LINKNGONIO', url: DEST_URL, json_key: 'url' },
  { id: TASK_IDS[8], title: 'Nhiệm vụ 9 (TrafficTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten', method: 'POST', description: 'TRAFFICTOT', url: DEST_URL, apiKey: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', json_key: 'shortenedUrl' },
  { id: TASK_IDS[9], title: 'Nhiệm vụ 10 (Yeulink)', reward: 200, max_per_day: 4, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', description: 'YEULINK', url: DEST_URL, json_key: 'shortenedUrl' },
];

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [customTasks, setCustomTasks] = useState<Task[]>([]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      // 1. Lấy nhiệm vụ ĐẶC BIỆT từ database
      const { data: dbTasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (dbTasks) setCustomTasks(dbTasks);

      // 2. Đếm lượt đã hoàn thành của người dùng hôm nay
      const { data: sessions } = await supabase
        .from('task_sessions')
        .select('task_id')
        .eq('user_id', profile.id)
        .eq('is_completed', true)
        .gte('created_at', today);

      if (sessions) {
        const counts: Record<string, number> = {};
        sessions.forEach((s: any) => {
          counts[s.task_id] = (counts[s.task_id] || 0) + 1;
        });
        setCompletedCounts(counts);
      }
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu:", e);
    }
    setLoading(false);
  };

  const startTask = async (task: Task) => {
    setIsProcessing(task.id);
    try {
      const done = completedCounts[task.id] || 0;
      if (done >= task.max_per_day) {
        alert("Bạn đã đạt giới hạn lượt làm nhiệm vụ này hôm nay!");
        setIsProcessing(null);
        return;
      }

      const token = Math.floor(100000 + Math.random() * 900000).toString();
      let userIp = '0.0.0.0';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {}

      // LƯU SESSION VỚI UUID VÀO DB
      const { error: sessionError } = await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: token,
        task_id: task.id,
        is_completed: false,
        user_ip: userIp
      }]);

      if (sessionError) throw sessionError;

      localStorage.setItem('mmo_user_id', profile.id);
      let shortUrl = "";

      if (task.method === 'POST') {
        const res = await fetch(task.api_url!, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            api_key: task.apiKey || "", 
            url: DEST_URL 
          })
        });
        const json = await res.json();
        shortUrl = json[task.json_key || 'shortenedUrl'] || json.url;
      } else if (task.api_url) {
        // Sử dụng AllOrigins proxy để tránh lỗi CORS cho các API Link
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(task.api_url + encodeURIComponent(DEST_URL))}`;
        const res = await fetch(proxyUrl);
        const json = await res.json();
        const apiData = JSON.parse(json.contents);
        shortUrl = apiData[task.json_key || 'shortenedUrl'] || apiData.url || apiData.shortlink;
      }

      if (shortUrl) {
        localStorage.setItem(`started_${task.id}`, 'true');
        window.open(shortUrl, '_blank');
        setVerifyingTaskId(task.id);
      } else {
        // Fallback
        window.open(task.url || DEST_URL, '_blank');
        setVerifyingTaskId(task.id);
      }
    } catch (err: any) {
      alert("Lỗi kết nối API nhà cung cấp. Vui lòng thử lại sau!");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async (taskId: string) => {
    if (verificationCode.length !== 6) return alert("Mã xác nhận gồm 6 chữ số!");
    setIsProcessing(taskId);
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        p_user_id: profile.id,
        p_token: verificationCode.trim()
      });

      if (error) throw error;

      if (data && data.success) {
        alert(`Thành công! +${data.reward.toLocaleString()}đ đã được cộng vào ví.`);
        resetState(taskId);
        fetchData();
        refreshProfile();
      } else {
        alert(data?.message || "Mã xác nhận không chính xác.");
      }
    } catch (err: any) {
      alert("Lỗi xác minh hệ thống.");
    } finally {
      setIsProcessing(null);
    }
  };

  const resetState = (taskId: string) => {
    setVerificationCode('');
    setVerifyingTaskId(null);
    localStorage.removeItem(`started_${taskId}`);
  };

  const handleDeleteCustom = async (taskId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn nhiệm vụ đặc biệt này khỏi hệ thống?")) return;
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', taskId);
      if (error) throw error;
      setCustomTasks(customTasks.filter(t => t.id !== taskId));
    } catch (e) {
      alert("Lỗi khi xóa nhiệm vụ.");
    }
  };

  const renderTaskCard = (task: Task, isCustom: boolean = false) => {
    const done = completedCounts[task.id] || 0;
    const remain = task.max_per_day - done;
    const isFull = remain <= 0;
    const hasStarted = verifyingTaskId === task.id;

    return (
      <div key={task.id} className={`bg-[#151a24] rounded-[38px] p-8 border transition-all duration-500 relative overflow-hidden group flex flex-col justify-between min-h-[380px] ${
        isFull ? 'border-red-900/10 opacity-50 grayscale' : 
        hasStarted ? 'border-blue-500 shadow-2xl bg-blue-500/5' : 
        'border-gray-800 hover:border-gray-700 shadow-xl'
      }`}>
        {isCustom && profile.role === 'admin' && (
          <button 
            onClick={() => handleDeleteCustom(task.id)}
            className="absolute top-6 right-6 text-gray-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-20 p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        )}

        <div className="flex justify-between items-start">
          <div className="w-14 h-14 rounded-2xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            {task.icon || '🎯'}
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black ${isFull ? 'text-gray-600' : 'text-blue-500'}`}>+200đ</p>
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">GIÁ THƯỞNG</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-black text-white mb-4 tracking-tight leading-tight line-clamp-2">{task.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="bg-gray-800/80 text-gray-500 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest truncate max-w-[100px]">
              {task.description || 'HỆ THỐNG'}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
              isFull ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              CÒN: {remain}/{task.max_per_day}
            </span>
          </div>
        </div>

        <div>
          {hasStarted ? (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <input 
                type="text" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                placeholder="MÃ 6 SỐ" 
                className="w-full bg-gray-900 border border-blue-500/30 rounded-2xl py-4 text-white text-center font-black tracking-[0.4em] text-lg focus:border-blue-500 outline-none" 
              />
              <div className="flex gap-2">
                <button onClick={() => handleVerify(task.id)} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">XÁC NHẬN</button>
                <button onClick={() => resetState(task.id)} className="bg-gray-800 text-gray-500 px-5 py-4 rounded-2xl font-black text-[10px] uppercase hover:text-white transition-all">HỦY</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => startTask(task)}
              disabled={isProcessing !== null || isFull}
              className={`w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest transition-all ${
                isFull 
                ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                : 'bg-[#1e2530] hover:bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {isProcessing === task.id ? 'ĐANG KHỞI TẠO...' : isFull ? 'ĐÃ HẾT LƯỢT' : 'LÀM NHIỆM VỤ →'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-16">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
           <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> MMO AUTOMATION SYSTEM 2025
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Nhiệm vụ <span className="text-gray-500/50">Đồng giá 200đ</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-2xl leading-relaxed text-xs">
          Hoàn thành các thử thách vượt link bên dưới để tích lũy số dư nhanh chóng. Hệ thống tự động reset lượt làm vào lúc 00:00 mỗi ngày.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
        {/* CỘT 1: NV THƯỜNG */}
        <div>
           <div className="flex items-center gap-4 mb-10 pl-2">
              <div className="bg-blue-600/10 p-3 rounded-2xl border border-blue-500/20 text-blue-500">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">NV THƯỜNG</h2>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">10 Nhà cung cấp cố định hàng ngày</p>
              </div>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {HARDCODED_TASKS.map(task => renderTaskCard(task))}
           </div>
        </div>

        {/* CỘT 2: NV ĐẶC BIỆT */}
        <div>
           <div className="flex items-center gap-4 mb-10 pl-2">
              <div className="bg-purple-600/10 p-3 rounded-2xl border border-purple-500/20 text-purple-500">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" /></svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">NV ĐẶC BIỆT</h2>
                <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest">Các nhiệm vụ tự nhập thủ công</p>
              </div>
           </div>

           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {customTasks.length > 0 ? (
                customTasks.map(task => renderTaskCard(task, true))
              ) : (
                <div className="col-span-full py-24 bg-[#151a24] rounded-[48px] border border-gray-800 border-dashed flex flex-col items-center justify-center text-center px-10 opacity-40">
                   <span className="text-5xl mb-6">🎁</span>
                   <p className="text-white font-black uppercase tracking-widest text-[10px]">Chưa có nhiệm vụ đặc biệt khả dụng</p>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* CẢNH BÁO CUỐI TRANG */}
      <div className="mt-24 p-12 bg-red-900/10 border border-red-500/20 rounded-[48px] shadow-2xl">
         <div className="flex items-start gap-8">
            <span className="text-4xl">⚠️</span>
            <div className="space-y-2">
              <p className="text-red-500 text-sm font-black uppercase tracking-widest">Lưu ý quan trọng</p>
              <p className="text-red-500/80 text-xs font-bold leading-relaxed">
                Mỗi nhiệm vụ chỉ được tính lượt làm trong ngày. Tuyệt đối không gian lận bằng VPN/Proxy, nếu phát hiện hệ thống sẽ khóa tài khoản vĩnh viễn và không thanh toán tiền. Mọi hành vi spam mã xác nhận sẽ bị xử lý nghiêm khắc.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TasksPage;
