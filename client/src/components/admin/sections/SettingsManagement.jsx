import React from 'react';
import { Save, User, MapPin, Bell, Shield, Lock } from 'lucide-react';

const SettingsManagement = () => {
    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">System Settings</h2>
                <p className="text-gray-400 text-sm mt-1">Configure global platform preferences</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* General Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <User size={18} className="text-[#00E6A0]" />
                            Profile Information
                        </h3>
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Platform Name</label>
                                    <input type="text" defaultValue="BeauteX Salon" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E6A0] text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Support Email</label>
                                    <input type="email" defaultValue="admin@beautex.com" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E6A0] text-white" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Global Contact Number</label>
                                <input type="text" defaultValue="+1 (555) 123-4567" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E6A0] text-white" />
                            </div>
                            <div className="flex justify-end pt-4 border-t border-[#2A2A2A]">
                                <button className="flex items-center gap-2 bg-[#00E6A0] text-[#141414] font-semibold px-6 py-2.5 rounded-lg hover:bg-[#00C88B] transition-colors">
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Lock size={18} className="text-[#00E6A0]" />
                            Security
                        </h3>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Current Password</label>
                                <input type="password" placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E6A0] text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">New Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E6A0] text-white" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">Confirm Password</label>
                                    <input type="password" placeholder="••••••••" className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#00E6A0] text-white" />
                                </div>
                            </div>
                            <div className="flex justify-end pt-4 border-t border-[#2A2A2A]">
                                <button className="flex items-center gap-2 bg-[#2A2A2A] text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-[#333] transition-colors border border-white/5">
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                            <Bell size={18} className="text-[#00E6A0]" />
                            Notifications
                        </h3>
                        <div className="space-y-4">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-medium text-white group-hover:text-[#00E6A0] transition-colors">Email Alerts</p>
                                    <p className="text-xs text-gray-500 mt-1">Get notified of new bookings</p>
                                </div>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-10 h-5.5 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#00E6A0]"></div>
                                </div>
                            </label>

                            <div className="border-t border-[#2A2A2A] my-4" />

                            <label className="flex items-center justify-between cursor-pointer group">
                                <div>
                                    <p className="text-sm font-medium text-white group-hover:text-[#00E6A0] transition-colors">SMS Notifications</p>
                                    <p className="text-xs text-gray-500 mt-1">Alert staff on assignments</p>
                                </div>
                                <div className="relative">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-10 h-5.5 bg-[#2A2A2A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#00E6A0]"></div>
                                </div>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsManagement;
