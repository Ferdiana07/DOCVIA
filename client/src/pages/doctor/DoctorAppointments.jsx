import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner, Modal, Form, Alert, Tabs, Tab } from 'react-bootstrap';
import {
  CalendarCheck as FaCalendarCheck, File as FaFileAlt,
  User as FaUser, Phone as FaPhone, Stethoscope as FaStethoscope,
  Heartbeat as FaHeartbeat, NotePencil as FaNotesMedical,
} from '@phosphor-icons/react';
import api from '../../services/api';
import downloadDocument from '../../services/downloadDocument';
import statusConfig from '../../constants/appointmentStatus';

const DoctorAppointments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [doctorNotes, setDoctorNotes] = useState('');
  const [error, setError] = useState('');
  const [documentLoading, setDocumentLoading] = useState(false);
  const [clinicalRecord, setClinicalRecord] = useState({
    diagnosis: '', visitSummary: '', prescription: '', recommendations: '', followUpDate: '',
  });
  const requestedStatus = searchParams.get('status');
  const activeTab = Object.hasOwn(statusConfig, requestedStatus) ? requestedStatus : 'pending';

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/appointments');
      setAppointments(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Appointments could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchAppointments);
  }, [fetchAppointments]);

  const openModal = (appt) => {
    setSelected(appt);
    setDoctorNotes(appt.doctorNotes || '');
    setClinicalRecord({
      diagnosis: appt.clinicalRecord?.diagnosis || '',
      visitSummary: appt.clinicalRecord?.visitSummary || '',
      prescription: appt.clinicalRecord?.prescription || '',
      recommendations: appt.clinicalRecord?.recommendations || '',
      followUpDate: appt.clinicalRecord?.followUpDate?.slice(0, 10) || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleDocumentDownload = async () => {
    setDocumentLoading(true);
    setError('');
    try {
      await downloadDocument(selected._id, selected.document);
    } catch (err) {
      setError(err.response?.data?.message || 'The document could not be downloaded.');
    } finally {
      setDocumentLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const handleAction = async (newStatus) => {
    setActionLoading(true);
    setError('');
    try {
      await api.put(`/appointments/${selected._id}/status`, {
        status: newStatus,
        doctorNotes,
      });
      await fetchAppointments();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const saveClinicalRecord = async (completeAfterSave = false) => {
    if (!clinicalRecord.diagnosis.trim() && !clinicalRecord.visitSummary.trim()) {
      setError('Add a diagnosis or visit summary before saving the consultation record.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await api.put(`/appointments/${selected._id}/clinical-record`, clinicalRecord);
      if (completeAfterSave) {
        await api.put(`/appointments/${selected._id}/status`, { status: 'completed', doctorNotes });
      }
      await fetchAppointments();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Consultation record could not be saved.');
    } finally { setActionLoading(false); }
  };

  const renderAppointmentCard = (appt) => {
    const cfg = statusConfig[appt.status];
    return (
      <Card key={appt._id} className="border-0 shadow-sm mb-3">
        <Card.Body className="p-3">
          <Row className="align-items-center g-2">
            <Col xs="auto">
              <div
                className="rounded-circle bg-success d-flex align-items-center justify-content-center text-white fw-bold"
                style={{ width: 44, height: 44 }}
              >
                {appt.patientId?.name?.charAt(0) || 'P'}
              </div>
            </Col>
            <Col>
              <div className="d-flex align-items-center gap-2 mb-1">
                <span className="fw-semibold">{appt.patientId?.name}</span>
                <Badge bg={cfg.color} className="d-flex align-items-center gap-1">
                  {cfg.icon} {cfg.label}
                </Badge>
              </div>
              <div className="text-muted small">
                <FaCalendarCheck className="me-1" />
                {new Date(appt.appointmentDate).toLocaleDateString('en-GB', {
                  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                })} at {appt.appointmentTime}
              </div>
              {appt.reason && (
                <div className="text-muted small mt-1">
                  <FaStethoscope className="me-1" />Reason: {appt.reason}
                </div>
              )}
            </Col>
            <Col xs="auto">
              <Button variant="outline-primary" size="sm" onClick={() => openModal(appt)}>
                View Details
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    );
  };

  const grouped = {
    pending:   appointments.filter((a) => a.status === 'pending'),
    approved:  appointments.filter((a) => a.status === 'approved'),
    completed: appointments.filter((a) => a.status === 'completed'),
    rejected:  appointments.filter((a) => a.status === 'rejected'),
    cancelled: appointments.filter((a) => a.status === 'cancelled'),
  };

  return (
    <div className="app-page">
      <Container className="py-4">
        <span className="section-kicker">Consultation workflow</span>
        <h1 className="page-title mt-2 mb-4"><FaCalendarCheck className="me-2 text-success" />My appointments</h1>

        {error && !showModal && <Alert variant="danger" role="alert">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>
        ) : appointments.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-5">
              <FaCalendarCheck size={48} className="text-muted mb-3" />
              <p className="text-muted">No appointments yet.</p>
            </Card.Body>
          </Card>
        ) : (
          <Tabs activeKey={activeTab} onSelect={(key) => setSearchParams(key === 'pending' ? {} : { status: key })} className="mb-3">
            {Object.entries(grouped).map(([status, appts]) => (
              <Tab
                key={status}
                eventKey={status}
                title={
                  <span>
                    {status.charAt(0).toUpperCase() + status.slice(1)}{' '}
                    {appts.length > 0 && (
                      <Badge bg={statusConfig[status]?.color || 'secondary'} pill style={{ fontSize: '0.65rem' }}>
                        {appts.length}
                      </Badge>
                    )}
                  </span>
                }
              >
                <div className="pt-2">
                  {appts.length === 0 ? (
                    <Card className="border-0 shadow-sm">
                      <Card.Body className="text-center py-4">
                        <p className="text-muted mb-0">No {status} appointments.</p>
                      </Card.Body>
                    </Card>
                  ) : (
                    appts.map(renderAppointmentCard)
                  )}
                </div>
              </Tab>
            ))}
          </Tabs>
        )}
      </Container>

      {/* Appointment Detail Modal */}
      <Modal show={showModal} onHide={closeModal} size="lg">
        {selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>Appointment Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}

              {/* Patient Info */}
              <h6 className="fw-bold text-primary mb-3">Patient Information</h6>
              <Row className="mb-3 g-2">
                <Col sm={6}>
                  <div className="text-muted small">Name</div>
                  <div className="fw-semibold">
                    <FaUser className="me-1" />{selected.patientId?.name}
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="clinical-context mt-2">
                    <strong><FaHeartbeat className="me-2" />Medical context</strong>
                    <div className="small mt-2"><span>Blood type:</span> {selected.patientId?.medicalProfile?.bloodType || 'Not provided'}</div>
                    <div className="small"><span>Allergies:</span> {selected.patientId?.medicalProfile?.allergies || 'None reported'}</div>
                    <div className="small"><span>Chronic conditions:</span> {selected.patientId?.medicalProfile?.chronicConditions || 'None reported'}</div>
                    <div className="small"><span>Current medications:</span> {selected.patientId?.medicalProfile?.currentMedications || 'None reported'}</div>
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Phone</div>
                  <div className="fw-semibold">
                    <FaPhone className="me-1" />{selected.patientId?.phone || 'Not provided'}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Email</div>
                  <div className="fw-semibold">{selected.patientId?.email}</div>
                </Col>
              </Row>

              {/* Appointment Info */}
              <h6 className="fw-bold text-primary mb-3">Appointment Information</h6>
              <Row className="mb-3 g-2">
                <Col sm={6}>
                  <div className="text-muted small">Date</div>
                  <div className="fw-semibold">
                    {new Date(selected.appointmentDate).toLocaleDateString('en-GB', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Time</div>
                  <div className="fw-semibold">{selected.appointmentTime}</div>
                </Col>
                <Col xs={12}>
                  <div className="text-muted small">Reason / Chief Complaint</div>
                  <div className="fw-semibold">{selected.reason}</div>
                </Col>
                <Col sm={6}>
                  <div className="text-muted small">Status</div>
                  <Badge bg={statusConfig[selected.status]?.color}>
                    {statusConfig[selected.status]?.label}
                  </Badge>
                </Col>
                {selected.document && (
                  <Col xs={12}>
                    <div className="text-muted small">Supporting Document</div>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      size="sm"
                      className="mt-1"
                      onClick={handleDocumentDownload}
                      disabled={documentLoading}
                    >
                      {documentLoading ? <Spinner size="sm" className="me-1" /> : <FaFileAlt className="me-1" />}
                      Download document
                    </Button>
                  </Col>
                )}
              </Row>

              {/* Doctor Notes (for reject/complete) */}
              {['pending', 'approved'].includes(selected.status) && (
                <>
                  <Form.Label htmlFor="doctor-notes" className="fw-bold text-primary mb-2">Doctor notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder="Add notes for the patient (e.g. rejection reason)..."
                    className="mb-3"
                    id="doctor-notes"
                  />
                </>
              )}

              {!['pending', 'approved'].includes(selected.status) && selected.doctorNotes && (
                <div className="detail-section detail-section-accent mb-3"><strong>Doctor note</strong><p className="mb-0 mt-1">{selected.doctorNotes}</p></div>
              )}

              {['approved', 'completed'].includes(selected.status) && (
                <div className="clinical-editor mt-4">
                  <h6 className="fw-bold text-primary mb-1"><FaNotesMedical className="me-2" />Consultation record</h6>
                  <p className="text-muted small">This information will be available to the patient after saving.</p>
                  <Row className="g-3">
                    <Col md={6}><Form.Group controlId="clinical-diagnosis"><Form.Label>Diagnosis</Form.Label><Form.Control as="textarea" rows={2} value={clinicalRecord.diagnosis} onChange={(e) => setClinicalRecord({ ...clinicalRecord, diagnosis: e.target.value })} /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="clinical-summary"><Form.Label>Visit summary</Form.Label><Form.Control as="textarea" rows={2} value={clinicalRecord.visitSummary} onChange={(e) => setClinicalRecord({ ...clinicalRecord, visitSummary: e.target.value })} /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="clinical-prescription"><Form.Label>Prescription</Form.Label><Form.Control as="textarea" rows={3} value={clinicalRecord.prescription} onChange={(e) => setClinicalRecord({ ...clinicalRecord, prescription: e.target.value })} placeholder="Medicine, dose, frequency, duration" /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="clinical-recommendations"><Form.Label>Recommendations</Form.Label><Form.Control as="textarea" rows={3} value={clinicalRecord.recommendations} onChange={(e) => setClinicalRecord({ ...clinicalRecord, recommendations: e.target.value })} /></Form.Group></Col>
                    <Col md={6}><Form.Group controlId="clinical-follow-up"><Form.Label>Follow-up date</Form.Label><Form.Control type="date" value={clinicalRecord.followUpDate} onChange={(e) => setClinicalRecord({ ...clinicalRecord, followUpDate: e.target.value })} /></Form.Group></Col>
                  </Row>
                </div>
              )}
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Close</Button>
              {selected.status === 'pending' && (
                <>
                  <Button
                    variant="success"
                    onClick={() => handleAction('approved')}
                    disabled={actionLoading}
                  >
                    {actionLoading ? <Spinner size="sm" className="me-2" /> : null}
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleAction('rejected')}
                    disabled={actionLoading}
                  >
                    Reject
                  </Button>
                </>
              )}
              {selected.status === 'approved' && (
                <Button
                  variant="info"
                  onClick={() => saveClinicalRecord(true)}
                  disabled={actionLoading}
                >
                  Save &amp; Complete
                </Button>
              )}
              {selected.status === 'completed' && (
                <Button variant="primary" onClick={() => saveClinicalRecord(false)} disabled={actionLoading}>Save record</Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
