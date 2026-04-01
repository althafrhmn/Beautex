import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess, logout } from './redux/authSlice';
import { supabase } from './utils/supabaseClient';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoute from './components/PrivateRoute';

import HomePage from './pages/HomePage';

import Locations from './pages/Locations';
import ExploreSalons from './pages/ExploreSalons';
import SalonDetail from './pages/SalonDetail';
import BookingPage from './pages/BookingPage';
import AdminTerminal from './pages/AdminTerminal';
import AdminLogin from './pages/AdminLogin';
import StaffDashboard from './pages/StaffDashboard';
import ServicesPage from './pages/ServicesPage';
import OffersPage from './pages/OffersPage';
import ContactPage from './pages/ContactPage';


import Navbar from './components/layout/Navbar';
import ScrollToTop from './components/layout/ScrollToTop';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfileAndLogin = async (session) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', session.user.id)
        .maybeSingle();

      const role = profile?.role || session.user?.user_metadata?.role || 'customer';

      dispatch(loginSuccess({
        user: { ...session.user, full_name: profile?.full_name },
        token: session.access_token,
        role: role
      }));
    };

    // Check active session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchProfileAndLogin(session);
      }
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchProfileAndLogin(session);
      } else {
        dispatch(logout());
      }
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#00E6A0]/20 transition-colors">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/locations" element={<Locations />} />
          <Route path="/explore/:category" element={<ExploreSalons />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/salon/:id" element={<SalonDetail />} />
          <Route path="/bookings" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
          <Route path="/my-bookings" element={<PrivateRoute><BookingPage view="history" /></PrivateRoute>} />
          <Route path="/admin" element={<PrivateRoute><AdminTerminal /></PrivateRoute>} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/staff/dashboard" element={<PrivateRoute><StaffDashboard /></PrivateRoute>} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
