import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowRight as FaArrowRight, Bell as FaBell, CalendarCheck as FaCalendarCheck, EnvelopeSimple as FaEnvelope, Lock as FaLock, Phone as FaPhone, User as FaUser } from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    if (error) setError('');
  };

  const validate = () => {
    if (formData.name.trim().length < 2) return 'Enter your full name using at least 2 characters.';
    if (!formData.email.trim()) return 'Enter your email address.';
    if (formData.password.length < 6) return 'Use at least 6 characters for your password.';
    if (formData.password !== formData.confirmPassword) return 'The passwords do not match.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', {
        name: formData.name.trim(), email: formData.email.trim(),
        password: formData.password, phone: formData.phone.trim(),
      });
      login(data.data.user, data.data.token);
      navigate('/patient/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'We could not create your account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Row className="g-0 auth-row">
        <Col lg={5} className="auth-story d-none d-lg-flex">
          <div>
            <span className="section-kicker section-kicker-light">Patient account</span>
            <h1>Book care with less uncertainty.</h1>
            <p>Your account keeps every request, confirmation, document, and update together.</p>
            <ul>
              <li><FaCalendarCheck aria-hidden="true" />Choose from published doctor schedules</li>
              <li><FaBell aria-hidden="true" />Receive appointment status notifications</li>
              <li><FaLock aria-hidden="true" />Keep access protected with a private password</li>
            </ul>
          </div>
        </Col>
        <Col lg={7} className="auth-form-column">
          <div className="auth-form-wrap auth-form-wide">
            <div className="auth-heading">
              <span className="section-kicker">Join DOCVIA</span>
              <h1>Create a patient account</h1>
              <p>Enter the details you will use to manage your appointments.</p>
            </div>

            {error && <Alert variant="danger" role="alert">{error}</Alert>}

            <Form onSubmit={handleSubmit} aria-busy={loading} noValidate>
              <Row>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="register-name">Full name</Form.Label>
                    <div className="field-with-icon"><FaUser aria-hidden="true" /><Form.Control id="register-name" name="name" value={formData.name} onChange={handleChange} placeholder="Your full name" autoComplete="name" minLength={2} required /></div>
                  </Form.Group>
                </Col>
                <Col md={7}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="register-email">Email address</Form.Label>
                    <div className="field-with-icon"><FaEnvelope aria-hidden="true" /><Form.Control id="register-email" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="name@example.com" autoComplete="email" required /></div>
                  </Form.Group>
                </Col>
                <Col md={5}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="register-phone">Phone <span className="optional-label">Optional</span></Form.Label>
                    <div className="field-with-icon"><FaPhone aria-hidden="true" /><Form.Control id="register-phone" type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62" autoComplete="tel" inputMode="tel" /></div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="register-password">Password</Form.Label>
                    <div className="field-with-icon"><FaLock aria-hidden="true" /><Form.Control id="register-password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="At least 6 characters" autoComplete="new-password" minLength={6} required /></div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label htmlFor="register-confirm-password">Confirm password</Form.Label>
                    <div className="field-with-icon"><FaLock aria-hidden="true" /><Form.Control id="register-confirm-password" type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="Repeat your password" autoComplete="new-password" required /></div>
                  </Form.Group>
                </Col>
              </Row>
              <Button type="submit" variant="primary" size="lg" className="w-100" disabled={loading}>
                {loading ? <><Spinner size="sm" className="me-2" />Creating account...</> : <>Create account <FaArrowRight className="ms-2" /></>}
              </Button>
            </Form>
            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default RegisterPage;
