
import React from 'react';
import { UserProfile } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const data = [
    { name: 'T2', value: 400 },
    { name: 'T3', value: 300 },
    { name: 'T4', value: 600 },
    { name: 'T5', value: 800 },
    { name: 'T6', value: 500 },
    { name: 'T7', value: 900 },
    { name: 'CN', value: 700 },
  ];

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🚀 Thống kê tổng quan</p>
          <h1 className="text-3xl md:text-4xl font-black text-white">
            Chào {profile?.full_name?.split(' ')[0] || 'bạn'}, <span className="text-gray-500">{isAdmin ? 'hệ thống đang hoạt động tốt!' : 'thật vui khi thấy bạn!'}</span>
          </h1>
        </div>
        <div className="flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 px-4 py-2 rounded-full">
           <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
           <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{isAdmin ? 'BẢNG QUẢN TRỊ ADMIN' : 'SERVER TRỰC TUYẾN'}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Số dư hiện tại', value: isAdmin ? '∞ VÔ HẠN' : `${Number(profile?.balance || 0).toLocaleString()}đ`, icon: '💰', color: 'text-blue-500' },
          { label: 'Tổng đã kiếm', value: isAdmin ? 'TỐI ĐA' : `${Number(profile?.total_earned || 0).toLocaleString()}đ`, icon: '📈', color: 'text-green-500' },
          { label: 'Nhiệm vụ xong', value: profile?.tasks_completed || 0, icon: '✅', color: 'text-purple-500' },
          { label: 'Người giới thiệu', value: 0, icon: '👥', color: 'text-indigo-500' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#151a24] p-8 rounded-[40px] border border-gray-800 group hover:border-blue-500/30 transition-all shadow-xl">
            <div className="flex justify-between items-start mb-6">
              <div className="bg-gray-800/50 w-12 h-12 flex items-center justify-center rounded-2xl text-2xl group-hover:scale-110 transition-transform">
                {stat.icon}
              </div>
            </div>
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className={`text-2xl font-black ${stat.color}`}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#151a24] p-10 rounded-[48px] border border-gray-800 shadow-2xl">
           <div className="flex justify-between items-center mb-12">
              <div>
                <h3 className="text-2xl font-black text-white mb-1">Biểu đồ thu nhập</h3>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Dòng tiền trong tuần này</p>
              </div>
           </div>
           <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4b5563', fontSize: 12, fontWeight: 'bold'}} />
                  <Tooltip cursor={{fill: 'rgba(59, 130, 246, 0.05)'}} contentStyle={{backgroundColor: '#1f2937', border: 'none', borderRadius: '16px'}} />
                  <Bar dataKey="value" radius={[10, 10, 10, 10]}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 5 ? '#3b82f6' : '#1f2937'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

        <div className="bg-gradient-to-br from-[#151a24] to-[#0b0e14] p-10 rounded-[48px] border border-gray-800 shadow-2xl flex flex-col justify-between">
           <div>
              <div className="flex justify-between items-center mb-10">
                 <h3 className="text-2xl font-black text-white">Chỉ tiêu</h3>
                 <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-3 py-1.5 rounded-full border border-blue-500/20">0%</span>
              </div>
              <div className="space-y-8">
                {[
                  { label: 'VƯỢT LINK', progress: 0, color: 'bg-blue-500' },
                  { label: 'MỜI BẠN', progress: 0, color: 'bg-purple-500' },
                  { label: 'XEM VIDEO', progress: 0, color: 'bg-green-500' }
                ].map((task, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">
                      <span>{task.label}</span>
                      <span className="text-white">{task.progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                      <div className={`h-full ${task.color} transition-all duration-1000`} style={{width: `${task.progress}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
           </div>
           <div className="mt-12 bg-blue-600 p-8 rounded-[32px] relative overflow-hidden group cursor-pointer shadow-2xl shadow-blue-900/30">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-[50px] rounded-full translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform"></div>
              <p className="text-blue-100 text-[10px] font-black uppercase tracking-widest mb-2">Thưởng nóng</p>
              <p className="text-white text-sm font-bold leading-relaxed">Đạt chỉ tiêu tuần nhận thêm <span className="underline decoration-2">50.000đ</span>!</p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
