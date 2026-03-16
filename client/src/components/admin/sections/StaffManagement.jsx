import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, User, Mail, Phone, Briefcase, Award, Store, Eye, EyeOff } from 'lucide-react';
import api from '../../../utils/api';

const SPECIALITIES = ['Hair Stylist', 'Makeup Artist', 'Beautician', 'Nail Artist', 'Facial Specialist'];

const StaffManagement = () => {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const emptyForm = { fullName: '', email: '', phone: '', password: '', speciality: '', experience: '', assignedShop: '', avatarUrl: '' };
    const [form, setForm] = useState(emptyForm);

    useEffect(() => { fetchStaff(); }, []);

    const fetchStaff = async () => {
        try {
            const res = await api.get('/staff/all');
            setStaff(res.data.staff || []);
        } catch (err) {
            console.error('Error fetching staff:', err);
        } finally {
            setLoading(false);
        }
    };

    const openAddModal = () => {
        setEditingStaff(null);
        setForm(emptyForm);
        setError('');
        setShowModal(true);
    };

    const openEditModal = (member) => {
        setEditingStaff(member);
        setForm({
            fullName: member.full_name || '',
            email: member.email || '',
            phone: member.phone_number || '',
            password: '',
            speciality: member.speciality || '',
            experience: member.experience || '',
            assignedShop: member.assigned_shop || '',
            avatarUrl: member.avatar_url || ''
        });
        setError('');
        setShowModal(true);
    };

    const handleSave = async () => {
        if (!form.fullName || !form.email) {
            setError('Name and Email are required.');
            return;
        }
        if (!editingStaff && !form.password) {
            setError('Password is required for new staff.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            if (editingStaff) {
                await api.put(`/staff/${editingStaff.id}`, form);
            } else {
                await api.post('/staff/create', form);
            }
            setShowModal(false);
            fetchStaff();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save staff member.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this staff member?')) return;
        try {
            await api.delete(`/staff/${id}`);
            fetchStaff();
        } catch (err) {
            console.error('Error deleting staff:', err);
        }
    };

    const filteredStaff = staff.filter(s =>
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.speciality?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Staff Management</h2>
                    <p className="text-gray-400 text-sm mt-1">Add and manage salon professionals</p>
                </div>
                <button onClick={openAddModal} className="flex items-center gap-2 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
                    <Plus size={18} />
                    Add New Staff
                </button>
            </div>

            {/* Table */}
            <div className="bg-[#141414] border border-[#2A2A2A] rounded-xl p-4">
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email or speciality..."
                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#00E6A0] transition-colors"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <span className="text-xs text-gray-500 font-medium">{filteredStaff.length} members</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs uppercase bg-[#1A1A1A] text-gray-400">
                            <tr>
                                <th className="px-6 py-4 font-semibold rounded-tl-lg">Professional</th>
                                <th className="px-6 py-4 font-semibold">Speciality</th>
                                <th className="px-6 py-4 font-semibold">Assigned Shop</th>
                                <th className="px-6 py-4 font-semibold">Experience</th>
                                <th className="px-6 py-4 font-semibold">Phone</th>
                                <th className="px-6 py-4 font-semibold text-right rounded-tr-lg">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#2A2A2A]">
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-8 text-gray-500">Loading staff...</td></tr>
                            ) : filteredStaff.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500 font-medium">No staff members found.</td></tr>
                            ) : (
                                filteredStaff.map((member) => (
                                    <tr key={member.id} className="hover:bg-[#1A1A1A]/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center overflow-hidden">
                                                    {member.avatar_url ? (
                                                        <img src={member.avatar_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <span className="text-[#00E6A0] font-bold text-sm">{member.full_name?.[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-white">{member.full_name}</p>
                                                    <p className="text-xs text-gray-500">{member.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-[#00E6A0]/10 text-[#00E6A0] text-xs font-semibold rounded-md">
                                                {member.speciality || 'Not Set'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400">{member.assigned_shop || '—'}</td>
                                        <td className="px-6 py-4 text-gray-400">{member.experience || '—'}</td>
                                        <td className="px-6 py-4 text-gray-400">{member.phone_number || '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => openEditModal(member)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors" title="Edit">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => handleDelete(member.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Remove">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                            <h3 className="text-lg font-bold text-white">{editingStaff ? 'Edit Staff Member' : 'Add New Staff'}</h3>
                            <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-lg transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Form */}
                        <div className="p-6 space-y-4">
                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-none" />
                                    <p className="text-red-400 text-sm font-medium">{error}</p>
                                </div>
                            )}

                            {/* Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name *</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="text" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        placeholder="Enter full name" />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email *</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                                        disabled={!!editingStaff}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors disabled:opacity-50"
                                        placeholder="staff@gmail.com" />
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="text" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        placeholder="+91 XXXXX XXXXX" />
                                </div>
                            </div>

                            {/* Password (only for new staff) */}
                            {!editingStaff && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Password *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">🔒</span>
                                        <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})}
                                            className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                            placeholder="Min 6 characters" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Speciality */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Speciality</label>
                                <select value={form.speciality} onChange={(e) => setForm({...form, speciality: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors appearance-none">
                                    <option value="">Select speciality</option>
                                    {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>

                            {/* Experience */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Experience</label>
                                <div className="relative">
                                    <Award className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="text" value={form.experience} onChange={(e) => setForm({...form, experience: e.target.value})}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        placeholder="e.g. 5 Years" />
                                </div>
                            </div>

                            {/* Assigned Shop */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Assigned Shop</label>
                                <div className="relative">
                                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                                    <input type="text" value={form.assignedShop} onChange={(e) => setForm({...form, assignedShop: e.target.value})}
                                        className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                        placeholder="e.g. BeauteX Downtown" />
                                </div>
                            </div>

                            {/* Profile Photo URL */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Profile Photo URL</label>
                                <input type="text" value={form.avatarUrl} onChange={(e) => setForm({...form, avatarUrl: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#00E6A0] transition-colors"
                                    placeholder="https://example.com/photo.jpg" />
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-[#2A2A2A] flex items-center justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2A2A2A] rounded-xl transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSave} disabled={saving}
                                className="px-6 py-2.5 bg-[#00E6A0] hover:bg-[#00C88B] text-[#141414] rounded-xl font-bold text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                                {saving && <div className="w-4 h-4 border-2 border-[#141414] border-t-transparent rounded-full animate-spin" />}
                                {editingStaff ? 'Save Changes' : 'Create Staff Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffManagement;
