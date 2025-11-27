import { create } from 'zustand';
import api from '../services/api';
import { API_ENDPOINTS } from '../services/constants';

const useHolidayStore = create((set) => ({
  holidays: [],
  isLoading: false,
  error: null,

  fetchHolidays: async (year) => {
    set({ isLoading: true, error: null });
    try {
      const params = year ? { year } : {};
      const response = await api.get(API_ENDPOINTS.HOLIDAYS.BASE, { params });
      const holidays = response.data.data.map((holiday) => ({
        ...holiday,
        id: holiday.holidayId,
        name: holiday.title,
      }));
      set({ holidays, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '국경일 조회 실패' });
    }
  },

  syncHolidays: async (year) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(API_ENDPOINTS.HOLIDAYS.SYNC, { year });
      const holidays = response.data.data.map((holiday) => ({
        ...holiday,
        id: holiday.holidayId,
        name: holiday.title,
      }));
      set({ holidays, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '국경일 동기화 실패' });
      return { success: false, error: error.response?.data?.message };
    }
  },
}));

export default useHolidayStore;
