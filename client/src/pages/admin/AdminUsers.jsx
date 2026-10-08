import { useState, useEffect, useCallback } from 'react';
import { Container, Card, Badge, Button, Spinner, Table, Modal, Alert } from 'react-bootstrap';
import { UsersThree as FaUsers, User as FaUser, Stethoscope as FaUserMd, Prohibit as FaBan, UserCheck as FaUserCheck } from '@phosphor-icons/react';
import api from '../../services/api';

const roleConfig = {
  patient: { color: 'primary', icon: <FaUser /> },
  doctor:  { color: 'success', icon: <FaUserMd /> },
};

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Users could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(fetchUsers);
  }, [fetchUsers]);

  const openModal = (user) => {
    setSelected(user);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelected(null);
  };

  const handleStatusChange = async () => {
    setActionLoading(true);
    setError('');
    try {
      await api.patch(`/admin/users/${selected._id}/status`, { isActive: !selected.isActive });
      await fetchUsers();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="app-page">
      <Container className="py-4">
        <span className="section-kicker">Platform operations</span>
        <h1 className="page-title mt-2 mb-4"><FaUsers className="me-2 text-primary" />User management</h1>

        {error && !showModal && <Alert variant="danger" role="alert">{error}</Alert>}

        {loading ? (
          <div className="text-center py-5"><Spinner animation="border" variant="primary" /></div>
        ) : (
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th className="pe-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4 text-muted">No users found.</td>
                      </tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u._id}>
                          <td className="ps-4 fw-semibold">{u.name}</td>
                          <td className="text-muted">{u.email}</td>
                          <td>
                            <Badge bg={roleConfig[u.role]?.color || 'secondary'} className="d-inline-flex align-items-center gap-1">
                              {roleConfig[u.role]?.icon}
                              {u.role}
                            </Badge>
                          </td>
                          <td className="text-muted">{u.phone || 'Not provided'}</td>
                          <td>
                            <Badge bg={u.isActive ? 'success' : 'secondary'}>
                              {u.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </td>
                          <td className="text-muted small">
                            {new Date(u.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric', month: 'short', year: 'numeric',
                            })}
                          </td>
                          <td className="pe-4">
                            <Button
                              variant={u.isActive ? 'outline-danger' : 'outline-success'}
                              size="sm"
                              onClick={() => openModal(u)}
                            >
                              {u.isActive ? <FaBan className="me-1" /> : <FaUserCheck className="me-1" />}
                              {u.isActive ? 'Deactivate' : 'Reactivate'}
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>

      {/* Confirm Deactivate Modal */}
      <Modal show={showModal} onHide={closeModal}>
        {selected && (
          <>
            <Modal.Header closeButton>
              <Modal.Title>{selected.isActive ? 'Deactivate user' : 'Reactivate user'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {error && <Alert variant="danger" className="py-2">{error}</Alert>}
              <p>
                Are you sure you want to {selected.isActive ? 'deactivate' : 'reactivate'} <strong>{selected.name}</strong>?
              </p>
              <p className="text-muted small mb-0">
                {selected.isActive
                  ? 'They will be signed out and prevented from accessing protected features.'
                  : 'They will be able to sign in and access features for their role again.'}
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={closeModal}>Cancel</Button>
              <Button variant={selected.isActive ? 'danger' : 'success'} onClick={handleStatusChange} disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" className="me-2" /> : null}
                {selected.isActive ? 'Deactivate' : 'Reactivate'}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
