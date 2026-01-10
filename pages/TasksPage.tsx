
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
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
    await Promise.all([
      fetchTasksFromDB(),
      fetchAllTaskStats()
    ]);
    setLoading(false);
  };

  const fetchTasksFromDB = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      if (data) setTasks(data);
    } catch (err) {
      console.error("Lỗi fetch nhiệm vụ:", err);
    }
  };

  const fetchAllTaskStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayStr = today.toISOString();

      const { data, error } = await supabase
        .from('task_sessions')
        .select('task_id')
        .eq('user_id', profile.id)
        .eq('is_completed', true)
        .gte('created_at', todayStr);

      if (error) throw error;

      const counts: Record<string, number> = {};
      data.forEach((session: any) => {
        counts[session.task_id] = (counts[session.task_id] || 0) + 1;
      });
      setCompletedCounts(counts);
    } catch (err) {
      console.error("Lỗi fetch thống kê nhiệm vụ:", err);
    }
  };

  const handleCancelVerify = () => {
    setVerificationCode('');
    setVerifyingTaskId(null);
  };

  const handleResetTask = (providerId: string) => {
    if (window.confirm("Bạn muốn làm lại nhiệm vụ này? Mã cũ sẽ không còn hiệu lực.")) {
      localStorage.removeItem(`started_${providerId}`);
      setVerifyingTaskId(null);
      setVerificationCode('');
    }
  };

  const startTask = async (task: Task) => {
    setIsProcessing(task.id);
    
    try {
      const currentCount = completedCounts[task.id] || 0;
      if (currentCount >= task.max_per_day) {
        alert(`Bạn đã hết lượt làm nhiệm vụ ${task.title} hôm nay (Tối đa ${task.max_per_day} lượt)!`);
        setIsProcessing(null);
        return;
      }

      // Lấy IP người dùng
      let userIp = "127.0.0.1";
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipJson = await ipRes.json();
        userIp = ipJson.ip;
      } catch (e) { console.warn("Lỗi fetch IP."); }

      const sessionToken = Math.floor(100000 + Math.random() * 900000).toString();

      const { error: sessionError } = await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: sessionToken,
        task_id: task.id,
        user_ip: userIp,
        is_completed: false
      }]);

      if (sessionError) throw new Error("Lỗi khởi tạo phiên làm việc!");

      // GỌI API RÚT GỌN LINK
      if (task.api_url) {
        let shortUrl = "";
        const destination = task.url || "https://avudev-verifi.blogspot.com/";

        if (task.method === "POST") {
          const response = await fetch(task.api_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: destination })
          });
          const json = await response.json();
          shortUrl = json[task.json_key || 'shortenedUrl'] || json.url || (json.data && json.data.short_url);
        } else {
          const response = await fetch(task.api_url + encodeURIComponent(destination));
          const json = await response.json();
          shortUrl = json[task.json_key || 'shortenedUrl'] || json.url || json.shortlink;
        }

        if (shortUrl && shortUrl.startsWith('http')) {
          window.location.href = shortUrl;
        } else {
          if (task.fallback_url) window.location.href = task.fallback_url;
          else throw new Error("API không phản hồi link.");
        }
      } else {
        // Nếu không có API URL, mở link đích trực tiếp
        window.location.href = task.url;
      }

    } catch (err: any) {
      console.error("Task Error:", err);
      if (task.fallback_url) window.location.href = task.fallback_url;
      else alert("Có lỗi xảy ra: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async (taskId: string) => {
    if (verificationCode.length !== 6) return alert("Mã 6 số không hợp lệ!");
    
    setIsProcessing(taskId);
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        p_user_id: profile.id,
        p_token: verificationCode
      });

      if (error) throw error;

      if (data.success) {
        alert(`CHÚC MỪNG! +${data.reward.toLocaleString()}đ ĐÃ ĐƯỢC CỘNG VÀO VÍ.`);
        setVerificationCode('');
        setVerifyingTaskId(null);
        localStorage.removeItem(`started_${taskId}`);
        fetchAllTaskStats();
        refreshProfile();
      } else {
        alert(data.message || "Mã không đúng. Vui lòng kiểm tra lại.");
      }
    } catch (err: any) {
      alert("Lỗi xác minh: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-xl animate-bounce">💎</span>
           <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">HỆ THỐNG KIẾM TIỀN AUTOMATION</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Nhiệm vụ <span className="text-gray-500">Rút gọn link</span></h1>
        <p className="text-gray-500 mt-4 max-w-2xl font-medium">Hoàn thành các nhiệm vụ bên dưới để tích lũy số dư. Giới hạn lượt làm reset sau 00:00 hàng ngày.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="bg-[#151a24] h-80 rounded-[40px] border border-gray-800 animate-pulse"></div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tasks.map((task) => {
            const done = completedCounts[task.id] || 0;
            const remaining = task.max_per_day - done;
            const isFull = remaining <= 0;

            return (
              <div key={task.id} className={`bg-[#151a24] rounded-[40px] p-8 border ${isFull ? 'border-red-900/30 opacity-60' : 'border-gray-800 hover:border-blue-500/50'} transition-all shadow-xl group relative overflow-hidden flex flex-col justify-between min-h-[350px]`}>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-colors"></div>
                
                <div>
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-gray-900 w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl border border-gray-800 shadow-inner group-hover:scale-110 transition-transform">
                      {task.icon || '🔗'}
                    </div>
                    <div className="text-right">
                      <p className={`font-black text-3xl ${isFull ? 'text-gray-600' : 'text-blue-500'}`}>+{task.reward.toLocaleString()}đ</p>
                      <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NHANH</p>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{task.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mb-6">
                    <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">{task.type}</span>
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isFull ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                      Còn lại: {remaining}/{task.max_per_day} lượt
                    </span>
                  </div>
                </div>

                <div className="mt-auto">
                  {verifyingTaskId === task.id ? (
                    <div className="space-y-4 animate-in slide-in-from-top-2">
                      <input 
                        type="text" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        placeholder="NHẬP MÃ 6 SỐ"
                        className="w-full bg-black border border-blue-500/30 rounded-2xl py-5 px-6 text-white text-center font-black tracking-[0.5em] text-xl focus:border-blue-500 outline-none shadow-inner"
                      />
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleVerify(task.id)}
                          disabled={isProcessing === task.id}
                          className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center shadow-lg shadow-blue-900/20"
                        >
                          {isProcessing === task.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "NHẬN TIỀN"}
                        </button>
                        <div className="flex flex-col gap-2">
                          <button onClick={handleCancelVerify} className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:text-white transition-colors">ĐÓNG</button>
                          <button onClick={() => handleResetTask(task.id)} className="bg-red-900/10 text-red-500/60 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all">LÀM LẠI</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => {
                        if (localStorage.getItem(`started_${task.id}`)) {
                           setVerifyingTaskId(task.id);
                        } else {
                           startTask(task);
                           localStorage.setItem(`started_${task.id}`, 'true');
                        }
                      }}
                      disabled={isProcessing !== null || isFull}
                      className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                        isFull 
                        ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                        : 'bg-[#1e2530] group-hover:bg-blue-600 text-white'
                      }`}
                    >
                      {isProcessing === task.id ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      ) : (
                        isFull ? 'HẾT LƯỢT HÔM NAY' : <>LÀM NHIỆM VỤ <span className="group-hover:translate-x-1 transition-transform">→</span></>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {tasks.length === 0 && (
            <div className="col-span-full py-20 bg-[#151a24] rounded-[48px] border border-gray-800 text-center opacity-40">
               <p className="text-white font-black uppercase tracking-widest">Đang cập nhật nhiệm vụ mới...</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-24 p-12 bg-blue-600/5 border border-blue-500/10 rounded-[48px] relative overflow-hidden group shadow-2xl">
        <h4 className="text-white text-xl font-bold mb-8 flex items-center gap-4">
           <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
           Quy định & Hướng dẫn:
        </h4>
        <div className="grid md:grid-cols-2 gap-10">
           <ul className="space-y-6">
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black">1.</span>
                 <p className="text-gray-500 text-sm">Giới hạn nhiệm vụ tính riêng cho từng người dùng và reset lúc <b className="text-blue-400">00:00 ngày hôm sau</b>.</p>
              </li>
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black">2.</span>
                 <p className="text-gray-500 text-sm">Lấy mã xác nhận <b className="text-white">6 số</b> nằm ở cuối mỗi bài viết tại trang đích.</p>
              </li>
           </ul>
           <ul className="space-y-6">
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black">3.</span>
                 <p className="text-gray-500 text-sm">Nếu link lỗi hoặc quên lấy mã, hãy bấm nút <b className="text-red-500">Làm lại</b> để xóa trạng thái và thực hiện lại.</p>
              </li>
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black">4.</span>
                 <p className="text-gray-500 text-sm">Tuyệt đối không sử dụng Proxy/VPN hoặc Tool tự động, tài khoản vi phạm sẽ bị <b className="text-red-500">Ban vĩnh viễn</b>.</p>
              </li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
