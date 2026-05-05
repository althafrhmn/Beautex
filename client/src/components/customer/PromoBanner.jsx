import React from 'react';
import { motion } from 'framer-motion';
import { Tag, Briefcase, Info, ArrowRight, ExternalLink } from 'lucide-react';

const PromoBanner = ({ announcement }) => {
    if (!announcement) return null;

    const { type, title, content, image_url, link_url } = announcement;

    const styles = {
        offer: {
            bg: 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10',
            image: '/offer_banner_bg_1777917172013.png',
            border: 'border-emerald-500/30',
            icon: <Tag className="text-emerald-400" size={20} />,
            accent: 'text-emerald-400',
            btn: 'bg-emerald-500 hover:bg-emerald-600'
        },
        job: {
            bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/10',
            image: '/job_banner_bg_1777917187923.png',
            border: 'border-blue-500/30',
            icon: <Briefcase className="text-blue-400" size={20} />,
            accent: 'text-blue-400',
            btn: 'bg-blue-500 hover:bg-blue-600'
        },
        announcement: {
            bg: 'bg-gradient-to-r from-amber-500/20 to-orange-500/10',
            image: null,
            border: 'border-amber-500/30',
            icon: <Info className="text-amber-400" size={20} />,
            accent: 'text-amber-400',
            btn: 'bg-amber-500 hover:bg-amber-600'
        }
    };

    const currentStyle = styles[type] || styles.announcement;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-[2.5rem] border ${currentStyle.border} ${currentStyle.bg} backdrop-blur-xl p-8 group min-h-[300px] flex items-center`}
        >
            {/* Background Image Layer */}
            {currentStyle.image && (
                <div className="absolute inset-0 z-0">
                    <img src={currentStyle.image} className="w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform duration-1000" alt="" />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                </div>
            )}

            {/* Background Decorative Element */}
            <div className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[100px] opacity-20 ${currentStyle.bg.split(' ')[1]}`}></div>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                {image_url && (
                    <div className="w-full md:w-48 h-48 rounded-3xl overflow-hidden shadow-2xl">
                        <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    </div>
                )}
                
                <div className="flex-1 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                        <div className={`p-2 rounded-xl ${currentStyle.bg} border ${currentStyle.border}`}>
                            {currentStyle.icon}
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.3em] ${currentStyle.accent}`}>
                            {type === 'job' ? 'Career Opportunity' : type === 'offer' ? 'Limited Time Offer' : 'Announcement'}
                        </span>
                    </div>
                    
                    <h2 className="text-3xl font-black text-white mb-3 tracking-tight italic uppercase">
                        {title}
                    </h2>
                    
                    <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-2xl">
                        {content}
                    </p>
                </div>

                {link_url && (
                    <a 
                        href={link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`px-8 py-4 rounded-2xl text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 shadow-lg ${currentStyle.btn}`}
                    >
                        Learn More
                        <ExternalLink size={16} />
                    </a>
                )}
            </div>
        </motion.div>
    );
};

export default PromoBanner;
