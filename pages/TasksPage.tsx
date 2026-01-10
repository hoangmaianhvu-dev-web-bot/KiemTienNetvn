
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// CẤU HÌNH 10 NHIỆM VỤ CỨNG (ADMIN_CONFIG)
const TASKS_CONFIG: Task[] = [
  // Added required 'url' property to satisfy the Task interface for each hardcoded task
  { id: 'task_1', title: 'Nhiệm vụ 1 (Link4m)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_2', title: 'Nhiệm vụ 2 (YeuMoney)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_3', title: 'Nhiệm vụ 3 (Linktot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_4', title: 'Nhiệm vụ 4 (4mmo)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: 'MMO4', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_5', title: 'Nhiệm vụ 5 (Xlink)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.co/api?token=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_6', title: 'Nhiệm vụ 6 (Linkngon)', reward: 200, max_per_day: 5, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', description: 'LINKNGONIO', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_7', title: 'Nhiệm vụ 7 (TrafficTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten?api_key=8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', method: 'POST', description: 'TRAFFICTOT', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_8', title: 'Nhiệm vụ 8 (Kiemtienngay)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.com/apiv1?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_9', title: 'Nhiệm vụ 9 (Layma)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=f4b53bc4126c32ec5b7211a7430ba898&format=json&url=', method: 'GET', description: 'LAYMANET', url: 'https://avudev-verifi.blogspot.com/' },
  { id: 'task_10', title: 'Nhiệm vụ 10 (Yeulink)', reward: 200, max_per_day: 4, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', description: 'YEULINK', url: 'https://avudev-verifi.blogspot.com/' },
];

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessionData();
  }, []);

  const fetchSessionData = async () => {
    setLoading(true);
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      // Chỉ truy vấn task_sessions cho User ID cụ thể (mặc định profile.id)
      const { data, error } = await supabase
        .from('task_sessions')
        .select('task_id')
        .eq('user_id', profile.id)
        .eq('is_completed', true)
        .gte('created_at', todayStr);

      if (error) throw error;

      if (data) {
        const counts: Record<string, number> = {};
        data.forEach((session: any) => {
          counts[session.task_id] = (counts[session.task_id] || 0) + 1;
        });
        setCompletedCounts(counts);
      }
    } catch (e) {
      console.error("Lỗi lấy dữ liệu phiên làm việc:", e);
    }
    setLoading(false);
  };

  const startTask = async (task: Task) => {
    setIsProcessing(task.id);
    try {
      const currentCount = completedCounts[task.id] || 0;
      if (currentCount >= task.max_per_day) {
        alert(`Hết lượt làm nhiệm vụ này hôm nay!`);
        setIsProcessing(null);
        return;
      }

      let userIp = '0.0.0.0';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {}

      const sessionToken = Math.floor(100000 + Math.random() * 900000).toString();
      
      const { error: sessionError } = await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: sessionToken,
        task_id: task.id,
        is_completed: false,
        user_ip: userIp
      }]);

      if (sessionError) throw sessionError;

      const destination = "https://avudev-verifi.blogspot.com/";
      let shortUrl = "";

      if (task.api_url) {
        try {
          if (task.method === "POST") {
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
            shortUrl = json.shortenedUrl || json.url || json.shortlink;
          }
        } catch (apiErr) {
          console.error("Lỗi gọi API rút gọn:", apiErr);
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
      alert("Lỗi khởi tạo nhiệm vụ: " + err.message);
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
        alert(`Thành công! +${data.reward.toLocaleString()}đ.`);
        resetState(taskId);
        fetchSessionData();
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-16">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
           <span className="text-sm">💎</span> HỆ THỐNG KIẾM TIỀN AUTOMATION
        </p>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter mb-6">
          Nhiệm vụ <span className="text-gray-500/50">Rút gọn link</span>
        </h1>
        <p className="text-gray-500 font-bold max-w-2xl leading-relaxed text-sm">
          Làm nhiệm vụ để tích lũy số dư. Giới hạn làm việc reset sau 00:00 hàng ngày cho từng tài khoản.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-[#151a24] h-[380px] rounded-[48px] border border-gray-800 animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TASKS_CONFIG.map((task) => {
            const done = completedCounts[task.id] || 0;
            const remaining = task.max_per_day - done;
            const isFull = remaining <= 0;
            const hasStarted = localStorage.getItem(`started_${task.id}`) === 'true';

            return (
              <div key={task.id} className={`bg-[#151a24] rounded-[48px] p-10 border transition-all duration-500 relative overflow-hidden group flex flex-col justify-between min-h-[420px] ${
                isFull ? 'border-red-900/10 opacity-60 grayscale' : 
                hasStarted ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.15)] bg-blue-500/5' : 
                'border-gray-800 hover:border-gray-700'
              }`}>
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-full bg-gray-900/50 border border-gray-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                    {task.icon}
                  </div>
                  <div className="text-right">
                    <p className={`text-4xl font-black ${isFull ? 'text-gray-600' : 'text-blue-500'}`}>+1.000đ</p>
                    <p className="text-[10px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NHANH</p>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-2xl font-black text-white mb-5 tracking-tight">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-8">
                    <span className="bg-gray-800/80 text-gray-500 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest">
                      NGUỒN: {task.description}
                    </span>
                    <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      isFull ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-blue-500/10 text-blue-500 border-blue-500/20'
                    }`}>
                      CÒN LẠI: {remaining}/{task.max_per_day} LƯỢT
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
                        className="w-full bg-gray-900/80 border border-blue-500/30 rounded-2xl py-5 text-white text-center font-black tracking-[0.5em] text-xl focus:border-blue-500 outline-none" 
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleVerify(task.id)} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-900/20 transition-all">XÁC NHẬN</button>
                        <button onClick={() => resetState(task.id)} className="bg-gray-800 text-gray-500 px-4 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">HỦY</button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => { if (hasStarted) setVerifyingTaskId(task.id); else startTask(task); }}
                      disabled={isProcessing !== null || isFull}
                      className={`w-full py-5 rounded-[22px] font-black text-[12px] uppercase tracking-[0.1em] transition-all flex items-center justify-center gap-3 ${
                        isFull 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50' 
                        : hasStarted 
                          ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/30'
                          : 'bg-[#1e2530] hover:bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      {isProcessing === task.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : isFull ? 'ĐÃ HẾT LƯỢT' : 'LÀM NHIỆM VỤ →'}
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
