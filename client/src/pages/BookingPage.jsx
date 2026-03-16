import React from 'react';
import { useSelector } from 'react-redux';
import BookingFlow from '../modules/booking-system/BookingFlow';
import BookingManagerAdmin from '../modules/booking-system/BookingManagerAdmin';
import CustomerBookings from '../modules/booking-system/CustomerBookings';

const BookingPage = ({ view = 'book' }) => {
    const { role } = useSelector((state) => state.auth);

    const renderContent = () => {
        if (role === 'admin') return <div className="pt-24"><BookingManagerAdmin /></div>;

        return view === 'book' ? <BookingFlow /> : <CustomerBookings />;
    };

    return (
        <div className="min-h-screen bg-[#050505]">
            {renderContent()}
        </div>
    );
};

export default BookingPage;

