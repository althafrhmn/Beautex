import React, { useState, useEffect } from 'react';
import {
    Shield,
    Plus,
    Trash2,
    Mail,
    Phone,
    User,
    Key,
    UserCheck,
    X,
    Save,
    AlertCircle,
    BadgeCheck,
    Briefcase,
    Edit2
} from 'lucide-react';
import api from '../../../utils/api';

const AdminManagement = () => {
    const [admins, setAdmins] = useState([]);
    const [shops, setShops] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingAdmin, setEditingAdmin] = useState(null);

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phone: '',
        role: 'manager',
        assignedShop: '',
        managerPin: '1234'
    });

    useEffect(() => {
        fetchAdmins();
        fetchShops();
    }, []);

    const fetchShops = async () => {
        try {
            const res = await api.get('/shops');
            setShops(res.data.salons || res.data.shops || []);
        } catch (err) {
            console.error('Error fetching shops:', err);
        }
    };

    const fetchAdmins = async () => {
        try {
            const res = await api.get('/admin/users');
            setAdmins(res.data.admins || []);
        } catch (err) {
            console.error('Error fetching admins:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreateModal = () => {
        setEditingAdmin(null);
        setFormData({
            fullName: '',
            email: '',
            password: '',
            phone: '',
            role: 'manager',
            assignedShop: '',
            managerPin: '1234'
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleEditAdmin = (admin) => {
        setEditingAdmin(admin);
        setFormData({
            fullName: admin.full_name,
            email: admin.email,
            phone: admin.phone_number || '',
            role: admin.role,
            assignedShop: admin.assigned_shop || '',
            managerPin: admin.manager_pin || '1234',
            password: '' // Optional for updates
        });
        setError('');
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (editingAdmin) {
                await api.put(`/admin/users/${editingAdmin.id}`, formData);
                setSuccess(`Updated access for ${formData.fullName}`);
            } else {
                await api.post('/admin/users', formData);
                setSuccess(`Administrative access granted to ${formData.fullName}`);
            }
            setIsModalOpen(false);
            fetchAdmins();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to process request');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAdmin = async (id, name) => {
        if (!window.confirm(`Are you sure you want to revoke administrative access for ${name}?`)) return;

        try {
            await api.delete(`/admin/users/${id}`);
            setAdmins(admins.filter(a => a.id !== id));
            setSuccess(`Access revoked for ${name}`);
        } catch (err) {
            alert(err.response?.data?.error || 'Failed to revoke access');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter mb-2">Shop <span className="text-[#00E6A0]">Owners</span></h2>
                    <p className="text-gray-500 font-bold uppercase text-[10px] tracking-[0.3em]">Manage shop owners, managers and receptionists</p>
                </div>
                <button
                    onClick={handleOpenCreateModal}
                    className="bg-[#00E6A0] hover:bg-white text-[#050505] px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center gap-3 shadow-xl shadow-[#00E6A0]/10"
                >
                    <Plus size={18} /> Add New Owner
                </button>
            </div>

            {/* Notifications */}
            {success && (
                <div className="bg-[#00E6A0]/10 border border-[#00E6A0]/20 p-4 rounded-xl flex items-center gap-3 text-[#00E6A0] text-sm animate-in slide-in-from-top-4">
                    <BadgeCheck size={18} /> {success}
                </div>
            )}

            {/* Admin List Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-[#111] animate-pulse rounded-[2.5rem] border border-white/5" />
                    ))
                ) : admins.length > 0 ? (
                    admins.map((admin) => (
                        <div key={admin.id} className="group bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] p-8 hover:border-[#00E6A0]/30 transition-all shadow-2xl relative overflow-hidden">
                            {/* Role Badge */}
                            <div className="absolute top-8 right-8 px-3 py-1 bg-[#1A1A1A] rounded-full border border-white/10 text-[9px] font-black uppercase text-[#00E6A0] tracking-widest">
                                {admin.role}
                            </div>

                            <div className="flex flex-col h-full">
                                <div className="w-16 h-16 rounded-2xl bg-[#1A1A1A] flex items-center justify-center text-[#00E6A0] mb-6 group-hover:scale-110 transition-transform bg-gradient-to-br from-[#00E6A0]/10 to-transparent">
                                    <User size={32} />
                                </div>

                                <h3 className="text-2xl font-black text-white mb-1">{admin.full_name}</h3>
                                <p className="text-gray-500 text-xs font-medium mb-6 flex items-center gap-2">
                                    <Mail size={12} /> {admin.email}
                                </p>

                                <div className="mt-auto space-y-6 pt-6 border-t border-white/5">
                                    <div className="flex items-center gap-3 text-gray-400">
                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                                            <Phone size={14} />
                                        </div>
                                        <span className="text-[11px] font-bold tracking-wider">{admin.phone_number || 'N/A'}</span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEditAdmin(admin)}
                                            className="flex-1 py-3 bg-[#00E6A0]/5 hover:bg-[#00E6A0] text-[#00E6A0] hover:text-[#0A0A0A] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-[#00E6A0]/20"
                                        >
                                            <Edit2 size={14} /> Update
                                        </button>
                                        <button
                                            onClick={() => handleDeleteAdmin(admin.id, admin.full_name)}
                                            className="w-12 h-12 bg-red-500/5 hover:bg-red-500 text-red-500 hover:text-white rounded-xl font-bold transition-all flex items-center justify-center border border-red-500/20"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-[#0A0A0A] rounded-[3rem] border border-dashed border-white/10">
                        <Shield size={48} className="mx-auto text-gray-600 mb-4 opacity-20" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest">No other administrative users found</p>
                    </div>
                )}
            </div>

            {/* Add/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-[#111] border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-3xl font-black text-white tracking-tighter">
                                    {editingAdmin ? 'Update' : 'New'} <span className="text-[#00E6A0]">Owner</span>
                                </h3>
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mt-2">Provision shop owner credentials</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 text-gray-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all">
                                <X size={24} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold font-sans">
                                <AlertCircle size={16} /> {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Identity</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            required
                                            type="text"
                                            placeholder="Legal Name"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">System Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            required
                                            type="email"
                                            placeholder="admin@beautex.com"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Contact Phone</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <input
                                            required
                                            type="tel"
                                            maxLength="10"
                                            placeholder="10-digit mobile number"
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                if (val.length <= 10) setFormData({ ...formData, phone: val });
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Authority Level</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <select
                                                required
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none font-sans"
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                            >
                                                <option value="manager">Manager</option>
                                                <option value="receptionist">Receptionist</option>
                                                <option value="admin">Super Admin</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Initial Password</label>
                                        <div className="relative">
                                            <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                required={!editingAdmin}
                                                type="password"
                                                placeholder={editingAdmin ? "•••••••• (Leave blank to keep)" : "••••••••"}
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans"
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Assigned Shop</label>
                                    <div className="relative">
                                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                        <select
                                            className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none font-sans"
                                            value={formData.assignedShop}
                                            onChange={(e) => setFormData({ ...formData, assignedShop: e.target.value })}
                                        >
                                            <option value="">No Shop Assigned (All Access)</option>
                                            {shops.map(shop => (
                                                <option key={shop.id} value={shop.name}>{shop.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {formData.role === 'manager' && (
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Executive Mode PIN</label>
                                        <div className="relative">
                                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                required
                                                type="text"
                                                maxLength="4"
                                                placeholder="4-Digit Security PIN"
                                                className="w-full bg-[#0A0A0A] border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors font-sans tracking-[0.5em]"
                                                value={formData.managerPin}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '');
                                                    if (val.length <= 4) setFormData({ ...formData, managerPin: val });
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-xl shadow-[#00E6A0]/10"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <><UserCheck size={20} /> {editingAdmin ? 'Update' : 'Provision'} Credentials</>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminManagement;
