import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Button, Container, Spinner } from 'react-bootstrap';
import { ArrowRight, CalendarBlank, GearSix, Headset, ShieldCheck, Stethoscope, UsersThree, WarningCircle } from '@phosphor-icons/react';
import api from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Dashboard statistics could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    ['People', stats?.totalUsers],
    ['Doctors', stats?.totalDoctors],
    ['Appointments', stats?.totalAppointments],
    ['Completed care', stats?.completedAppointments],
  ];
  const queues = [
    { to: '/admin/doctors', icon: Stethoscope, title: 'Doctor verification', value: stats?.pendingDoctors || 0, copy: 'Applications waiting for credential review', tone: 'warning' },
    { to: '/admin/disputes', icon: Headset, title: 'Support cases', value: stats?.openDisputes || 0, copy: 'Open cases that may need intervention', tone: 'warning' },
    { to: '/admin/appointments', icon: CalendarBlank, title: 'Pending bookings', value: stats?.pendingAppointments || 0, copy: 'Appointment requests awaiting doctor action', tone: 'neutral' },
  ];
  const operations = [
    { to: '/admin/doctors', icon: ShieldCheck, title: 'Doctor governance', copy: 'Review credentials, approve applications, and monitor practitioner access.' },
    { to: '/admin/users', icon: UsersThree, title: 'People & access', copy: 'Inspect accounts, roles, and account status across the platform.' },
    { to: '/admin/appointments', icon: CalendarBlank, title: 'Care operations', copy: 'Monitor booking activity and appointment outcomes.' },
    { to: '/admin/settings', icon: GearSix, title: 'Platform controls', copy: 'Configure booking policy, reminders, and public notices.' },
  ];

  return (
    <div className="app-page dashboard-page admin-overview">
      <Container className="page-frame">
        <header className="dashboard-heading">
          <div><span className="section-kicker">Platform operations</span><h1>System overview.</h1><p>Govern access, resolve exceptions, and keep care moving.</p></div>
          <Button as={Link} to="/admin/settings" variant="outline-primary"><GearSix aria-hidden="true" /> Platform settings</Button>
        </header>

        {error && <Alert variant="danger" role="alert" className="d-flex flex-wrap align-items-center justify-content-between gap-2"><span>{error}</span><Button variant="outline-danger" size="sm" onClick={() => window.location.reload()}>Try again</Button></Alert>}

        <section className="admin-pulse" aria-labelledby="admin-pulse-title">
          <div>
            <span className="admin-pulse-icon"><WarningCircle aria-hidden="true" /></span>
            <span><small>Operational queue</small><h2 id="admin-pulse-title">{loading ? <Spinner size="sm" /> : (stats?.pendingDoctors || 0) + (stats?.openDisputes || 0)} items need review</h2></span>
          </div>
          <p>Prioritize identity verification and unresolved support cases to protect patient trust.</p>
        </section>

        <section className="metric-strip" aria-label="Platform statistics">
          {metrics.map(([label, value]) => <div key={label}><strong>{loading ? '—' : value ?? 0}</strong><span>{label}</span></div>)}
        </section>

        <div className="dashboard-columns admin-columns">
          <section className="dashboard-section">
            <div className="section-editorial-head compact"><div><span className="section-index">01</span><h2>Attention queue</h2></div><span className="quiet-label">Live operational state</span></div>
            <div className="admin-queue-list">
              {queues.map((queue) => {
                const Icon = queue.icon;
                return (
                  <Link to={queue.to} className={`admin-queue-row ${queue.tone}`} key={queue.title}>
                    <Icon aria-hidden="true" />
                    <span><strong>{queue.title}</strong><small>{queue.copy}</small></span>
                    <b>{loading ? '—' : queue.value}</b>
                    <ArrowRight aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>

          <aside className="dashboard-aside admin-completion">
            <span className="section-kicker section-kicker-light">Care completion</span>
            <strong className="aside-count">{loading ? '—' : stats?.completedAppointments || 0}</strong>
            <p>Completed appointments recorded across DOCVIA.</p>
            <div className="completion-rule"><span style={{ width: `${Math.min(100, stats?.totalAppointments ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0)}%` }} /></div>
            <small>{stats?.totalAppointments ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}% of all appointments completed</small>
          </aside>
        </div>

        <section className="dashboard-section operations-section">
          <div className="section-editorial-head compact"><div><span className="section-index">02</span><h2>Manage DOCVIA</h2></div></div>
          <div className="operations-list">
            {operations.map((item) => {
              const Icon = item.icon;
              return <Link to={item.to} key={item.title}><span className="operation-number"><Icon aria-hidden="true" /></span><span><strong>{item.title}</strong><small>{item.copy}</small></span><ArrowRight aria-hidden="true" /></Link>;
            })}
          </div>
        </section>
      </Container>
    </div>
  );
};

export default AdminDashboard;
