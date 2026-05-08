// Predefined conversational flow for Beubot

export const INITIAL_MESSAGE = {
    id: 'welcome',
    sender: 'bot',
    text: "Hi there! I'm Beubot ✨. How can I assist you today?",
    options: [
        { id: 'trust', label: 'Is Beautex trustable?' },
        { id: 'top_rated', label: 'Find Most Rated Shop' },
        { id: 'latest_offer', label: 'Latest Special Offer' },
        { id: 'ai_recommend', label: '🤖 Smart Service Recommender' },
        { id: 'payment_policy', label: 'Payment & Cancellations' },
        { id: 'contact_support', label: 'Contact Support Team' }
    ]
};

export const CHAT_RESPONSES = {
    'trust': {
        text: "Absolutely! 🛡️ Beautex only partners with verified, premium salons. Every shop on our platform goes through a strict vetting process, and all reviews are from genuine customers who completed their appointments.",
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    'payment_policy': {
        text: "**Payments:** You can securely pay online via UPI QR or choose 'Pay at Salon' during booking.\n\n**Cancellations:** Currently, online cancellations are not available. This feature will be coming very soon! For now, please contact the salon directly to reschedule.",
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    'contact_support': {
        text: "We're here to help! 📞\n\nYou can reach our support team anytime by sending an email to **support@beautex.com** or by calling us toll-free at **1800-BEAUTEX**. We usually respond within 24 hours.",
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    'top_rated': {
        text: "Let me check our live database for the highest-rated salon in the network...",
        isDynamic: true,
        dynamicType: 'fetch_top_salon',
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    'latest_offer': {
        text: "Checking the live community board for new offers...",
        isDynamic: true,
        dynamicType: 'fetch_latest_offer',
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    
    // --- SMART RECOMMENDER FLOW ---
    'ai_recommend': {
        text: "I'd love to recommend a service! Tell me, what's your goal for today?",
        options: [
            { id: 'rec_relax', label: 'Just want to relax' },
            { id: 'rec_party', label: 'Getting ready for a party' },
            { id: 'rec_glow', label: 'Need a quick glow-up' }
        ]
    },
    'rec_relax': {
        text: "✨ **Recommendation: The Signature Spa Therapy**\nPerfect for unwinding. It releases tension and leaves your hair and scalp feeling totally rejuvenated. Pair it with a head massage!",
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    'rec_party': {
        text: "✨ **Recommendation: HD Party Makeup & Styling**\nGet that flawless, long-lasting look that pops in photos. Don't forget to book a quick blow-dry to complete the vibe!",
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    },
    'rec_glow': {
        text: "✨ **Recommendation: Express Diamond Facial**\nShort on time? This facial gives you an instant, radiant boost in under 45 minutes. Highly rated by our regular guests!",
        options: [{ id: 'back', label: '⬅️ Back to start' }]
    }
};
