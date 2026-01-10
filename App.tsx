
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase.ts';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import Dashboard from './pages/Dashboard.tsx';
import TasksPage from './pages/TasksPage.tsx';
import WithdrawPage from './pages/WithdrawPage.tsx';
import ReferralPage from './pages/ReferralPage.tsx';
import SupportPage from './pages/SupportPage.tsx';
import AdminPage from './pages/AdminPage.tsx';
import ProfilePage from './pages/ProfilePage.tsx';
import Navbar from './components/Navbar.tsx';
import Footer from './components/Footer.tsx';
import { UserProfile } from './types.ts';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setSession(currentSession);
          if (currentSession) {
            await fetchProfile(currentSession.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (mounted) {
        setSession(currentSession);
        if (currentSession) fetchProfile(currentSession.user.id);
        else {
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, retryCount = 0) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        setFetchError(false);
      }
    } catch (err: any) {
      console.error('Profile fetch error:', err.message);
      if (retryCount < 2) {
        setTimeout(() => fetchProfile(userId, retryCount + 1), 2000);
      } else {
        setFetchError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = () => {
    if (session?.user?.id) fetchProfile(session.user.id);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0b0e14]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/10"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="mt-6 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">Đang đồng bộ bảo mật...</p>
      </div>
    );
  }

  if (fetchError && session) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#0b0e14] px-6 text-center">
        <div className="bg-red-500/10 p-8 rounded-[32px] border border-red-500/20 max-w-md">
          <h2 className="text-red-500 font-black text-xl mb-4 uppercase">LỖI KẾT NỐI MÁY CHỦ</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">Không thể tải dữ liệu hồ sơ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.</p>
          <button onClick={() => window.location.reload()} className="w-full bg-red-600 text-white font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest">TẢI LẠI TRANG</button>
        </div>
      </div>
    );
  }

  const isAuth = !!session && !!profile;

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#0b0e14]">
        {isAuth && profile && <Navbar profile={profile} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={isAuth ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register" element={isAuth ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            
            <Route path="/dashboard" element={isAuth && profile ? <Dashboard profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/tasks" element={isAuth && profile ? <TasksPage profile={profile} refreshProfile={refreshProfile} /> : <Navigate to="/login" />} />
            <Route path="/withdraw" element={isAuth && profile ? <WithdrawPage profile={profile} refreshProfile={refreshProfile} /> : <Navigate to="/login" />} />
            <Route path="/referral" element={isAuth && profile ? <ReferralPage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/support" element={isAuth && profile ? <SupportPage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuth && profile ? <ProfilePage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAuth && profile?.role === 'admin' ? <AdminPage profile={profile} /> : <Navigate to="/dashboard" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {!isAuth && <Footer />}
        {isAuth && <div className="h-20 lg:h-0"></div>}
      </div>
    </Router>
  );
};

export default App;
