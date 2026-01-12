import React, { useState, useEffect } from 'react';
// Add these imports at the top of Admin.jsx
import { FaWhatsapp } from 'react-icons/fa';
import { BsThreeDotsVertical, BsCheck2All, BsCheck2 } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';
import {
  Container,
  Row,
  Col,
  Nav,
  Button,
  Dropdown,
  Badge,
  ListGroup,
  Form,
  Card,
  Modal
} from 'react-bootstrap';
import {
  FiMenu,
  FiBell,
  FiMessageSquare,
  FiUser,
  FiSettings,
  FiLogOut,
  FiHome,
  FiCalendar,
  FiUsers,
  FiShoppingBag,
  FiLock,
  FiTruck,
  FiShoppingCart,
  FiArchive,
  FiSun,
  FiMoon,
  FiChevronLeft,
  FiX,
  FiImage
} from 'react-icons/fi';
import {
  FaRegStar
} from 'react-icons/fa';
import ManageStore from './ManageStore';
import { motion, AnimatePresence } from 'framer-motion';
import '../Css/Admin.css';
import axios from 'axios';
// Add these imports at the top of Admin.jsx
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);
const Admin = () => {
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
  });

  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [themeColor, setThemeColor] = useState('#4e73df');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [contactNotifications, setContactNotifications] = useState([]);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(3);
  const [showNotificationCenter, setShowNotificationCenter] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  // Add these state variables to the existing state management section
  const [showChat, setShowChat] = useState(false);
  // State management
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState('');
  // Inside the Admin component, add these state variables
const [timePeriod, setTimePeriod] = useState('week');
const [chartData, setChartData] = useState({
  labels: [],
  datasets: []
});


// Chart options
const chartOptions = {
  responsive: true,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: `Sales Overview - ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)}`,
    },
  },
  scales: {
    y: {
      type: 'linear',
      display: true,
      position: 'left',
      title: {
        display: true,
        text: 'Revenue ($)'
      },
      grid: {
        drawOnChartArea: false,
      },
    },
    y1: {
      type: 'linear',
      display: true,
      position: 'right',
      title: {
        display: true,
        text: 'Orders'
      },
      grid: {
        drawOnChartArea: false,
      },
    },
  },
  maintainAspectRatio: false
};
  // Add these to your existing state management
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    orderCount: 0,
    customerCount: 0,
    avgOrderValue: 0,
    salesData: [],
    recentOrders: [],
    topProducts: [],
    recentActivity: []
  });
  // Add this useEffect to handle chart data based on time period
