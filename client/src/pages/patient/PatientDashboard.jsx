import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowRight, CalendarBlank, CheckCircle, Clock, MagnifyingGlass, Sparkle } from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import statusConfig from '../../constants/appointmentStatus';

const formatDate = (value, long = false) => new Date(value).toLocaleDateString('en-GB', {
  weekday: long ? 'long' : 'short', day: 'numeric', month: 'long', year: long ? 'numeric' : undefined,
});

const PatientDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today] = useState(() => {
    const value = new Date();
    value.setHours(0, 0, 0, 0);
    return value;
  });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/appointments');
        setAppointments(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'We could not load your appointment overview.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const upcoming = useMemo(() => {
    return appointments
      .filter((item) => ['pending', 'approved'].includes(item.status) && new Date(item.appointmentDate) >= today)
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  }, [appointments, today]);

  const nextAppointment = upcoming[0];
  const metrics = [
    ['All visits', appointments.length],
    ['Awaiting review', appointments.filter((item) => item.status === 'pending').length],
    ['Confirmed', appointments.filter((item) => item.status === 'approved').length],
    ['Completed', appointments.filter((item) => item.status === 'completed').length],
  ];

  return (
    <div className="app-page dashboard-page">
      <Container className="page-frame">
        <header className="dashboard-heading">
          <div>
            <span className="section-kicker">Patient overview</span>
            <h1>Good morning, {user?.name?.split(' ')[0]}.</h1>
            <p>Everything you need for your next step in care.</p>
          </div>
          <Button as={Link} to="/doctors" variant="primary">
            <MagnifyingGlass aria-hidden="true" /> Find a doctor
          </Button>
        </header>

        {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

        {loading ? (
          <div className="dashboard-focus page-loading"><Spinner size="sm" /><span>Preparing your care overview…</span></div>
        ) : nextAppointment ? (
          <section className="dashboard-focus" aria-labelledby="next-appointment-title">
            <div className="dashboard-focus-label"><Sparkle aria-hidden="true" /> Next appointment</div>
            <div className="dashboard-focus-grid">
              <div>
                <p className="dashboard-date">{formatDate(nextAppointment.appointmentDate, true)}</p>
                <h2 id="next-appointment-title">Dr. {nextAppointment.doctorId?.name}</h2>
                <p>{nextAppointment.doctorId?.specialization || 'Medical consultation'} · {nextAppointment.appointmentTime}</p>
              </div>
              <div className="dashboard-focus-meta">
                <span>Appointment status</span>
                <Badge bg={(statusConfig[nextAppointment.status] || statusConfig.pending).color}>
                  {(statusConfig[nextAppointment.status] || statusConfig.pending).label}
                </Badge>
              </div>
              <Button as={Link} to={`/patient/appointments/${nextAppointment._id}`} variant="light" className="focus-action">
                View details <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </section>
        ) : (
          <section className="dashboard-focus dashboard-focus-empty">
            <div>
              <span className="section-kicker section-kicker-light">Your next step</span>
              <h2>No upcoming appointment yet.</h2>
              <p>Browse verified doctors and choose a time that works for you.</p>
            </div>
            <Button as={Link} to="/doctors" variant="light">Explore doctors <ArrowRight aria-hidden="true" /></Button>
          </section>
        )}

        <section className="metric-strip" aria-label="Appointment summary">
          {metrics.map(([label, value]) => (
            <div key={label}><strong>{value}</strong><span>{label}</span></div>
          ))}
        </section>

        <section className="dashboard-section">
          <div className="section-editorial-head compact">
            <div><span className="section-index">01</span><h2>Coming up</h2></div>
            <Link to="/patient/appointments">All appointments <ArrowRight aria-hidden="true" /></Link>
          </div>

          {upcoming.length > 1 ? (
            <div className="timeline-list">
              {upcoming.slice(1, 5).map((appointment) => {
                const status = statusConfig[appointment.status] || statusConfig.pending;
                return (
                  <Link to={`/patient/appointments/${appointment._id}`} key={appointment._id} className="timeline-row">
                    <span className="timeline-date"><strong>{new Date(appointment.appointmentDate).getDate()}</strong>{new Date(appointment.appointmentDate).toLocaleDateString('en-GB', { month: 'short' })}</span>
                    <span className="timeline-copy"><strong>Dr. {appointment.doctorId?.name}</strong><small>{appointment.doctorId?.specialization || 'Consultation'} · {appointment.appointmentTime}</small></span>
                    <Badge bg={status.color}>{status.label}</Badge>
                    <ArrowRight className="timeline-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="editorial-empty">
              <CalendarBlank aria-hidden="true" />
              <div><h3>Your schedule is clear</h3><p>Any new or rescheduled visit will appear here.</p></div>
            </div>
          )}

          <div className="dashboard-help-row">
            <div><Clock aria-hidden="true" /><span><strong>Need to change a time?</strong> You can reschedule an eligible appointment from its detail page.</span></div>
            <div><CheckCircle aria-hidden="true" /><span><strong>Your records stay together.</strong> Completed visit notes remain available in appointment history.</span></div>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default PatientDashboard;
