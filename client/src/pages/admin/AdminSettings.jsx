import { useEffect, useState } from 'react';
import { Alert, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { GearSix as FaCog, FloppyDisk as FaSave } from '@phosphor-icons/react';
import api from '../../services/api';

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    api.get('/admin/settings')
      .then(({ data }) => setSettings(data.data))
      .catch((err) => setMessage({ type: 'danger', text: err.response?.data?.message || 'Settings could not be loaded.' }))
      .finally(() => setLoading(false));
  }, []);

  const set = (name, value) => setSettings((current) => ({ ...current, [name]: value }));

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const { data } = await api.put('/admin/settings', settings);
      setSettings(data.data);
      setMessage({ type: 'success', text: 'Platform settings saved.' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Settings could not be saved.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="app-page page-loading" role="status"><Spinner /><span>Loading settings...</span></div>;
  if (!settings) return <Container className="app-page py-5"><Alert variant={message.type || 'danger'}>{message.text || 'Settings unavailable.'}</Alert></Container>;

  return (
    <div className="app-page">
      <Container className="py-4 py-lg-5">
        <span className="section-kicker">Governance</span>
        <h1 className="page-title mt-2 mb-1"><FaCog className="me-2" />Platform settings</h1>
        <p className="text-muted mb-4">Control booking safeguards, reminders, support details, and public notices.</p>
        {message.text && <Alert variant={message.type} role={message.type === 'danger' ? 'alert' : 'status'}>{message.text}</Alert>}

        <Form onSubmit={save} aria-busy={saving}>
          <Row className="g-4">
            <Col lg={7}>
              <Card className="content-card mb-4"><Card.Body className="p-4">
                <h2 className="h5 fw-bold mb-3">Booking policy</h2>
                <Row className="g-3">
                  <Col md={6}><Form.Group controlId="booking-lead-hours"><Form.Label>Minimum booking lead time (hours)</Form.Label><Form.Control type="number" min="0" max="168" value={settings.appointmentLeadTimeHours} onChange={(event) => set('appointmentLeadTimeHours', Number(event.target.value))} required /></Form.Group></Col>
                  <Col md={6}><Form.Group controlId="cancellation-cutoff-hours"><Form.Label>Cancellation cutoff (hours)</Form.Label><Form.Control type="number" min="0" max="168" value={settings.cancellationCutoffHours} onChange={(event) => set('cancellationCutoffHours', Number(event.target.value))} required /></Form.Group></Col>
                  <Col xs={12}><Form.Check type="switch" id="allow-cancel" label="Allow patients to cancel eligible appointments" checked={settings.allowPatientCancellation} onChange={(event) => set('allowPatientCancellation', event.target.checked)} /></Col>
                  <Col md={6}><Form.Check type="switch" id="reminder-24" label="24-hour reminders" checked={settings.reminder24hEnabled} onChange={(event) => set('reminder24hEnabled', event.target.checked)} /></Col>
                  <Col md={6}><Form.Check type="switch" id="reminder-2" label="2-hour reminders" checked={settings.reminder2hEnabled} onChange={(event) => set('reminder2hEnabled', event.target.checked)} /></Col>
                </Row>
              </Card.Body></Card>

              <Card className="content-card"><Card.Body className="p-4">
                <h2 className="h5 fw-bold mb-3">Public notices</h2>
                <Form.Group controlId="privacy-notice" className="mb-3"><Form.Label>Privacy notice</Form.Label><Form.Control as="textarea" rows={3} maxLength={4000} value={settings.privacyNotice} onChange={(event) => set('privacyNotice', event.target.value)} /></Form.Group>
                <Form.Group controlId="terms-notice"><Form.Label>Terms and safety notice</Form.Label><Form.Control as="textarea" rows={3} maxLength={4000} value={settings.termsNotice} onChange={(event) => set('termsNotice', event.target.value)} /></Form.Group>
              </Card.Body></Card>
            </Col>

            <Col lg={5}>
              <Card className="content-card"><Card.Body className="p-4">
                <h2 className="h5 fw-bold mb-3">Platform contact</h2>
                <Form.Group controlId="platform-name" className="mb-3"><Form.Label>Platform name</Form.Label><Form.Control value={settings.platformName} onChange={(event) => set('platformName', event.target.value)} required /></Form.Group>
                <Form.Group controlId="support-email" className="mb-3"><Form.Label>Support email</Form.Label><Form.Control type="email" value={settings.supportEmail} onChange={(event) => set('supportEmail', event.target.value)} required /></Form.Group>
                <Form.Group controlId="support-phone" className="mb-3"><Form.Label>Support phone</Form.Label><Form.Control type="tel" value={settings.supportPhone} onChange={(event) => set('supportPhone', event.target.value)} /></Form.Group>
                <Form.Check type="switch" id="maintenance-mode" label="Maintenance mode notice" checked={settings.maintenanceMode} onChange={(event) => set('maintenanceMode', event.target.checked)} />
                <Alert variant="warning" className="small mt-3 mb-0">Maintenance mode displays a notice. It does not block authentication or emergency access.</Alert>
              </Card.Body></Card>
              <Button type="submit" size="lg" className="w-100 mt-3" disabled={saving}><FaSave className="me-2" />{saving ? 'Saving...' : 'Save platform settings'}</Button>
            </Col>
          </Row>
        </Form>
      </Container>
    </div>
  );
};

export default AdminSettings;
