import React, { useState, useEffect } from 'react';
import { Container, Navbar, Nav, Form, FormControl, Offcanvas, Dropdown } from 'react-bootstrap';
import { FaUser, FaUserPlus, FaShoppingCart, FaSearch, FaBars, FaSignOutAlt } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import '../Css/Header.css';

const Header = ({ user }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showOffcanvas, setShowOffcanvas] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  // Get user data from localStorage
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(userData);
  }, []);

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch) {
      setTimeout(() => {
        document.getElementById('search-input')?.focus();
      }, 100);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
    window.location.reload(); // Refresh to update the UI
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shops', path: '/shops' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'Team', path: '/team' },
  ];

  return (
    <Navbar expand="lg" fixed="top" className="main-navbar">
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

        {/* Right side - User info and actions */}
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


          {/* Show user dropdown if logged in, otherwise show login/signup */}
          {currentUser ? (
            <Dropdown>
              <Dropdown.Toggle as={motion.div} className="user-dropdown-toggle">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="d-flex align-items-center"
                >
                  <div className="user-avatar-circle me-2">
                    <FaUser className="user-avatar-icon" />
                  </div>
                  <span className="user-name">{currentUser.firstName || currentUser.username}</span>
                </motion.div>
              </Dropdown.Toggle>

              <Dropdown.Menu className="user-dropdown-menu">
                <Dropdown.Item as={Link} to="/customer">
                  My Account
                </Dropdown.Item>
                <Dropdown.Item onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" />
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <></>
          )}
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
            {currentUser && (
              <>
                <motion.div
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Nav.Link
                    as={Link}
                    to="/customer"
                    onClick={() => setShowOffcanvas(false)}
                    className="mobile-nav-link"
                  >
                    My Account
                  </Nav.Link>
                </motion.div>
                <motion.div
                  whileHover={{ x: 10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Nav.Link
                    onClick={() => {
                      handleLogout();
                      setShowOffcanvas(false);
                    }}
                    className="mobile-nav-link"
                  >
                    Logout
                  </Nav.Link>
                </motion.div>
              </>
            )}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </Navbar>
  );
};

export default Header;