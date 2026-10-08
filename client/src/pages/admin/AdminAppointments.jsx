import { useState, useEffect, useCallback } from 'react';
import { Alert, Container, Card, Badge, Spinner, Table, Form } from 'react-bootstrap';
import { CalendarCheck as FaCalendarCheck } from '@phosphor-icons/react';
import api from '../../services/api';
import statusConfig from '../../constants/appointmentStatus';

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const { data } = await api.get(`/admin/appointments${params}`);
      setAppointments(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Appointments could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    queueMicrotask(fetchAppointments);
  }, [fetchAppointments]);

  return (
    <div className="app-page">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div><span className="section-kicker">Platform activity</span><h1 className="page-title mt-2 mb-0"><FaCalendarCheck className="me-2 text-info" />All appointments</h1></div>
          <Form.Label htmlFor="admin-appt-filter" className="visually-hidden">Filter appointments by status</Form.Label>
          <Form.Select
            id="admin-appt-filter"
            style={{ width: 'auto' }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </Form.Select>
        </div>

        {error && <Alert variant="danger" role="alert">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="info" /></div>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Patient</th>
                      <th>Doctor</th>
                      <th>Specialization</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th className="pe-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">
                          No appointments found.
                        </td>
                      </tr>
                    ) : (
                      appointments.map((appt) => {
                        const cfg = statusConfig[appt.status];
                        return (
                          <tr key={appt._id}>
                            <td className="ps-4 fw-semibold">{appt.patientId?.name}</td>
                            <td>Dr. {appt.doctorId?.name}</td>
                            <td className="text-muted">{appt.doctorId?.specialization}</td>
                            <td className="text-muted">
                              {new Date(appt.appointmentDate).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </td>
                            <td className="text-muted">{appt.appointmentTime}</td>
                            <td>
                              <Badge bg={cfg.color} className="d-inline-flex align-items-center gap-1">
                                {cfg.icon} {cfg.label}
                              </Badge>
                            </td>
                            <td className="pe-4 text-muted small">
                              {new Date(appt.createdAt).toLocaleDateString('en-GB', {
                                day: 'numeric', month: 'short', year: 'numeric',
                              })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </div>
  );
};

export default AdminAppointments;
