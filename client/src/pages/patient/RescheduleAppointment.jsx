import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft as FaArrowLeft, CalendarBlank as FaCalendarAlt, Clock as FaClock, ArrowClockwise as FaRedo } from '@phosphor-icons/react';
import api from '../../services/api';
import { toLocalDateInputValue } from '../../utils/date';

const RescheduleAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [minimumDate] = useState(() => toLocalDateInputValue());

  useEffect(() => {
    api.get(`/appointments/${id}`)
      .then(({ data }) => setAppointment(data.data))
      .catch((err) => setError(err.response?.data?.message || 'Appointment could not be loaded.'))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!date || !appointment?.doctorId?._id) return undefined;
    let active = true;
    api.get(`/doctors/${appointment.doctorId._id}/available-slots`, { params: { date } })
      .then(({ data }) => active && setSlots(data.data))
      .catch((err) => active && setError(err.response?.data?.message || 'Available times could not be loaded.'))
      .finally(() => active && setLoadingSlots(false));
    return () => { active = false; };
  }, [date, appointment]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.put(`/appointments/${id}/reschedule`, { appointmentDate: date, appointmentTime: time });
      navigate(`/patient/appointments/${id}`, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Appointment could not be rescheduled.');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="app-page page-loading" role="status"><Spinner /><span>Loading appointment...</span></div>;

  if (!appointment) {
    return <Container className="app-page py-5"><Alert variant="danger">{error || 'Appointment not found.'}</Alert><Button as={Link} to="/patient/appointments" variant="outline-primary">Back to appointments</Button></Container>;
  }

  return (
    <div className="app-page">
      <Container className="py-4 py-lg-5">
        <Button as={Link} to={`/patient/appointments/${id}`} variant="link" className="back-link px-0 mb-3">
          <FaArrowLeft className="me-2" />Back to appointment
        </Button>
        <Row className="justify-content-center">
          <Col lg={7}>
            <Card className="content-card">
              <Card.Body className="p-4 p-lg-5">
                <span className="section-kicker">Change visit time</span>
                <h1 className="page-title mt-2">Reschedule appointment</h1>
                <p className="text-muted mb-4">Select a live slot for Dr. {appointment?.doctorId?.name}. The doctor will confirm the new request.</p>
                {error && <Alert variant="danger" role="alert">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label htmlFor="reschedule-date"><FaCalendarAlt className="me-2" />New date</Form.Label>
                        <Form.Control id="reschedule-date" type="date" min={minimumDate} value={date} onChange={(e) => { setDate(e.target.value); setTime(''); setSlots([]); setLoadingSlots(Boolean(e.target.value)); }} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label htmlFor="reschedule-time"><FaClock className="me-2" />New time</Form.Label>
                        <Form.Select id="reschedule-time" value={time} onChange={(e) => setTime(e.target.value)} disabled={!date || loadingSlots || slots.length === 0} required>
                          <option value="">{loadingSlots ? 'Checking live availability...' : slots.length ? 'Choose a time' : 'Choose an available date'}</option>
                          {slots.map((slot) => <option value={slot} key={slot}>{slot}</option>)}
                        </Form.Select>
                        {date && !loadingSlots && slots.length === 0 && <Form.Text className="text-danger">No open slots on this date.</Form.Text>}
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="d-flex flex-wrap gap-2 mt-4">
                    <Button type="submit" disabled={saving || !time}><FaRedo className="me-2" />{saving ? 'Saving...' : 'Request new time'}</Button>
                    <Button as={Link} to={`/patient/appointments/${id}`} variant="outline-secondary">Keep current time</Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default RescheduleAppointment;
