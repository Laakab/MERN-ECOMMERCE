import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FaStore, FaUsers, FaAward, FaLeaf } from 'react-icons/fa';
import { motion } from 'framer-motion';

const About = () => {
  const stats = [
    { icon: <FaStore size={30} />, value: "1000+", label: "Products" },
    { icon: <FaUsers size={30} />, value: "500k+", label: "Customers" },
    { icon: <FaAward size={30} />, value: "50+", label: "Awards" },
    { icon: <FaLeaf size={30} />, value: "100%", label: "Eco-Friendly" }
  ];

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.8 } }
  };

  const slideIn = {
    hidden: { x: -50, opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.8 } }
  };

  return (
    <section className="py-5">
      <Container>
        <Row className="align-items-center">
          <Col lg={6} className="mb-5 mb-lg-0">
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={slideIn}
              viewport={{ once: true }}
            >
              <h2 className="fw-bold mb-4">About ShopHub</h2>
              <p className="lead mb-4">
                ShopHub is a premier e-commerce platform dedicated to bringing you the best products 
                with exceptional service since 2015.
              </p>
              <p className="mb-4">
                Our mission is to provide a seamless shopping experience with a wide range of products, 
                competitive prices, and fast delivery. We believe in quality, sustainability, and 
                customer satisfaction above all else.
              </p>
              <Button variant="primary" size="lg" className="mt-3">
                Learn More
              </Button>
            </motion.div>
          </Col>
          
          <Col lg={6}>
            <motion.div
              initial="hidden"
              whileInView="visible"
              variants={fadeIn}
              viewport={{ once: true }}
              className="position-relative"
            >
              <div className="about-image p-4">
                <img 
                  src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80" 
                  alt="About ShopHub" 
                  className="img-fluid rounded shadow"
                />
              </div>
              
              <Row className="g-4 mt-4">
                {stats.map((stat, index) => (
                  <Col xs={6} key={index}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="p-3 bg-light rounded text-center shadow-sm"
                    >
                      <div className="text-primary mb-2">{stat.icon}</div>
                      <h3 className="mb-1">{stat.value}</h3>
                      <p className="mb-0 text-muted">{stat.label}</p>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </motion.div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;