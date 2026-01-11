
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [referrerCode, setReferrerCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) setReferrerCode(ref);
  }, [location]);

  const generateUniqueRefCode = () => {
    // Tạo chuỗi 6 số ngẫu nhiên lộn xộn
    return Math.floor(100000 + Math.random() * 899999).toString();
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(null);
    
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });
      
      if (authError) throw authError;

      if (authData.user) {
        const myReferralCode = generateUniqueRefCode();
        const role = email.toLowerCase() === 'nthd@gmail.com' ? 'admin' : 'user';
        
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
              referral_code: myReferralCode,
              role: role,
              referred_by: referrerCode.trim() || null
            }
          ]);

        if (profileError) throw profileError;
        
        alert("Đăng ký thành công! Hãy bắt đầu kiếm tiền ngay.");
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống đăng ký.');
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
        
        <div className="flex flex-col gap-4 relative z-10">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 100 100" fill="none">
                <path d="M30 35 C30 25, 70 25, 70 35 C70 45, 30 55, 30 65 C30 75, 70 75, 70 65" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
          </Link>
        </div>

        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white mb-6 leading-tight tracking-tighter">Bắt đầu <br /><span className="text-blue-500">Kinh Doanh Số.</span></h1>
          <p className="text-gray-400 text-xl max-w-md leading-relaxed">Tham gia cùng cộng đồng MMO hiện đại nhất 2025.</p>
        </div>
        <div className="flex gap-12 relative z-10">
          <div><p className="text-3xl font-black text-white">2025</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Version 6.0</p></div>
          <div><p className="text-3xl font-black text-white">100%</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">SSL SECURE</p></div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-20 justify-center">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Đăng ký mới</h2>
          <p className="text-gray-500 mb-10 text-sm font-medium">Trở thành một phần của mạng lưới MMO chuyên nghiệp.</p>
          
          <form onSubmit={handleRegister} className="space-y-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Họ và tên</label>
                  <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Tên thật để nhận tiền" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Địa chỉ Email" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mật khẩu bảo mật" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
               <div>
                  <label className="block text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2 ml-1">Mã giới thiệu (Nếu có)</label>
                  <input type="text" value={referrerCode} onChange={(e) => setReferrerCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} placeholder="VD: 123456" className="w-full bg-[#151a24] border border-blue-500/20 rounded-2xl py-5 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
               </div>
            </div>
            
            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs font-black uppercase">{error}</div>}
            
            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'ĐĂNG KÝ THÀNH VIÊN'}
            </button>
          </form>
          <p className="mt-8 text-center text-gray-500 text-sm">
            Đã có tài khoản? <Link to="/login" className="text-blue-500 font-bold hover:underline">Đăng nhập</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
