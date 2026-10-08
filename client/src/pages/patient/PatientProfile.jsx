import { useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { EnvelopeSimple as FaEnvelope, Heartbeat as FaHeartbeat, Lock as FaLock, FloppyDisk as FaSave, User as FaUser } from '@phosphor-icons/react';
import useAuth from '../../hooks/useAuth';
import api from '../../services/api';

const emptyProfile = {
  name: '', phone: '', dateOfBirth: '', gender: '', address: '',
  emergencyContact: { name: '', relationship: '', phone: '' },
  medicalProfile: { bloodType: '', allergies: '', chronicConditions: '', currentMedications: '' },
};

const profileFromUser = (user) => ({
  name: user?.name || '',
  phone: user?.phone || '',
  dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.slice(0, 10) : '',
  gender: user?.gender || '',
  address: user?.address || '',
  emergencyContact: { ...emptyProfile.emergencyContact, ...user?.emergencyContact },
  medicalProfile: { ...emptyProfile.medicalProfile, ...user?.medicalProfile },
});

const PatientProfile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState(() => profileFromUser(user));
  const [pwData, setPwData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [pwMessage, setPwMessage] = useState({ type: '', text: '' });

  const setField = (name, value) => setFormData((current) => ({ ...current, [name]: value }));
  const setNested = (group, name, value) => setFormData((current) => ({
    ...current,
    [group]: { ...current[group], [name]: value },
  }));

  const saveProfile = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.put('/auth/profile', formData);
      updateUser(data.data);
      setMessage({ type: 'success', text: 'Personal and medical profile saved.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Profile could not be saved.' });
    } finally { setLoading(false); }
  };

  const changePassword = async (event) => {
    event.preventDefault();
    if (pwData.newPassword.length < 6 || pwData.newPassword !== pwData.confirmPassword) {
      return setPwMessage({ type: 'danger', text: 'Use at least 6 characters and make sure both new passwords match.' });
    }
    setPwLoading(true);
    setPwMessage({ type: '', text: '' });
    try {
      await api.put('/auth/change-password', { currentPassword: pwData.currentPassword, newPassword: pwData.newPassword });
      setPwData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (err) {
      setPwMessage({ type: 'danger', text: err.response?.data?.message || 'Password could not be changed.' });
    } finally { setPwLoading(false); }
  };

  return (
    <div className="app-page">
      <div className="page-banner"><Container><span className="section-kicker section-kicker-light">Care profile</span><h1 className="page-title text-white mt-2 mb-1">My health profile</h1><p className="mb-0 text-white-75">Keep details current so your assigned doctor has useful context.</p></Container></div>
      <Container className="py-4 py-lg-5">
        <Row className="g-4 justify-content-center">
          <Col lg={8}>
            <Form onSubmit={saveProfile}>
              <Card className="content-card mb-4">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-3"><FaUser className="me-2 text-primary" />Personal information</h2>
                  {message.text && <Alert variant={message.type} role="status">{message.text}</Alert>}
                  <Row className="g-3">
                    <Col md={6}><Form.Group controlId="profile-name"><Form.Label>Full name</Form.Label><Form.Control value={formData.name} onChange={(e) => setField('name', e.target.value)} required minLength={2} autoComplete="name" /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="profile-email"><Form.Label><FaEnvelope className="me-2" />Email</Form.Label><Form.Control value={user?.email || ''} disabled /><Form.Text>Email cannot be changed.</Form.Text></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="profile-phone"><Form.Label>Phone number</Form.Label><Form.Control type="tel" value={formData.phone} onChange={(e) => setField('phone', e.target.value)} autoComplete="tel" placeholder="+62..." /></Form.Group></Col>
                    <Col md={3}><Form.Group controlId="profile-birth-date"><Form.Label>Date of birth</Form.Label><Form.Control type="date" value={formData.dateOfBirth} onChange={(e) => setField('dateOfBirth', e.target.value)} /></Form.Group></Col>
                    <Col md={3}><Form.Group controlId="profile-gender"><Form.Label>Gender</Form.Label><Form.Select value={formData.gender} onChange={(e) => setField('gender', e.target.value)}><option value="">Prefer not to specify</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option><option value="prefer_not_to_say">Prefer not to say</option></Form.Select></Form.Group></Col>
                    <Col xs={12}><Form.Group controlId="profile-address"><Form.Label>Address</Form.Label><Form.Control as="textarea" rows={2} value={formData.address} onChange={(e) => setField('address', e.target.value)} autoComplete="street-address" maxLength={300} /></Form.Group></Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="content-card mb-4">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-1"><FaHeartbeat className="me-2 text-danger" />Medical information</h2>
                  <p className="text-muted small mb-3">Only you and the doctor assigned to your appointment can view these details.</p>
                  <Row className="g-3">
                    <Col md={4}><Form.Group controlId="profile-blood-type"><Form.Label>Blood type</Form.Label><Form.Select value={formData.medicalProfile.bloodType} onChange={(e) => setNested('medicalProfile', 'bloodType', e.target.value)}><option value="">Unknown</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((type) => <option key={type}>{type}</option>)}</Form.Select></Form.Group></Col>
                    <Col md={8}><Form.Group controlId="profile-allergies"><Form.Label>Allergies</Form.Label><Form.Control as="textarea" rows={2} maxLength={1000} value={formData.medicalProfile.allergies} onChange={(e) => setNested('medicalProfile', 'allergies', e.target.value)} placeholder="Medicines, food, or other known allergies" /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="profile-conditions"><Form.Label>Chronic conditions</Form.Label><Form.Control as="textarea" rows={3} maxLength={1000} value={formData.medicalProfile.chronicConditions} onChange={(e) => setNested('medicalProfile', 'chronicConditions', e.target.value)} /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="profile-medications"><Form.Label>Current medications</Form.Label><Form.Control as="textarea" rows={3} maxLength={1000} value={formData.medicalProfile.currentMedications} onChange={(e) => setNested('medicalProfile', 'currentMedications', e.target.value)} /></Form.Group></Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="content-card mb-4">
                <Card.Body className="p-4">
                  <h2 className="h5 fw-bold mb-3">Emergency contact</h2>
                  <Row className="g-3">
                    <Col md={4}><Form.Group controlId="emergency-name"><Form.Label>Name</Form.Label><Form.Control value={formData.emergencyContact.name} onChange={(e) => setNested('emergencyContact', 'name', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group controlId="emergency-relationship"><Form.Label>Relationship</Form.Label><Form.Control value={formData.emergencyContact.relationship} onChange={(e) => setNested('emergencyContact', 'relationship', e.target.value)} /></Form.Group></Col>
                    <Col md={4}><Form.Group controlId="emergency-phone"><Form.Label>Phone</Form.Label><Form.Control type="tel" value={formData.emergencyContact.phone} onChange={(e) => setNested('emergencyContact', 'phone', e.target.value)} /></Form.Group></Col>
                  </Row>
                  <Button type="submit" className="mt-4" disabled={loading}><FaSave className="me-2" />{loading ? 'Saving profile...' : 'Save health profile'}</Button>
                </Card.Body>
              </Card>
            </Form>

            <Card className="content-card">
              <Card.Body className="p-4">
                <h2 className="h5 fw-bold mb-3"><FaLock className="me-2 text-primary" />Account security</h2>
                {pwMessage.text && <Alert variant={pwMessage.type}>{pwMessage.text}</Alert>}
                <Form onSubmit={changePassword}>
                  <Row className="g-3">
                    <Col md={4}><Form.Group controlId="profile-current-password"><Form.Label>Current password</Form.Label><Form.Control type="password" autoComplete="current-password" value={pwData.currentPassword} onChange={(e) => setPwData({ ...pwData, currentPassword: e.target.value })} required /></Form.Group></Col>
                    <Col md={4}><Form.Group controlId="profile-new-password"><Form.Label>New password</Form.Label><Form.Control type="password" autoComplete="new-password" value={pwData.newPassword} onChange={(e) => setPwData({ ...pwData, newPassword: e.target.value })} required minLength={6} /></Form.Group></Col>
                    <Col md={4}><Form.Group controlId="profile-confirm-password"><Form.Label>Confirm password</Form.Label><Form.Control type="password" autoComplete="new-password" value={pwData.confirmPassword} onChange={(e) => setPwData({ ...pwData, confirmPassword: e.target.value })} required /></Form.Group></Col>
                  </Row>
                  <Button type="submit" variant="outline-primary" className="mt-3" disabled={pwLoading}>{pwLoading ? <Spinner size="sm" /> : 'Change password'}</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default PatientProfile;
