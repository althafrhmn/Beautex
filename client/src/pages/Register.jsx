import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, ArrowLeft, CheckCircle, Scissors, Sparkles, Phone } from 'lucide-react';
import { motion } from 'framer-motion';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [msg, setMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setMsg('');
        setLoading(true);

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setError('Strict Policy: Only @gmail.com addresses are permitted for registration.');
            setLoading(false);
            return;
        }

        try {
            // Using the backend API instead of direct Supabase call for better centralization
            const response = await api.post('/auth/register', {
                email,
                password,
                fullName
            });

            setMsg('Welcome to Beautex! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);

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
                <div className="absolute bottom-0 left-0 p-20 text-[#00E6A0] opacity-5">
                    <Sparkles size={400} />
                </div>

                <Link to="/" className="flex items-center gap-3 z-10">
                    <div className="w-10 h-10 bg-[#00E6A0] rounded-xl flex items-center justify-center shadow-lg">
                        <Scissors className="w-5 h-5 text-[#050505]" />
                    </div>
                    <span className="text-xl font-black text-white tracking-tight">Beautex</span>
                </Link>

                <div className="z-10">
                    <h2 className="text-6xl font-black text-white leading-none mb-8">Start Your <br />Beauty Journey.</h2>
                    <p className="text-gray-500 text-lg max-w-sm">Join our elite community and unlock a world of bespoke beauty rituals and master artistry.</p>
                </div>

                <div className="z-10 text-[10px] font-black text-gray-600 uppercase tracking-widest">
                    &copy; 2026 Beautex Luxe • Personal Identity Architects
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
                        <h3 className="text-4xl font-black tracking-tight mb-2 text-white">Create Profile</h3>
                        <p className="text-gray-500 font-medium">Join us for a personalized luxury experience.</p>
                    </div>



                    {error && (
                        <div className="mb-8 p-5 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-3xl text-[#00E6A0] text-xs font-bold flex gap-3 items-center">
                            <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse flex-none" />
                            {error}
                        </div>
                    )}

                    {msg && (
                        <div className="mb-8 p-5 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-3xl text-[#00E6A0] text-xs font-bold flex gap-3 items-center">
                            <CheckCircle size={18} />
                            {msg}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all"
                                    placeholder="Enter your name"
                                />
                            </div>
                        </div>

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
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Secure Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all"
                                    placeholder="Create a strong password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[1.8rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-[#00E6A0]/20 transition-all transform active:scale-[0.98] disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : 'Create My Profile'}
                        </button>
                    </form>

                    <p className="mt-12 text-center text-xs font-bold text-gray-500">
                        Already part of the sanctuary? {' '}
                        <Link to="/login" className="text-[#00E6A0] font-black hover:underline uppercase tracking-widest">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
