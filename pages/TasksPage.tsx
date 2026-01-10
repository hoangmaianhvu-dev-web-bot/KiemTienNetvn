
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

type TaskCategory = 'ALL' | 'ƯU ĐÃI' | 'THƯỜNG' | 'ĐẶC BIỆT' | 'MXH';

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeCategory, setActiveCategory] = useState<TaskCategory>('ALL');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const [tasksRes, statsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('task_sessions')
          .select('task_id')
          .eq('user_id', profile.id)
          .eq('is_completed', true)
          .gte('created_at', todayStr)
      ]);

      if (tasksRes.data) setTasks(tasksRes.data);
      
      if (statsRes.data) {
        const counts: Record<string, number> = {};
        statsRes.data.forEach((session: any) => {
          counts[session.task_id] = (counts[session.task_id] || 0) + 1;
        });
        setCompletedCounts(counts);
      }
    } catch (e) {}
    setLoading(false);
  };

  const filteredTasks = activeCategory === 'ALL' 
    ? tasks 
    : tasks.filter(t => t.type?.toUpperCase() === activeCategory);

  const startTask = async (task: Task) => {
    setIsProcessing(task.id);
    try {
      const currentCount = completedCounts[task.id] || 0;
      if (currentCount >= task.max_per_day) {
        alert(`Bạn đã hết lượt làm nhiệm vụ này hôm nay!`);
        setIsProcessing(null);
        return;
      }

      // Lấy IP
      let userIp = '0.0.0.0';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {}

      const sessionToken = Math.floor(100000 + Math.random() * 900000).toString();

      await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: sessionToken,
        task_id: task.id,
        is_completed: false,
        user_ip: userIp
      }]);

      const destination = "https://avudev-verifi.blogspot.com/";
      let shortUrl = "";

      if (task.api_url) {
        try {
          const isPost = task.method === "POST" || task.title.includes('TrafficTot');
          
          if (isPost) {
            const response = await fetch(task.api_url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ url: destination })
            });
            const json = await response.json();
            shortUrl = json.shortenedUrl || json.url || (json.data && json.data.short_url);
          } else {
            const response = await fetch(task.api_url + encodeURIComponent(destination));
            const json = await response.json();
            
            // Nhận diện Key theo loại
            const title = task.title.toUpperCase();
            if (title.includes('LINK4M') || title.includes('YEUMONEY') || title.includes('LAYMA') || title.includes('KIEMTIENNGAY') || title.includes('4MMO') || title.includes('YEULINK')) {
              shortUrl = json.shortenedUrl || json.shortlink;
            } else if (title.includes('LINKTOT') || title.includes('XLINK') || title.includes('LINKNGON')) {
              shortUrl = json.url;
            } else {
              shortUrl = json.shortenedUrl || json.url || json.shortlink;
            }
          }
        } catch (apiErr) {
          console.warn("API Error, fallback activated");
        }
      }

      if (shortUrl && shortUrl.startsWith('http')) {
        localStorage.setItem(`started_${task.id}`, 'true');
        window.location.href = shortUrl;
      } else {
        localStorage.setItem(`started_${task.id}`, 'true');
        window.location.href = task.url || destination;
      }
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async (taskId: string) => {
    if (verificationCode.length !== 6) return alert("Vui lòng nhập đúng mã 6 số!");
    setIsProcessing(taskId);
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        p_user_id: profile.id,
        p_token: verificationCode
      });

      if (error) throw error;

      if (data.success) {
        alert(`THÀNH CÔNG! +${data.reward.toLocaleString()}đ.`);
        resetState(taskId);
        fetchData();
        refreshProfile();
      } else {
        alert(data.message || "Mã không đúng.");
      }
    } catch (err: any) {
      alert("Lỗi xác minh.");
    } finally {
      setIsProcessing(null);
    }
  };

  const resetState = (taskId: string) => {
    setVerificationCode('');
    setVerifyingTaskId(null);
    localStorage.removeItem(`started_${taskId}`);
  };

  const categories: {id: TaskCategory, label: string, color: string}[] = [
    { id: 'ALL', label: 'TẤT CẢ', color: 'bg-blue-600' },
    { id: 'ƯU ĐÃI', label: 'ƯU ĐÃI', color: 'bg-cyan-500' },
    { id: 'THƯỜNG', label: 'THƯỜNG', color: 'bg-gray-600' },
    { id: 'ĐẶC BIỆT', label: 'ĐẶC BIỆT', color: 'bg-purple-600' },
    { id: 'MXH', label: 'MXH', color: 'bg-pink-600' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
        <div>
          <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-4">
            Nhiệm vụ <span className="text-gray-500">Rút gọn link</span>
          </h1>
          <p className="text-gray-500 font-bold max-w-xl leading-relaxed text-[11px] uppercase tracking-wider">Làm nhiệm vụ để tích lũy số dư. Giới hạn làm việc reset sau 00:00 hàng ngày.</p>
        </div>

        <div className="bg-[#151a24] p-1.5 rounded-[24px] border border-gray-800 flex shadow-2xl overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-3 rounded-[20px] text-[10px] font-black whitespace-nowrap transition-all duration-300 ${
                activeCategory === cat.id 
                ? `${cat.color} text-white shadow-lg` 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quy định Giống Ảnh */}
      <div className="bg-[#151a24] rounded-[48px] p-10 md:p-14 border border-blue-500/10 mb-16 shadow-2xl relative overflow-hidden group">
        <h3 className="text-white font-black text-2xl mb-12 flex items-center gap-4 tracking-tight">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"></span>
          Quy định & Hướng dẫn:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
          <div className="flex gap-6">
            <span className="text-blue-500 font-black text-xl leading-none">1.</span>
            <p className="text-gray-500 text-sm font-bold leading-relaxed">Giới hạn nhiệm vụ tính riêng cho từng người dùng và reset lúc <span className="text-blue-500">00:00 ngày hôm sau</span>.</p>
          </div>
          <div className="flex gap-6">
            <span className="text-blue-500 font-black text-xl leading-none">3.</span>
            <p className="text-gray-500 text-sm font-bold leading-relaxed">Nếu link lỗi hoặc quên lấy mã, hãy bấm nút <span className="text-red-500">Làm lại</span> để xóa trạng thái và thực hiện lại.</p>
          </div>
          <div className="flex gap-6">
            <span className="text-blue-500 font-black text-xl leading-none">2.</span>
            <p className="text-gray-500 text-sm font-bold leading-relaxed">Lấy mã xác nhận <span className="text-white">6 số</span> nằm ở cuối mỗi bài viết tại trang đích.</p>
          </div>
          <div className="flex gap-6">
            <span className="text-blue-500 font-black text-xl leading-none">4.</span>
            <p className="text-gray-500 text-sm font-bold leading-relaxed">Tuyệt đối không sử dụng Proxy/VPN hoặc Tool tự động, tài khoản vi phạm sẽ bị <span className="text-[#ef4444]">Ban vĩnh viễn</span>.</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-[#151a24] h-[450px] rounded-[48px] border border-gray-800 animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTasks.map((task) => {
            const done = completedCounts[task.id] || 0;
            const remaining = task.max_per_day - done;
            const isFull = remaining <= 0;
            const hasStarted = localStorage.getItem(`started_${task.id}`) === 'true';
            const catColor = categories.find(c => c.id === task.type?.toUpperCase())?.color || 'bg-blue-600';

            return (
              <div key={task.id} className={`bg-[#151a24] rounded-[48px] p-12 border ${isFull ? 'border-red-900/10 opacity-60' : 'border-gray-800 hover:border-blue-500/30'} transition-all shadow-2xl flex flex-col justify-between min-h-[460px] group relative overflow-hidden`}>
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-[24px] bg-[#0b0e14] border border-gray-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                    {task.icon}
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black ${isFull ? 'text-gray-600' : 'text-blue-500'}`}>+{task.reward.toLocaleString()}đ</p>
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NHANH</p>
                  </div>
                </div>

                <div className="mt-10">
                  <h3 className="text-3xl font-black text-white mb-5 tracking-tight leading-tight">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-10">
                    <span className={`${catColor}/10 ${catColor.replace('bg-', 'text-')} px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${catColor.replace('bg-', 'border-')}/20`}>
                      {task.type || 'THƯỜNG'}
                    </span>
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${isFull ? 'bg-red-500/5 text-red-500 border-red-500/20' : 'bg-white/5 text-gray-500 border-white/10'}`}>
                      {remaining}/{task.max_per_day} LƯỢT CÒN LẠI
                    </span>
                  </div>
                </div>

                <div>
                  {verifyingTaskId === task.id ? (
                    <div className="space-y-4 animate-in slide-in-from-top-4">
                      <input 
                        type="text" 
                        value={verificationCode} 
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                        placeholder="NHẬP MÃ 6 SỐ" 
                        className="w-full bg-[#0b0e14] border border-blue-500/30 rounded-2xl py-6 text-white text-center font-black tracking-[0.5em] text-2xl focus:border-blue-500 outline-none" 
                      />
                      <div className="flex gap-3">
                        <button onClick={() => handleVerify(task.id)} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl">XÁC NHẬN</button>
                        <button onClick={() => resetState(task.id)} className="bg-gray-800 text-gray-500 px-5 py-2 rounded-xl font-black text-[10px] uppercase">LÀM LẠI</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { if (hasStarted) setVerifyingTaskId(task.id); else startTask(task); }}
                      disabled={isProcessing !== null || isFull}
                      className={`w-full py-5 rounded-2xl font-black text-[13px] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 shadow-xl ${
                        isFull 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                        : 'bg-[#1e2530] hover:bg-blue-600 text-white shadow-blue-900/10'
                      }`}
                    >
                      {isProcessing === task.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : isFull ? 'ĐÃ HẾT LƯỢT' : hasStarted ? 'NHẬP MÃ XÁC NHẬN →' : 'LÀM NHIỆM VỤ →'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
