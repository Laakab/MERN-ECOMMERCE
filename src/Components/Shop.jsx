import React, { useState, useEffect, useRef } from 'react';
import { Container, Dropdown, Accordion, Row, Col, Button, Offcanvas, Badge, Nav, Alert, Modal, InputGroup, FormControl, OverlayTrigger, Tooltip, ListGroup, Carousel, Card, Form } from 'react-bootstrap';
import { FiFilter, FiSliders, FiShoppingCart, FiMenu, FiHome, FiShoppingBag, FiInfo, FiMail, FiUser, FiPlus, FiList, FiMessageSquare, FiX, FiSend, FiPlay, FiPaperclip, FiChevronRight, FiMic, FiSmile, FiCheck, FiChevronDown, FiBell, FiTrash2, FiChevronLeft, FiChevronRight as FiChevronRightIcon, FiHeart, FiEye, FiStar, FiShare2 } from 'react-icons/fi';

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import ShopkeeperAvatar from './ShopkeeperAvatar';
import ProductCard from './ProductCard';
import CartSidebar from './CartSidebar';
import ChatBubble from './ChatBubble';
import axios from 'axios';
import { FaMapMarkerAlt, FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import '../Css/Shop.css';

// Add these imports at the top of Shop.jsx
import { FaWhatsapp } from 'react-icons/fa';
import { BsThreeDotsVertical, BsCheck2All, BsCheck2 } from 'react-icons/bs';
import { IoMdSend } from 'react-icons/io';

const Shop = () => {
  const api = axios.create({
    baseURL: 'http://localhost:5000',
    withCredentials: true
  });
  const [storeSettings, setStoreSettings] = useState(null);
  const [shopOwner, setShopOwner] = useState(null);
  const [shopInfo, setShopInfo] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState([]);
  const [shopkeeperMessage, setShopkeeperMessage] = useState("Welcome to our cozy boutique! How can I help you today?");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    priceRange: [0, 1000],
    colors: [],
    sizes: [],
    sortBy: 'newest'
  });
  // Add these state variables to the existing state management section
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingMessageText, setEditingMessageText] = useState('');

  // ChatBot and Notification states from Home.jsx
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNewItemsNotification, setShowNewItemsNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [newItems, setNewItems] = useState({
    products: 0
  });
  const messagesEndRef = useRef(null);
  // Filter products based on active category and filters
  const filteredProducts = products.filter(product => {
    // Category filter
    if (activeCategory !== 'all' && product.category !== activeCategory) {
      return false;
    }
    // Price range filter
    if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
      return false;
    }
    // Color filter
    if (filters.colors.length > 0 && !filters.colors.some(color => product.colors.includes(color))) {
      return false;
    }
    // Size filter
    if (filters.sizes.length > 0 && !filters.sizes.some(size => product.sizes.includes(size))) {
      return false;
    }

    return true;
  });
  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (filters.sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      default:
        return 0;
    }
  });
  // Get all available colors and sizes for filter options
  const allColors = [...new Set(products.flatMap(product => product.colors))];
  const allSizes = [...new Set(products.flatMap(product => product.sizes))];

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Toggle color filter
  const toggleColorFilter = (color) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  // Toggle size filter
  const toggleSizeFilter = (size) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      priceRange: [0, 1000],
      colors: [],
      sizes: [],
      sortBy: 'newest'
    });
  };

  // Add this useEffect to fetch store settings
  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const ownerId = window.location.pathname.split('/')[2];
        const userId = ownerId || (JSON.parse(localStorage.getItem('user'))?._id);

        if (userId) {
          const response = await axios.get(`http://localhost:5000/api/store?userId=${userId}`);
          if (response.data.success) {
            setStoreSettings(response.data.store);
          }
        }
      } catch (err) {
        console.error('Error fetching store settings:', err);
      }
    };
    fetchStoreSettings();
  }, [window.location.pathname]);
  // Sample bot responses
  const botResponses = [
    "I'm here to help! What can I do for you today?",
    "That's a great question. Let me check that for you.",
    "I understand your concern. Our team will look into it.",
    "Thanks for reaching out! We appreciate your feedback.",
    "I can help with that. Here's what you need to know...",
    "Is there anything else I can assist you with?"
  ];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);



  // Handle key press (Enter to send)
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Add a new notification
  const addNotification = (notification) => {
    const newNotif = {
      id: Date.now(),
      ...notification,
      read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Mark notification as read
  const markAsRead = (id) => {
    setNotifications(notifications.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  // Remove a notification
  const removeNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Animation variants
  const chatWindowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, y: 20 }
  };

  const notificationWindowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, y: 20 }
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.2 }
    }
  };

  const typingIndicatorVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const dotVariants = {
    hidden: { opacity: 0, y: -5 },
    visible: {
      opacity: 0.6,
      y: 0,
      transition: {
        yoyo: Infinity,
        duration: 0.8,
        ease: "easeInOut"
      }
    }
  };

  // Check for new items
  useEffect(() => {
    const checkForNewItems = async () => {
      try {
        const currentCount = products.length;
        const response = await axios.get('http://localhost:5000/api/products');
        const newCount = response.data.products.length;
        const diff = Math.max(0, newCount - currentCount);

        if (diff > 0) {
          setNewItems(prev => ({
            ...prev,
            products: prev.products + diff
          }));

          setNotificationType('products');
          setShowNewItemsNotification(true);

          setTimeout(() => {
            setShowNewItemsNotification(false);
          }, 5000);
        }
      } catch (err) {
        console.error('Error checking for new items:', err);
      }
    };

    const interval = setInterval(checkForNewItems, 30000);
    checkForNewItems();

    return () => clearInterval(interval);
  }, [products.length]);

  const removeNewItemNotification = (type) => {
    setNewItems(prev => ({ ...prev, [type]: 0 }));
  };

  const clearAllNewItemNotifications = () => {
    setNewItems({
      products: 0
    });
  };

  // Categories with shopkeeper messages
  const categories = [
    { id: 'all', name: 'All Items', message: "These are all our wonderful products!" },
    { id: 'clothing', name: 'Clothing', message: "Our latest fashion pieces just arrived!" },
    { id: 'accessories', name: 'Accessories', message: "Perfect additions to complete your look!" },
    { id: 'home', name: 'Home Goods', message: "Make your home cozy with these treasures!" },
    { id: 'gifts', name: 'Gifts', message: "Wonderful presents for your loved ones!" }
  ];

  useEffect(() => {
    const fetchShopOwner = async () => {
      try {
        const ownerId = window.location.pathname.split('/')[2];
        if (ownerId) {
          const response = await axios.get(`http://localhost:5000/api/signups/${ownerId}`);
          if (response.data.success) {
            setShopOwner(response.data.user);
          }
        } else {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user) {
            setShopOwner(user);
          }
        }
      } catch (error) {
        console.error('Error fetching shop owner:', error);
      }
    };

    fetchShopOwner();
  }, [window.location.pathname]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const ownerId = window.location.pathname.split('/')[2];

        let url = 'http://localhost:5000/api/products';
        if (ownerId) {
          url += `?createdBy=${ownerId}`;
        } else {
          const user = JSON.parse(localStorage.getItem('user'));
          if (user && user._id) {
            url += `?createdBy=${user._id}`;
          }
        }

        const response = await axios.get(url);

        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          throw new Error(response.data.message || 'Failed to fetch products');
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setError(error.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [window.location.pathname]);
  // In Shop.jsx, update the addToCart function to include all necessary properties
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product._id);
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product._id ? {
            ...item,
            quantity: item.quantity + 1,
            product: product // Ensure full product details are included
          } : item
        );
      }
      return [...prevItems, {
        id: product._id,
        name: product.name,
        price: product.price,
        quantity: 1,
        images: product.images,
        color: product.colors?.[0],
        size: product.sizes?.[0],
        product: product // Include full product details
      }];
    });
  
    addNotification({
      type: 'success',
      title: 'Added to Cart',
      message: `${product.name} was added to your cart`,
      duration: 3000
    });
  };

  const removeFromCart = (productId) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const changeCategory = (categoryId) => {
    setActiveCategory(categoryId);
    const category = categories.find(cat => cat.id === categoryId);
    setShopkeeperMessage(category.message);
    // setShowChat(true);
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity, 0
  );

  const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 }
  };

  const productVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 0.7, y: 0 }
  };
  // Handle edit message
  const handleEditMessage = (message) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || message.senderId._id !== user._id) return;

    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (new Date(message.timestamp) < fifteenMinutesAgo) {
      alert('You can only edit messages within 15 minutes of sending');
      return;
    }

    setEditingMessageId(message._id);
    setEditingMessageText(message.message);
  };

  // Handle update message
  const handleUpdateMessage = async () => {
    if (!editingMessageId || !editingMessageText.trim()) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await api.put(`/api/chat/messages/${editingMessageId}`, {
        newMessage: editingMessageText,
        userId: user._id
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

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    const message = messages.find(msg => msg._id === messageId);

    if (!user || !message || message.senderId._id !== user._id) return;

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

  // Fetch messages when component mounts or shop owner changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !shopOwner) return;

        const response = await api.get(`/api/chat/messages?userId1=${user._id}&userId2=${shopOwner._id}`);
        setMessages(response.data.messages);

        // Mark messages as read
        await api.put('/api/chat/mark-read', {
          senderId: shopOwner._id,
          receiverId: user._id
        });

        updateUnreadCount();
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [shopOwner]);

  // Update unread count
  const updateUnreadCount = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) return;

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
    if (!newMessage.trim() || !shopOwner) return;

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user) {
        alert('Please login to send messages');
        return;
      }

      const response = await api.post('/api/chat/send', {
        senderId: user._id,
        receiverId: shopOwner._id,
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
  return (
    <div className="shop-with-bg">
      <div className="shop-overlay">
        <motion.div
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={{ duration: 0.3 }}
          className="shop-container"
        >
          {/* Navigation Sidebar */}
          <Offcanvas show={showSidebar} onHide={() => setShowSidebar(false)} placement="start">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Menu</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <Nav defaultActiveKey="/" className="flex-column">
                <Nav.Link as={Link} to="/" onClick={() => setShowSidebar(false)}>
                  <FiHome className="me-2" /> Home
                </Nav.Link>
                <Nav.Link as={Link} to="/products" onClick={() => setShowSidebar(false)}>
                  <FiShoppingBag className="me-2" /> Products
                </Nav.Link>
                <Nav.Link onClick={() => { setShowCart(true); setShowSidebar(false); }}>
                  <FiShoppingCart className="me-2" /> Cart ({cartItems.length})
                </Nav.Link>
                <Nav.Link as={Link} to="/about" onClick={() => setShowSidebar(false)}>
                  <FiInfo className="me-2" /> About Us
                </Nav.Link>
                <Nav.Link as={Link} to="/contact" onClick={() => setShowSidebar(false)}>
                  <FiMail className="me-2" /> Contact
                </Nav.Link>
                <Nav.Link as={Link} to="/account" onClick={() => setShowSidebar(false)}>
                  <FiUser className="me-2" /> My Account
                </Nav.Link>
                <Nav.Link as={Link} to="/addproduct" onClick={() => setShowSidebar(false)}>
                  <FiPlus className="me-2" /> Add Product
                </Nav.Link>
                <Nav.Link as={Link} to="/your-products" onClick={() => setShowSidebar(false)}>
                  <FiList className="me-2" /> Manage Products
                </Nav.Link>
              </Nav>
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Content */}
          <Container fluid className="px-md-5 shop-main-content">
            {/* Header */}
            <Row className="shop-header align-items-center py-3">
              <Col xs={2}>
                <Button variant="outline-secondary" onClick={() => setShowSidebar(true)}>
                  <FiMenu size={20} />
                </Button>
              </Col>
              <Col xs={8} className="text-center">
                <div className="d-flex align-items-center justify-content-center">
                  {storeSettings?.storeLogo && (
                    <div className="shop-logo-container me-3">
                      <img
                        src={`http://localhost:5000/${storeSettings.storeLogo}`}
                        alt="Shop Logo"
                        className="shop-logo"
                      />
                    </div>
                  )}
                  <motion.h1
                    className="mb-0"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    {storeSettings?.storeName ||
                      (shopOwner ? `${shopOwner.firstName || ''} ${shopOwner.lastName || ''}'s Shop` : 'The Cozy Boutique')}
                  </motion.h1>
                </div>
              </Col>
              <Col xs={2} className="text-end">
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowCart(true)}
                  className="position-relative"
                >
                  <FiShoppingCart size={20} />
                  {cartItems.length > 0 && (
                    <Badge
                      pill bg="danger"
                      className="position-absolute top-0 start-100 translate-middle"
                    >
                      {cartItems.length}
                    </Badge>
                  )}
                </Button>

              </Col>

            </Row>

            {/* Location Bar */}
            {storeSettings?.location && (
              <Row className="location-bar py-2">
                <Col className="d-flex align-items-center justify-content-center">
                  <FaMapMarkerAlt className="me-2" />
                  <span className="location-text">
                    {[
                      storeSettings.location.district,
                      storeSettings.location.town,
                      storeSettings.location.city,
                      storeSettings.location.province,
                      storeSettings.location.country
                    ].filter(Boolean).join(', ')}
                  </span>
                </Col>
              </Row>
            )}

            {/* Shopkeeper Section */}
            <Row className="my-4 align-items-center">
              <Col xs={3} md={2} lg={1}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowChat(!showChat)}
                >
                  <div className="shopkeeper-avatar">
                    {shopOwner?.avatar ? (
                      <img src={shopOwner.avatar} alt="Shop Owner" />
                    ) : (
                      <FiUser size={24} />
                    )}
                  </div>
                </motion.div>
              </Col>
              <Col xs={9} md={10} lg={11}>
                <AnimatePresence>
                  {showChat && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChatBubble
                        message={shopOwner ?
                          `Welcome to ${shopOwner.firstName || shopOwner.username}'s shop! ${shopkeeperMessage}` :
                          shopkeeperMessage}
                        onClose={() => setShowChat(false)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Col>
            </Row>
            {/* Two-column layout for filters and products */}
            <Row>
              {/* Filters Column */}
              <Col md={3} className="mb-4">
                <Card className="sticky-top" style={{ top: '20px' }}>
                  <Card.Header className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                      <FiFilter className="me-2" />
                      Filters
                    </h5>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={resetFilters}
                      disabled={filters.colors.length === 0 && filters.sizes.length === 0 && filters.priceRange[0] === 0 && filters.priceRange[1] === 500000}
                    >
                      Reset
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    {/* Price Range Filter */}
                    <Accordion defaultActiveKey="0" flush>
                      <Accordion.Item eventKey="0">
                        <Accordion.Header>
                          <FiSliders className="me-2" />
                          Price Range
                        </Accordion.Header>
                        <Accordion.Body>
                          <div className="mb-3">
                            <Form.Label>
                              ${filters.priceRange[0]} - ${filters.priceRange[1]}
                            </Form.Label>
                            <Form.Range
                              min={0}
                              max={500000}
                              step={10}
                              value={filters.priceRange[1]}
                              onChange={(e) => handleFilterChange('priceRange', [filters.priceRange[0], parseInt(e.target.value)])}
                            />
                            <div className="d-flex justify-content-between">
                              <span>${filters.priceRange[0]}</span>
                              <span>${filters.priceRange[1]}</span>
                            </div>
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>

                      {/* Color Filter */}
                      {allColors.length > 0 && (
                        <Accordion.Item eventKey="1">
                          <Accordion.Header>
                            <FiSliders className="me-2" />
                            Colors
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="color-filter">
                              {allColors.map(color => (
                                <Button
                                  key={color}
                                  variant={filters.colors.includes(color) ? 'primary' : 'outline-secondary'}
                                  className="me-2 mb-2 rounded-pill"
                                  onClick={() => toggleColorFilter(color)}
                                >
                                  {color}
                                </Button>
                              ))}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      )}

                      {/* Size Filter */}
                      {allSizes.length > 0 && (
                        <Accordion.Item eventKey="2">
                          <Accordion.Header>
                            <FiSliders className="me-2" />
                            Sizes
                          </Accordion.Header>
                          <Accordion.Body>
                            <div className="size-filter">
                              {allSizes.map(size => (
                                <Button
                                  key={size}
                                  variant={filters.sizes.includes(size) ? 'primary' : 'outline-secondary'}
                                  className="me-2 mb-2"
                                  onClick={() => toggleSizeFilter(size)}
                                >
                                  {size}
                                </Button>
                              ))}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      )}

                      {/* Sort By */}
                      <Accordion.Item eventKey="3">
                        <Accordion.Header>
                          <FiSliders className="me-2" />
                          Sort By
                        </Accordion.Header>
                        <Accordion.Body>
                          <Form.Select
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          >
                            <option value="newest">Newest Arrivals</option>
                            <option value="oldest">Oldest Arrivals</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                          </Form.Select>
                        </Accordion.Body>
                      </Accordion.Item>
                    </Accordion>
                  </Card.Body>
                </Card>
              </Col>

              {/* Products Column */}
              <Col md={9}>
                {/* Category Navigation - keep existing */}
                <Row className="mb-4">
                  <Col>
                    <div className="d-flex flex-wrap gap-2">
                      {categories.map(category => (
                        <motion.div
                          key={category.id}
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button
                            variant={activeCategory === category.id ? 'primary' : 'outline-primary'}
                            onClick={() => changeCategory(category.id)}
                            className="rounded-pill"
                          >
                            {category.name}
                          </Button>
                        </motion.div>
                      ))}
                    </div>
                  </Col>
                </Row>

                {/* Product Grid */}
                <Row className="g-4">
                  {loading ? (
                    <Col className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3">Loading your shop products...</p>
                    </Col>
                  ) : error ? (
                    <Col className="text-center py-5">
                      <Alert variant="danger">
                        {error}
                      </Alert>
                      <Button onClick={() => window.location.reload()}>Try Again</Button>
                    </Col>
                  ) : sortedProducts.length === 0 ? (
                    <Col className="text-center py-5">
                      <p>No products match your filters. Try adjusting your search criteria.</p>
                      <Button variant="outline-primary" onClick={resetFilters}>
                        Reset Filters
                      </Button>
                    </Col>
                  ) : (
                    <AnimatePresence>
                      {sortedProducts.map((product, index) => (
                        <Col key={product._id} xs={12} sm={6} md={4} lg={3}>
                          <motion.div
                            variants={productVariants}
                            initial="hidden"
                            animate="visible"
                            transition={{ delay: index * 0.05 }}
                          >
                            <ProductCard
                              product={{
                                ...product,
                                images: product.images?.map(img =>
                                  img.startsWith('http') ? img : `http://localhost:5000/${img}`
                                ) || []
                              }}
                              onAddToCart={addToCart}
                            />
                          </motion.div>
                        </Col>
                      ))}
                    </AnimatePresence>
                  )}
                </Row>
              </Col>
            </Row>


          </Container>

          {/* Cart Sidebar */}
          <CartSidebar
            show={showCart}
            onHide={() => setShowCart(false)}
            cartItems={cartItems.map(item => ({
              productId: item.id,
              product: item, // Include full product details
              quantity: item.quantity,
              color: item.color,
              size: item.size
            }))}
            cartTotal={cartTotal}
            onRemoveItem={removeFromCart}
            onUpdateQuantity={updateQuantity}
            onCheckout={() => {
              // Save cart items with proper structure before navigating
              localStorage.setItem('checkoutItems', JSON.stringify(
                cartItems.map(item => ({
                  id: item.id, // or productId: item.id
                  product: item.product, // Ensure full product details are included
                  quantity: item.quantity,
                  color: item.color,
                  size: item.size,
                  price: item.product?.price || item.price // Ensure price is included
                }))
              ));
              setShowCart(false);
              navigate('/checkout');
            }}
          />
          {/* Featured Products (if enabled) */}
          {storeSettings?.tools?.featuredProducts && (
            <Row className="mb-4">
              <Col>
                <Card className="border-primary">
                  <Card.Header className="bg-primary text-white">
                    <FiStar className="me-2" />
                    Featured Products
                  </Card.Header>
                  <Card.Body>
                    <Row className="g-3">
                      {products.slice(0, 4).map(product => (
                        <Col key={product._id} xs={6} md={3}>
                          <ProductCard
                            product={{
                              ...product,
                              images: product.images?.map(img =>
                                img.startsWith('http') ? img : `http://localhost:5000/${img}`
                              ) || []
                            }}
                            onAddToCart={addToCart}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}

          {/* Discount Banner (if enabled) */}
          {storeSettings?.tools?.discountBanner && (
            <Row className="mb-4">
              <Col>
                <Card className="bg-danger text-white">
                  <Card.Body className="text-center">
                    <h3>SPECIAL DISCOUNT!</h3>
                    <p className="mb-0">Get 20% off on all products this week</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
          {/* Chat Button */}
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
                  <h6>Chat with {shopOwner?.firstName || 'Shop'}</h6>
                  <Button variant="link" onClick={toggleChat}>
                    <FiX />
                  </Button>
                </div>

                <div className="messages-container">
                  {messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`message ${msg.senderId._id === shopOwner?._id ? 'received' : 'sent'}`}
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
                              {msg.senderId._id !== shopOwner?._id && (
                                <span className="read-status">
                                  {msg.read ? <BsCheck2All color="#4fc3f7" /> : <BsCheck2 />}
                                </span>
                              )}
                            </div>
                          </div>
                          {msg.senderId._id === JSON.parse(localStorage.getItem('user'))?._id && (
                            <div className="message-actions">
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
          {/* Toast Notifications */}
          <AnimatePresence>
            {notifications.map(notification => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="toast-notification"
                onAnimationComplete={() => {
                  setTimeout(() => {
                    removeNotification(notification.id);
                  }, notification.duration || 3000);
                }}
              >
                <div className={`toast-alert toast-${notification.type || 'info'}`}>
                  <div className="toast-content">
                    {notification.type === 'success' && <FiCheck className="me-2" />}
                    <div>
                      {notification.title && <div className="toast-title">{notification.title}</div>}
                      <div className="toast-message">{notification.message}</div>
                    </div>
                  </div>
                  <button
                    className="toast-close"
                    onClick={() => removeNotification(notification.id)}
                  >
                    <FiX />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {/* Footer */}
          <footer className="shop-footer">
            <Container>
              <Row>
                <Col md={4} className="footer-column">
                  <h5>{storeSettings?.storeName || 'The Cozy Boutique'}</h5>
                  <p className="footer-description">
                    {storeSettings?.slogan || 'Your friendly neighborhood shop for unique finds.'}
                  </p>

                  {storeSettings?.tools?.socialMediaLinks && (
                    <div className="social-links">
                      <Button variant="outline-light" size="sm">
                        <FaFacebook />
                      </Button>
                      <Button variant="outline-light" size="sm">
                        <FaInstagram />
                      </Button>
                      <Button variant="outline-light" size="sm">
                        <FaTwitter />
                      </Button>
                    </div>
                  )}
                </Col>

                <Col md={4} className="footer-column">
                  <h5>Quick Links</h5>
                  <Nav className="flex-column footer-nav">
                    <Nav.Link as={Link} to="/about">About Us</Nav.Link>
                    <Nav.Link as={Link} to="/contact">Contact</Nav.Link>
                    <Nav.Link as={Link} to="/faq">FAQs</Nav.Link>
                    <Nav.Link as={Link} to="/privacy">Privacy Policy</Nav.Link>
                  </Nav>
                </Col>

                <Col md={4} className="footer-column">
                  <h5>Contact Us</h5>
                  {storeSettings?.location && (
                    <div className="footer-contact">
                      <p>
                        <FaMapMarkerAlt className="me-2" />
                        {[
                          storeSettings.location.district,
                          storeSettings.location.town,
                          storeSettings.location.city
                        ].filter(Boolean).join(', ')}
                      </p>
                      <p>
                        {storeSettings.location.province &&
                          `${storeSettings.location.province}, `}
                        {storeSettings.location.country}
                      </p>
                    </div>
                  )}

                  {storeSettings?.tools?.newsletterSignup && (
                    <div className="newsletter-signup">
                      <h6>Newsletter</h6>
                      <InputGroup>
                        <FormControl placeholder="Your email" />
                        <Button variant="primary">
                          <FiMail />
                        </Button>
                      </InputGroup>
                    </div>
                  )}
                </Col>
              </Row>

              <Row className="footer-bottom">
                <Col className="text-center">
                  <p className="copyright">
                    &copy; {new Date().getFullYear()} {storeSettings?.storeName || 'The Cozy Boutique'}. All rights reserved.
                  </p>
                </Col>
              </Row>
            </Container>
          </footer>
        </motion.div>
      </div>
    </div>
  );
};

export default Shop;