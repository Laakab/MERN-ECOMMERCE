
import React, { useState, useEffect, useRef } from 'react';
import CEO from '../Images/CEO.jpg';

import {
  Modal,
  Button,
  FormControl,
  Badge,
  ListGroup,
  Carousel,
  Card,
  Row,
  Form,
  Col,
  Container
} from 'react-bootstrap';
import {
  FiMessageSquare,
  FiChevronRight,
  FiCheck,
  FiInfo,
  FiCalendar,
  FiTrendingUp,
  FiDollarSign, // Add this
  FiNavigation, // Add this
  FiShield, // Add this
  FiTruck,
  FiChevronLeft,
  FiChevronRight as FiChevronRightIcon,
  FiHeart,
  FiShoppingCart,
  FiEye
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../Css/Home.css';
import post from '../Images/post.avif'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUsers, FiLayers, FiPackage } from 'react-icons/fi';
import CountUp from 'react-countup';
const ChatBot = () => {
  const [showMobileFilters, setShowMobileFilters] = useState(false);
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
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
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


  // Add this useEffect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomeModal(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Count unread notifications
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


  return (
    <div>
      <div className="home-page">
        {/* Main Content Sections */}
        <div className='main-content'>
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
                          {/* Remove text column and make image take full width */}
                          <Col xs={12} className="carsual-image-col">
                            <div className="carsual-image-container w-100">
                              {carsual.images && carsual.images.length > 0 && (
                                <img
                                  src={`http://localhost:5000/${carsual.images[0]}`}
                                  alt={carsual.name}
                                  className="carsual-main-image img-fluid w-100"
                                  loading="lazy"
                                  style={{
                                    height: '400px',
                                    objectFit: 'cover',
                                    borderRadius: '8px'
                                  }}
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

          {/* About Us Section */}
          <motion.section
            className="about-section mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {/* CEO Row */}
            <Row className="about-row align-items-center mb-5 pb-4">
              <Col md={9} lg={8} xl={9} className="order-md-1 order-2 mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="about-content"
                >
                  <h2 className="about-title mb-4">Meet Our Visionary CEO</h2>
                  <p className="about-text lead">
                    Our CEO brings over 15 years of experience in e-commerce and technology innovation.
                    Under their leadership, we've grown from a small startup to a trusted platform
                    serving thousands of customers nationwide.
                  </p>
                  <p className="about-text">
                    "Our mission is to create seamless shopping experiences that connect customers
                    with quality products while supporting local businesses and entrepreneurs."
                  </p>
                  <Button variant="outline-primary" className="mt-3">
                    Learn More About Our Team
                  </Button>
                </motion.div>
              </Col>
              <Col md={3} lg={4} xl={3} className="order-md-2 order-1 mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="about-image-container"
                >
                  <img
                    src={CEO}
                    alt="Our CEO"
                    className="about-image img-fluid rounded shadow w-100"
                    style={{
                      maxHeight: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              </Col>
            </Row>

            {/* About E-commerce Website Row */}
            <Row className="about-row align-items-center mb-5 pb-4">
              <Col md={6} lg={6} className="mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="about-image-container"
                >
                  <img
                    src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                    alt="Our E-commerce Platform"
                    className="about-image img-fluid rounded shadow w-100"
                    style={{
                      height: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              </Col>
              <Col md={6} lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="about-content"
                >
                  <h2 className="about-title mb-4">About Our E-commerce Platform</h2>
                  <p className="about-text lead">
                    We've built a next-generation shopping platform that combines cutting-edge
                    technology with personalized service to deliver exceptional value to both
                    customers and sellers.
                  </p>
                  <p className="about-text">
                    Our platform features advanced search capabilities, secure payment processing,
                    real-time inventory management, and AI-powered recommendations to enhance
                    your shopping experience.
                  </p>
                  <div className="d-flex flex-wrap gap-2 mt-3">
                    <Badge bg="primary" className="p-2 mb-2">Secure Payments</Badge>
                    <Badge bg="success" className="p-2 mb-2">Fast Delivery</Badge>
                    <Badge bg="info" className="p-2 mb-2">24/7 Support</Badge>
                  </div>
                </motion.div>
              </Col>
            </Row>

            {/* Products, Categories, Events, Ads Row */}
            <Row className="about-row align-items-center mb-5 pb-4">
              <Col md={6} lg={6} className="order-md-1 order-2 mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="about-content"
                >
                  <h2 className="about-title mb-4">Diverse Shopping Experience</h2>
                  <p className="about-text lead">
                    Discover a world of possibilities with our extensive catalog featuring
                    thousands of products across numerous categories.
                  </p>
                  <Row className="mt-4">
                    <Col xs={6} md={6} className="mb-3">
                      <div className="feature-item d-flex align-items-center">
                        <div className="feature-icon me-3">
                          <FiPackage size={24} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0">{counters.products}+ Products</h6>
                          <small className="text-muted">Quality items</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} md={6} className="mb-3">
                      <div className="feature-item d-flex align-items-center">
                        <div className="feature-icon me-3">
                          <FiLayers size={24} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0">{counters.categories} Categories</h6>
                          <small className="text-muted">Various options</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} md={6} className="mb-3">
                      <div className="feature-item d-flex align-items-center">
                        <div className="feature-icon me-3">
                          <FiCalendar size={24} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0">Regular Events</h6>
                          <small className="text-muted">Special promotions</small>
                        </div>
                      </div>
                    </Col>
                    <Col xs={6} md={6} className="mb-3">
                      <div className="feature-item d-flex align-items-center">
                        <div className="feature-icon me-3">
                          <FiTrendingUp size={24} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-0">Targeted Ads</h6>
                          <small className="text-muted">Relevant offers</small>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </motion.div>
              </Col>
              <Col md={6} lg={6} className="order-md-2 order-1 mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="about-image-container"
                >
                  <img
                    src="https://images.unsplash.com/photo-1607082350899-7e105aa886ae?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                    alt="Our Product Range"
                    className="about-image img-fluid rounded shadow w-100"
                    style={{
                      height: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              </Col>
            </Row>

            {/* Customer, Shopkeeper, Delivery Row */}
            <Row className="about-row align-items-center">
              <Col md={6} lg={6} className="mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="about-image-container"
                >
                  <img
                    src={post}
                    alt="Our Community"
                    className="about-image img-fluid rounded shadow w-100"
                    style={{
                      height: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              </Col>
              <Col md={6} lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="about-content"
                >
                  <h2 className="about-title mb-4">Our Ecosystem</h2>
                  <p className="about-text lead">
                    We've created a thriving ecosystem that connects customers, shopkeepers,
                    and delivery partners in a seamless network of commerce and community.
                  </p>

                  <motion.div
                    className="ecosystem-stats mt-4"
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={{
                      hidden: { opacity: 0 },
                      visible: {
                        opacity: 1,
                        transition: {
                          staggerChildren: 0.2
                        }
                      }
                    }}
                  >
                    <motion.div
                      className="stat-item mb-3"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3 bg-primary rounded-circle d-flex align-items-center justify-content-center">
                          <FiUsers size={20} className="text-white" />
                        </div>
                        <div>
                          <h5 className="mb-0">{counters.customers}+ Happy Customers</h5>
                          <small className="text-muted">Served with excellence</small>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="stat-item mb-3"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { delay: 0.2 } }
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3 bg-success rounded-circle d-flex align-items-center justify-content-center">
                          <FiTruck size={20} className="text-white" />
                        </div>
                        <div>
                          <h5 className="mb-0">500+ Shopkeepers</h5>
                          <small className="text-muted">Growing businesses</small>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      className="stat-item"
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { delay: 0.4 } }
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div className="stat-icon me-3 bg-warning rounded-circle d-flex align-items-center justify-content-center">
                          <FiTruck size={20} className="text-white" />
                        </div>
                        <div>
                          <h5 className="mb-0">200+ Delivery Partners</h5>
                          <small className="text-muted">Ensuring timely delivery</small>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </Col>
            </Row>

          </motion.section>

          {/* Shopkeeper Section */}
          <motion.section
            className="shopkeeper-section mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Row className="align-items-center mb-5">
              <Col md={6} lg={6} className="mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="shopkeeper-image-container"
                >
                  <img
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"
                    alt="Shopkeeper"
                    className="img-fluid rounded shadow w-100"
                    style={{
                      height: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              </Col>
              <Col md={6} lg={6}>
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="shopkeeper-content"
                >
                  <h2 className="mb-4">Become a Shopkeeper</h2>
                  <p className="lead mb-4">
                    Join our platform as a shopkeeper and grow your business with thousands of potential customers.
                    We provide the tools and support you need to succeed in the digital marketplace.
                  </p>

                  <div className="features-icons mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-container bg-primary me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiTrendingUp size={20} className="text-white" />
                      </div>
                      <span>Increase your sales and customer reach</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-container bg-success me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiPackage size={20} className="text-white" />
                      </div>
                      <span>Easy inventory management system</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-container bg-info me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiUsers size={20} className="text-white" />
                      </div>
                      <span>Access to thousands of potential customers</span>
                    </div>
                    <div className="d-flex align-items-center mb-4">
                      <div className="icon-container bg-warning me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiShoppingCart size={20} className="text-white" />
                      </div>
                      <span>Seamless order processing and tracking</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/shopsignup')}
                      className="mb-2 mb-md-0"
                    >
                      Shopkeeper Signup
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      Shopkeeper Login
                    </Button>
                  </div>
                </motion.div>
              </Col>
            </Row>
          </motion.section>

          {/* Delivery Partner Section */}
          <motion.section
            className="delivery-section mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Row className="align-items-center">
              <Col md={6} lg={6} className="order-md-1 order-2 mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="delivery-content"
                >
                  <h2 className="mb-4">Become a Delivery Partner</h2>
                  <p className="lead mb-4">
                    Join our network of delivery partners and earn money on your own schedule.
                    We provide flexible opportunities to deliver products to customers in your area.
                  </p>

                  <div className="features-icons mb-4">
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-container bg-primary me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiCalendar size={20} className="text-white" />
                      </div>
                      <span>Flexible working hours</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-container bg-success me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiDollarSign size={20} className="text-white" />
                      </div>
                      <span>Competitive earnings and incentives</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <div className="icon-container bg-info me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiNavigation size={20} className="text-white" />
                      </div>
                      <span>Easy-to-use delivery app</span>
                    </div>
                    <div className="d-flex align-items-center mb-4">
                      <div className="icon-container bg-warning me-3 rounded-circle d-flex align-items-center justify-content-center">
                        <FiShield size={20} className="text-white" />
                      </div>
                      <span>Insurance coverage for deliveries</span>
                    </div>
                  </div>

                  <div className="d-flex flex-column flex-md-row gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      onClick={() => navigate('/deliversignup')}
                      className="mb-2 mb-md-0"
                    >
                      Delivery Signup
                    </Button>
                    <Button
                      variant="outline-primary"
                      size="lg"
                      onClick={() => navigate('/login')}
                    >
                      Delivery Login
                    </Button>
                  </div>
                </motion.div>
              </Col>
              <Col md={6} lg={6} className="order-md-2 order-1 mb-4 mb-md-0">
                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7 }}
                  className="delivery-image-container"
                >
                  <img
                    src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1129&q=80"
                    alt="Delivery Partner"
                    className="img-fluid rounded shadow w-100"
                    style={{
                      height: '300px',
                      objectFit: 'cover'
                    }}
                  />
                </motion.div>
              </Col>
            </Row>
          </motion.section>

          {/* Counter Section */}
          <motion.section
            className="counters-section mb-5"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Container>
              <Row className="g-4">
                <Col xs={12} md={4} lg={4}>
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
                <Col xs={12} md={4} lg={4}>
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
                <Col xs={12} md={4} lg={4}>
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
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
