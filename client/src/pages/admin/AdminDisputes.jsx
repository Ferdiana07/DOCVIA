import { useCallback, useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Row, Spinner } from 'react-bootstrap';
import { Headset as FaHeadset } from '@phosphor-icons/react';
import api from '../../services/api';

const colors = { open: 'warning', in_review: 'info', resolved: 'success', closed: 'secondary' };

const AdminDisputes = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/disputes');
      setCases(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Support cases could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { queueMicrotask(load); }, [load]);

  const update = async (item) => {
    setSavingId(item._id);
    setError('');
    try {
      await api.put(`/admin/disputes/${item._id}`, {
        status: item.status,
        priority: item.priority,
        adminResponse: item.adminResponse,
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Case could not be updated.');
    } finally {
      setSavingId('');
    }
  };

  const change = (id, field, value) => setCases((current) => current.map((item) => (
    item._id === id ? { ...item, [field]: value } : item
  )));

  return (
    <div className="app-page">
      <Container className="py-4 py-lg-5">
        <span className="section-kicker">Platform operations</span>
        <h1 className="page-title mt-2 mb-1">Support and disputes</h1>
        <p className="text-muted mb-4">Review reports, document responses, and close resolved cases.</p>
        {error && <Alert variant="danger" role="alert">{error}</Alert>}

        {loading ? (
          <div className="page-loading" role="status"><Spinner /><span>Loading cases...</span></div>
        ) : cases.length === 0 ? (
          <Card className="content-card"><Card.Body className="text-center p-5"><FaHeadset size={40} className="text-muted mb-3" /><p className="mb-0">No support cases need review.</p></Card.Body></Card>
        ) : cases.map((item) => (
          <Card className="content-card mb-3" key={item._id}>
            <Card.Body className="p-4">
              <Row className="g-4">
                <Col lg={4}>
                  <div className="d-flex gap-2 mb-2"><Badge bg={colors[item.status]}>{item.status.replace('_', ' ')}</Badge><Badge bg={item.priority === 'high' ? 'danger' : 'secondary'}>{item.priority}</Badge></div>
                  <h2 className="h6 fw-bold">{item.subject}</h2>
                  <p className="small mb-2">{item.description}</p>
                  <small className="text-muted">From {item.openedBy?.name} ({item.openedBy?.role})</small>
                </Col>
                <Col lg={8}>
                  <Row className="g-2">
                    <Col md={6}>
                      <Form.Group controlId={`case-${item._id}-status`}><Form.Label>Status</Form.Label><Form.Select value={item.status} onChange={(event) => change(item._id, 'status', event.target.value)}><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option><option value="closed">Closed</option></Form.Select></Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId={`case-${item._id}-priority`}><Form.Label>Priority</Form.Label><Form.Select value={item.priority} onChange={(event) => change(item._id, 'priority', event.target.value)}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></Form.Select></Form.Group>
                    </Col>
                    <Col xs={12}>
                      <Form.Group controlId={`case-${item._id}-response`}><Form.Label>Response to user</Form.Label><Form.Control as="textarea" rows={3} maxLength={2000} value={item.adminResponse || ''} onChange={(event) => change(item._id, 'adminResponse', event.target.value)} /></Form.Group>
                    </Col>
                  </Row>
                  <Button className="mt-3" onClick={() => update(item)} disabled={savingId === item._id}>{savingId === item._id ? 'Saving...' : 'Save response'}</Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </Container>
    </div>
  );
};

export default AdminDisputes;
