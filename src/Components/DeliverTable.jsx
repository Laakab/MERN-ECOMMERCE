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
  Alert
} from 'react-bootstrap';
import { 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaInfoCircle, 
  FaSearch, 
  FaSync 
} from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const DeliverTable = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => {
    const term = searchTerm.toLowerCase();
    return (
      order._id.toLowerCase().includes(term) ||
      order.customer.firstName.toLowerCase().includes(term) ||
      order.customer.lastName.toLowerCase().includes(term) ||
      order.customer.email.toLowerCase().includes(term)
    );
  });

  // Group orders by status
  const ordersByStatus = {
    pending: filteredOrders.filter(order => order.status === 'pending'),
    processing: filteredOrders.filter(order => order.status === 'processing'),
    shipped: filteredOrders.filter(order => order.status === 'shipped'),
    delivered: filteredOrders.filter(order => order.status === 'delivered'),
    cancelled: filteredOrders.filter(order => order.status === 'cancelled')
  };

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

  // Update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
        
      const response = await axios.put(
        `${baseUrl}/api/orders/${orderId}`, 
        { status: newStatus }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Update failed');
      }
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
    } catch (err) {
      console.error('Status update error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update order status');
    }
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
          <FaTruck className="me-2" /> Delivery Management
        </h2>
      </motion.div>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button variant="outline-secondary">
                  <FaSearch />
                </Button>
              </div>
            </Col>
            <Col md={6} className="text-end">
              <Button variant="primary" onClick={fetchOrders}>
                <FaSync className="me-2" /> Refresh
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Pending Orders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="mb-4">
          <Card.Header className="bg-warning bg-opacity-10">
            <h5 className="mb-0">Pending Orders ({ordersByStatus.pending.length})</h5>
          </Card.Header>
          <Card.Body>
            {ordersByStatus.pending.length > 0 ? (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.pending.map(order => (
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
                      <td>{order.items.length} item(s)</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-success"
                          size="sm"
                          className="me-2"
                          onClick={() => updateOrderStatus(order._id, 'processing')}
                        >
                          Start Processing
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3 text-muted">
                <FaInfoCircle className="me-2" />
                No pending orders
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Processing Orders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-4">
          <Card.Header className="bg-info bg-opacity-10">
            <h5 className="mb-0">Processing Orders ({ordersByStatus.processing.length})</h5>
          </Card.Header>
          <Card.Body>
            {ordersByStatus.processing.length > 0 ? (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.processing.map(order => (
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
                      <td>{order.items.length} item(s)</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => updateOrderStatus(order._id, 'shipped')}
                        >
                          Mark as Shipped
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => updateOrderStatus(order._id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3 text-muted">
                <FaInfoCircle className="me-2" />
                No processing orders
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Shipped Orders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="mb-4">
          <Card.Header className="bg-primary bg-opacity-10">
            <h5 className="mb-0">Shipped Orders ({ordersByStatus.shipped.length})</h5>
          </Card.Header>
          <Card.Body>
            {ordersByStatus.shipped.length > 0 ? (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.shipped.map(order => (
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
                      <td>{order.items.length} item(s)</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => updateOrderStatus(order._id, 'delivered')}
                        >
                          Mark as Delivered
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3 text-muted">
                <FaInfoCircle className="me-2" />
                No shipped orders
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Delivered Orders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="mb-4">
          <Card.Header className="bg-success bg-opacity-10">
            <h5 className="mb-0">Delivered Orders ({ordersByStatus.delivered.length})</h5>
          </Card.Header>
          <Card.Body>
            {ordersByStatus.delivered.length > 0 ? (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.delivered.map(order => (
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
                      <td>{order.items.length} item(s)</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3 text-muted">
                <FaInfoCircle className="me-2" />
                No delivered orders
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>

      {/* Cancelled Orders */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="mb-4">
          <Card.Header className="bg-danger bg-opacity-10">
            <h5 className="mb-0">Cancelled Orders ({ordersByStatus.cancelled.length})</h5>
          </Card.Header>
          <Card.Body>
            {ordersByStatus.cancelled.length > 0 ? (
              <Table striped hover responsive>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ordersByStatus.cancelled.map(order => (
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
                      <td>{order.items.length} item(s)</td>
                      <td>${order.total.toFixed(2)}</td>
                      <td>
                        {new Date(order.createdAt).toLocaleDateString()}
                        <br />
                        <small className="text-muted">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <Badge bg={getStatusBadge(order.status)}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <div className="text-center py-3 text-muted">
                <FaInfoCircle className="me-2" />
                No cancelled orders
              </div>
            )}
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default DeliverTable;