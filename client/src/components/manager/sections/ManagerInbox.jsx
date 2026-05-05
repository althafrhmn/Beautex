import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Send, MessageSquare, Info, AlertCircle, Clock, Search, User, Filter, MailOpen, Inbox, ChevronRight, X } from 'lucide-react';
import api from '../../../utils/api';

const STATUS_COLORS = {
    'Pending': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    'In Progress': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'Responded': 'bg-[#00D1FF]/10 text-[#00D1FF] border-[#00D1FF]/20',
    'Resolved': 'bg-gray-500/10 text-gray-400 border-gray-500/20'
};

const ManagerInbox = () => {
    const { user } = useSelector((state) => state.auth);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMsg, setSelectedMsg] = useState(null);
    const [filter, setFilter] = useState('All');
    const [reply, setReply] = useState('');
    const [sending, setSending] = useState(false);
    const [showComposer, setShowComposer] = useState(false);
    const [newMsg, setNewMsg] = useState({ subject: '', content: '', category: 'General Support', receiver_id: null });

    useEffect(() => {
        if (user?.id) fetchMessages();
    }, [user?.id]);

    const fetchMessages = async () => {
        try {
            // Fetch messages from our secure API (which handles RLS/Admin logic on the server)
            const res = await api.get('/communications/my');
            setMessages(res.data.communications || []);
        } catch (err) {
            console.error('Fetch inbox error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!reply.trim()) return;
        setSending(true);
        try {
            // Update status and "Read" receipt
            await api.put(`/communications/${selectedMsg.id}`, { 
                status: 'Responded',
                is_read: true 
            });
            setReply('');
            fetchMessages();
            alert('Response recorded. Support team notified.');
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
            // Owners send messages to "All Admins" (receiver_id = null)
            const payload = { ...newMsg, salon_id: user.assigned_shop };
            await api.post('/communications', payload);
            setShowComposer(false);
            setNewMsg({ subject: '', content: '', category: 'General Support', receiver_id: null });
            fetchMessages();
            alert('Your request has been dispatched to the Platform Administration.');
        } catch (err) {
            console.error('Error creating request:', err);
        } finally {
            setSending(false);
        }
    };

    const categories = ['All', 'General Support', 'Ad/Promotion Request', 'New Stylist Request', 'Contract Renewal', 'Billing Issue'];
    const filtered = filter === 'All' ? messages : messages.filter(m => m.category === filter);

    return (
        <div className="h-[calc(100vh-220px)] flex flex-col gap-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-[#141414] border border-[#2A2A2A] rounded-3xl px-8 py-6">
               <div>
                  <h3 className="text-xl font-black text-white tracking-widest uppercase">B2B <span className="text-[#00D1FF]">Command Center</span></h3>
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.35rem]">Partner Network Official Communications</p>
               </div>
               <div className="flex gap-2">
                  <button 
                     onClick={() => setShowComposer(true)}
                     className="px-6 py-2 bg-[#00D1FF] hover:bg-white text-[#050505] rounded-xl font-black text-[9px] uppercase tracking-widest transition-all shadow-lg shadow-[#00D1FF]/10 mr-4"
                  >
                     + New Request
                  </button>
                  {categories.map(cat => (
                      <button 
                         key={cat} onClick={() => setFilter(cat)}
                         className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filter === cat ? 'bg-[#00D1FF] border-[#00D1FF] text-[#050505]' : 'bg-transparent border-white/5 text-gray-500'}`}
                      >
                          {cat}
                      </button>
                  ))}
               </div>
            </div>

            <div className="flex-1 flex gap-6 overflow-hidden">
                {/* List View */}
                <div className="w-[380px] bg-[#141414] border border-[#2A2A2A] rounded-[2.5rem] flex flex-col overflow-hidden">
                    <div className="p-4 overflow-y-auto space-y-2 custom-scrollbar">
                        {loading ? (
                             <div className="text-center py-10 opacity-20">Scanning Network...</div>
                        ) : filtered.length === 0 ? (
                             <div className="text-center py-20 opacity-30">
                                <Inbox size={32} className="mx-auto mb-2" />
                                <p className="text-[10px] font-black uppercase tracking-widest">No Active Dispatch</p>
                             </div>
                        ) : (
                            filtered.map(m => (
                                <button 
                                    key={m.id} onClick={() => setSelectedMsg(m)}
                                    className={`w-full text-left p-6 rounded-[2rem] border transition-all relative ${selectedMsg?.id === m.id ? 'bg-[#00D1FF] border-[#00D1FF] text-[#050505] shadow-lg shadow-[#00D1FF]/10' : 'bg-transparent border-transparent hover:bg-white/5'}`}
                                >
                                    <div className="flex justify-between items-center mb-2">
                                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border ${selectedMsg?.id === m.id ? 'bg-black/10 border-black/10' : STATUS_COLORS[m.status]}`}>
                                            {m.status}
                                        </span>
                                        <span className={`text-[8px] font-black uppercase tracking-tighter ${selectedMsg?.id === m.id ? 'text-black/50' : 'text-gray-600'}`}>
                                            {new Date(m.created_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h4 className={`text-sm font-black tracking-tight mb-1 truncate ${selectedMsg?.id === m.id ? 'text-black' : 'text-gray-200'}`}>
                                        {m.subject}
                                    </h4>
                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${selectedMsg?.id === m.id ? 'text-black/70' : 'text-gray-600'}`}>
                                        {m.category}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 bg-[#141414] border border-[#2A2A2A] rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
                    {selectedMsg ? (
                        <>
                            <div className="p-10 border-b border-white/5 bg-gradient-to-br from-[#1A1A1A] to-[#141414]">
                               <div className="flex justify-between items-start mb-6">
                                   <div className="flex items-center gap-4">
                                       <div className="w-16 h-16 rounded-3xl bg-[#00D1FF]/10 border border-[#00D1FF]/20 flex items-center justify-center text-2xl font-black text-[#00D1FF] uppercase italic">
                                           {selectedMsg.sender?.full_name?.[0] || 'A'}
                                       </div>
                                       <div>
                                           <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">{selectedMsg.subject}</h3>
                                           <p className="text-[10px] text-[#00D1FF] font-black uppercase tracking-[0.3rem]">Partner Communication</p>
                                       </div>
                                   </div>
                               </div>
                               <div className="flex gap-4">
                                   <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Sent By: </span>
                                       <span className="text-[10px] font-black text-white uppercase tracking-tighter italic ml-1">Platform Adminstrator</span>
                                   </div>
                                   <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                       <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Category: </span>
                                       <span className="text-[10px] font-black text-white uppercase tracking-tighter italic ml-1">{selectedMsg.category}</span>
                                   </div>
                               </div>
                            </div>
                            <div className="flex-1 p-10 overflow-y-auto bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]">
                                <div className="bg-[#1A1A1A] border border-white/5 rounded-[3rem] p-10 shadow-2xl">
                                    <p className="text-gray-300 leading-relaxed italic text-sm whitespace-pre-wrap">{selectedMsg.content}</p>
                                </div>
                            </div>
                            <div className="p-10 border-t border-white/5 bg-[#111] flex flex-col gap-4">
                                <div className="relative group">
                                    <textarea 
                                        className="w-full bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-6 text-sm text-white focus:outline-none focus:border-[#00D1FF]/50 transition-all min-h-[100px] resize-none pr-32"
                                        placeholder={`Reply to Platform Administrator...`}
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                    />
                                    <div className="absolute right-6 bottom-6">
                                        <button 
                                            onClick={handleSend}
                                            disabled={sending || !reply.trim()}
                                            className="bg-[#00D1FF] hover:bg-white text-[#050505] p-4 rounded-2xl flex items-center justify-center transition-all disabled:opacity-20 shadow-xl shadow-[#00D1FF]/10"
                                        >
                                            <Send size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center font-black uppercase tracking-[0.3rem] text-[9px] text-gray-700 italic">
                                    <span>Reference ID: {selectedMsg.id.split('-')[0]}</span>
                                    <span>Authenticated by BeauteX B2B Gateway</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center opacity-30">
                            <MailOpen size={40} className="mb-4" />
                            <h3 className="text-xl font-black text-white uppercase tracking-widest italic">Encrypted Connection Ready</h3>
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3rem]">Select official notice to decrypt</p>
                        </div>
                    )}
            </div>
            </div>
            {/* Composer Modal Overlay */}
            {showComposer && (
                <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowComposer(false)} />
                    <div className="relative w-full max-w-lg bg-[#141414] border border-[#00D1FF]/20 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">New <span className="text-[#00D1FF]">Request</span></h2>
                            <button onClick={() => setShowComposer(false)} className="text-gray-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleNewMessage} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Request Priority / Category</label>
                                <div className="flex flex-wrap gap-2">
                                    {categories.filter(c => c !== 'All').map(cat => (
                                        <button 
                                            key={cat} type="button"
                                            onClick={() => setNewMsg(p => ({ ...p, category: cat }))}
                                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${newMsg.category === cat ? 'bg-[#00D1FF] border-[#00D1FF] text-[#050505]' : 'bg-transparent border-white/5 text-gray-500 hover:border-gray-700'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-[#00D1FF]">Recipient: Platform Administrator</label>
                                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl text-[10px] font-black uppercase text-gray-400 italic">
                                    Your request will be routed to the SuperAdmin for processing.
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Subject</label>
                                <input 
                                    type="text" required
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00D1FF]/50"
                                    placeholder="Brief summary of your request..."
                                    value={newMsg.subject}
                                    onChange={(e) => setNewMsg(p => ({ ...p, subject: e.target.value }))}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Content</label>
                                <textarea 
                                    required
                                    className="w-full bg-[#1A1A1A] border border-white/5 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-[#00D1FF]/50 min-h-[150px] resize-none"
                                    placeholder="Describe your request in detail..."
                                    value={newMsg.content}
                                    onChange={(e) => setNewMsg(p => ({ ...p, content: e.target.value }))}
                                />
                            </div>

                            <button 
                                type="submit"
                                disabled={sending}
                                className="w-full py-5 bg-[#00D1FF] hover:bg-white text-[#050505] rounded-[2rem] text-xs font-black uppercase tracking-[0.3rem] transition-all disabled:opacity-20 shadow-xl shadow-[#00D1FF]/20"
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

export default ManagerInbox;
