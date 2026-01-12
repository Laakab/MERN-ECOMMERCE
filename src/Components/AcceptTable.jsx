import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Badge,
  Container,
  Row,
  Col,
  Card,
  Image,
  Spinner
} from 'react-bootstrap';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiDollarSign,
  FiCheck, FiX
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

const AcceptTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/accepts');
      setData(response.data.accepts);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };
// Add these functions to handle accept/reject actions
const handleAccept = async (user) => {
  try {
    await axios.post('http://localhost:5000/api/accept-user', { userId: user._id });
    fetchData(); // Refresh the table
  } catch (error) {
    console.error('Accept error:', error);
    alert('Error accepting user');
  }
};
const handleReject = async (user) => {
  if (window.confirm('Are you sure you want to reject this user?')) {
    try {
      await axios.delete(`http://localhost:5000/api/reject-user/${user._id}`);
      fetchData(); // Refresh the table
    } catch (error) {
      console.error('Reject error:', error);
      alert('Error rejecting user');
    }
  }
};
  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    {
      header: 'Name',
      accessor: (user) => (
        <div className="d-flex align-items-center">
          <div className="user-avatar me-2">
            <div className="d-flex align-items-center justify-content-center bg-light rounded-circle" 
                 style={{ width: 40, height: 40 }}>
              <FiUser size={20} />
            </div>
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
          bg={user.role === 'shop' ? 'primary' : 'info'}
          className="text-capitalize"
        >
          {user.role}
        </Badge>
      )
    },
    {
      header: 'Payment',
      accessor: (user) => (
        user.paymentInfo ? (
          <div>
            <div className="d-flex align-items-center mb-1">
              <FiDollarSign className="me-2" />
              <span>${user.paymentInfo.amount}</span>
            </div>
            <small className="text-muted">ID: {user.paymentInfo.transactionId}</small>
          </div>
        ) : (
          <span className="text-muted">N/A</span>
        )
      )
    },
    {
      header: 'Accepted Date',
      accessor: (user) => (
        <div className="d-flex align-items-center">
          <FiCalendar className="me-2" />
          <span>{new Date(user.acceptedAt).toLocaleDateString()}</span>
        </div>
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
    {
      header: 'Actions',
      accessor: (user) => (
        <div className="d-flex">
          <Button
            variant="outline-success"
            size="sm"
            className="me-2"
            onClick={() => handleAccept(user)}
          >
            <FiCheck /> Accept
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            onClick={() => handleReject(user)}
          >
            <FiX /> Reject
          </Button>
        </div>
      )
    }
  ];

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">Accepted Users</h2>
          <p className="text-muted">View all approved shop and delivery users</p>
        </Col>
      </Row>
      
      <Card className="shadow-sm">
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
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
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AcceptTable;