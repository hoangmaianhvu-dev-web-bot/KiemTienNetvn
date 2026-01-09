
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import TasksPage from './pages/TasksPage';
import WithdrawPage from './pages/WithdrawPage';
import ReferralPage from './pages/ReferralPage';
import SupportPage from './pages/SupportPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { UserProfile } from './types';

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
        .maybeSingle(); // maybeSingle doesn't throw if no row found
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
      } else {
        // Handle case where auth user exists but profile row doesn't yet
        console.warn('Profile row not found for user:', userId);
        setProfile(null);
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err.message || err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0b0e14]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isAuth = !!session;

  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {isAuth && profile && <Navbar profile={profile} />}
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={isAuth ? <Navigate to="/dashboard" /> : <LandingPage />} />
            <Route path="/login" element={isAuth ? <Navigate to="/dashboard" /> : <LoginPage />} />
            <Route path="/register" element={isAuth ? <Navigate to="/dashboard" /> : <RegisterPage />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={isAuth && profile ? <Dashboard profile={profile} /> : (isAuth && !loading ? <Navigate to="/profile" /> : <Navigate to="/login" />)} />
            <Route path="/tasks" element={isAuth && profile ? <TasksPage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/withdraw" element={isAuth && profile ? <WithdrawPage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/referral" element={isAuth && profile ? <ReferralPage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/support" element={isAuth && profile ? <SupportPage profile={profile} /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuth ? <ProfilePage profile={profile} /> : <Navigate to="/login" />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={isAuth && profile?.role === 'admin' ? <AdminPage profile={profile} /> : <Navigate to="/dashboard" />} />
          </Routes>
        </main>
        {!isAuth && <Footer />}
        {isAuth && <div className="h-16"></div>}
      </div>
    </Router>
  );
};

export default App;
