import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Badge, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowRight, CalendarBlank, CheckCircle, Clock, SlidersHorizontal, UsersThree } from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';
import statusConfig from '../../constants/appointmentStatus';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [today] = useState(() => new Date());

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const { data } = await api.get('/appointments');
        setAppointments(data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Dashboard appointments could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const todayAppointments = useMemo(() => {
    return appointments
      .filter((appointment) => {
        const date = new Date(appointment.appointmentDate);
        return date.toDateString() === today.toDateString() && appointment.status === 'approved';
      })
      .sort((a, b) => a.appointmentTime.localeCompare(b.appointmentTime));
  }, [appointments, today]);

  const pending = appointments.filter((item) => item.status === 'pending');
  const metrics = [
    ['Total visits', appointments.length],
    ['Needs response', pending.length],
    ['Confirmed', appointments.filter((item) => item.status === 'approved').length],
    ['Completed', appointments.filter((item) => item.status === 'completed').length],
  ];
  const nextToday = todayAppointments[0];

  return (
    <div className="app-page dashboard-page">
      <Container className="page-frame">
        <header className="dashboard-heading">
          <div>
            <span className="section-kicker">Clinical workspace</span>
            <h1>Good morning, Dr. {user?.name?.replace(/^Dr\.\s*/i, '').split(' ')[0]}.</h1>
            <p>{todayAppointments.length ? `${todayAppointments.length} confirmed ${todayAppointments.length === 1 ? 'visit' : 'visits'} today.` : 'No confirmed visits on today’s schedule.'}</p>
          </div>
          <Button as={Link} to="/doctor/profile" variant="outline-primary"><SlidersHorizontal aria-hidden="true" /> Profile & schedule</Button>
        </header>

        {error && <Alert variant="danger" role="alert">{error}</Alert>}

        {loading ? (
          <div className="dashboard-focus page-loading"><Spinner size="sm" /><span>Loading today’s clinic…</span></div>
        ) : nextToday ? (
          <section className="dashboard-focus" aria-labelledby="doctor-next-visit">
            <div className="dashboard-focus-label"><Clock aria-hidden="true" /> Next patient · {nextToday.appointmentTime}</div>
            <div className="dashboard-focus-grid">
              <div>
                <p className="dashboard-date">Today’s next consultation</p>
                <h2 id="doctor-next-visit">{nextToday.patientId?.name || 'Patient'}</h2>
                <p>{nextToday.reason || 'General consultation'}</p>
              </div>
              <div className="dashboard-focus-meta"><span>Queue position</span><strong>01 / {todayAppointments.length}</strong></div>
              <Button as={Link} to="/doctor/appointments?status=approved" variant="light" className="focus-action">Open schedule <ArrowRight aria-hidden="true" /></Button>
            </div>
          </section>
        ) : (
          <section className="dashboard-focus dashboard-focus-empty">
            <div><span className="section-kicker section-kicker-light">Today’s clinic</span><h2>Your confirmed schedule is clear.</h2><p>Review pending requests or update your published availability.</p></div>
            <Button as={Link} to="/doctor/appointments?status=pending" variant="light">Review requests <ArrowRight aria-hidden="true" /></Button>
          </section>
        )}

        <section className="metric-strip" aria-label="Appointment summary">
          {metrics.map(([label, value]) => <div key={label}><strong>{value}</strong><span>{label}</span></div>)}
        </section>

        <div className="dashboard-columns">
          <section className="dashboard-section">
            <div className="section-editorial-head compact">
              <div><span className="section-index">01</span><h2>Today’s list</h2></div>
              <Link to="/doctor/appointments">Full schedule <ArrowRight aria-hidden="true" /></Link>
            </div>
            {todayAppointments.length ? (
              <div className="timeline-list">
                {todayAppointments.slice(0, 5).map((appointment) => (
                  <Link to="/doctor/appointments?status=approved" key={appointment._id} className="timeline-row">
                    <span className="timeline-date timeline-time"><strong>{appointment.appointmentTime}</strong>today</span>
                    <span className="timeline-copy"><strong>{appointment.patientId?.name || 'Patient'}</strong><small>{appointment.reason || 'Consultation'}</small></span>
                    <Badge bg="success">Confirmed</Badge><ArrowRight className="timeline-arrow" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            ) : <div className="editorial-empty"><CalendarBlank aria-hidden="true" /><div><h3>No confirmed visits today</h3><p>Accepted requests will be ordered here by time.</p></div></div>}
          </section>

          <aside className="dashboard-aside">
            <div className="dashboard-aside-heading"><UsersThree aria-hidden="true" /><span>Needs attention</span></div>
            <strong className="aside-count">{pending.length}</strong>
            <p>Pending appointment {pending.length === 1 ? 'request is' : 'requests are'} waiting for a response.</p>
            {pending.slice(0, 3).map((appointment) => {
              const config = statusConfig[appointment.status] || statusConfig.pending;
              return <div className="aside-request" key={appointment._id}><span><strong>{appointment.patientId?.name || 'Patient'}</strong><small>{new Date(appointment.appointmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {appointment.appointmentTime}</small></span><Badge bg={config.color}>{config.label}</Badge></div>;
            })}
            <Button as={Link} to="/doctor/appointments?status=pending" variant="primary" className="w-100">Review all requests</Button>
            <div className="aside-footnote"><CheckCircle aria-hidden="true" /> Update every request so patients receive a clear status.</div>
          </aside>
        </div>
      </Container>
    </div>
  );
};

export default DoctorDashboard;
