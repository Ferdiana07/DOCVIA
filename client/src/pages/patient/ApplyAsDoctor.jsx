import { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import {
  Stethoscope as FaUserMd, FirstAidKit as FaBriefcaseMedical, Star as FaStar, Money as FaMoneyBill,
  GraduationCap as FaGraduationCap, Phone as FaPhone, File as FaFileAlt, CheckCircle as FaCheckCircle, MapPin as FaMapMarkerAlt,
} from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const ApplyAsDoctor = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    specialization: '',
    experience: '',
    qualification: '',
    consultationFee: '',
    description: '',
    phone: '',
    location: '',
  });

  // Availability: array of { day, startTime, endTime }
  const [availability, setAvailability] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const toggleDay = (day) => {
    setAvailability((prev) => {
      const exists = prev.find((a) => a.day === day);
      if (exists) {
        return prev.filter((a) => a.day !== day);
      }
      return [...prev, { day, startTime: '09:00', endTime: '17:00' }];
    });
  };

  const updateSlot = (day, field, value) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, [field]: value } : a))
    );
  };

  const validate = () => {
    const { name, specialization, experience, qualification, consultationFee } = formData;
    if (!name.trim()) return 'Full name is required.';
    if (!specialization.trim()) return 'Specialization is required.';
    if (experience === '' || !Number.isFinite(Number(experience)) || Number(experience) < 0) return 'Valid years of experience is required.';
    if (!qualification.trim()) return 'Qualification is required.';
    if (consultationFee === '' || !Number.isFinite(Number(consultationFee)) || Number(consultationFee) < 0) return 'Valid consultation fee is required.';
    if (availability.length === 0) return 'Select at least one available working day.';
    const invalidSlot = availability.find((slot) => !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime);
    if (invalidSlot) return `${invalidSlot.day} end time must be later than its start time.`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setLoading(true);
    setError('');

    try {
      await api.post('/doctors/apply', {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        availability,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Application failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="app-page d-flex align-items-center">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} md={6} className="text-center">
              <span className="empty-state-icon"><FaCheckCircle aria-hidden="true" /></span>
              <h1 className="page-title mx-auto mb-2">Application submitted</h1>
              <p className="text-muted mb-4">
                Your doctor application is now <strong>pending review</strong> by an administrator.
                You will receive a notification once it has been reviewed.
              </p>
              <Button variant="primary" onClick={() => navigate('/patient/dashboard')}>
                Back to Dashboard
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="app-page">
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            {/* Header */}
            <div className="text-center mb-4">
              <FaUserMd size={48} className="text-primary mb-2" />
              <h1 className="page-title mx-auto">Apply as a doctor</h1>
              <p className="text-muted">
                Fill in your professional details. Your application will be reviewed by an admin.
              </p>
            </div>

            {error && <Alert variant="danger" className="py-2" role="alert">{error}</Alert>}

            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <Form onSubmit={handleSubmit}>
                  {/* Personal / Professional Info */}
                  <h6 className="fw-bold text-primary mb-3">
                    <FaUserMd className="me-2" />Professional Information
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-name" className="fw-semibold">Full name</Form.Label>
                        <Form.Control
                          id="apply-name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Dr. Your Name"
                          required
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-location" className="fw-semibold">
                          <FaMapMarkerAlt className="me-1" /> Clinic Location
                        </Form.Label>
                        <Form.Control
                          id="apply-location"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          placeholder="City, district, or clinic"
                        />
                        <Form.Text>Shown to patients when they compare doctors.</Form.Text>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-specialization" className="fw-semibold">
                          <FaBriefcaseMedical className="me-1" /> Specialization *
                        </Form.Label>
                        <Form.Control
                          id="apply-specialization"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          placeholder="e.g. Cardiologist"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-qualification" className="fw-semibold">
                          <FaGraduationCap className="me-1" /> Qualification *
                        </Form.Label>
                        <Form.Control
                          id="apply-qualification"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleChange}
                          placeholder="e.g. MD, MBBS, SpJP"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-experience" className="fw-semibold">
                          <FaStar className="me-1" /> Years of Experience *
                        </Form.Label>
                        <Form.Control
                          id="apply-experience"
                          type="number"
                          name="experience"
                          value={formData.experience}
                          onChange={handleChange}
                          placeholder="e.g. 5"
                          min="0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-fee" className="fw-semibold">
                          <FaMoneyBill className="me-1" /> Consultation Fee (IDR) *
                        </Form.Label>
                        <Form.Control
                          id="apply-fee"
                          type="number"
                          name="consultationFee"
                          value={formData.consultationFee}
                          onChange={handleChange}
                          placeholder="e.g. 150000"
                          min="0"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="apply-phone" className="fw-semibold">
                          <FaPhone className="me-1" /> Phone Number
                        </Form.Label>
                        <Form.Control
                          id="apply-phone"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+62..."
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-4">
                        <Form.Label htmlFor="apply-description" className="fw-semibold">
                          <FaFileAlt className="me-1" /> About / Description
                        </Form.Label>
                        <Form.Control
                          id="apply-description"
                          as="textarea"
                          rows={3}
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          placeholder="Brief professional description..."
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Availability */}
                  <h6 className="fw-bold text-primary mb-3">Availability Schedule</h6>
                  <p className="text-muted small mb-3">
                    Select the days you are available and set your working hours.
                  </p>
                  <Row className="g-2 mb-4">
                    {DAYS.map((day) => {
                      const slot = availability.find((a) => a.day === day);
                      const isSelected = !!slot;
                      return (
                        <Col xs={12} key={day}>
                          <div className={`border rounded p-2 ${isSelected ? 'border-primary bg-light' : ''}`}>
                            <Form.Check
                              type="checkbox"
                              id={`day-${day}`}
                              label={<strong>{day}</strong>}
                              checked={isSelected}
                              onChange={() => toggleDay(day)}
                            />
                            {isSelected && (
                              <Row className="mt-2 g-2">
                                <Col xs={6}>
                                  <Form.Label htmlFor={`apply-${day}-start`} className="small text-muted mb-1">Start time</Form.Label>
                                  <Form.Control
                                    id={`apply-${day}-start`}
                                    type="time"
                                    size="sm"
                                    value={slot.startTime}
                                    onChange={(e) => updateSlot(day, 'startTime', e.target.value)}
                                  />
                                </Col>
                                <Col xs={6}>
                                  <Form.Label htmlFor={`apply-${day}-end`} className="small text-muted mb-1">End time</Form.Label>
                                  <Form.Control
                                    id={`apply-${day}-end`}
                                    type="time"
                                    size="sm"
                                    value={slot.endTime}
                                    onChange={(e) => updateSlot(day, 'endTime', e.target.value)}
                                  />
                                </Col>
                              </Row>
                            )}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>

                  {/* Notice */}
                  <Alert variant="info" className="py-2 small">
                    <strong>Note:</strong> Your application will be reviewed by an administrator.
                    You will be notified once it is approved or rejected. After approval,
                    your role will change to <Badge bg="info">doctor</Badge> and you can start accepting appointments.
                  </Alert>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <><Spinner size="sm" className="me-2" /> Submitting...</>
                    ) : (
                      'Submit Application'
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ApplyAsDoctor;
