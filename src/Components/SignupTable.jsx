import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Badge,
  Modal,
  Form,
  Spinner,
  Container,
  Row,
  Col,
  Card,
  Image
} from 'react-bootstrap';
import {
  FiEdit2,
  FiTrash2,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiChevronsLeft,
  FiChevronsRight
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const SignupTable = () => {
  const [data, setData] = useState([]);
  const [profiles, setProfiles] = useState({}); // Store user profiles
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editModal, setEditModal] = useState({
    show: false,
    user: null
  });

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/signups', {
        params: {
          page: params.current || pagination.current,
          pageSize: params.pageSize || pagination.pageSize,
        },
      });

      setData(response.data.users);
      setPagination({
        current: params.current || pagination.current,
        pageSize: params.pageSize || pagination.pageSize,
        total: response.data.total,
      });

      // Fetch profiles for all users
      const profilePromises = response.data.users.map(user =>
        axios.get(`http://localhost:5000/api/profile/${user._id}`)
      );

      const profileResponses = await Promise.all(profilePromises);
      const profileData = {};

      profileResponses.forEach((res, index) => {
        if (res.data.success && res.data.profile) {
          profileData[response.data.users[index]._id] = res.data.profile;
        }
      });

      setProfiles(profileData);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 // Add delete handler
