import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';

export default function AdminRoute() {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <Loader />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user && user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
