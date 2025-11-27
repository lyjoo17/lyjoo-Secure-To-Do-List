export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  TODOS: {
    BASE: '/todos',
    BY_ID: (id) => `/todos/${id}`,
    RESTORE: (id) => `/todos/${id}/restore`,
  },
  HOLIDAYS: {
    BASE: '/holidays',
    SYNC: '/holidays/sync',
  },
  USER: {
    ME: '/users/me',
  },
};

export const TODO_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  DELETED: 'DELETED',
};

export const USER_ROLE = {
  USER: 'USER',
  ADMIN: 'ADMIN',
};
