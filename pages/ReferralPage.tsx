import React from 'react';
import { UserProfile } from '../types';

const ReferralPage: React.FC<{ profile: UserProfile }> = ({ profile }) => {
  // Lấy domain hiện tại một cách linh hoạt
  const currentBaseUrl = window.location.origin + window.location.pathname.split('#')[0];
  const referralLink = `${currentBaseUrl}#/register?ref=${profile.referral_code || '100000'}`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[24px] shadow-2xl mb-8 -rotate-6">
           <span className="text-4xl">🎁</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Mời bạn bè, nhận hoa hồng <span className="text-blue-500">5%!</span></h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">Nhận ngay 5% hoa hồng trên mỗi nhiệm vụ bạn bè của bạn hoàn thành. Càng nhiều bạn bè, thu nhập thụ động càng lớn.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-16">
         {/* Referral Card */}
         <div className="bg-white rounded-[40px] p-10 shadow-2xl shadow-blue-500/10 flex flex-col justify-between space-y-12">
            <div>
               <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">MÃ GIỚI THIỆU CỦA BẠN</p>
               <div className="flex items-center gap-4">
                  <div className="flex-grow bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-6 px-8 flex items-center justify-center">
                     <span className="text-4xl font-black text-blue-600 tracking-[0.3em] uppercase">{profile.referral_code || '100000'}</span>
                  </div>
                  <button onClick={() => { navigator.clipboard.writeText(profile.referral_code || '100000'); alert('Đã sao chép mã!'); }} className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-2xl shadow-xl shadow-blue-500/30 transition-all">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                     </svg>
                  </button>
               </div>
            </div>

            <div>
               <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-6">LINK GIỚI THIỆU CỦA BẠN</p>
               <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4 border border-gray-100">
                  <p className="flex-grow text-gray-500 text-xs truncate font-medium">{referralLink}</p>
                  <button onClick={() => { navigator.clipboard.writeText(referralLink); alert('Đã sao chép link giới thiệu!'); }} className="text-blue-600 hover:text-blue-700 p-2">
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                     </svg>
                  </button>
               </div>
               <p className="mt-4 text-[9px] text-gray-400 italic">* Lưu ý: Link này được tạo dựa trên địa chỉ website bạn đang truy cập.</p>
            </div>
         </div>

         {/* Tier Info Card */}
         <div className="bg-blue-600 rounded-[40px] p-10 shadow-2xl shadow-blue-500/30 text-white flex flex-col justify-between overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[100px] rounded-full translate-x-32 -translate-y-32"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🎗️</div>
                  <h3 className="text-3xl font-black">Hệ thống đối tác</h3>
               </div>
               <p className="text-blue-100 text-lg leading-relaxed opacity-90 mb-12">Chia sẻ cơ hội kiếm tiền và xây dựng mạng lưới thụ động ngay hôm nay.</p>
            </div>

            <div className="relative z-10">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-4">
                  <span>Tiến trình Level (0/100)</span>
                  <span>Mới</span>
               </div>
               <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                  <div className="h-full bg-white transition-all duration-1000" style={{width: '0%'}}></div>
               </div>
            </div>
         </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-[40px] p-12 md:p-20 shadow-2xl shadow-blue-500/5">
         <h3 className="text-3xl font-black text-gray-900 mb-16 flex items-center gap-4">
            <span className="text-4xl">⚡</span> Cách thức hoạt động
         </h3>
         <div className="grid md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
            {[
              { num: '01', title: 'Gửi lời mời', desc: 'Chia sẻ mã hoặc link giới thiệu cho bạn bè.' },
              { num: '02', title: 'Bạn bè tham gia', desc: 'Người được mời thực hiện nhiệm vụ trên hệ thống.' },
              { num: '03', title: 'Nhận hoa hồng', desc: 'Hệ thống tự động cộng tiền 5% vào tài khoản của bạn.' }
            ].map((step, i) => (
              <div key={i} className="relative z-10">
                <p className="text-7xl font-black text-gray-100 mb-8 leading-none">{step.num}</p>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{step.title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
         </div>
      </div>
    </div>
  );
};

export default ReferralPage;