import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import { supabase } from '../utils/supabaseClient';
import api from '../utils/api';
import { Mail, Lock, Scissors, ArrowRight, ArrowLeft, CheckCircle, ShieldCheck, User, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [isStaffMode, setIsStaffMode] = useState(false);
    const [password, setPassword] = useState('');
    const [isJustLoggedIn, setIsJustLoggedIn] = useState(false);

    const { isAuthenticated, role: currentRole } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const getRedirectPath = (role) => {
        if (role === 'admin') return '/admin';
        if (role === 'staff' || role === 'manager') return '/staff/dashboard';
        return '/';
    };

    React.useEffect(() => {
        // Redirection logic
        if (isAuthenticated && !loading) { 
            const pendingBooking = sessionStorage.getItem('pendingBooking');
            const from = location.state?.from || '/';
            const destination = getRedirectPath(currentRole);

            // Redirect ONLY if:
            // 1. We just finished a login action (OTP step 2 or staff submission)
            // 2. AND we have a verified role in the store (prevent stale redirects)
            const justFinishedAuth = (step === 2 || isJustLoggedIn);
            
            if (justFinishedAuth && currentRole) {
                if (from.startsWith('/admin') && (currentRole !== 'admin')) {
                    navigate('/', { replace: true });
                    return;
                }

                if (pendingBooking && (currentRole === 'customer' || !currentRole)) {
                    navigate('/bookings', { replace: true });
                } else {
                    navigate(destination, { replace: true });
                }
            }
        }
    }, [isAuthenticated, currentRole, navigate, step, location.state, loading, isJustLoggedIn]);

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setError('Strict Policy: Access restricted to @gmail.com accounts only.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/request-otp', { email });
            setStep(2);
            startResendCooldown();
        } catch (err) {
            // Show the actual error from the backend instead of generic message
            const serverError = err.response?.data?.error || 'Failed to send OTP. Please try again.';
            setError(serverError);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', { email, token: otp });
            const { session } = response.data;

            // Sync with Supabase SDK
            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token
            });

            // Get profile for role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .maybeSingle();

            const userRole = profile?.role || 'customer';

            dispatch(loginSuccess({
                user: session.user,
                token: session.access_token,
                role: userRole
            }));
            setIsJustLoggedIn(true);

        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Access Denied.');
        } finally {
            setLoading(false);
        }
    };

    const handleStaffLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            // Get profile for role confirmation
            const { data: profile } = await supabase
                .from('profiles')
                .select('role, full_name, assigned_shop')
                .eq('id', data.user.id)
                .maybeSingle();

            if (!profile || (profile.role !== 'admin' && profile.role !== 'manager' && profile.role !== 'staff')) {
                await supabase.auth.signOut();
                throw new Error('Unauthorized: This portal is for Staff and Business Owners only.');
            }

            dispatch(loginSuccess({
                user: { ...data.user, ...profile },
                token: data.session.access_token,
                role: profile.role
            }));
            
            setIsJustLoggedIn(true);

        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    const startResendCooldown = () => {
        setResendCooldown(60);
        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row font-sans">
            {/* Left Aesthetic Panel */}
            <div className="hidden md:flex md:w-1/2 bg-[#0A0A0A] p-20 flex-col justify-between relative overflow-hidden border-r border-white/5">
                <div className="absolute top-0 right-0 p-20 text-[#00E6A0] opacity-5">
                    <Scissors size={400} />
                </div>

                <div className="z-10">
                    <h2 className="text-6xl font-black text-white leading-none mb-8">Elevate <br />Your Identity.</h2>
                    <p className="text-gray-500 text-lg max-w-sm">Access your personalized sanctuary portal via a secure one-time-identity verification.</p>
                </div>

                <div className="z-10 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    &copy; 2026 Beautex Luxe • Preferred Luxury Partner
                </div>
            </div>

            {/* Right Form Panel */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-20">
                <div className="w-full max-w-md">
                    <div className="md:hidden flex flex-col items-center mb-12">
                        <div className="w-12 h-12 bg-[#00E6A0] rounded-2xl flex items-center justify-center shadow-lg mb-4">
                            <Scissors className="w-6 h-6 text-[#050505]" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter text-white">Beautex</h1>
                    </div>

                    <AnimatePresence mode="wait">
                        {isAuthenticated && !isJustLoggedIn ? (
                            <motion.div
                                key="session-detected"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="space-y-8"
                            >
                                <div>
                                    <h3 className="text-4xl font-black tracking-tight mb-4 text-white">Active Session Detected</h3>
                                    <p className="text-gray-500 font-medium leading-relaxed">
                                        You are currently logged in with established credentials. To access a different portal or switch accounts, please sign out first.
                                    </p>
                                </div>

                                <div className="p-6 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-3xl flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-2xl bg-[#00E6A0]/10 flex items-center justify-center">
                                         <User className="text-[#00E6A0]" size={20} />
                                     </div>
                                     <div>
                                         <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Identity</p>
                                         <p className="text-sm font-bold text-white capitalize">{currentRole} Workspace</p>
                                     </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4">
                                    <button
                                        onClick={async () => {
                                            await supabase.auth.signOut();
                                            // Redux logout happens in App.jsx listener
                                            window.location.reload(); // Force refresh to clear any state
                                        }}
                                        className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[1.8rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#00E6A0]/20 transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
                                    >
                                        Sign Out to Switch Accounts
                                        <ArrowRight size={18} />
                                    </button>
                                    
                                    <p className="text-center text-[10px] font-black text-gray-600 uppercase tracking-widest">
                                        You must sign out of your current session to access the Business Vault.
                                    </p>
                                </div>
                            </motion.div>
                        ) : isStaffMode ? (
                            <motion.div
                                key="staff-step"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                            >
                                <div className="mb-12">
                                    <div className="flex items-center gap-3 mb-2">
                                        <ShieldCheck className="text-[#00E6A0]" size={24} />
                                        <h3 className="text-4xl font-black tracking-tight text-white uppercase italic">Business Portal</h3>
                                    </div>
                                    <p className="text-gray-500 font-medium">Authorized credentials required for management access.</p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-bold flex gap-3 items-center">
                                        <AlertCircle size={16} />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleStaffLogin} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Business Identity</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all"
                                                placeholder="business@email.com"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Access Vault Key</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all font-mono"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[1.8rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#00E6A0]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? 'Validating Sector...' : 'Unlock Portal'}
                                        <ArrowRight size={18} />
                                    </button>
                                </form>
                            </motion.div>
                        ) : step === 1 ? (
                            <motion.div
                                key="email-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-12">
                                    <h3 className="text-4xl font-black tracking-tight mb-2 text-white">Welcome Back</h3>
                                    <p className="text-gray-500 font-medium">Please enter your email to receive an access code.</p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-5 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-3xl text-[#00E6A0] text-xs font-bold flex gap-3 items-center">
                                        <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse flex-none" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleRequestOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Identity</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all font-mono"
                                                placeholder="your@email.com"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[1.8rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#00E6A0]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? 'Transmitting code...' : 'Receive Access Code'}
                                        <ArrowRight size={18} />
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="otp-step"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-8">
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors mb-6"
                                    >
                                        <ArrowLeft size={14} /> Back to email
                                    </button>
                                    <h3 className="text-4xl font-black tracking-tight mb-2 text-white">Enter Code</h3>
                                    <p className="text-gray-500 font-medium">We've transmitted a 6-digit access code to <span className="text-white font-mono">{email}</span></p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-bold flex gap-3 items-center">
                                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-none" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Transmission Token</label>
                                        <div className="relative group">
                                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                                required
                                                maxLength={6}
                                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-2xl font-black tracking-[0.5em] text-white outline-none focus:border-[#00E6A0]/30 transition-all font-mono"
                                                placeholder="000000"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || otp.length < 6}
                                        className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[1.8rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#00E6A0]/20 transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? 'Authenticating...' : 'Confirm Access'}
                                        <ShieldCheck size={18} />
                                    </button>

                                    <div className="text-center mt-6">
                                        {resendCooldown > 0 ? (
                                            <p className="text-xs font-bold text-gray-600 uppercase tracking-widest">
                                                Resend available in {resendCooldown}s
                                            </p>
                                        ) : (
                                            <button 
                                                type="button" 
                                                onClick={handleRequestOtp} 
                                                className="text-xs font-black text-[#00E6A0] uppercase tracking-widest hover:underline"
                                            >
                                                Didn't get the code? Resend
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <p className="mt-12 text-center text-xs font-bold text-gray-500">
                        New to our sanctuary? {' '}
                        <Link to="/register" className="text-[#00E6A0] font-black hover:underline uppercase tracking-widest">Create Profile</Link>
                    </p>

                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center gap-4">
                         <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest">Authorized Access Only</p>
                         <div className="flex items-center gap-4">
                              <button 
                                 onClick={() => {
                                     setIsStaffMode(false);
                                     setError('');
                                     setStep(1);
                                 }}
                                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border ${!isStaffMode ? 'bg-[#00E6A0]/10 border-[#00E6A0]/20 text-[#00E6A0]' : 'bg-white/5 border-white/10 text-gray-400'}`}
                              >
                                  <User size={12} /> Sanctuary Portal
                              </button>
                              <button 
                                 onClick={() => {
                                     setIsStaffMode(true);
                                     setError('');
                                     setStep(1);
                                 }}
                                 className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 border ${isStaffMode ? 'bg-[#00E6A0]/10 border-[#00E6A0]/20 text-[#00E6A0]' : 'bg-white/5 border-white/10 text-gray-400'}`}
                              >
                                  <ShieldCheck size={12} /> Business Vault
                              </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
