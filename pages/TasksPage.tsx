
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const TASK_IDS = [
  "550e8400-e29b-41d4-a716-446655440001",
  "550e8400-e29b-41d4-a716-446655440002",
  "550e8400-e29b-41d4-a716-446655440003",
  "550e8400-e29b-41d4-a716-446655440004",
  "550e8400-e29b-41d4-a716-446655440005",
  "550e8400-e29b-41d4-a716-446655440006",
  "550e8400-e29b-41d4-a716-446655440007",
  "550e8400-e29b-41d4-a716-446655440008",
  "550e8400-e29b-41d4-a716-446655440009",
  "550e8400-e29b-41d4-a716-446655440010"
];

const PROXY = "https://api.allorigins.win/get?url=";
const DEST_URL = "https://avudev-verifi.blogspot.com/";

const HARDCODED_TASKS: Task[] = [
  { id: TASK_IDS[2], title: 'Nhiệm vụ 1 (LaymaNet)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://layma.net/api?api=f4b53bc4126c32ec5b7211a7430ba898&url=', method: 'GET', description: 'LAYMANET', url: DEST_URL, fallback_url: 'https://layma.net/rOI1GEgUa' },
  { id: TASK_IDS[3], title: 'Nhiệm vụ 2 (KiemTienNgay)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.com/api?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY', url: DEST_URL, fallback_url: 'https://kiemtienngay.com/TMSfZ28' },
  { id: TASK_IDS[4], title: 'Nhiệm vụ 3 (4MMO)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: 'MMO4', url: DEST_URL, fallback_url: 'https://4mmo.net/nhanngay10M' },
  { id: TASK_IDS[6], title: 'Nhiệm vụ 4 (XLink)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.top/api?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK', url: DEST_URL, fallback_url: 'https://linkday.xyz/spXRTWyG3q' },
  { id: TASK_IDS[8], title: 'Nhiệm vụ 5 (TrafficTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten', method: 'POST', description: 'TRAFFICTOT', url: DEST_URL, apiKey: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', fallback_url: 'https://vuotlink.live/jvtH9wd718TN28DbHbH6' },
  { id: TASK_IDS[0], title: 'Nhiệm vụ 6 (Link4m)', reward: 200, max_per_day: 2, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M', url: DEST_URL, fallback_url: 'https://link4m.com/zOOb1' },
  { id: TASK_IDS[1], title: 'Nhiệm vụ 7 (YeuMoney)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY', url: DEST_URL, fallback_url: 'https://yeumoney.com/ZyCnUEy' },
  { id: TASK_IDS[5], title: 'Nhiệm vụ 8 (LinkTot)', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT', url: DEST_URL, fallback_url: 'https://linktot.net/' },
];

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [completedCounts, setCompletedCounts] = useState<Record<string, number>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
  };

  const startTask = async (task: Task) => {
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

      await supabase.from('task_sessions').insert([{
        user_id: profile.id,
        session_token: token,
        task_id: task.id,
        is_completed: false,
        user_ip: userIp,
        reward: 200
      }]);

      let finalLink = task.fallback_url || DEST_URL;
      
      try {
        if (task.method === 'POST') {
          const r = await fetch(task.api_url!, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ api_key: task.apiKey, url: DEST_URL }) 
          });
          const res = await r.json(); 
          finalLink = res.shortenedUrl || res.url || finalLink;
        } else {
          const r = await fetch(PROXY + encodeURIComponent(task.api_url + encodeURIComponent(DEST_URL)));
          const j = await r.json();
          const res = JSON.parse(j.contents);
          finalLink = res.shortenedUrl || res.url || res.link || finalLink;
        }
      } catch (e) {
        finalLink = task.fallback_url || DEST_URL;
      }

      window.open(finalLink, '_blank');
      setVerifyingTaskId(task.id);
    } catch (err: any) {
      alert("Lỗi khởi tạo nhiệm vụ!");
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
        alert("Thành công! +200đ"); 
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">
          Nhiệm Vụ <span className="text-gray-500/50">Vượt Link Kiếm Tiền</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {HARDCODED_TASKS.map((task) => {
          const done = completedCounts[task.id] || 0;
          const isFull = done >= task.max_per_day;
          const isVerifying = verifyingTaskId === task.id;

          return (
            <div key={task.id} className={`bg-[#151a24] rounded-[38px] p-8 border transition-all duration-500 flex flex-col justify-between min-h-[380px] ${
              isFull ? 'border-red-900/10 opacity-50 grayscale' : 
              isVerifying ? 'border-blue-500 shadow-2xl bg-blue-500/5' : 
              'border-gray-800 hover:border-gray-700 shadow-xl'
            }`}>
              <div className="flex justify-between items-start">
                <div className="w-14 h-14 rounded-2xl bg-gray-900/50 border border-gray-800 flex items-center justify-center text-xl">
                  {task.icon || '🔗'}
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-blue-500">+200đ</p>
                  <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG</p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-black text-white mb-4 leading-tight">{task.title}</h3>
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="bg-gray-800/80 text-gray-500 px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest">
                    {task.description}
                  </span>
                  <span className={`px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest border ${
                    isFull ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                  }`}>
                    LƯỢT: {done}/{task.max_per_day}
                  </span>
                </div>
              </div>

              <div>
                {isVerifying ? (
                  <div className="space-y-4">
                    <input 
                      type="text" 
                      value={verificationCode} 
                      onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                      placeholder="MÃ XÁC NHẬN" 
                      className="w-full bg-gray-900 border border-blue-500/30 rounded-2xl py-4 text-white text-center font-black tracking-[0.4em] text-lg focus:border-blue-500 outline-none" 
                    />
                    <div className="flex gap-2">
                      <button onClick={handleVerify} className="flex-grow bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">XÁC NHẬN</button>
                      <button onClick={() => setVerifyingTaskId(null)} className="bg-gray-800 text-gray-500 px-5 py-4 rounded-2xl font-black text-[10px] uppercase">HỦY</button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => startTask(task)}
                    disabled={isProcessing !== null || isFull}
                    className={`w-full py-5 rounded-[22px] font-black text-[11px] uppercase tracking-widest transition-all ${
                      isFull ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : 'bg-[#1e2530] hover:bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    {isProcessing === task.id ? 'ĐANG XỬ LÝ...' : isFull ? 'HẾT LƯỢT' : 'LÀM NHIỆM VỤ →'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TasksPage;
