import React from 'react';
import { useSelector } from 'react-redux';
import BookingFlow from '../../modules/booking-system/BookingFlow';
import BookingManagerAdmin from '../../modules/booking-system/BookingManagerAdmin';

const ServicesBookingModule = () => {
    const { user } = useSelector((state) => state.auth);
    const role = user?.user_metadata?.role || 'customer';

    // Role-based routing within the module
    if (role === 'admin') {
        return <BookingManagerAdmin />;
    }

    // Default for customers
    return <BookingFlow />;
};

export default ServicesBookingModule;
