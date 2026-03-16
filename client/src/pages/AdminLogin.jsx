import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginSuccess } from '../redux/authSlice';
import { supabase } from '../utils/supabaseClient';
import api from '../utils/api';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [securityCode, setSecurityCode] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcoded Security Code for Demo purposes
    const ADMIN_SECURITY_CODE = 'BEAUTEX2026';

    const { isAuthenticated, role: currentRole } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect if already authenticated
    useEffect(() => {
        document.title = "Beautex | Admin portal";
        if (isAuthenticated && currentRole === 'admin') {
            navigate('/admin', { replace: true });
        }
    }, [isAuthenticated, currentRole, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setError('Access restricted to @gmail.com accounts only.');
            setLoading(false);
            return;
        }

        if (securityCode !== ADMIN_SECURITY_CODE) {
            setError('Invalid Security Clearance Code.');
            setLoading(false);
            return;
        }

        try {
            // Using backend API for login
            const response = await api.post('/auth/login', {
                email: email.toLowerCase().trim(),
                password: password.trim()
            });

            const { session } = response.data;

            // CRITICAL: Sync the session with the client-side Supabase SDK
            // This ensures subsequent calls via the api utility have the correct Authorization header
            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token
            });

            // Get profile for role
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

            const userRole = profile?.role || session.user.user_metadata?.role || 'customer';

            if (userRole !== 'admin') {
                setError('Access Denied. Administrator privileges required.');
                setLoading(false);
                return;
            }

            dispatch(loginSuccess({
                user: session.user,
                token: session.access_token,
                role: userRole
            }));

            // Redirect to Admin Dashboard
            navigate('/admin', { replace: true });

        } catch (err) {
            const errorMessage = err.response?.data?.error || err.message;
            if (errorMessage === 'Failed to fetch' || err.code === 'ERR_NETWORK') {
                setError('Network Error: Could not reach the server.');
            } else if (errorMessage === 'fetch failed') {
                setError('Server Error: The backend cannot reach the database.');
            } else {
                setError(errorMessage || 'Failed to authenticate');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4 font-sans selection:bg-[#00E6A0] selection:text-[#141414]">
            <div className="w-full max-w-md bg-[#141414] border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Header Section */}
                <div className="p-8 pb-6 border-b border-[#2A2A2A] text-center bg-gradient-to-b from-[#1A1A1A] to-[#141414]">
                    <div className="w-16 h-16 mx-auto bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-2xl flex items-center justify-center mb-4">
                        <ShieldCheck className="w-8 h-8 text-[#00E6A0]" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white">Admin Portal</h1>
                    <p className="text-sm text-gray-400 mt-2">Sign in to access BeauteX management</p>
                </div>

                {/* Form Section */}
                <div className="p-8">
                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-none" />
                            <p className="text-red-400 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Admin Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm font-medium text-white outline-none focus:border-[#00E6A0] transition-colors"
                                    placeholder="admin@beauteX.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-12 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm font-medium text-white outline-none focus:border-[#00E6A0] transition-colors"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    tabIndex="-1"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Admin Security Code</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={securityCode}
                                    onChange={(e) => setSecurityCode(e.target.value)}
                                    required
                                    className="w-full pl-11 pr-4 py-3.5 bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl text-sm font-bold text-[#00E6A0] outline-none focus:border-[#00E6A0] transition-colors uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-600"
                                    placeholder="Enter clearance code"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full mt-2 py-4 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] rounded-xl font-bold uppercase tracking-widest text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Access Dashboard'
                            )}
                        </button>
                    </form>
                </div>
                
                <div className="px-8 py-4 bg-[#1A1A1A] border-t border-[#2A2A2A] text-center">
                    <p className="text-xs text-gray-500">Secure connection. IP logged for security.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
