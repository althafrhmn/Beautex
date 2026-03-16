import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Briefcase, Award, Store, Save, Camera } from 'lucide-react';
import api from '../../../utils/api';

const StaffProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [form, setForm] = useState({ fullName: '', phone: '', avatarUrl: '' });

    useEffect(() => { fetchProfile(); }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('/staff/me/profile');
            const p = res.data.profile;
            setProfile(p);
            setForm({ fullName: p.full_name || '', phone: p.phone_number || '', avatarUrl: p.avatar_url || '' });
        } catch (err) {
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSuccess('');
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

    if (loading) return <div className="text-gray-500 text-center py-20">Loading profile...</div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500 max-w-2xl">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">My Profile</h2>
                <p className="text-gray-400 text-sm mt-1">View and edit your profile information</p>
            </div>

            {success && (
                <div className="p-3 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-xl flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#00E6A0] flex-none" />
                    <p className="text-[#00E6A0] text-sm font-medium">{success}</p>
                </div>
            )}

            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl overflow-hidden">
                {/* Header Card */}
                <div className="p-8 border-b border-[#2A2A2A] bg-gradient-to-r from-[#1A1A1A] to-[#141414]">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-[#2A2A2A] border-2 border-[#00E6A0]/30 flex items-center justify-center overflow-hidden">
                            {profile?.avatar_url ? (
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="" />
                            ) : (
                                <span className="text-[#00E6A0] font-bold text-2xl">{profile?.full_name?.[0]}</span>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{profile?.full_name}</h3>
                            <p className="text-sm text-gray-400">{profile?.email}</p>
                            <div className="flex items-center gap-3 mt-2">
                                <span className="px-2.5 py-1 bg-[#00E6A0]/10 text-[#00E6A0] text-xs font-semibold rounded-md">{profile?.speciality || 'Staff'}</span>
                                {profile?.experience && (
                                    <span className="text-xs text-gray-500">{profile.experience} experience</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Read-only Info */}
                <div className="p-6 space-y-4 border-b border-[#2A2A2A]">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Assignment Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                            <Briefcase size={18} className="text-[#00E6A0]" />
                            <div>
                                <p className="text-xs text-gray-500">Speciality</p>
                                <p className="text-sm font-medium text-white">{profile?.speciality || 'Not assigned'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                            <Store size={18} className="text-[#00E6A0]" />
                            <div>
                                <p className="text-xs text-gray-500">Assigned Shop</p>
                                <p className="text-sm font-medium text-white">{profile?.assigned_shop || 'Not assigned'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                            <Award size={18} className="text-[#00E6A0]" />
                            <div>
                                <p className="text-xs text-gray-500">Experience</p>
                                <p className="text-sm font-medium text-white">{profile?.experience || 'Not set'}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-[#2A2A2A]">
                            <Mail size={18} className="text-[#00E6A0]" />
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="text-sm font-medium text-white">{profile?.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Editable Fields */}
                <div className="p-6 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Edit Information</h4>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="text" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors" />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Profile Photo URL</label>
                        <div className="relative">
                            <Camera className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                            <input type="text" value={form.avatarUrl} onChange={(e) => setForm({...form, avatarUrl: e.target.value})}
                                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                placeholder="https://example.com/photo.jpg" />
                        </div>
                    </div>

                    <button onClick={handleSave} disabled={saving}
                        className="mt-4 flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-6 py-3 rounded-xl font-bold text-sm transition-colors disabled:opacity-50">
                        {saving ? <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffProfile;
