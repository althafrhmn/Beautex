import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, Sparkles } from 'lucide-react';
import slide1 from '../../assets/hero/slide1.png';
import slide2 from '../../assets/hero/slide2.png';
import slide3 from '../../assets/hero/slide3.png';

const slides = [
    {
        id: 1,
        image: slide1,
        headline: "Exquisite Hair Artistry",
        subtext: "Unleash your inner radiance with our master stylists. Experience the pinnacle of hair care Luxury.",
        offer: "PREMIUM CUT & STYLE",
        cta: "Book Appointment"
    },
    {
        id: 2,
        image: slide2,
        headline: "The Radiant Skin Ritual",
        subtext: "Indulge in our signature beauty-infused facials. Rejuvenate your skin with the ultimate spa experience.",
        offer: "20% OFF FIRST FACIAL",
        cta: "Book Now"
    },
    {
        id: 3,
        image: slide3,
        headline: "Timeless Elegance & Glamour",
        subtext: "From bridal glam to red carpet looks, our experts define beauty with precision and style.",
        offer: "RED CARPET READY",
        cta: "Schedule Visit"
    }
];

const HeroCarousel = ({ onBookNow, onViewServices }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide();
        }, 6000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    const nextSlide = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
            scale: 1.1
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
            }
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
            scale: 0.9,
            transition: {
                duration: 0.8,
                ease: [0.4, 0, 0.2, 1]
            }
        })
    };

    const textVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: {
                delay: 0.5 + i * 0.1,
                duration: 0.8,
                ease: "easeOut"
            }
        })
    };

    return (
        <div className="relative w-full h-[100vh] overflow-hidden bg-[#050505] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            <AnimatePresence initial={false} custom={direction}>
                <motion.div
                    key={currentIndex}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="absolute inset-0 w-full h-full"
                >
                    {/* Background Image with Gradient Overlay */}
                    <div className="absolute inset-0">
                        <img
                            src={slides[currentIndex].image}
                            alt={slides[currentIndex].headline}
                            className="w-full h-full object-cover object-top filter brightness-50 scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                            <div className="max-w-3xl">
                                <motion.div
                                    custom={0}
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex items-center gap-3 mb-8"
                                >
                                    <span className="h-[2px] w-12 bg-[#00E6A0]" />
                                    <span className="text-[#00E6A0] font-black tracking-[0.4em] text-xs uppercase flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> {slides[currentIndex].offer}
                                    </span>
                                </motion.div>

                                <motion.h1
                                    custom={1}
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-7xl md:text-9xl font-black text-white mb-8 leading-[0.9] tracking-tighter"
                                >
                                    {slides[currentIndex].headline.split(' ').map((word, i) => (
                                        <span key={i} className={(word.toLowerCase() === 'artistry' || word.toLowerCase() === 'ritual' || word.toLowerCase() === 'glamour' || word.toLowerCase() === 'skin') ? "text-[#00E6A0] italic font-medium" : ""}>
                                            {word}{' '}
                                        </span>
                                    ))}
                                </motion.h1>

                                <motion.p
                                    custom={2}
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="text-xl text-gray-500 mb-12 leading-relaxed font-medium italic max-w-xl"
                                >
                                    {slides[currentIndex].subtext}
                                </motion.p>

                                <motion.div
                                    custom={3}
                                    variants={textVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className="flex items-center gap-6"
                                >
                                    <button
                                        onClick={onBookNow}
                                        className="group relative px-10 py-5 bg-[#00E6A0] overflow-hidden rounded-2xl transition-all active:scale-95 shadow-2xl shadow-[#00E6A0]/20"
                                    >
                                        <span className="relative flex items-center gap-3 text-[#050505] font-black text-xs uppercase tracking-[0.2em]">
                                            <Calendar className="w-5 h-5" /> {slides[currentIndex].cta}
                                        </span>
                                    </button>

                                    <button
                                        onClick={onViewServices}
                                        className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all border border-white/5 backdrop-blur-md"
                                    >
                                        View Services
                                    </button>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl border border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-center text-white hover:bg-[#00E6A0] hover:text-[#050505] transition-all z-20 group"
            >
                <ChevronLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-8 top-1/2 -translate-y-1/2 w-16 h-16 rounded-2xl border border-white/5 bg-[#0A0A0A]/80 backdrop-blur-xl flex items-center justify-center text-white hover:bg-[#00E6A0] hover:text-[#050505] transition-all z-20 group"
            >
                <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Indicators */}
            <div className="absolute bottom-12 left-12 flex items-center gap-4 z-20">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            setDirection(index > currentIndex ? 1 : -1);
                            setCurrentIndex(index);
                        }}
                        className="group relative w-12 h-1 focus:outline-none"
                    >
                        <div className={`absolute inset-0 rounded-full transition-all duration-500 ${index === currentIndex ? "bg-[#00E6A0] w-full" : "bg-white/10 w-4 group-hover:bg-white/20"}`} />
                    </button>
                ))}
            </div>

            {/* Subtle Mint Dust Overlay */}
            <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-20">
                <div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#00E6A015_0%,_transparent_50%)] animate-pulse" />
            </div>
        </div>
    );
};

export default HeroCarousel;
