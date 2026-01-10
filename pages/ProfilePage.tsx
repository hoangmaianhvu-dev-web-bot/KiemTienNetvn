
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

  // Lấy 2 chữ cái đầu của tên
  const getInitials = (name: string) => {
    if (!name) return 'NU';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-10">
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">👤 Cá nhân hóa</p>
        <h1 className="text-4xl font-black text-white">Tài khoản <span className="text-gray-500">của bạn</span></h1>
      </div>

      {!profile ? (
        <div className="bg-[#151a24] rounded-[48px] p-20 border border-gray-800 text-center animate-pulse">
           <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Đang truy xuất hồ sơ bảo mật...</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
             <div className="bg-[#151a24] rounded-[48px] p-10 border border-gray-800 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Thông tin cá nhân
                </h3>
                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-8">
                      <div>
                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Tên hiển thị</label>
                         <input disabled type="text" value={profile.full_name || ''} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl py-5 px-6 text-gray-400 font-bold focus:outline-none" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-2">Địa chỉ Email</label>
                         <input disabled type="text" value={profile.email || ''} className="w-full bg-[#0b0e14] border border-gray-800 rounded-2xl py-5 px-6 text-gray-400 font-bold focus:outline-none" />
                      </div>
                   </div>
                   <div className="pt-4">
                      <button className="bg-blue-600/10 text-blue-500 border border-blue-500/20 px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed opacity-40">
                         Lưu thay đổi (Sắp ra mắt)
                      </button>
                   </div>
                </div>
             </div>

             <div className="bg-[#151a24] rounded-[48px] p-10 border border-gray-800 shadow-2xl">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                  Bảo mật tài khoản
                </h3>
                <div className="space-y-6">
                   <div className="flex items-center justify-between p-8 bg-[#0b0e14] border border-gray-800 rounded-3xl group hover:border-blue-500/30 transition-all">
                      <div>
                         <p className="text-white font-bold text-sm">Mật khẩu đăng nhập</p>
                         <p className="text-gray-600 text-[9px] uppercase font-black tracking-[0.2em] mt-2">CẬP NHẬT LẦN CUỐI: VỪA XONG</p>
                      </div>
                      <button className="bg-gray-800 text-gray-500 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest cursor-not-allowed">Đổi</button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-8">
             {/* THẺ HỒ SƠ GIỐNG ẢNH MẪU 100% */}
             <div className="bg-[#151a24] rounded-[48px] p-12 border border-gray-800 text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                {/* Avatar Cyan rực rỡ */}
                <div className="w-32 h-32 rounded-full bg-[#00bcd4] mx-auto mb-10 flex items-center justify-center text-5xl font-bold text-white shadow-xl shadow-[#00bcd4]/20">
                   {getInitials(profile.full_name)}
                </div>

                <div className="space-y-2 mb-10">
                   <h3 className="text-blue-500 text-[11px] font-black uppercase tracking-[0.3em]">
                      RANK: {profile.total_earned > 1000000 ? 'GOLD' : 'BRONZE'}
                   </h3>
                   <p className="text-gray-600 text-[10px] font-mono tracking-wider">
                      ID: {profile.id.slice(0, 8)}
                   </p>
                </div>
                
                {/* Đường kẻ ngang */}
                <div className="w-full h-[1px] bg-gray-800/60 mb-10"></div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="text-center">
                      <p className="text-white text-2xl font-black mb-2">{profile.tasks_completed || 0}</p>
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Nhiệm vụ</p>
                   </div>
                   <div className="text-center">
                      <p className="text-white text-2xl font-black mb-2">{Number(profile.balance || 0).toLocaleString()}đ</p>
                      <p className="text-[9px] text-gray-600 font-black uppercase tracking-[0.2em]">Số dư</p>
                   </div>
                </div>
             </div>

             <button 
               onClick={handleLogout}
               className="w-full bg-[#1a0b0b] border border-red-900/30 text-red-500 font-black py-6 rounded-[32px] hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-red-900/5 uppercase tracking-[0.3em] text-[11px]"
             >
                Đăng xuất tài khoản
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
