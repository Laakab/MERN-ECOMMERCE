import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Form, FormControl, Offcanvas } from 'react-bootstrap';
import { FaUser, FaUserPlus, FaShoppingCart, FaSearch, FaBars } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import '../Css/Header.css';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener
  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled more than 50px
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      setIsScrolled(scrollTop > 50);
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Team', path: '/team' },
  ];

  return (
    <Navbar
      expand="lg"
      fixed="top"
      className={`main-navbar ${isScrolled ? 'scrolled' : ''}`}
    >
      {/* Rest of the component remains the same */}
      <Container>
        {/* Logo with animation */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar.Brand as={Link} to="/" className="logo-text">
            <span className="logo-part-1">Shop</span>
            <span className="logo-part-2">Hub</span>
          </Navbar.Brand>
        </motion.div>

        {/* Mobile menu button */}
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="d-lg-none"
        >
          <FaBars
            size={24}
            onClick={() => setShowOffcanvas(true)}
            className="menu-icon"
          />
        </motion.div>

        {/* Desktop Navigation */}
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-center">
          <Nav className="mx-auto">
            {navLinks.map((link, index) => (
              <motion.div
                key={link.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Nav.Link
                  as={Link}
                  to={link.path}
                  className="nav-link-item"
                >
                  {link.name}
                </Nav.Link>
              </motion.div>
            ))}
          </Nav>
        </Navbar.Collapse>

        {/* Right side icons */}
        <div className="d-flex align-items-center">
          {/* Search bar with animation */}
          <AnimatePresence>
            {showSearch && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3 }}
                className="me-2"
              >
                <Form className="d-flex">
                  <FormControl
                    id="search-input"
                    type="search"
                    placeholder="Search"
                    className="search-input"
                    aria-label="Search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </Form>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="icon-container me-3"
          >
            <FaSearch
              size={20}
              onClick={toggleSearch}
              className="header-icon"
            />
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="icon-container me-3"
          >
            <Link to="/login" className="header-icon-link">
              <FaUser size={20} className="header-icon" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="icon-container me-3"
          >
            <Link to="/signup" className="header-icon-link">
              <FaUserPlus size={20} className="header-icon" />
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="icon-container"
          >
            <Link to="/login" className="header-icon-link">
              <FaShoppingCart
                size={20}
                className="header-icon"
              />
            </Link>
            <motion.span
              className="cart-badge"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              0
            </motion.span>
          </motion.div>
        </div>
      </Container>

      {/* Mobile Offcanvas Menu */}
      <Offcanvas
        show={showOffcanvas}
        onHide={() => setShowOffcanvas(false)}
        placement="end"
        className="mobile-menu"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {navLinks.map((link) => (
              <motion.div
                key={link.name}
                whileHover={{ x: 10 }}
                whileTap={{ scale: 0.95 }}
              >
                <Nav.Link
                  as={Link}
                  to={link.path}
                  onClick={() => setShowOffcanvas(false)}
                  className="mobile-nav-link"
                >
                  {link.name}
                </Nav.Link>
              </motion.div>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </Navbar>
  );
};

export default Header;