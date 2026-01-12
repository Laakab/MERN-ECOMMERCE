import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, InputGroup } from 'react-bootstrap';
import { FaStar, FaRegStar, FaHeart, FaRegHeart, FaSearch, FaShoppingCart } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Product = () => {
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Wireless Headphones",
      price: 99.99,
      rating: 4,
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFavorite: false,
      isNew: true
    },
    {
      id: 2,
      name: "Smart Watch",
      price: 199.99,
      rating: 5,
      image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFavorite: true,
      isNew: false
    },
    {
      id: 3,
      name: "Bluetooth Speaker",
      price: 79.99,
      rating: 3,
      image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFavorite: false,
      isNew: true
    },
    {
      id: 4,
      name: "Laptop Backpack",
      price: 49.99,
      rating: 4,
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFavorite: false,
      isNew: false
    },
    {
      id: 5,
      name: "Wireless Charger",
      price: 29.99,
      rating: 4,
      image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFavorite: false,
      isNew: false
    },
    {
      id: 6,
      name: "Fitness Tracker",
      price: 89.99,
      rating: 5,
      image: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80",
      isFavorite: true,
      isNew: true
    }
  ]);

  const toggleFavorite = (productId) => {
    setProducts(products.map(product => 
      product.id === productId 
        ? { ...product, isFavorite: !product.isFavorite } 
        : product
    ));
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating 
          ? <FaStar key={i} className="text-warning" /> 
          : <FaRegStar key={i} className="text-warning" />
      );
    }
    return stars;
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } }
  };

  const cardHover = {
    hover: { 
      y: -10,
      boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
      transition: { duration: 0.3 }
    }
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
          <h2 className="fw-bold">Our Products</h2>
          <p className="lead">Discover our wide range of high-quality products</p>
        </motion.div>
        
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-5"
        >
          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <InputGroup>
                <Form.Control 
                  type="text" 
                  placeholder="Search products..." 
                  className="border-end-0"
                />
                <Button variant="primary">
                  <FaSearch />
                </Button>
              </InputGroup>
            </Col>
          </Row>
        </motion.div>
        
        <Row className="g-4">
          {products.map((product) => (
            <Col md={6} lg={4} key={product.id}>
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover="hover"
                // variants={cardHover}
              >
                <Card className="h-100 border-0 shadow-sm product-card">
                  <div className="product-badges">
                    {product.isNew && (
                      <Badge bg="success" className="me-1">New</Badge>
                    )}
                    <Button 
                      variant="link" 
                      className="p-0 favorite-btn"
                      onClick={() => toggleFavorite(product.id)}
                    >
                      {product.isFavorite ? (
                        <FaHeart className="text-danger" />
                      ) : (
                        <FaRegHeart />
                      )}
                    </Button>
                  </div>
                  <div className="product-image-container">
                    <Card.Img 
                      variant="top" 
                      src={product.image} 
                      className="product-image"
                    />
                  </div>
                  <Card.Body className="text-center">
                    <div className="mb-2">
                      {renderStars(product.rating)}
                    </div>
                    <Card.Title>{product.name}</Card.Title>
                    <Card.Text className="h5 text-primary fw-bold">
                      ${product.price.toFixed(2)}
                    </Card.Text>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button variant="primary" className="mt-3">
                        <FaShoppingCart className="me-2" /> Add to Cart
                      </Button>
                    </motion.div>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center mt-5"
        >
          <Button variant="outline-primary" size="lg">View All Products</Button>
        </motion.div>
      </Container>
    </section>
  );
};

export default Product;