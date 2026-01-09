
import React, { useState, useEffect } from 'react';
import { UserProfile, Task } from '../types';
import { supabase } from '../supabase';

interface TasksPageProps {
  profile: UserProfile;
}

const TasksPage: React.FC<TasksPageProps> = ({ profile }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const { data, error } = await supabase.from('tasks').select('*');
    if (data) setTasks(data);
    setLoading(false);
  };

  const handleCompleteTask = async (task: Task) => {
    setCompleting(task.id);
    try {
      // Logic giả lập hoàn thành: Trong thực tế sẽ qua một trang trung gian
      // Ở đây ta cộng tiền trực tiếp để test tính năng
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
      alert(`Chúc mừng! Bạn nhận được ${task.reward.toLocaleString()}đ`);
      window.location.reload(); // Refresh để cập nhật số dư hiển thị
    } catch (err) {
      alert('Lỗi khi nhận thưởng');
    } finally {
      setCompleting(null);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500">Đang tải nhiệm vụ...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">📈 Nhiệm vụ khả dụng</p>
        <h1 className="text-4xl font-black text-white">Kho Nhiệm Vụ Real-time</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tasks.map(task => (
          <div key={task.id} className="bg-[#151a24] rounded-[32px] p-8 border border-gray-800 hover:border-blue-500/50 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start mb-6">
                 <div className="bg-gray-800/50 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl">{task.icon || '🔗'}</div>
                 <div className="text-right">
                    <p className="text-blue-500 font-black text-xl">{Number(task.reward).toLocaleString()}đ</p>
                    <p className="text-[9px] font-black text-gray-600 uppercase tracking-widest mt-0.5">Tiền thưởng</p>
                 </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{task.title}</h3>
              <p className="text-gray-500 text-sm mb-8">{task.description}</p>
            </div>
            <button 
              onClick={() => handleCompleteTask(task)}
              disabled={!!completing}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-all disabled:opacity-50"
            >
              {completing === task.id ? 'ĐANG XỬ LÝ...' : 'NHẬN NHIỆM VỤ'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Fix: Add missing default export
export default TasksPage;
