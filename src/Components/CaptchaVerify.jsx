import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Form, Button, Card, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const CaptchaVerify = () => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const inputsRef = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    } else {
      navigate('/forgot-password');
    }
  }, [location, navigate]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleChange = (index, value) => {
    if (!/^[0-9a-zA-Z]*$/.test(value)) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto-focus to next input
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
    
    // Auto-submit if all fields are filled
    if (newCode.every(digit => digit !== '') && index === 5) {
      handleVerify();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^[0-9a-zA-Z]+$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode([...newCode, ...Array(6 - newCode.length).fill('')]);
      
      // Focus on the next empty field or the last field
      const nextIndex = Math.min(pastedData.length, 5);
      inputsRef.current[nextIndex].focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    if (verificationCode.length !== 6) {
      setError('Please enter the full 6-digit code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/verify-reset-code', {
        email,
        resetCode: verificationCode
      });

      if (response.data.success) {
        setSuccess('Code verified successfully');
        setTimeout(() => {
          navigate('/update-password', { state: { email, resetToken: response.data.resetToken } });
        }, 1000);
      } else {
        setError('Invalid verification code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };
  const resendCode = async () => {
    setLoading(true);
    setError('');
    setCode(['', '', '', '', '', '']);
    setTimeLeft(600);
  
    try {
      const response = await axios.post('http://localhost:5000/api/resend-reset-code', { email });
      
      if (response.data.success) {
        setSuccess('A new code has been sent to your email');
      } else {
        setError('Failed to resend code. Please try again.');
      }
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="captcha-verify-page bg-gradient"
    >
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="w-100"
          style={{ maxWidth: '500px' }}
        >
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white py-3">
              <div className="d-flex justify-content-center">
                <div className="text-center">
                  <FaShieldAlt className="fs-3 mb-2" />
                  <h3 className="mb-0">Enter Verification Code</h3>
                  <small className="opacity-75">Check your email for the code</small>
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
                    <FaCheckCircle className="me-2" />
                    {success}
                  </Alert>
                </motion.div>
              )}

              <div className="text-center mb-4">
                <p>Enter the 6-digit code sent to {email}</p>
                <p className={timeLeft < 60 ? 'text-danger' : ''}>
                  Code expires in: {formatTime(timeLeft)}
                </p>
              </div>

              <Form.Group className="mb-4">
                <Row className="justify-content-center">
                  {code.map((digit, index) => (
                    <Col xs="auto" key={index} className="px-1">
                      <Form.Control
                        ref={(el) => (inputsRef.current[index] = el)}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onPaste={handlePaste}
                        className="text-center verification-input"
                        disabled={loading}
                      />
                    </Col>
                  ))}
                </Row>
              </Form.Group>

              <Button
                variant="primary"
                onClick={handleVerify}
                className="w-100 py-2 fw-medium mb-3"
                disabled={loading || code.some(digit => digit === '')}
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
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center">
                <small className="text-muted">
                  Didn't receive the code?{' '}
                  <Button
                    variant="link"
                    onClick={resendCode}
                    disabled={loading || timeLeft > 540} // Can resend after 1 minute
                    className="p-0"
                  >
                    Resend
                  </Button>
                </small>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </motion.div>
  );
};

export default CaptchaVerify;