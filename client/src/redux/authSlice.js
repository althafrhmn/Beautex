import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    role: null, // Role is always fetched fresh from the DB to prevent stale redirects
    isAuthenticated: !!localStorage.getItem('token'),
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.role = action.payload.role;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
            localStorage.setItem('user', JSON.stringify(action.payload.user));
            // Removed localStorage.setItem('role', ...) to prevent stale role logic on next load
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.role = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // 'role' is not in localStorage, but we ensure it's null in state
        },
        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
    },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
