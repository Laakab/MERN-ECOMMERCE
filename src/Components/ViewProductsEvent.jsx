import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge,
  Spinner,
  Alert
} from 'react-bootstrap';
import { 
  FiArrowLeft, 
  FiShoppingCart, 
  FiHeart, 
  FiEye,
  FiStar,
  FiShare2
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';

const ViewProductsEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [eventProducts, setEventProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  const cardHoverVariants = {
    hover: {
      y: -5,
      boxShadow: "0 10px 20px rgba(0,0,0,0.15)"
    }
  };

  // Fetch event products and event details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch event details
        const eventResponse = await axios.get(`http://localhost:5000/api/events/${eventId}`);
        setEventDetails(eventResponse.data.event);
        
        // Fetch event products
        const productsResponse = await axios.get(`http://localhost:5000/api/event-products?event=${eventId}`);
        setEventProducts(productsResponse.data.products);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load event products');
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // Format price with currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <Container className="py-5">
      {/* Back button and event title */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-4"
      >
        <Button 
          variant="outline-primary" 
          onClick={handleBack}
          className="d-flex align-items-center"
        >
          <FiArrowLeft className="me-2" /> Back to Events
        </Button>
      </motion.div>

      {/* Event header */}
      {eventDetails && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-5 text-center"
        >
          <h1 className="display-5 fw-bold mb-3">{eventDetails.eventName}</h1>
          <p className="lead">{eventDetails.eventDescription}</p>
          {eventDetails.images && eventDetails.images.length > 0 && (
            <motion.div 
              className="event-banner mb-4"
              whileHover={{ scale: 1.01 }}
            >
              <img 
                src={`http://localhost:5000/${eventDetails.images[0]}`} 
                alt={eventDetails.eventName}
                className="img-fluid rounded"
                style={{ maxHeight: '400px', objectFit: 'cover', width: '100%' }}
              />
            </motion.div>
          )}
          <div className="event-dates mb-4">
            <Badge bg="info" className="me-2 fs-6">
              From: {new Date(eventDetails.fromDate).toLocaleDateString()} at {eventDetails.fromTime}
            </Badge>
            <Badge bg="info" className="fs-6">
              To: {new Date(eventDetails.toDate).toLocaleDateString()} at {eventDetails.toTime}
            </Badge>
          </div>
        </motion.div>
      )}

      {/* Products section */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <h2 className="mb-4">Featured Products</h2>
        
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3">Loading products...</p>
          </div>
        ) : error ? (
          <Alert variant="danger">{error}</Alert>
        ) : eventProducts.length === 0 ? (
          <Alert variant="info">No products available for this event</Alert>
        ) : (
          <Row className="g-4">
            {eventProducts.map((product) => (
              <Col key={product._id} xl={3} lg={4} md={6}>
                <motion.div
                  variants={itemVariants}
                  whileHover="hover"
                >
                  <Card className="h-100 product-card">
                    <motion.div variants={cardHoverVariants}>
                      {/* Product image with badges */}
                      <div className="product-image-container position-relative">
                        {product.images && product.images.length > 0 ? (
                          <Card.Img 
                            variant="top" 
                            src={`http://localhost:5000/${product.images[0]}`}
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        ) : (
                          <div className="bg-light d-flex align-items-center justify-content-center" 
                            style={{ height: '200px' }}>
                            <span className="text-muted">No Image</span>
                          </div>
                        )}
                        
                        {/* Product actions */}
                        <div className="product-actions">
                          <Button variant="light" size="sm" className="rounded-circle shadow">
                            <FiHeart />
                          </Button>
                          <Button variant="light" size="sm" className="rounded-circle shadow">
                            <FiShoppingCart />
                          </Button>
                          <Button variant="light" size="sm" className="rounded-circle shadow">
                            <FiEye />
                          </Button>
                        </div>
                        
                        {/* Discount badge */}
                        {product.discount > 0 && (
                          <Badge bg="danger" className="product-discount-badge">
                            {product.discount}% OFF
                          </Badge>
                        )}
                      </div>
                      
                      {/* Product body */}
                      <Card.Body className="d-flex flex-column">
                        <Card.Title className="flex-grow-1">{product.name}</Card.Title>
                        <Card.Text className="text-muted mb-2">
                          {product.description || 'No description available'}
                        </Card.Text>
                        
                        {/* Price and rating */}
                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <div>
                            {product.discount > 0 ? (
                              <>
                                <span className="text-danger fw-bold me-2">
                                  {formatPrice(product.price * (1 - product.discount / 100))}
                                </span>
                                <span className="text-decoration-line-through text-muted">
                                  {formatPrice(product.price)}
                                </span>
                              </>
                            ) : (
                              <span className="fw-bold">{formatPrice(product.price)}</span>
                            )}
                          </div>
                          <div className="d-flex align-items-center">
                            <FiStar className="text-warning me-1" />
                            <span>4.5</span> {/* You might want to add rating to your schema */}
                          </div>
                        </div>
                      </Card.Body>
                      
                      {/* Product footer */}
                      <Card.Footer className="bg-white border-0">
                        <div className="d-grid gap-2">
                          <Button variant="primary" size="sm">
                            Add to Cart
                          </Button>
                          <Button variant="outline-secondary" size="sm">
                            <FiShare2 className="me-1" /> Share
                          </Button>
                        </div>
                      </Card.Footer>
                    </motion.div>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        )}
      </motion.div>
    </Container>
  );
};

export default ViewProductsEvent;