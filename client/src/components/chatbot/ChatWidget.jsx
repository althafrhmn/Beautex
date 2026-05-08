import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Sparkles, Bot, User, MapPin, Star } from 'lucide-react';
import { INITIAL_MESSAGE, CHAT_RESPONSES } from './chatLogic';
import api from '../../utils/api';

const ChatWidget = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([INITIAL_MESSAGE]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Hide on admin and staff routes
    if (location.pathname.startsWith('/admin') || location.pathname.startsWith('/staff')) {
        return null;
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const fetchTopSalon = async () => {
        try {
            const res = await api.get('/salons');
            const salons = res.data.salons || [];
            if (salons.length === 0) return "Currently, there are no salons available on the network.";
            
            // Find top rated (or highest rating fallback)
            const topSalon = salons.reduce((prev, current) => {
                const prevRating = prev.rating_average > 0 ? prev.rating_average : (prev.rating || 0);
                const currRating = current.rating_average > 0 ? current.rating_average : (current.rating || 0);
                return (currRating > prevRating) ? current : prev;
            });

            const displayRating = topSalon.rating_average > 0 ? topSalon.rating_average : (topSalon.rating || 0);
            return `🏆 The most rated shop right now is **${topSalon.name}** in ${topSalon.city || 'your area'}, with a stunning rating of ${displayRating}⭐.`;
        } catch (error) {
            return "Oops! I'm having trouble checking the database right now. Please try again later.";
        }
    };

    const fetchCheapestService = async () => {
        try {
            const res = await api.get('/salons');
            const salons = res.data.salons || [];
            
            let cheapest = null;
            salons.forEach(salon => {
                if (salon.services) {
                    Object.values(salon.services).forEach(serviceArr => {
                        serviceArr.forEach(srv => {
                            if (!cheapest || srv.price < cheapest.price) {
                                cheapest = { ...srv, salonName: salon.name };
                            }
                        });
                    });
                }
            });

            if (!cheapest) return "I couldn't find any pricing data right now.";
            return `💸 The most affordable service right now is **${cheapest.name}** at **${cheapest.salonName}**, starting at just **₹${cheapest.price}**!`;
        } catch (error) {
            return "Oops! I'm having trouble checking the prices right now. Please try again later.";
        }
    };

    const fetchLatestOffer = async () => {
        try {
            const res = await api.get('/announcements');
            const announcements = res.data.announcements || [];
            const offers = announcements.filter(a => a.type === 'offer');
            
            if (offers.length === 0) return "There are no special offers active right now. Check back soon!";
            
            // Assuming they are sorted by created_at descending from the backend
            const latest = offers[0];
            return `🎉 **LATEST OFFER:**\n**${latest.title}**\n${latest.content}\n\n*Head over to the Offers page to claim it!*`;
        } catch (error) {
            return "Oops! I'm having trouble checking the offers right now. Please try again later.";
        }
    };

    const handleOptionClick = async (option) => {
        // 1. Add user's selected option as a message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'user',
            text: option.label
        }]);

        // Remove options from previous message to keep chat clean
        setMessages(prev => {
            const newMsgs = [...prev];
            // Fix: Create a new object for the previous message instead of mutating the reference
            const prevMsgIndex = newMsgs.length - 2;
            if (prevMsgIndex >= 0 && newMsgs[prevMsgIndex] && newMsgs[prevMsgIndex].options) {
                newMsgs[prevMsgIndex] = { ...newMsgs[prevMsgIndex], options: null };
            }
            return newMsgs;
        });

        setIsTyping(true);

        // Simulate thinking delay
        setTimeout(async () => {
            if (option.id === 'back') {
                setMessages(prev => [...prev, { ...INITIAL_MESSAGE, id: Date.now().toString() }]);
                setIsTyping(false);
                return;
            }

            const responseConfig = CHAT_RESPONSES[option.id];
            
            if (!responseConfig) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    sender: 'bot',
                    text: "I'm not sure how to answer that yet!",
                    options: [{ id: 'back', label: '⬅️ Back to start' }]
                }]);
                setIsTyping(false);
                return;
            }

            // Handle standard vs dynamic response
            let finalMessageText = responseConfig.text;
            
            if (responseConfig.isDynamic) {
                if (responseConfig.dynamicType === 'fetch_top_salon') {
                    const dynamicText = await fetchTopSalon();
                    finalMessageText = `${responseConfig.text}\n\n${dynamicText}`;
                } else if (responseConfig.dynamicType === 'fetch_cheapest') {
                    const dynamicText = await fetchCheapestService();
                    finalMessageText = `${responseConfig.text}\n\n${dynamicText}`;
                } else if (responseConfig.dynamicType === 'fetch_latest_offer') {
                    const dynamicText = await fetchLatestOffer();
                    finalMessageText = `${responseConfig.text}\n\n${dynamicText}`;
                }
            }

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'bot',
                text: finalMessageText,
                options: responseConfig.options
            }]);
            setIsTyping(false);

        }, 800);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[999] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute bottom-20 right-0 w-[350px] h-[500px] max-h-[80vh] bg-[#0A0A0A] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="bg-[#111] p-5 border-b border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                    <Sparkles size={18} className="text-emerald-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black uppercase tracking-widest text-xs">Beubot</h3>
                                    <p className="text-emerald-400/70 text-[9px] font-bold uppercase tracking-wider">Online</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
                            {messages.map((msg, idx) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                                    {msg.sender === 'bot' && (
                                        <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mr-2 mt-1 flex-none">
                                            <Bot size={12} className="text-emerald-400" />
                                        </div>
                                    )}
                                    
                                    <div className={`max-w-[80%] ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm' : 'bg-white/5 text-gray-200 border border-white/5 rounded-2xl rounded-tl-sm'} p-4 text-sm font-medium leading-relaxed`}>
                                        {/* Render bold text simply */}
                                        <div dangerouslySetInnerHTML={{ __html: msg.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }} />
                                        
                                        {msg.options && (
                                            <div className="mt-4 flex flex-col gap-2">
                                                {msg.options.map(opt => (
                                                    <button
                                                        key={opt.id}
                                                        onClick={() => handleOptionClick(opt)}
                                                        className="w-full text-left px-4 py-2.5 bg-black/40 hover:bg-emerald-500/20 border border-white/5 hover:border-emerald-500/40 rounded-xl text-xs font-bold text-gray-300 hover:text-emerald-300 transition-all"
                                                    >
                                                        {opt.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {msg.sender === 'user' && (
                                        <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center ml-2 mt-1 flex-none">
                                            <User size={12} className="text-white" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 mr-2 mt-1 flex-none">
                                        <Bot size={12} className="text-emerald-400" />
                                    </div>
                                    <div className="bg-white/5 text-gray-200 border border-white/5 rounded-2xl rounded-tl-sm p-4 text-sm flex items-center gap-1">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-500 rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-colors ${isOpen ? 'bg-gray-800 text-white border border-white/10' : 'bg-emerald-500 text-white shadow-emerald-500/25'}`}
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
            </motion.button>
        </div>
    );
};

export default ChatWidget;
