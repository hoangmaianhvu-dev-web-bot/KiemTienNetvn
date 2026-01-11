
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

// 1. ĐỊNH NGHĨA 10 MÃ UUID CỐ ĐỊNH (v16)
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

interface TaskConfig extends Task {
  noProxy?: boolean;
}

const HARDCODED_TASKS: TaskConfig[] = [
  { id: TASK_IDS[0], title: 'Link4m', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://link4m.co/api-shorten/v2?api=68208afab6b8fc60542289b6&url=', method: 'GET', description: 'LINK4M', url: DEST_URL, fallback_url: 'https://link4m.com/zOOb1' },
  { id: TASK_IDS[1], title: 'YeuMoney', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeumoney.com/QL_api.php?token=2103f2aa67d874c161e5f4388b2312af6d43742734a8ea41716b8a2cc94b7b02&format=json&url=', method: 'GET', description: 'YEUMONEY', url: DEST_URL, fallback_url: 'https://yeumoney.com/ZyCnUEy' },
  { id: TASK_IDS[2], title: 'LaymaNet', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://layma.net/api?api=f4b53bc4126c32ec5b7211a7430ba898&url=', method: 'GET', description: 'LAYMANET', url: DEST_URL, noProxy: true, fallback_url: 'https://layma.net/rOI1GEgUa' },
  { id: TASK_IDS[3], title: 'KiemTienNgay', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://kiemtienngay.com/api?api=bdce14c14722165a01a9c8225d88abc6&url=', method: 'GET', description: 'KIEMTIENNGAY', url: DEST_URL, noProxy: true, fallback_url: 'https://kiemtienngay.com/TMSfZ28' },
  { id: TASK_IDS[4], title: '4MMO', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://4mmo.net/api?api=e60502497c3ce642ca2e4d57515bd294ae0d8d93&url=', method: 'GET', description: '4MMO', url: DEST_URL, noProxy: true, fallback_url: 'https://4mmo.net/nhanngay10M' },
  { id: TASK_IDS[5], title: 'LinkTot', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linktot.net/JSON_QL_API.php?token=d121d1761f207cb9bfde19c8be5111cb8d623d83e1e05053ec914728c9ea869c&url=', method: 'GET', description: 'LINKTOT', url: DEST_URL, fallback_url: 'https://linktot.net/' },
  { id: TASK_IDS[6], title: 'XLink', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://xlink.top/api?api=ac55663f-ef85-4849-8ce1-4ca99bd57ce7&url=', method: 'GET', description: 'XLINK', url: DEST_URL, noProxy: true, fallback_url: 'https://linkday.xyz/spXRTWyG3q' },
  { id: TASK_IDS[7], title: 'LinkNgonIO', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://linkngon.io/api?api=5PA5LNPwgcjiVhyRYRhPjam8jGNHpGgELAEPfZH6QzWiBk&url=', method: 'GET', description: 'LINKNGONIO', url: DEST_URL, fallback_url: 'https://linkngon.io/EiT0FsMsnLf' },
  { id: TASK_IDS[8], title: 'TrafficTot', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🚀', api_url: 'https://services.traffictot.com/api/v1/shorten', method: 'POST', description: 'TRAFFICTOT', url: DEST_URL, apiKey: '8ddd0436120826a3a1afd7cc4275827af4edead951fb5ec5f7dafd03ccdc95f7', noProxy: true, fallback_url: 'https://vuotlink.live/jvtH9wd718TN28DbHbH6' },
  { id: TASK_IDS[9], title: 'Yeulink', reward: 200, max_per_day: 3, type: 'THƯỜNG', icon: '🔗', api_url: 'https://yeulink.com/api?token=a7b730f5-4fff-4b47-8ae2-c05afb3754a3&url=', method: 'GET', description: 'YEULINK', url: DEST_URL, fallback_url: 'https://yeulink.com/uc4WtXHD18' },
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

      if (sessionError) throw new Error(sessionError.message);

      let finalLink = "";
      try {
        if (task.method === 'POST') {
          const r = await fetch(task.api_url!, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify({ api_key: task.apiKey, url: DEST_URL }) 
          });
          const res = await r.json(); 
          finalLink = findShortLink(res) || "";
        } else {
          const target = task.api_url + encodeURIComponent(DEST_URL);
          const r = await fetch(task.noProxy ? target : PROXY + encodeURIComponent(target));
          const j = await r.json();
          const res = task.noProxy ? j : JSON.parse(j.contents);
          finalLink = findShortLink(res) || "";
        }
      } catch (apiError) { 
        finalLink = task.fallback_url || ""; 
      }

      if (!finalLink || finalLink.includes('blogspot.com')) finalLink = task.fallback_url || DEST_URL;

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
    <div style={{ maxWidth: '850px', margin: 'auto', fontFamily: 'sans-serif', background: '#0f172a', color: '#f8fafc', padding: '25px', borderRadius: '15px', border: '1px solid #1e293b', marginTop: '20px' }}>
      {/* Header Profile Section */}
      <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', border: '1px solid #334155' }}>
        <div>
          <div style={{ color: '#94a3b8', fontSize: '13px' }}>ID: {profile.id.slice(0, 8)}...</div>
          <h2 style={{ margin: '5px 0', color: '#22c55e', fontSize: '32px', fontWeight: 'bold' }}>
            {(profile.balance || 0).toLocaleString()}đ
          </h2>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 25px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          LÀM MỚI
        </button>
      </div>

      {/* Task Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
        {HARDCODED_TASKS.map(task => {
          const done = completedCounts[task.id] || 0;
          const isFull = 3 - done <= 0;
          return (
            <button 
              key={task.id}
              onClick={() => startTask(task)} 
              disabled={isFull || isProcessing !== null} 
              style={{ padding: '15px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: 'white', cursor: isFull ? 'not-allowed' : 'pointer', textAlign: 'left', opacity: isFull ? 0.5 : 1 }}
            >
              <b style={{ fontSize: '16px' }}>{task.title}</b><br/>
              <small style={{ color: '#94a3b8' }}>Lượt: {3 - done}/3</small>
              <div style={{ marginTop: '5px', fontSize: '12px', color: '#22c55e', fontWeight: 'bold' }}>+200đ</div>
            </button>
          );
        })}
      </div>

      {/* Verify Section */}
      {verifyingTaskId && (
        <div style={{ marginTop: '30px', padding: '25px', background: '#1e293b', border: '2px solid #3b82f6', borderRadius: '12px' }}>
          <h4 style={{ textAlign: 'center', margin: '0 0 20px 0', color: '#3b82f6', fontWeight: 'bold' }}>NHẬP MÃ XÁC NHẬN (200đ)</h4>
          <input 
            type="text" 
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Nhập mã 6 số từ link vượt..." 
            style={{ width: '100%', padding: '18px', background: '#0f172a', border: '1px solid #334155', color: '#fff', borderRadius: '10px', fontSize: '24px', textAlign: 'center', marginBottom: '20px', outline: 'none' }} 
          />
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleVerify} 
              style={{ flex: 2, padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              XÁC NHẬN
            </button>
            <button 
              onClick={() => { setVerificationCode(''); setVerifyingTaskId(null); }} 
              style={{ flex: 1, padding: '15px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer' }}
            >
              HỦY
            </button>
          </div>
        </div>
      )}

      {/* Warning */}
      <div style={{ marginTop: '24px', padding: '15px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '10px' }}>
        <p style={{ color: '#ef4444', fontSize: '11px', fontWeight: 'bold', textAlign: 'center', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Tuyệt đối không dùng VPN/Proxy. Hệ thống sẽ khóa ID vĩnh viễn nếu phát hiện gian lận.
        </p>
      </div>
    </div>
  );
};

export default TasksPage;
