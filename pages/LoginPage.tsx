import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCaptchaGuide, setShowCaptchaGuide] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setShowCaptchaGuide(false);
    
    try {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      
      if (loginError) {
        if (loginError.message.toLowerCase().includes('captcha')) {
          setShowCaptchaGuide(true);
          throw new Error("Lỗi xác minh Captcha");
        }
        throw loginError;
      }
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col md:flex-row">
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-[#0b0e14] to-black p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-800 rounded-full blur-[150px]"></div>
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
          <button onClick={() => navigate('/')} className="flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors w-fit">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại trang chủ
          </button>
        </div>

        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white mb-6 leading-tight">Chào mừng <br /><span className="text-blue-500">trở lại.</span></h1>
          <p className="text-gray-400 text-xl max-w-md leading-relaxed">Tiếp tục hành trình kiếm tiền MMO chuyên nghiệp cùng chúng tôi.</p>
        </div>

        <div className="flex gap-12 relative z-10">
          <div><p className="text-3xl font-black text-white">520M+</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Đã thanh toán</p></div>
          <div><p className="text-3xl font-black text-white">24/7</p><p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Support Online</p></div>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-20 justify-center">
        <div className="max-w-md w-full mx-auto">
          <button onClick={() => navigate('/')} className="md:hidden flex items-center gap-2 text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-widest mb-8 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Quay lại trang chủ
          </button>
          
          <h2 className="text-4xl font-bold text-white mb-2">Đăng nhập</h2>
          <p className="text-gray-500 mb-10">Nhập thông tin tài khoản để tiếp tục.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-blue-500 transition-all placeholder-gray-700" />
            </div>

            {error && (
              <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl">
                <p className="text-red-500 text-[11px] font-black uppercase tracking-wider mb-2">{error}</p>
                {showCaptchaGuide && (
                  <div className="text-gray-400 text-[10px] leading-relaxed border-t border-red-500/20 pt-2">
                    <span className="text-white font-bold">LƯU Ý:</span> Dashboard Supabase của bạn đang bật Captcha. Hãy vào <span className="text-blue-400 font-bold">Authentication &rarr; Auth Settings</span> và <span className="text-red-400 font-bold">Disable CAPTCHA protection</span> để chạy mượt mà trên web.
                  </div>
                )}
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'ĐĂNG NHẬP NGAY'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm">
            Chưa có tài khoản? <Link to="/register" className="text-blue-500 hover:underline">Đăng ký miễn phí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;