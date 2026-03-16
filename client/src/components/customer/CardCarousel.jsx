import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CardCarousel = ({ services = [] }) => {
    const navigate = useNavigate();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    const defaultSlides = [
        {
            id: 'h1',
            title: "Hair & Artistry",
            desc: "Bespoke cuts and vibrant colors crafted by our master stylists.",
            image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200",
            category: "Hair"
        },
        {
            id: 'm1',
            title: "Elite Grooming",
            desc: "Precision engineering for the modern man. Shaves, sculpts, and style.",
            image: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&q=80&w=1200",
            category: "Grooming"
        },
        {
            id: 's1',
            title: "Dermal Rituals",
            desc: "Transformative facials and clinical skin treatments in a zen sanctuary.",
            image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&q=80&w=1200",
            category: "Skin"
        },
        {
            id: 'b1',
            title: "Bridal Sanctuary",
            desc: "The royal transformation for your most significant moments.",
            image: "https://images.unsplash.com/photo-1594465919760-441fe5908ab0?auto=format&fit=crop&q=80&w=1200",
            category: "Bridal"
        },
        {
            id: 'w1',
            title: "Aura Wellness",
            desc: "Holistic body therapy and deep tissue alchemy to restore balance.",
            image: "https://images.unsplash.com/photo-1544161515-4ae6ce6db87e?auto=format&fit=crop&q=80&w=1200",
            category: "Wellness"
        },
        {
            id: 'n1',
            title: "Architectural Nails",
            desc: "Geometric precision and artistic expression for your hands.",
            image: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&q=80&w=1200",
            category: "Nails"
        }
    ];

    const slides = services.length > 0 
        ? services.slice(0, 5).map(s => ({
            id: s.id,
            title: s.name,
            desc: s.description,
            image: s.image_url || "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&q=80&w=1200",
            category: s.category
        }))
        : defaultSlides;

    useEffect(() => {
        let interval;
        if (isAutoPlaying) {
            interval = setInterval(() => {
                prevSlide();
            }, 5000); // Change slide every 5 seconds
        }
        return () => clearInterval(interval);
    }, [currentIndex, isAutoPlaying]);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    };

    const getPosition = (index) => {
        const diff = (index - currentIndex + slides.length) % slides.length;
        if (diff === 0) return "center";
        if (diff === 1 || diff === -4) return "right";
        if (diff === slides.length - 1 || diff === -1) return "left";
        return "hidden";
    };

    return (
        <section
            className="py-32 bg-[#050505] overflow-hidden relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
        >
            <div className="max-w-[1400px] mx-auto px-6 mb-16 text-center">
                <p className="text-[#00E6A0] font-black text-[10px] uppercase tracking-[0.4em] mb-6">Signature Experiences</p>
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none text-white">
                    Our Specialized <span className="text-gray-500">Treatments</span>
                </h2>
            </div>

            <div className="relative h-[600px] w-full flex items-center justify-center pt-10">
                <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
                    {slides.map((slide, index) => {
                        const pos = getPosition(index);
                        return (
                            <motion.div
                                key={slide.id}
                                className={`absolute rounded-[3rem] overflow-hidden shadow-2xl transition-all duration-700 cursor-pointer
                                    ${pos === 'center' ? 'z-30 w-[350px] md:w-[800px]' : 'z-10 w-[280px] md:w-[600px]'}`}
                                initial={false}
                                animate={{
                                    x: pos === 'center' ? 0 : pos === 'left' ? '-100%' : pos === 'right' ? '100%' : 0,
                                    scale: pos === 'center' ? 1.1 : 0.85,
                                    opacity: pos === 'center' ? 1 : pos === 'hidden' ? 0 : 0.6,
                                    zIndex: pos === 'center' ? 30 : 10,
                                    filter: pos === 'center' ? 'blur(0px)' : 'blur(8px)',
                                }}
                                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                                onClick={() => {
                                    if (pos === 'left') prevSlide();
                                    if (pos === 'right') nextSlide();
                                }}
                            >
                                <div className="relative aspect-[16/9]">
                                    <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                    <div className={`absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-700 ${pos === 'center' ? 'opacity-0' : 'opacity-100'}`}></div>
                                </div>

                                {pos === 'center' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="absolute inset-x-0 bottom-0 p-12 bg-gradient-to-t from-black via-black/60 to-transparent"
                                    >
                                        <h3 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">{slide.title}</h3>
                                        <p className="text-gray-300 text-lg mb-8 max-w-xl font-medium">{slide.desc}</p>
                                        <button
                                            onClick={() => navigate(slide.category ? `/explore/${slide.category.toLowerCase()}` : '/explore/all')}
                                            className="px-8 py-3 border-2 border-white/20 hover:border-[#00E6A0] hover:bg-[#00E6A0] hover:text-[#050505] text-white rounded-full font-black text-sm uppercase tracking-widest transition-all backdrop-blur-md"
                                        >
                                            View Details
                                        </button>
                                    </motion.div>
                                )}
                            </motion.div>
                        );
                    })}
                </div>

                {/* Navigation Controls */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 z-40">
                    <button
                        onClick={prevSlide}
                        className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all bg-black/20 backdrop-blur-xl"
                    >
                        <ChevronLeft size={28} />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white hover:text-black transition-all bg-black/20 backdrop-blur-xl"
                    >
                        <ChevronRight size={28} />
                    </button>
                </div>
            </div>
        </section>
    );
};

export default CardCarousel;
