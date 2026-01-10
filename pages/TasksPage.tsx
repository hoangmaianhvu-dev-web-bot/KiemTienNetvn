
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<'offer' | 'regular' | 'special' | 'social'>('offer');
  const [loading, setLoading] = useState(true);
  
  // States cho quy trình xác nhận mã
  const [verifyingTaskId, setVerifyingTaskId] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    const filtered = allTasks.filter(t => t.type === activeTab);
    setFilteredTasks(filtered);
  }, [activeTab, allTasks]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('reward', { ascending: false });
      if (error) throw error;
      if (data) setAllTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTask = (task: Task) => {
    if (task.url) {
      window.open(task.url, '_blank');
    }
    // Chuyển sang chế độ nhập mã cho nhiệm vụ này
    setVerifyingTaskId(task.id);
    setVerificationCode('');
  };

  const handleVerifyAndComplete = async (task: Task) => {
    if (!verificationCode || verificationCode.length < 4) {
      return alert('Vui lòng nhập mã xác nhận hợp lệ từ trang web!');
    }

    // Giả lập kiểm tra mã: Trong thực tế bạn có thể so sánh với mã trong DB 
    // Ở đây ta chấp nhận mã demo là '123456' hoặc bất kỳ mã nào đủ 6 số để dễ test
    const isValidCode = verificationCode.trim() === '123456' || verificationCode.trim().length === 6;
    
    if (!isValidCode) {
      return alert('Mã xác nhận không chính xác. Vui lòng kiểm tra lại trên blog!');
    }

    setCompleting(task.id);
    
    try {
      const { data: latestProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('balance, total_earned, tasks_completed')
        .eq('id', profile.id)
        .single();

      if (fetchError) throw new Error("Lỗi kết nối máy chủ.");

      const currentBalance = Number(latestProfile.balance || 0);
      const currentTotal = Number(latestProfile.total_earned || 0);
      const currentTasks = Number(latestProfile.tasks_completed || 0);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          balance: currentBalance + Number(task.reward),
          total_earned: currentTotal + Number(task.reward),
          tasks_completed: currentTasks + 1
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      alert(`🎉 Thành công! Mã chính xác. Bạn đã nhận được +${Number(task.reward).toLocaleString()}đ.`);
      setVerifyingTaskId(null);
      refreshProfile();
    } catch (err: any) {
      alert('Lỗi: ' + (err.message || 'Vui lòng thử lại'));
    } finally {
      setCompleting(null);
    }
  };

  const categories = [
    { id: 'offer', label: 'ƯU ĐÃI' },
    { id: 'regular', label: 'THƯỜNG' },
    { id: 'special', label: 'ĐẶC BIỆT' },
    { id: 'social', label: 'MẠNG XÃ HỘI' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10 text-center md:text-left">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🔥 TRUNG TÂM KIẾM TIỀN</p>
        <h1 className="text-4xl font-black text-white tracking-tight">Hệ thống <span className="text-gray-500">Nhiệm vụ</span></h1>
      </div>

      <div className="flex justify-center mb-12">
        <div className="bg-[#151a24] p-1.5 rounded-[20px] border border-gray-800 flex shadow-2xl overflow-x-auto scrollbar-hide">
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => {
                setActiveTab(cat.id as any);
                setVerifyingTaskId(null); // Reset trạng thái khi đổi tab
              }} 
              className={`px-8 py-3.5 rounded-[16px] text-[11px] font-black whitespace-nowrap transition-all duration-300 ${
                activeTab === cat.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' 
                : 'text-gray-500 hover:text-white'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="bg-[#151a24] rounded-[40px] p-20 border border-gray-800 text-center animate-in fade-in duration-500">
           <div className="text-4xl mb-4">📭</div>
           <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">Hiện tại chưa có nhiệm vụ {categories.find(c => c.id === activeTab)?.label}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {filteredTasks.map(task => {
            const isVerifying = verifyingTaskId === task.id;
            
            return (
              <div key={task.id} className={`bg-[#151a24] rounded-[32px] p-8 border ${isVerifying ? 'border-blue-500 shadow-blue-900/20' : 'border-gray-800'} hover:border-blue-500/50 transition-all flex flex-col justify-between group shadow-xl relative overflow-hidden`}>
                {isVerifying && (
                  <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 animate-pulse"></div>
                )}
                
                <div>
                  <div className="flex justify-between items-start mb-8">
                     <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                        {task.icon || '🔗'}
                     </div>
                     <div className="text-right">
                        <p className="text-blue-500 font-black text-2xl">+{Number(task.reward).toLocaleString()}đ</p>
                        <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NGAY</p>
                     </div>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{task.title}</h3>
                  <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-2">{task.description}</p>
                </div>

                {isVerifying ? (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <div className="relative">
                      <input 
                        type="text" 
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        placeholder="Nhập mã từ Web/Blog..." 
                        className="w-full bg-[#0b0e14] border border-blue-500/30 rounded-2xl py-4 px-5 text-white text-sm focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700 font-bold tracking-widest uppercase"
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 pointer-events-none">
                         <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
                         <span className="text-[8px] text-blue-500 font-black">CODE</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={() => handleVerifyAndComplete(task)}
                        disabled={!!completing}
                        className="flex-grow bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {completing === task.id ? (
                           <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : 'XÁC NHẬN'}
                      </button>
                      <button 
                        onClick={() => setVerifyingTaskId(null)}
                        className="bg-gray-800 text-gray-400 px-5 rounded-2xl font-black text-[10px] hover:bg-gray-700 transition-all"
                      >
                        HỦY
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleStartTask(task)}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 ${
                      activeTab === 'special' 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    BẮT ĐẦU NGAY
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
      
      {/* Tip Hướng dẫn */}
      <div className="mt-16 bg-blue-600/5 border border-blue-500/10 p-8 rounded-[32px] flex items-start gap-6">
         <div className="text-3xl">💡</div>
         <div>
            <h4 className="text-white font-bold mb-2">Hướng dẫn lấy mã:</h4>
            <p className="text-gray-500 text-xs leading-relaxed">
              Nhấn <span className="text-blue-500 font-black">Bắt đầu ngay</span> để mở trang đích. Cuộn xuống cuối bài viết trên blog và tìm nút <span className="text-white font-bold italic">"Lấy mã xác nhận"</span>. Đợi 30-60 giây để hệ thống tạo mã, sau đó quay lại đây dán vào để nhận tiền. 
              <br/><br/>
              <span className="text-gray-600 text-[10px] uppercase font-black tracking-widest italic">Mã Demo mặc định: 123456</span>
            </p>
         </div>
      </div>
    </div>
  );
};

export default TasksPage;
