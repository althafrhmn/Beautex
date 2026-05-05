import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const slides = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=1920",
        headline: "A Legacy of Elegance",
        tagline: "Experience the pinnacle of luxury hair and beauty aesthetics in a space designed for transformation."
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1522337660859-02fbefca4ffc?auto=format&fit=crop&q=80&w=1920",
        headline: "Masterful Artistry",
        tagline: "Where every stroke is a masterpiece. Discover world-class styling tailored to your unique identity."
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=1920",
        headline: "Radiant Rejuvenation",
        tagline: "Unlock your natural glow with our medical-grade skincare rituals and advanced wellness treatments."
    },
    {
        id: 4,
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=1920",
        headline: "Defined by Precision",
        tagline: "The gold standard of beauty. Meticulous care for those who demand nothing but perfection."
    }
];

const HomeHeroSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const navigate = useNavigate();

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    };

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(nextSlide, 5000);
        }
        return () => clearInterval(interval);
    }, [isAutoPlaying, nextSlide]);

    return (
        <div className="relative w-full h-[85vh] md:h-[100vh] overflow-hidden bg-[#050505]">
            <AnimatePresence initial={false} mode="wait">
                <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Image with Custom Multi-layer Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent z-10" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
                    <img
                        src={slides[currentIndex].image}
                        alt={slides[currentIndex].headline}
                        className="w-full h-full object-cover opacity-80"
                    />

                    {/* Content */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center">
                        <div className="max-w-7xl mx-auto px-6 w-full text-center">
                            <motion.div
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="inline-block px-4 py-1.5 rounded-full bg-[#00E6A0]/10 border border-[#00E6A0]/20 text-[#00E6A0] text-[10px] font-black uppercase tracking-[0.3em] mb-8"
                            >
                                Premium Experience
                            </motion.div>

                            <motion.h2
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.7, duration: 0.8 }}
                                className="text-6xl md:text-[8rem] font-black text-white tracking-tighter leading-[0.85] mb-8"
                            >
                                {slides[currentIndex].headline.split(' ').map((word, i) => (
                                    <span key={i} className={i === slides[currentIndex].headline.split(' ').length - 1 ? 'text-[#00E6A0]' : ''}>
                                        {word}{' '}
                                    </span>
                                ))}
                            </motion.h2>

                            <motion.p
                                initial={{ x: -30, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9, duration: 0.8 }}
                                className="text-lg md:text-xl text-gray-500 max-w-xl font-medium leading-relaxed italic"
                            >
                                {slides[currentIndex].tagline}
                            </motion.p>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>



            {/* Navigation Elements */}
            <div className="absolute bottom-12 right-12 z-50 flex items-center gap-6">
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`transition-all duration-500 rounded-full h-1.5 ${currentIndex === idx ? 'w-10 bg-[#00E6A0]' : 'w-2 bg-white/10 hover:bg-white/20'}`}
                        />
                    ))}
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-white hover:bg-[#00E6A0] hover:text-[#050505] transition-all shadow-sm"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-2xl bg-[#0A0A0A] border border-white/5 flex items-center justify-center text-white hover:bg-[#00E6A0] hover:text-[#050505] transition-all shadow-sm"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HomeHeroSlider;