useEffect(() => {
  const prepareChartData = () => {
    let labels = [];
    let revenueData = [];
    let orderData = [];
     // Add null check here
     if (!dashboardData.salesData || dashboardData.salesData.length === 0) return;
    if (timePeriod === 'week') {
      // Last 7 days
      labels = dashboardData.salesData.slice(-7).map(item => {
        const date = new Date(item.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      });
      revenueData = dashboardData.salesData.slice(-7).map(item => item.revenue);
      orderData = dashboardData.salesData.slice(-7).map(item => item.orders);
    } else if (timePeriod === 'month') {
      // Last 30 days grouped by week
      const monthlyData = dashboardData.salesData.slice(-30);
      labels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      
      // Group by week
      for (let i = 0; i < 4; i++) {
        const weekData = monthlyData.slice(i * 7, (i + 1) * 7);
        revenueData.push(weekData.reduce((sum, day) => sum + day.revenue, 0));
        orderData.push(weekData.reduce((sum, day) => sum + day.orders, 0));
      }
    } else if (timePeriod === 'year') {
      // Last 12 months
      // This is a simplified version - you would need to adapt based on your actual data structure
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // For demo purposes, generate some data
      revenueData = labels.map(() => Math.floor(Math.random() * 10000) + 5000);
      orderData = labels.map(() => Math.floor(Math.random() * 100) + 50);
    }
    
    setChartData({
      labels,
      datasets: [
        {
          label: 'Revenue',
          data: revenueData,
          borderColor: themeColor,
          backgroundColor: `${themeColor}20`,
          tension: 0.4,
          fill: true,
          yAxisID: 'y',
        },
        {
          label: 'Orders',
          data: orderData,
          borderColor: '#6c757d',
          backgroundColor: '#6c757d20',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1',
        }
      ]
    });
  };
  
  if (dashboardData.salesData && dashboardData.salesData.length > 0) {
    prepareChartData();
  }
}, [dashboardData.salesData, timePeriod, themeColor]);
// Mark a contact notification as read
const markAsRead = async (contactId) => {
  try {
    await api.put(`/api/contacts/${contactId}/read`);
    
    // Update local state
    setContactNotifications(prev => 
      prev.filter(contact => contact._id !== contactId)
    );
    
    // Update unread count
    setUnreadNotifications(prev => prev - 1);
  } catch (err) {
    console.error('Error marking notification as read:', err);
  }
};

// Mark all notifications as read
const markAllAsRead = async () => {
  try {
    // Mark all contact notifications as read
    for (const contact of contactNotifications) {
      await api.put(`/api/contacts/${contact._id}/read`);
    }
    
    // Clear all notifications
    setContactNotifications([]);
    setUnreadNotifications(0);
  } catch (err) {
    console.error('Error marking all notifications as read:', err);
  }
};
  const fetchDashboardData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get('/api/dashboard');
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };
  useEffect(() => {
    fetchDashboardData();
    // Set up interval to refresh data periodically
    const interval = setInterval(fetchDashboardData, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, []);
  // Add these helper functions to your component
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'success';
      case 'processing': return 'warning';
      case 'shipped': return 'info';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getActivityBadgeClass = (activityType) => {
    switch (activityType.toLowerCase()) {
      case 'new order': return 'success';
      case 'product added': return 'primary';
      case 'new customer': return 'info';
      default: return 'warning';
    }
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval} year${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval} month${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval} day${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval} hour${interval === 1 ? '' : 's'} ago`;

    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval} minute${interval === 1 ? '' : 's'} ago`;

    return `${Math.floor(seconds)} second${seconds === 1 ? '' : 's'} ago`;
  };
  // Function to fetch contact notifications
  const fetchContactNotifications = async () => {
    try {
      const response = await api.get('/api/notifications/contacts');
      setContactNotifications(response.data.contacts);

      // Update unread notifications count
      setUnreadNotifications(response.data.contacts.length);
    } catch (err) {
      console.error('Error fetching contact notifications:', err);
    }
  };
  const handleEditMessage = (message) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (message.senderId._id !== user._id) return;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(message.timestamp) < fifteenMinutesAgo) {
      alert('You can only edit messages within 15 minutes of sending');
      return;
    }

    setEditingMessageId(message._id);
    setEditingMessageText(message.message);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editingMessageText.trim()) return;

    try {
      const response = await api.put(`/api/chat/messages/${editingMessageId}`, {
        newMessage: editingMessageText,
        userId: JSON.parse(localStorage.getItem('user'))._id
      });

      setMessages(messages.map(msg =>
        msg._id === editingMessageId ? response.data.updatedMessage : msg
      ));
      setEditingMessageId(null);
      setEditingMessageText('');
    } catch (err) {
      console.error('Error updating message:', err);
      alert(err.response?.data?.message || 'Failed to update message');
    }
  };

  const handleDeleteMessage = async (messageId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = messages.find(msg => msg._id === messageId);

    if (!message || message.senderId._id !== user._id) return;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(message.timestamp) < fifteenMinutesAgo) {
      alert('You can only delete messages within 15 minutes of sending');
      return;
    }

    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/api/chat/messages/${messageId}`, {
          data: { userId: user._id }
        });

        setMessages(messages.filter(msg => msg._id !== messageId));
      } catch (err) {
        console.error('Error deleting message:', err);
        alert(err.response?.data?.message || 'Failed to delete message');
      }
    }
  };
  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const response = await api.get('/api/chat/shops');
        setShops(response.data.shops);
        if (response.data.shops.length > 0) {
          setSelectedShop(response.data.shops[0]._id);
        }
      } catch (err) {
        console.error('Error fetching shops:', err);
      }
    };

    fetchShops();
  }, []);

  // Fetch messages when selected shop changes
  useEffect(() => {
    if (selectedShop) {
      const fetchMessages = async () => {
        try {
          const user = JSON.parse(localStorage.getItem('user'));
          const response = await api.get(`/api/chat/messages?userId1=${user._id}&userId2=${selectedShop}`);
          setMessages(response.data.messages);

          // Mark messages as read
          await api.put('/api/chat/mark-read', {
            senderId: selectedShop,
            receiverId: user._id
          });

          updateUnreadCount();
        } catch (err) {
          console.error('Error fetching messages:', err);
        }
      };

      fetchMessages();
    }
  }, [selectedShop]);

  // Update unread count
  const updateUnreadCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.get(`/api/chat/unread-count?userId=${user._id}`);
      setUnreadCount(response.data.count);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  };

  // Poll for new messages
  useEffect(() => {
    const interval = setInterval(updateUnreadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  // Send message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedShop) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.post('/api/chat/send', {
        senderId: user._id,
        receiverId: selectedShop,
        message: newMessage
      });

      setMessages([...messages, response.data.message]);
      setNewMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setShowChat(!showChat);
    if (!showChat) {
      updateUnreadCount();
    }
  };
  // Then keep your existing useEffect hooks that use this function
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'shop@example.com',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'Admin',
    themeColor: '#4e73df',
    darkMode: false,
    backgroundImage: ''
  });

  // Form states
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

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
          // Ensure we have a valid user object
          const safeUserData = {
            _id: userData._id || '',
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            username: userData.username || 'Shop User',
            email: userData.email || 'shop@example.com',
            role: userData.role || 'Shop'
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
              'Shop',
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
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        // Handle error or redirect to login if needed
      }
    };

    loadUserData();
  }, []);

  // Fetch products created by this shop
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user._id) {
          const response = await api.get(`/api/products?createdBy=${user._id}`);
          console.log('Products created by this shop:', response.data.products);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
      }
    };

    fetchProducts();
  }, []);

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle dark modeimg
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    setSettingsForm(prev => ({ ...prev, darkMode: newDarkMode }));
  };

  // Save settings to database
  const saveSettings = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
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
  const saveProfileChanges = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
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

      const user = JSON.parse(localStorage.getItem('user'));
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


  const navLinks = [
    { name: 'Category Form', icon: <FiHome />, path: '/category' },
    { name: 'Events Form', icon: <FiCalendar />, path: '/event' },
    { name: 'Contact Table', icon: <FiCalendar />, path: '/contacttable' },
    { name: 'Team Form', icon: <FiCalendar />, path: '/teamform' },
    { name: 'Orders Table', icon: <FiShoppingCart />, path: '/ordertable' },
    { name: 'Delivers Table', icon: <FiTruck />, path: '/delivertable' },
    { name: 'Stores Table', icon: <FiArchive />, path: '/storetable' },
    { name: 'Admin Table', icon: <FiLock />, path: '/Adminpasstable' },
    { name: 'Accepted Users', icon: <FiUsers />, path: '/accepttable' },
    { name: 'Users Table', icon: <FiUsers />, path: '/signuptable' },
    { name: 'Team Table', icon: <FiUsers />, path: '/teamtable' },
    { name: 'Products Table', icon: <FiShoppingBag />, path: '/producttable' },
    { name: 'Category Table', icon: <FiShoppingBag />, path: '/categorytable' },
    { name: 'Events Table', icon: <FiCalendar />, path: '/eventtable' },
    { name: 'Ads Table', icon: <FaRegStar />, path: '/adstable' },
    { name: 'Carsual Table', icon: <FiLock />, path: '/carsualtable' }
  ];


  useEffect(() => {
    // Fetch contact notifications
    fetchContactNotifications();

    // Set up interval to refresh notifications periodically
    const notificationInterval = setInterval(fetchContactNotifications, 60000); // 1 minute
    return () => clearInterval(notificationInterval);
  }, []);
  return (
    <div
      className={`admin-container ${darkMode ? 'dark-mode' : themeColor}`}
      style={{
        backgroundColor: themeColor,
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Top Navigation Bar */}
      <nav className={`top-navbar ${darkMode ? 'dark' : ''}`}>
        <div className="navbar-left">
          <Button variant="link" onClick={toggleSidebar} className="sidebar-toggle">
            <FiMenu size={20} />
          </Button>
          <span className="brand-name">Admin Dashboard</span>
        </div>

        <div className="navbar-right">
          {/* Dark Mode Toggle */}
          <Button
            variant="link"
            onClick={toggleDarkMode}
            className="theme-toggle"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
          </Button>

          {/* Notification Center */}
          <div className="notification-wrapper">
            <Button
              variant="link"
              onClick={() => setShowNotificationCenter(!showNotificationCenter)}
              className="notification-btn"
            >
              <Badge pill bg="danger" className="notification-badge">
                {unreadNotifications}
              </Badge>
              <FiBell size={20} />
            </Button>

            <AnimatePresence>
              {showNotificationCenter && (
                <motion.div
                  className="notification-dropdown"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="notification-header">
                    <h6>Notifications ({contactNotifications.length} new)</h6>
                    <Button variant="link" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  </div>
                  <ListGroup variant="flush">
                    {contactNotifications.length > 0 ? (
                      contactNotifications.map(contact => (
                        <ListGroup.Item
                          key={contact._id}
                          className="unread"
                          onClick={() => markAsRead(contact._id)}
                        >
                          <div className="notification-content">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <strong>New Contact Message</strong>
                                <p className="mb-1">{contact.name} ({contact.email})</p>
                                <p className="mb-0 text-truncate">{contact.message}</p>
                              </div>
                              <small className="text-muted">
                                {formatTimeAgo(contact.createdAt)}
                              </small>
                            </div>
                            {contact.subject && (
                              <small className="text-muted">Subject: {contact.subject}</small>
                            )}
                          </div>
                        </ListGroup.Item>
                      ))
                    ) : (
                      <ListGroup.Item>
                        <div className="text-center text-muted py-2">
                          No new notifications
                        </div>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                  <div className="notification-footer">
                    <Button variant="link" size="sm" href="/contacttable">
                      View All Messages
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {/* Profile Dropdown */}
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
                >
                  <div className="profile-header">
                    <div className="profile-avatar-large">
                      <img src={profile.avatar} alt="Profile" />
                    </div>
                    <div className="profile-info">
                      <h6>{profile.name}</h6>
                      <div className="profile-role-badge">
                        {profile.role}
                      </div>
                      <small>{profile.email}</small>
                    </div>
                  </div>
                  <Dropdown.Divider />
                  <Button variant="link" onClick={() => {
                    setShowProfileDropdown(false);
                    setShowSettingsModal(true);
                  }}>
                    <FiSettings className="dropdown-icon" /> Account Settings
                  </Button>
                  <Button variant="link" onClick={() => {
                    setShowProfileDropdown(false);
                    setEditProfileForm({
                      name: profile.name,
                      email: profile.email,
                      avatar: profile.avatar
                    });
                    setShowEditProfileModal(true);
                  }}>
                    <FiUser className="dropdown-icon" /> Edit Profile
                  </Button>
                  <Button variant="link" onClick={() => {
                    setShowProfileDropdown(false);
                    setShowChangePasswordModal(true);
                  }}>
                    <FiLock className="dropdown-icon" /> Change Password
                  </Button>
                  <Dropdown.Divider />
                  <Button variant="link" onClick={handleLogout}>
                    <FiLogOut className="dropdown-icon" /> Logout
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${darkMode ? 'dark' : ''}`}
        initial={{ width: sidebarOpen ? 250 : 80 }}
        animate={{ width: sidebarOpen ? 250 : 80 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="sidebar-header">
          {sidebarOpen ? <h4>ADMIN</h4> : <h4></h4>}
        </div>

        <Nav className="flex-column sidebar-nav">
          {navLinks.map((link, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Nav.Link href={link.path} className="sidebar-link">
                <span className="sidebar-icon">{link.icon}</span>
                {sidebarOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {link.name}
                  </motion.span>
                )}
              </Nav.Link>
            </motion.div>
          ))}
        </Nav>

        <div className="sidebar-footer">
          {sidebarOpen ? (
            <Button variant="link" onClick={toggleSidebar} className="sidebar-collapse">
              <FiChevronLeft /> Collapse
            </Button>
          ) : (
            <Button variant="link" onClick={toggleSidebar} className="sidebar-expand">
              <FiMenu />
            </Button>
          )}
        </div>
      </motion.aside>

      <main
        className="main-content"
        style={{
          marginLeft: sidebarOpen ? '250px' : '80px',
          backgroundColor: darkMode ? 'rgba(26, 26, 46, 0.9)' : 'rgba(248, 249, 252, 0.9)'
        }}
      >
        <Container fluid>
          {/* Welcome Header */}
          <Row className="mb-4">
            <Col>
              <h2 className={darkMode ? "text-light" : ""}>E-commerce Dashboard</h2>
              <p className={darkMode ? "text-light" : "text-muted"}>
                Welcome back, {profile?.name || 'Shop User'}! Here's what's happening with your store today.
              </p>
            </Col>
          </Row>


          {/* Key Metrics Cards */}
          <Row className="mb-4">
            <Col md={3} sm={6}>
              <Card className={`metric-card ${darkMode ? 'dark-card' : ''}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">TOTAL REVENUE</h6>
                      <h3>${dashboardData.totalRevenue.toLocaleString()}</h3>
                      <span className="text-success">+12.5% from last week</span>
                    </div>
                    <div className="metric-icon revenue">
                      <FiShoppingBag size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className={`metric-card ${darkMode ? 'dark-card' : ''}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">ORDERS</h6>
                      <h3>{dashboardData.orderCount.toLocaleString()}</h3>
                      <span className="text-success">+8.2% from last week</span>
                    </div>
                    <div className="metric-icon orders">
                      <FiShoppingCart size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className={`metric-card ${darkMode ? 'dark-card' : ''}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">CUSTOMERS</h6>
                      <h3>{dashboardData.customerCount.toLocaleString()}</h3>
                      <span className="text-success">+3.1% from last week</span>
                    </div>
                    <div className="metric-icon customers">
                      <FiUsers size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className={`metric-card ${darkMode ? 'dark-card' : ''}`}>
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-2">AVG. ORDER VALUE</h6>
                      <h3>${dashboardData.avgOrderValue.toFixed(2)}</h3>
                      <span className="text-danger">-1.2% from last week</span>
                    </div>
                    <div className="metric-icon aov">
                      <FiArchive size={24} />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Charts and Recent Activity */}
          <Row>
            {/* Sales Chart */}
            <Row>
              {/* Sales Chart */}
              <Col lg={8} className="mb-4">
                <Card className={`${darkMode ? 'dark-card' : ''}`}>
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <Card.Title>Sales Overview</Card.Title>
                      <div>
                        <Button
                          variant={timePeriod === 'week' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          className="me-2"
                          onClick={() => setTimePeriod('week')}
                        >
                          Week
                        </Button>
                        <Button
                          variant={timePeriod === 'month' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          className="me-2"
                          onClick={() => setTimePeriod('month')}
                        >
                          Month
                        </Button>
                        <Button
                          variant={timePeriod === 'year' ? 'primary' : 'outline-secondary'}
                          size="sm"
                          onClick={() => setTimePeriod('year')}
                        >
                          Year
                        </Button>
                      </div>
                    </div>
                    <div className="chart-container" style={{ height: '300px' }}>
                      <Line data={chartData} options={chartOptions} />
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Recent Orders */}
              <Col lg={4} className="mb-4">
                <Card className={`${darkMode ? 'dark-card' : ''}`}>
                  <Card.Body>
                    <Card.Title>Recent Orders</Card.Title>
                    <ListGroup variant="flush">
                      {dashboardData.recentOrders.map((order, index) => (
                        <ListGroup.Item key={index} className={`${darkMode ? 'dark-list-item' : ''}`}>
                          <div className="d-flex justify-content-between">
                            <div>
                              <strong>#{order._id.toString().substr(-4).toUpperCase()}</strong>
                              <div className="text-muted small">
                                {order.customer.firstName} {order.customer.lastName}
                              </div>
                            </div>
                            <div className="text-end">
                              <div>${order.total.toFixed(2)}</div>
                              <Badge bg={getStatusBadgeColor(order.status)} className="mt-1">
                                {order.status}
                              </Badge>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                    <Button variant="link" className="mt-2 w-100 text-center" href="/ordertable">
                      View All Orders
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Row>

          {/* Products and Activity */}
          <Row>
            {/* Top Products */}
            <Col md={6} className="mb-4">
              <Card className={`${darkMode ? 'dark-card' : ''}`}>
                <Card.Body>
                  <Card.Title>Top Selling Products</Card.Title>
                  <ListGroup variant="flush">
                    {dashboardData.topProducts.map((product, index) => (
                      <ListGroup.Item key={index} className={`${darkMode ? 'dark-list-item' : ''}`}>
                        <div className="d-flex align-items-center">
                          {product.images && product.images.length > 0 && (
                            <img
                              src={product.images[0].startsWith('http') ? product.images[0] : `http://localhost:5000/${product.images[0]}`}
                              alt={product.name}
                              className="me-3 rounded"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          )}
                          <div>
                            <strong>{product.name}</strong>
                            <div className="text-muted small">
                              {product.category?.name || 'Uncategorized'}
                            </div>
                          </div>
                          <div className="ms-auto">
                            <Badge bg="primary">
                              {product.soldCount || 0} sold
                            </Badge>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                  <Button variant="link" className="mt-2 w-100 text-center" href="/producttable">
                    View All Products
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* Recent Activity */}
            <Col md={6} className="mb-4">
              <Card className={`${darkMode ? 'dark-card' : ''}`}>
                <Card.Body>
                  <Card.Title>Recent Activity</Card.Title>
                  <div className="activity-timeline">
                    {dashboardData.recentActivity.map((activity, index) => (
                      <div key={index} className="activity-item">
                        <div className={`activity-badge ${getActivityBadgeClass(activity.type)}`}></div>
                        <div className="activity-content">
                          <div className="d-flex justify-content-between">
                            <strong>{activity.type}</strong>
                            <small className="text-muted">
                              {formatTimeAgo(activity.timestamp)}
                            </small>
                          </div>
                          <p className="mb-0">{activity.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="link" className="mt-2 w-100 text-center">
                    View All Activity
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>

      {/* Settings Modal */}
      <Modal Modal
        show={showSettingsModal}
        onHide={() => setShowSettingsModal(false)}
        centered
        className={darkMode ? 'dark-modal' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Account Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Theme Color</Form.Label>
              <div className="theme-colors">
                {themeColors.map((color, index) => (
                  <motion.div
                    key={index}
                    className={`color-option ${settingsForm.themeColor === color.value ? 'active' : ''}`}
                    style={{ backgroundColor: color.value }}
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
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettingsModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveSettings}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal >

      {/* Edit Profile Modal */}
      <Modal Modal
        show={showEditProfileModal}
        onHide={() => setShowEditProfileModal(false)}
        centered
        className={darkMode ? 'dark-modal' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
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
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditProfileModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveProfileChanges}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal >

      {/* Change Password Modal */}
      <Modal Modal
        show={showChangePasswordModal}
        onHide={() => setShowChangePasswordModal(false)}
        centered
        className={darkMode ? 'dark-modal' : ''}
      >
        <Modal.Header closeButton>
          <Modal.Title>Change Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Current Password</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={changePasswordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
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
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowChangePasswordModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={saveNewPassword}>
            Change Password
          </Button>
        </Modal.Footer>
      </Modal >

      <div className="whatsapp-chat-container">
        <div className="whatsapp-icon" onClick={toggleChat}>
          <FaWhatsapp size={28} />
          {unreadCount > 0 && (
            <span className="unread-badge">{unreadCount}</span>
          )}
        </div>

        {showChat && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chat-header">
              <h6>Chat with Shop</h6>
              <Button variant="link" onClick={toggleChat}>
                <FiX />
              </Button>
            </div>

            <div className="shop-selector">
              <Form.Select
                value={selectedShop || ''}
                onChange={(e) => setSelectedShop(e.target.value)}
              >
                {shops.map(shop => (
                  <option key={shop._id} value={shop._id}>
                    {shop.firstName} {shop.lastName}
                  </option>
                ))}
              </Form.Select>
            </div>

            {/* <div className="messages-container">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            className={`message ${msg.senderId._id === selectedShop ? 'received' : 'sent'}`}
          >
            <div className="message-content">
              <div className="message-text">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {msg.senderId._id !== selectedShop && (
                  <span className="read-status">
                    {msg.read ? <BsCheck2All color="#4fc3f7" /> : <BsCheck2 />}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div> */}
            <div className="messages-container">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message ${msg.senderId._id === selectedShop ? 'received' : 'sent'}`}
                >
                  {editingMessageId === msg._id ? (
                    <div className="message-edit-container">
                      <Form.Control
                        type="text"
                        value={editingMessageText}
                        onChange={(e) => setEditingMessageText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUpdateMessage()}
                      />
                      <Button variant="success" size="sm" onClick={handleUpdateMessage}>
                        Update
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => setEditingMessageId(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="message-content">
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.senderId._id !== selectedShop && (
                            <span className="read-status">
                              {msg.read ? <BsCheck2All color="#4fc3f7" /> : <BsCheck2 />}
                            </span>
                          )}
                        </div>
                      </div>
                      {msg.senderId._id === JSON.parse(localStorage.getItem('user'))._id && (
                        <div className="message-actions">
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => handleEditMessage(msg)}
                            className="edit-btn"
                          >
                            <BsThreeDotsVertical />
                          </Button>
                          <Dropdown>
                            <Dropdown.Toggle variant="link" size="sm" className="more-options-btn">
                              <BsThreeDotsVertical />
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => handleEditMessage(msg)}>Edit</Dropdown.Item>
                              <Dropdown.Item onClick={() => handleDeleteMessage(msg._id)}>Delete</Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="message-input">
              <Form.Control
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button variant="primary" onClick={handleSendMessage}>
                <IoMdSend />
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div >
  );
};

export default Admin;