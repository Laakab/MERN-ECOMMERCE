import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, Alert, Navbar, Nav, Dropdown } from 'react-bootstrap';
import { FaTruck, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSearch, FaSync, FaUser, FaSignOutAlt, FaFileExcel } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import * as XLSX from 'xlsx';

const Deliver = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState('');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [user, setUser] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState(new Set()); // For multiple selection

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  // Fetch orders from API - updated version
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use full URL in development
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
        
      const response = await axios.get(`${baseUrl}/api/orders`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid response format');
      }
      
      setOrders(response.data.orders || []);
      setSelectedOrders(new Set()); // Clear selection when orders are refreshed
    } catch (err) {
      console.error('Order fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Update status handler - improved version
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate) return;
    
    setUpdateLoading(true);
    setUpdateError(null);
    
    try {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000' 
        : '';
        
      const response = await axios.put(
        `${baseUrl}/api/orders/${selectedOrder._id}`, 
        { status: statusUpdate }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Update failed');
      }
      
      setOrders(orders.map(order => 
        order._id === selectedOrder._id ? response.data.order : order
      ));
      
      setSuccessMessage(`Order status updated to ${statusUpdate}`);
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowModal(false);
    } catch (err) {
      console.error('Status update error:', err);
      setUpdateError(
        err.response?.data?.message || 
        err.message || 
        'Failed to update order status'
      );
    } finally {
      setUpdateLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  useEffect(() => {
    let result = orders;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order => 
        order._id.toLowerCase().includes(term) ||
        order.customer.firstName.toLowerCase().includes(term) ||
        order.customer.lastName.toLowerCase().includes(term) ||
        order.customer.email.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(result);
  }, [orders, searchTerm, statusFilter]);

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

  // Refresh orders
  const refreshOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data.orders || []);
      setSelectedOrders(new Set()); // Clear selection when orders are refreshed
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to refresh orders');
    } finally {
      setLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Toggle order selection
  const toggleOrderSelection = (orderId) => {
    const newSelectedOrders = new Set(selectedOrders);
    if (newSelectedOrders.has(orderId)) {
      newSelectedOrders.delete(orderId);
    } else {
      newSelectedOrders.add(orderId);
    }
    setSelectedOrders(newSelectedOrders);
  };

  // Select all filtered orders
  const selectAllOrders = () => {
    if (selectedOrders.size === filteredOrders.length) {
      setSelectedOrders(new Set());
    } else {
      setSelectedOrders(new Set(filteredOrders.map(order => order._id)));
    }
  };

  // Export to Excel function
  const exportToExcel = (ordersToExport, fileName) => {
    // Prepare data for Excel
    const data = ordersToExport.map(order => ({
      'Order ID': order._id,
      'Customer Name': `${order.customer.firstName} ${order.customer.lastName}`,
      'Customer Email': order.customer.email,
      'Customer Phone': order.customer.phone || 'N/A',
      'Items Count': order.items.length,
      'Total Amount': `$${order.total.toFixed(2)}`,
      'Status': order.status.charAt(0).toUpperCase() + order.status.slice(1),
      'Order Date': new Date(order.createdAt).toLocaleDateString(),
      'Order Time': new Date(order.createdAt).toLocaleTimeString(),
      'Address': `${order.customer.address.street}, ${order.customer.address.city}, ${order.customer.address.state} ${order.customer.address.zipCode}, ${order.customer.address.country}`,
      'Shipping Method': order.shippingMethod,
      'Payment Method': order.paymentMethod,
      'Subtotal': `$${order.subtotal.toFixed(2)}`,
      'Shipping Cost': `$${order.shipping.toFixed(2)}`,
      'Tax': `$${order.tax.toFixed(2)}`
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(data);

    // Define styles for headers
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4F81BD" } } // Blue background
    };

    // Define styles for data based on status
    const statusStyles = {
      pending: { fill: { fgColor: { rgb: "FFF2CC" } } }, // Light yellow
      processing: { fill: { fgColor: { rgb: "DDEBF7" } } }, // Light blue
      shipped: { fill: { fgColor: { rgb: "E2EFDA" } } }, // Light green
      delivered: { fill: { fgColor: { rgb: "C6E0B4" } } }, // Green
      cancelled: { fill: { fgColor: { rgb: "FCE4D6" } } } // Light red
    };

    // Apply header styles
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ c: C, r: 0 });
      if (!worksheet[address]) continue;
      worksheet[address].s = headerStyle;
    }

    // Apply data styles based on status
    ordersToExport.forEach((order, rowIndex) => {
      const statusColIndex = 6; // Status is at column G (index 6)
      const address = XLSX.utils.encode_cell({ c: statusColIndex, r: rowIndex + 1 });
      
      if (worksheet[address]) {
        worksheet[address].s = statusStyles[order.status] || {};
      }
    });

    // Set column widths
    const colWidths = [
      { wch: 20 }, // Order ID
      { wch: 20 }, // Customer Name
      { wch: 25 }, // Customer Email
      { wch: 15 }, // Customer Phone
      { wch: 10 }, // Items Count
      { wch: 12 }, // Total Amount
      { wch: 12 }, // Status
      { wch: 12 }, // Order Date
      { wch: 12 }, // Order Time
      { wch: 40 }, // Address
      { wch: 15 }, // Shipping Method
      { wch: 15 }, // Payment Method
      { wch: 10 }, // Subtotal
      { wch: 12 }, // Shipping Cost
      { wch: 10 }  // Tax
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");

    // Generate Excel file and trigger download
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // Export single order
  const exportSingleOrder = (order) => {
    exportToExcel([order], `Order_${order._id.slice(-8)}`);
  };

  // Export selected orders
  const exportSelectedOrders = () => {
    const ordersToExport = filteredOrders.filter(order => selectedOrders.has(order._id));
    if (ordersToExport.length === 0) {
      alert('Please select at least one order to export');
      return;
    }
    exportToExcel(ordersToExport, `Selected_Orders_${new Date().toISOString().slice(0, 10)}`);
  };

  // Export all filtered orders
  const exportAllOrders = () => {
    if (filteredOrders.length === 0) {
      alert('No orders to export');
      return;
    }
    exportToExcel(filteredOrders, `All_Orders_${new Date().toISOString().slice(0, 10)}`);
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
          <Button variant="link" onClick={refreshOrders} className="ms-2 p-0">
            Try again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Header with user profile */}
      <Navbar bg="light" expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="#">
            <FaTruck className="me-2" />
            Deliver Dashboard
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              {user && (
                <Dropdown align="end">
                  <Dropdown.Toggle variant="outline-primary" id="dropdown-basic">
                    <FaUser className="me-2" />
                    {user.firstName} {user.lastName}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item href="#">
                      <FaUser className="me-2" />
                      Profile
                    </Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>
                      <FaSignOutAlt className="me-2" />
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container className="py-4">
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="success" onClose={() => setSuccessMessage('')} dismissible>
              <FaCheckCircle className="me-2" />
              {successMessage}
            </Alert>
          </motion.div>
        )}

        <Card className="mb-4">
          <Card.Body>
            <Row className="g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Search Orders</Form.Label>
                  <div className="input-group">
                    <Form.Control
                      type="text"
                      placeholder="Search by ID, name or email..."
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
              <Col md={4} className="d-flex align-items-end">
                <div className="d-flex gap-2 w-100">
                  <Button 
                    variant="outline-success" 
                    onClick={exportSelectedOrders}
                    disabled={selectedOrders.size === 0}
                    className="flex-fill"
                  >
                    <FaFileExcel className="me-2" />
                    Export Selected ({selectedOrders.size})
                  </Button>
                  <Button 
                    variant="success" 
                    onClick={exportAllOrders}
                    disabled={filteredOrders.length === 0}
                    className="flex-fill"
                  >
                    <FaFileExcel className="me-2" />
                    Export All
                  </Button>
                </div>
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
              <Button variant="primary" onClick={refreshOrders}>
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
                      <th>
                        <Form.Check
                          type="checkbox"
                          checked={selectedOrders.size === filteredOrders.length}
                          onChange={selectAllOrders}
                          title="Select all orders"
                        />
                      </th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
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
                        <td>
                          <Form.Check
                            type="checkbox"
                            checked={selectedOrders.has(order._id)}
                            onChange={() => toggleOrderSelection(order._id)}
                          />
                        </td>
                        <td>#{order._id.slice(-8)}</td>
                        <td>
                          {order.customer.firstName} {order.customer.lastName}
                          <br />
                          <small className="text-muted">{order.customer.email}</small>
                        </td>
                        <td>{order.items.length} item(s)</td>
                        <td>${order.total.toFixed(2)}</td>
                        <td>
                          <Badge bg={getStatusBadge(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          {new Date(order.createdAt).toLocaleDateString()}
                          <br />
                          <small className="text-muted">
                            {new Date(order.createdAt).toLocaleTimeString()}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => {
                                setSelectedOrder(order);
                                setStatusUpdate(order.status);
                                setShowModal(true);
                              }}
                            >
                              Update
                            </Button>
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => exportSingleOrder(order)}
                              title="Export to Excel"
                            >
                              <FaFileExcel />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </motion.div>
        )}

        {/* Order Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>
              Order #{selectedOrder?._id.slice(-8)} - {selectedOrder?.customer.firstName}{' '}
              {selectedOrder?.customer.lastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedOrder && (
              <>
                <Row className="mb-3">
                  <Col md={6}>
                    <h6>Customer Information</h6>
                    <p>
                      {selectedOrder.customer.firstName} {selectedOrder.customer.lastName}
                      <br />
                      {selectedOrder.customer.email}
                      <br />
                      {selectedOrder.customer.phone || 'No phone provided'}
                    </p>
                    
                    <h6 className="mt-3">Shipping Address</h6>
                    <p>
                      {selectedOrder.customer.address.street}
                      <br />
                      {selectedOrder.customer.address.city}, {selectedOrder.customer.address.state}
                      <br />
                      {selectedOrder.customer.address.zipCode}, {selectedOrder.customer.address.country}
                    </p>
                  </Col>
                  <Col md={6}>
                    <h6>Order Summary</h6>
                    <Table borderless size="sm">
                      <tbody>
                        <tr>
                          <td>Subtotal:</td>
                          <td className="text-end">${selectedOrder.subtotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Shipping:</td>
                          <td className="text-end">${selectedOrder.shipping.toFixed(2)}</td>
                        </tr>
                        <tr>
                          <td>Tax:</td>
                          <td className="text-end">${selectedOrder.tax.toFixed(2)}</td>
                        </tr>
                        <tr className="fw-bold">
                          <td>Total:</td>
                          <td className="text-end">${selectedOrder.total.toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </Table>
                    
                    <h6 className="mt-3">Shipping Method</h6>
                    <p>{selectedOrder.shippingMethod}</p>
                    
                    <h6 className="mt-3">Payment Method</h6>
                    <p>{selectedOrder.paymentMethod}</p>
                  </Col>
                </Row>
                
                <h6>Order Items</h6>
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Qty</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>
                          {item.productName}
                          {item.color && (
                            <span className="d-block text-muted">Color: {item.color}</span>
                          )}
                          {item.size && (
                            <span className="d-block text-muted">Size: {item.size}</span>
                          )}
                        </td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>{item.quantity}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
                
                <Form.Group className="mt-4">
                  <Form.Label>Update Status</Form.Label>
                  <Form.Select
                    value={statusUpdate}
                    onChange={(e) => setStatusUpdate(e.target.value)}
                    disabled={updateLoading}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            {updateError && (
              <Alert variant="danger" className="w-100 mb-3">
                <FaTimesCircle className="me-2" />
                {updateError}
              </Alert>
            )}
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              disabled={updateLoading || !statusUpdate}
            >
              {updateLoading ? 'Updating...' : 'Update Status'}
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </>
  );
};

export default Deliver;