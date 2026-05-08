import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Megaphone, Plus, Trash2, Tag, Briefcase, Info, Loader2, Calendar, Radio, Users, Phone, Mail, FileText, ChevronDown, ChevronUp, X } from 'lucide-react';
import api from '../../../utils/api';

const TYPE_CONFIG = {
    offer: { label: 'Special Offer', icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    job: { label: 'Job Opening', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    announcement: { label: 'Announcement', icon: Info, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

const PLACEHOLDERS = {
    offer: {
        title: 'E.g. 20% OFF All Hair Treatments This Week',
        content: 'Describe the offer — which services are included, the discount amount, validity, and any terms or conditions...'
    },
    job: {
        title: 'E.g. Hiring Senior Stylist — Kochi Branch',
        content: 'Describe the job role — responsibilities, required experience, salary range, how to apply, and contact details...'
    },
    announcement: {
        title: 'E.g. Shop Closed on 15th May for Renovation',
        content: 'Share your update — include all relevant details such as dates, times, locations, or any action required by customers...'
    },
};

const AnnouncementManager = () => {
    const { user, token } = useSelector((state) => state.auth);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [expandedApps, setExpandedApps] = useState(null); // id of job being viewed
    const [applications, setApplications] = useState({}); // { [announcementId]: [] }
    const [loadingApps, setLoadingApps] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'announcement',
        end_date: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/announcements?salon_id=${user.assigned_shop}`);
            setAnnouncements(res.data.announcements || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.content.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/announcements', {
                ...formData,
                salon_id: user.assigned_shop
            });
            setShowForm(false);
            setFormData({ title: '', content: '', type: 'announcement', end_date: '' });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to broadcast. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Remove this broadcast?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    const toggleApplications = async (ann) => {
        if (expandedApps === ann.id) {
            setExpandedApps(null);
            return;
        }
        setExpandedApps(ann.id);
        if (applications[ann.id]) return; // already loaded
        setLoadingApps(true);
        try {
            const res = await api.get(`/announcements/${ann.id}/applications`);
            setApplications(prev => ({ ...prev, [ann.id]: res.data.applications || [] }));
        } catch (err) {
            console.error('Failed to load applications', err);
        } finally {
            setLoadingApps(false);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">
                        Broadcast <span className="text-[#00E6A0]">Station</span>
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">
                        Post jobs, offers &amp; news — goes live instantly for all users
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00E6A0] text-[#050505] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#00E6A0]/20"
                >
                    {showForm ? 'Cancel' : <><Plus size={16} /> New Broadcast</>}
                </button>
            </div>

            {/* Broadcast Form */}
            {showForm && (
                <div className="bg-[#111] border border-[#00E6A0]/20 rounded-[2.5rem] p-8 shadow-2xl shadow-[#00E6A0]/5">
                    <div className="flex items-center gap-3 mb-6">
                        <Radio size={18} className="text-[#00E6A0] animate-pulse" />
                        <span className="text-[#00E6A0] font-black text-xs uppercase tracking-widest">Live Broadcast — Posts Immediately</span>
                    </div>
                    <form onSubmit={handleCreate} className="space-y-6">
                        {/* Type Selector */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 block mb-3">
                                Broadcast Type
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
                                    const Icon = cfg.icon;
                                    return (
                                        <button
                                            key={key}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: key })}
                                            className={`flex flex-col items-center gap-2 py-4 rounded-2xl border font-black text-xs uppercase tracking-widest transition-all ${
                                                formData.type === key
                                                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                                                    : 'bg-[#1A1A1A] border-white/5 text-gray-600 hover:border-white/20'
                                            }`}
                                        >
                                            <Icon size={18} />
                                            {cfg.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 block mb-2">
                                Subject / Headline *
                            </label>
                            <input
                                type="text"
                                required
                                placeholder={PLACEHOLDERS[formData.type]?.title}
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 font-bold transition-all"
                            />
                        </div>

                        {/* Content */}
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 block mb-2">
                                Message / Details *
                            </label>
                            <textarea
                                required
                                rows="5"
                                placeholder={PLACEHOLDERS[formData.type]?.content}
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 font-medium transition-all resize-none"
                            />
                        </div>

                        {/* Expiry */}
                        <div className="max-w-xs">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1 flex items-center gap-2 mb-2">
                                <Calendar size={10} /> Expires On (optional)
                            </label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 transition-all"
                            />
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !formData.title || !formData.content}
                            className="w-full py-4 bg-[#00E6A0] text-[#050505] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-[#00E6A0]/20"
                        >
                            {submitting ? <Loader2 className="animate-spin" size={18} /> : <><Radio size={16} /> Broadcast Now</>}
                        </button>
                    </form>
                </div>
            )}

            {/* Existing Broadcasts */}
            <div className="grid grid-cols-1 gap-5">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-[#00E6A0]" size={36} />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-[#111] border border-dashed border-white/10 rounded-[2.5rem] py-20 text-center">
                        <Megaphone size={44} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-600 font-bold uppercase tracking-widest text-xs">No active broadcasts</p>
                        <p className="text-gray-700 text-xs mt-2">Click "New Broadcast" to post your first message to all users.</p>
                    </div>
                ) : (
                    announcements.map((ann) => {
                        const config = TYPE_CONFIG[ann.type] || TYPE_CONFIG.announcement;
                        const Icon = config.icon;
                        const isJob = ann.type === 'job';
                        const appList = applications[ann.id] || [];
                        const isExpanded = expandedApps === ann.id;

                        return (
                            <div key={ann.id} className={`bg-[#111] border ${config.border} rounded-3xl overflow-hidden transition-all`}>
                                {/* Card Row */}
                                <div className="p-6 flex items-start gap-5">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-none ${config.bg} border ${config.border}`}>
                                        <Icon size={20} className={config.color} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.bg} ${config.color} border ${config.border}`}>
                                                {config.label}
                                            </span>
                                            <span className="text-[9px] text-gray-600 font-bold">
                                                {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        <h3 className="text-base font-black text-white italic uppercase tracking-tight line-clamp-1 mb-1">{ann.title}</h3>
                                        <p className="text-xs text-gray-500 font-medium line-clamp-2 mb-2">{ann.content}</p>
                                        
                                        {/* Expiry Date Display */}
                                        {ann.end_date && (() => {
                                            const expiry = new Date(ann.end_date);
                                            const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                                            const isUrgent = daysLeft <= 7;
                                            return (
                                                <div className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                                                    isUrgent ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-gray-600'
                                                }`}>
                                                    <Calendar size={9} />
                                                    {isUrgent && daysLeft > 0 ? `Closes in ${daysLeft}d · ` : 'Closes · '}
                                                    {expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    <div className="flex items-center gap-2 flex-none">
                                        {isJob && (
                                            <button
                                                onClick={() => toggleApplications(ann)}
                                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${isExpanded ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-400 hover:bg-blue-500/20'}`}
                                            >
                                                <Users size={13} />
                                                Applicants
                                                {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(ann.id)}
                                            className="p-2.5 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Applications Panel */}
                                {isJob && isExpanded && (
                                    <div className="border-t border-blue-500/20 bg-[#0A0A0A] p-6">
                                        <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                            <Users size={12} /> Applications Received
                                        </p>
                                        {loadingApps ? (
                                            <div className="flex justify-center py-6">
                                                <Loader2 className="animate-spin text-blue-400" size={24} />
                                            </div>
                                        ) : appList.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Users size={32} className="mx-auto text-gray-700 mb-3" />
                                                <p className="text-gray-600 text-xs font-bold">No applications yet</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {appList.map((app, i) => (
                                                    <div key={app.id} className="bg-[#111] border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                                                        {/* Avatar */}
                                                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-sm flex-none">
                                                            {app.applicant_name?.charAt(0).toUpperCase()}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-black text-white mb-1">{app.applicant_name}</p>
                                                            <div className="flex flex-wrap gap-3">
                                                                <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                                    <Mail size={10} className="text-blue-400" />
                                                                    {app.applicant_email}
                                                                </span>
                                                                {app.applicant_phone && (
                                                                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                                                        <Phone size={10} className="text-blue-400" />
                                                                        {app.applicant_phone}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Resume Download — uses server endpoint with token for auth */}
                                                        {app.resume_url ? (
                                                            <a
                                                                href={`http://127.0.0.1:5000/api/announcements/resume/${app.id}?token=${token}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex-none"
                                                                title={`Download: ${app.resume_url}`}
                                                            >
                                                                <FileText size={12} /> Resume
                                                            </a>
                                                        ) : (
                                                            <span className="text-[9px] text-gray-700 font-bold italic flex-none">No resume</span>
                                                        )}

                                                        <span className="text-[9px] text-gray-700 flex-none">
                                                            {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default AnnouncementManager;
