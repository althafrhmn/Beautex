import React, { useState } from 'react';
import { X, ShieldCheck, AlertCircle, Delete, ArrowRight } from 'lucide-react';

const PinPrompt = ({ onVerify, onCancel }) => {
    const [pin, setPin] = useState('');
    const [error, setError] = useState(false);

    const handleKeypad = (num) => {
        if (pin.length < 4) {
            setPin(p => p + num);
            setError(false);
        }
    };

    const handleDelete = () => {
        setPin(p => p.slice(0, -1));
        setError(false);
    };

    const handleSubmit = () => {
        if (onVerify(pin)) {
            setPin('');
        } else {
            setError(true);
            setPin('');
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center font-sans tracking-tight">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-[#0F1115]/95 backdrop-blur-3xl animate-in fade-in duration-500" onClick={onCancel} />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-[#141414] border border-white/5 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 duration-300">
                <button onClick={onCancel} className="absolute top-8 right-8 text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-[#00E6A0]/10 border border-[#00E6A0]/20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#00E6A0]">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-2xl font-black text-white tracking-widest uppercase italic">Executive <span className="text-[#00E6A0]">Unlock</span></h3>
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3rem] mt-2">Enter 4-Digit Management PIN</p>
                </div>

                {/* PIN Display */}
                <div className="flex justify-center gap-4 mb-12">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className={`w-12 h-16 rounded-2xl border-2 flex items-center justify-center text-2xl font-black transition-all ${
                            error ? 'border-red-500/50 bg-red-500/5 text-red-500' : 
                            pin[i] ? 'border-[#00E6A0] bg-[#00E6A0]/5 text-[#00E6A0]' : 'border-white/5 bg-white/5 text-gray-700'
                        }`}>
                            {pin[i] ? '•' : ''}
                        </div>
                    ))}
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-3 gap-4 mb-10">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <button key={num} onClick={() => handleKeypad(num.toString())}
                            className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white text-xl font-black hover:bg-[#00E6A0] hover:text-black transition-all active:scale-95">
                            {num}
                        </button>
                    ))}
                    <div />
                    <button onClick={() => handleKeypad('0')}
                        className="h-16 rounded-2xl bg-white/5 border border-white/5 text-white text-xl font-black hover:bg-[#00E6A0] hover:text-black transition-all active:scale-95">
                        0
                    </button>
                    <button onClick={handleDelete}
                        className="h-16 rounded-2xl bg-white/5 border border-white/5 text-gray-500 hover:text-white flex items-center justify-center transition-all active:scale-95">
                        <Delete size={20} />
                    </button>
                </div>

                {/* Action button */}
                <button 
                    onClick={handleSubmit}
                    disabled={pin.length < 4}
                    className="w-full h-16 bg-[#00E6A0] disabled:bg-gray-800 disabled:text-gray-600 text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 group transition-all"
                >
                    Authorize Session
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>

                {error && (
                    <p className="text-center text-red-500 text-[10px] font-black uppercase tracking-widest mt-6 flex items-center justify-center gap-1">
                        <AlertCircle size={12} /> Access Denied: Invalid Credentials
                    </p>
                )}
            </div>
        </div>
    );
};

export default PinPrompt;
