
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserProfile, Announcement } from '../types';
import { supabase } from '../supabase';

interface NavbarProps {
  profile: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showNotifs, setShowNotifs] = useState(false);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAnnouncements();
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false }).limit(5);
    if (data) setAnnouncements(data);
  };

  const navItems = [
    { label: 'Tổng quan', path: '/dashboard' },
    { label: 'Nhiệm vụ', path: '/tasks' },
    { label: 'Rút tiền', path: '/withdraw' },
    { label: 'Giới thiệu', path: '/referral' },
    { label: 'Hỗ trợ', path: '/support' },
    { label: 'Tài khoản', path: '/profile' },
  ];

  if (profile.role === 'admin') {
    navItems.push({ label: 'Admin', path: '/admin' });
  }

  return (
    <nav className="bg-[#0b0e14] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="bg-blue-600 p-1.5 rounded-lg"><span className="text-white font-bold text-lg">K</span></div>
              <span className="text-white font-bold text-xl tracking-tight">KiemTienNet</span>
            </Link>
            <div className="hidden lg:block ml-10">
              <div className="flex items-baseline space-x-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                      location.pathname === item.path ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowNotifs(!showNotifs)}
                className="text-gray-400 hover:text-white relative p-2 rounded-full hover:bg-gray-800 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-500 border-2 border-[#0b0e14] text-[8px] font-black text-white flex items-center justify-center">
                  {announcements.length + 1}
                </span>
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-4 w-80 bg-[#151a24] border border-gray-800 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-5 border-b border-gray-800 bg-gray-900/50">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">Thông báo hệ thống</h4>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {/* Welcome message */}
                    <div className="p-5 border-b border-gray-800/50 hover:bg-blue-600/5 transition-all">
                      <p className="text-blue-500 font-bold text-xs mb-1">🎉 Chào mừng!</p>
                      <p className="text-gray-400 text-[11px] leading-relaxed">Chào {profile.full_name}, chúc bạn một ngày kiếm tiền thật hiệu quả cùng KiemTienNet!</p>
                    </div>
                    {/* Admin announcements */}
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-5 border-b border-gray-800/50 hover:bg-white/5 transition-all">
                        <p className="text-white font-bold text-xs mb-1">{ann.title}</p>
                        <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{ann.content}</p>
                        <p className="text-[9px] text-gray-700 mt-2 uppercase font-black">{new Date(ann.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                    ))}
                    {announcements.length === 0 && (
                       <div className="p-10 text-center text-gray-600 text-xs">Không có thông báo mới.</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 bg-gray-900/50 px-4 py-1.5 rounded-full border border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-black text-white leading-none">{profile.full_name || 'User'}</p>
                <p className="text-[10px] text-blue-500 font-black mt-1 uppercase">{profile.role === 'admin' ? 'BOSSY ADMIN' : 'MEMBER'}</p>
              </div>
              <Link to="/profile">
                <div className="h-8 w-8 rounded-full border-2 border-blue-500/50 p-0.5">
                  <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} alt="avatar" className="rounded-full" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
