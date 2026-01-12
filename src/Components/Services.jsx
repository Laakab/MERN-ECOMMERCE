import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaShippingFast, FaMoneyBillWave, FaHeadset, FaUndo } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Services = () => {
  const services = [
    {
      icon: <FaShippingFast size={40} />,
      title: "Fast Delivery",
      description: "Get your products delivered within 2-3 business days"
    },
    {
      icon: <FaMoneyBillWave size={40} />,
      title: "Money Back Guarantee",
      description: "30-day money back guarantee on all products"
    },
    {
      icon: <FaHeadset size={40} />,
      title: "24/7 Support",
      description: "Our customer support team is available round the clock"
    },
    {
      icon: <FaUndo size={40} />,
      title: "Easy Returns",
      description: "Simple and hassle-free return process"
    }
  ];

  const cardVariants = {
    offscreen: {
      y: 50,
      opacity: 0
    },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8
      }
    }
  };

  return (
    <section className="py-5 bg-light">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="text-center mb-5 fw-bold">Our Services</h2>
          <p className="text-center mb-5 lead">We provide the best services to ensure your shopping experience is seamless</p>
        </motion.div>
        
        <Row className="g-4">
          {services.map((service, index) => (
            <Col md={6} lg={3} key={index}>
              <motion.div
                initial="offscreen"
                whileInView="onscreen"
                viewport={{ once: true, amount: 0.8 }}
                variants={cardVariants}
              >
                <Card className="h-100 border-0 shadow-sm text-center p-4 service-card">
                  <Card.Body>
                    <div className="text-primary mb-3">{service.icon}</div>
                    <Card.Title className="mb-3">{service.title}</Card.Title>
                    <Card.Text>{service.description}</Card.Text>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Services;