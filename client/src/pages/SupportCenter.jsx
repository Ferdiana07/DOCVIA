import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Headset as FaHeadset, PaperPlaneTilt as FaPaperPlane } from '@phosphor-icons/react';
import api from '../services/api';

const statusColors = { open: 'warning', in_review: 'info', resolved: 'success', closed: 'secondary' };
const emptyForm = { appointmentId: '', subject: '', description: '', priority: 'medium' };

const SupportCenter = () => {
  const [cases, setCases] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [caseResponse, appointmentResponse] = await Promise.all([
        api.get('/disputes/mine'),
        api.get('/appointments'),
      ]);
      setCases(caseResponse.data.data);
      setAppointments(appointmentResponse.data.data);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Support cases could not be loaded.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { queueMicrotask(loadData); }, [loadData]);

  const updateForm = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });
    try {
      await api.post('/disputes', { ...form, appointmentId: form.appointmentId || undefined });
      setForm(emptyForm);
      setMessage({ type: 'success', text: 'Your case was sent to the DOCVIA support team.' });
      await loadData();
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Support case could not be submitted.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="app-page">
      <div className="page-banner">
        <Container>
          <span className="section-kicker section-kicker-light">Help and resolution</span>
          <h1 className="page-title text-white mt-2 mb-1">Support center</h1>
          <p className="mb-0 text-white-75">Report an appointment concern and track the resolution in one place.</p>
        </Container>
      </div>

      <Container className="py-4 py-lg-5">
        {message.text && <Alert variant={message.type} role={message.type === 'danger' ? 'alert' : 'status'}>{message.text}</Alert>}
        <Row className="g-4">
          <Col lg={5}>
            <Card className="content-card sticky-lg-top support-form-card">
              <Card.Body className="p-4">
                <h2 className="h5 fw-bold"><FaHeadset className="me-2 text-primary" />Open a support case</h2>
                <p className="text-muted small">Do not include passwords or payment credentials.</p>
                <Form onSubmit={submit} aria-busy={saving}>
                  <Form.Group controlId="support-appointment" className="mb-3">
                    <Form.Label>Related appointment <span className="text-muted">(optional)</span></Form.Label>
                    <Form.Select value={form.appointmentId} onChange={(event) => updateForm('appointmentId', event.target.value)}>
                      <option value="">General support</option>
                      {appointments.map((item) => <option value={item._id} key={item._id}>{new Date(item.appointmentDate).toLocaleDateString()} at {item.appointmentTime}</option>)}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="support-subject" className="mb-3">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control value={form.subject} onChange={(event) => updateForm('subject', event.target.value)} maxLength={160} required />
                  </Form.Group>
                  <Form.Group controlId="support-priority" className="mb-3">
                    <Form.Label>Priority</Form.Label>
                    <Form.Select value={form.priority} onChange={(event) => updateForm('priority', event.target.value)}>
                      <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="support-description" className="mb-3">
                    <Form.Label>What happened?</Form.Label>
                    <Form.Control as="textarea" rows={5} value={form.description} onChange={(event) => updateForm('description', event.target.value)} maxLength={2000} required />
                    <Form.Text>{form.description.length}/2000 characters</Form.Text>
                  </Form.Group>
                  <Button type="submit" disabled={saving} className="w-100"><FaPaperPlane className="me-2" />{saving ? 'Sending...' : 'Send support case'}</Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={7}>
            <h2 className="h5 fw-bold mb-3">My cases</h2>
            {loading ? (
              <div className="page-loading py-5" role="status"><Spinner /><span>Loading cases...</span></div>
            ) : cases.length === 0 ? (
              <Card className="content-card"><Card.Body className="text-center p-5"><FaHeadset size={36} className="text-muted mb-3" /><p className="mb-0 text-muted">You have no support cases.</p></Card.Body></Card>
            ) : cases.map((item) => (
              <Card className="content-card mb-3" key={item._id}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between gap-3">
                    <div><h3 className="h6 fw-bold mb-1">{item.subject}</h3><small className="text-muted">Opened {new Date(item.createdAt).toLocaleDateString()}</small></div>
                    <Badge bg={statusColors[item.status]} className="status-badge align-self-start">{item.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="mt-3 mb-2">{item.description}</p>
                  {item.adminResponse && <div className="support-response"><strong>DOCVIA response</strong><p className="mb-0 mt-1">{item.adminResponse}</p></div>}
                </Card.Body>
              </Card>
            ))}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SupportCenter;
