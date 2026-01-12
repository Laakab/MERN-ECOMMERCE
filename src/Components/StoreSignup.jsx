import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Spinner, InputGroup, Alert } from 'react-bootstrap';
import { FaUserPlus, FaLock, FaEnvelope, FaUser, FaPhone, FaMapMarkerAlt, FaCheck, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Css/Signup.css';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: 'customer',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNo: '',
    address: '',
    adminEmail: '',
    adminPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminVerified, setAdminVerified] = useState(false);
  const [adminVerifying, setAdminVerifying] = useState(false);
  const [adminError, setAdminError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);
  const toggleAdminPasswordVisibility = () => setShowAdminPassword(!showAdminPassword);

  const validateAdmin = async () => {
    setAdminVerifying(true);
    setAdminError('');
    
    try {
      const response = await axios.post('http://localhost:5000/api/admin/verify', {
        password: formData.adminPassword
      });

      if (response.data.success) {
        setAdminVerified(true);
      } else {
        setAdminError(response.data.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setAdminError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setAdminVerifying(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.username) newErrors.username = 'Username is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    if (!formData.phoneNo) newErrors.phoneNo = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.password && formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const userData = {
        role: formData.role,
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phoneNo: formData.phoneNo,
        address: formData.address,
        createdAt: new Date().toISOString()
      };

      const response = await axios.post('http://localhost:5000/api/signup', userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({
        ...errors,
        server: err.response?.data?.message || 'Signup failed. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkAdminPassword = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/has-password');
        if (!response.data.hasPassword && formData.role === 'admin') {
          setAdminError('No admin password set. Contact system administrator.');
        }
      } catch (err) {
        console.error('Could not check admin password:', err);
      }
    };

    if (formData.role === 'admin') {
      checkAdminPassword();
    }
  }, [formData.role]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="signup-page"
    >
      <Container className="py-5">
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6}>
            <motion.div
              initial={{ y: -50 }}
              animate={{ y: 0 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Card className="signup-card shadow-lg border-0">
                <Card.Header className="signup-card-header text-center py-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <h2 className="mb-0 text-white">
                      <FaUserPlus className="me-2" />
                      Create Your Account
                    </h2>
                  </motion.div>
                </Card.Header>
                
                <Card.Body className="p-4 p-md-5">
                  {success ? (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="text-center py-4"
                    >
                      <div className="success-icon mb-3">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 500 }}
                        >
                          <FaCheck size={48} color="#28a745" />
                        </motion.div>
                      </div>
                      <h4 className="text-success">Account Created Successfully!</h4>
                      <p className="text-muted">Redirecting to login page...</p>
                    </motion.div>
                  ) : (
                    <Form onSubmit={handleSubmit}>
                      {/* Role Selection */}
                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Register As</Form.Label>
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Form.Select
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className="role-select form-control-lg"
                            disabled={adminVerified}
                          >
                            <option value="shop">Shop Owner</option>
                          </Form.Select>
                        </motion.div>
                      </Form.Group>

                      {/* Admin Verification */}
                      {formData.role === 'admin' && !adminVerified && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="admin-verification mb-4 p-3 bg-light rounded"
                        >
                          <h5 className="mb-3 text-center">Admin Verification</h5>
                          <Row>
                            <Col md={12}>
                              <Form.Group className="mb-3">
                                <Form.Label>Admin Password</Form.Label>
                                <InputGroup>
                                  <InputGroup.Text className="bg-white">
                                    <FaLock className="text-primary" />
                                  </InputGroup.Text>
                                  <Form.Control
                                    type={showAdminPassword ? "text" : "password"}
                                    name="adminPassword"
                                    value={formData.adminPassword}
                                    onChange={handleChange}
                                    placeholder="Enter admin password"
                                    className="py-2"
                                  />
                                  <Button
                                    variant="outline-secondary"
                                    onClick={toggleAdminPasswordVisibility}
                                    className="bg-white"
                                  >
                                    {showAdminPassword ? <FaEyeSlash /> : <FaEye />}
                                  </Button>
                                </InputGroup>
                              </Form.Group>
                            </Col>
                          </Row>
                          
                          {adminError && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="alert alert-danger mb-3"
                            >
                              <FaTimes className="me-2" />
                              {adminError}
                            </motion.div>
                          )}
                          
                          <div className="text-center">
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Button
                                variant="primary"
                                onClick={validateAdmin}
                                disabled={adminVerifying}
                                className="px-4"
                              >
                                {adminVerifying ? (
                                  <>
                                    <Spinner
                                      as="span"
                                      animation="border"
                                      size="sm"
                                      role="status"
                                      aria-hidden="true"
                                      className="me-2"
                                    />
                                    Verifying...
                                  </>
                                ) : (
                                  'Verify Admin'
                                )}
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}

                      {formData.role === 'admin' && adminVerified && (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          className="alert alert-success mb-4"
                        >
                          <FaCheck className="me-2" />
                          Admin credentials verified. Please complete your registration.
                        </motion.div>
                      )}

                      {/* Main Form */}
                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">First Name</Form.Label>
                            <InputGroup>
                              <InputGroup.Text className="bg-white">
                                <FaUser className="text-primary" />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                isInvalid={!!errors.firstName}
                                placeholder="Enter first name"
                                className="py-2"
                              />
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.firstName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Last Name</Form.Label>
                            <InputGroup>
                              <InputGroup.Text className="bg-white">
                                <FaUser className="text-primary" />
                              </InputGroup.Text>
                              <Form.Control
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                isInvalid={!!errors.lastName}
                                placeholder="Enter last name"
                                className="py-2"
                              />
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.lastName}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Username</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white">
                            <FaUser className="text-primary" />
                          </InputGroup.Text>
                          <Form.Control
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            isInvalid={!!errors.username}
                            placeholder="Choose a username"
                            className="py-2"
                          />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.username}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Email</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white">
                            <FaEnvelope className="text-primary" />
                          </InputGroup.Text>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            isInvalid={!!errors.email}
                            placeholder="Enter your email"
                            className="py-2"
                          />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.email}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Password</Form.Label>
                            <InputGroup>
                              <InputGroup.Text className="bg-white">
                                <FaLock className="text-primary" />
                              </InputGroup.Text>
                              <Form.Control
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                isInvalid={!!errors.password}
                                placeholder="Create password"
                                className="py-2"
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={togglePasswordVisibility}
                                className="bg-white"
                              >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.password}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Confirm Password</Form.Label>
                            <InputGroup>
                              <InputGroup.Text className="bg-white">
                                <FaLock className="text-primary" />
                              </InputGroup.Text>
                              <Form.Control
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                isInvalid={!!errors.confirmPassword}
                                placeholder="Confirm password"
                                className="py-2"
                              />
                              <Button
                                variant="outline-secondary"
                                onClick={toggleConfirmPasswordVisibility}
                                className="bg-white"
                              >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                              </Button>
                            </InputGroup>
                            <Form.Control.Feedback type="invalid">
                              {errors.confirmPassword}
                            </Form.Control.Feedback>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Phone Number</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white">
                            <FaPhone className="text-primary" />
                          </InputGroup.Text>
                          <Form.Control
                            type="tel"
                            name="phoneNo"
                            value={formData.phoneNo}
                            onChange={handleChange}
                            isInvalid={!!errors.phoneNo}
                            placeholder="Enter phone number"
                            className="py-2"
                          />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.phoneNo}
                        </Form.Control.Feedback>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="fw-semibold">Address</Form.Label>
                        <InputGroup>
                          <InputGroup.Text className="bg-white align-items-start pt-2">
                            <FaMapMarkerAlt className="text-primary" />
                          </InputGroup.Text>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            isInvalid={!!errors.address}
                            placeholder="Enter your address"
                            className="py-2"
                          />
                        </InputGroup>
                        <Form.Control.Feedback type="invalid">
                          {errors.address}
                        </Form.Control.Feedback>
                      </Form.Group>

                      {errors.server && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="alert alert-danger mb-4"
                        >
                          <FaTimes className="me-2" />
                          {errors.server}
                        </motion.div>
                      )}

                      <div className="d-grid mb-3">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button
                            variant="primary"
                            type="submit"
                            size="lg"
                            className="py-3 fw-semibold"
                            disabled={loading || (formData.role === 'admin' && !adminVerified)}
                          >
                            {loading ? (
                              <>
                                <Spinner
                                  as="span"
                                  animation="border"
                                  size="sm"
                                  role="status"
                                  aria-hidden="true"
                                  className="me-2"
                                />
                                Creating Account...
                              </>
                            ) : (
                              'Sign Up Now'
                            )}
                          </Button>
                        </motion.div>
                      </div>

                      <div className="text-center mt-4">
                        <p className="mb-0 text-muted">
                          Already have an account?{' '}
                          <motion.span
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Link to="/login" className="text-primary fw-semibold text-decoration-none">
                              Login here
                            </Link>
                          </motion.span>
                        </p>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default Signup;