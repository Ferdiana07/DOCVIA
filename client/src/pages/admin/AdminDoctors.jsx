import { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import { Stethoscope as FaUserMd, CheckCircle as FaCheckCircle, XCircle as FaTimesCircle, Hourglass as FaHourglassHalf, Phone as FaPhone, GraduationCap as FaGraduationCap, Star as FaStar, Money as FaMoneyBill, MapPin as FaMapMarkerAlt } from '@phosphor-icons/react';
import api from '../../services/api';

const statusConfig = {
  pending:  { color: 'warning',  icon: <FaHourglassHalf />, label: 'Pending' },
  approved: { color: 'success',  icon: <FaCheckCircle />,   label: 'Approved' },
  rejected: { color: 'danger',   icon: <FaTimesCircle />,   label: 'Rejected' },
};

const AdminDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [error, setError] = useState('');

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/doctors');
      setDoctors(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Doctor applications could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchDoctors);
  }, [fetchDoctors]);

  const openModal = (doctor) => {
    setSelected(doctor);
    setRejectReason('');
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.put(`/admin/doctors/${selected._id}/approve`);
      await fetchDoctors();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.put(`/admin/doctors/${selected._id}/reject`, { reason: rejectReason });
      await fetchDoctors();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const renderDoctorCard = (doctor) => {
    const cfg = statusConfig[doctor.status];
    return (
      <Card key={doctor._id} className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <Row className="align-items-center g-2">
            <Col xs="auto">
              <div
                className="rounded-circle bg-primary d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 48, height: 48 }}
              >
                {doctor.name?.charAt(0)}
              </div>
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                <span className="fw-semibold">Dr. {doctor.name}</span>
                <Badge bg={cfg.color} className="d-flex align-items-center gap-1">
                  {cfg.icon} {cfg.label}
                </Badge>
              </div>
              <div className="text-muted small">
                <FaUserMd className="me-1" />{doctor.specialization}
                <span className="mx-2">·</span>
                <FaStar className="me-1" />{doctor.experience} yrs exp
                <span className="mx-2">·</span>
                <FaGraduationCap className="me-1" />{doctor.qualification}
              </div>
              <div className="text-muted small mt-1">
                Applied: {new Date(doctor.createdAt).toLocaleDateString('en-GB', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </div>
            </Col>
            <Col xs="auto">
              <Button variant="outline-primary" size="sm" onClick={() => openModal(doctor)}>
                Review
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const grouped = {
    pending:  doctors.filter((d) => d.status === 'pending'),
    approved: doctors.filter((d) => d.status === 'approved'),
    rejected: doctors.filter((d) => d.status === 'rejected'),
  };

  return (
    <div className="app-page">
      <Container className="py-4">
        <span className="section-kicker">Clinical network</span>
        <h1 className="page-title mt-2 mb-4"><FaUserMd className="me-2 text-success" />Doctor applications</h1>

        {error && !showModal && <Alert variant="danger" role="alert">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Tabs defaultActiveKey="pending" className="mb-3">
            {Object.entries(grouped).map(([status, docs]) => (
              <Tab
                key={status}
                eventKey={status}
                title={
                  <span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
                    {docs.length > 0 && (
                      <Badge bg={statusConfig[status]?.color} pill style={{ fontSize: '0.65rem' }}>
                        {docs.length}
                      </Badge>
                    )}
                  </span>
                }
              >
                <div className="pt-2">
                  {docs.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center py-4">
                        <p className="text-muted mb-0">No {status} doctor applications.</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    docs.map(renderDoctorCard)
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        )}
      </Container>

      {/* Doctor Detail / Action Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        {selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Doctor Application — Dr. {selected.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}

              {/* Doctor info */}
              <Row className="g-3 mb-3">
                <Col sm={6}>
                  <div className="text-muted small">Specialization</div>
                  <div className="fw-semibold"><FaUserMd className="me-1 text-primary" />{selected.specialization}</div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted small mb-2">Availability schedule</div>
                  <div className="d-flex flex-wrap gap-2">
                    {selected.availability?.length ? selected.availability.map((slot) => (
                      <span className="schedule-chip" key={slot.day}><strong>{slot.day}</strong> {slot.startTime} - {slot.endTime}</span>
                    )) : <span className="text-danger small">No working schedule provided</span>}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Qualification</div>
                  <div className="fw-semibold"><FaGraduationCap className="me-1 text-primary" />{selected.qualification}</div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Experience</div>
                  <div className="fw-semibold"><FaStar className="me-1 text-warning" />{selected.experience} years</div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Consultation Fee</div>
                  <div className="fw-semibold">
                    <FaMoneyBill className="me-1 text-success" />
                    IDR {selected.consultationFee?.toLocaleString('id-ID')}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Phone</div>
                  <div className="fw-semibold"><FaPhone className="me-1" />{selected.phone || 'Not provided'}</div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Account Email</div>
                  <div className="fw-semibold">{selected.userId?.email}</div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Clinic Location</div>
                  <div className="fw-semibold"><FaMapMarkerAlt className="me-1" />{selected.location || 'Not provided'}</div>
                </Col>
                {selected.description && (
                  <Col xs={12}>
                    <div className="text-muted small">Description</div>
                    <div className="fw-semibold">{selected.description}</div>
                  </Col>
                )}
                <Col sm={6}>
                  <div className="text-muted small">Current Status</div>
                  <Badge bg={statusConfig[selected.status]?.color}>
                    {statusConfig[selected.status]?.label}
                  </Badge>
                </Col>
              </Row>

              {/* Reject Reason Input */}
              {selected.status === 'pending' && (
                <>
                  <hr />
                  <Form.Group>
                    <Form.Label htmlFor="reject-reason" className="fw-semibold">Rejection reason (optional)</Form.Label>
                    <Form.Control
                      id="reject-reason"
                      as="textarea"
                      rows={2}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Provide a reason if rejecting..."
                    />
                  </Form.Group>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Close</Button>
              {selected.status === 'pending' && (
                <>
                  <Button variant="danger" onClick={handleReject} disabled={actionLoading}>
                    {actionLoading ? <Spinner size="sm" className="me-2" /> : null}
                    Reject
                  </Button>
                  <Button variant="success" onClick={handleApprove} disabled={actionLoading}>
                    {actionLoading ? <Spinner size="sm" className="me-2" /> : null}
                    Approve
                  </Button>
                </>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminDoctors;
