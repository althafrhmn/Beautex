import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import api from '../utils/api';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, ArrowLeft, CheckCircle, Scissors, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Register = () => {
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1); // 1: Info, 2: OTP
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRegisterRequest = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!email.toLowerCase().endsWith('@gmail.com')) {
            setError('Strict Policy: Only @gmail.com addresses are permitted for registration.');
            setLoading(false);
            return;
        }

        try {
            await api.post('/auth/request-otp', { 
                email, 
                metadata: { full_name: fullName } 
            });
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/verify-otp', { 
                email, 
                token: otp,
                metadata: { full_name: fullName }
            });
            const { session } = response.data;

            await supabase.auth.setSession({
                access_token: session.access_token,
                refresh_token: session.refresh_token
            });

            // Registration successful, redirect to home or pending booking
            const pendingBooking = sessionStorage.getItem('pendingBooking');
            if (pendingBooking) {
                navigate('/bookings', { replace: true });
            } else {
                navigate('/', { replace: true });
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid Code. Registration could not be finalized.');
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
                    <p className="text-gray-500 text-lg max-w-sm">Join our elite community and unlock a world of bespoke beauty rituals via secure identity validation.</p>
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

                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="reg-info"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-12">
                                    <h3 className="text-4xl font-black tracking-tight mb-2 text-white">Create Profile</h3>
                                    <p className="text-gray-500 font-medium">Join us for a personalized luxury experience. No passwords required.</p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-5 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-3xl text-[#00E6A0] text-xs font-bold flex gap-3 items-center">
                                        <span className="w-2 h-2 rounded-full bg-[#00E6A0] animate-pulse flex-none" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleRegisterRequest} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                                        <div className="relative group">
                                            <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                                className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/5 rounded-[1.8rem] text-sm font-bold text-white outline-none focus:border-[#00E6A0]/30 transition-all font-mono"
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
                                        {loading ? 'Processing...' : 'Initialize Profile'}
                                        <ArrowRight size={18} />
                                    </button>
                                </form>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="reg-otp"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <div className="mb-8">
                                    <button 
                                        onClick={() => setStep(1)}
                                        className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 hover:text-white transition-colors mb-6"
                                    >
                                        <ArrowLeft size={14} /> Back to details
                                    </button>
                                    <h3 className="text-4xl font-black tracking-tight mb-2 text-white">Verify Identity</h3>
                                    <p className="text-gray-500 font-medium">We've sent a validation code to <span className="text-white font-mono">{email}</span> to finalize your profile.</p>
                                </div>

                                {error && (
                                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-3xl text-red-500 text-xs font-bold flex gap-3 items-center">
                                         <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-none" />
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Validation Token</label>
                                        <div className="relative group">
                                            <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-[#00E6A0] transition-colors" size={18} />
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
                                        {loading ? 'Finalizing Profile...' : 'Complete Registration'}
                                        <CheckCircle size={18} />
                                    </button>
                                </form>
                            </motion.div>
                        )}
                    </AnimatePresence>

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
