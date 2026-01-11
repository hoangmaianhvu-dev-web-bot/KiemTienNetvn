
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// 1. ĐỊNH NGHĨA 10 MÃ UUID CỐ ĐỊNH
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

const PROXY = "https://api.allorigins.win/get?url=";
const DEST_URL = "https://avudev-verifi.blogspot.com/";

// Cấu hình nâng cao cho các nhà cung cấp
interface TaskConfig extends Task {
  noProxy?: boolean;
}

const HARDCODED_TASKS: TaskConfig[] = [
  { id: TASK_IDS[2], title: 'Nhiệm vụ 1 (LaymaNet)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://layma.net/api?api=f4b53bc4126c32ec5b7211a7430ba898&url=', method: 'GET', description: 'LAYMANET', url: DEST_URL, noProxy: true, fallback_url: 'https://layma.net/st?api=f4b53bc4126c32ec5b7211a7430ba898&url=' + encodeURIComponent(DEST_URL) },
  { id: TASK_IDS[3], title: 'Nhiệm vụ 2 (KiemTienNgay)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.vn/api?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY', url: DEST_URL, noProxy: true, fallback_url: 'https://kiemtienngay.vn/st?api=bdce14c14722165a01a9c8225d88abc6&url=' + encodeURIComponent(DEST_URL) },
  { id: TASK_IDS[4], title: 'Nhiệm vụ 3 (4MMO)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.vn/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: 'MMO4', url: DEST_URL, noProxy: true, fallback_url: 'https://4mmo.vn/st?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=' + encodeURIComponent(DEST_URL) },
  { id: TASK_IDS[6], title: 'Nhiệm vụ 4 (XLink)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.top/api?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK', url: DEST_URL, noProxy: true, fallback_url: 'https://xlink.top/st?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=' + encodeURIComponent(DEST_URL) },
  { id: TASK_IDS[8], title: 'Nhiệm vụ 5 (TrafficTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten', method: 'POST', description: 'TRAFFICTOT', url: DEST_URL, apiKey: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', noProxy: true, fallback_url: 'https://traffictot.com/' },
  { id: TASK_IDS[0], title: 'Nhiệm vụ 6 (Link4m)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M', url: DEST_URL, fallback_url: 'https://link4m.co/' },
  { id: TASK_IDS[1], title: 'Nhiệm vụ 7 (YeuMoney)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY', url: DEST_URL, fallback_url: 'https://yeumoney.com/' },
  { id: TASK_IDS[5], title: 'Nhiệm vụ 8 (LinkTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT', url: DEST_URL, fallback_url: 'https://linktot.net/' },
  { id: TASK_IDS[7], title: 'Nhiệm vụ 9 (LinkNgonIO)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', description: 'LINKNGONIO', url: DEST_URL, fallback_url: 'https://linkngon.io/' },
  { id: TASK_IDS[9], title: 'Nhiệm vụ 10 (Yeulink)', reward: 200, max_per_day: 4, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', description: 'YEULINK', url: DEST_URL, fallback_url: 'https://yeulink.com/' },
];

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
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

  const findShortLink = (data: any): string | null => {
    if (!data) return null;
    if (typeof data === 'string' && (data.startsWith('http://') || data.startsWith('https://'))) return data;
    
    const priorityKeys = ['shortenedUrl', 'short_url', 'shortlink', 'link', 'url', 'data'];
    for (const key of priorityKeys) {
      const val = data[key];
      if (typeof val === 'string' && (val.startsWith('http://') || val.startsWith('https://'))) return val;
      if (val && typeof val === 'object') {
        const nested = findShortLink(val);
        if (nested) return nested;
      }
    }
    return null;
  };

  const startTask = async (task: TaskConfig) => {
    if (isProcessing) return;
    setIsProcessing(task.id);
    
    try {
      const done = completedCounts[task.id] || 0;
      if (done >= task.max_per_day) {
        alert("Bạn đã hết lượt làm nhiệm vụ này hôm nay!");
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

      const { error: sessionError } = await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: token,
        task_id: task.id,
        is_completed: false,
        user_ip: userIp,
        reward: 200
      }]);

      if (sessionError) throw new Error("Lỗi hệ thống: " + sessionError.message);

      let shortUrl = "";

      try {
        if (task.method === 'POST') {
          const response = await fetch(task.api_url!, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ api_key: task.apiKey || "", url: DEST_URL })
          });
          
          if (response.status === 401) throw new Error("401");
          if (!response.ok) throw new Error(`Status ${response.status}`);
          
          const json = await response.json();
          shortUrl = findShortLink(json) || "";
        } else if (task.api_url) {
          let apiUrlWithDest = task.api_url;
          if (!apiUrlWithDest.includes('url=') && !apiUrlWithDest.includes('link=')) {
            const sep = apiUrlWithDest.includes('?') ? '&' : '?';
            apiUrlWithDest += `${sep}url=`;
          }
          const finalApiUrl = apiUrlWithDest.endsWith('=') ? apiUrlWithDest + encodeURIComponent(DEST_URL) : apiUrlWithDest;
          
          let rawContent = "";
          
          // Thử gọi trực tiếp nếu có cờ noProxy hoặc thử cả 2 cách
          if (task.noProxy) {
            try {
              const directRes = await fetch(finalApiUrl);
              const directJson = await directRes.json();
              shortUrl = findShortLink(directJson) || "";
            } catch (e) {
              console.warn("Direct fetch failed, falling back to proxy...");
            }
          }

          if (!shortUrl) {
            const proxyCallUrl = PROXY + encodeURIComponent(finalApiUrl);
            const response = await fetch(proxyCallUrl);
            if (!response.ok) throw new Error(`Proxy error ${response.status}`);
            
            const proxyData = await response.json();
            rawContent = proxyData.contents ? proxyData.contents.trim() : "";
            
            if (rawContent) {
              if (rawContent.toLowerCase().startsWith('<!doctype html') || rawContent.toLowerCase().startsWith('<html')) {
                throw new Error("HTML_ERROR");
              }
              if (rawContent.includes("xác minh danh tính")) throw new Error("AUTH_REQUIRED");

              if (rawContent.startsWith('{') || rawContent.startsWith('[')) {
                const apiResponse = JSON.parse(rawContent);
                shortUrl = findShortLink(apiResponse) || "";
              } else if (rawContent.startsWith('http')) {
                shortUrl = rawContent;
              }
            }
          }
        }
      } catch (innerErr: any) {
        console.error("API Call failed:", innerErr);
        // Dùng link dự phòng nếu API chính thức lỗi
        shortUrl = task.fallback_url || "";
      }

      // Nếu sau tất cả vẫn không có shortUrl, dùng link đích hoặc dự phòng
      const finalUrlToOpen = shortUrl || task.fallback_url || task.url || DEST_URL;
      
      if (finalUrlToOpen.includes('blogspot.com') && task.fallback_url) {
        window.open(task.fallback_url, '_blank');
      } else {
        window.open(finalUrlToOpen, '_blank');
      }
      
      setVerifyingTaskId(task.id);

    } catch (err: any) {
      alert(`[MMO ERROR] Hệ thống đang được điều chỉnh. Vui lòng thử lại sau!`);
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async (taskId: string) => {
    const code = verificationCode.trim();
    if (code.length !== 6) return alert("Mã xác nhận gồm 6 chữ số!");
    
    setIsProcessing(taskId);
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', {
        p_user_id: profile.id,
        p_token: code
      });

      if (error) throw error;

      if (data && data.success) {
        alert(`XÁC MINH THÀNH CÔNG! +${data.reward.toLocaleString()}đ đã được cộng vào ví.`);
        setVerificationCode('');
        setVerifyingTaskId(null);
        fetchData();
        refreshProfile();
      } else {
        alert(data?.message || "Mã xác nhận sai hoặc đã hết hạn!");
      }
    } catch (err: any) {
      alert("Lỗi máy chủ xác minh. Vui lòng thử lại sau!");
    } finally {
      setIsProcessing(null);
    }
  };

  const renderTaskCard = (task: TaskConfig) => {
    const done = completedCounts[task.id] || 0;
    const remain = task.max_per_day - done;
    const isFull = remain <= 0;
    const isVerifying = verifyingTaskId === task.id;

    return (
      <div key={task.id} className={`bg-[#151a24] rounded-[38px] p-8 border transition-all duration-500 relative overflow-hidden group flex flex-col justify-between min-h-[380px] ${
        isFull ? 'border-red-900/10 opacity-50 grayscale' : 
        isVerifying ? 'border-blue-500 shadow-2xl bg-blue-500/5' : 
        'border-gray-800 hover:border-gray-700 shadow-xl'
      }`}>
        <div className="flex justify-between items-start">
          <div className="w-14 h-14 rounded-2xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            {task.icon || '🎯'}
          </div>
          <div className="text-right">
            <p className={`text-3xl font-black ${isFull ? 'text-gray-600' : 'text-blue-500'}`}>+200đ</p>
            <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG</p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-xl font-black text-white mb-4 tracking-tight leading-tight line-clamp-2">{task.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="bg-gray-800/80 text-gray-500 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest truncate max-w-[100px]">
              {task.description || 'MMO SYSTEM'}
            </span>
            <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
              isFull ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
              'bg-blue-500/10 text-blue-500 border-blue-500/20'
            }`}>
              LƯỢT: {done}/{task.max_per_day}
            </span>
          </div>
        </div>

        <div>
          {isVerifying ? (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <input 
                type="text" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                placeholder="MÃ XÁC NHẬN" 
                className="w-full bg-gray-900 border border-blue-500/30 rounded-2xl py-4 text-white text-center font-black tracking-[0.4em] text-lg focus:border-blue-500 outline-none" 
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => handleVerify(task.id)} 
                  disabled={isProcessing === task.id}
                  className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  XÁC NHẬN
                </button>
                <button 
                  onClick={() => setVerifyingTaskId(null)} 
                  className="bg-gray-800 text-gray-500 px-5 py-4 rounded-2xl font-black text-[10px] uppercase hover:text-white transition-all"
                >
                  HỦY
                </button>
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
              {isProcessing === task.id ? 'ĐANG XỬ LÝ...' : isFull ? 'HẾT LƯỢT' : 'LÀM NHIỆM VỤ →'}
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
           <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span> MMO ELITE 2025
        </p>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Nhiệm Vụ <span className="text-gray-500/50">Vượt Link Kiếm Tiền</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {HARDCODED_TASKS.map(task => renderTaskCard(task))}
      </div>

      <div className="mt-24 p-12 bg-red-900/10 border border-red-500/20 rounded-[48px] shadow-2xl">
         <div className="flex items-start gap-8">
            <span className="text-4xl">⚠️</span>
            <div className="space-y-2">
              <p className="text-red-500 text-sm font-black uppercase tracking-widest">LƯU Ý QUAN TRỌNG</p>
              <p className="text-red-500/80 text-[10px] font-bold leading-relaxed uppercase tracking-wider">
                TUYỆT ĐỐI KHÔNG DÙNG VPN/PROXY. HỆ THỐNG SẼ KHÓA ID VĨNH VIỄN NẾU PHÁT HIỆN GIAN LẬN ĐỊA CHỈ IP. 
                NẾU NHÀ CUNG CẤP LỖI, HỆ THỐNG SẼ TỰ ĐỘNG CHUYỂN HƯỚNG SANG LINK DỰ PHÒNG.
              </p>
            </div>
         </div>
      </div>
    </div>
  );
};

export default TasksPage;
