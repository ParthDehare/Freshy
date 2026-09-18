import { create } from 'zustand';
import { authAPI } from '../api/client';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('freshchain_user') || 'null'),
  token: localStorage.getItem('freshchain_token') || null,
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await authAPI.login({ email, password });
      const { token, user } = response.data;
      localStorage.setItem('freshchain_token', token);
      localStorage.setItem('freshchain_user', JSON.stringify(user));
      set({ user, token, loading: false });
      return user;
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please try again.';
      set({ error: msg, loading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    localStorage.removeItem('freshchain_token');
    localStorage.removeItem('freshchain_user');
    set({ user: null, token: null });
  },

  clearError: () => set({ error: null })
}));

export default useAuthStore;
