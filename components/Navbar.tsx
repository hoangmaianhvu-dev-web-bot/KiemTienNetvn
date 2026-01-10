import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile, Announcement } from '../types.ts';
import { supabase } from '../supabase.ts';

interface NavbarProps {
  profile: UserProfile;
}

const Navbar: React.FC<NavbarProps> = ({ profile }) => {
  const location = useLocation();
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
    try {
      const { data } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);
      if (data) setAnnouncements(data);
    } catch (err) {
      console.error("Error fetching announcements:", err);
    }
  };

  const navItems = [
    { label: 'Tổng quan', path: '/dashboard' },
    { label: 'Nhiệm vụ', path: '/tasks' },
    { label: 'Rút tiền', path: '/withdraw' },
    { label: 'Giới thiệu', path: '/referral' },
    { label: 'Hỗ trợ', path: '/support' },
    { label: 'Tài khoản', path: '/profile' },
  ];

  if (profile?.role === 'admin') {
    navItems.push({ label: 'Quản trị', path: '/admin' });
  }

  // Luôn đảm bảo có tên hiển thị
  const displayName = profile?.full_name || profile?.email?.split('@')[0] || 'Thành viên';

  return (
    <nav className="bg-[#0b0e14] border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2 group">
              <div className="bg-blue-600 p-1.5 rounded-lg flex items-center justify-center overflow-hidden">
                <svg className="w-5 h-5 text-white" viewBox="0 0 100 100" fill="none">
                  <path d="M30 35 C30 25, 70 25, 70 35 C70 45, 30 55, 30 65 C30 75, 70 75, 70 65" stroke="currentColor" strokeWidth="12" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-white font-black text-xl tracking-tighter group-hover:text-blue-500 transition-colors">KiemTienNet</span>
            </Link>
            <div className="hidden lg:block ml-10">
              <div className="flex items-baseline space-x-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
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
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {announcements.length > 0 && (
                  <span className="absolute top-1 right-1 block h-4 w-4 rounded-full bg-red-600 border-2 border-[#0b0e14] text-[8px] font-black text-white flex items-center justify-center">
                    {announcements.length}
                  </span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 mt-4 w-80 bg-[#151a24] border border-gray-800 rounded-[24px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-5 border-b border-gray-800 bg-gray-900/50 flex justify-between items-center">
                    <h4 className="text-white font-black text-xs uppercase tracking-widest">Thông báo</h4>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {announcements.map(ann => (
                      <div key={ann.id} className="p-5 border-b border-gray-800/50 hover:bg-white/5 transition-all">
                        <p className="text-white font-bold text-xs mb-1">{ann.title}</p>
                        <p className="text-gray-500 text-[11px] leading-relaxed line-clamp-2">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 bg-gray-900/50 px-4 py-1.5 rounded-full border border-gray-800">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-black text-white leading-none truncate max-w-[100px]">{displayName}</p>
                <p className="text-[9px] text-blue-500 font-black mt-1 uppercase tracking-tighter">{profile?.role === 'admin' ? 'CHỦ HỆ THỐNG' : 'THÀNH VIÊN'}</p>
              </div>
              <Link to="/profile" className="h-8 w-8 rounded-full border border-blue-500/30 p-0.5 overflow-hidden hover:border-blue-500 transition-colors">
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`} alt="avatar" className="rounded-full w-full h-full object-cover" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;