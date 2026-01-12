// ForgotPassword.jsx - UPDATED
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const EmailVerify = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post('http://localhost:5000/api/check-email', { email });
      
      if (response.data.success) {
        if (response.data.exists) {
          setSuccess('A verification code has been sent to your email');
          setTimeout(() => {
            navigate('/captcha-verify', { state: { email } });
          }, 2000);
        } else {
          // Show generic message for security
          setSuccess('If this email exists, a reset code has been sent');
        }
      } else {
        setError(response.data.message || 'Failed to send reset code');
      }
    } catch (err) {
      console.error('Error:', err);
      // Show generic message for security
      setSuccess('If this email exists, a reset code has been sent');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="email-verify-page bg-gradient"
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
                  <FaShieldAlt className="fs-3 mb-2" />
                  <h3 className="mb-0">Verify Your Email</h3>
                  <small className="opacity-75">Enter your email to receive a reset code</small>
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

              {success && (
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  <Alert variant="success" className="mb-4">
                    {success}
                  </Alert>
                </motion.div>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-4">
                  <Form.Label>Email Address</Form.Label>
                  <div className="input-group">
                    <span className="input-group-text bg-light">
                      <FaEnvelope className="text-muted" />
                    </span>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="py-2"
                      required
                    />
                  </div>
                </Form.Group>

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
                      Sending Code...
                    </>
                  ) : (
                    'Send Verification Code'
                  )}
                </Button>

                <div className="text-center mt-3">
                  <small className="text-muted">
                    Remember your password? <a href="/login">Login here</a>
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

export default EmailVerify;