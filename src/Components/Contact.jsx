import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const contactMethods = [
    {
      icon: <FaMapMarkerAlt size={24} />,
      title: "Our Location",
      info: "Lahore Pakistan"
    },
    {
      icon: <FaPhone size={24} />,
      title: "Phone Number",
      info: "+92 3064155248"
    },
    {
      icon: <FaEnvelope size={24} />,
      title: "Email Address",
      info: "ua34124@gmail.com"
    }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
// In Contact.jsx, update the handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    setError(null);
    const response = await axios.post('http://localhost:5000/api/contact', formData);
    
    if (response.data.success) {
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } else {
      setError(response.data.message || 'Failed to send message. Please try again later.');
    }
  } catch (err) {
    console.error('Contact form error:', err);
    
    if (err.response && err.response.data && err.response.data.message) {
      setError(err.response.data.message);
    } else if (err.response && err.response.status === 500) {
      setError('Server error. Please try again later.');
    } else if (err.request) {
      setError('Network error. Please check your connection and try again.');
    } else {
      setError('An unexpected error occurred. Please try again.');
    }
  }
};

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideInLeft = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8 } }
  };

  const slideInRight = {
    hidden: { x: 50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8 } }
  };

  return (
    <section className="py-5">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="fw-bold">Contact Us</h2>
          <p className="lead">We'd love to hear from you! Reach out with any questions or feedback.</p>
        </motion.div>
        <Row className="g-5">
          <Col lg={5}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={slideInLeft}
              viewport={{ once: true }}
            >
              <div className="contact-info bg-light p-4 rounded shadow-sm">
                <h3 className="mb-4">Get in Touch</h3>
                {contactMethods.map((method, index) => (
                  <div key={index} className="d-flex mb-4">
                    <div className="me-3 text-primary">{method.icon}</div>
                    <div>
                      <h5 className="mb-1">{method.title}</h5>
                      <p className="mb-0">{method.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                className="mt-4 p-4 bg-primary text-white rounded shadow-sm"
              >
                <h4 className="mb-3">Business Hours</h4>
                <p className="mb-1"><strong>Monday - Friday:</strong> 9:00 AM - 8:00 PM</p>
                <p className="mb-1"><strong>Saturday:</strong> 10:00 AM - 6:00 PM</p>
                <p className="mb-0"><strong>Sunday:</strong> 12:00 PM - 5:00 PM</p>
              </motion.div>
            </motion.div>
          </Col>
          <Col lg={7}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={slideInRight}
              viewport={{ once: true }}
            >
              {submitted ? (
                <Alert variant="success" className="text-center">
                  Thank you for contacting us! We will get back to you soon.
                </Alert>
              ) : (
                <Form className="p-4 bg-light rounded shadow-sm" onSubmit={handleSubmit}>
                  {error && <Alert variant="danger">{error}</Alert>}
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group controlId="formName">
                        <Form.Label>Your Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group controlId="formEmail">
                        <Form.Label>Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="formSubject">
                        <Form.Label>Subject</Form.Label>
                        <Form.Control
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="Enter subject"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <Form.Group controlId="formMessage">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={5}
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Enter your message"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={12}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button variant="primary" type="submit" className="w-100">
                          <FaPaperPlane className="me-2" /> Send Message
                        </Button>
                      </motion.div>
                    </Col>
                  </Row>
                </Form>
              )}
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Contact;