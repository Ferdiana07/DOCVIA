import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { Stethoscope as FaUserMd, FloppyDisk as FaSave } from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorProfile = () => {
  const { updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '', specialization: '', experience: '', qualification: '',
    consultationFee: '', description: '', phone: '', location: '',
  });
  const [availability, setAvailability] = useState([]);

  // Change-password sub-form
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/doctors/profile/me');
        const p = data.data;
        setProfile(p);
        setFormData({
          name: p.name || '',
          specialization: p.specialization || '',
          experience: p.experience ?? '',
          qualification: p.qualification || '',
          consultationFee: p.consultationFee ?? '',
          description: p.description || '',
          phone: p.phone || '',
          location: p.location || '',
        });
        setAvailability(p.availability || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Doctor profile could not be loaded.');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); setSuccess('');
  };

  const toggleDay = (day) => {
    setAvailability((prev) => {
      const exists = prev.find((a) => a.day === day);
      if (exists) return prev.filter((a) => a.day !== day);
      return [...prev, { day, startTime: '09:00', endTime: '17:00' }];
    });
  };

  const updateSlot = (day, field, value) => {
    setAvailability((prev) =>
      prev.map((a) => (a.day === day ? { ...a, [field]: value } : a))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (availability.length === 0) {
      setError('Select at least one available working day.');
      return;
    }
    const invalidSlot = availability.find((slot) => !slot.startTime || !slot.endTime || slot.startTime >= slot.endTime);
    if (invalidSlot) {
      setError(`${invalidSlot.day} end time must be later than its start time.`);
      return;
    }
    setSaving(true);
    setError(''); setSuccess('');
    try {
      const { data } = await api.put('/doctors/profile/me', {
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        availability,
      });
      setProfile(data.data);
      setSuccess('Profile updated successfully.');
      // Also update display name in navbar
      updateUser({ name: data.data.name });
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwData.newPassword.length < 6) { setPwError('New password must be at least 6 characters.'); return; }
    if (pwData.newPassword !== pwData.confirmPassword) { setPwError('Passwords do not match.'); return; }
    setPwLoading(true);
    setPwError('');
    setPwSuccess('');
    try {
      await api.put('/auth/change-password', {
        currentPassword: pwData.currentPassword,
        newPassword: pwData.newPassword,
      });
      setPwSuccess('Password changed successfully.');
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Password change failed.');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (!profile) {
    return <Container className="app-page py-5"><Alert variant="danger">{error || 'Doctor profile is unavailable.'}</Alert><Button onClick={() => window.location.reload()}>Try again</Button></Container>;
  }

  return (
    <div className="app-page">
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col xs={12} lg={8}>
            <div className="d-flex align-items-center gap-3 mb-4">
              <h1 className="page-title mb-0"><FaUserMd className="me-2 text-success" />Doctor profile</h1>
              {profile && (
                <Badge bg={profile.status === 'approved' ? 'success' : profile.status === 'pending' ? 'warning' : 'danger'}>
                  {profile.status}
                </Badge>
              )}
            </div>

            {success && <Alert variant="success" className="py-2">{success}</Alert>}
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}

            <Form onSubmit={handleSave}>
              {/* Professional Info */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 p-4 pb-0">
                  <h6 className="fw-bold mb-0">Professional Information</h6>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-name" className="fw-semibold">Full name</Form.Label>
                        <Form.Control id="dp-name" name="name" value={formData.name} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-location" className="fw-semibold">Clinic location</Form.Label>
                        <Form.Control id="dp-location" name="location" value={formData.location} onChange={handleChange} placeholder="City, district, or clinic" />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-spec" className="fw-semibold">Specialization</Form.Label>
                        <Form.Control id="dp-spec" name="specialization" value={formData.specialization} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-qual" className="fw-semibold">Qualification</Form.Label>
                        <Form.Control id="dp-qual" name="qualification" value={formData.qualification} onChange={handleChange} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-exp" className="fw-semibold">Years of experience</Form.Label>
                        <Form.Control id="dp-exp" type="number" name="experience" value={formData.experience} onChange={handleChange} min="0" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-fee" className="fw-semibold">Consultation fee (IDR)</Form.Label>
                        <Form.Control id="dp-fee" type="number" name="consultationFee" value={formData.consultationFee} onChange={handleChange} min="0" required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-phone" className="fw-semibold">Phone</Form.Label>
                        <Form.Control id="dp-phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+62..." />
                      </Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dp-desc" className="fw-semibold">About / description</Form.Label>
                        <Form.Control id="dp-desc" as="textarea" rows={3} name="description" value={formData.description} onChange={handleChange} />
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Availability */}
              <Card className="border-0 shadow-sm mb-4">
                <Card.Header className="bg-white border-0 p-4 pb-0">
                  <h6 className="fw-bold mb-0">Availability Schedule</h6>
                </Card.Header>
                <Card.Body className="p-4">
                  <Row className="g-2">
                    {DAYS.map((day) => {
                      const slot = availability.find((a) => a.day === day);
                      const isSelected = !!slot;
                      return (
                        <Col xs={12} key={day}>
                          <div className={`border rounded p-2 ${isSelected ? 'border-success bg-light' : ''}`}>
                            <Form.Check
                              type="checkbox"
                              id={`avail-${day}`}
                              label={<strong>{day}</strong>}
                              checked={isSelected}
                              onChange={() => toggleDay(day)}
                            />
                            {isSelected && (
                              <Row className="mt-2 g-2">
                                <Col xs={6}>
                                  <Form.Label htmlFor={`profile-${day}-start`} className="small text-muted mb-1">Start</Form.Label>
                                  <Form.Control id={`profile-${day}-start`} type="time" size="sm" value={slot.startTime} onChange={(e) => updateSlot(day, 'startTime', e.target.value)} />
                                </Col>
                                <Col xs={6}>
                                  <Form.Label htmlFor={`profile-${day}-end`} className="small text-muted mb-1">End</Form.Label>
                                  <Form.Control id={`profile-${day}-end`} type="time" size="sm" value={slot.endTime} onChange={(e) => updateSlot(day, 'endTime', e.target.value)} />
                                </Col>
                              </Row>
                            )}
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </Card.Body>
              </Card>

              <Button type="submit" variant="success" size="lg" className="w-100 fw-semibold mb-4" disabled={saving}>
                {saving ? <><Spinner size="sm" className="me-2" /> Saving...</> : <><FaSave className="me-2" /> Save Profile</>}
              </Button>
            </Form>

            {/* Change Password */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 p-4 pb-0">
                <h6 className="fw-bold mb-0">Change Password</h6>
              </Card.Header>
              <Card.Body className="p-4">
                {pwSuccess && <Alert variant="success" className="py-2">{pwSuccess}</Alert>}
                {pwError && <Alert variant="danger" className="py-2">{pwError}</Alert>}
                <Form onSubmit={handlePasswordSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label htmlFor="dpw-current" className="fw-semibold">Current password</Form.Label>
                    <Form.Control id="dpw-current" type="password" name="currentPassword" value={pwData.currentPassword}
                      onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })} required />
                  </Form.Group>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dpw-new" className="fw-semibold">New password</Form.Label>
                        <Form.Control id="dpw-new" type="password" name="newPassword" value={pwData.newPassword}
                          onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })} required />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label htmlFor="dpw-confirm" className="fw-semibold">Confirm new password</Form.Label>
                        <Form.Control id="dpw-confirm" type="password" name="confirmPassword" value={pwData.confirmPassword}
                          onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })} required />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button type="submit" variant="outline-danger" disabled={pwLoading}>
                    {pwLoading ? <><Spinner size="sm" className="me-2" /> Changing...</> : 'Change Password'}
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

export default DoctorProfile;
