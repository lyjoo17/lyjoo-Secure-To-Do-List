import { create } from 'zustand';
import api from '../services/api';
import { API_ENDPOINTS } from '../services/constants';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  accessToken: localStorage.getItem('accessToken') || null,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.LOGIN, { email, password });
      const { accessToken, user } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, accessToken, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '로그인 실패' });
      return { success: false, error: error.response?.data?.message };
    }
  },

  register: async (username, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(API_ENDPOINTS.AUTH.REGISTER, { username, email, password });
      const { accessToken, user } = response.data.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({ user, accessToken, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '회원가입 실패' });
      return { success: false, error: error.response?.data?.message };
    }
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (error) {
      console.error('로그아웃 에러:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      set({ user: null, accessToken: null });
    }
  },

  checkAuth: () => {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');

    if (token && user) {
      set({ accessToken: token, user: JSON.parse(user) });
      return true;
    }
    return false;
  },

  updateUser: (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    set({ user: updatedUser });
  },
}));

export default useAuthStore;