const handleDelete = async (id) => {
  if (window.confirm('Are you sure you want to delete this user?')) {
    try {
      await axios.delete(`http://localhost:5000/api/signups/${id}`);
      fetchData(); // Refresh the table
    } catch (error) {
      console.error('Delete error:', error);
      alert('Error deleting user');
    }
  }
};

  const handleEdit = (user) => {
    setEditModal({
      show: true,
      user
    });
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`http://localhost:5000/api/signups/${editModal.user._id}`, editModal.user);
      fetchData();
      setEditModal({ show: false, user: null });
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  const handlePageChange = (page) => {
    fetchData({ current: page });
  };

  const handlePageSizeChange = (e) => {
    fetchData({ current: 1, pageSize: Number(e.target.value) });
  };

  const columns = [
    {
      header: 'Name',
      accessor: (user) => (
        <div className="d-flex align-items-center">
          <div className="user-avatar me-2">
            {profiles[user._id]?.avatar ? (
              <Image
                src={profiles[user._id].avatar}
                roundedCircle
                width={40}
                height={40}
                className="object-fit-cover"
                alt="Profile"
              />
            ) : (
              <div className="d-flex align-items-center justify-content-center bg-light rounded-circle"
                style={{ width: 40, height: 40 }}>
                <FiUser size={20} />
              </div>
            )}
          </div>
          <div>
            <div className="fw-bold">{user.firstName} {user.lastName}</div>
            <small className="text-muted">@{user.username}</small>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (user) => (
        <div>
          <div className="d-flex align-items-center mb-1">
            <FiMail className="me-2" />
            <span>{user.email}</span>
          </div>
          <div className="d-flex align-items-center">
            <FiPhone className="me-2" />
            <span>{user.phoneNo || 'N/A'}</span>
          </div>
        </div>
      )
    },
    {
      header: 'Role',
      accessor: (user) => (
        <Badge
          bg={
            user.role === 'admin' ? 'danger' :
              user.role === 'shop' ? 'primary' : 'success'
          }
          className="text-capitalize"
        >
          {user.role}
        </Badge>
      )
    },
    {
      header: 'Joined Date',
      accessor: (user) => (
        <div className="d-flex align-items-center">
          <FiCalendar className="me-2" />
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      )
    },
    // {
    //   header: 'Actions',
    //   accessor: (user) => (
    //     <div className="d-flex">
    //       <Button
    //         variant="outline-primary"
    //         size="sm"
    //         className="me-2"
    //         onClick={() => handleEdit(user)}
    //       >
    //         <FiEdit2 />
    //       </Button>
    //       <Button
    //         variant="outline-danger"
    //         size="sm"
    //         onClick={() => {
    //           setDeleteId(user._id);
    //           setShowDeleteModal(true);
    //         }}
    //       >
    //         <FiTrash2 />
    //       </Button>
    //     </div>
    //   )
    // },
    {
      header: 'Payment Status',
      accessor: (user) => (
        user.paymentInfo && user.paymentInfo.status ? (
          <Badge
            bg={
              user.paymentInfo.status === 'approved' ? 'success' :
                user.paymentInfo.status === 'rejected' ? 'danger' : 'warning'
            }
            className="text-capitalize"
          >
            {user.paymentInfo.status}
          </Badge>
        ) : (
          <Badge bg="secondary">N/A</Badge>
        )
      )
    },
    {
      header: 'Payment Proof',
      accessor: (user) => (
        user.paymentInfo && user.paymentInfo.screenshot ? (
          <Button
            variant="outline-info"
            size="sm"
            onClick={() => window.open(`http://localhost:5000/${user.paymentInfo.screenshot}`, '_blank')}
          >
            View Proof
          </Button>
        ) : (
          <span className="text-muted">N/A</span>
        )
      )
    },
    // {
    //   header: 'Actions',
    //   accessor: (user) => (
    //     <div className="d-flex">
    //       {(user.role === 'shop' || user.role === 'deliver') && user.paymentInfo && user.paymentInfo.status === 'pending' && (
    //         <>
    //           <Button
    //             variant="outline-success"
    //             size="sm"
    //             className="me-2"
    //             onClick={() => handleAccept(user)}
    //           >
    //             Accept
    //           </Button>
    //           <Button
    //             variant="outline-danger"
    //             size="sm"
    //             className="me-2"
    //             onClick={() => handleReject(user)}
    //           >
    //             Reject
    //           </Button>
    //         </>
    //       )}
    //       <Button
    //         variant="outline-primary"
    //         size="sm"
    //         className="me-2"
    //         onClick={() => handleEdit(user)}
    //       >
    //         <FiEdit2 />
    //       </Button>
    //       <Button
    //         variant="outline-danger"
    //         size="sm"
    //         onClick={() => {
    //           setDeleteId(user._id);
    //           setShowDeleteModal(true);
    //         }}
    //       >
    //         <FiTrash2 />
    //       </Button>
    //     </div>
    //   )
    // }
    {
      header: 'Actions',
      accessor: (user) => (
        <div className="d-flex">
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleDelete(user._id)}
          >
            <FiTrash2 /> Delete
          </Button>
        </div>
      )
    }
  ];
  // Add these functions before the PaginationControls component
  const handleAccept = async (user) => {
    try {
      // Move user to accepts collection
      await axios.post('http://localhost:5000/api/accept-user', { userId: user._id });

      // Update status in signups collection
      // await axios.put(`http://localhost:5000/api/signups/${user._id}/payment-status`, {
      //   status: 'approved'
      // });

      fetchData(); // Refresh the table
    } catch (error) {
      console.error('Accept error:', error);
    }
  };

  const handleReject = async (user) => {
    try {
      // Update status in signups collection
      await axios.put(`http://localhost:5000/api/signups/${user._id}/payment-status`, {
        status: 'rejected'
      });

      fetchData(); // Refresh the table
    } catch (error) {
      console.error('Reject error:', error);
    }
  };
  const PaginationControls = () => {
    const totalPages = Math.ceil(pagination.total / pagination.pageSize);
    const pageNumbers = [];

    // Show up to 5 page numbers around current page
    let startPage = Math.max(1, pagination.current - 2);
    let endPage = Math.min(totalPages, pagination.current + 2);

    if (pagination.current <= 3) {
      endPage = Math.min(5, totalPages);
    }
    if (pagination.current >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    // Add accept and reject handlers
    const handleAccept = async (user) => {
      try {
        // Move user to accepts collection
        await axios.post('http://localhost:5000/api/accept-user', { userId: user._id });

        // Update status in signups collection
        await axios.put(`http://localhost:5000/api/signups/${user._id}/payment-status`, {
          status: 'approved'
        });

        fetchData(); // Refresh the table
      } catch (error) {
        console.error('Accept error:', error);
      }
    };

    const handleReject = async (user) => {
      try {
        // Update status in signups collection
        await axios.put(`http://localhost:5000/api/signups/${user._id}/payment-status`, {
          status: 'rejected'
        });

        fetchData(); // Refresh the table
      } catch (error) {
        console.error('Reject error:', error);
      }
    };
    return (
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center">
          <span className="me-3">Items per page:</span>
          <Form.Select
            size="sm"
            style={{ width: '80px' }}
            value={pagination.pageSize}
            onChange={handlePageSizeChange}
          >
            {[5, 10, 20, 50].map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </Form.Select>
        </div>

        <div className="d-flex align-items-center">
          <span className="me-3">
            Showing {(pagination.current - 1) * pagination.pageSize + 1} to{' '}
            {Math.min(pagination.current * pagination.pageSize, pagination.total)} of{' '}
            {pagination.total} items
          </span>

          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagination.current === 1}
            onClick={() => handlePageChange(1)}
            className="me-1"
          >
            <FiChevronsLeft />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagination.current === 1}
            onClick={() => handlePageChange(pagination.current - 1)}
            className="me-1"
          >
            <FiChevronLeft />
          </Button>

          {startPage > 1 && <span className="mx-1">...</span>}

          {pageNumbers.map(number => (
            <Button
              key={number}
              variant={number === pagination.current ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={() => handlePageChange(number)}
              className="mx-1"
            >
              {number}
            </Button>
          ))}

          {endPage < totalPages && <span className="mx-1">...</span>}

          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagination.current === totalPages}
            onClick={() => handlePageChange(pagination.current + 1)}
            className="ms-1"
          >
            <FiChevronRight />
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={pagination.current === totalPages}
            onClick={() => handlePageChange(totalPages)}
            className="ms-1"
          >
            <FiChevronsRight />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">User Management</h2>
          <p className="text-muted">View and manage all registered users</p>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      {columns.map((column, index) => (
                        <th key={index}>{column.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((user) => (
                      <motion.tr
                        key={user._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {columns.map((column, colIndex) => (
                          <td key={colIndex}>
                            {column.accessor(user)}
                          </td>
                        ))}
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              <div className="mt-4">
                <PaginationControls />
              </div>
            </>
          )}
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this user? This action cannot be undone.
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {editModal.show && (
          <Modal
            show={editModal.show}
            onHide={() => setEditModal({ show: false, user: null })}
            centered
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <Modal.Header closeButton>
                <Modal.Title>Edit User</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {editModal.user && (
                  <Form>
                    <div className="text-center mb-3">
                      {profiles[editModal.user._id]?.avatar ? (
                        <Image
                          src={profiles[editModal.user._id].avatar}
                          roundedCircle
                          width={80}
                          height={80}
                          className="object-fit-cover mb-2"
                          alt="Profile"
                        />
                      ) : (
                        <div className="d-flex align-items-center justify-content-center bg-light rounded-circle mx-auto"
                          style={{ width: 80, height: 80 }}>
                          <FiUser size={30} />
                        </div>
                      )}
                      <div className="small text-muted">Profile Picture</div>
                    </div>

                    <Form.Group className="mb-3">
                      <Form.Label>First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editModal.user.firstName}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          user: {
                            ...editModal.user,
                            firstName: e.target.value
                          }
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editModal.user.lastName}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          user: {
                            ...editModal.user,
                            lastName: e.target.value
                          }
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={editModal.user.email}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          user: {
                            ...editModal.user,
                            email: e.target.value
                          }
                        })}
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Role</Form.Label>
                      <Form.Select
                        value={editModal.user.role}
                        onChange={(e) => setEditModal({
                          ...editModal,
                          user: {
                            ...editModal.user,
                            role: e.target.value
                          }
                        })}
                      >
                        <option value="user">User</option>
                        <option value="shop">Shop</option>
                        <option value="admin">Admin</option>
                      </Form.Select>
                    </Form.Group>
                  </Form>
                )}
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  onClick={() => setEditModal({ show: false, user: null })}
                >
                  Cancel
                </Button>
                <Button variant="primary" onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </Modal.Footer>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </Container>
  );
};

export default SignupTable;