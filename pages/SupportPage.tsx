
import React from 'react';
import { UserProfile } from '../types';

interface SupportPageProps {
  profile: UserProfile | null;
}

const SupportPage: React.FC<SupportPageProps> = ({ profile }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-20">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600/10 rounded-full mb-8">
           <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
           </svg>
        </div>
        <h1 className="text-5xl font-black text-white mb-6">Trung tâm hỗ trợ</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">Chào {profile?.full_name || 'bạn'}, chúng tôi luôn sẵn sàng giải đáp thắc mắc của bạn 24/7. Hãy chọn phương thức liên hệ phù hợp bên dưới.</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
         {[
           { title: 'Hỗ trợ Zalo', desc: 'Nhắn tin trực tiếp qua Zalo để được giải đáp tức thì.', action: 'MỞ ZALO 0337117930', icon: '💬', color: 'bg-blue-600/10 text-blue-500' },
           { title: 'Email hỗ trợ', desc: 'Liên hệ qua hòm thư hỗ trợ cho các vấn đề khiếu nại.', action: 'GỬI EMAIL NGAY', icon: '📧', color: 'bg-red-600/10 text-red-500' },
           { title: 'Nhóm Telegram', desc: 'Cộng đồng trao đổi MMO lớn nhất, nơi chia sẻ kinh nghiệm.', action: 'THAM GIA NHÓM', icon: '✈️', color: 'bg-indigo-600/10 text-indigo-500' },
           { title: 'Hotline ưu tiên', desc: 'Dành riêng cho thành viên VIP, hỗ trợ trực tiếp mọi vấn đề kỹ thuật.', action: 'GỌI 0337117930', icon: '📞', color: 'bg-green-600/10 text-green-500' }
         ].map((box, i) => (
           <div key={i} className="bg-[#151a24] p-10 rounded-[40px] border border-gray-800 flex flex-col items-center text-center group hover:border-blue-500/50 transition-all">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform ${box.color}`}>
                {box.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-4">{box.title}</h3>
              <p className="text-gray-500 text-sm mb-10 leading-relaxed">{box.desc}</p>
              <button className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-3 transition-all">
                 {box.action}
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </button>
           </div>
         ))}
      </div>

      <div className="bg-[#151a24] rounded-[48px] p-10 md:p-16 border border-gray-800 shadow-2xl">
         <h2 className="text-3xl font-black text-white mb-16">Câu hỏi thường gặp</h2>
         <div className="space-y-12">
            {[
              { q: 'Làm sao để nhận tiền sau khi vượt link?', a: 'Hệ thống sẽ tự động cộng tiền vào số dư của bạn ngay sau khi bạn hoàn thành các bước yêu cầu trên trang liên kết.' },
              { q: 'Thời gian xử lý rút tiền là bao lâu?', a: 'Lệnh rút tiền qua Ngân hàng xử lý trong 24h, Thẻ Garena xử lý trong 15-30 phút.' },
              { q: 'Tôi có thể thay đổi số tài khoản ngân hàng không?', a: 'Có, bạn vào phần Tài khoản -> Chỉnh sửa thông tin Ngân hàng để cập nhật.' }
            ].map((faq, i) => (
              <div key={i} className="group border-b border-gray-800 pb-12 last:border-0 last:pb-0">
                 <h4 className="text-blue-500 text-sm font-bold mb-4 flex gap-4">
                    <span className="opacity-50">Q:</span>
                    {faq.q}
                 </h4>
                 <p className="text-gray-500 text-sm leading-relaxed flex gap-4">
                    <span className="opacity-20 font-bold">A:</span>
                    {faq.a}
                 </p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default SupportPage;
