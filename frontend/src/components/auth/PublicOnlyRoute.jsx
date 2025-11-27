import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const PublicOnlyRoute = ({ children }) => {
  const { accessToken } = useAuthStore();

  if (accessToken) {
    return <Navigate to="/todos" replace />;
  }

  return children;
};

export default PublicOnlyRoute;
