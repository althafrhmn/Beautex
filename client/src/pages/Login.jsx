import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import { supabase } from '../utils/supabaseClient';
import api from '../utils/api';
import { Mail, Lock, Eye, EyeOff, Scissors, User } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { isAuthenticated, role: currentRole } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    const getRedirectPath = (role) => {
        if (role === 'admin') return '/admin';
        if (role === 'staff') return '/staff/dashboard';
        return '/';
    };

    React.useEffect(() => {
        if (isAuthenticated) {
            navigate(getRedirectPath(currentRole), { replace: true });
        }
    }, [isAuthenticated, currentRole, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setError('Strict Policy: Access restricted to @gmail.com accounts only.');
            setLoading(false);
            return;
        }

        try {
            // Using backend API for login
            const response = await api.post('/auth/login', {
                email,
                password
            });

            const { session } = response.data;

            // Get profile for role
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            const userRole = profile?.role || session.user.user_metadata?.role || 'customer';

            dispatch(loginSuccess({
                user: session.user,
                token: session.access_token,
                role: userRole
            }));

            const redirectTo = location.state?.from || getRedirectPath(userRole);
            navigate(redirectTo, { replace: true });

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message;
            if (errorMessage === 'Failed to fetch' || err.code === 'ERR_NETWORK') {
                setError('Network Error: Could not reach the backend sanctuary at 127.0.0.1:5000.');
            } else if (errorMessage === 'fetch failed') {
                setError('Sanctuary Error: The backend is running but cannot reach the Supabase cloud.');
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex flex-col md:flex-row font-sans">
            {/* Left Aesthetic Panel */}
            <div className="hidden md:flex md:w-1/2 bg-[#0A0A0A] p-20 flex-col justify-between relative overflow-hidden border-r border-white/5">
                <div className="absolute top-0 right-0 p-20 text-[#00E6A0] opacity-5">
                    <Scissors size={400} />
                </div>

                <div className="flex items-center gap-3 z-10" />

                <div className="z-10">
                    <h2 className="text-6xl font-black text-white leading-none mb-8">Elevate <br />Your Identity.</h2>
                    <p className="text-gray-500 text-lg max-w-sm">Access your personalized sanctuary portal and manage your luxury reservations effortlessly.</p>
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

                    <div className="mb-12">
                        <h3 className="text-4xl font-black tracking-tight mb-2 text-white">Welcome Back</h3>
                        <p className="text-gray-500 font-medium">Please enter your credentials to access your account.</p>
                    </div>

                    {error && (
                        <div className="mb-8 p-5 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-3xl text-[#00E6A0] text-xs font-bold flex gap-3 items-center">
                            <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse flex-none" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Identity</label>
                            <div className="relative group">
                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all"
                                    placeholder="Enter your email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Secret Key</label>
                                <button type="button" className="text-[10px] font-black text-[#00E6A0] uppercase tracking-widest hover:underline">Reset?</button>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-14 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[1.8rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#00E6A0]/20 transition-all transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Verifying Identity...' : 'Confirm Access'}
                        </button>

                    </form>

                    <p className="mt-12 text-center text-xs font-bold text-gray-500">
                        New to our sanctuary? {' '}
                        <Link to="/register" className="text-[#00E6A0] font-black hover:underline uppercase tracking-widest">Create Profile</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
