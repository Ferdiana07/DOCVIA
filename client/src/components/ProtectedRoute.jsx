import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

/**
 * ProtectedRoute
 * --------------
 * Wraps routes that require authentication and optionally a specific role.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>          → any logged-in user
 *   <Route element={<ProtectedRoute role="admin" />}>  → admins only
 *
 * How it works:
 * 1. If still loading auth state → show spinner (prevents flash)
 * 2. If not logged in → redirect to /login
 * 3. If wrong role → redirect to their own dashboard
 * 4. Otherwise → render the nested route (Outlet)
 */
const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app-page route-skeleton" role="status" aria-label="Checking account access">
        <div className="route-skeleton-inner" aria-hidden="true">
          <span className="skeleton-line skeleton-title" />
          <span className="skeleton-line skeleton-copy" />
          <div className="skeleton-grid"><span /><span /><span /></div>
        </div>
        <span className="visually-hidden">Checking account access...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }

  if (role && user?.role !== role) {
    // Redirect to the appropriate dashboard for their role
    const dashboards = {
      patient: '/patient/dashboard',
      doctor: '/doctor/dashboard',
      admin: '/admin/dashboard',
    };
    return <Navigate to={dashboards[user?.role] || '/'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
