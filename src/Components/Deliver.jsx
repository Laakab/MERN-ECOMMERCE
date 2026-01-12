import React, { useState, useEffect } from 'react';
import { 
  Container, Row, Col, Card, Table, Button, Badge, Form, Modal, 
  Alert, Navbar, Nav, Dropdown, Tabs, Tab, ListGroup
} from 'react-bootstrap';
import { 
  FiSettings, FiLogOut, FiUser, FiLock, FiSun, FiMoon, FiX, FiImage
} from 'react-icons/fi';
import { 
  FaTruck, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaSearch, 
  FaSync, FaUser, FaSignOutAlt, FaFileExcel, FaMapMarkerAlt, 
  FaRoute, FaClock, FaChartLine, FaListAlt, FaMap, FaTasks
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [selectedOrders, setSelectedOrders] = useState(new Set());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deliveryRoutes, setDeliveryRoutes] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0
  });

  // Profile and settings states
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('#4e73df');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Delivery User',
    email: 'delivery@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'Delivery',
    themeColor: '#4e73df',
    darkMode: false,
    backgroundImage: ''
  });
  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    email: '',
    avatar: ''
  });
  const [changePasswordForm, setChangePasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [settingsForm, setSettingsForm] = useState({
    themeColor: '#4e73df',
    darkMode: false,
    backgroundImage: null
  });

  // Theme colors
  const themeColors = [
    { name: 'Blue', value: '#4e73df' },
    { name: 'Green', value: '#1cc88a' },
    { name: 'Purple', value: '#6f42c1' },
    { name: 'Orange', value: '#fd7e14' },
    { name: 'Red', value: '#e74a3b' }
  ];

  // API configuration
  const api = axios.create({
    baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:5000' : '',
    withCredentials: true
  });

  // Fetch user data from localStorage on component mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    if (userData) {
      setUser(userData);
      loadUserProfile(userData);
    }
  }, []);

  // Load user profile data
  const loadUserProfile = async (userData) => {
    try {
      // Ensure we have a valid user object
      const safeUserData = {
        _id: userData._id || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        username: userData.username || 'Delivery User',
        email: userData.email || 'delivery@example.com',
        role: userData.role || 'Delivery'
      };

      // Fetch user profile settings
      const response = await api.get(`/api/profile/${safeUserData._id}`);
      const profileData = response.data.profile || {};
      
      // Construct full avatar URL if it exists
      const avatarUrl = profileData.avatar
        ? `${api.defaults.baseURL}${profileData.avatar}`
        : 'https://randomuser.me/api/portraits/men/1.jpg'; // fallback avatar
      
      setProfile(prev => ({
        ...prev,
        name: safeUserData.firstName ?
          `${safeUserData.firstName} ${safeUserData.lastName || ''}`.trim() :
          safeUserData.username,
        email: safeUserData.email,
        role: safeUserData.role ?
          safeUserData.role.charAt(0).toUpperCase() + safeUserData.role.slice(1) :
          'Delivery',
        avatar: avatarUrl,
        ...profileData
      }));

      // Apply settings
      if (profileData.themeColor) {
        setThemeColor(profileData.themeColor);
        setSettingsForm(prev => ({ ...prev, themeColor: profileData.themeColor }));
      }
      if (profileData.darkMode !== undefined) {
        setDarkMode(profileData.darkMode);
        setSettingsForm(prev => ({ ...prev, darkMode: profileData.darkMode }));
      }
      if (profileData.backgroundImage) {
        setBackgroundImage(profileData.backgroundImage);
      }
    } catch (err) {
      console.error('Error loading user data:', err);
    }
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get('/api/orders');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Invalid response format');
      }
      
      const ordersData = response.data.orders || [];
      setOrders(ordersData);
      setSelectedOrders(new Set());
      
      // Calculate statistics
      calculateStats(ordersData);
      
      // Assign orders to current user if they're a delivery person
      if (user && user.role === 'delivery') {
        const myOrders = ordersData.filter(order => 
          order.assignedTo === user._id || 
          (order.assignedTo && order.assignedTo._id === user._id)
        );
        setAssignedOrders(myOrders);
      }
    } catch (err) {
      console.error('Order fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  // Calculate order statistics
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(order => order.status === 'pending').length,
      processing: ordersData.filter(order => order.status === 'processing').length,
      shipped: ordersData.filter(order => order.status === 'shipped').length,
      delivered: ordersData.filter(order => order.status === 'delivered').length,
      cancelled: ordersData.filter(order => order.status === 'cancelled').length
    };
    setStats(stats);
  };

  // Update status handler
  const handleStatusUpdate = async () => {
    if (!selectedOrder || !statusUpdate) return;
    
    setUpdateLoading(true);
    setUpdateError(null);
    
    try {
      const response = await api.put(
        `/api/orders/${selectedOrder._id}`, 
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
      
      // Refresh stats
      calculateStats(orders.map(order => 
        order._id === selectedOrder._id ? response.data.order : order
      ));
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
      const response = await api.get('/api/orders');
      setOrders(response.data.orders || []);
      setSelectedOrders(new Set());
      calculateStats(response.data.orders || []);
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

  // Assign orders to delivery person
  const assignToMe = async (orderId) => {
    try {
      const response = await axios.put(
        `/api/orders/${orderId}/assign`, 
        { deliveryPersonId: user._id }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Assignment failed');
      }
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
      
      setSuccessMessage('Order assigned to you successfully');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Assignment error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to assign order'
      );
    }
  };

  // Mark order as out for delivery
  const markAsOutForDelivery = async (orderId) => {
    try {
      const response = await axios.put(
        `/api/orders/${orderId}`, 
        { status: 'shipped' }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Status update failed');
      }
      
      setOrders(orders.map(order => 
        order._id === orderId ? response.data.order : order
      ));
      
      setSuccessMessage('Order marked as out for delivery');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Status update error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to update order status'
      );
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setSettingsForm(prev => ({ ...prev, darkMode: newDarkMode }));
  };

  // Save settings to database
  const saveSettings = async () => {
    try {
      if (!user?._id) return;

      const formData = new FormData();
      formData.append('themeColor', settingsForm.themeColor);
      formData.append('darkMode', settingsForm.darkMode);
      if (settingsForm.backgroundImage) {
        formData.append('backgroundImage', settingsForm.backgroundImage);
      }

      const response = await api.put(`/api/profile/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setProfile(prev => ({
        ...prev,
        themeColor: settingsForm.themeColor,
        darkMode: settingsForm.darkMode,
        backgroundImage: response.data.profile.backgroundImage || prev.backgroundImage
      }));

      setThemeColor(settingsForm.themeColor);
      setDarkMode(settingsForm.darkMode);
      if (response.data.profile.backgroundImage) {
        setBackgroundImage(response.data.profile.backgroundImage);
      }

      setShowSettingsModal(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    }
  };

  // Handle edit profile form changes
  const handleEditProfileChange = (e) => {
    const { name, value } = e.target;
    setEditProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfilePictureChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditProfileForm(prev => ({
          ...prev,
          avatar: event.target.result, // For preview
          avatarFile: file // Store the actual file for upload
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      if (!user?._id) {
        alert('User not found. Please log in again.');
        handleLogout();
        return;
      }

      const formData = new FormData();
      if (editProfileForm.name) formData.append('name', editProfileForm.name);
      if (editProfileForm.email) formData.append('email', editProfileForm.email);

      // Check if avatarFile exists (the actual File object)
      if (editProfileForm.avatarFile) {
        formData.append('avatar', editProfileForm.avatarFile);
      }

      const response = await api.put(`/api/profile/${user._id}/update`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local profile state
      setProfile(prev => ({
        ...prev,
        name: response.data.user.firstName ?
          `${response.data.user.firstName} ${response.data.user.lastName || ''}`.trim() :
          response.data.user.username || prev.name,
        email: response.data.user.email || prev.email,
        avatar: response.data.profile?.avatar || prev.avatar
      }));

      // Update localStorage user data
      localStorage.setItem('user', JSON.stringify({
        ...user,
        firstName: response.data.user.firstName || user.firstName,
        lastName: response.data.user.lastName || user.lastName,
        username: response.data.user.username || user.username,
        email: response.data.user.email || user.email
      }));

      setShowEditProfileModal(false);
    } catch (err) {
      console.error('Error saving profile changes:', err);
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  // Handle password change form
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setChangePasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // Save new password
  const saveNewPassword = async () => {
    try {
      if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      if (!user?._id) return;

      const response = await api.put(`/api/profile/${user._id}/password`, {
        currentPassword: changePasswordForm.currentPassword,
        newPassword: changePasswordForm.newPassword
      });

      alert('Password changed successfully');
      setShowChangePasswordModal(false);
      setChangePasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      console.error('Error changing password:', err);
      alert(err.response?.data?.message || 'Failed to change password');
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
          <Button variant="link" onClick={refreshOrders} className="ms-2 p-0">
            Try again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <div className={darkMode ? 'dark-mode' : ''}>
      {/* Header with user profile */}
      <Navbar bg={darkMode ? "dark" : "light"} variant={darkMode ? "dark" : "light"} expand="lg" className="mb-4 shadow-sm">
        <Container>
          <Navbar.Brand href="#">
            <FaTruck className="me-2" />
            Deliver Dashboard
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav>
              {/* Dark Mode Toggle */}
              <Button
                variant="link"
                onClick={toggleDarkMode}
                className="theme-toggle me-2"
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </Button>

              {user && (
                <div className="profile-wrapper">
                  <Button
                    variant="link"
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="profile-btn"
                  >
                    <div className="profile-avatar">
                      <img
                        src={profile.avatar}
                        alt="Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://randomuser.me/api/portraits/men/1.jpg';
                        }}
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    </div>
                  </Button>

                  <AnimatePresence>
                    {showProfileDropdown && (
                      <motion.div
                        className="profile-dropdown"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          right: '0',
                          top: '100%',
                          zIndex: 1000,
                          backgroundColor: darkMode ? '#2d3748' : 'white',
                          border: `1px solid ${darkMode ? '#4a5568' : '#e2e8f0'}`,
                          borderRadius: '0.375rem',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                          minWidth: '200px',
                          padding: '0.5rem 0'
                        }}
                      >
                        <div className="profile-header p-3 border-bottom">
                          <div className="profile-avatar-large mb-2">
                            <img 
                              src={profile.avatar} 
                              alt="Profile" 
                              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          </div>
                          <div className="profile-info">
                            <h6 className="mb-1">{profile.name}</h6>
                            <div className="profile-role-badge">
                              <Badge bg="info">{profile.role}</Badge>
                            </div>
                            <small className="text-muted">{profile.email}</small>
                          </div>
                        </div>
                        <div className="dropdown-actions p-2">
                          <Button 
                            variant="link" 
                            className="w-100 text-start d-flex align-items-center"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setShowSettingsModal(true);
                            }}
                          >
                            <FiSettings className="me-2" /> Account Settings
                          </Button>
                          <Button 
                            variant="link" 
                            className="w-100 text-start d-flex align-items-center"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setEditProfileForm({
                                name: profile.name,
                                email: profile.email,
                                avatar: profile.avatar
                              });
                              setShowEditProfileModal(true);
                            }}
                          >
                            <FiUser className="me-2" /> Edit Profile
                          </Button>
                          <Button 
                            variant="link" 
                            className="w-100 text-start d-flex align-items-center"
                            onClick={() => {
                              setShowProfileDropdown(false);
                              setShowChangePasswordModal(true);
                            }}
                          >
                            <FiLock className="me-2" /> Change Password
                          </Button>
                          <hr className="my-1" />
                          <Button 
                            variant="link" 
                            className="w-100 text-start d-flex align-items-center text-danger"
                            onClick={handleLogout}
                          >
                            <FiLogOut className="me-2" /> Logout
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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

        {/* Dashboard Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          fill
        >
          <Tab eventKey="dashboard" title={
            <>
              <FaChartLine className="me-2" />
              Dashboard
            </>
          }>
            <Row className="g-4 mb-4">
              <Col md={2} sm={6}>
                <Card className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                  <Card.Body>
                    <h6 className="text-muted">Total Orders</h6>
                    <h3>{stats.total}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2} sm={6}>
                <Card className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                  <Card.Body>
                    <h6 className="text-muted">Pending</h6>
                    <h3 className="text-warning">{stats.pending}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2} sm={6}>
                <Card className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                  <Card.Body>
                    <h6 className="text-muted">Processing</h6>
                    <h3 className="text-info">{stats.processing}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2} sm={6}>
                <Card className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                  <Card.Body>
                    <h6 className="text-muted">Shipped</h6>
                    <h3 className="text-primary">{stats.shipped}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2} sm={6}>
                <Card className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                  <Card.Body>
                    <h6 className="text-muted">Delivered</h6>
                    <h3 className="text-success">{stats.delivered}</h3>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={2} sm={6}>
                <Card className={`text-center ${darkMode ? 'bg-dark text-light' : ''}`}>
                  <Card.Body>
                    <h6 className="text-muted">Cancelled</h6>
                    <h3 className="text-danger">{stats.cancelled}</h3>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {user && user.role === 'delivery' && (
              <Card className={`mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
                <Card.Header className={darkMode ? 'bg-secondary' : ''}>
                  <h5 className="mb-0">
                    <FaTasks className="me-2" />
                    My Assigned Orders
                  </h5>
                </Card.Header>
                <Card.Body>
                  {assignedOrders.length === 0 ? (
                    <p className="text-muted text-center py-3">No orders assigned to you</p>
                  ) : (
                    <Table striped hover responsive variant={darkMode ? "dark" : ""}>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Address</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {assignedOrders.map((order) => (
                          <tr key={order._id}>
                            <td>#{order._id.slice(-8)}</td>
                            <td>
                              {order.customer.firstName} {order.customer.lastName}
                            </td>
                            <td>
                              {order.customer.address.city}, {order.customer.address.state}
                            </td>
                            <td>
                              <Badge bg={getStatusBadge(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
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
                                {order.status === 'processing' && (
                                  <Button
                                    variant="outline-success"
                                    size="sm"
                                    onClick={() => markAsOutForDelivery(order._id)}
                                  >
                                    Mark as Shipped
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
                </Card.Body>
              </Card>
            )}

            <Card className={darkMode ? 'bg-dark text-light' : ''}>
              <Card.Header className={darkMode ? 'bg-secondary' : ''}>
                <h5 className="mb-0">
                  <FaRoute className="me-2" />
                  Delivery Routes
                </h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6>Today's Routes</h6>
                    <div className="bg-light p-3 rounded">
                      <p className="text-muted">Route planning feature coming soon</p>
                      <Button variant="outline-primary" size="sm" disabled>
                        Plan Routes
                      </Button>
                    </div>
                  </Col>
                  <Col md={6}>
                    <h6>Delivery Map</h6>
                    <div className="bg-light p-3 rounded text-center">
                      <FaMapMarkerAlt size={40} className="text-muted mb-2" />
                      <p className="text-muted">Map integration coming soon</p>
                      <Button variant="outline-success" size="sm" disabled>
                        View Map
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Tab>

          <Tab eventKey="orders" title={
            <>
              <FaListAlt className="me-2" />
              All Orders
            </>
          }>
            <Card className={`mb-4 ${darkMode ? 'bg-dark text-light' : ''}`}>
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
                          className={darkMode ? 'bg-dark text-light' : ''}
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
                        className={darkMode ? 'bg-dark text-light' : ''}
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
              <Card className={darkMode ? 'bg-dark text-light' : ''}>
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
                <Card className={darkMode ? 'bg-dark text-light' : ''}>
                  <Card.Body className="p-0">
                    <Table striped hover responsive className="mb-0" variant={darkMode ? "dark" : ""}>
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
                          <th>Assigned To</th>
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
                              {order.assignedTo ? (
                                typeof order.assignedTo === 'object' ? (
                                  `${order.assignedTo.firstName} ${order.assignedTo.lastName}`
                                ) : (
                                  'Assigned'
                                )
                              ) : (
                                <Badge bg="secondary">Unassigned</Badge>
                              )}
                            </td>
                            <td>
                              <div className="d-flex gap-2 flex-wrap">
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
                                {user && user.role === 'delivery' && !order.assignedTo && (
                                  <Button
                                    variant="outline-info"
                                    size="sm"
                                    onClick={() => assignToMe(order._id)}
                                    title="Assign to me"
                                  >
                                    <FaUser />
                                  </Button>
                                )}
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
          </Tab>
        </Tabs>

        {/* Order Details Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" className={darkMode ? 'dark-modal' : ''}>
          <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
            <Modal.Title>
              Order #{selectedOrder?._id.slice(-8)} - {selectedOrder?.customer.firstName}{' '}
              {selectedOrder?.customer.lastName}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? 'bg-dark text-light' : ''}>
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
                    <Table borderless size="sm" variant={darkMode ? "dark" : ""}>
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

                    <h6 className="mt-3">Assigned To</h6>
                    <p>
                      {selectedOrder.assignedTo ? (
                        typeof selectedOrder.assignedTo === 'object' ? (
                          `${selectedOrder.assignedTo.firstName} ${selectedOrder.assignedTo.lastName}`
                        ) : (
                          'Assigned'
                        )
                      ) : (
                        <Badge bg="secondary">Unassigned</Badge>
                      )}
                    </p>
                  </Col>
                </Row>
                
                <h6>Order Items</h6>
                <Table striped bordered hover size="sm" variant={darkMode ? "dark" : ""}>
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
                    className={darkMode ? 'bg-dark text-light' : ''}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </Form.Select>
                </Form.Group>

                {user && user.role === 'admin' && !selectedOrder.assignedTo && (
                  <Form.Group className="mt-3">
                    <Form.Label>Assign to Delivery Person</Form.Label>
                    <Form.Select disabled className={darkMode ? 'bg-dark text-light' : ''}>
                      <option>Delivery person selection coming soon</option>
                    </Form.Select>
                  </Form.Group>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className={darkMode ? 'bg-dark text-light' : ''}>
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

        {/* Settings Modal */}
        <Modal
          show={showSettingsModal}
          onHide={() => setShowSettingsModal(false)}
          centered
          className={darkMode ? 'dark-modal' : ''}
        >
          <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
            <Modal.Title>Account Settings</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? 'bg-dark text-light' : ''}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Theme Color</Form.Label>
                <div className="theme-colors d-flex gap-2">
                  {themeColors.map((color, index) => (
                    <motion.div
                      key={index}
                      className={`color-option ${settingsForm.themeColor === color.value ? 'active' : ''}`}
                      style={{ backgroundColor: color.value, width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer' }}
                      onClick={() => setSettingsForm(prev => ({ ...prev, themeColor: color.value }))}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title={color.name}
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  id="dark-mode-switch"
                  label="Dark Mode"
                  checked={settingsForm.darkMode}
                  onChange={() => setSettingsForm(prev => ({ ...prev, darkMode: !prev.darkMode }))}
                  className={darkMode ? 'text-light' : ''}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Background Image</Form.Label>
                <Form.Control
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSettingsForm(prev => ({ ...prev, backgroundImage: e.target.files[0] }));
                    }
                  }}
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
                {profile.backgroundImage && (
                  <div className="mt-2">
                    <p>Current Background:</p>
                    <img
                      src={profile.backgroundImage}
                      alt="Current background"
                      style={{ maxWidth: '100%', maxHeight: '150px' }}
                    />
                  </div>
                )}
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? 'bg-dark text-light' : ''}>
            <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveSettings}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Edit Profile Modal */}
        <Modal
          show={showEditProfileModal}
          onHide={() => setShowEditProfileModal(false)}
          centered
          className={darkMode ? 'dark-modal' : ''}
        >
          <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
            <Modal.Title>Edit Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? 'bg-dark text-light' : ''}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Profile Picture</Form.Label>
                <div className="d-flex align-items-center mb-3">
                  <img
                    src={editProfileForm.avatar}
                    alt="Profile"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: '15px'
                    }}
                  />
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureChange}
                    className={darkMode ? 'bg-dark text-light' : ''}
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={editProfileForm.name}
                  onChange={handleEditProfileChange}
                  placeholder="Enter your name"
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={editProfileForm.email}
                  onChange={handleEditProfileChange}
                  placeholder="Enter your email"
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? 'bg-dark text-light' : ''}>
            <Button variant="secondary" onClick={() => setShowEditProfileModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveProfileChanges}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Change Password Modal */}
        <Modal
          show={showChangePasswordModal}
          onHide={() => setShowChangePasswordModal(false)}
          centered
          className={darkMode ? 'dark-modal' : ''}
        >
          <Modal.Header closeButton className={darkMode ? 'bg-dark text-light' : ''}>
            <Modal.Title>Change Password</Modal.Title>
          </Modal.Header>
          <Modal.Body className={darkMode ? 'bg-dark text-light' : ''}>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Current Password</Form.Label>
                <Form.Control
                  type="password"
                  name="currentPassword"
                  value={changePasswordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="newPassword"
                  value={changePasswordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Confirm New Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={changePasswordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  className={darkMode ? 'bg-dark text-light' : ''}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className={darkMode ? 'bg-dark text-light' : ''}>
            <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveNewPassword}>
              Change Password
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Deliver;