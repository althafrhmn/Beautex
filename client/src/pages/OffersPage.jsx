import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Tag, Briefcase, Info, ArrowRight, X, MapPin, Clock, Sparkles, Upload, CheckCircle, Phone, Mail, User, Calendar } from 'lucide-react';
import api from '../utils/api';

const TYPE_CONFIG = {
    offer: { label: 'Special Offer', icon: Tag, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', badge: 'bg-emerald-500/20 text-emerald-300' },
    job: { label: 'Job Opening', icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', badge: 'bg-blue-500/20 text-blue-300' },
    announcement: { label: 'Announcement', icon: Info, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', badge: 'bg-amber-500/20 text-amber-300' },
};

// --- Full Message Modal ---
const AnnouncementModal = ({ item, onClose, onApply }) => {
    if (!item) return null;
    const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
    const Icon = config.icon;
    const salonName = item.salons?.name || 'Beautex Network';
    const salonCity = item.salons?.city || '';

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className={`relative bg-[#0D0D0D] border ${config.border} rounded-[3rem] p-10 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto`}
                onClick={e => e.stopPropagation()}
            >
                <div className={`absolute -top-20 -left-20 w-64 h-64 ${config.bg} rounded-full blur-[100px] pointer-events-none`} />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <X size={18} />
                </button>

                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 ${config.badge} border ${config.border}`}>
                    <Icon size={12} /> {config.label}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <MapPin size={14} className={config.color} />
                    <span className="font-bold">{salonName}</span>
                    {salonCity && <span className="text-gray-600">• {salonCity}</span>}
                </div>

                <h2 className="text-3xl font-black text-white tracking-tight italic uppercase mb-4">{item.title}</h2>
                <p className="text-gray-300 font-medium leading-relaxed mb-6 border-l-2 border-white/10 pl-4">{item.content}</p>

                <div className="flex flex-col gap-3 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Clock size={12} />
                        <span>Posted {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                    {item.end_date && (() => {
                        const expiry = new Date(item.end_date);
                        const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                        const isUrgent = daysLeft <= 7;
                        return (
                            <div className={`flex items-center gap-2 text-xs font-black uppercase tracking-wider ${isUrgent ? 'text-amber-400' : 'text-gray-500'}`}>
                                <Calendar size={12} />
                                {isUrgent && daysLeft > 0 ? `Closes in ${daysLeft} Days • ` : 'Closes • '}
                                {expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                        );
                    })()}
                </div>

                {item.type === 'job' && (
                    <button
                        onClick={() => { onClose(); onApply(item); }}
                        className="mt-6 w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                    >
                        <Briefcase size={16} /> Apply for This Position
                    </button>
                )}
            </motion.div>
        </motion.div>
    );
};

// --- Apply Now Modal ---
const ApplyModal = ({ job, onClose }) => {
    const fileRef = useRef(null);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });
    const [resumeFile, setResumeFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
    const validatePhone = (phone) => !phone || /^[0-9]{10}$/.test(phone.replace(/\s+/g, ''));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        const errors = {};
        if (!validateEmail(form.email)) errors.email = 'Enter a valid email (e.g. you@gmail.com)';
        if (form.phone && !validatePhone(form.phone)) errors.phone = 'Phone number must be exactly 10 digits';
        if (!resumeFile) errors.resume = 'Resume (PDF) is required to apply';
        if (Object.keys(errors).length > 0) { setFieldErrors(errors); return; }
        setFieldErrors({});

        setUploading(true);
        try {
            let resume_base64 = null;
            let resume_filename = null;

            // Convert PDF to base64 — server will handle the actual upload to Supabase
            if (resumeFile) {
                resume_filename = resumeFile.name;
                resume_base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result.split(',')[1]); // strip data URI prefix
                    reader.onerror = reject;
                    reader.readAsDataURL(resumeFile);
                });
            }

            await api.post(`/announcements/${job.id}/apply`, {
                applicant_name: form.name,
                applicant_email: form.email,
                applicant_phone: form.phone || null,
                resume_base64,
                resume_filename
            });

            setSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.error || 'Submission failed. Please check your details and try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-6"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="relative bg-[#0D0D0D] border border-blue-500/30 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-xl transition-all">
                    <X size={18} />
                </button>

                {submitted ? (
                    <div className="text-center py-10">
                        <CheckCircle size={56} className="text-blue-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-white mb-2">Application Sent!</h3>
                        <p className="text-gray-500 text-sm">The salon team will review your details and contact you soon.</p>
                        <button onClick={onClose} className="mt-8 px-8 py-3 bg-blue-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-400 transition-all">
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            <Briefcase size={12} /> Applying For
                        </div>
                        <h2 className="text-2xl font-black text-white italic uppercase mb-1">{job?.title}</h2>
                        <p className="text-sm text-gray-500 mb-8">{job?.salons?.name || 'Beautex Network'}</p>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Name */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-1"><User size={10} /> Full Name *</label>
                                <input required type="text" placeholder="Your full name"
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-1"><Mail size={10} /> Email *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={e => { setForm({ ...form, email: e.target.value }); setFieldErrors(p => ({...p, email: ''})); }}
                                    onBlur={e => {
                                        if (e.target.value && !validateEmail(e.target.value)) {
                                            setFieldErrors(p => ({...p, email: 'Enter a valid email (e.g. you@gmail.com)'}));
                                        }
                                    }}
                                    className={`w-full bg-[#1A1A1A] border rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none transition-all ${
                                        fieldErrors.email ? 'border-red-500/60' : 'border-white/5 focus:border-blue-500/50'
                                    }`}
                                />
                                {fieldErrors.email && <p className="text-red-400 text-[10px] font-bold mt-1.5 px-1 flex items-center gap-1">⚠ {fieldErrors.email}</p>}
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-1"><Phone size={10} /> Contact Number <span className="text-gray-700">(10 digits)</span></label>
                                <input type="tel" placeholder="9876543210"
                                    value={form.phone} maxLength={10}
                                    onChange={e => { setForm({ ...form, phone: e.target.value.replace(/\D/g, '') }); setFieldErrors(p => ({...p, phone: ''})); }}
                                    className={`w-full bg-[#1A1A1A] border rounded-2xl px-5 py-3.5 text-sm text-white focus:outline-none transition-all ${
                                        fieldErrors.phone ? 'border-red-500/60' : 'border-white/5 focus:border-blue-500/50'
                                    }`}
                                />
                                {fieldErrors.phone && <p className="text-red-400 text-[10px] font-bold mt-1.5 px-1">{fieldErrors.phone}</p>}
                            </div>

                            {/* Resume Upload */}
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                    <Upload size={10} /> Resume (PDF) <span className="text-red-400">*</span>
                                </label>
                                <div
                                    onClick={() => fileRef.current?.click()}
                                    className={`w-full bg-[#1A1A1A] border-2 border-dashed rounded-2xl px-5 py-5 text-center cursor-pointer transition-all ${
                                        resumeFile ? 'border-blue-500/50 bg-blue-500/5' :
                                        fieldErrors.resume ? 'border-red-500/60 bg-red-500/5' :
                                        'border-white/10 hover:border-white/20'
                                    }`}
                                >
                                    {resumeFile ? (
                                        <div className="flex items-center justify-center gap-2 text-blue-400">
                                            <CheckCircle size={16} />
                                            <span className="text-sm font-bold">{resumeFile.name}</span>
                                        </div>
                                    ) : (
                                        <div className={fieldErrors.resume ? 'text-red-400' : 'text-gray-600'}>
                                            <Upload size={24} className="mx-auto mb-2 opacity-40" />
                                            <p className="text-xs font-bold">Click to upload PDF resume</p>
                                            {fieldErrors.resume && <p className="text-[10px] mt-1">{fieldErrors.resume}</p>}
                                        </div>
                                    )}
                                    <input ref={fileRef} type="file" accept=".pdf" className="hidden"
                                        onChange={e => { setResumeFile(e.target.files[0] || null); setFieldErrors(p => ({...p, resume: ''})); }}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-400 text-xs font-bold">{error}</p>}

                            <button type="submit" disabled={uploading}
                                className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-500/20"
                            >
                                {uploading ? 'Submitting...' : <><Briefcase size={16} /> Submit Application</>}
                            </button>
                        </form>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
};

// --- Main Page ---
const OffersPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const [selected, setSelected] = useState(null);
    const [applying, setApplying] = useState(null);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await api.get('/announcements');
                setAnnouncements(res.data.announcements || []);
            } catch (err) {
                console.error('Failed to load community feed:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'job', label: '💼 Jobs' },
        { id: 'offer', label: '🏷️ Offers' },
        { id: 'announcement', label: '📢 News' },
    ];

    const filtered = activeFilter === 'all' ? announcements : announcements.filter(a => a.type === activeFilter);

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20 font-sans">
            <div className="max-w-5xl mx-auto px-6">
                {/* Hero */}
                <div className="text-center mb-16">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-[#00E6A0]/10 border border-[#00E6A0]/20 text-[#00E6A0] text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                    >
                        <Megaphone size={12} /> Live Community Feed
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-6"
                    >
                        Job Board &amp; <span className="text-gray-600 italic font-medium">News</span>
                    </motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                        className="text-gray-500 text-lg font-medium max-w-xl mx-auto leading-relaxed italic"
                    >
                        Live updates — job openings, special offers, and news posted directly by our salon network.
                    </motion.p>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-3 justify-center flex-wrap mb-12">
                    {filters.map(f => (
                        <button key={f.id} onClick={() => setActiveFilter(f.id)}
                            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${activeFilter === f.id ? 'bg-[#00E6A0] text-black shadow-lg shadow-[#00E6A0]/20' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* Feed */}
                {loading ? (
                    <div className="flex justify-center py-40">
                        <div className="w-10 h-10 border-4 border-[#00E6A0] border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-40 text-center border border-dashed border-white/10 rounded-[4rem] bg-white/5">
                        <Sparkles size={40} className="mx-auto text-white/10 mb-6" />
                        <h3 className="text-2xl font-black text-white mb-3">Nothing here yet</h3>
                        <p className="text-gray-600 italic text-sm">Salon owners and staff will post live updates here.</p>
                    </div>
                ) : (
                    <motion.div className="space-y-5">
                        <AnimatePresence>
                            {filtered.map((item, idx) => {
                                const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.announcement;
                                const Icon = config.icon;
                                const salonName = item.salons?.name || 'Beautex Network';
                                const salonCity = item.salons?.city || '';
                                const isJob = item.type === 'job';

                                return (
                                    <motion.div key={item.id}
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                                        className={`group bg-[#0A0A0A] border ${config.border} rounded-[2.5rem] p-7 flex gap-6 items-start hover:bg-[#111] hover:shadow-xl transition-all duration-300`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex-none flex items-center justify-center ${config.bg} border ${config.border}`}>
                                            <Icon size={22} className={config.color} />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin size={11} className={config.color} />
                                                <span className="text-xs font-bold text-gray-400">{salonName}</span>
                                                {salonCity && <span className="text-xs text-gray-600">• {salonCity}</span>}
                                                <span className={`ml-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${config.badge}`}>{config.label}</span>
                                            </div>
                                            <h3 className="text-lg font-black text-white italic uppercase tracking-tight mb-1 line-clamp-1">{item.title}</h3>
                                            <p className="text-sm text-gray-500 font-medium line-clamp-2 mb-2">{item.content}</p>
                                            {/* Expiry date */}
                                            {item.end_date && (() => {
                                                const expiry = new Date(item.end_date);
                                                const daysLeft = Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
                                                const isUrgent = daysLeft <= 7;
                                                return (
                                                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                                                        isUrgent ? 'bg-amber-500/15 text-amber-400' : 'bg-white/5 text-gray-600'
                                                    }`}>
                                                        <Clock size={9} />
                                                        {isUrgent && daysLeft > 0 ? `Closes in ${daysLeft}d · ` : 'Closes · '}
                                                        {expiry.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <div className="flex flex-col gap-2 flex-none self-center">
                                            <button
                                                onClick={() => setSelected(item)}
                                                className="px-4 py-2.5 bg-white/5 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest whitespace-nowrap"
                                            >
                                                Read More <ArrowRight size={14} />
                                            </button>
                                            {isJob && (
                                                <button
                                                    onClick={() => setApplying(item)}
                                                    className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-400 transition-all shadow-lg shadow-blue-500/20 whitespace-nowrap"
                                                >
                                                    Apply Now
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>

            <AnimatePresence>
                {selected && <AnnouncementModal item={selected} onClose={() => setSelected(null)} onApply={(job) => setApplying(job)} />}
                {applying && <ApplyModal job={applying} onClose={() => setApplying(null)} />}
            </AnimatePresence>
        </div>
    );
};

export default OffersPage;
