import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Badge, Button, Card, Col, Container, Row, Spinner } from 'react-bootstrap';
import {
  ArrowLeft as FaArrowLeft, CalendarBlank as FaCalendarAlt, CheckCircle as FaCheckCircle, Clock as FaClock,
  FileText as FaFileMedical, MapPin as FaMapMarkerAlt, NotePencil as FaNotesMedical, Stethoscope as FaUserMd,
  Prescription as FaPrescriptionBottleAlt, ArrowClockwise as FaRedo,
} from '@phosphor-icons/react';
import api from '../../services/api';
import downloadDocument from '../../services/downloadDocument';
import statusConfig from '../../constants/appointmentStatus';

const AppointmentDetail = () => {
  const { id } = useParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentError, setDocumentError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const { data } = await api.get(`/appointments/${id}`);
        setAppointment(data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'We could not load this appointment.');
      } finally {
        setLoading(false);
      }
    };
    fetchAppointment();
  }, [id]);

  if (loading) {
    return (
      <div className="app-page page-loading" role="status" aria-live="polite">
        <Spinner animation="border" />
        <span>Loading appointment details...</span>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <Container className="app-page py-5">
        <Alert variant="danger">{error || 'Appointment not found.'}</Alert>
        <Button as={Link} to="/patient/appointments" variant="outline-primary">
          <FaArrowLeft className="me-2" />Back to appointments
        </Button>
      </Container>
    );
  }

  const status = statusConfig[appointment.status] || statusConfig.pending;
  const clinical = appointment.clinicalRecord || {};
  const hasClinicalRecord = Boolean(clinical.diagnosis || clinical.visitSummary || clinical.prescription || clinical.recommendations || clinical.followUpDate);
  const handleDownload = async () => {
    setDownloading(true);
    setDocumentError('');
    try {
      await downloadDocument(appointment._id, appointment.document);
    } catch (err) {
      setDocumentError(err.response?.data?.message || 'The document could not be downloaded.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="app-page">
      <Container className="py-4 py-lg-5">
        <Button as={Link} to="/patient/appointments" variant="link" className="back-link px-0 mb-3">
          <FaArrowLeft className="me-2" />Back to appointments
        </Button>

        <Row className="g-4">
          <Col lg={8}>
            <Card className="content-card">
              <Card.Body className="p-4 p-lg-5">
                <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mb-4">
                  <div>
                    <span className="section-kicker">Appointment details</span>
                    <h1 className="page-title mt-2 mb-1">Visit with Dr. {appointment.doctorId?.name}</h1>
                    <p className="text-muted mb-0">{appointment.doctorId?.specialization}</p>
                  </div>
                  <Badge bg={status.color} className="status-badge">{status.label}</Badge>
                </div>

                <div className="detail-grid">
                  <div className="detail-item">
                    <FaCalendarAlt aria-hidden="true" />
                    <div><span>Date</span><strong>{new Date(appointment.appointmentDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
                  </div>
                  <div className="detail-item">
                    <FaClock aria-hidden="true" />
                    <div><span>Time</span><strong>{appointment.appointmentTime}</strong></div>
                  </div>
                  <div className="detail-item">
                    <FaUserMd aria-hidden="true" />
                    <div><span>Doctor</span><strong>Dr. {appointment.doctorId?.name}</strong></div>
                  </div>
                  <div className="detail-item">
                    <FaMapMarkerAlt aria-hidden="true" />
                    <div><span>Location</span><strong>{appointment.doctorId?.location || 'Confirm with the clinic'}</strong></div>
                  </div>
                </div>

                <div className="detail-section">
                  <h2><FaNotesMedical aria-hidden="true" />Reason for visit</h2>
                  <p>{appointment.reason}</p>
                </div>

                {appointment.doctorNotes && (
                  <div className="detail-section detail-section-accent">
                    <h2><FaCheckCircle aria-hidden="true" />Doctor's note</h2>
                    <p>{appointment.doctorNotes}</p>
                  </div>
                )}

                {hasClinicalRecord && (
                  <div className="detail-section clinical-record">
                    <h2><FaPrescriptionBottleAlt aria-hidden="true" />Consultation record</h2>
                    <div className="clinical-grid">
                      {clinical.diagnosis && <div><span>Diagnosis</span><p>{clinical.diagnosis}</p></div>}
                      {clinical.visitSummary && <div><span>Visit summary</span><p>{clinical.visitSummary}</p></div>}
                      {clinical.prescription && <div><span>Prescription</span><p>{clinical.prescription}</p></div>}
                      {clinical.recommendations && <div><span>Recommendations</span><p>{clinical.recommendations}</p></div>}
                      {clinical.followUpDate && <div><span>Follow-up date</span><p>{new Date(clinical.followUpDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p></div>}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="content-card sticky-lg-top appointment-side-card">
              <Card.Body className="p-4">
                {['pending', 'approved'].includes(appointment.status) && (
                  <Button as={Link} to={`/patient/appointments/${appointment._id}/reschedule`} variant="primary" className="w-100 mb-3">
                    <FaRedo className="me-2" />Reschedule appointment
                  </Button>
                )}
                <h2 className="h5 fw-bold">Supporting document</h2>
                {appointment.document ? (
                  <>
                    <p className="text-muted small">Your uploaded file is available to the assigned doctor.</p>
                    {documentError && <Alert variant="danger" className="small">{documentError}</Alert>}
                    <Button onClick={handleDownload} disabled={downloading} variant="outline-primary" className="w-100">
                      {downloading ? <Spinner size="sm" className="me-2" /> : <FaFileMedical className="me-2" />}
                      Download document
                    </Button>
                  </>
                ) : (
                  <p className="text-muted small mb-0">No document was attached to this appointment.</p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AppointmentDetail;
