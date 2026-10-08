import { useCallback, useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Badge, Button, Container, Dropdown, Nav, Navbar as BsNavbar } from 'react-bootstrap';
import {
  Bell, CalendarBlank, CaretDown, GearSix, Headset, Heartbeat, House,
  MagnifyingGlass, Moon, SignOut, Stethoscope, Sun, UserCircle, UsersThree,
} from '@phosphor-icons/react';
import useAuth from '../hooks/useAuth';
import useTheme from '../hooks/useTheme';
import api from '../services/api';

const roleLinks = {
  patient: [
    { to: '/patient/dashboard', label: 'Overview', icon: House },
    { to: '/doctors', label: 'Find a doctor', icon: MagnifyingGlass },
    { to: '/patient/appointments', label: 'Appointments', icon: CalendarBlank },
    { to: '/patient/apply-as-doctor', label: 'Apply as doctor', icon: Stethoscope },
    { to: '/patient/profile', label: 'Profile', icon: UserCircle },
    { to: '/patient/support', label: 'Support', icon: Headset },
  ],
  doctor: [
    { to: '/doctor/dashboard', label: 'Overview', icon: House },
    { to: '/doctor/appointments', label: 'Appointments', icon: CalendarBlank },
    { to: '/doctor/profile', label: 'Profile & schedule', icon: UserCircle },
    { to: '/doctor/support', label: 'Support', icon: Headset },
  ],
  admin: [
    { to: '/admin/dashboard', label: 'Overview', icon: House },
    { to: '/admin/doctors', label: 'Doctor approvals', icon: Stethoscope },
    { to: '/admin/users', label: 'Users', icon: UsersThree },
    { to: '/admin/appointments', label: 'Appointments', icon: CalendarBlank },
    { to: '/admin/disputes', label: 'Support cases', icon: Headset },
    { to: '/admin/settings', label: 'Settings', icon: GearSix },
  ],
};

const dashboardLinks = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  admin: '/admin/dashboard',
};

const notificationLinks = {
  patient: '/patient/notifications',
  doctor: '/doctor/notifications',
  admin: '/admin/notifications',
};

const profileLinks = {
  patient: '/patient/profile',
  doctor: '/doctor/profile',
  admin: '/admin/users',
};

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const { data } = await api.get('/notifications');
      setUnreadCount(data.unreadCount || 0);
    } catch {
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    queueMicrotask(fetchUnreadCount);
    const timer = isAuthenticated ? window.setInterval(fetchUnreadCount, 60000) : null;
    window.addEventListener('docvia:notifications-changed', fetchUnreadCount);
    return () => {
      if (timer) window.clearInterval(timer);
      window.removeEventListener('docvia:notifications-changed', fetchUnreadCount);
    };
  }, [fetchUnreadCount, isAuthenticated]);

  const handleLogout = () => {
    logout();
    setExpanded(false);
    navigate('/login');
  };

  const closeMenu = () => setExpanded(false);
  const navigation = isAuthenticated ? roleLinks[user?.role] || [] : [
    { to: '/', label: 'Home' },
    { to: '/doctors', label: 'Find doctors' },
  ];

  return (
    <BsNavbar expanded={expanded} onToggle={setExpanded} expand="lg" className={`site-navbar ${isAuthenticated ? 'is-authenticated' : 'is-public'}`} aria-label="Primary navigation">
      <Container>
        <BsNavbar.Brand as={Link} to="/" onClick={closeMenu} className="brand-lockup">
          <span className="brand-mark" aria-hidden="true"><Heartbeat weight="regular" /></span>
          <span>DOCVIA<small>Care, made clear</small></span>
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar" aria-label="Toggle navigation" />

        <BsNavbar.Collapse id="main-navbar">
          <Nav className="navbar-main mx-lg-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
              <Nav.Link key={item.to} as={NavLink} to={item.to} end={item.to.endsWith('/dashboard') || item.to === '/'} onClick={closeMenu}>
                {Icon && <Icon aria-hidden="true" weight="regular" />}<span>{item.label}</span>
              </Nav.Link>
              );
            })}
          </Nav>

          <Nav className="navbar-actions align-items-lg-center">
            {isAuthenticated ? (
              <>
                <Button
                  type="button"
                  variant="light"
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  aria-pressed={theme === 'dark'}
                >
                  {theme === 'dark' ? <Sun aria-hidden="true" weight="regular" /> : <Moon aria-hidden="true" weight="regular" />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </Button>

                <Button
                  as={Link}
                  to={notificationLinks[user?.role] || '/'}
                  onClick={closeMenu}
                  variant="light"
                  className="notification-button"
                  aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
                >
                  <Bell aria-hidden="true" weight="regular" />
                  <span className="notification-label">Notifications</span>
                  {unreadCount > 0 && <Badge bg="danger">{unreadCount > 9 ? '9+' : unreadCount}</Badge>}
                </Button>

                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" className="account-menu">
                    <span className="account-avatar" aria-hidden="true">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                    <span className="account-copy"><strong>{user?.name?.split(' ')[0]}</strong><small>{user?.role}</small></span>
                    <CaretDown className="account-chevron" aria-hidden="true" />
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to={dashboardLinks[user?.role] || '/'} onClick={closeMenu}>
                      <House aria-hidden="true" />Dashboard
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to={profileLinks[user?.role] || '/'} onClick={closeMenu}>
                      <UserCircle aria-hidden="true" />Profile
                    </Dropdown.Item>
                    {user?.role !== 'admin' && (
                      <Dropdown.Item as={Link} to={user?.role === 'patient' ? '/patient/appointments' : '/doctor/appointments'} onClick={closeMenu}>
                        <CalendarBlank aria-hidden="true" />Appointments
                      </Dropdown.Item>
                    )}
                    {user?.role !== 'admin' && (
                      <Dropdown.Item as={Link} to={`/${user?.role}/support`} onClick={closeMenu}>
                        <Headset aria-hidden="true" />Support center
                      </Dropdown.Item>
                    )}
                    {user?.role === 'admin' && (
                      <>
                        <Dropdown.Item as={Link} to="/admin/disputes" onClick={closeMenu}>
                          <Headset aria-hidden="true" />Support cases
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/admin/settings" onClick={closeMenu}>
                          <GearSix aria-hidden="true" />Settings
                        </Dropdown.Item>
                      </>
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <Button type="button" variant="outline-light" className="logout-button" onClick={handleLogout}>
                  <SignOut aria-hidden="true" weight="regular" />
                  <span>Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="light"
                  className="theme-toggle"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                  aria-pressed={theme === 'dark'}
                >
                  {theme === 'dark' ? <Sun aria-hidden="true" weight="regular" /> : <Moon aria-hidden="true" weight="regular" />}
                  <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
                </Button>
                <Button as={Link} to="/login" onClick={closeMenu} variant="link" className="login-link">Sign in</Button>
                <Button as={Link} to="/register" onClick={closeMenu} variant="primary">Create account</Button>
              </>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
};

export default Navbar;
