import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  return (
    <ProtectedRoute>
      {loading ? <div className="panel">Loading...</div> : user?.role === 'admin' ? children : <Navigate to="/" replace />}
    </ProtectedRoute>
  );
}
