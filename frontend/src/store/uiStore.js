import { create } from 'zustand';

const useUIStore = create((set) => ({
  isModalOpen: false,
  modalType: null,
  modalData: null,
  toast: null,
  isLoading: false,

  openModal: (type, data = null) => {
    set({ isModalOpen: true, modalType: type, modalData: data });
  },

  closeModal: () => {
    set({ isModalOpen: false, modalType: null, modalData: null });
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type, id: Date.now() } });
    setTimeout(() => {
      set({ toast: null });
    }, 3000);
  },

  setLoading: (isLoading) => {
    set({ isLoading });
  },
}));

export default useUIStore;
