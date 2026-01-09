
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
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;

      if (authData.user) {
        const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        // Kiểm tra nếu là email admin được chỉ định
        const role = email.toLowerCase() === 'nthd@gmail.com' ? 'admin' : 'user';
        
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([
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
          ], { onConflict: 'id' });

        if (profileError) throw profileError;
        
        await supabase.auth.refreshSession();
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Đã xảy ra lỗi khi đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-[#0b0e14] to-black p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px]"></div>
        </div>
        <Link to="/" className="flex items-center space-x-2 relative z-10">
          <div className="bg-blue-600 p-1.5 rounded-lg"><span className="text-white font-bold text-lg">K</span></div>
          <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
        </Link>
        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white mb-6 leading-tight">Bắt đầu <br /><span className="text-blue-500">Kiếm Tiền Ngay.</span></h1>
          <p className="text-gray-400 text-xl max-w-md">Tham gia mạng lưới MMO uy tín nhất Việt Nam.</p>
        </div>
        <div className="flex gap-12 relative z-10">
          <div><p className="text-3xl font-black text-white">2025</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Phiên bản mới</p></div>
          <div><p className="text-3xl font-black text-white">100%</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Bảo mật</p></div>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-20 justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-bold text-white mb-2">Đăng ký thành viên</h2>
          <p className="text-gray-500 mb-10">Tạo tài khoản để nhận các nhiệm vụ giá trị cao.</p>
          <form onSubmit={handleRegister} className="space-y-6">
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Họ và tên" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500" />
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (Admin: nthd@gmail.com)" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500" />
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500" />
            {error && <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm">{error}</div>}
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl transition-all disabled:opacity-50">
              {loading ? 'ĐANG XỬ LÝ...' : 'ĐĂNG KÝ NGAY'}
            </button>
          </form>
          <p className="mt-8 text-center text-gray-500">Đã có tài khoản? <Link to="/login" className="text-blue-500 hover:underline">Đăng nhập</Link></p>
        </div>
      </div>
    </div>
  );
};

// Fix: Ensure default export is present
export default RegisterPage;
