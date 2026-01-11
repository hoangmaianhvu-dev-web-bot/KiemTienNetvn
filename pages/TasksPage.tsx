
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const PROXY = "https://api.allorigins.win/get?url=";
const BLOG_DEST = "https://avudev-verifi.blogspot.com/";

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [activeTab, setActiveTab] = useState<'normal' | 'special'>('normal');
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(true);

  // Danh sách 10 nhiệm vụ mặc định (NVU THƯỜNG)
  const NORMAL_TASKS: Task[] = [
    { id: "t1", title: 'Nhiệm vụ 1: Link4m', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M' },
    { id: "t2", title: 'Nhiệm vụ 2: YeuMoney', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY' },
    { id: "t3", title: 'Nhiệm vụ 3: Linktot', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT' },
    { id: "t4", title: 'Nhiệm vụ 4: 4mmo', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: '4MMO' },
    { id: "t5", title: 'Nhiệm vụ 5: Xlink', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.top/api?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK' },
    { id: "t6", title: 'Nhiệm vụ 6: Linkngon', reward: 200, max_per_day: 5, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', description: 'LINKNGON' },
    { id: "t7", title: 'Nhiệm vụ 7: TrafficTot', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten', method: 'POST', description: 'TRAFFICTOT', apiKey: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7' },
    { id: "t8", title: 'Nhiệm vụ 8: Kiemtienngay', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.com/api?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY' },
    { id: "t9", title: 'Nhiệm vụ 9: Layma', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://layma.net/api?api=f4b53bc4126c32ec5b7211a7430ba898&url=', method: 'GET', description: 'LAYMANET' },
    { id: "t10", title: 'Nhiệm vụ 10: yeulink', reward: 200, max_per_day: 4, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', description: 'YEULINK' },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Lấy danh sách nhiệm vụ từ DB (NVU ĐẶC BIỆT)
      const { data: dbTasks } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (dbTasks) setAdminTasks(dbTasks);

      // Lấy số lượt đã làm hôm nay
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

  const startTaskV27 = async (task: Task) => {
    if (isProcessing) return;
    setIsProcessing(task.id);
    
    try {
      const done = completedCounts[task.id] || 0;
      if (done >= task.max_per_day) {
        alert("Bạn đã hết lượt làm nhiệm vụ này hôm nay!");
        setIsProcessing(null);
        return;
      }

      const activeSessionToken = Math.floor(100000 + Math.random() * 900000).toString();
      
      let userIp = '0.0.0.0';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        userIp = ipData.ip;
      } catch (e) {}

      await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: activeSessionToken,
        task_id: task.id,
        is_completed: false,
        user_ip: userIp,
        reward: task.reward
      }]);

      const targetUrl = BLOG_DEST + "?token=" + activeSessionToken;
      let finalLink = "";

      try {
        if (task.method === 'POST') {
          const r = await fetch(task.api_url!, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ api_key: task.apiKey, url: targetUrl }) 
          });
          const res = await r.json(); 
          finalLink = res.shortenedUrl || res.url || res.link || (res.data && res.data.url);
        } else if (task.api_url) {
          const apiUrl = task.api_url + encodeURIComponent(targetUrl);
          const r = await fetch(PROXY + encodeURIComponent(apiUrl));
          const j = await r.json();
          const res = JSON.parse(j.contents);
          finalLink = res.shortenedUrl || res.url || res.link || res.shortlink || (res.data && res.data.url);
        }
      } catch (e) {
        finalLink = task.fallback_url || targetUrl;
      }

      if (!finalLink) finalLink = targetUrl;

      setVerifyingTaskId(task.id);
      window.open(finalLink, '_blank');

    } catch (err: any) {
      alert("Lỗi hệ thống khởi tạo!");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleVerify = async () => {
    const val = verificationCode.trim();
    if (val.length !== 6) return alert("Nhập mã 6 số!");
    
    try {
      const { data } = await supabase.rpc('claim_task_reward', { 
        p_user_id: profile.id, 
        p_token: val 
      });
      if (data && data.success) { 
        alert(`Thành công! +${profile.role === 'admin' ? '0' : '200'}đ`); 
        setVerificationCode('');
        setVerifyingTaskId(null);
        fetchData();
        refreshProfile();
      } else {
        alert("Mã xác nhận không đúng!");
      }
    } catch (e) {
      alert("Lỗi xác minh!");
    }
  };

  const currentTasks = activeTab === 'normal' ? NORMAL_TASKS : adminTasks;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-black text-[10px] uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Trung Tâm <span className="text-gray-500/50">Nhiệm Vụ</span>
          </h1>
          <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Hoàn thành thử thách để nhận thưởng ngay</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex p-1.5 bg-[#151a24] rounded-2xl border border-gray-800 shadow-xl">
          <button 
            onClick={() => setActiveTab('normal')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'normal' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            NVU THƯỜNG ({NORMAL_TASKS.length})
          </button>
          <button 
            onClick={() => setActiveTab('special')}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === 'special' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
            }`}
          >
            NVU ĐẶC BIỆT ({adminTasks.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {currentTasks.map((task) => {
          const done = completedCounts[task.id] || 0;
          const isFull = done >= task.max_per_day;
          const isVerifying = verifyingTaskId === task.id;

          return (
            <div key={task.id} className={`bg-[#151a24] rounded-[38px] p-8 border transition-all duration-500 flex flex-col justify-between min-h-[420px] ${
              isFull ? 'border-red-900/10 opacity-50 grayscale' : 
              isVerifying ? 'border-blue-500 shadow-2xl bg-blue-500/5' : 
              'border-gray-800 hover:border-gray-700 shadow-xl'
            }`}>
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-xl">
                  {task.icon || '🔗'}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-500">+{task.reward}đ</p>
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG</p>
                </div>
              </div>

              <div className="mt-10">
                <h3 className="text-xl font-black text-white mb-6 leading-tight h-14 line-clamp-2">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mb-8">
                  <span className="bg-gray-800/80 text-gray-500 px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border border-gray-700/50">
                    {task.description || 'MMO SYSTEM'}
                  </span>
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                    isFull ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-600/10 text-blue-500 border-blue-600/20'
                  }`}>
                    LƯỢT: {done}/{task.max_per_day}
                  </span>
                </div>
              </div>

              <div className="mt-auto">
                {isVerifying ? (
                  <div className="space-y-4 animate-in slide-in-from-top-2">
                    <input 
                      type="text" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                      placeholder="MÃ XÁC NHẬN" 
                      className="w-full bg-gray-900 border border-blue-500/30 rounded-2xl py-5 text-white text-center font-black tracking-[0.4em] text-lg focus:border-blue-500 outline-none" 
                    />
                    <div className="flex gap-2">
                      <button onClick={handleVerify} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all">XÁC NHẬN</button>
                      <button onClick={() => setVerifyingTaskId(null)} className="bg-gray-800 text-gray-500 px-6 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest">HỦY</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => startTaskV27(task)}
                    disabled={isProcessing !== null || isFull}
                    className={`w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest transition-all ${
                      isFull 
                      ? 'bg-gray-800 text-gray-600 cursor-not-allowed' 
                      : 'bg-[#1e2530] hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800'
                    }`}
                  >
                    {isProcessing === task.id ? 'ĐANG XỬ LÝ...' : isFull ? 'HẾT LƯỢT' : 'BẮT ĐẦU →'}
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {currentTasks.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="text-6xl mb-6 opacity-20">🗃️</div>
            <p className="text-gray-600 font-black uppercase tracking-widest text-[10px]">Chưa có nhiệm vụ đặc biệt nào được tạo</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
