import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaSignInAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../Css/Login.css';
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    captcha: ''
  });
  const [captchaText, setCaptchaText] = useState(generateCaptcha());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function generateCaptcha() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     if (formData.captcha !== captchaText) {
//       setError('Invalid captcha');
//       setLoading(false);
//       setCaptchaText(generateCaptcha());
//       return;
//     }

//     try {
//       const response = await axios.post('http://localhost:5000/api/login', {
//         email: formData.email,
//         password: formData.password
//       });
// // Store user data in localStorage
// localStorage.setItem('user', JSON.stringify(response.data.user));
//       switch (response.data.user.role) {
//         case 'admin':
//           navigate('/admin');
//           break;
//         case 'customer':
//           navigate('/customer');
//           break;
//         case 'shop':
//           navigate('/store');
//           break;
//         case 'deliver':
//           navigate('/deliver');
//           break;
//         default:
//           navigate('/');
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//       setLoading(false);
//       setCaptchaText(generateCaptcha());
//     }
//   };
 // Update the handleSubmit function in Login.jsx
 const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  if (formData.captcha !== captchaText) {
    setError('Invalid captcha');
    setLoading(false);
    setCaptchaText(generateCaptcha());
    return;
  }

  try {
    // Only check signups collection for login
    const response = await axios.post('http://localhost:5000/api/login', {
      email: formData.email,
      password: formData.password
    });

    // Store user data in localStorage
    localStorage.setItem('user', JSON.stringify(response.data.user));
    
    // Redirect based on role
    switch (response.data.user.role) {
      case 'admin':
        navigate('/admin');
        break;
      case 'customer':
        navigate('/customer');
        break;
      case 'shop':
        navigate('/store');
        break;
      case 'deliver':
        navigate('/deliver');
        break;
      default:
        navigate('/');
    }
  } catch (err) {
    setError(err.response?.data?.message || 'Login failed');
    setLoading(false);
    setCaptchaText(generateCaptcha());
  }
};
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="login-page bg-gradient"
    >
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-100"
          style={{ maxWidth: '450px' }}
        >
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex justify-content-center">
                <div className="text-center">
                  <FaSignInAlt className="fs-3 mb-2" />
                  <h3 className="mb-0">Welcome Back</h3>
                  <small className="opacity-75">Please login to your account</small>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-4">
              {error && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <Alert variant="danger" className="mb-4">
                    {error}
                  </Alert>
                </motion.div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaUser className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="py-2"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaLock className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="py-2"
                      required
                    />
                    <Button
                      variant="light"
                      onClick={togglePasswordVisibility}
                      className="border-start-0"
                    >
                      {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium">
                    Captcha: <span className="text-primary">{captchaText}</span>
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light">
                      <FaShieldAlt className="text-muted" />
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      name="captcha"
                      value={formData.captcha}
                      onChange={handleChange}
                      placeholder="Enter the captcha"
                      className="py-2"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2 fw-medium"
                    disabled={loading}
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
                        Authenticating...
                      </>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </motion.div>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Forgot password?
                    <a href="/forgot-password">Click here</a>
                  </small>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default Login;