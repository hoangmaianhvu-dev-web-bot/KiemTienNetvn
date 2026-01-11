
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// Admin ID: 0337117930 - Hệ thống Proxy Google Apps Script cực mạnh
const GOOGLE_PROXY = "https://script.google.com/macros/s/AKfycbyX3uoZnldgPWgDXl3QTbXsZS3KZ64maNs8y80DeRKjpYmUk_Qa2CkNX2lhb3lzxbkWXw/exec";
const BLOG_DEST = "https://avudev-verifi.blogspot.com/";

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [activeTab, setActiveTab] = useState<'normal' | 'special'>('normal');
  const [specialTasks, setSpecialTasks] = useState<Task[]>([]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  
  // State điều khiển Modal "Lung linh" chuẩn 100%
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyStep, setVerifyStep] = useState<1 | 2>(1);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  
  const [loading, setLoading] = useState(true);

  // Danh sách 10 nhiệm vụ mặc định sử dụng UUID chuẩn
  const NORMAL_TASKS: Task[] = [
    { id: "00000000-0000-4000-a000-000000000001", title: 'Nhiệm vụ 1: Link4m', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M' },
    { id: "00000000-0000-4000-a000-000000000002", title: 'Nhiệm vụ 2: YeuMoney', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY' },
    { id: "00000000-0000-4000-a000-000000000003", title: 'Nhiệm vụ 3: Linktot', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT' },
    { id: "00000000-0000-4000-a000-000000000004", title: 'Nhiệm vụ 4: 4mmo', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: '4MMO' },
    { id: "00000000-0000-4000-a000-000000000005", title: 'Nhiệm vụ 5: Xlink', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.top/api?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK' },
    { id: "00000000-0000-4000-a000-000000000006", title: 'Nhiệm vụ 6: Linkngon', reward: 200, max_per_day: 5, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', description: 'LINKNGON' },
    { id: "00000000-0000-4000-a000-000000000007", title: 'Nhiệm vụ 7: TrafficTot', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten', method: 'POST', description: 'TRAFFICTOT', apiKey: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7' },
    { id: "00000000-0000-4000-a000-000000000008", title: 'Nhiệm vụ 8: Kiemtienngay', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.com/api?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY' },
    { id: "00000000-0000-4000-a000-000000000009", title: 'Nhiệm vụ 9: Layma', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://layma.net/api?api=f4b53bc4126c32ec5b7211a7430ba898&url=', method: 'GET', description: 'LAYMANET' },
    { id: "00000000-0000-4000-a000-000000000010", title: 'Nhiệm vụ 10: yeulink', reward: 200, max_per_day: 4, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', description: 'YEULINK' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: dbTasks } = await supabase.from('tasks').select('*').eq('type', 'ĐẶC BIỆT').order('created_at', { ascending: false });
      if (dbTasks) setSpecialTasks(dbTasks);

      const { data: sessions } = await supabase.from('task_sessions').select('task_id').eq('user_id', profile.id).eq('is_completed', true).gte('created_at', today);
      if (sessions) {
        const counts: Record<string, number> = {};
        sessions.forEach((s: any) => { counts[s.task_id] = (counts[s.task_id] || 0) + 1; });
        setCompletedCounts(counts);
      }
    } catch (e) {
      console.error("Lỗi đồng bộ dữ liệu:", e);
    }
    setLoading(false);
  };

  const startTaskV27 = async (task: Task) => {
    if (isProcessing) return;
    
    const done = completedCounts[task.id] || 0;
    if (done >= task.max_per_day) {
      alert("Bạn đã hết lượt làm nhiệm vụ này hôm nay!");
      return;
    }

    setIsProcessing(task.id);
    setVerifyStep(1);
    setShowVerifyModal(true);
    setVerifyingTaskId(task.id);

    const activeSessionToken = Math.floor(100000 + Math.random() * 900000).toString();
    
    try {
      // 1. Lấy IP khách
      let userIp = '0.0.0.0';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {}

      // 2. Lưu phiên vào Database (Sử dụng t.id là UUID từ database)
      const { error: dbError } = await supabase.from('task_sessions').insert([{ 
          user_id: profile.id, 
          session_token: activeSessionToken, 
          task_type: task.id, 
          user_ip: userIp, 
          reward: task.reward,
          is_completed: false 
      }]);

      if (dbError) throw new Error("Lỗi Database: " + dbError.message);

      // 3. GỌI API QUA GOOGLE PROXY
      const targetUrl = BLOG_DEST + "?token=" + activeSessionToken;
      const finalApiUrl = task.api_url + encodeURIComponent(targetUrl);
      
      const response = await fetch(`${GOOGLE_PROXY}?url=${encodeURIComponent(finalApiUrl)}`);
      if (!response.ok) throw new Error("Google Proxy không phản hồi.");
      
      const res = await response.json();

      // 4. KIỂM TRA LINK RÚT GỌN (CHỐNG NHẢY THẲNG BLOG)
      const finalLink = res.shortenedUrl || res.shortlink || res.url || res.link || (res.data && res.data.url);

      // ĐIỀU KIỆN QUAN TRỌNG: Phải có link rút gọn và link đó KHÔNG ĐƯỢC chứa 'blogspot.com'
      if (finalLink && finalLink.includes('http') && !finalLink.includes('blogspot.com')) {
          window.open(finalLink, '_blank');
          setVerifyStep(2);
      } else {
          // Nếu API trả về link blog đích hoặc rỗng => Báo lỗi
          throw new Error("API không trả về link rút gọn hợp lệ. Vui lòng thử lại hoặc chọn nhiệm vụ khác!");
      }

    } catch (e: any) {
      setShowVerifyModal(false);
      console.error("Lỗi startTaskV27:", e);
      alert("Lỗi: " + (e.message || "Kết nối máy chủ thất bại."));
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async () => {
    const val = verificationCode.trim();
    if (val.length !== 6) return alert("Vui lòng nhập mã 6 số chính xác!");
    
    try {
      const { data, error } = await supabase.rpc('claim_task_reward', { 
        p_user_id: profile.id, 
        p_token: val 
      });
      if (error) throw error;
      if (data && data.success) { 
        alert(`Hoàn thành! Bạn đã nhận được phần thưởng.`); 
        setVerificationCode('');
        setShowVerifyModal(false);
        setVerifyingTaskId(null);
        fetchData();
        refreshProfile();
      } else {
        alert("Mã xác nhận không đúng hoặc bạn chưa hoàn tất nhiệm vụ!");
      }
    } catch (e: any) {
      alert("Lỗi xác minh: " + (e.message || "Kết nối thất bại."));
    }
  };

  const currentTasks = activeTab === 'normal' ? NORMAL_TASKS : specialTasks;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <style>{`
        /* Nền kính mờ bao phủ toàn màn hình */
        #verify-v27-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(15, 23, 42, 0.75);
            backdrop-filter: blur(12px);
            z-index: 9999;
            display: flex;
            align-items: center; justify-content: center;
            transition: all 0.3s ease;
        }

        /* Khung card trung tâm */
        .mmo-card {
            background: rgba(255, 255, 255, 0.98);
            padding: 40px;
            border-radius: 32px;
            box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.3);
            max-width: 420px; width: 90%;
            text-align: center;
            border: 1px solid rgba(255, 255, 255, 0.4);
            animation: mmoFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes mmoFadeIn {
            from { transform: scale(0.9) translateY(20px); opacity: 0; }
            to { transform: scale(1) translateY(0); opacity: 1; }
        }

        /* Hiệu ứng xoay nạp dữ liệu */
        .mmo-loader {
            width: 65px; height: 65px;
            border: 6px solid #f1f5f9;
            border-top: 6px solid #3b82f6; 
            border-radius: 50%;
            animation: mmoSpin 1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            margin: 0 auto 25px;
        }

        @keyframes mmoSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        /* Ô nhập mã cực đẹp */
        .mmo-input-v2 {
            width: 100%; padding: 18px;
            margin: 25px 0;
            border: 2.5px solid #e2e8f0;
            border-radius: 16px;
            font-size: 26px; text-align: center;
            letter-spacing: 6px; font-weight: 800;
            color: #1e293b;
            background: #f8fafc;
            transition: 0.3s;
        }

        .mmo-input-v2:focus { 
            border-color: #3b82f6; 
            background: #fff;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
            outline: none;
        }

        /* Nút bấm Gradient */
        .mmo-btn-gradient {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white; border: none;
            padding: 16px 32px; border-radius: 16px;
            font-weight: 700; width: 100%; font-size: 16px;
            cursor: pointer; transition: 0.3s;
            box-shadow: 0 8px 20px -5px rgba(59, 130, 246, 0.4);
            text-transform: uppercase;
        }

        .mmo-btn-gradient:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px -5px rgba(59, 130, 246, 0.5);
        }
      `}</style>

      {/* Modal Xác Minh "Lung Linh" 100% Identical */}
      {showVerifyModal && (
        <div id="verify-v27-overlay">
          <div className="mmo-card">
            {verifyStep === 1 ? (
              <div id="mmo-step-1">
                <div className="mmo-loader"></div>
                <h3 className="text-[#1e293b] text-[22px] font-black mb-2">Đang tạo nhiệm vụ...</h3>
                <p className="text-[#64748b] text-[15px] leading-relaxed">Hệ thống đang thiết lập liên kết an toàn. Vui lòng không đóng cửa sổ này.</p>
              </div>
            ) : (
              <div id="mmo-step-2" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-[#1e293b] text-[22px] font-black">Xác nhận mã số</h3>
                <p className="text-[#64748b] text-[14px] mt-2">Nhập mã 6 số bạn nhận được tại Blog vào ô dưới đây.</p>
                <input 
                  type="text" 
                  value={verificationCode} 
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="mmo-input-v2" 
                  placeholder="000000" 
                  autoFocus
                />
                <button className="mmo-btn-gradient" onClick={handleVerify}>XÁC NHẬN NHẬN THƯỞNG</button>
                <p 
                  className="mt-5 text-[13px] text-[#94a3b8] cursor-pointer underline hover:text-blue-500 transition-colors font-medium" 
                  onClick={() => { setShowVerifyModal(false); setVerificationCode(''); setVerifyingTaskId(null); }}
                >
                  Hủy và quay lại
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Trung Tâm <span className="text-blue-500">Nhiệm Vụ</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Hệ thống MMO chuyên nghiệp • Kiếm tiền 24/7</p>
        </div>

        <div className="flex p-2 bg-[#151a24] rounded-[30px] border border-gray-800 shadow-2xl relative z-10">
          <button 
            onClick={() => setActiveTab('normal')}
            className={`px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'normal' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400 hover:text-white'
            }`}
          >
            NVU THƯỜNG ({NORMAL_TASKS.length})
          </button>
          <button 
            onClick={() => setActiveTab('special')}
            className={`px-10 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
              activeTab === 'special' ? 'bg-blue-600 text-white shadow-xl' : 'text-gray-400 hover:text-white'
            }`}
          >
            NVU ĐẶC BIỆT ({specialTasks.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {currentTasks.map((task) => {
          const done = completedCounts[task.id] || 0;
          const isFull = done >= task.max_per_day;
          const isVerifying = verifyingTaskId === task.id && showVerifyModal;

          return (
            <div key={task.id} className={`bg-[#151a24] rounded-[38px] p-8 border transition-all duration-500 flex flex-col justify-between min-h-[440px] relative overflow-hidden group ${
              isFull ? 'border-red-900/10 opacity-50 grayscale' : 
              isVerifying ? 'border-blue-500 shadow-2xl bg-blue-500/5' : 
              'border-gray-800 hover:border-gray-700 shadow-xl'
            }`}>
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full group-hover:bg-blue-600/10 transition-all"></div>

              <div className="flex justify-between items-start relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-xl shadow-inner">
                  {task.icon || '🔗'}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-500">+{task.reward}đ</p>
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG</p>
                </div>
              </div>

              <div className="mt-10 relative z-10">
                <h3 className="text-xl font-black text-white mb-6 leading-tight h-14 line-clamp-2">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <span className="bg-gray-800/80 text-gray-400 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700/50">
                    {task.description || 'HỆ THỐNG MMO'}
                  </span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    isFull ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'
                  }`}>
                    LƯỢT: {done}/{task.max_per_day}
                  </span>
                </div>
              </div>

              <div className="mt-auto relative z-10">
                <button 
                  onClick={() => startTaskV27(task)}
                  disabled={isProcessing !== null || isFull}
                  className={`w-full py-5 rounded-[24px] font-black text-[11px] uppercase tracking-widest transition-all ${
                    isFull 
                    ? 'bg-gray-800 text-gray-600 cursor-not-allowed border-none' 
                    : 'bg-[#1e2530] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 shadow-lg'
                  }`}
                >
                  {isProcessing === task.id ? (
                    <div className="flex items-center justify-center gap-2">
                       <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                       ĐANG KHỞI TẠO...
                    </div>
                  ) : isFull ? 'HẾT LƯỢT HÔM NAY' : 'BẮT ĐẦU NGAY →'}
                </button>
              </div>
            </div>
          );
        })}

        {currentTasks.length === 0 && !loading && (
          <div className="col-span-full py-40 text-center bg-[#151a24] rounded-[48px] border border-gray-800 border-dashed">
            <div className="text-7xl mb-6 opacity-10">📂</div>
            <p className="text-gray-600 font-black uppercase tracking-[0.4em] text-[10px]">Chưa có nhiệm vụ khả dụng</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
