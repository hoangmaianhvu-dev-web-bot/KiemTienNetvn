
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      // 1. Tạo tài khoản Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;

      if (authData.user) {
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const role = email.toLowerCase() === 'nthd@gmail.com' ? 'admin' : 'user';
        
        // 2. Tạo Profile đồng bộ ngay lập tức
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              email: email,
              full_name: fullName,
              balance: 0,
              total_earned: 0,
              tasks_completed: 0,
              referral_code: referralCode,
              role: role
            }
          ]);

        if (profileError) {
          // Nếu lỗi do profile đã tồn tại (ít khả năng nhưng phòng hờ)
          console.error('Profile creation error:', profileError.message);
        }
        
        // Đợi một chút để DB đồng bộ
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Chuyển hướng
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Hệ thống đang bận, vui lòng thử lại sau ít phút.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-[#0b0e14] to-black p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-20%] left-[-20%] w-[600px] h-[600px] bg-indigo-900 rounded-full blur-[200px]"></div>
        </div>
        <Link to="/" className="flex items-center space-x-2 relative z-10">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
        </Link>
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white mb-6 leading-tight tracking-tighter">Bắt đầu <br /><span className="text-blue-500">Kinh Doanh Số.</span></h1>
          <p className="text-gray-400 text-xl max-w-md leading-relaxed">Tham gia cùng cộng đồng MMO hiện đại nhất 2025.</p>
        </div>
        <div className="flex gap-12 relative z-10">
          <div><p className="text-3xl font-black text-white">2025</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Version 4.0</p></div>
          <div><p className="text-3xl font-black text-white">100%</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Verified</p></div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-20 justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Đăng ký mới</h2>
          <p className="text-gray-500 mb-10 text-sm font-medium">Trở thành một phần của mạng lưới MMO chuyên nghiệp.</p>
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
               <div className="relative group">
                 <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên của bạn" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
               <div className="relative group">
                 <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Địa chỉ Email" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
               <div className="relative group">
                 <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu bảo mật" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
            </div>
            
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-[11px] font-bold uppercase tracking-wider">{error}</div>}
            
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : 'ĐĂNG KÝ THÀNH VIÊN'}
            </button>
          </form>
          <p className="mt-8 text-center text-gray-500 text-sm">
            Đã có tài khoản? <Link to="/login" className="text-blue-500 font-bold hover:underline">Đăng nhập tại đây</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
