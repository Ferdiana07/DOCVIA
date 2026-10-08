import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container, Row, Col, Card, Badge, Button, ListGroup, Spinner, Alert,
} from 'react-bootstrap';
import {
  Star as FaStar, CurrencyCircleDollar as FaMoneyBillWave, GraduationCap as FaGraduationCap,
  Clock as FaClock, ArrowLeft as FaArrowLeft, CalendarPlus as FaCalendarPlus, MapPin as FaMapMarkerAlt,
  Phone as FaPhone,
} from '@phosphor-icons/react';
import api from '../../services/api';
import useAuth from '../../hooks/useAuth';
import { getDoctorImage } from '../../utils/doctorImage';

const DAYS_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data } = await api.get(`/doctors/${id}`);
        setDoctor(data.data);
      } catch {
        setError('Doctor not found or no longer available.');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctor();
  }, [id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'patient') {
      setBookingError('Only patient accounts can request appointments.');
      return;
    }
    navigate(`/patient/book/${id}`);
  };

  const sortedAvailability = doctor?.availability
    ?.slice()
    .sort((a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)) || [];

  if (loading) {
    return (
      <div className="app-page page-loading" role="status" aria-live="polite">
        <Spinner animation="border" variant="primary" />
        <span>Loading doctor profile...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button as={Link} to="/doctors" variant="outline-primary">
          <FaArrowLeft className="me-2" /> Back to Doctors
        </Button>
      </Container>
    );
  }

  return (
    <div className="app-page">
      {/* Header */}
      <div className="page-banner">
        <Container>
          <Button
            as={Link}
            to="/doctors"
            variant="outline-light"
            size="sm"
            className="mb-3"
          >
            <FaArrowLeft className="me-2" /> Back to Doctors
          </Button>
          <div className="doctor-profile-hero">
            <img
              src={getDoctorImage(doctor)}
              alt={`Dr. ${doctor.name}`}
              className="doctor-profile-avatar"
              width="128"
              height="128"
            />
            <div className="doctor-profile-heading">
              <h1 className="page-title text-white mb-1">Dr. {doctor.name}</h1>
              <Badge bg="light" text="primary" className="me-2 fs-6">{doctor.specialization}</Badge>
              <Badge bg={sortedAvailability.length ? 'success' : 'secondary'}>{sortedAvailability.length ? 'Booking open' : 'Schedule unavailable'}</Badge>
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {bookingError && <Alert variant="warning" dismissible onClose={() => setBookingError('')}>{bookingError}</Alert>}
        <Row className="g-4">
          {/* Left: Doctor Info */}
          <Col lg={8}>
            {/* About */}
            {doctor.description && (
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">About Dr. {doctor.name}</h5>
                  <p className="text-muted mb-0">{doctor.description}</p>
                </Card.Body>
              </Card>
            )}

            {/* Qualifications & Details */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">Professional Information</h5>
                <ListGroup variant="flush">
                  <ListGroup.Item className="px-0 d-flex align-items-center gap-3">
                    <FaGraduationCap className="text-primary" size={20} />
                    <div>
                      <div className="fw-semibold">Qualification</div>
                      <div className="text-muted">{doctor.qualification}</div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 d-flex align-items-center gap-3">
                    <FaStar className="text-warning" size={20} />
                    <div>
                      <div className="fw-semibold">Experience</div>
                      <div className="text-muted">{doctor.experience} years of practice</div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item className="px-0 d-flex align-items-center gap-3">
                    <FaMoneyBillWave className="text-success" size={20} />
                    <div>
                      <div className="fw-semibold">Consultation Fee</div>
                      <div className="text-muted">Rp {doctor.consultationFee?.toLocaleString('id-ID')}</div>
                    </div>
                  </ListGroup.Item>
                  {doctor.phone && (
                    <ListGroup.Item className="px-0 d-flex align-items-center gap-3">
                      <FaPhone className="text-info" size={20} aria-hidden="true" />
                      <div>
                        <div className="fw-semibold">Contact</div>
                        <div className="text-muted">{doctor.phone}</div>
                      </div>
                    </ListGroup.Item>
                  )}
                  {doctor.location && (
                    <ListGroup.Item className="px-0 d-flex align-items-center gap-3">
                      <FaMapMarkerAlt className="text-primary" size={20} />
                      <div>
                        <div className="fw-semibold">Clinic Location</div>
                        <div className="text-muted">{doctor.location}</div>
                      </div>
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Availability Schedule */}
            <Card className="border-0 shadow-sm">
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3">
                  <FaClock className="me-2 text-primary" />
                  Availability Schedule
                </h5>
                {sortedAvailability.length > 0 ? (
                  <div className="d-flex flex-wrap gap-2">
                    {sortedAvailability.map((slot) => (
                      <div
                        key={slot.day}
                        className="border rounded p-3 text-center"
                        style={{ minWidth: 120 }}
                      >
                        <div className="fw-semibold text-primary">{slot.day}</div>
                        <div className="text-muted small">{slot.startTime} - {slot.endTime}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">
                    Availability schedule not specified. Please contact the doctor directly.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Right: Booking Card */}
          <Col lg={4}>
            <Card className="border-0 shadow-sm sticky-top" style={{ top: 80 }}>
              <Card.Body className="p-4">
                <h2 className="h5 fw-bold mb-3">Book an appointment</h2>
                <div className="bg-light rounded p-3 mb-4">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Specialization</span>
                    <span className="fw-semibold">{doctor.specialization}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Experience</span>
                    <span className="fw-semibold">{doctor.experience} years</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Consultation Fee</span>
                    <span className="fw-semibold text-primary">Rp {doctor.consultationFee?.toLocaleString('id-ID')}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 fw-semibold"
                  onClick={handleBooking}
                  id="book-appointment-btn"
                  disabled={sortedAvailability.length === 0}
                >
                  <FaCalendarPlus className="me-2" />
                  Book Appointment
                </Button>

                {!isAuthenticated && (
                  <p className="text-center text-muted small mt-3 mb-0">
                    You need to <Link to="/login">login</Link> to book
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default DoctorDetailPage;
