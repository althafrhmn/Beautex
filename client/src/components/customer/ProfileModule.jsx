import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { User, Save, Shield, Bell, Moon, Lock, Smartphone } from 'lucide-react';

const ProfileModule = () => {
    const { user } = useSelector((state) => state.auth);
    const [fullName, setFullName] = useState(user?.user_metadata?.full_name || '');
    const [phone, setPhone] = useState(user?.user_metadata?.phone || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="space-y-12 pb-32">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Personal Identity */}
                <div className="bg-[#0A0A0A] rounded-[3rem] p-10 border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0]">
                            <User size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white">Personal Identity</h3>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Update your profile settings</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-[#00E6A0]/30 transition-all text-sm font-bold text-white placeholder:text-gray-700"
                                placeholder="Enter your full name"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Mobile Contact</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-2xl px-6 py-5 focus:outline-none focus:border-[#00E6A0]/30 transition-all text-sm font-bold text-white placeholder:text-gray-700"
                                placeholder="Enter your mobile number"
                            />
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-5 bg-[#00E6A0] text-[#050505] rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-white transition-all active:scale-[0.98] disabled:opacity-50 shadow-lg shadow-[#00E6A0]/20"
                        >
                            {isSaving ? <span className="w-5 h-5 border-2 border-[#050505]/20 border-t-[#050505] rounded-full animate-spin"></span> : <Save size={18} />}
                            Save Identity
                        </button>
                    </div>
                </div>

                {/* Account Security */}
                <div className="bg-[#0A0A0A] rounded-[3rem] p-10 border border-white/5 shadow-2xl">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0]">
                            <Shield size={24} />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white">Security Vault</h3>
                            <p className="text-[10px] font-black uppercase text-gray-500 tracking-widest">Manage your sanctuary safety</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {[
                            { label: 'Multi-Factor Auth', desc: 'Added layer of protection', icon: Lock, enabled: true },
                            { label: 'Instant Alerts', desc: 'Notifications for reservations', icon: Bell, enabled: false },
                            { label: 'Mobile Recovery', desc: 'Account access via SMS', icon: Smartphone, enabled: true },
                        ].map((pref, idx) => (
                            <div key={idx} className="flex items-center justify-between p-6 bg-white/5 rounded-[2rem] hover:bg-white/10 border border-transparent hover:border-white/5 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#050505] rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-[#00E6A0] transition-colors shadow-sm">
                                        <pref.icon size={20} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-white">{pref.label}</p>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{pref.desc}</p>
                                    </div>
                                </div>
                                <div className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors ${pref.enabled ? 'bg-[#00E6A0]' : 'bg-[#1A1D1F]'}`}>
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm ${pref.enabled ? 'left-7' : 'left-1'}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileModule;
