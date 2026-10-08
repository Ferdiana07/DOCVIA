import { Routes, Route, Outlet } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PlatformNotice from './components/PlatformNotice';
import useAuth from './hooks/useAuth';

// Public pages
const Home = lazy(() => import('./pages/Home'));
const LoginPage = lazy(() => import('./pages/auth/Login'));
const RegisterPage = lazy(() => import('./pages/auth/Register'));
const DoctorList = lazy(() => import('./pages/doctors/DoctorList'));
const DoctorDetail = lazy(() => import('./pages/doctors/DoctorDetail'));
const PublicPolicy = lazy(() => import('./pages/PublicPolicy'));

// Patient pages
const PatientDashboard = lazy(() => import('./pages/patient/PatientDashboard'));
const BookAppointment = lazy(() => import('./pages/patient/BookAppointment'));
const MyAppointments = lazy(() => import('./pages/patient/MyAppointments'));
const PatientNotifications = lazy(() => import('./pages/patient/PatientNotifications'));
const PatientProfile = lazy(() => import('./pages/patient/PatientProfile'));
const ApplyAsDoctor = lazy(() => import('./pages/patient/ApplyAsDoctor'));
const RescheduleAppointment = lazy(() => import('./pages/patient/RescheduleAppointment'));

// Doctor pages
const DoctorDashboard = lazy(() => import('./pages/doctor/DoctorDashboard'));
const DoctorAppointments = lazy(() => import('./pages/doctor/DoctorAppointments'));
const DoctorProfile = lazy(() => import('./pages/doctor/DoctorProfile'));
const DoctorNotifications = lazy(() => import('./pages/doctor/DoctorNotifications'));

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminDoctors = lazy(() => import('./pages/admin/AdminDoctors'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminAppointments = lazy(() => import('./pages/admin/AdminAppointments'));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications'));
const AdminDisputes = lazy(() => import('./pages/admin/AdminDisputes'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const SupportCenter = lazy(() => import('./pages/SupportCenter'));
const AppointmentDetail = lazy(() => import('./pages/patient/AppointmentDetail'));
const NotFound = lazy(() => import('./pages/NotFound'));

const RouteLoader = () => (
  <div className="app-page route-skeleton" role="status" aria-live="polite" aria-label="Loading page">
    <div className="route-skeleton-inner" aria-hidden="true">
      <span className="skeleton-line skeleton-title" />
      <span className="skeleton-line skeleton-copy" />
      <div className="skeleton-grid"><span /><span /><span /></div>
    </div>
    <span className="visually-hidden">Loading page...</span>
  </div>
);

/**
 * MainLayout
 * ----------
 * Renders the Navbar above every page (public and private).
 * Uses <Outlet /> from react-router-dom to render child routes.
 */
const MainLayout = () => {
  const { isAuthenticated } = useAuth();
  return (
  <div className={isAuthenticated ? 'site-shell site-shell-authenticated' : 'site-shell site-shell-public'}>
    <a className="skip-link" href="#main-content">Skip to main content</a>
    <Navbar />
    <PlatformNotice />
    <main id="main-content" tabIndex="-1">
      <Suspense fallback={<RouteLoader />}>
        <Outlet />
      </Suspense>
    </main>
  </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* ── All routes share the Navbar layout ── */}
      <Route element={<MainLayout />}>

        {/* ── Public routes ── */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/doctors" element={<DoctorList />} />
        <Route path="/doctors/:id" element={<DoctorDetail />} />
        <Route path="/privacy" element={<PublicPolicy />} />
        <Route path="/terms" element={<PublicPolicy />} />

        {/* ── Patient-only routes ── */}
        <Route element={<ProtectedRoute role="patient" />}>
          <Route path="/patient/dashboard" element={<PatientDashboard />} />
          <Route path="/patient/appointments" element={<MyAppointments />} />
          <Route path="/patient/appointments/:id" element={<AppointmentDetail />} />
          <Route path="/patient/appointments/:id/reschedule" element={<RescheduleAppointment />} />
          <Route path="/patient/book/:doctorId" element={<BookAppointment />} />
          <Route path="/patient/notifications" element={<PatientNotifications />} />
          <Route path="/patient/profile" element={<PatientProfile />} />
          <Route path="/patient/apply-as-doctor" element={<ApplyAsDoctor />} />
          <Route path="/patient/support" element={<SupportCenter />} />
        </Route>

        {/* ── Doctor-only routes ── */}
        <Route element={<ProtectedRoute role="doctor" />}>
          <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
          <Route path="/doctor/appointments" element={<DoctorAppointments />} />
          <Route path="/doctor/profile" element={<DoctorProfile />} />
          <Route path="/doctor/notifications" element={<DoctorNotifications />} />
          <Route path="/doctor/support" element={<SupportCenter />} />
        </Route>

        {/* ── Admin-only routes ── */}
        <Route element={<ProtectedRoute role="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/doctors" element={<AdminDoctors />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/appointments" element={<AdminAppointments />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>

        {/* ── Catch-all: redirect unknown paths to home ── */}
        <Route path="*" element={<NotFound />} />

      </Route>
    </Routes>
  );
};

export default App;
