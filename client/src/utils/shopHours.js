/**
 * Parses a time string like "09:00 AM", "09:00 PM", "17:30", "9:00"
 * Returns minutes since midnight (0–1439).
 */
const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const cleaned = timeStr.trim();

    // 12-hour format: "09:00 AM" or "9:00 PM"
    const match12 = cleaned.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
        let hours = parseInt(match12[1], 10);
        const mins = parseInt(match12[2], 10);
        const meridiem = match12[3].toUpperCase();
        if (meridiem === 'AM' && hours === 12) hours = 0;
        if (meridiem === 'PM' && hours !== 12) hours += 12;
        return hours * 60 + mins;
    }

    // 24-hour format: "17:30" or "09:00"
    const match24 = cleaned.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) {
        const hours = parseInt(match24[1], 10);
        const mins = parseInt(match24[2], 10);
        return hours * 60 + mins;
    }

    return null;
};

/**
 * Returns true if the shop is currently open based on its hours string and off_days.
 * @param {string} hoursStr  e.g. "09:00 AM - 09:00 PM" or "09:00 - 17:30"
 * @param {string[]} offDays e.g. ["Sunday"] — day names to exclude
 */
export const isShopOpen = (hoursStr, offDays = []) => {
    if (!hoursStr) return false;

    // Check off day
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[new Date().getDay()];
    if (offDays && offDays.some(d => d?.toLowerCase() === todayName.toLowerCase())) {
        return false;
    }

    // Split on " - " to get open and close strings
    const parts = hoursStr.split(' - ');
    if (parts.length < 2) return false;

    const openMins = parseTimeToMinutes(parts[0]);
    const closeMins = parseTimeToMinutes(parts[1]);

    if (openMins === null || closeMins === null) return false;

    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    // Handle overnight (e.g. open until midnight past 12am)
    if (closeMins < openMins) {
        return currentMins >= openMins || currentMins < closeMins;
    }

    return currentMins >= openMins && currentMins < closeMins;
};
