
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// 1. CẤU HÌNH ADMIN_CONFIG VỚI GIÁ TIỀN & GIỚI HẠN LƯỢT LÀM
const ADMIN_CONFIG = {
  CLEAN_DESTINATION: "https://avudev-verifi.blogspot.com/",
  PROVIDERS: [
    { 
      id: 'link4m', 
      name: 'Nhiệm vụ 1', 
      reward: 1000, 
      max_per_day: 5,
      apiUrl: "https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://link4m.co/st?api=68208afab6b8fc60542289b6&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'yeumoney', 
      name: 'Nhiệm vụ 2', 
      reward: 1200, 
      max_per_day: 3,
      apiUrl: "https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://yeumoney.com/full?api=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'linktot', 
      name: 'Nhiệm vụ 3', 
      reward: 800, 
      max_per_day: 10,
      apiUrl: "https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=", 
      method: "GET", 
      jsonKey: "url",
      fallback: "https://linktot.net/st?api=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'mmo4', 
      name: 'Nhiệm vụ 4', 
      reward: 1500, 
      max_per_day: 3,
      apiUrl: "https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://4mmo.net/st?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'xlink', 
      name: 'Nhiệm vụ 5', 
      reward: 900, 
      max_per_day: 5,
      apiUrl: "https://xlink.co/api?token=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=", 
      method: "GET", 
      jsonKey: "url",
      fallback: "https://xlink.co/st?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'linkngonio', 
      name: 'Nhiệm vụ 6', 
      reward: 1100, 
      max_per_day: 5,
      apiUrl: "https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=", 
      method: "GET", 
      jsonKey: "url",
      fallback: "https://linkngon.io/st?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'traffictot', 
      name: 'Nhiệm vụ 7', 
      reward: 1300, 
      max_per_day: 3,
      apiUrl: "https://services.traffictot.com/api/v1/shorten?api_key=8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7", 
      method: "POST", 
      jsonKey: "shortenedUrl",
      fallback: "https://traffictot.com/st?api=8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'kiemtienngay', 
      name: 'Nhiệm vụ 8', 
      reward: 1000, 
      max_per_day: 5,
      apiUrl: "https://kiemtienngay.com/apiv1?api=bdce14c14722165a01a9c8225d88abc6&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://kiemtienngay.com/st?api=bdce14c14722165a01a9c8225d88abc6&url=https://avudev-verifi.blogspot.com/"
    },
    { 
      id: 'laymanet', 
      name: 'Nhiệm vụ 9', 
      reward: 1400, 
      max_per_day: 2,
      apiUrl: "https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=f4b53bc4126c32ec5b7211a7430ba898&format=json&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://layma.net/st?api=f4b53bc4126c32ec5b7211a7430ba898&url=https://avudev-verifi.blogspot.com/"
    }
  ]
};

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  // State lưu số lượt đã làm của từng task trong ngày
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAllTaskStats();
  }, []);

  // HÀM LẤY THỐNG KÊ TẤT CẢ NHIỆM VỤ ĐÃ LÀM TRONG NGÀY
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

      // Tính toán số lượng cho từng taskId
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

  const startTask = async (provider: typeof ADMIN_CONFIG.PROVIDERS[0]) => {
    setIsProcessing(provider.id);
    
    try {
      // KIỂM TRA GIỚI HẠN TRỰC TIẾP TỪ STATE TRƯỚC KHI BẮT ĐẦU
      const currentCount = completedCounts[provider.id] || 0;
      if (currentCount >= provider.max_per_day) {
        alert(`Bạn đã hết lượt làm nhiệm vụ ${provider.name} hôm nay (Tối đa ${provider.max_per_day} lượt)!`);
        setIsProcessing(null);
        return;
      }

      // Lưu user_id cố định
      localStorage.setItem('mmo_user_id', '0337117930');

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
        task_id: provider.id,
        user_ip: userIp,
        is_completed: false
      }]);

      if (sessionError) {
        console.error("Supabase Error:", JSON.stringify(sessionError, null, 2));
        throw new Error("Lỗi khởi tạo phiên làm việc!");
      }

      let shortUrl = "";
      const destination = ADMIN_CONFIG.CLEAN_DESTINATION;

      if (provider.method === "POST") {
        const response = await fetch(provider.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: destination })
        });
        const json = await response.json();
        shortUrl = json.shortenedUrl || json.url || (json.data && json.data.short_url);
      } else {
        const response = await fetch(provider.apiUrl + encodeURIComponent(destination));
        const json = await response.json();
        shortUrl = json[provider.jsonKey] || json.url || json.shortlink || json.shortenedUrl;
      }

      if (shortUrl && shortUrl.startsWith('http')) {
        window.location.href = shortUrl;
      } else {
        throw new Error("API không trả về link.");
      }

    } catch (err: any) {
      console.error("Task Error:", err);
      window.location.href = provider.fallback;
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async (providerId: string) => {
    if (verificationCode.length !== 6) return alert("Mã 6 số không hợp lệ!");
    
    setIsProcessing(providerId);
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        p_user_id: profile.id,
        p_token: verificationCode
      });

      if (error) {
        console.error("Lỗi xác minh mã:", JSON.stringify(error, null, 2));
        throw error;
      }

      if (data.success) {
        alert(`CHÚC MỪNG! +${data.reward.toLocaleString()}đ ĐÃ ĐƯỢC CỘNG VÀO VÍ.`);
        
        setVerificationCode('');
        setVerifyingTaskId(null);
        localStorage.removeItem(`started_${providerId}`);
        
        // CẬP NHẬT LẠI THỐNG KÊ NGAY LẬP TỨC
        fetchAllTaskStats();
        refreshProfile();
      } else {
        alert(data.message || "Mã không đúng. Vui lòng kiểm tra lại.");
      }
    } catch (err: any) {
      console.error("Verification error:", err);
      alert("Lỗi hệ thống khi xác minh: " + (err.message || "Không xác định"));
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
        <p className="text-gray-500 mt-4 max-w-2xl font-medium">Làm nhiệm vụ để tích lũy số dư. Giới hạn làm việc reset sau 00:00 hàng ngày cho từng tài khoản.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ADMIN_CONFIG.PROVIDERS.map((provider) => {
          const done = completedCounts[provider.id] || 0;
          const remaining = provider.max_per_day - done;
          const isFull = remaining <= 0;

          return (
            <div key={provider.id} className={`bg-[#151a24] rounded-[40px] p-8 border ${isFull ? 'border-red-900/30 opacity-60' : 'border-gray-800 hover:border-blue-500/50'} transition-all shadow-xl group relative overflow-hidden flex flex-col justify-between min-h-[350px]`}>
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-colors"></div>
              
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div className={`bg-gray-900 w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl border border-gray-800 shadow-inner group-hover:scale-110 transition-transform`}>
                    {provider.id === 'traffictot' ? '🚀' : '🔗'}
                  </div>
                  <div className="text-right">
                    <p className={`font-black text-3xl ${isFull ? 'text-gray-600' : 'text-blue-500'}`}>+{provider.reward.toLocaleString()}đ</p>
                    <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NHANH</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{provider.name}</h3>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="bg-gray-800 text-gray-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">NGUỒN: {provider.id}</span>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${isFull ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    Còn lại: {remaining}/{provider.max_per_day} lượt
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                {verifyingTaskId === provider.id ? (
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
                        onClick={() => handleVerify(provider.id)}
                        disabled={isProcessing === provider.id}
                        className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center shadow-lg shadow-blue-900/20"
                      >
                        {isProcessing === provider.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "NHẬN TIỀN"}
                      </button>
                      <div className="flex flex-col gap-2">
                        <button onClick={handleCancelVerify} className="bg-gray-800 text-gray-400 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:text-white transition-colors">ĐÓNG</button>
                        <button onClick={() => handleResetTask(provider.id)} className="bg-red-900/10 text-red-500/60 px-4 py-2 rounded-xl font-black text-[9px] uppercase hover:bg-red-600 hover:text-white transition-all">LÀM LẠI</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if (localStorage.getItem(`started_${provider.id}`)) {
                         setVerifyingTaskId(provider.id);
                      } else {
                         startTask(provider);
                         localStorage.setItem(`started_${provider.id}`, 'true');
                      }
                    }}
                    disabled={isProcessing !== null || isFull}
                    className={`w-full py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg ${
                      isFull 
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                      : 'bg-[#1e2530] group-hover:bg-blue-600 text-white'
                    }`}
                  >
                    {isProcessing === provider.id ? (
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
      </div>

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
