import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge, Modal,
} from 'react-bootstrap';
import {
  CalendarPlus as FaCalendarPlus,
  UploadSimple as FaUpload,
  CalendarBlank,
  Clock,
  MapPin,
  CurrencyCircleDollar,
  FileText,
  ShieldCheck,
} from '@phosphor-icons/react';
import api from '../../services/api';
import { toLocalDateInputValue } from '../../utils/date';
import { getDoctorImage } from '../../utils/doctorImage';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
  });
  const [document, setDocument] = useState(null);
  const [minimumDate] = useState(() => toLocalDateInputValue());

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/doctors/${doctorId}`);
        setDoctor(data.data);
      } catch {
        setError('Doctor not found.');
      } finally {
        setLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (!formData.appointmentDate) {
      return;
    }
    let active = true;
    const fetchSlots = async () => {
      setError('');
      try {
        const { data } = await api.get(`/doctors/${doctorId}/available-slots`, { params: { date: formData.appointmentDate } });
        if (active) setAvailableSlots(data.data);
      } catch (err) {
        if (active) {
          setAvailableSlots([]);
          setError(err.response?.data?.message || 'Available times could not be loaded.');
        }
      } finally {
        if (active) setLoadingSlots(false);
      }
    };
    fetchSlots();
    return () => { active = false; };
  }, [doctorId, formData.appointmentDate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'appointmentDate') {
      setFormData(prev => ({ ...prev, appointmentDate: value, appointmentTime: '' }));
      setAvailableSlots([]);
      setLoadingSlots(Boolean(value));
    }
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB.');
      setDocument(null);
      e.target.value = '';
      return;
    }
    setDocument(file);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.appointmentDate || !formData.appointmentTime || !formData.reason.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setShowConfirmation(true);
  };

  const submitBooking = async () => {

    setSubmitting(true);
    setError('');

    try {
      const payload = new FormData();
      payload.append('doctorId', doctorId);
      payload.append('appointmentDate', formData.appointmentDate);
      payload.append('appointmentTime', formData.appointmentTime);
      payload.append('reason', formData.reason);
      if (document) payload.append('document', document);

      await api.post('/appointments', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setShowConfirmation(false);
      setSuccess('Appointment request sent. The doctor will review it before confirmation.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedAppointmentDate = formData.appointmentDate
    ? new Intl.DateTimeFormat('en-GB', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(new Date(`${formData.appointmentDate}T00:00:00Z`))
    : '';

  if (loadingDoctor) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <Container className="app-page py-5">
        <Alert variant="danger">{error || 'Doctor not found.'}</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/doctors')}>Back to doctors</Button>
      </Container>
    );
  }

  return (
    <div className="app-page">
      <div className="page-banner">
        <Container>
          <h1 className="page-title text-white mb-1">
            <FaCalendarPlus className="me-3" />
            Book appointment
          </h1>
          {doctor && <p className="mb-0" style={{ opacity: 0.9 }}>with Dr. {doctor.name}, {doctor.specialization}</p>}
        </Container>
      </div>

      <Container className="py-5">
        <Row className="justify-content-center">
          <Col lg={8}>
            {success && <Alert variant="success">{success}</Alert>}
            {error && <Alert variant="danger">{error}</Alert>}

            {/* Doctor Info Card */}
            {doctor && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center gap-3">
                    <img className="booking-doctor-avatar" src={getDoctorImage(doctor)} alt={`Dr. ${doctor.name}`} width="56" height="56" />
                    <div>
                      <h6 className="fw-bold mb-0">Dr. {doctor.name}</h6>
                      <div className="text-muted small">{doctor.specialization}, {doctor.experience} years exp.</div>
                      <Badge bg="primary" className="mt-1">
                        Fee: Rp {doctor.consultationFee?.toLocaleString('id-ID')}
                      </Badge>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Booking Form */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-4">Appointment Details</h5>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="appointment-date" className="fw-semibold">Appointment date *</Form.Label>
                        <Form.Control
                          type="date"
                          name="appointmentDate"
                          id="appointment-date"
                          value={formData.appointmentDate}
                          onChange={handleChange}
                          min={minimumDate}
                          required
                        />
                        {formData.appointmentDate && !loadingSlots && availableSlots.length === 0 && (
                          <Form.Text className="text-danger">
                            No bookable times remain for this date. Try another day.
                          </Form.Text>
                        )}
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="appointment-time" className="fw-semibold">Appointment time *</Form.Label>
                        <Form.Select
                          name="appointmentTime"
                          id="appointment-time"
                          value={formData.appointmentTime}
                          onChange={handleChange}
                          required
                          disabled={loadingSlots || availableSlots.length === 0}
                        >
                          <option value="">
                            {loadingSlots ? 'Checking live availability...'
                              : availableSlots.length === 0
                              ? 'Select a valid date first'
                              : 'Select a time slot'}
                          </option>
                          {availableSlots.map(slot => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="appointment-reason" className="fw-semibold">Reason for visit *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      name="reason"
                      id="appointment-reason"
                      value={formData.reason}
                      onChange={handleChange}
                      placeholder="Describe your symptoms or reason for the appointment..."
                      required
                      maxLength={500}
                    />
                    <Form.Text className="text-muted">
                      {formData.reason.length}/500 characters
                    </Form.Text>
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="appointment-document" className="fw-semibold">
                      <FaUpload className="me-2" />
                      Supporting Document <span className="text-muted fw-normal">(optional)</span>
                    </Form.Label>
                    <Form.Control
                      type="file"
                      id="appointment-document"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={handleFileChange}
                    />
                    <Form.Text className="text-muted">
                      Accepted: JPG, PNG, PDF. Max size: 5 MB.
                    </Form.Text>
                  </Form.Group>

                  <div className="d-flex gap-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="fw-semibold"
                      disabled={submitting || Boolean(success) || loadingSlots || availableSlots.length === 0}
                    >
                      {submitting ? (
                        <><Spinner size="sm" className="me-2" />Sending...</>
                      ) : (
                        <><FaCalendarPlus className="me-2" />Review booking</>
                      )}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      size="lg"
                      onClick={() => navigate(-1)}
                      disabled={submitting}
                    >
                      Cancel
                    </Button>
                  </div>
                  {success && (
                    <Button variant="link" className="px-0 mt-3" onClick={() => navigate('/patient/appointments')}>
                      View my appointments
                    </Button>
                  )}
                </Form>
              </Card.Body>
            </Card>

            {/* Availability Reference */}
            {doctor?.availability?.length > 0 && (
              <Card className="border-0 shadow-sm mt-4">
                <Card.Body className="p-4">
                  <h6 className="fw-bold mb-3">Doctor's Availability</h6>
                  <div className="d-flex flex-wrap gap-2">
                    {doctor.availability
                      .slice()
                      .sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day))
                      .map(slot => (
                        <div key={slot.day} className="border rounded p-2 text-center" style={{ minWidth: 110 }}>
                          <div className="fw-semibold text-primary small">{slot.day}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      ))}
                  </div>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>

      <Modal
        show={showConfirmation}
        onHide={() => !submitting && setShowConfirmation(false)}
        centered
        backdrop={submitting ? 'static' : true}
        keyboard={!submitting}
        className="booking-confirmation-modal"
        aria-labelledby="booking-confirmation-title"
      >
        <Modal.Header closeButton={!submitting}>
          <div>
            <span className="section-kicker">Final review</span>
            <Modal.Title id="booking-confirmation-title">Review appointment request</Modal.Title>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="booking-review-doctor">
            <img src={getDoctorImage(doctor)} alt="" width="68" height="68" />
            <div>
              <strong>Dr. {doctor.name}</strong>
              <span>{doctor.specialization}</span>
            </div>
          </div>

          <div className="booking-review-grid" aria-label="Appointment summary">
            <div>
              <CalendarBlank aria-hidden="true" />
              <span><small>Date</small><strong>{formattedAppointmentDate}</strong></span>
            </div>
            <div>
              <Clock aria-hidden="true" />
              <span><small>Time</small><strong>{formData.appointmentTime}</strong></span>
            </div>
            <div>
              <MapPin aria-hidden="true" />
              <span><small>Clinic</small><strong>{doctor.location || 'Clinic location provided after confirmation'}</strong></span>
            </div>
            <div>
              <CurrencyCircleDollar aria-hidden="true" />
              <span><small>Consultation fee</small><strong>Rp {doctor.consultationFee?.toLocaleString('id-ID')}</strong></span>
            </div>
          </div>

          <div className="booking-review-note">
            <FileText aria-hidden="true" />
            <div>
              <small>Reason for visit</small>
              <p>{formData.reason}</p>
              {document && <span>Attachment: {document.name}</span>}
            </div>
          </div>

          <div className="booking-pending-note">
            <ShieldCheck aria-hidden="true" />
            <p><strong>This sends a request, not an instant confirmation.</strong> The appointment remains pending until the doctor accepts it.</p>
          </div>

          {error && <Alert variant="danger" className="mt-3 mb-0">{error}</Alert>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowConfirmation(false)} disabled={submitting}>
            Back to edit
          </Button>
          <Button variant="primary" onClick={submitBooking} disabled={submitting}>
            {submitting ? <><Spinner size="sm" className="me-2" />Sending request...</> : 'Send booking request'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default BookAppointmentPage;
