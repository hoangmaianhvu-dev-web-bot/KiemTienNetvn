
import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="bg-[#0b0e14]">
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <span className="text-white font-bold text-lg">K</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
        </div>
        <div className="hidden md:flex space-x-8 text-gray-400 text-sm font-medium">
          <a href="#" className="hover:text-white transition-colors">Tính năng</a>
          <a href="#" className="hover:text-white transition-colors">Thống kê</a>
          <a href="#" className="hover:text-white transition-colors">Câu hỏi</a>
        </div>
        <Link to="/register" className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition-colors">
          BẮT ĐẦU NGAY
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
        <div className="inline-flex items-center bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full text-blue-400 text-xs font-bold mb-8 uppercase tracking-widest">
           ✨ Nền tảng MMO uy tín nhất 2025
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
          Kiếm tiền trực tuyến <br />
          <span className="text-blue-500">chưa bao giờ dễ thế.</span>
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
          Hơn 12,000 người dùng đã tin tưởng và kiếm thêm thu nhập thụ động <br className="hidden md:block" />
          hàng tháng thông qua hệ thống nhiệm vụ tự động hóa 100%.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 transition-all">
            BẮT ĐẦU KIẾM TIỀN 
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <button className="w-full sm:w-auto bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
            Xem giới thiệu
          </button>
        </div>

        {/* Brand Logos */}
        <div className="mt-24 flex flex-wrap justify-center gap-8 md:gap-16 opacity-30 grayscale contrast-125">
          <span className="text-white font-black text-xl tracking-tighter">TRUSTBANK</span>
          <span className="text-white font-black text-xl tracking-tighter">SECURPAY</span>
          <span className="text-white font-black text-xl tracking-tighter">GARENA_PARTNER</span>
          <span className="text-white font-black text-xl tracking-tighter">VNPAY_OFFICIAL</span>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#0d1117] border-y border-gray-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">12,400+</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Người dùng Active</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">520M+</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Đã thanh toán</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">1.2M+</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Nhiệm vụ xong</p>
          </div>
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">100%</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Hỗ trợ 24/7</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold text-white mb-4">Tại sao chọn KiemTienNet?</h2>
          <p className="text-gray-400">Chúng tôi cung cấp giải pháp MMO toàn diện nhất với độ bảo mật và tốc độ thanh toán hàng đầu.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '⚡', title: 'Nhiệm vụ đa dạng', desc: 'Từ vượt link, xem video đến cài đặt app, luôn có việc cho bạn làm.' },
            { icon: '💳', title: 'Thanh toán tức thì', desc: 'Hỗ trợ rút tiền qua Ngân hàng và Thẻ Garena với tốc độ xử lý nhanh nhất.' },
            { icon: '🛡️', title: 'Bảo mật tuyệt đối', desc: 'Hệ thống mã hóa dữ liệu SSL 256-bit đảm bảo an toàn tài khoản.' },
            { icon: '🤝', title: 'Hoa hồng giới thiệu', desc: 'Nhận ngay 20% hoa hồng vĩnh viễn từ doanh thu của bạn bè.' },
            { icon: '📱', title: 'Giao diện chuyên nghiệp', desc: 'Trải nghiệm mượt mà trên cả máy tính và điện thoại di động.' },
            { icon: '💬', title: 'Hỗ trợ 24/7', desc: 'Đội ngũ CSKH luôn sẵn sàng giải đáp mọi thắc mắc qua Zalo.' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-[#151a24] p-8 rounded-3xl border border-gray-800/50 hover:border-blue-500/30 transition-all group">
              <div className="text-3xl mb-6 bg-gray-800/50 w-14 h-14 flex items-center justify-center rounded-2xl group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-[#0d1117]">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex text-yellow-400 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                ))}
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-8 leading-tight">Được tin tưởng bởi hàng nghìn Freelancer.</h2>
              <p className="text-gray-400 text-lg italic mb-10">"KiemTienNet là nền tảng rút gọn link và làm nhiệm vụ uy tín nhất mà tôi từng tham gia. Tiền về tài khoản chỉ sau 15 phút đặt lệnh!"</p>
              <div className="flex items-center gap-4">
                <img src="https://picsum.photos/seed/user1/50/50" className="rounded-full border-2 border-blue-500" alt="avatar" />
                <div>
                  <p className="text-white font-bold">Minh Quang</p>
                  <p className="text-blue-500 text-xs font-bold">TOP MEMBER - KIẾM ĐƯỢC 25M+</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#151a24] p-8 rounded-3xl border border-gray-800 shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-green-500 h-4 w-4 rounded-full animate-pulse ring-4 ring-green-500/20"></div>
              <h3 className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-6">Lịch sử mới nhất</h3>
              <div className="space-y-6">
                {[
                  { name: 'quang***', method: 'NGÂN HÀNG', amount: '+500,000đ' },
                  { name: 'hang***', method: 'THẺ GARENA', amount: '+100,000đ' },
                  { name: 'tuan***', method: 'NGÂN HÀNG', amount: '+1,200,000đ' }
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-gray-800 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="text-white font-bold">{item.name}</p>
                      <p className="text-gray-500 text-[10px] uppercase font-bold">{item.method}</p>
                    </div>
                    <span className="text-green-500 font-bold">{item.amount}</span>
                  </div>
                ))}
              </div>
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 rounded-[40px] p-12 md:p-20 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/20 mix-blend-overlay"></div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 relative z-10 leading-tight">Sẵn sàng tăng thu nhập của bạn?</h2>
          <Link to="/register" className="inline-block bg-white text-blue-600 px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-2xl relative z-10">
            ĐĂNG KÝ MIỄN PHÍ NGAY
          </Link>
          <p className="text-blue-100 mt-8 font-medium opacity-80 relative z-10">Không cần vốn, không cần kinh nghiệm.</p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
