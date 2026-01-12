import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Badge, 
  Spinner,
  Alert,
  Form
} from 'react-bootstrap';
import { 
  FaShoppingCart, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaSearch, 
  FaSync,
  FaEye
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OrderTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const navigate = useNavigate();

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
        
      const response = await axios.get(`${baseUrl}/api/orders`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid response format');
      }
      
      setOrders(response.data.orders || []);
    } catch (err) {
      console.error('Order fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      order._id.toLowerCase().includes(term) ||
      order.customer.firstName.toLowerCase().includes(term) ||
      order.customer.lastName.toLowerCase().includes(term) ||
      order.customer.email.toLowerCase().includes(term) ||
      order.customer.phone?.toLowerCase().includes(term) ||
      order.customer.address.street.toLowerCase().includes(term)
    );
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Get badge color based on status
  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // View order details
  const viewOrderDetails = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <FaSync size={40} className="text-primary" />
        </motion.div>
        <p className="mt-3">Loading orders...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          <FaTimesCircle className="me-2" />
          {error}
          <Button variant="link" onClick={fetchOrders} className="ms-2 p-0">
            Try again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-4 d-flex align-items-center">
          <FaShoppingCart className="me-2" /> Order Management
        </h2>
      </motion.div>

      <Card className="mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Search Orders</Form.Label>
                <div className="input-group">
                  <Form.Control
                    type="text"
                    placeholder="Search by ID, name, email or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button variant="outline-secondary">
                    <FaSearch />
                  </Button>
                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={2} className="d-flex align-items-end">
              <Button variant="primary" onClick={fetchOrders} className="w-100">
                <FaSync className="me-2" /> Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {filteredOrders.length === 0 ? (
        <Card>
          <Card.Body className="text-center py-5">
            <FaInfoCircle size={40} className="text-muted mb-3" />
            <h5>No orders found</h5>
            <p className="text-muted">Try adjusting your search or filters</p>
            <Button variant="primary" onClick={fetchOrders}>
              <FaSync className="me-2" /> Refresh
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <Card.Body className="p-0">
              <Table striped hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <motion.tr
                      key={order._id}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <td>#{order._id.slice(-8)}</td>
                      <td>
                        {order.customer.firstName} {order.customer.lastName}
                        <br />
                        <small className="text-muted">{order.customer.email}</small>
                      </td>
                      <td>
                        {order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)
                        <br />
                        <small className="text-muted">{order.items.length} product(s)</small>
                      </td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        <Badge bg={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        {formatDate(order.createdAt)}
                      </td>
                      <td>
                        {order.paymentMethod}
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => viewOrderDetails(order._id)}
                        >
                          <FaEye className="me-1" /> View
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </motion.div>
      )}
    </Container>
  );
};

export default OrderTable;