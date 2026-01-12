import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FaStore, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../Css/Shops.css';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch stores from the backend
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stores');
        setShops(response.data.stores);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stores:', err);
        setError('Failed to load stores. Please try again later.');
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // In Shops.jsx
  const handleShopClick = (store) => {
    // Navigate to the shop page with the store's userId
    navigate(`/shop/${store.userId._id || store.userId}`);
  };

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  // Helper function to get location text
  const getLocationText = (location) => {
    if (!location) return 'Location not specified';

    const parts = [];
    if (location.city) parts.push(location.city);
    if (location.country) parts.push(location.country);

    return parts.length > 0 ? parts.join(', ') : 'Location not specified';
  };

  if (loading) {
    return (
      <div className="shops-container text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shops-container text-center py-5">
        <p className="text-danger">{error}</p>
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="shops-container text-center py-5">
        <p>No stores found.</p>
      </div>
    );
  }

  return (
    <div className="shops-container">
      <Container className="py-5">
        <h2 className="text-center mb-5 shops-title">Our Featured Shops</h2>
        <Row>
          {shops.map((shop, index) => (
            <Col key={shop._id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <motion.div
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                
                <Card
                  className="shop-card h-100"
                  onClick={() => handleShopClick(shop)}
                  data-userid={shop.userId._id || shop.userId} // Add this line
                >
                  {shop.storeLogo ? (
                    <Card.Img
                      variant="top"
                      src={`http://localhost:5000/${shop.storeLogo}`}
                      className="shop-image"
                      alt={shop.storeName}
                    />
                  ) : (
                    <div className="shop-image-placeholder">
                      <FaStore size={48} />
                    </div>
                  )}
                  <Card.Body>
                    <Card.Title className="d-flex align-items-center">
                      <FaStore className="me-2" />
                      {shop.storeName || 'Unnamed Store'}
                    </Card.Title>
                    <Card.Text className="d-flex align-items-center">
                      <FaMapMarkerAlt className="me-2" />
                      {getLocationText(shop.location)}
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer className="text-end">
                    <span className="visit-link">
                      Visit Shop <FaArrowRight className="ms-2" />
                    </span>
                  </Card.Footer>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default Shops;