import React from 'react';
import { useSelector } from 'react-redux';
import BookingFlow from '../modules/booking-system/BookingFlow';
import BookingManagerAdmin from '../modules/booking-system/BookingManagerAdmin';
import CustomerBookings from '../modules/booking-system/CustomerBookings';

const BookingPage = ({ view = 'book' }) => {
    const { role } = useSelector((state) => state.auth);

    const renderContent = () => {
        // If we want to BOOK, show the BookingFlow regardless of the user's management role.
        // This ensures admins testing the site see what a customer sees.
        if (view === 'book') return <BookingFlow />;

        // Otherwise, show the role-specific management view
        if (role === 'admin' || role === 'manager') return <div className="pt-24"><BookingManagerAdmin /></div>;

        return <CustomerBookings />;
    };

    return (
        <div className="min-h-screen bg-[#050505]">
            {renderContent()}
        </div>
    );
};

export default BookingPage;

