import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Award, Store, Save, Camera, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';

const StaffProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ 
        fullName: '', 
        phone: '', 
        avatarUrl: '',
        managerPin: ''
    });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/staff/me/profile');
            const p = res.data.profile;
            setProfile(p);
            setForm({ 
                fullName: p.full_name || '', 
                phone: p.phone_number || '', 
                avatarUrl: p.avatar_url || '',
                managerPin: p.manager_pin || ''
            });
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');

        // Basic PIN validation for managers
        if (profile?.role === 'manager' && form.managerPin.length !== 4) {
            alert('Executive PIN must be exactly 4 digits');
            setSaving(false);
            return;
        }

        try {
            await api.put('/staff/me/profile', form);
            setSuccess('Profile updated successfully!');
            fetchProfile();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Error saving profile:', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-gray-500 text-center py-20 animate-pulse font-black uppercase tracking-widest italic opacity-20">Accessing Personnel Files...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl font-sans tracking-tight">
            <div className="flex justify-between items-end">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-widest uppercase italic border-b-4 border-[#00E6A0] inline-block pb-1">My <span className="text-[#00E6A0]">Profile</span></h2>
                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.3rem] mt-4">Authorized Personnel Access Only</p>
                </div>
                {profile?.role === 'manager' && (
                    <div className="px-4 py-2 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-xl text-[#00E6A0] text-[9px] font-black uppercase tracking-widest italic animate-pulse">
                        Level 2 Authentication Active
                    </div>
                )}
            </div>

            {success && (
                <div className="p-4 bg-[#00E6A0]/5 border border-[#00E6A0]/20 rounded-2xl flex items-center gap-3 text-[#00E6A0] text-xs font-black uppercase tracking-widest animate-in slide-in-from-top-4">
                    <ShieldCheck size={18} /> {success}
                </div>
            )}

            <div className="bg-[#141414] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                {/* Header Card */}
                <div className="p-10 border-b border-white/5 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-[2rem] bg-[#1A1A1A] border-2 border-[#00E6A0]/20 flex items-center justify-center overflow-hidden shadow-xl shadow-black/50 group relative">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <span className="text-[#00E6A0] font-black text-4xl italic opacity-50">{profile?.full_name?.[0]}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-white uppercase italic tracking-tighter">{profile?.full_name}</h3>
                            <p className="text-sm font-bold text-gray-500 mb-4">{profile?.email}</p>
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 bg-[#1A1A1A] text-[#00E6A0] text-[9px] font-black uppercase tracking-widest rounded-lg border border-[#00E6A0]/20 italic">{profile?.specialization || 'Platform Talent'}</span>
                                {profile?.experience && (
                                    <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Active Since {profile.created_at?.split('-')[0] || '2025'}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Fields Section */}
                <div className="p-10 space-y-8">
                    <h4 className="text-[10px] font-black text-gray-600 uppercase tracking-[0.4rem] mb-6">Identity Credentials</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Legal Identity</label>
                            <div className="relative group">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00E6A0] transition-colors" size={16} />
                                <input type="text" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})}
                                    className="w-full bg-[#0F1115] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 transition-all font-sans font-bold" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Direct Contact</label>
                            <div className="relative group">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00E6A0] transition-colors" size={16} />
                                <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                                    className="w-full bg-[#0F1115] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 transition-all font-sans font-bold" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 italic">Avatar Source (URL)</label>
                        <div className="relative group">
                            <Camera className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-[#00E6A0] transition-colors" size={16} />
                            <input type="text" value={form.avatarUrl} onChange={(e) => setForm({...form, avatarUrl: e.target.value})}
                                className="w-full bg-[#0F1115] border border-white/5 rounded-2xl pl-12 pr-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 transition-all font-sans italic opacity-60"
                                placeholder="https://cloud.beautex.io/id_photo.webp" />
                        </div>
                    </div>

                    {/* Manager Security Section */}
                    {profile?.role === 'manager' && (
                        <div className="pt-8 border-t border-white/5 space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <Key size={16} className="text-[#00E6A0]" />
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4rem]">Executive Security Vault</h4>
                            </div>
                            <div className="p-8 bg-[#0F1115] border border-[#00E6A0]/10 rounded-[2rem] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform">
                                    <ShieldCheck size={100} />
                                </div>
                                <div className="max-w-xs space-y-4">
                                    <label className="block text-[9px] font-black text-[#00E6A0] uppercase tracking-[0.2rem] italic">Change Executive PIN</label>
                                    <input 
                                        type="text" 
                                        maxLength="4"
                                        placeholder="Enter 4-Digit PIN"
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-4 text-center text-xl font-black text-white tracking-[1rem] focus:outline-none focus:border-[#00E6A0] transition-all"
                                        value={form.managerPin}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            if (val.length <= 4) setForm({ ...form, managerPin: val });
                                        }}
                                    />
                                    <p className="text-[9px] text-gray-600 font-bold uppercase tracking-widest italic leading-relaxed">
                                        This PIN is required to unlock your business analytics and B2B Dispatch Center. Keep it confidential.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <button onClick={handleSave} disabled={saving}
                        className="mt-10 w-full flex items-center justify-center gap-3 bg-[#00E6A0] hover:bg-white text-[#050505] px-8 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3rem] italic transition-all disabled:opacity-50 shadow-xl shadow-[#00E6A0]/10 hover:shadow-white/5 group active:scale-[0.98]">
                        {saving ? <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" /> : <Save size={20} className="group-hover:rotate-12 transition-transform" />}
                        {saving ? 'Processing...' : 'Authorize Updates'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
