
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
  refreshProfile: () => void;
}

const TasksPage: React.FC<TasksPageProps> = ({ profile, refreshProfile }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase.from('tasks').select('*').order('reward', { ascending: false });
      if (error) throw error;
      if (data) setTasks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (task: Task) => {
    if (completing) return;
    setCompleting(task.id);
    
    try {
      // Giả lập xử lý nhiệm vụ 1.5s để tạo cảm giác uy tín
      await new Promise(resolve => setTimeout(resolve, 1500));

      const newBalance = (profile.balance || 0) + Number(task.reward);
      const newTotalEarned = (profile.total_earned || 0) + Number(task.reward);
      const newTasksCompleted = (profile.tasks_completed || 0) + 1;

      const { error } = await supabase
        .from('profiles')
        .update({
          balance: newBalance,
          total_earned: newTotalEarned,
          tasks_completed: newTasksCompleted
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      alert(`🎉 Thành công! +${Number(task.reward).toLocaleString()}đ đã vào tài khoản.`);
      refreshProfile(); // Cập nhật số dư UI ngay lập tức
    } catch (err: any) {
      alert('Lỗi hệ thống: ' + (err.message || 'Vui lòng thử lại sau'));
    } finally {
      setCompleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🔥 NHIỆM VỤ ĐANG HOT</p>
          <h1 className="text-4xl font-black text-white tracking-tight">Kiếm tiền <span className="text-gray-500">mỗi giây</span></h1>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl px-6 py-3">
          <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest mb-1">Ví của bạn</p>
          <p className="text-blue-500 font-black text-xl">{profile.balance?.toLocaleString()}đ</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-[#151a24] rounded-[40px] p-20 border border-gray-800 text-center">
           <p className="text-gray-600 font-bold uppercase tracking-widest text-sm">Hiện tại chưa có nhiệm vụ mới</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tasks.map(task => (
            <div key={task.id} className="bg-[#151a24] rounded-[32px] p-8 border border-gray-800 hover:border-blue-500/50 hover:translate-y-[-4px] transition-all flex flex-col justify-between group shadow-xl">
              <div>
                <div className="flex justify-between items-start mb-8">
                   <div className="bg-blue-600/10 w-16 h-16 rounded-2xl flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">{task.icon || '🔗'}</div>
                   <div className="text-right">
                      <p className="text-blue-500 font-black text-2xl">+{Number(task.reward).toLocaleString()}đ</p>
                      <p className="text-[9px] font-black text-gray-700 uppercase tracking-widest mt-1">THƯỞNG NGAY</p>
                   </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-blue-400 transition-colors">{task.title}</h3>
                <p className="text-gray-500 text-sm mb-8 leading-relaxed line-clamp-3">{task.description}</p>
              </div>
              <button 
                onClick={() => handleCompleteTask(task)}
                disabled={!!completing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-3"
              >
                {completing === task.id ? (
                   <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> XÁC MINH...</>
                ) : 'BẮT ĐẦU NHIỆM VỤ'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TasksPage;
