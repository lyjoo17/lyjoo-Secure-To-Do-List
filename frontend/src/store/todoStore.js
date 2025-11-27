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
      const todos = response.data.data.map((todo) => ({
        ...todo,
        id: todo.todoId,
        description: todo.content,
      }));
      set({ todos, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message || '할일 조회 실패' });
    }
  },

  addTodo: async (todoData) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        ...todoData,
        content: todoData.description,
      };
      delete payload.description;

      const response = await api.post(API_ENDPOINTS.TODOS.BASE, payload);
      const newTodo = {
        ...response.data.data,
        id: response.data.data.todoId,
        description: response.data.data.content,
      };
      set((state) => ({
        todos: [newTodo, ...state.todos],
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
      const payload = {
        ...todoData,
        content: todoData.description,
      };
      delete payload.description;

      const response = await api.put(API_ENDPOINTS.TODOS.BY_ID(id), payload);
      const updatedTodo = {
        ...response.data.data,
        id: response.data.data.todoId,
        description: response.data.data.content,
      };
      set((state) => ({
        todos: state.todos.map((todo) => (todo.id === id ? updatedTodo : todo)),
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

  permanentDeleteTodo: async (id) => {
    const previousTodos = get().todos;

    set((state) => ({
      todos: state.todos.filter((todo) => todo.id !== id),
    }));

    try {
      await api.delete(API_ENDPOINTS.TODOS.PERMANENT(id));
      return { success: true };
    } catch (error) {
      set({ todos: previousTodos });
      return { success: false, error: error.response?.data?.message || '할일 영구삭제 실패' };
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
