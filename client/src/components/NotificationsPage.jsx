import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, ListGroup, Row, Spinner } from 'react-bootstrap';
import { Bell as FaBell, CalendarCheck as FaCalendarCheck, Checks as FaCheckDouble, Info as FaInfoCircle, Stethoscope as FaUserMd } from '@phosphor-icons/react';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const typeColor = {
  appointment_created: 'primary',
  appointment_approved: 'success',
  appointment_rejected: 'danger',
  appointment_cancelled: 'secondary',
  appointment_rescheduled: 'primary',
  appointment_reminder: 'warning',
  appointment_completed: 'info',
  doctor_application: 'primary',
  doctor_approved: 'success',
  doctor_rejected: 'danger',
  general: 'dark',
};

const appointmentTypes = new Set([
  'appointment_created', 'appointment_approved', 'appointment_rejected',
  'appointment_cancelled', 'appointment_rescheduled', 'appointment_reminder',
  'appointment_completed',
]);

const NotificationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await api.get('/notifications');
        setNotifications(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'We could not load your notifications.');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((items) => items.map((item) => (
        item._id === id ? { ...item, isRead: true } : item
      )));
      window.dispatchEvent(new Event('docvia:notifications-changed'));
    } catch (err) {
      setError(err.response?.data?.message || 'The notification could not be updated.');
    }
  };

  const markAllRead = async () => {
    setUpdating(true);
    try {
      await api.put('/notifications/read-all');
      setNotifications((items) => items.map((item) => ({ ...item, isRead: true })));
      window.dispatchEvent(new Event('docvia:notifications-changed'));
    } catch (err) {
      setError(err.response?.data?.message || 'Notifications could not be updated.');
    } finally {
      setUpdating(false);
    }
  };

  const openNotification = async (notification) => {
    if (!notification.isRead) await markAsRead(notification._id);
    if (!notification.relatedId) return;

    if (appointmentTypes.has(notification.type)) {
      if (user?.role === 'patient') navigate(`/patient/appointments/${notification.relatedId}`);
      if (user?.role === 'doctor') navigate('/doctor/appointments');
      if (user?.role === 'admin') navigate('/admin/appointments');
    } else if (notification.type?.startsWith('doctor_')) {
      if (user?.role === 'admin') navigate('/admin/doctors');
      else navigate(user?.role === 'doctor' ? '/doctor/profile' : '/patient/apply-as-doctor');
    }
  };

  const unread = notifications.filter((item) => !item.isRead).length;

  return (
    <div className="app-page">
      <Container className="py-4 py-lg-5">
        <Row className="justify-content-center">
          <Col xs={12} lg={9} xl={8}>
            <div className="page-heading d-flex flex-wrap justify-content-between align-items-end gap-3">
              <div>
                <span className="section-kicker">Inbox</span>
                <h1 className="page-title mt-2 mb-1">Notifications</h1>
                <p className="text-muted mb-0">
                  {unread ? `${unread} unread update${unread === 1 ? '' : 's'} need your attention.` : 'You are all caught up.'}
                </p>
              </div>
              {unread > 0 && (
                <Button variant="outline-primary" onClick={markAllRead} disabled={updating}>
                  {updating ? <Spinner size="sm" className="me-2" /> : <FaCheckDouble className="me-2" />}
                  Mark all as read
                </Button>
              )}
            </div>

            {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

            {loading ? (
              <div className="page-loading" role="status" aria-live="polite">
                <Spinner animation="border" />
                <span>Loading notifications...</span>
              </div>
            ) : notifications.length === 0 ? (
              <Card className="content-card empty-state">
                <Card.Body>
                  <div className="empty-state-icon"><FaBell aria-hidden="true" /></div>
                  <h2>No notifications yet</h2>
                  <p>Booking and account updates will appear here.</p>
                </Card.Body>
              </Card>
            ) : (
              <Card className="content-card overflow-hidden">
                <ListGroup variant="flush" className="notification-list">
                  {notifications.map((notification) => {
                    const isAppointment = appointmentTypes.has(notification.type);
                    const Icon = isAppointment ? FaCalendarCheck : notification.type?.startsWith('doctor_') ? FaUserMd : FaInfoCircle;
                    return (
                      <ListGroup.Item
                        key={notification._id}
                        action={Boolean(notification.relatedId)}
                        onClick={() => openNotification(notification)}
                        className={notification.isRead ? 'notification-item' : 'notification-item notification-unread'}
                      >
                        <div className={`notification-icon text-${typeColor[notification.type] || 'dark'}`}>
                          <Icon aria-hidden="true" />
                        </div>
                        <div className="notification-content">
                          <div className="d-flex flex-wrap justify-content-between gap-2">
                            <h2>{notification.title}</h2>
                            {!notification.isRead && <Badge bg="primary">New</Badge>}
                          </div>
                          <p>{notification.message}</p>
                          <time dateTime={notification.createdAt}>
                            {new Date(notification.createdAt).toLocaleString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                              hour: '2-digit', minute: '2-digit',
                            })}
                          </time>
                        </div>
                      </ListGroup.Item>
                    );
                  })}
                </ListGroup>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default NotificationsPage;
