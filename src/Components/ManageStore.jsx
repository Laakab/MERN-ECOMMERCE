import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Tab,
  Tabs,
  Image,
  Modal,
  Dropdown,
  Table,
  Badge,
  ProgressBar,
  ListGroup,
  Accordion,
  InputGroup,
  Spinner,
  Alert,
  Toast,
  ToastContainer,
  OverlayTrigger,
  Tooltip
} from 'react-bootstrap';
import {
  FiSettings,
  FiLock,
  FiShoppingCart,
  FiUser,
  FiShoppingBag,
  FiUsers,
  FiDollarSign,
  FiPieChart,
  FiTag,
  FiTruck,
  FiGlobe,
  FiCreditCard,
  FiFileText,
  FiAlertCircle,
  FiBarChart2,
  FiCalendar,
  FiGift,
  FiMail,
  FiMapPin,
  FiRefreshCw,
  FiSearch,
  FiSliders,
  FiStar,
  FiTrendingUp,
  FiUpload,
  FiDownload,
  FiPrinter
} from 'react-icons/fi';
import axios from 'axios';
import { motion } from 'framer-motion';

const ManageStore = ({ profile, setProfile, darkMode, setDarkMode, themeColor, setThemeColor }) => {
  // Theme colors
  const themeColors = [
    { name: 'Blue', value: '#4e73df' },
    { name: 'Green', value: '#1cc88a' },
    { name: 'Purple', value: '#6f42c1' },
    { name: 'Orange', value: '#fd7e14' },
    { name: 'Red', value: '#e74a3b' },
  ];

  // State for form inputs
  const [storeName, setStoreName] = useState(profile.name || '');
  const [storeEmail, setStoreEmail] = useState(profile.email || '');
  const [storeDescription, setStoreDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [storePhone, setStorePhone] = useState('');
  const [storeLogo, setStoreLogo] = useState(profile.avatar || '');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState('');
  const [showBackgroundUpload, setShowBackgroundUpload] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // New states for tools
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [taxSettings, setTaxSettings] = useState({ rate: 0, enabled: false });
  // const [analyticsData, setAnalyticsData] = useState({});
  const [analyticsData, setAnalyticsData] = useState({
    visitors: 0,
    conversionRate: '0%',
    avgOrderValue: 0,  // Add default value
    topProducts: []
  });
  const [seoData, setSeoData] = useState({ title: '', description: '', keywords: '' });
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [storeLocations, setStoreLocations] = useState([]);
  const [emailTemplates, setEmailTemplates] = useState([]);
  const [importExportStatus, setImportExportStatus] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Sample data for demonstration
  useEffect(() => {
    // Inventory data
    setInventory([
      { id: 1, name: 'Wireless Headphones', sku: 'WH-001', stock: 45, price: 99.99, status: 'In Stock' },
      { id: 2, name: 'Smart Watch', sku: 'SW-002', stock: 12, price: 199.99, status: 'Low Stock' },
      { id: 3, name: 'Running Shoes', sku: 'RS-003', stock: 0, price: 79.99, status: 'Out of Stock' },
    ]);

    // Orders data
    setOrders([
      { id: 1, customer: 'John Doe', date: '2023-05-15', total: 128.50, status: 'Completed' },
      { id: 2, customer: 'Jane Smith', date: '2023-05-14', total: 245.99, status: 'Processing' },
      { id: 3, customer: 'Robert Johnson', date: '2023-05-13', total: 79.99, status: 'Shipped' },
    ]);

    // Coupons data
    setCoupons([
      { id: 1, code: 'SUMMER20', discount: '20%', expiry: '2023-08-31', usage: 45, limit: 100 },
      { id: 2, code: 'FREESHIP', discount: 'Free Shipping', expiry: '2023-07-15', usage: 12, limit: 50 },
    ]);

    // Shipping methods
    setShippingMethods([
      { id: 1, name: 'Standard Shipping', cost: 5.99, deliveryTime: '3-5 business days' },
      { id: 2, name: 'Express Shipping', cost: 12.99, deliveryTime: '1-2 business days' },
    ]);

    // Payment methods
    setPaymentMethods([
      { id: 1, name: 'Credit Card', enabled: true, processingFee: '2.9% + $0.30' },
      { id: 2, name: 'PayPal', enabled: true, processingFee: '3.5%' },
      { id: 3, name: 'Bank Transfer', enabled: false, processingFee: '1%' },
    ]);

    // Staff members
    setStaffMembers([
      { id: 1, name: 'Alex Johnson', email: 'alex@store.com', role: 'Manager', lastLogin: '2023-05-15' },
      { id: 2, name: 'Sarah Williams', email: 'sarah@store.com', role: 'Sales', lastLogin: '2023-05-14' },
    ]);

    // Store locations
    setStoreLocations([
      { id: 1, name: 'Main Store', address: '123 Main St, City', phone: '(123) 456-7890', hours: '9AM-6PM' },
      { id: 2, name: 'Downtown Branch', address: '456 Center Ave, City', phone: '(123) 456-7891', hours: '10AM-7PM' },
    ]);

    // Email templates
    setEmailTemplates([
      { id: 1, name: 'Order Confirmation', subject: 'Your Order #{order_number} is confirmed', lastEdited: '2023-05-10' },
      { id: 2, name: 'Shipping Notification', subject: 'Your Order #{order_number} has shipped', lastEdited: '2023-05-05' },
    ]);

    // Analytics data
    setAnalyticsData({
      visitors: 1245,
      conversionRate: '3.2%',
      avgOrderValue: 86.34,
      topProducts: ['Wireless Headphones', 'Smart Watch', 'Running Shoes']
    });
  }, []);

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile picture
  const saveProfilePicture = () => {
    if (selectedImage) {
      setStoreLogo(selectedImage);
      setProfile({ ...profile, avatar: selectedImage });
      setShowImageUpload(false);
      showToastMessage('Store logo updated successfully!');
    }
  };

  // Handle background image upload
  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedBackground(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save background image
  const saveBackgroundImage = () => {
    if (selectedBackground) {
      setBackgroundImage(selectedBackground);
      setShowBackgroundUpload(false);
      showToastMessage('Background image updated successfully!');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      showToastMessage("Passwords don't match!");
      return;
    }

    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      showToastMessage('Password changed successfully!');
      setShowPasswordModal(false);
      setPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showToastMessage('Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Save store settings
  const saveStoreSettings = () => {
    const updatedProfile = {
      ...profile,
      name: storeName,
      email: storeEmail,
      avatar: storeLogo,
    };
    
    setProfile(updatedProfile);
    showToastMessage('Store settings saved successfully!');
  };

  // Save SEO settings
  const saveSeoSettings = () => {
    showToastMessage('SEO settings saved successfully!');
  };

  // Save tax settings
  const saveTaxSettings = () => {
    showToastMessage('Tax settings saved successfully!');
  };

  // Toggle payment method
  const togglePaymentMethod = (id) => {
    setPaymentMethods(paymentMethods.map(method => 
      method.id === id ? { ...method, enabled: !method.enabled } : method
    ));
    showToastMessage('Payment method updated!');
  };

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Tool 1: Inventory Management
  const renderInventoryManagement = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiShoppingBag className="me-2" />Inventory Management</h5>
        <Button variant="primary" size="sm">Add Product</Button>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map(item => (
              <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.sku}</td>
                <td>{item.stock}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                  <Badge bg={
                    item.status === 'In Stock' ? 'success' : 
                    item.status === 'Low Stock' ? 'warning' : 'danger'
                  }>
                    {item.status}
                  </Badge>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-secondary" size="sm">Stock</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Tool 2: Order Management
  const renderOrderManagement = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiShoppingCart className="me-2" />Order Management</h5>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>${order.total.toFixed(2)}</td>
                <td>
                  <Badge bg={
                    order.status === 'Completed' ? 'success' : 
                    order.status === 'Processing' ? 'warning' : 'info'
                  }>
                    {order.status}
                  </Badge>
                </td>
                <td>
                  <Button variant="outline-primary" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Tool 3: Coupon Management
  const renderCouponManagement = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiTag className="me-2" />Coupon Management</h5>
        <Button variant="primary" size="sm">Create Coupon</Button>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Expiry</th>
              <th>Usage</th>
              <th>Limit</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id}>
                <td><Badge bg="info">{coupon.code}</Badge></td>
                <td>{coupon.discount}</td>
                <td>{coupon.expiry}</td>
                <td>
                  <ProgressBar 
                    now={(coupon.usage / coupon.limit) * 100} 
                    label={`${coupon.usage}/${coupon.limit}`} 
                  />
                </td>
                <td>{coupon.limit}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-danger" size="sm">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Tool 4: Shipping Methods
  const renderShippingMethods = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiTruck className="me-2" />Shipping Methods</h5>
        <Button variant="primary" size="sm">Add Method</Button>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {shippingMethods.map(method => (
            <ListGroup.Item key={method.id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6>{method.name}</h6>
                  <small className="text-muted">{method.deliveryTime}</small>
                </div>
                <div>
                  <span className="me-3">${method.cost.toFixed(2)}</span>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-danger" size="sm">Delete</Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  // Tool 5: Tax Settings
  const renderTaxSettings = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiDollarSign className="me-2" />Tax Settings</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="tax-enabled"
              label="Enable Taxes"
              checked={taxSettings.enabled}
              onChange={() => setTaxSettings({...taxSettings, enabled: !taxSettings.enabled})}
            />
          </Form.Group>
          
          {taxSettings.enabled && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Tax Rate (%)</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="number"
                    value={taxSettings.rate}
                    onChange={(e) => setTaxSettings({...taxSettings, rate: parseFloat(e.target.value) || 0})}
                  />
                  <InputGroup.Text>%</InputGroup.Text>
                </InputGroup>
              </Form.Group>
              
              <Button variant="primary" onClick={saveTaxSettings}>
                Save Tax Settings
              </Button>
            </>
          )}
        </Form>
      </Card.Body>
    </Card>
  );

  // Tool 6: Analytics Dashboard
  const renderAnalyticsDashboard = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiPieChart className="me-2" />Analytics Dashboard</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center">
              <Card.Body>
                <h6>Visitors</h6>
                <h3>{analyticsData.visitors}</h3>
                <small className="text-success"><FiTrendingUp /> 12.5% from last week</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center">
              <Card.Body>
                <h6>Conversion Rate</h6>
                <h3>{analyticsData.conversionRate}</h3>
                <small className="text-success"><FiTrendingUp /> 2.1% from last week</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center">
              <Card.Body>
                <h6>Avg. Order Value</h6>
                <h3>${analyticsData.avgOrderValue.toFixed(2)}</h3>
                <small className="text-danger"><FiTrendingUp /> 1.2% from last week</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-3">
            <Card className="text-center">
              <Card.Body>
                <h6>Top Products</h6>
                <ul className="list-unstyled">
                  {analyticsData.topProducts.map((product, index) => (
                    <li key={index}>{product}</li>
                  ))}
                </ul>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Tool 7: SEO Settings
  const renderSeoSettings = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiGlobe className="me-2" />SEO Settings</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Meta Title</Form.Label>
            <Form.Control
              type="text"
              value={seoData.title}
              onChange={(e) => setSeoData({...seoData, title: e.target.value})}
              maxLength={60}
            />
            <small className="text-muted">{seoData.title.length}/60 characters</small>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Meta Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={seoData.description}
              onChange={(e) => setSeoData({...seoData, description: e.target.value})}
              maxLength={160}
            />
            <small className="text-muted">{seoData.description.length}/160 characters</small>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Keywords</Form.Label>
            <Form.Control
              type="text"
              value={seoData.keywords}
              onChange={(e) => setSeoData({...seoData, keywords: e.target.value})}
              placeholder="comma, separated, keywords"
            />
          </Form.Group>
          
          <Button variant="primary" onClick={saveSeoSettings}>
            Save SEO Settings
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );

  // Tool 8: Payment Methods
  const renderPaymentMethods = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiCreditCard className="me-2" />Payment Methods</h5>
        <Button variant="primary" size="sm">Add Method</Button>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {paymentMethods.map(method => (
            <ListGroup.Item key={method.id}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <Form.Check
                    type="switch"
                    id={`payment-method-${method.id}`}
                    label={method.name}
                    checked={method.enabled}
                    onChange={() => togglePaymentMethod(method.id)}
                  />
                  <small className="text-muted">{method.processingFee} fee</small>
                </div>
                <div>
                  <Button variant="outline-primary" size="sm">Configure</Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  // Tool 9: Staff Management
  const renderStaffManagement = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiUsers className="me-2" />Staff Management</h5>
        <Button variant="primary" size="sm">Add Staff</Button>
      </Card.Header>
      <Card.Body>
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffMembers.map(staff => (
              <tr key={staff.id}>
                <td>{staff.name}</td>
                <td>{staff.email}</td>
                <td>{staff.role}</td>
                <td>{staff.lastLogin}</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-secondary" size="sm" className="me-2">Permissions</Button>
                  <Button variant="outline-danger" size="sm">Remove</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );

  // Tool 10: Store Locations
  const renderStoreLocations = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiMapPin className="me-2" />Store Locations</h5>
        <Button variant="primary" size="sm">Add Location</Button>
      </Card.Header>
      <Card.Body>
        <Row>
          {storeLocations.map(location => (
            <Col md={6} key={location.id} className="mb-3">
              <Card>
                <Card.Body>
                  <h5>{location.name}</h5>
                  <p className="mb-1">{location.address}</p>
                  <p className="mb-1">Phone: {location.phone}</p>
                  <p className="mb-3">Hours: {location.hours}</p>
                  <Button variant="outline-primary" size="sm" className="me-2">Edit</Button>
                  <Button variant="outline-danger" size="sm">Remove</Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Card.Body>
    </Card>
  );

  // Tool 11: Email Templates
  const renderEmailTemplates = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiMail className="me-2" />Email Templates</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {emailTemplates.map(template => (
            <ListGroup.Item key={template.id} className="d-flex justify-content-between align-items-center">
              <div>
                <h6>{template.name}</h6>
                <small className="text-muted">{template.subject}</small>
                <div className="text-muted">Last edited: {template.lastEdited}</div>
              </div>
              <Button variant="outline-primary" size="sm">Edit</Button>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  // Tool 12: Import/Export
  const renderImportExport = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiRefreshCw className="me-2" />Import / Export</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <FiUpload size={32} className="mb-3" />
                <h5>Import Products</h5>
                <p className="text-muted">Upload a CSV file to import products</p>
                <Form.Group className="mb-3">
                  <Form.Control type="file" accept=".csv" />
                </Form.Group>
                <Button variant="primary">Import</Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <FiDownload size={32} className="mb-3" />
                <h5>Export Products</h5>
                <p className="text-muted">Download your products as CSV</p>
                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    label="All products"
                    name="exportOption"
                    id="export-all"
                    defaultChecked
                  />
                  <Form.Check
                    type="radio"
                    label="Selected category"
                    name="exportOption"
                    id="export-category"
                  />
                </div>
                <Button variant="primary">Export</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Tool 13: Product Reviews
  const renderProductReviews = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiStar className="me-2" />Product Reviews</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {[1, 2, 3].map(review => (
            <ListGroup.Item key={review}>
              <div className="d-flex">
                <div className="me-3">
                  <FiUser size={24} />
                </div>
                <div>
                  <div className="d-flex justify-content-between">
                    <h6>Customer {review}</h6>
                    <div>
                      {[...Array(5)].map((_, i) => (
                        <FiStar
                          key={i}
                          size={16}
                          className={i < 4 ? "text-warning" : "text-muted"}
                          fill={i < 4 ? "currentColor" : "none"}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="mb-1">Great product! Very satisfied with my purchase.</p>
                  <small className="text-muted">Posted on 2023-05-{10 + review}</small>
                  <div className="mt-2">
                    <Button variant="outline-success" size="sm" className="me-2">Approve</Button>
                    <Button variant="outline-danger" size="sm">Delete</Button>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  // Tool 14: Discount Rules
  const renderDiscountRules = () => (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h5><FiGift className="me-2" />Discount Rules</h5>
        <Button variant="primary" size="sm">Add Rule</Button>
      </Card.Header>
      <Card.Body>
        <Accordion>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <div className="d-flex align-items-center">
                <FiShoppingBag className="me-2" />
                <span>Buy 2 Get 1 Free - Summer Collection</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rule Name</Form.Label>
                      <Form.Control type="text" value="Buy 2 Get 1 Free" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apply To</Form.Label>
                      <Form.Select>
                        <option>Summer Collection</option>
                        <option>All Products</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control type="date" value="2023-06-01" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>End Date</Form.Label>
                      <Form.Control type="date" value="2023-08-31" />
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" className="me-2">Save</Button>
                <Button variant="outline-danger">Delete Rule</Button>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <div className="d-flex align-items-center">
                <FiDollarSign className="me-2" />
                <span>10% Off - Orders Over $100</span>
              </div>
            </Accordion.Header>
            <Accordion.Body>
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rule Name</Form.Label>
                      <Form.Control type="text" value="10% Off Over $100" />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Minimum Order</Form.Label>
                      <InputGroup>
                        <InputGroup.Text>$</InputGroup.Text>
                        <Form.Control type="number" value="100" />
                      </InputGroup>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Discount Amount</Form.Label>
                      <InputGroup>
                        <Form.Control type="number" value="10" />
                        <InputGroup.Text>%</InputGroup.Text>
                      </InputGroup>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Apply To</Form.Label>
                      <Form.Select>
                        <option>Entire Order</option>
                        <option>Specific Categories</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" className="me-2">Save</Button>
                <Button variant="outline-danger">Delete Rule</Button>
              </Form>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Card.Body>
    </Card>
  );

  // Tool 15: Calendar & Events
  const renderCalendarEvents = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiCalendar className="me-2" />Calendar & Events</h5>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-4">
          <h4>June 2023</h4>
          <div className="d-flex justify-content-between mb-2">
            <Button variant="outline-secondary" size="sm">Previous</Button>
            <Button variant="outline-secondary" size="sm">Today</Button>
            <Button variant="outline-secondary" size="sm">Next</Button>
          </div>
        </div>
        
        <Table bordered className="calendar">
          <thead>
            <tr>
              <th>Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {[28, 29, 30, 31, 1, 2, 3].map(day => (
                <td key={day} className={day > 7 ? 'text-muted' : ''}>
                  {day}
                  {day === 5 && (
                    <div className="calendar-event bg-primary">Summer Sale</div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              {[4, 5, 6, 7, 8, 9, 10].map(day => (
                <td key={day}>
                  {day}
                  {day === 8 && (
                    <div className="calendar-event bg-success">New Collection Launch</div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              {[11, 12, 13, 14, 15, 16, 17].map(day => (
                <td key={day}>
                  {day}
                  {day === 15 && (
                    <div className="calendar-event bg-warning">Inventory Check</div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              {[18, 19, 20, 21, 22, 23, 24].map(day => (
                <td key={day}>
                  {day}
                  {day === 21 && (
                    <div className="calendar-event bg-info">Marketing Meeting</div>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              {[25, 26, 27, 28, 29, 30, 1].map(day => (
                <td key={day} className={day < 25 ? 'text-muted' : ''}>
                  {day}
                  {day === 28 && (
                    <div className="calendar-event bg-danger">End of Month Report</div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
        
        <div className="mt-3">
          <h6>Upcoming Events</h6>
          <ListGroup>
            <ListGroup.Item>
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Summer Sale</strong>
                  <div className="text-muted">June 5, 2023</div>
                </div>
                <Button variant="outline-primary" size="sm">View</Button>
              </div>
            </ListGroup.Item>
            <ListGroup.Item>
              <div className="d-flex justify-content-between">
                <div>
                  <strong>New Collection Launch</strong>
                  <div className="text-muted">June 8, 2023</div>
                </div>
                <Button variant="outline-primary" size="sm">View</Button>
              </div>
            </ListGroup.Item>
          </ListGroup>
        </div>
      </Card.Body>
    </Card>
  );

  // Tool 16: Reports
  const renderReports = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiBarChart2 className="me-2" />Reports</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Body>
                <h6>Sales Report</h6>
                <p className="text-muted">Generate sales reports by date range</p>
                <Form.Group className="mb-3">
                  <Form.Label>Date Range</Form.Label>
                  <Form.Select>
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>Custom Range</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" className="me-2">
                  <FiPrinter className="me-1" /> Print
                </Button>
                <Button variant="outline-primary">
                  <FiDownload className="me-1" /> Export
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Body>
                <h6>Inventory Report</h6>
                <p className="text-muted">View inventory levels and status</p>
                <Form.Group className="mb-3">
                  <Form.Label>Filter By</Form.Label>
                  <Form.Select>
                    <option>All Products</option>
                    <option>Low Stock</option>
                    <option>Out of Stock</option>
                    <option>By Category</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" className="me-2">
                  <FiPrinter className="me-1" /> Print
                </Button>
                <Button variant="outline-primary">
                  <FiDownload className="me-1" /> Export
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-3">
            <Card>
              <Card.Body>
                <h6>Customer Report</h6>
                <p className="text-muted">Analyze customer behavior</p>
                <Form.Group className="mb-3">
                  <Form.Label>Report Type</Form.Label>
                  <Form.Select>
                    <option>Customer List</option>
                    <option>Purchase History</option>
                    <option>Loyalty Analysis</option>
                    <option>Geographic Distribution</option>
                  </Form.Select>
                </Form.Group>
                <Button variant="primary" className="me-2">
                  <FiPrinter className="me-1" /> Print
                </Button>
                <Button variant="outline-primary">
                  <FiDownload className="me-1" /> Export
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );

  // Tool 17: Search & Filters
  const renderSearchFilters = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiSearch className="me-2" />Search & Filters</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Search Products</Form.Label>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search by name, SKU, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="primary">
                <FiSearch />
              </Button>
            </InputGroup>
          </Form.Group>
          
          <Accordion>
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <FiSliders className="me-2" />
                Advanced Filters
              </Accordion.Header>
              <Accordion.Body>
                <Row>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select>
                        <option>All Categories</option>
                        <option>Electronics</option>
                        <option>Clothing</option>
                        <option>Home & Garden</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price Range</Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control type="number" placeholder="Min" className="me-2" />
                        <span className="me-2">to</span>
                        <Form.Control type="number" placeholder="Max" />
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-3">
                      <Form.Label>Stock Status</Form.Label>
                      <Form.Select>
                        <option>Any Status</option>
                        <option>In Stock</option>
                        <option>Low Stock</option>
                        <option>Out of Stock</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Button variant="primary" className="me-2">Apply Filters</Button>
                <Button variant="outline-secondary">Reset</Button>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Form>
      </Card.Body>
    </Card>
  );

  // Tool 18: Maintenance Mode
  const renderMaintenanceMode = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiAlertCircle className="me-2" />Maintenance Mode</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="maintenance-mode"
              label="Enable Maintenance Mode"
              defaultChecked={false}
            />
            <Form.Text className="text-muted">
              When enabled, only administrators can access the storefront.
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Maintenance Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="We'll be back soon! Our store is currently undergoing maintenance."
            />
          </Form.Group>
          
          <Button variant="primary">Save Settings</Button>
        </Form>
      </Card.Body>
    </Card>
  );

  // Tool 19: Backup & Restore
  const renderBackupRestore = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiFileText className="me-2" />Backup & Restore</h5>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <h5>Create Backup</h5>
                <p className="text-muted">Generate a complete backup of your store data</p>
                <div className="mb-3">
                  <Form.Check
                    type="radio"
                    label="Full backup (database + files)"
                    name="backupType"
                    id="full-backup"
                    defaultChecked
                  />
                  <Form.Check
                    type="radio"
                    label="Database only"
                    name="backupType"
                    id="db-backup"
                  />
                  <Form.Check
                    type="radio"
                    label="Product images only"
                    name="backupType"
                    id="images-backup"
                  />
                </div>
                <Button variant="primary">
                  <FiDownload className="me-1" /> Create Backup
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6} className="mb-3">
            <Card>
              <Card.Body className="text-center">
                <h5>Restore Backup</h5>
                <p className="text-muted">Upload a backup file to restore your store</p>
                <Form.Group className="mb-3">
                  <Form.Control type="file" />
                </Form.Group>
                <Button variant="primary">
                  <FiUpload className="me-1" /> Restore Backup
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <div className="mt-3">
          <h6>Recent Backups</h6>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>2023-05-15 14:30</td>
                <td>Full Backup</td>
                <td>45.2 MB</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Download</Button>
                  <Button variant="outline-danger" size="sm">Delete</Button>
                </td>
              </tr>
              <tr>
                <td>2023-05-01 03:15</td>
                <td>Database Only</td>
                <td>12.7 MB</td>
                <td>
                  <Button variant="outline-primary" size="sm" className="me-2">Download</Button>
                  <Button variant="outline-danger" size="sm">Delete</Button>
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>
  );

  // Tool 20: System Information
  const renderSystemInfo = () => (
    <Card className="mb-4">
      <Card.Header>
        <h5><FiSettings className="me-2" />System Information</h5>
      </Card.Header>
      <Card.Body>
        <Table striped bordered>
          <tbody>
            <tr>
              <th>Store Version</th>
              <td>v2.5.1</td>
            </tr>
            <tr>
              <th>Last Update</th>
              <td>2023-05-10</td>
            </tr>
            <tr>
              <th>PHP Version</th>
              <td>8.1.5</td>
            </tr>
            <tr>
              <th>Database</th>
              <td>MySQL 5.7</td>
            </tr>
            <tr>
              <th>Server</th>
              <td>Apache/2.4.46</td>
            </tr>
            <tr>
              <th>Memory Usage</th>
              <td>
                <ProgressBar now={65} label={`65%`} />
              </td>
            </tr>
            <tr>
              <th>Disk Space</th>
              <td>
                <ProgressBar now={42} label={`42% (12.5 GB used of 30 GB)`} />
              </td>
            </tr>
          </tbody>
        </Table>
        
        <div className="mt-3">
          <Button variant="primary" className="me-2">
            <FiRefreshCw className="me-1" /> Check for Updates
          </Button>
          <Button variant="outline-secondary">
            View Detailed Logs
          </Button>
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid className="py-4">
      <ToastContainer position="top-end" className="p-3">
        <Toast onClose={() => setShowToast(false)} show={showToast} delay={3000} autohide>
          <Toast.Header>
            <strong className="me-auto">Notification</strong>
          </Toast.Header>
          <Toast.Body>{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Row>
        <Col md={3} className="mb-4">
          <Card>
            <Card.Body>
              <div className="text-center mb-4">
                <Image
                  src={storeLogo || 'https://via.placeholder.com/150'}
                  roundedCircle
                  width={120}
                  height={120}
                  className="border"
                />
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowImageUpload(true)}
                >
                  Change Logo
                </Button>
              </div>

              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
                fill
              >
                <Tab eventKey="general" title={<><FiSettings /> General</>} />
                <Tab eventKey="products" title={<><FiShoppingBag /> Products</>} />
                <Tab eventKey="orders" title={<><FiShoppingCart /> Orders</>} />
                <Tab eventKey="marketing" title={<><FiBarChart2 /> Marketing</>} />
                <Tab eventKey="settings" title={<><FiSliders /> Settings</>} />
              </Tabs>
            </Card.Body>
          </Card>
        </Col>

        <Col md={9}>
          {activeTab === 'general' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderAnalyticsDashboard()}
              {renderStoreLocations()}
              {renderStaffManagement()}
            </motion.div>
          )}

          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderInventoryManagement()}
              {renderProductReviews()}
              {renderImportExport()}
              {renderSearchFilters()}
            </motion.div>
          )}

          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderOrderManagement()}
              {renderShippingMethods()}
              {renderTaxSettings()}
              {renderPaymentMethods()}
              {renderReports()}
            </motion.div>
          )}

          {activeTab === 'marketing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderCouponManagement()}
              {renderDiscountRules()}
              {renderCalendarEvents()}
              {renderEmailTemplates()}
              {renderSeoSettings()}
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {renderMaintenanceMode()}
              {renderBackupRestore()}
              {renderSystemInfo()}
              
              {/* Original settings components */}
              <Card className="mb-4">
                <Card.Header>
                  <h5>Appearance Settings</h5>
                </Card.Header>
                <Card.Body>
                  <Form>
                    <Form.Group className="mb-4">
                      <Form.Label>Theme Color</Form.Label>
                      <div className="d-flex flex-wrap gap-2">
                        {themeColors.map((color, index) => (
                          <motion.div
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`color-option ${themeColor === color.value ? 'active' : ''}`}
                            style={{ backgroundColor: color.value }}
                            onClick={() => setThemeColor(color.value)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Check
                        type="switch"
                        id="dark-mode-switch"
                        label="Dark Mode"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                      />
                    </Form.Group>

                    <div className="d-flex justify-content-end">
                      <Button variant="primary">Save Appearance</Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </motion.div>
          )}
        </Col>
      </Row>

      {/* Original modals */}
      <Modal show={showImageUpload} onHide={() => setShowImageUpload(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Store Logo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedImage && (
            <Image
              src={selectedImage}
              thumbnail
              className="mb-3"
              style={{ maxHeight: '200px' }}
            />
          )}
          <Form.Group>
            <Form.Control type="file" accept="image/*" onChange={handleImageUpload} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowImageUpload(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveProfilePicture}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showBackgroundUpload} onHide={() => setShowBackgroundUpload(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Background Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBackground && (
            <Image
              src={selectedBackground}
              thumbnail
              className="mb-3"
              style={{ maxHeight: '200px' }}
            />
          )}
          <Form.Group>
            <Form.Control type="file" accept="image/*" onChange={handleBackgroundUpload} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBackgroundUpload(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveBackgroundImage}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirm New Password</Form.Label>
              <Form.Control
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handlePasswordChange} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Change Password'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ManageStore;