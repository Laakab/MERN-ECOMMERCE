import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Spinner,
  Container,
  Card,
  Modal,
  Form,
  Row,
  Col
} from 'react-bootstrap';
import {
  FiTrash2,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiPlus,
  FiLock
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AdminPassTable = () => {
  const [passwords, setPasswords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Fetch admin passwords from API
  const fetchPasswords = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/admin/passwords');
      setPasswords(response.data.passwords);
    } catch (err) {
      console.error('Error fetching passwords:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasswords();
  }, []);

  // Delete password
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/admin/passwords/${deleteId}`);
      fetchPasswords();
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting password:', err);
    }
  };

  // Add new password
  const handleAddPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/admin/set-password', {
        password: newPassword
      });
      fetchPasswords();
      setShowAddModal(false);
      setNewPassword('');
      setConfirmPassword('');
      setError('');
    } catch (err) {
      console.error('Error adding password:', err);
      setError(err.response?.data?.message || 'Error adding password');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Admin Password Management</h2>
          <p className="text-muted">View and manage admin passwords</p>
        </Col>
        <Col className="text-end">
          <Button
            variant="primary"
            onClick={() => setShowAddModal(true)}
            className="me-2"
          >
            <FiPlus className="me-1" /> Add Password
          </Button>
          <Button
            variant="outline-secondary"
            onClick={fetchPasswords}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spin' : ''} />
          </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2">Loading passwords...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="mb-0">
                <thead>
                  <tr>
                    <th>Password</th>
                    <th>Created At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwords.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="text-center py-4 text-muted">
                        No admin passwords found
                      </td>
                    </tr>
                  ) : (
                    passwords.map((password) => (
                      <motion.tr
                        key={password._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            <FiLock className="me-2" />
                            {showPassword ? (
                              <span>{password.password}</span>
                            ) : (
                              <span>••••••••</span>
                            )}
                          </div>
                        </td>
                        <td>{formatDate(password.createdAt)}</td>
                        <td>
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="me-2"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => {
                              setDeleteId(password._id);
                              setShowDeleteModal(true);
                            }}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this admin password? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add Password Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Add Admin Password</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
              </Form.Group>
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddPassword}>
              Save Password
            </Button>
          </Modal.Footer>
        </motion.div>
      </Modal>

      <style jsx>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Container>
  );
};

export default AdminPassTable;