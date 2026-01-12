
import React, { useState, useEffect, useRef } from 'react';
import pic from '../Images/download (2).jpg';
import {
  Modal,
  Button,
  InputGroup,
  FormControl,
  Badge,
  OverlayTrigger,
  Tooltip,
  ListGroup,
  Offcanvas,
  Carousel,
  Card,
  Row,
  Form,
  Col,
  Container
} from 'react-bootstrap';
import {
  FiMessageSquare,
  FiX,
  FiSend,
  FiPlay,
  FiPaperclip,
  FiChevronRight,
  FiMic,
  FiSmile,
  FiCheck,
  FiChevronDown,
  FiBell,
  FiTrash2,
  FiMenu,
  FiUser,
  FiSettings,
  FiInfo,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
  FiHeart,
  FiShoppingCart,
  FiEye,
  FiStar,
  FiShare2
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import '../Css/Customer.css';
import { FaMapMarkerAlt, FaStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiLayers, FiPackage } from 'react-icons/fi';
import CountUp from 'react-countup';

const Customer = () => {
  // First, declare all state variables at the top
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [errorCategories, setErrorCategories] = useState(null);
  const [errorProducts, setErrorProducts] = useState(null);
  const [visibleProducts, setVisibleProducts] = useState(300);
  // Filter related states
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [selectedColors, setSelectedColors] = useState([]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [discountFilter, setDiscountFilter] = useState('all');
  const [returnDaysFilter, setReturnDaysFilter] = useState('all');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const navigate = useNavigate();
  // Other states
  const [carsuals, setCarsuals] = useState([]);
  const [loadingCarsuals, setLoadingCarsuals] = useState(true);
  const [errorCarsuals, setErrorCarsuals] = useState(null);
  const [ads, setAds] = useState([]);
  const [loadingAds, setLoadingAds] = useState(true);
  const [errorAds, setErrorAds] = useState(null);
  const [events, setEvents] = useState([]);
  const [visibleEvents, setVisibleEvents] = useState(6);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [errorEvents, setErrorEvents] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [visibleAds, setVisibleAds] = useState(6);
  const [showNewItemsNotification, setShowNewItemsNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('');
  const [newItems, setNewItems] = useState({
    carsuals: 0,
    events: 0,
    ads: 0,
    categories: 0,
    products: 0
  });

  // Add this state near your other state declarations
  const [counters, setCounters] = useState({
    customers: 0,
    categories: 0,
    products: 0
  });

  // Add this useEffect hook to fetch counter data
  useEffect(() => {
    const fetchCounters = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/counters');
        setCounters(response.data);
      } catch (err) {
        console.error('Error fetching counters:', err);
      }
    };

    fetchCounters();
  }, []);


  // Now declare all functions that use these states
  const applyPriceFilter = () => {
    if (products.length === 0) return;

    const min = parseFloat(priceRange.min) || 0;
    const max = parseFloat(priceRange.max) || Infinity;

    setFilteredProducts(products.filter(product => {
      const price = product.price - (product.price * (product.discount / 100));
      return price >= min && price <= max;
    }));
  };

  const toggleColorFilter = (color) => {
    setSelectedColors(prev =>
      prev.includes(color)
        ? prev.filter(c => c !== color)
        : [...prev, color]
    );
  };

  const toggleSizeFilter = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const resetFilters = () => {
    setPriceRange({ min: '', max: '' });
    setSelectedColors([]);
    setSelectedSizes([]);
    setDiscountFilter('all');
    setReturnDaysFilter('all');
    setFilteredProducts(products);
    setSelectedCategory(null);
  };
  useEffect(() => {
    if (products.length === 0) return; // Don't filter if no products

    let result = [...products];

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Apply color filter
    if (selectedColors.length > 0) {
      result = result.filter(p =>
        p.colors && p.colors.some(color => selectedColors.includes(color))
      );
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      result = result.filter(p =>
        p.sizes && p.sizes.some(size => selectedSizes.includes(size))
      );
    }

    // Apply discount filter
    if (discountFilter !== 'all') {
      const minDiscount = parseInt(discountFilter);
      result = result.filter(p => p.discount >= minDiscount);
    }

    // Apply return days filter
    if (returnDaysFilter !== 'all') {
      const minDays = parseInt(returnDaysFilter);
      result = result.filter(p => p.returnDays >= minDays);
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, selectedColors, selectedSizes, discountFilter, returnDaysFilter]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories');
        setCategories(response.data.categories);
        setLoadingCategories(false);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setErrorCategories('Failed to load categories');
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch products from MongoDB
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = selectedCategory
          ? `http://localhost:5000/api/products?category=${selectedCategory}`
          : 'http://localhost:5000/api/products';

        const response = await axios.get(url);
        setProducts(response.data.products);
        setLoadingProducts(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setErrorProducts('Failed to load products');
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);
  // Fetch carsuals from MongoDB
  useEffect(() => {
    const fetchCarsuals = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/carsuals');
        setCarsuals(response.data.carsuals);
        setLoadingCarsuals(false);
      } catch (err) {
        console.error('Error fetching carsuals:', err);
        setErrorCarsuals('Failed to load carsuals');
        setLoadingCarsuals(false);
      }
    };

    fetchCarsuals();
  }, []);

  // Add this useEffect hook to fetch ads
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ads');
        // Filter out past ads
        const currentDate = new Date();
        const activeAds = response.data.ads.filter(ad => {
          const adEndDate = new Date(ad.toDate);
          return adEndDate > currentDate;
        });
        setAds(activeAds);
        setLoadingAds(false);
      } catch (err) {
        console.error('Error fetching ads:', err);
        setErrorAds('Failed to load ads');
        setLoadingAds(false);
      }
    };

    fetchAds();

    // Set up interval to check for expired ads
    const interval = setInterval(fetchAds, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);


  // Fetch events from MongoDB
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/events');
        // Filter out past events
        const currentDate = new Date();
        const upcomingEvents = response.data.events.filter(event => {
          const eventEndDate = new Date(event.toDate);
          return eventEndDate > currentDate;
        });
        setEvents(upcomingEvents);
        setLoadingEvents(false);
      } catch (err) {
        console.error('Error fetching events:', err);
        setErrorEvents('Failed to load events');
        setLoadingEvents(false);
      }
    };

    fetchEvents();

    // Set up interval to check for expired events
    const interval = setInterval(fetchEvents, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  // Add this useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeModal(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

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


  const notificationWindowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    },
    exit: { opacity: 0, y: 20 }
  };




  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;
  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, // Change this value (1 is fully opaque, 0 is fully transparent)
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const cardHoverVariants = {
    hover: { y: -5, boxShadow: "0 10px 20px rgba(0,0,0,0.1)" }
  };








  // Update the checkForNewItems function in the useEffect
  useEffect(() => {
    const checkForNewItems = async () => {
      try {
        // Store the current counts
        const currentCounts = {
          carsuals: carsuals.length,
          events: events.length,
          ads: ads.length,
          categories: categories.length,
          products: products.length
        };

        // Fetch new data
        const [
          carsualsRes,
          eventsRes,
          adsRes,
          categoriesRes,
          productsRes
        ] = await Promise.all([
          axios.get('http://localhost:5000/api/carsuals'),
          axios.get('http://localhost:5000/api/events'),
          axios.get('http://localhost:5000/api/ads'),
          axios.get('http://localhost:5000/api/categories'),
          axios.get('http://localhost:5000/api/products')
        ]);

        // Calculate new counts
        const newCounts = {
          carsuals: carsualsRes.data.carsuals.length,
          events: eventsRes.data.events.length,
          ads: adsRes.data.ads.length,
          categories: categoriesRes.data.categories.length,
          products: productsRes.data.products.length
        };

        // Calculate differences
        const diff = {
          carsuals: Math.max(0, newCounts.carsuals - currentCounts.carsuals),
          events: Math.max(0, newCounts.events - currentCounts.events),
          ads: Math.max(0, newCounts.ads - currentCounts.ads),
          categories: Math.max(0, newCounts.categories - currentCounts.categories),
          products: Math.max(0, newCounts.products - currentCounts.products)
        };

        // Only update if there are actual new items
        if (Object.values(diff).some(count => count > 0)) {
          setNewItems(prev => ({
            carsuals: prev.carsuals + diff.carsuals,
            events: prev.events + diff.events,
            ads: prev.ads + diff.ads,
            categories: prev.categories + diff.categories,
            products: prev.products + diff.products
          }));

          // Show notification for the first type with new items
          const typesWithNewItems = Object.entries(diff)
            .filter(([_, count]) => count > 0)
            .map(([type]) => type);

          if (typesWithNewItems.length > 0) {
            setNotificationType(typesWithNewItems[0]);
            setShowNewItemsNotification(true);

            // Auto-hide after 5 seconds
            setTimeout(() => {
              setShowNewItemsNotification(false);
            }, 5000);
          }
        }
      } catch (err) {
        console.error('Error checking for new items:', err);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkForNewItems, 30000);

    // Initial check
    checkForNewItems();

    return () => clearInterval(interval);
  }, [carsuals.length, events.length, ads.length, categories.length, products.length]);

  // Update the notification removal functions
  const removeNewItemNotification = (type) => {
    setNewItems(prev => ({ ...prev, [type]: 0 }));
  };

  const clearAllNewItemNotifications = () => {
    setNewItems({
      carsuals: 0,
      events: 0,
      ads: 0,
      categories: 0,
      products: 0
    });
  };
  const addToCart = (product) => {
    try {
      console.log('Adding to cart:', product);

      if (!product || !product._id) {
        console.error('Invalid product data');
        return;
      }

      const currentCart = JSON.parse(localStorage.getItem('cart')) || [];

      const existingItemIndex = currentCart.findIndex(
        item => item.productId === product._id
      );

      if (existingItemIndex >= 0) {
        currentCart[existingItemIndex].quantity += 1;
      } else {
        currentCart.push({
          productId: product._id,
          product,
          quantity: 1,
          color: product.colors?.[0] || null,
          size: product.sizes?.[0] || null
        });
      }

      localStorage.setItem('cart', JSON.stringify(currentCart));

      addNotification({
        title: "Added to Cart",
        content: `${product.name} has been added to your cart`,
        time: "Just now"
      });

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      addNotification({
        title: "Error",
        content: "Failed to add product to cart",
        time: "Just now"
      });
    }
  };
  return (
    <div>
      <div className="home-page">
        {/* Main Content Sections */}
        <div className='main-content'>
          {/* Events Section */}
          <motion.section
            className="mb-5"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title">Upcoming Events</h2>
              {events.length > 6 && (
                <Button
                  variant="link"
                  onClick={() =>
                    visibleEvents === 6 ? setVisibleEvents(events.length) : setVisibleEvents(6)
                  }
                >
                  {visibleEvents === 6 ? 'See More' : 'See Less'}
                </Button>
              )}
            </div>
            {loadingEvents ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : errorEvents ? (
              <div className="alert alert-danger">{errorEvents}</div>
            ) : events.length === 0 ? (
              <div className="alert alert-info">No upcoming events at the moment</div>
            ) : (
              <Row>
                {events.slice(0, visibleEvents).map((event) => {
                  const fromDate = new Date(event.fromDate).toLocaleDateString();
                  const toDate = new Date(event.toDate).toLocaleDateString();
                  const fromTime = event.fromTime;
                  const toTime = event.toTime;

                  return (
                    <Col md={12} className="mb-4" key={event._id}>
                      <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                      >
                        <Card className="h-100 event-card">
                          {event.images && event.images.length > 0 && (
                            <Card.Img
                              variant="top"
                              src={`http://localhost:5000/${event.images[0]}`}
                              style={{ height: '400px', objectFit: 'cover' }}
                            />
                          )}
                          <Card.Body>
                            <div className="event-date-badge">
                              <span>{fromDate}-{toDate}  • {fromTime}-{toTime}</span>
                            </div>
                            <Card.Title>{event.eventName}</Card.Title>
                            <Card.Text>{event.eventDescription}</Card.Text>
                            <Button variant="outline-primary" size="sm">
                              Register
                            </Button>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => navigate(`/events/${event._id}/products`)}
                            >Products
                            </Button>
                          </Card.Body>
                          {/* <Card.Footer>
                            
                          </Card.Footer> */}
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </motion.section>
          {/* Featured Collections Carousel - Professional Design */}
          <motion.section
            className="mb-5"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title">Featured Collections</h2>
            </div>

            {loadingCarsuals ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2">Loading featured collections...</p>
              </div>
            ) : errorCarsuals ? (
              <div className="alert alert-danger text-center">
                <FiInfo className="me-2" />
                {errorCarsuals}
              </div>
            ) : carsuals.length === 0 ? (
              <div className="alert alert-info text-center">
                <FiInfo className="me-2" />
                No collections available at the moment
              </div>
            ) : (
              <div className="position-relative">
                <Carousel
                  indicators={carsuals.length > 1}
                  interval={5000}
                  controls={carsuals.length > 1}
                  prevIcon={
                    <span className="carousel-control-prev-icon-custom">
                      <FiChevronLeft size={24} />
                    </span>
                  }
                  nextIcon={
                    <span className="carousel-control-next-icon-custom">
                      <FiChevronRight size={24} />
                    </span>
                  }
                  className="modern-carousel"
                >
                  {carsuals.map((carsual) => (
                    <Carousel.Item key={carsual._id} className="carousel-item-modern">
                      <div className="carsual-container">
                        <Row className="align-items-center g-0">
                          {/* <Col md={12} className="carsual-text-col">
                            <div className="carsual-content p-4 p-lg-5">
                              <Badge pill bg="primary" className="mb-3">
                                New Arrival
                              </Badge>
                              <h2 className="carsual-title mb-3">{carsual.name}</h2>
                              <p className="carsual-description mb-4">
                                {carsual.description}
                              </p>
                              <div className="d-flex gap-3">
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="carsual-button"
                                  onClick={() => navigate(`/collections/${carsual._id}`)}
                                >
                                  Shop Now
                                </Button>
                                <Button
                                  variant="primary"
                                  size="lg"
                                  className="carsual-button"
                                >
                                  Learn More
                                </Button>
                              </div>
                            </div>
                          </Col> */}
                          <Col md={12} className="carsual-image-col">
                            <div className="carsual-image-container">
                              {carsual.images && carsual.images.length > 0 && (
                                <img
                                  src={`http://localhost:5000/${carsual.images[0]}`}
                                  alt={carsual.name}
                                  className="carsual-main-image img-fluid"
                                  loading="lazy"
                                />
                              )}
                              <div className="carsual-store-badge">
                                <span>{carsual.store}</span>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Carousel.Item>
                  ))}
                </Carousel>
              </div>
            )}
          </motion.section>
          {/* Category and Products Section */}
          <motion.section
            className="mb-5"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title">
                {selectedCategory
                  ? `Products in ${categories.find(c => c._id === selectedCategory)?.name || 'Category'}`
                  : 'Featured Products'}
              </h2>
              {products.length > visibleProducts && (
                <Button
                  variant="link"
                  onClick={() =>
                    visibleProducts === 8 ? setVisibleProducts(products.length) : setVisibleProducts(8)
                  }
                >
                  {visibleProducts === 300 ? 'See More' : 'See Less'}
                </Button>
              )}
            </div>

            {loadingProducts ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : errorProducts ? (
              <div className="alert alert-danger">{errorProducts}</div>
            ) : products.length === 0 ? (
              <div className="alert alert-info">No products available at the moment</div>
            ) : (
              <Row>
                {/* First Column - Filters */}
                <Col md={2} className="mb-4">
                  <Card className="filter-card">
                    <Card.Body>
                      <h5 className="mb-4">Filters</h5>

                      {/* Category Filter */}
                      <div className="mb-4">
                        <h6>Categories</h6>
                        <ListGroup variant="flush">
                          {categories.map((category) => (
                            <ListGroup.Item
                              key={category._id}
                              action
                              active={selectedCategory === category._id}
                              onClick={() => setSelectedCategory(category._id)}
                              className="d-flex justify-content-between align-items-center"
                            >
                              {category.name}
                              <Badge pill bg="secondary">
                                {category.productCount}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </div>

                      {/* Price Range Filter */}
                      <div className="mb-4">
                        <h6>Price Range</h6>
                        <div className="d-flex justify-content-between mb-2">
                          <FormControl
                            type="number"
                            placeholder="Min"
                            className="me-2"
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                          />
                          <FormControl
                            type="number"
                            placeholder="Max"
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                          />
                        </div>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={applyPriceFilter}
                        >
                          Apply
                        </Button>
                      </div>

                      {/* Color Filter */}
                      <div className="mb-4">
                        <h6>Colors</h6>
                        <div className="color-filter-container">
                          {Array.from(new Set(products.flatMap(p => p.colors || []))).map(color => (
                            <div
                              key={color}
                              className={`color-option ${selectedColors.includes(color) ? 'selected' : ''}`}
                              style={{ backgroundColor: color }}
                              onClick={() => toggleColorFilter(color)}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Size Filter */}
                      <div className="mb-4">
                        <h6>Sizes</h6>
                        <div className="size-filter-container">
                          {Array.from(new Set(products.flatMap(p => p.sizes || []))).map(size => (
                            <Badge
                              key={size}
                              pill
                              bg={selectedSizes.includes(size) ? 'primary' : 'secondary'}
                              className="me-2 mb-2 size-badge"
                              onClick={() => toggleSizeFilter(size)}
                            >
                              {size}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Discount Filter */}
                      <div className="mb-4">
                        <h6>Discount</h6>
                        <Form.Select
                          value={discountFilter}
                          onChange={(e) => setDiscountFilter(e.target.value)}
                        >
                          <option value="all">All Discounts</option>
                          <option value="5">5% or more</option>
                          <option value="10">10% or more</option>
                          <option value="15">15% or more</option>
                          <option value="20">20% or more</option>
                          <option value="25">25% or more</option>
                          <option value="30">30% or more</option>
                          <option value="35">35% or more</option>
                          <option value="40">40% or more</option>
                          <option value="45">45% or more</option>
                          <option value="50">50% or more</option>
                          <option value="55">55% or more</option>
                          <option value="60">60% or more</option>
                          <option value="65">65% or more</option>
                          <option value="70">70% or more</option>
                          <option value="75">75% or more</option>
                        </Form.Select>
                      </div>
                      {/* Return Days Filter */}
                      <div className="mb-4">
                        <h6>Return Policy</h6>
                        <Form.Select
                          value={returnDaysFilter}
                          onChange={(e) => setReturnDaysFilter(e.target.value)}
                        >
                          <option value="all">Any Return Policy</option>
                          <option value="1">1 Days Return</option>
                          <option value="2">2 Days Return</option>
                          <option value="3">3 Days Return</option>
                          <option value="4">4 Days Return</option>
                          <option value="5">5 Days Return</option>
                          <option value="6">6 Days Return</option>
                          <option value="7">7 Days Return</option>
                        </Form.Select>
                      </div>

                      <Button
                        variant="danger"
                        size="sm"
                        onClick={resetFilters}
                        className="w-100"
                      >
                        Reset Filters
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>

                {/* Second Column - Products */}
                <Col md={10}>
                  <Row>
                    {filteredProducts.slice(0, visibleProducts).map((product) => (
                      <Col xl={2} lg={3} md={3} sm={3} className="mb-4" key={product._id}>
                        <motion.div
                          variants={itemVariants}
                          whileHover="hover"
                        >
                          <Card className=" product-card">
                            <div className="product-badge-container">
                              {product.discount > 0 && (
                                <Badge pill bg="danger" className="product-discount-badge">
                                  {product.discount}% OFF
                                </Badge>
                              )}
                              {product.images && product.images.length > 0 && (
                                <Card.Img
                                  variant="top"
                                  src={`http://localhost:5000/${product.images[0]}`}
                                  style={{ height: '120px', objectFit: 'cover' }}
                                />
                              )}
                              <div className="product-actions">
                                <Button variant="light" size="sm" className="action-btn">
                                  <FiHeart />
                                </Button>
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="action-btn"
                                  onClick={() => addToCart(product)}
                                >
                                  <FiShoppingCart />
                                </Button>
                                <Button
                                  variant="light"
                                  size="sm"
                                  className="action-btn"
                                  onClick={() => navigate(`/products/${product._id}`)}
                                >
                                  <FiEye />
                                </Button>
                              </div>
                            </div>
                            <Card.Body>
                              <h6 >{product.name}</h6>
                              {/* <div className="d-flex justify-content-between align-items-center mb-2">
                                <div>
                                  <span className="product-price">
                                    ${(product.price - (product.price * (product.discount / 100)).toFixed(2))}
                                  </span>
                                  {product.discount > 0 && (
                                    <span className="product-original-price ms-2 text-decoration-line-through">
                                      ${product.price}
                                    </span>
                                  )}
                                </div>
                                <div className="product-rating">
                                  <FaStar className="text-warning" />
                                  <span className="ms-1">{product.rating || '4.5'}</span>
                                </div>
                              </div>
                              <div className="mb-2">
                                {product.colors && product.colors.length > 0 && (
                                  <div className="d-flex align-items-center">
                                    <small className="text-muted me-2">Colors:</small>
                                    <div className="d-flex">
                                      {product.colors.slice(0, 3).map(color => (
                                        <div
                                          key={color}
                                          className="color-dot"
                                          style={{ backgroundColor: color }}
                                          title={color}
                                        />
                                      ))}
                                      {product.colors.length > 3 && (
                                        <small className="ms-1">+{product.colors.length - 3}</small>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div>
                                {product.sizes && product.sizes.length > 0 && (
                                  <div>
                                    <small className="text-muted">Sizes:</small>
                                    <div className="mt-1">
                                      {product.sizes.slice(0, 4).map(size => (
                                        <Badge
                                          key={size}
                                          pill
                                          bg="secondary"
                                          className="me-1 mb-1 size-badge"
                                        >
                                          {size}
                                        </Badge>
                                      ))}
                                      {product.sizes.length > 4 && (
                                        <small className="ms-1">+{product.sizes.length - 4}</small>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div> */}
                            </Card.Body>
                            <Card.Footer className="bg-transparent">
                              <div className="d-flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => navigate(`/products/${product._id}`)}
                                  className="flex-grow-1"
                                >
                                  View
                                </Button>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() => addToCart(product)}
                                  className="flex-grow-1"
                                >
                                  Cart
                                </Button>
                                {/* Add this Visit Store button */}
                                {product.createdBy && (
                                  <Button
                                    variant="info"
                                    size="sm"
                                    onClick={() => navigate(`/shop/${product.createdBy}`)}
                                    className="flex-grow-1"
                                  >Store
                                  </Button>
                                )}
                              </div>
                            </Card.Footer>
                          </Card>
                        </motion.div>
                      </Col>
                    ))}
                  </Row>
                </Col>
              </Row>
            )}
          </motion.section>
          {/* Counter */}
          <motion.section
            className="counters-section mb-5"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Container>
              <Row className="g-4">
                <Col md={4}>
                  <motion.div
                    className="counter-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="counter-icon">
                      <FiUsers />
                    </div>
                    <div className="counter-value">
                      <CountUp end={counters.customers} duration={2.5} />
                      <span>+</span>
                    </div>
                    <div className="counter-label">Happy Customers</div>
                  </motion.div>
                </Col>
                <Col md={4}>
                  <motion.div
                    className="counter-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="counter-icon">
                      <FiLayers />
                    </div>
                    <div className="counter-value">
                      <CountUp end={counters.categories} duration={2.5} />
                    </div>
                    <div className="counter-label">Product Categories</div>
                  </motion.div>
                </Col>
                <Col md={4}>
                  <motion.div
                    className="counter-item"
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="counter-icon">
                      <FiPackage />
                    </div>
                    <div className="counter-value">
                      <CountUp end={counters.products} duration={2.5} />
                      <span>+</span>
                    </div>
                    <div className="counter-label">Quality Products</div>
                  </motion.div>
                </Col>
              </Row>
            </Container>
          </motion.section>
          {/* Ads Section */}
          <motion.section
            className="mb-5"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="section-title">Sponsored Ads</h2>
              {ads.length > 4 && (
                <Button
                  variant="link"
                  onClick={() =>
                    visibleAds === 4 ? setVisibleAds(ads.length) : setVisibleAds(4)
                  }
                >
                  {visibleAds === 4 ? 'See More' : 'See Less'}
                </Button>
              )}
            </div>
            {loadingAds ? (
              <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : errorAds ? (
              <div className="alert alert-danger">{errorAds}</div>
            ) : ads.length === 0 ? (
              <div className="alert alert-info">No active ads at the moment</div>
            ) : (
              <Row>
                {ads.slice(0, visibleAds).map((ad) => {
                  const fromDate = new Date(ad.fromDate).toLocaleDateString();
                  const toDate = new Date(ad.toDate).toLocaleDateString();
                  const fromTime = ad.fromTime;
                  const toTime = ad.toTime;

                  return (
                    <Col md={4} className="mb-4" key={ad._id}>
                      <motion.div
                        variants={itemVariants}
                        whileHover="hover"
                      >
                        <Card className="h-100 ad-card">
                          <div className="ad-header">
                            <span className="ad-badge">Sponsored</span>
                            <div className="ad-time-range">
                              {fromDate} - {toDate} • {fromTime} - {toTime}
                            </div>
                          </div>
                          {ad.images && ad.images.length > 0 && (
                            <Card.Img
                              variant="top"
                              src={`http://localhost:5000/${ad.images[0]}`}
                              style={{ height: '250px', objectFit: 'cover' }}
                            />
                          )}
                          <Card.Body>
                            <Card.Title>{ad.adsName}</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                              Target: {ad.targetAudience}
                            </Card.Subtitle>
                            <Card.Text>{ad.adsDescription}</Card.Text>
                            {ad.setArea && (
                              <div className="ad-location">
                                <FaMapMarkerAlt className="me-1" />
                                <small className="text-muted">{ad.setArea.address}</small>
                              </div>
                            )}
                          </Card.Body>
                          <Card.Footer className="bg-transparent">
                            <Button variant="primary" size="sm" className="me-2">
                              Learn More
                            </Button>
                            <Button variant="outline-secondary" size="sm">
                              Hide Ad
                            </Button>
                          </Card.Footer>
                        </Card>
                      </motion.div>
                    </Col>
                  );
                })}
              </Row>
            )}
          </motion.section>

        </div>
      </div>
      {/* Welcome Modal - Professional Design */}
      {/* <Modal
        show={showWelcomeModal}
        onHide={() => setShowWelcomeModal(false)}
        centered
        backdrop="static"
        className="welcome-modal"
      >
        <Modal.Body className="p-0">
          <div className="welcome-modal-content">
            
            <div className="welcome-header">
              <div className="welcome-circle">
                <FiMessageSquare size={36} className="welcome-icon" />
              </div>
            </div>

           
            <div className="welcome-body">
              <h3 className="welcome-title">Welcome to Our Support Portal!</h3>
              <p className="welcome-text">
                We're thrilled to have you here. Our virtual assistant is ready to help you
                with any questions or issues you might have.
              </p>

              <div className="welcome-features">
                <div className="feature-item">
                  <div className="feature-icon">
                    <FiCheck className="check-icon" />
                  </div>
                  <span>24/7 instant support</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FiCheck className="check-icon" />
                  </div>
                  <span>Quick response times</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <FiCheck className="check-icon" />
                  </div>
                  <span>Knowledgeable assistance</span>
                </div>
              </div>
            </div>
            <div className="welcome-footer">
              <Button
                variant="primary"
                className="welcome-button"
                onClick={() => setShowWelcomeModal(false)}
              >
                Get Started
                <FiChevronRight className="ms-2" />
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
       */}
      <div className="whatsapp-chat-container">
 
        {/* Notification Button */}
        <motion.div
          className={`notification-button ${showNotifications ? 'hidden' : ''}`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.7, type: 'spring' }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <FiBell size={20} />
          {(unreadCount > 0 || Object.values(newItems).some(count => count > 0)) && (
            <motion.div
              className="notification-count-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
            >
              <Badge bg="danger">
                {unreadCount + Object.values(newItems).reduce((a, b) => a + b, 0)}
              </Badge>
            </motion.div>
          )}
        </motion.div>

        {/* Notification Center */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              className="notification-center"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={notificationWindowVariants}
            >
              <div className="notification-header">
                <h6>Notifications</h6>
                <div className="notification-actions">
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      clearAllNotifications();
                      clearAllNewItemNotifications();
                    }}
                    disabled={notifications.length === 0 && Object.values(newItems).every(count => count === 0)}
                  >
                    Clear All
                  </Button>
                  <Button
                    variant="link"
                    className="p-0 ms-2"
                    onClick={() => setShowNotifications(false)}
                  >
                    <FiX size={18} />
                  </Button>
                </div>
              </div>
              <div className="notification-body">
                {notifications.length === 0 && Object.values(newItems).every(count => count === 0) ? (
                  <div className="empty-notifications">
                    <p>No notifications to display</p>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {/* New items notifications */}
                    {Object.entries(newItems).map(([type, count]) => (
                      count > 0 && (
                        <ListGroup.Item
                          key={`new-${type}`}
                          className="notification-item unread"
                        >
                          <div className="notification-content">
                            <div className="notification-title">
                              New {type} added!
                              <Button
                                variant="link"
                                className="p-0 ms-2 notification-remove"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeNewItemNotification(type);
                                }}
                              >
                                <FiTrash2 size={14} />
                              </Button>
                            </div>
                            <div className="notification-text">
                              {count} new {type} {count === 1 ? 'has' : 'have'} been added to the system.
                            </div>
                            <div className="notification-time">Just now</div>
                          </div>
                        </ListGroup.Item>
                      )
                    ))}

                    {/* Regular notifications */}
                    {notifications.map((notification) => (
                      <ListGroup.Item
                        key={notification.id}
                        className={`notification-item ${notification.read ? '' : 'unread'}`}
                      >
                        <div className="notification-content">
                          <div className="notification-title">
                            {notification.title}
                            <Button
                              variant="link"
                              className="p-0 ms-2 notification-remove"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNotification(notification.id);
                              }}
                            >
                              <FiTrash2 size={14} />
                            </Button>
                          </div>
                          <div className="notification-text">{notification.content}</div>
                          <div className="notification-time">{notification.time}</div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast notification for new items */}
        <AnimatePresence>
          {showNewItemsNotification && notificationType && newItems[notificationType] > 0 && (
            <motion.div
              className="new-items-toast"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={() => {
                setShowNewItemsNotification(false);
                setShowNotifications(true);
                // Scroll to the relevant section when notification is clicked
                setTimeout(() => {
                  const element = document.getElementById(notificationType);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }, 300);
              }}
            >
              <div className="toast-content">
                <FiBell className="me-2" />
                <div>
                  <strong>New {notificationType} available!</strong>
                  <small className="d-block">
                    {newItems[notificationType]} new {notificationType}{' '}
                    {newItems[notificationType] === 1 ? 'has' : 'have'} been added
                  </small>
                </div>
              </div>
              <Button
                variant="link"
                className="toast-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNewItemsNotification(false);
                  removeNewItemNotification(notificationType);
                }}
              >
                <FiX size={18} />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Customer;