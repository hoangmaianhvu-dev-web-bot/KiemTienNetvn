
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0b0e14] border-t border-gray-900 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
        <div className="col-span-2">
          <div className="flex items-center space-x-2 mb-8">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
          </div>
          <p className="text-gray-600 text-sm max-w-sm leading-relaxed">
            Nền tảng dẫn đầu về giải pháp MMO và Marketing tại Việt Nam. Xây dựng bởi đội ngũ chuyên gia công nghệ.
          </p>
        </div>
        
        <div>
           <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8">Hệ thống</h4>
           <ul className="space-y-4 text-gray-600 text-sm font-medium">
             <li><a href="#" className="hover:text-white transition-colors">Bảng tin</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Kho nhiệm vụ</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Thanh toán</a></li>
             <li><a href="#" className="hover:text-white transition-colors">Giới thiệu</a></li>
           </ul>
        </div>

        <div>
           <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-8">Liên hệ</h4>
           <ul className="space-y-4 text-gray-600 text-sm font-medium">
             <li className="flex items-center gap-3">
                <span className="text-xs">✉️</span>
                support@kiemtiennet.io
             </li>
             <li className="flex gap-4 mt-6">
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">🌐</div>
                <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">📱</div>
             </li>
           </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-8 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-bold text-gray-700 uppercase tracking-[0.2em]">© 2025 KIEMTIENNET. ALL RIGHTS RESERVED.</p>
        <div className="flex gap-10 text-[10px] font-bold text-gray-700 uppercase tracking-widest">
           <span className="hover:text-gray-400 cursor-pointer transition-colors">SECURE SSL ENCRYPTION</span>
           <span className="hover:text-gray-400 cursor-pointer transition-colors">VERIFIED BY TRUSTHUB</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
