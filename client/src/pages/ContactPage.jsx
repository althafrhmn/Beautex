import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Phone, Mail, MapPin, MessageSquare, 
    Clock, Send, Globe, Instagram, 
    Twitter, Facebook, Sparkles, ChevronRight
} from 'lucide-react';

const ContactPage = () => {
    useEffect(() => {
        document.title = "Beautex | Luxury Concierge & Contact";
        window.scrollTo(0, 0);
    }, []);

    const phoneNumber = "9961876122";
    const email = "contact@beautex.com";
    const location = "Calicut, Kerala";
    const businessName = "Beautex";

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Your transmission has been received. Our concierge will respond within 24 hours.");
    };

    return (
        <div className="min-h-screen bg-[#050505] pt-32 pb-20 font-sans selection:bg-[#00E6A0]/20 text-white">
            <div className="max-w-7xl mx-auto px-6">
                {/* Hero Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start gap-16 mb-40">
                    <div className="max-w-2xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-3 text-[#00E6A0] font-black uppercase tracking-[0.4em] text-[10px] mb-8"
                        >
                            <Sparkles size={14} /> Global Presence
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-none mb-12"
                        >
                            The <span className="text-[#00E6A0]">Identity</span> <br /> 
                            <span className="text-gray-500 font-medium italic">Concierge</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-gray-500 text-xl font-medium leading-relaxed italic max-w-xl"
                        >
                            Beautex is more than just a service—it is a sanctuary for self-expression. 
                            We connect discerning individuals with the world's most elite styling 
                            architects and luxury grooming ritual spaces.
                        </motion.p>
                    </div>

                    {/* Direct Contact Cards */}
                    <div className="w-full lg:w-[450px] space-y-4">
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] hover:border-[#00E6A0]/20 transition-all relative overflow-hidden group"
                        >
                            <div className="absolute -top-10 -right-10 p-8 text-[#00E6A0] opacity-[0.03] group-hover:opacity-10 transition-opacity"><Phone size={120} /></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E6A0] mb-4">Voice Communication</h4>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-black text-white">+{phoneNumber}</p>
                                <a href={`tel:${phoneNumber}`} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#00E6A0] hover:text-black transition-all">
                                    <Phone size={20} />
                                </a>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] hover:border-[#00E6A0]/20 transition-all relative overflow-hidden group"
                        >
                            <div className="absolute -top-10 -right-10 p-8 text-[#00E6A0] opacity-[0.03] group-hover:opacity-10 transition-opacity"><MessageSquare size={120} /></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E6A0] mb-4">Digital Messaging</h4>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-black text-white">WhatsApp Direct</p>
                                <a href={`https://wa.me/${phoneNumber}`} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#25D366] transition-all">
                                    <MessageSquare size={20} />
                                </a>
                            </div>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="p-8 bg-[#0A0A0A] border border-white/5 rounded-[2.5rem] hover:border-[#00E6A0]/20 transition-all relative overflow-hidden group"
                        >
                            <div className="absolute -top-10 -right-10 p-8 text-[#00E6A0] opacity-[0.03] group-hover:opacity-10 transition-opacity"><Mail size={120} /></div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E6A0] mb-4">Corporate Inquiries</h4>
                            <div className="flex items-center justify-between">
                                <p className="text-2xl font-black text-white">{email}</p>
                                <a href={`mailto:${email}`} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center hover:bg-[#00E6A0] hover:text-black transition-all">
                                    <Mail size={20} />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Form and Map Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32">
                    {/* Concierge Form */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-[#0A0A0A] border border-white/5 rounded-[3.5rem] p-12 lg:p-20 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 text-gray-500 font-bold mb-8">
                                <Clock size={16} className="text-[#00E6A0]" />
                                <span className="text-[10px] uppercase tracking-widest">We respond within 24 hours</span>
                            </div>
                            <h2 className="text-4xl font-black text-white mb-12 tracking-tight">Personal Intake</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] ml-4">Identity</label>
                                    <input 
                                        type="text" 
                                        placeholder="Your Full Name" 
                                        required 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-[#00E6A0]/30 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] ml-4">Digital Channel</label>
                                    <input 
                                        type="email" 
                                        placeholder="email@example.com" 
                                        required 
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-8 py-5 text-white outline-none focus:border-[#00E6A0]/30 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#00E6A0] ml-4">Aesthetic Requirement</label>
                                    <textarea 
                                        placeholder="How can we assist your transformation?" 
                                        required 
                                        rows="4"
                                        className="w-full bg-white/5 border border-white/5 rounded-[2rem] px-8 py-6 text-white outline-none focus:border-[#00E6A0]/30 transition-all font-medium resize-none"
                                    ></textarea>
                                </div>
                                <button className="w-full bg-[#00E6A0] text-[#050505] py-5 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-[#00E6A0]/20 flex items-center justify-center gap-3">
                                    Transmit Inquiry <Send size={18} />
                                </button>
                            </form>
                        </div>
                    </motion.div>

                    {/* Location Preview */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-col gap-8"
                    >
                        <div className="bg-[#0A0A0A] border border-white/5 rounded-[3rem] p-10 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 bg-[#00E6A0]/10 rounded-2xl flex items-center justify-center text-[#00E6A0]"><MapPin size={28} /></div>
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">HQ Location</h4>
                                    <p className="text-xl font-black text-white">{location}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 bg-[#0A0A0A] border border-white/5 rounded-[3.5rem] overflow-hidden relative min-h-[400px] shadow-2xl group">
                            <iframe 
                                title="Beautex Global Location"
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125218.42312674482!2d75.7431263!3d11.2587531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba65938563d4747%3A0x32155714767371de!2sKozhikode%2C%20Kerala!5e0!3m2!1sen!2sin!4v1711900000000!5m2!1sen!2sin"
                                className="w-full h-full grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                                style={{ border: 0 }}
                                allowFullScreen=""
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                            <div className="absolute top-8 left-8 flex items-center gap-3 px-6 py-2.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00E6A0]">
                                <Globe size={14} className="animate-spin-slow" /> Sanctuary View
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Footer Brief */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="pt-20 border-t border-white/5 text-center"
                >
                    <div className="flex items-center justify-center gap-12 opacity-50 filter grayscale pointer-events-none mb-16">
                        <Instagram size={28} />
                        <Twitter size={28} />
                        <Facebook size={28} />
                        <Globe size={28} />
                    </div>
                    <p className="text-gray-600 text-[10px] font-black uppercase tracking-[0.5em]">&copy; 2026 {businessName}. Crafted for the Discerning.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactPage;
