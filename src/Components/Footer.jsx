import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaSignInAlt, FaSearch, FaTimes } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../Css/Footer.css'; // Create this CSS file for custom styles

const Footer = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) setSearchQuery('');
  };

  return (
    <footer className="footer" style={{ backgroundColor: '#1B3C53' }}>
      <Container>
        {/* Top Section */}
        <Row className="py-4 align-items-center">
          {/* Logo */}
          <Col md={3} className="mb-3 mb-md-0">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Link to="/" className="d-flex align-items-center text-decoration-none">
                <span className="logo-text" style={{ color: '#F9F3EF', fontSize: '1.8rem', fontWeight: 'bold' }}>
                  ShopEase
                </span>
              </Link>
            </motion.div>
          </Col>

          {/* Search */}
          <Col md={6} className="mb-3 mb-md-0">
            <div className="d-flex justify-content-center">
              <AnimatePresence>
                {showSearch ? (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: '100%' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.3 }}
                    className="search-container"
                  >
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                        style={{ backgroundColor: '#F9F3EF', borderColor: '#456882' }}
                      />
                      <Button 
                        variant="outline-secondary" 
                        onClick={toggleSearch}
                        style={{ backgroundColor: '#456882', borderColor: '#456882' }}
                      >
                        <FaTimes color="#F9F3EF" />
                      </Button>
                    </InputGroup>
                  </motion.div>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Button 
                      variant="link" 
                      onClick={toggleSearch}
                      className="search-icon"
                    >
                      <FaSearch size={24} color="#F9F3EF" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Col>

          {/* Icons */}
          <Col md={3} className="d-flex justify-content-end">
            <div className="d-flex">
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-2"
              >
                <Link to="/cart" className="icon-link">
                  <FaShoppingCart size={24} color="#F9F3EF" />
                  <span className="icon-badge">0</span>
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-2"
              >
                <Link to="/login" className="icon-link">
                  <FaSignInAlt size={24} color="#F9F3EF" />
                </Link>
              </motion.div>
              
              <motion.div 
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="mx-2"
              >
                <Link to="/adminsignup" className="icon-link">
                  <FaUser size={24} color="#F9F3EF" />
                </Link>
              </motion.div>
            </div>
          </Col>
        </Row>

        {/* Divider */}
        <motion.div 
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          style={{ height: '1px', backgroundColor: '#456882', margin: '1rem 0' }}
        />

        {/* Bottom Section */}
        <Row className="py-3">
          <Col md={4} className="mb-3 mb-md-0">
            <h5 style={{ color: '#D2C1B6' }}>About Us</h5>
            <p style={{ color: '#F9F3EF' }}>
              We provide the best products with quality assurance and customer satisfaction.
            </p>
          </Col>
          
          <Col md={4} className="mb-3 mb-md-0">
            <h5 style={{ color: '#D2C1B6' }}>Quick Links</h5>
            <ul className="footer-links">
              <li><Link to="/" style={{ color: '#F9F3EF' }}>Home</Link></li>
              <li><Link to="/products" style={{ color: '#F9F3EF' }}>Products</Link></li>
              <li><Link to="/contact" style={{ color: '#F9F3EF' }}>Contact</Link></li>
            </ul>
          </Col>
          
          <Col md={4}>
            <h5 style={{ color: '#D2C1B6' }}>Contact</h5>
            <address style={{ color: '#F9F3EF' }}>
              123 Street, City<br />
              Country<br />
              Email: info@example.com<br />
              Phone: +1234567890
            </address>
          </Col>
        </Row>

        {/* Copyright */}
        <Row>
          <Col className="text-center py-2">
            <motion.p 
              style={{ color: '#D2C1B6' }}
              whileHover={{ scale: 1.02 }}
            >
              &copy; {new Date().getFullYear()} ShopEase. All rights reserved.
            </motion.p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;