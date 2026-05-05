import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Megaphone, Plus, Trash2, Tag, Briefcase, Info, Loader2, Image as ImageIcon, Link as LinkIcon, Calendar } from 'lucide-react';
import api from '../../../utils/api';

const AnnouncementManager = () => {
    const { user } = useSelector((state) => state.auth);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'offer',
        image_url: '',
        link_url: '',
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
        setSubmitting(true);
        try {
            await api.post('/announcements', {
                ...formData,
                salon_id: user.assigned_shop
            });
            setShowForm(false);
            setFormData({ title: '', content: '', type: 'offer', image_url: '', link_url: '', end_date: '' });
            fetchAnnouncements();
        } catch (error) {
            console.error('Error creating announcement:', error);
            alert('Failed to create announcement');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to remove this announcement?')) return;
        try {
            await api.delete(`/announcements/${id}`);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
            alert('Failed to delete');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Announcement <span className="text-[#00E6A0]">Station</span></h2>
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Broadcast offers and job openings to your clients</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-[#00E6A0] text-[#050505] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#00E6A0]/20"
                >
                    {showForm ? 'Cancel' : <><Plus size={16} /> New Broadcast</>}
                </button>
            </div>

            {showForm && (
                <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <form onSubmit={handleCreate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Broadcast Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50 appearance-none italic font-black uppercase"
                                >
                                    <option value="offer">Special Offer</option>
                                    <option value="job">Job Opening</option>
                                    <option value="announcement">General Announcement</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Headline</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="E.G. 20% OFF ALL HAIR CUTS"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50 italic font-black"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Details</label>
                            <textarea
                                required
                                rows="3"
                                placeholder="Describe your offer or job role in detail..."
                                value={formData.content}
                                onChange={(e) => setFormData({...formData, content: e.target.value})}
                                className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50 italic font-medium"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2"><ImageIcon size={12}/> Image URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.image_url}
                                    onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2"><LinkIcon size={12}/> Link URL</label>
                                <input
                                    type="url"
                                    placeholder="https://..."
                                    value={formData.link_url}
                                    onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2 flex items-center gap-2"><Calendar size={12}/> Expiry Date</label>
                                <input
                                    type="date"
                                    value={formData.end_date}
                                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-4 bg-[#00E6A0] text-[#050505] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : 'Launch Broadcast'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-20 flex justify-center">
                        <Loader2 className="animate-spin text-[#00E6A0]" size={40} />
                    </div>
                ) : announcements.length === 0 ? (
                    <div className="bg-[#111] border border-dashed border-white/10 rounded-[2.5rem] py-20 text-center">
                        <Megaphone size={48} className="mx-auto text-gray-700 mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No active broadcasts</p>
                    </div>
                ) : (
                    announcements.map((ann) => (
                        <div key={ann.id} className="bg-[#111] border border-white/5 rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-[#00E6A0]/30 transition-all">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                                ann.type === 'offer' ? 'bg-emerald-500/10 text-emerald-400' : 
                                ann.type === 'job' ? 'bg-blue-500/10 text-blue-400' : 'bg-amber-500/10 text-amber-400'
                            }`}>
                                {ann.type === 'offer' ? <Tag /> : ann.type === 'job' ? <Briefcase /> : <Info />}
                            </div>
                            
                            <div className="flex-1 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                                    <h3 className="text-lg font-black text-white italic uppercase tracking-tight">{ann.title}</h3>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                                        ann.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' :
                                        ann.status === 'rejected' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        {ann.status || 'pending'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500 font-medium line-clamp-1">{ann.content}</p>
                                {ann.status === 'rejected' && ann.rejection_reason && (
                                    <p className="text-[10px] text-red-400/60 font-bold mt-2 italic flex items-center gap-1">
                                        <AlertCircle size={10} /> REASON: {ann.rejection_reason}
                                    </p>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => handleDelete(ann.id)}
                                    className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AnnouncementManager;
