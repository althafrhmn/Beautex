import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CircularTimePicker = ({ value, onChange, label }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mode, setMode] = useState('hours'); // 'hours' or 'minutes'
    const containerRef = useRef(null);

    // Parse current value "HH:mm"
    const [hours, minutes] = (value || "09:00").split(':').map(Number);
    const [displayHours, setDisplayHours] = useState(hours % 12 || 12);
    const [displayMinutes, setDisplayMinutes] = useState(minutes);
    const [ampm, setAmpm] = useState(hours >= 12 ? 'PM' : 'AM');

    useEffect(() => {
        const h = ampm === 'PM' ? (displayHours % 12) + 12 : (displayHours % 12);
        const timeStr = `${h.toString().padStart(2, '0')}:${displayMinutes.toString().padStart(2, '0')}`;
        onChange(timeStr);
    }, [displayHours, displayMinutes, ampm]);

    const handleClockClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        
        let angle = Math.atan2(y, x) * (180 / Math.PI) + 90;
        if (angle < 0) angle += 360;

        if (mode === 'hours') {
            let h = Math.round(angle / 30);
            if (h === 0) h = 12;
            setDisplayHours(h);
            setTimeout(() => setMode('minutes'), 300);
        } else {
            let m = Math.round(angle / 6) % 60;
            setDisplayMinutes(m);
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <button 
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-white text-left flex justify-between items-center hover:border-[#00E6A0] transition-all"
            >
                <div className="flex flex-col">
                    <span className="text-[9px] text-gray-500 font-black uppercase tracking-widest">{label}</span>
                    <span className="text-sm font-bold">{displayHours.toString().padStart(2, '0')}:{displayMinutes.toString().padStart(2, '0')} {ampm}</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-[#2A2A2A] flex items-center justify-center">
                    <span className="text-xs">🕒</span>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute z-[300] top-full left-0 right-0 mt-2 bg-[#141414] border border-[#2A2A2A] rounded-2xl p-6 shadow-2xl"
                    >
                        {/* Header: Display selected time */}
                        <div className="flex items-center justify-center gap-4 mb-6">
                            <button onClick={() => setMode('hours')} className={`text-3xl font-black ${mode === 'hours' ? 'text-[#00E6A0]' : 'text-gray-600'}`}>
                                {displayHours.toString().padStart(2, '0')}
                            </button>
                            <span className="text-3xl font-black text-gray-800">:</span>
                            <button onClick={() => setMode('minutes')} className={`text-3xl font-black ${mode === 'minutes' ? 'text-[#00E6A0]' : 'text-gray-600'}`}>
                                {displayMinutes.toString().padStart(2, '0')}
                            </button>
                            <div className="flex flex-col gap-1 ml-4">
                                <button onClick={() => setAmpm('AM')} className={`px-2 py-1 text-[10px] font-black rounded-md ${ampm === 'AM' ? 'bg-[#00E6A0] text-[#050505]' : 'bg-[#2A2A2A] text-gray-500'}`}>AM</button>
                                <button onClick={() => setAmpm('PM')} className={`px-2 py-1 text-[10px] font-black rounded-md ${ampm === 'PM' ? 'bg-[#00E6A0] text-[#050505]' : 'bg-[#2A2A2A] text-gray-500'}`}>PM</button>
                            </div>
                        </div>

                        {/* Clock Face */}
                        <div 
                            className="relative w-48 h-48 mx-auto bg-[#1A1A1A] rounded-full flex items-center justify-center cursor-pointer touch-none"
                            onClick={handleClockClick}
                        >
                            {/* Center Dot */}
                            <div className="absolute w-2 h-2 bg-[#00E6A0] rounded-full z-20" />
                            
                            {/* Hand */}
                            <motion.div 
                                className="absolute bottom-1/2 left-1/2 w-0.5 bg-[#00E6A0] origin-bottom z-10"
                                style={{ 
                                    height: '40%',
                                    rotate: mode === 'hours' ? (displayHours * 30) : (displayMinutes * 6)
                                }}
                            />
                            
                            {/* Hand Cap */}
                            <motion.div 
                                className="absolute w-8 h-8 rounded-full border-2 border-[#00E6A0] bg-[#00E6A0]/10 z-10 -translate-x-1/2 -translate-y-1/2"
                                style={{ 
                                    left: '50%',
                                    top: '10%',
                                    transformOrigin: '50% 150%',
                                    rotate: mode === 'hours' ? (displayHours * 30) : (displayMinutes * 6)
                                }}
                            />

                            {/* Numbers */}
                            {mode === 'hours' ? (
                                [12,1,2,3,4,5,6,7,8,9,10,11].map((n, i) => (
                                    <div 
                                        key={n}
                                        className="absolute text-xs font-bold text-gray-500"
                                        style={{
                                            left: `${50 + 38 * Math.sin(i * 30 * Math.PI / 180)}%`,
                                            top: `${50 - 38 * Math.cos(i * 30 * Math.PI / 180)}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        {n}
                                    </div>
                                ))
                            ) : (
                                [0,5,10,15,20,25,30,35,40,45,50,55].map((n, i) => (
                                    <div 
                                        key={n}
                                        className="absolute text-[10px] font-bold text-gray-500"
                                        style={{
                                            left: `${50 + 38 * Math.sin(i * 30 * Math.PI / 180)}%`,
                                            top: `${50 - 38 * Math.cos(i * 30 * Math.PI / 180)}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    >
                                        {n}
                                    </div>
                                ))
                            )}
                        </div>

                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-full mt-6 py-3 bg-[#00E6A0]/10 text-[#00E6A0] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[#00E6A0] hover:text-[#050505] transition-all"
                        >
                            Set Time
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CircularTimePicker;
