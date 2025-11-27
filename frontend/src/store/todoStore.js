import { create } from 'zustand';
import api from '../services/api';
import { API_ENDPOINTS, TODO_STATUS } from '../services/constants';

const useTodoStore = create((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  fetchTodos: async (status = null) => {
    set({ isLoading: true, error: null });
    try {
      const params = status ? { status } : {};
      const response = await api.get(API_ENDPOINTS.TODOS.BASE, { params });
      set({ todos: response.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '할일 조회 실패' });
    }
  },

  addTodo: async (todoData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post(API_ENDPOINTS.TODOS.BASE, todoData);
      set((state) => ({
        todos: [response.data.data, ...state.todos],
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '할일 생성 실패' });
      return { success: false, error: error.response?.data?.message };
    }
  },

  updateTodo: async (id, todoData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.put(API_ENDPOINTS.TODOS.BY_ID(id), todoData);
      set((state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? response.data.data : todo)),
        isLoading: false,
      }));
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '할일 수정 실패' });
      return { success: false, error: error.response?.data?.message };
    }
  },

  deleteTodo: async (id) => {
    const previousTodos = get().todos;

    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));

    try {
      await api.delete(API_ENDPOINTS.TODOS.BY_ID(id));
      return { success: true };
    } catch (error) {
      set({ todos: previousTodos });
      return { success: false, error: error.response?.data?.message || '할일 삭제 실패' };
    }
  },

  restoreTodo: async (id) => {
    const previousTodos = get().todos;

    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));

    try {
      await api.patch(API_ENDPOINTS.TODOS.RESTORE(id));
      return { success: true };
    } catch (error) {
      set({ todos: previousTodos });
      return { success: false, error: error.response?.data?.message || '할일 복원 실패' };
    }
  },

  toggleComplete: async (id, isCompleted) => {
    const previousTodos = get().todos;

    set((state) => ({
      todos: state.todos.map((todo) =>
        todo.id === id ? { ...todo, isCompleted: !isCompleted } : todo
      ),
    }));

    try {
      await api.put(API_ENDPOINTS.TODOS.BY_ID(id), { isCompleted: !isCompleted });
      return { success: true };
    } catch (error) {
      set({ todos: previousTodos });
      return { success: false, error: error.response?.data?.message };
    }
  },
}));

export default useTodoStore;
