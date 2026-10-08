import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Badge, Button, Spinner, Alert, Modal,
} from 'react-bootstrap';
import {
  CalendarCheck as FaCalendarCheck, Eye as FaEye, Prohibit as FaBan,
  ArrowClockwise as FaRedo,
} from '@phosphor-icons/react';
import api from '../../services/api';
import statusConfig from '../../constants/appointmentStatus';

const MyAppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [cancelModal, setCancelModal] = useState({ show: false, appointmentId: null });
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointments = useCallback(async (status = '') => {
    setLoading(true);
    setError('');
    try {
      const params = status ? { status } : {};
      const { data } = await api.get('/appointments', { params });
      setAppointments(data.data);
    } catch {
      setError('Failed to load appointments.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => fetchAppointments(filterStatus));
  }, [filterStatus, fetchAppointments]);

  const handleCancelConfirm = async () => {
    setCancelling(true);
    try {
      await api.put(`/appointments/${cancelModal.appointmentId}/status`, {
        status: 'cancelled',
      });
      setCancelModal({ show: false, appointmentId: null });
      fetchAppointments(filterStatus);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel appointment.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="app-page">
      <div className="page-banner">
        <Container>
          <span className="section-kicker section-kicker-light">Patient history</span>
          <h1 className="page-title text-white mt-2 mb-1">
            <FaCalendarCheck className="me-3" />
            My appointments
          </h1>
          <p className="mb-0 text-white-75">Review upcoming visits, confirmations, doctor notes, and past care.</p>
        </Container>
      </div>

      <Container className="py-4">
        {/* Status Filter */}
        <div className="filter-toolbar" aria-label="Filter appointments by status">
          <span className="fw-semibold text-muted">Filter by status:</span>
          {['', 'pending', 'approved', 'completed', 'rejected', 'cancelled'].map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? 'primary' : 'outline-secondary'}
              onClick={() => setFilterStatus(s)}
            >
              {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </div>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-5">
            <FaCalendarCheck size={56} className="text-muted mb-3" />
            <h5 className="text-muted">No appointments found</h5>
            {filterStatus && (
              <Button variant="outline-primary" size="sm" onClick={() => setFilterStatus('')}>
                Show All
              </Button>
            )}
            {!filterStatus && <Button as={Link} to="/doctors" variant="primary" size="sm">Find a doctor</Button>}
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {appointments.map(appt => {
              const cfg = statusConfig[appt.status];
              const canCancel = ['pending', 'approved'].includes(appt.status);
              return (
                <Card key={appt._id} className="content-card appointment-history-card">
                  <Card.Body className="p-4">
                    <Row className="align-items-center">
                      <Col xs={12} md={7}>
                        <div className="d-flex align-items-center gap-3 mb-2">
                          <div
                            className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{ width: 48, height: 48, flexShrink: 0 }}
                          >
                            {appt.doctorId?.name?.charAt(0) || 'D'}
                          </div>
                          <div>
                            <div className="fw-bold">Dr. {appt.doctorId?.name}</div>
                            <div className="text-muted small">{appt.doctorId?.specialization}</div>
                          </div>
                        </div>
                        <div className="text-muted small">
                          <strong>Date:</strong>{' '}
                          {new Date(appt.appointmentDate).toLocaleDateString('en-GB', {
                            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                          })}{' '}
                          at <strong>{appt.appointmentTime}</strong>
                        </div>
                        <div className="text-muted small mt-1">
                          <strong>Reason:</strong> {appt.reason}
                        </div>
                        {appt.doctorNotes && (
                          <div className="text-muted small mt-1">
                            <strong>Doctor's note:</strong> {appt.doctorNotes}
                          </div>
                        )}
                      </Col>
                      <Col xs={12} md={5} className="mt-3 mt-md-0">
                        <div className="d-flex flex-column align-items-md-end gap-2">
                          <Badge bg={cfg.color} className="d-flex align-items-center gap-1 px-3 py-2">
                            {cfg.icon} <span className="ms-1">{cfg.label}</span>
                          </Badge>
                          <div className="d-flex flex-wrap gap-2">
                            <Button
                              as={Link}
                              to={`/patient/appointments/${appt._id}`}
                              variant="outline-primary"
                              size="sm"
                            >
                              <FaEye className="me-1" /> Details
                            </Button>
                            {canCancel && (
                              <Button
                                as={Link}
                                to={`/patient/appointments/${appt._id}/reschedule`}
                                variant="outline-secondary"
                                size="sm"
                              >
                                <FaRedo className="me-1" /> Reschedule
                              </Button>
                            )}
                            {canCancel && (
                              <Button
                                variant="outline-danger"
                                size="sm"
                                onClick={() => setCancelModal({ show: true, appointmentId: appt._id })}
                              >
                                <FaBan className="me-1" /> Cancel
                              </Button>
                            )}
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>
        )}
      </Container>

      {/* Cancel Confirmation Modal */}
      <Modal
        show={cancelModal.show}
        onHide={() => setCancelModal({ show: false, appointmentId: null })}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel appointment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setCancelModal({ show: false, appointmentId: null })}
          >
            Keep appointment
          </Button>
          <Button variant="danger" onClick={handleCancelConfirm} disabled={cancelling}>
            {cancelling ? <Spinner size="sm" /> : 'Cancel appointment'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyAppointmentsPage;
