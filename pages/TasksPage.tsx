
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// CẤU HÌNH ADMIN & 9 NHÀ CUNG CẤP API
const ADMIN_CONFIG = {
  CLEAN_DESTINATION: "https://yourblog.blogspot.com/p/xac-nhan.html",
  PROVIDERS: [
    { 
      id: 'link4m', 
      name: 'Nhiệm vụ 1', 
      reward: 1000, 
      apiUrl: "https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://link4m.co/st?api=68208afab6b8fc60542289b6&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'yeumoney', 
      name: 'Nhiệm vụ 2', 
      reward: 1200, 
      apiUrl: "https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://yeumoney.com/full?api=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'linktot', 
      name: 'Nhiệm vụ 3', 
      reward: 800, 
      apiUrl: "https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=", 
      method: "GET", 
      jsonKey: "url",
      fallback: "https://linktot.net/st?api=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'mmo4', 
      name: 'Nhiệm vụ 4', 
      reward: 1500, 
      apiUrl: "https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://4mmo.net/st?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'xlink', 
      name: 'Nhiệm vụ 5', 
      reward: 900, 
      apiUrl: "https://xlink.co/api?token=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=", 
      method: "GET", 
      jsonKey: "url",
      fallback: "https://xlink.co/st?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'linkngonio', 
      name: 'Nhiệm vụ 6', 
      reward: 1100, 
      apiUrl: "https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=", 
      method: "GET", 
      jsonKey: "url",
      fallback: "https://linkngon.io/st?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'traffictot', 
      name: 'Nhiệm vụ 7', 
      reward: 1300, 
      apiUrl: "https://services.traffictot.com/api/v1/shorten?api_key=8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7", 
      method: "POST", 
      jsonKey: "shortenedUrl",
      fallback: "https://traffictot.com/st?api=8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'kiemtienngay', 
      name: 'Nhiệm vụ 8', 
      reward: 1000, 
      apiUrl: "https://kiemtienngay.com/apiv1?api=bdce14c14722165a01a9c8225d88abc6&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://kiemtienngay.com/st?api=bdce14c14722165a01a9c8225d88abc6&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    },
    { 
      id: 'laymanet', 
      name: 'Nhiệm vụ 9', 
      reward: 1400, 
      apiUrl: "https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=f4b53bc4126c32ec5b7211a7430ba898&format=json&url=", 
      method: "GET", 
      jsonKey: "shortenedUrl",
      fallback: "https://layma.net/st?api=f4b53bc4126c32ec5b7211a7430ba898&url=https://yourblog.blogspot.com/p/xac-nhan.html"
    }
  ]
};

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  const startTask = async (provider: typeof ADMIN_CONFIG.PROVIDERS[0]) => {
    setIsProcessing(provider.id);
    
    try {
      // 1. Lưu user_id vào LocalStorage
      localStorage.setItem('mmo_user_id', '0337117930');

      // 2. Lấy IP người dùng
      let userIp = "127.0.0.1";
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipJson = await ipRes.json();
        userIp = ipJson.ip;
      } catch (e) { console.warn("Lỗi lấy IP, dùng mặc định."); }

      // 3. Sinh session_token (6 số ngẫu nhiên)
      const sessionToken = Math.floor(100000 + Math.random() * 900000).toString();

      // 4. Insert dữ liệu vào Supabase task_sessions
      const { error: sessionError } = await supabase.from('task_sessions').insert([{
        user_id: profile.id, // Dùng ID thật của user đang đăng nhập
        session_token: sessionToken,
        task_id: provider.id,
        user_ip: userIp,
        is_completed: false
      }]);

      if (sessionError) throw new Error("Lỗi khởi tạo phiên làm việc trên hệ thống!");

      // 5. Gọi API Link Shortener
      let shortUrl = "";
      const destination = ADMIN_CONFIG.CLEAN_DESTINATION;

      if (provider.method === "POST") {
        // Xử lý POST cho TrafficTot
        const response = await fetch(provider.apiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: destination })
        });
        const json = await response.json();
        shortUrl = json.shortenedUrl || json.url || (json.data && json.data.short_url);
      } else {
        // Xử lý GET cho các bên còn lại
        const response = await fetch(provider.apiUrl + encodeURIComponent(destination));
        const json = await response.json();
        shortUrl = json[provider.jsonKey] || json.url || json.shortlink;
      }

      // 6. Chuyển hướng hoặc Fallback
      if (shortUrl && shortUrl.startsWith('http')) {
        window.location.href = shortUrl;
      } else {
        throw new Error("API không trả về link hợp lệ");
      }

    } catch (err) {
      console.error("Task Error:", err);
      // Cơ chế dự phòng: Chuyển hướng sang link fallback an toàn
      window.location.href = provider.fallback;
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async (providerId: string) => {
    if (verificationCode.length !== 6) return alert("Mã xác nhận phải gồm 6 chữ số!");
    
    setIsProcessing(providerId);
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        p_user_id: profile.id,
        p_token: verificationCode
      });

      if (error) throw error;

      if (data.success) {
        alert(`Thành công! +${data.reward.toLocaleString()}đ đã được cộng vào ví.`);
        setVerifyingTaskId(null);
        setVerificationCode('');
        localStorage.removeItem(`started_${providerId}`);
        refreshProfile();
      } else {
        alert(data.message || "Mã không chính xác hoặc đã hết hạn.");
      }
    } catch (err: any) {
      alert("Lỗi xác thực: " + err.message);
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-2">
           <span className="text-xl animate-bounce">🚀</span>
           <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">HỆ THỐNG KIẾM TIỀN AUTOMATION</p>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Nhiệm vụ <span className="text-gray-500">Rút gọn link</span></h1>
        <p className="text-gray-500 mt-4 max-w-2xl font-medium">Hoàn thành các thử thách vượt link từ 9 nhà cung cấp uy tín nhất để nhận thưởng tức thì.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {ADMIN_CONFIG.PROVIDERS.map((provider) => (
          <div key={provider.id} className="bg-[#151a24] rounded-[40px] p-8 border border-gray-800 hover:border-blue-500/50 transition-all shadow-xl group relative overflow-hidden flex flex-col justify-between min-h-[320px]">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-colors"></div>
            
            <div>
              <div className="flex justify-between items-start mb-8">
                <div className="bg-gray-900 w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl border border-gray-800 shadow-inner group-hover:scale-110 transition-transform">
                  {provider.id === 'traffictot' ? '🔥' : provider.id === 'yeumoney' ? '💰' : '🔗'}
                </div>
                <div className="text-right">
                  <p className="text-blue-500 font-black text-3xl">+{provider.reward.toLocaleString()}đ</p>
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NGAY</p>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{provider.name}</h3>
              <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest mb-8">Nguồn: {provider.id}</p>
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
                      className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center"
                    >
                      {isProcessing === provider.id ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "XÁC NHẬN"}
                    </button>
                    <button onClick={() => setVerifyingTaskId(null)} className="bg-gray-800 text-gray-400 px-6 rounded-2xl font-black text-[10px]">HỦY</button>
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
                  disabled={isProcessing !== null}
                  className="w-full bg-[#1e2530] group-hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  {isProcessing === provider.id ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>LÀM NHIỆM VỤ <span className="group-hover:translate-x-1 transition-transform">→</span></>
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 bg-blue-600/5 border border-blue-500/10 rounded-[48px] relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-12 opacity-5 text-9xl pointer-events-none group-hover:scale-110 transition-transform">💡</div>
        <h4 className="text-white text-xl font-bold mb-8 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
          Quy trình kiếm tiền:
        </h4>
        <div className="grid md:grid-cols-2 gap-10">
           <ul className="space-y-6">
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black text-lg">1.</span>
                 <p className="text-gray-500 text-sm leading-relaxed">Chọn nhiệm vụ và bấm <b className="text-white">Làm nhiệm vụ</b> để nhận link rút gọn.</p>
              </li>
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black text-lg">2.</span>
                 <p className="text-gray-500 text-sm leading-relaxed">Thực hiện vượt link theo yêu cầu của nhà cung cấp để tới trang Blogspot xác nhận.</p>
              </li>
           </ul>
           <ul className="space-y-6">
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black text-lg">3.</span>
                 <p className="text-gray-500 text-sm leading-relaxed">Lấy mã xác nhận 6 số hiển thị tại bài viết trên Blogspot.</p>
              </li>
              <li className="flex gap-6 items-start">
                 <span className="text-blue-500 font-black text-lg">4.</span>
                 <p className="text-gray-500 text-sm leading-relaxed">Quay lại đây, nhập mã vào ô xác nhận để nhận thưởng <b className="text-green-500">Tự động</b>.</p>
              </li>
           </ul>
        </div>
      </div>
    </div>
  );
};

export default TasksPage;
