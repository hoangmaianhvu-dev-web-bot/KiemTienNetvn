import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase.ts';
import { UserProfile } from '../types.ts';

interface ProfilePageProps {
  profile: UserProfile | null;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">👤 Cá nhân hóa</p>
        <h1 className="text-4xl font-black text-white">Tài khoản <span className="text-gray-500">của bạn</span></h1>
      </div>

      {!profile ? (
        <div className="bg-[#151a24] rounded-[40px] p-10 border border-gray-800 text-center">
           <p className="text-gray-400">Đang chuẩn bị hồ sơ cá nhân...</p>
           <button onClick={() => window.location.reload()} className="mt-4 bg-blue-600 px-6 py-2 rounded-xl text-white font-bold">Làm mới trang</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-[#151a24] rounded-[40px] p-10 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-8">Thông tin cá nhân <span className="text-[10px] text-blue-500 font-black uppercase ml-2 tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">Bản Demo</span></h3>
                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div>
                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Tên hiển thị</label>
                         <input disabled type="text" value={profile.full_name || ''} className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-6 text-gray-400" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Email</label>
                         <input disabled type="text" value={profile.email || ''} className="w-full bg-gray-900 border border-gray-800 rounded-2xl py-4 px-6 text-gray-400" />
                      </div>
                   </div>
                   <button className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-8 py-3 rounded-xl text-xs font-bold cursor-not-allowed opacity-50">
                      LƯU THAY ĐỔI (SẮP RA MẮT)
                   </button>
                </div>
             </div>

             <div className="bg-[#151a24] rounded-[40px] p-10 border border-gray-800">
                <h3 className="text-xl font-bold text-white mb-8">Bảo mật nâng cao</h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-6 bg-gray-900 border border-gray-800 rounded-2xl">
                      <div>
                         <p className="text-white font-bold text-sm">Xác thực 2 lớp (2FA)</p>
                         <p className="text-gray-600 text-[10px] uppercase font-bold tracking-widest mt-1">Đang phát triển / Chưa hoạt động</p>
                      </div>
                      <button className="bg-gray-800 text-gray-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase cursor-not-allowed">Thiết lập</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             <div className="bg-[#151a24] rounded-[40px] p-8 border border-gray-800 text-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-400 mx-auto mb-6 flex items-center justify-center text-4xl border-4 border-gray-800 overflow-hidden">
                   <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} alt="avatar" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{profile.full_name}</h3>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">RANK: {profile.total_earned > 1000000 ? 'GOLD' : 'BRONZE'}</p>
                <p className="text-gray-500 text-[10px] font-mono mt-2">ID: {profile.id.slice(0, 8)}</p>
                
                <div className="mt-8 pt-8 border-t border-gray-800 grid grid-cols-2 gap-4">
                   <div>
                      <p className="text-white font-black">{profile.tasks_completed}</p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Nhiệm vụ</p>
                   </div>
                   <div>
                      <p className="text-white font-black">{profile.balance?.toLocaleString()}đ</p>
                      <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">Số dư</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={handleLogout}
               className="w-full bg-red-500/10 border border-red-500/20 text-red-500 font-black py-5 rounded-[32px] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/5 uppercase tracking-widest"
             >
                ĐĂNG XUẤT TÀI KHOẢN
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;