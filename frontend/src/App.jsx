import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import TodoListPage from './pages/todo/TodoListPage';
import TrashPage from './pages/todo/TrashPage';
import HolidayPage from './pages/holiday/HolidayPage';
import ProfilePage from './pages/profile/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';
import Toast from './components/common/Toast';
import useTheme from './hooks/useTheme';

function App() {
  useTheme();

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<Navigate to="/todos" replace />} />

        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <RegisterPage />
            </PublicOnlyRoute>
          }
        />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/todos" element={<TodoListPage />} />
          <Route path="/trash" element={<TrashPage />} />
          <Route path="/holidays" element={<HolidayPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
