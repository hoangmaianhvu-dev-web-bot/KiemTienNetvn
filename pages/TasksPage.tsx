
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// CẤU HÌNH 9 NHÀ CUNG CẤP API
const ADMIN_CONFIG = {
  DESTINATION_URL: "https://yourblog.blogspot.com/p/xac-nhan.html",
  PROVIDERS: {
    link4m: { url: "https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=", key: "shortenedUrl" },
    yeumoney: { url: "https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=", key: "shortenedUrl" },
    linktot: { url: "https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=", key: "shortenedUrl" },
    mmo4: { url: "https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=", key: "shortlink" },
    xlink: { url: "https://xlink.co/api?token=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=", key: "shortlink" },
    linkngonio: { url: "https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=", key: "shortlink" },
    traffictot: { url: "https://services.traffictot.com/api/v1/shorten", method: "POST", headers: { "api_key": "8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7" } },
    kiemtienngay: { url: "https://kiemtienngay.com/apiv1?api=bdce14c14722165a01a9c8225d88abc6&url=", key: "shortenedUrl" },
    laymanet: { url: "https://api.layma.net/api/admin/shortlink/quicklink?tokenUser=f4b53bc4126c32ec5b7211a7430ba898&format=json&url=", key: "shortenedUrl" }
  },
  FALLBACK_LINKS: {
    link4m: "https://link4m.co/demo",
    yeumoney: "https://yeumoney.com/demo",
    // ... các link dự phòng khác tương ứng
  }
};

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState('offer');
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchTasks();
    localStorage.setItem('mmo_user_id', profile.id); // Lưu cho Blogspot truy vấn
  }, []);

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').order('reward', { ascending: false });
    if (data) setAllTasks(data);
  };

  const startTask = async (task: Task) => {
    setIsProcessing(true);
    const providerKey = task.description.toLowerCase().replace(/\s/g, ''); // Giả định description chứa tên provider
    const config = (ADMIN_CONFIG.PROVIDERS as any)[providerKey] || ADMIN_CONFIG.PROVIDERS.link4m;
    
    // 1. Tạo Session mới
    const sessionToken = Math.floor(100000 + Math.random() * 900000).toString();
    const { error: sessionErr } = await supabase.from('task_sessions').insert([{
      user_id: profile.id,
      session_token: sessionToken,
      task_id: task.id,
      user_ip: 'checking...' // Backend Supabase có thể lấy IP qua trigger nếu cần
    }]);

    if (sessionErr) return alert("Lỗi khởi tạo phiên!");

    // 2. Gọi API rút gọn
    try {
      let shortUrl = "";
      const target = ADMIN_CONFIG.DESTINATION_URL;

      if (config.method === "POST") {
        const res = await fetch(config.url, {
          method: "POST",
          headers: { ...config.headers, "Content-Type": "application/json" },
          body: JSON.stringify({ url: target })
        });
        const json = await res.json();
        shortUrl = json.shortenedUrl || json.url || json.data?.short_url;
      } else {
        const res = await fetch(config.url + encodeURIComponent(target));
        const json = await res.json();
        shortUrl = json[config.key] || json.url || json.shortlink;
      }

      if (shortUrl) {
        window.open(shortUrl, '_blank');
        setVerifyingTaskId(task.id);
      } else {
        throw new Error("Invalid API Response");
      }
    } catch (err) {
      console.warn("API Error, switching to Fallback...");
      const fallback = (ADMIN_CONFIG.FALLBACK_LINKS as any)[providerKey] || task.url;
      window.open(fallback, '_blank');
      setVerifyingTaskId(task.id);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleVerify = async (task: Task) => {
    if (verificationCode.length !== 6) return alert("Mã xác nhận phải có 6 chữ số!");
    
    setIsProcessing(true);
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
        refreshProfile();
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Lỗi xác thực: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">💰 KIẾM TIỀN TỰ ĐỘNG</p>
        <h1 className="text-4xl font-black text-white">Hệ thống <span className="text-gray-500">Nhiệm vụ 100%</span></h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {allTasks.filter(t => t.type === activeTab).map(task => (
          <div key={task.id} className="bg-[#151a24] rounded-[40px] p-8 border border-gray-800 hover:border-blue-500/50 transition-all shadow-xl group">
            <div className="flex justify-between items-start mb-8">
              <div className="text-4xl">{task.icon || '🔗'}</div>
              <div className="text-right">
                <p className="text-blue-500 font-black text-2xl">+{Number(task.reward).toLocaleString()}đ</p>
                <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest">VNĐ / NHIỆM VỤ</p>
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-white mb-4">{task.title}</h3>
            <p className="text-gray-500 text-sm mb-8 line-clamp-2">{task.description}</p>

            {verifyingTaskId === task.id ? (
              <div className="space-y-4 animate-in slide-in-from-top-2">
                <input 
                  type="text" 
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Dán mã 6 số tại đây..."
                  className="w-full bg-black border border-blue-500/30 rounded-2xl py-4 px-6 text-white text-center font-black tracking-[0.5em]"
                />
                <button 
                  onClick={() => handleVerify(task)}
                  disabled={isProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {isProcessing ? "ĐANG XỬ LÝ..." : "XÁC NHẬN & NHẬN TIỀN"}
                </button>
              </div>
            ) : (
              <button 
                onClick={() => startTask(task)}
                disabled={isProcessing}
                className="w-full bg-gray-800 group-hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
              >
                {isProcessing ? "ĐANG TẠO LINK..." : "BẮT ĐẦU NHIỆM VỤ"}
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-20 p-10 bg-blue-600/5 border border-blue-500/10 rounded-[48px]">
        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
          <span className="text-blue-500">●</span> Quy trình nhận mã:
        </h4>
        <ol className="text-gray-500 text-sm space-y-4">
          <li>1. Bấm <b>Bắt đầu nhiệm vụ</b> để hệ thống tự động rút gọn link qua API.</li>
          <li>2. Vượt qua các bước xác minh trên trang rút gọn để tới trang Blogspot đích.</li>
          <li>3. Tại trang Blogspot, mã 6 số sẽ hiển thị tự động dựa trên phiên làm việc của bạn.</li>
          <li>4. Copy mã đó, quay lại đây dán vào ô xác nhận để nhận thưởng tức thì.</li>
        </ol>
      </div>
    </div>
  );
};

export default TasksPage;
