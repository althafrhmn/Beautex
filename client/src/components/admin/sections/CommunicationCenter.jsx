import React, { useState, useEffect } from 'react';
import { Send, MessageSquare, Info, AlertCircle, CheckCircle2, Clock, Filter, Search, User, ChevronRight, Inbox, MailOpen, Plus, X, Store, Mail } from 'lucide-react';
import api from '../../../utils/api';

const CATEGORIES = ['General Support', 'Ad/Promotion Request', 'New Stylist Request', 'Contract Renewal', 'Billing Issue'];
const STATUS_COLORS = {
    'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Responded': 'bg-[#00E6A0]/10 text-[#00E6A0] border-[#00E6A0]/20',
    'Resolved': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

const CommunicationCenter = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [showComposer, setShowComposer] = useState(false);
    const [managers, setManagers] = useState([]);
    const [filter, setFilter] = useState('All');
    const [newMsg, setNewMsg] = useState({ subject: '', content: '', category: 'General Support', receiver_id: '' });

    useEffect(() => {
        fetchMessages();
        fetchManagers();
    }, []);

    const fetchManagers = async () => {
        try {
            // Fetch users with 'manager' role for recipient list
            const res = await api.get('/admin/managers');
            setManagers(res.data.managers || []);
        } catch (err) {
            console.error('Error fetching managers:', err);
        }
    };

    const fetchMessages = async () => {
        try {
            const res = await api.get('/communications/my');
            setMessages(res.data.communications || []);
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/communications/${id}`, { status });
            fetchMessages();
            if (selectedMsg?.id === id) {
                setSelectedMsg(prev => ({ ...prev, status }));
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const handleSend = async () => {
        if (!reply.trim()) return;
        setSending(true);
        try {
            // In this simple system, "Reply" just updates the status to 'Responded' 
            // and we might send a counter-message in a full chat system.
            // For now, we update status and clear reply.
            await api.put(`/communications/${selectedMsg.id}`, { 
                status: 'Responded',
                is_read: true 
            });
            setReply('');
            fetchMessages();
            alert('Response recorded and status updated to Responded.');
        } catch (err) {
            console.error('Error sending reply:', err);
        } finally {
            setSending(false);
        }
    };

    const handleNewMessage = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post('/communications', newMsg);
            setShowComposer(false);
            setNewMsg({ subject: '', content: '', category: 'General Support' });
            fetchMessages();
        } catch (err) {
            console.error('Error creating request:', err);
        } finally {
            setSending(false);
        }
    };

    const filtered = filter === 'All' ? messages : messages.filter(m => m.category === filter);

    return (
        <div className="h-[calc(100vh-180px)] flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-black tracking-tighter text-white">Platform <span className="text-[#00E6A0]">Hub</span></h2>
                    <p className="text-gray-500 text-sm font-medium">B2B support & ad request center</p>
                </div>
                <button 
                    onClick={() => setShowComposer(true)}
                    className="flex items-center gap-2 bg-[#00E6A0] hover:bg-white text-[#050505] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-[#00E6A0]/10"
                >
                    <Plus size={18} /> New Request
                </button>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* Left: Message List */}
                <div className="w-full sm:w-[400px] flex flex-col gap-4">
                    {/* Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {['All', ...CATEGORIES].map(cat => (
                            <button 
                                key={cat}
                                onClick={() => setFilter(cat)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap border transition-all ${filter === cat ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505]' : 'bg-[#1A1A1A] border-[#2A2A2A] text-gray-500 hover:border-gray-700'}`}
                            >
                                {cat.split(' ')[0]}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-[2.5rem] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-white/5 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                                <input 
                                    type="text" 
                                    className="w-full bg-[#0F0F0F] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-xs text-white focus:outline-none focus:border-[#00E6A0]/50" 
                                    placeholder="Search conversations..." 
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center h-48 opacity-20">
                                    <div className="w-8 h-8 border-2 border-[#00E6A0] border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Scanning Network...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-48 text-gray-600">
                                    <Inbox size={32} className="mb-2 opacity-20" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">No active threads</p>
                                </div>
                            ) : (
                                filtered.map(msg => (
                                    <button 
                                        key={msg.id}
                                        onClick={() => setSelectedMsg(msg)}
                                        className={`w-full group text-left p-5 rounded-[2rem] border transition-all relative overflow-hidden ${selectedMsg?.id === msg.id ? 'bg-[#1E1E1E] border-[#00E6A0]/30 shadow-xl' : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'}`}
                                    >
                                        {selectedMsg?.id === msg.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00E6A0]" />}
                                        <div className="flex justify-between items-start mb-2">
                                            <span className={`px-2 py-0.5 rounded-lg text-inherit border text-[9px] font-black uppercase tracking-tighter ${STATUS_COLORS[msg.status]}`}>
                                                {msg.status}
                                            </span>
                                            <span className="text-[9px] text-gray-600 font-bold uppercase tracking-tighter">
                                                {new Date(msg.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <h4 className={`text-sm font-black tracking-tight mb-1 truncate ${selectedMsg?.id === msg.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`}>{msg.subject}</h4>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[8px] font-black text-[#00E6A0] uppercase border border-white/5">
                                                {msg.sender?.full_name?.[0] || 'S'}
                                            </div>
                                            <p className="text-[10px] text-gray-600 font-bold truncate">
                                                {msg.sender?.full_name} {msg.salon && <span className="text-[#00E6A0] ml-1">@{msg.salon.name}</span>} <span className="mx-1 opacity-30">·</span> {msg.category}
                                            </p>
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Message Detail */}
                <div className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
                    {selectedMsg ? (
                        <>
                            {/* Detail Header */}
                            <div className="p-8 border-b border-white/5 bg-gradient-to-r from-[#1A1A1A] to-[#141414]">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-3xl bg-[#00E6A0] flex items-center justify-center text-xl font-black text-[#050505] shadow-lg shadow-[#00E6A0]/20">
                                            {selectedMsg.sender?.full_name?.[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tighter">{selectedMsg.sender?.full_name}</h3>
                                            <p className="text-xs text-[#00E6A0] font-black uppercase tracking-[0.2rem] opacity-70 flex items-center gap-2">
                                                {selectedMsg.sender?.role || 'Partner'} 
                                                <span className="text-gray-600 whitespace-nowrap lowercase font-medium tracking-normal flex items-center gap-1">
                                                    <Mail size={10} /> {selectedMsg.sender?.email}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {['Resolved', 'Pending'].map(st => (
                                            <button 
                                                key={st}
                                                onClick={() => handleStatusUpdate(selectedMsg.id, st)}
                                                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${selectedMsg.status === st ? 'bg-white/10 border-white/20 text-white' : 'border-transparent text-gray-500 hover:text-white'}`}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    <div className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl flex items-center gap-2">
                                        <Filter size={10} className="text-gray-600" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{selectedMsg.category}</span>
                                    </div>
                                    {selectedMsg.salon && (
                                        <div className="px-4 py-2 bg-black/20 border border-[#00E6A0]/20 rounded-xl flex items-center gap-2">
                                            <Store size={10} className="text-[#00E6A0]" />
                                            <span className="text-[9px] font-black text-[#00E6A0] uppercase tracking-widest">
                                                {selectedMsg.salon.name} {selectedMsg.salon.address && <span className="opacity-50 ml-1 text-[8px]">({selectedMsg.salon.address})</span>}
                                            </span>
                                        </div>
                                    )}
                                    <div className="px-4 py-2 bg-black/20 border border-white/5 rounded-xl flex items-center gap-2">
                                        <Clock size={10} className="text-gray-600" />
                                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                            Started {new Date(selectedMsg.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Content */}
                            <div className="flex-1 overflow-y-auto p-10">
                                <div className="max-w-3xl">
                                    <h2 className="text-2xl font-black text-white tracking-tight mb-6">{selectedMsg.subject}</h2>
                                    <div className="bg-[#1A1A1A] border border-white/5 rounded-[2rem] p-8 relative">
                                        <div className="absolute -left-2 top-8 w-4 h-4 bg-[#1A1A1A] border-l border-t border-white/5 rotate-45" />
                                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedMsg.content}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Detail Footer / Reply Box */}
                            <div className="p-8 border-t border-white/5 bg-[#111]">
                                <div className="relative group">
                                    <textarea 
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 transition-all min-h-[120px] resize-none pr-32"
                                        placeholder={`Respond to ${selectedMsg.sender?.full_name}...`}
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                    />
                                    <div className="absolute right-6 bottom-6">
                                        <button 
                                            onClick={handleSend}
                                            disabled={sending || !reply.trim()}
                                            className="bg-[#00E6A0] hover:bg-white text-[#050505] p-4 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 shadow-xl shadow-[#00E6A0]/10 group-hover:scale-105 active:scale-95"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mt-4 text-center">
                                    Replying as <span className="text-[#00E6A0]">Official Platform Admin</span>
                                </p>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-10 opacity-30">
                            <div className="w-24 h-24 rounded-full border border-dashed border-gray-600 flex items-center justify-center mb-6">
                                <MailOpen size={40} className="text-gray-600" />
                            </div>
                            <h3 className="text-xl font-black text-white tracking-widest uppercase mb-2">Select a thread</h3>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3rem]">to start communication</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Composer Modal Overlay */}
            {showComposer && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowComposer(false)} />
                    <div className="relative w-full max-w-lg bg-[#141414] border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tighter">New <span className="text-[#00E6A0]">Request</span></h2>
                            <button onClick={() => setShowComposer(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleNewMessage} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Request Priority / Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button 
                                            key={cat} type="button"
                                            onClick={() => setNewMsg(p => ({ ...p, category: cat }))}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newMsg.category === cat ? 'bg-[#00E6A0] border-[#00E6A0] text-[#050505]' : 'bg-transparent border-white/5 text-gray-500 hover:border-gray-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Target Partner / Shop Owner</label>
                                <select 
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 appearance-none cursor-pointer"
                                    required
                                    value={newMsg.receiver_id}
                                    onChange={(e) => setNewMsg(p => ({ ...p, receiver_id: e.target.value }))}
                                >
                                    <option value="" disabled>Select a Shop Owner / Manager</option>
                                    {managers.length > 0 ? (
                                        managers.map(m => (
                                            <option key={m.id} value={m.id} className="bg-[#1A1A1A]">{m.full_name} ({m.email})</option>
                                        ))
                                    ) : (
                                        <option disabled>No managers discovered in system</option>
                                    )}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50"
                                    placeholder="Brief summary of your request..."
                                    value={newMsg.subject}
                                    onChange={(e) => setNewMsg(p => ({ ...p, subject: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Content</label>
                                <textarea 
                                    required
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00E6A0]/50 min-h-[150px] resize-none"
                                    placeholder="Describe your request in detail..."
                                    value={newMsg.content}
                                    onChange={(e) => setNewMsg(p => ({ ...p, content: e.target.value }))}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-[#00E6A0] hover:bg-white text-[#050505] rounded-[2rem] text-xs font-black uppercase tracking-[0.3rem] transition-all disabled:opacity-20 shadow-xl shadow-[#00E6A0]/20"
                            >
                                {sending ? 'Dispatching...' : 'Dispatch Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CommunicationCenter;
