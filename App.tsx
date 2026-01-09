
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

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (data) setProfile(data);
    } catch (err: any) {
      console.error('Fetch error:', err.message);
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
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-500 animate-spin"></div>
        </div>
        <p className="mt-6 text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] animate-pulse">KiemTienNet Security...</p>
      </div>
    );
  }

  const isAuth = !!session;

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
            <Route path="/profile" element={isAuth ? <ProfilePage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/admin" element={isAuth && profile?.role === 'admin' ? <AdminPage profile={profile} /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
        {!isAuth && <Footer />}
        {isAuth && <div className="h-20 lg:h-0"></div>}
      </div>
    </Router>
  );
};

export default App;
