
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0e14] flex flex-col md:flex-row">
      {/* Left Side: Hero */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-blue-900 via-[#0b0e14] to-black p-20 flex-col justify-between relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-800 rounded-full blur-[150px]"></div>
        </div>

        <Link to="/" className="flex items-center space-x-2 relative z-10">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
        </Link>

        <div className="relative z-10">
          <h1 className="text-6xl font-black text-white mb-6 leading-tight">
            Bắt đầu hành trình <br />
            <span className="text-blue-500">MMO chuyên nghiệp.</span>
          </h1>
          <p className="text-gray-400 text-xl max-w-md leading-relaxed">
            Tham gia cùng hơn 12,000 thành viên đang kiếm tiền mỗi ngày thông qua hệ thống làm nhiệm vụ tự động và uy tín nhất.
          </p>
        </div>

        <div className="flex gap-12 relative z-10">
          <div>
            <p className="text-3xl font-black text-white">520M+</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Đã thanh toán</p>
          </div>
          <div>
            <p className="text-3xl font-black text-white">24/7</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Hỗ trợ kỹ thuật</p>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="flex -space-x-3">
             {[1,2,3,4].map(i => (
               <img key={i} src={`https://i.pravatar.cc/100?u=${i}`} className="w-10 h-10 rounded-full border-4 border-[#0b0e14]" alt="user" />
             ))}
          </div>
          <p className="text-gray-400 text-sm font-medium">Tham gia cùng hàng nghìn người khác</p>
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="w-full md:w-1/2 flex flex-col p-8 md:p-20 justify-center">
        <Link to="/" className="text-gray-500 hover:text-white mb-12 flex items-center gap-2 text-sm font-medium transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Quay về trang chủ
        </Link>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-bold text-white mb-2">Chào mừng trở lại!</h2>
          <p className="text-gray-500 mb-10">Nhập thông tin của bạn để tiếp tục kiếm tiền.</p>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Địa chỉ Email</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Mật khẩu</label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#151a24] border border-gray-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-900/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                'ĐĂNG NHẬP NGAY'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-500 text-sm font-medium">
            Bạn mới đến đây? <Link to="/register" className="text-blue-500 hover:underline">Đăng ký miễn phí</Link>
          </p>

          <div className="mt-20 flex justify-center gap-8 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
            <a href="#" className="hover:text-gray-400">Điều khoản</a>
            <a href="#" className="hover:text-gray-400">Bảo mật</a>
            <a href="#" className="hover:text-gray-400">Hỗ trợ</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
