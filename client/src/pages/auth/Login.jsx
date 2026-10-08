import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import {
  ArrowRight as FaArrowRight,
  CalendarCheck as FaCalendarCheck,
  CheckCircle as FaCheckCircle,
  EnvelopeSimple as FaEnvelope,
  Lock as FaLock,
  ShieldCheck as FaShieldAlt,
} from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', formData);
      login(data.data.user, data.data.token);
      const redirects = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
      const requestedPath = typeof location.state?.from === 'string' && location.state.from.startsWith('/')
        ? location.state.from
        : null;
      navigate(requestedPath || redirects[data.data.user.role] || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Sign in failed. Check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Row className="g-0 auth-row">
        <Col lg={5} className="auth-story d-none d-lg-flex">
          <div>
            <span className="section-kicker section-kicker-light">Welcome back</span>
            <h1>Keep every appointment in one clear place.</h1>
            <p>Sign in to review requests, confirmations, visit notes, and notifications for your account.</p>
            <ul>
              <li><FaCalendarCheck aria-hidden="true" />Manage upcoming and past appointments</li>
              <li><FaCheckCircle aria-hidden="true" />See status changes as they happen</li>
              <li><FaShieldAlt aria-hidden="true" />Access is protected by role and account</li>
            </ul>
          </div>
        </Col>
        <Col lg={7} className="auth-form-column">
          <div className="auth-form-wrap">
            <div className="auth-heading">
              <span className="section-kicker">DOCVIA account</span>
              <h1>Sign in</h1>
              <p>Use the email and password connected to your account.</p>
            </div>

            {error && <Alert variant="danger" role="alert">{error}</Alert>}

            <Form onSubmit={handleSubmit} aria-busy={loading}>
              <Form.Group className="mb-3">
                <Form.Label htmlFor="login-email">Email address</Form.Label>
                <div className="field-with-icon"><FaEnvelope aria-hidden="true" /><Form.Control id="login-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" autoComplete="email" required /></div>
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label htmlFor="login-password">Password</Form.Label>
                <div className="field-with-icon"><FaLock aria-hidden="true" /><Form.Control id="login-password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" autoComplete="current-password" required /></div>
              </Form.Group>
              <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                {loading ? <><Spinner size="sm" className="me-2" />Signing in...</> : <>Sign in <FaArrowRight className="ms-2" /></>}
              </Button>
            </Form>

            <p className="auth-switch">New to DOCVIA? <Link to="/register">Create a patient account</Link></p>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;
