import React, { useState, useEffect } from 'react';
import { Check, X, Megaphone, Tag, Briefcase, Info, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import api from '../../../utils/api';

const AdminBannerModeration = () => {
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [showRejectModal, setShowRejectModal] = useState(null);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await api.get('/announcements/pending');
            setPending(res.data.announcements || []);
        } catch (error) {
            console.error('Error fetching pending banners:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id, status, reason = '') => {
        setProcessingId(id);
        try {
            await api.patch(`/announcements/${id}/status`, { status, rejection_reason: reason });
            setPending(prev => prev.filter(ann => ann.id !== id));
            setShowRejectModal(null);
            setRejectionReason('');
        } catch (error) {
            console.error('Error updating banner status:', error);
            alert('Action failed');
        } finally {
            setProcessingId(null);
        }
    };

    if (loading) {
        return (
            <div className="py-20 flex justify-center">
                <Loader2 className="animate-spin text-[#00E6A0]" size={40} />
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter">Banner <span className="text-[#00E6A0]">Moderation</span></h2>
                <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">Review and approve banner requests from salon owners</p>
            </div>

            {pending.length === 0 ? (
                <div className="bg-[#111] border border-dashed border-white/10 rounded-[2.5rem] py-20 text-center">
                    <Megaphone size={48} className="mx-auto text-gray-700 mb-4" />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No pending requests at the moment</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {pending.map((ann) => (
                        <div key={ann.id} className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden relative group">
                            {/* Accent line based on type */}
                            <div className={`absolute left-0 top-0 bottom-0 w-2 ${
                                ann.type === 'offer' ? 'bg-emerald-500' : 
                                ann.type === 'job' ? 'bg-blue-500' : 'bg-amber-500'
                            }`} />

                            <div className="flex flex-col lg:flex-row gap-8 items-start">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-xl bg-white/5 border border-white/10 ${
                                            ann.type === 'offer' ? 'text-emerald-400' : 
                                            ann.type === 'job' ? 'text-blue-400' : 'text-amber-400'
                                        }`}>
                                            {ann.type === 'offer' ? <Tag size={20}/> : ann.type === 'job' ? <Briefcase size={20}/> : <Info size={20}/>}
                                        </div>
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Shop ID: {ann.salon_id?.slice(0, 8)}...</span>
                                            <h3 className="text-xl font-black text-white italic uppercase tracking-tight">{ann.title}</h3>
                                        </div>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed bg-white/5 p-4 rounded-2xl italic">
                                        "{ann.content}"
                                    </p>

                                    {ann.link_url && (
                                        <div className="flex items-center gap-2 text-[10px] font-black text-[#00E6A0] uppercase tracking-widest">
                                            <ExternalLink size={12} /> {ann.link_url}
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-3 min-w-[200px]">
                                    <button
                                        disabled={processingId === ann.id}
                                        onClick={() => handleAction(ann.id, 'approved')}
                                        className="w-full py-4 bg-[#00E6A0] text-[#050505] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00E6A0]/10"
                                    >
                                        {processingId === ann.id ? <Loader2 className="animate-spin" /> : <><Check size={16} /> Approve</>}
                                    </button>
                                    <button
                                        disabled={processingId === ann.id}
                                        onClick={() => setShowRejectModal(ann.id)}
                                        className="w-full py-4 bg-white/5 border border-white/10 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <X size={16} /> Reject
                                    </button>
                                </div>
                            </div>

                            {showRejectModal === ann.id && (
                                <div className="mt-6 pt-6 border-t border-white/5 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-2">Rejection Reason</label>
                                    <div className="flex gap-4">
                                        <input
                                            type="text"
                                            placeholder="E.G. Image quality too low, inappropriate content..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="flex-1 bg-black border border-white/10 rounded-xl px-4 text-xs text-white focus:outline-none focus:border-red-500/50 italic font-medium"
                                        />
                                        <button
                                            onClick={() => handleAction(ann.id, 'rejected', rejectionReason)}
                                            disabled={!rejectionReason}
                                            className="px-6 bg-red-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-600 transition-all disabled:opacity-50"
                                        >
                                            Confirm Reject
                                        </button>
                                        <button onClick={() => setShowRejectModal(null)} className="px-4 text-gray-500 text-xs font-black uppercase">Cancel</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminBannerModeration;
