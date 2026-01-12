import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Carousel,
  Tab,
  Tabs,
  ListGroup,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FiShoppingCart,
  FiHeart,
  FiShare2,
  FiChevronLeft,
  FiStar,
  FiTruck,
  FiRefreshCw,
  FiShield
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../Css/ViewDetails.css'; // We'll create this CSS file later

const ViewDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(response.data.product);
        setLoading(false);
        
        // Set default selections
        if (response.data.product.colors?.length > 0) {
          setSelectedColor(response.data.product.colors[0]);
        }
        if (response.data.product.sizes?.length > 0) {
          setSelectedSize(response.data.product.sizes[0]);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex(
      item => item.productId === product._id && 
             item.color === selectedColor && 
             item.size === selectedSize
    );
  
    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      currentCart[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      currentCart.push({
        productId: product._id,
        product, // Store the full product details
        quantity,
        color: selectedColor,
        size: selectedSize
      });
    }
  
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(currentCart));
    
    // Navigate to cart page
    navigate('/cart');
  };

  const handleBuyNow = () => {
    const checkoutItem = {
      productId: product._id,
      product, // Include full product details
      quantity,
      color: selectedColor,
      size: selectedSize
    };
  
    // Save to checkoutItems in localStorage with consistent structure
    localStorage.setItem('checkoutItems', JSON.stringify([checkoutItem]));
    
    navigate('/checkout');
  };

  const incrementQuantity = () => {
    if (quantity < product.quantity) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading product details...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          <FiChevronLeft className="me-1" /> Go Back
        </Button>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container className="py-5">
        <Alert variant="warning">Product not found</Alert>
        <Button variant="outline-primary" onClick={() => navigate(-1)}>
          <FiChevronLeft className="me-1" /> Go Back
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Button 
        variant="outline-primary" 
        className="mb-4" 
        onClick={() => navigate(-1)}
      >
        <FiChevronLeft className="me-1" /> Back to Products
      </Button>

      <Row>
        {/* Product Images */}
        <Col lg={6} className="mb-4">
          <Card className="product-gallery-card">
            <div className="main-image-container">
              {product.images && product.images.length > 0 && (
                <img
                  src={`http://localhost:5000/${product.images[activeImage]}`}
                  alt={product.name}
                  className="main-product-image"
                />
              )}
              {product.discount > 0 && (
                <Badge pill bg="danger" className="discount-badge">
                  {product.discount}% OFF
                </Badge>
              )}
            </div>

            {product.images && product.images.length > 1 && (
              <div className="thumbnail-container">
                {product.images.map((image, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`thumbnail-item ${index === activeImage ? 'active' : ''}`}
                    onClick={() => setActiveImage(index)}
                  >
                    <img
                      src={`http://localhost:5000/${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      className="thumbnail-image"
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* Product Info */}
        <Col lg={6}>
          <Card className="product-info-card">
            <Card.Body>
              <h2 className="product-title">{product.name}</h2>
              
              <div className="product-meta mb-3">
                <div className="rating">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`star ${i < Math.floor(product.rating || 0) ? 'filled' : ''}`}
                    />
                  ))}
                  <span className="ms-2">({product.rating || 0})</span>
                </div>
                <div className="availability">
                  {product.quantity > 0 ? (
                    <span className="text-success">In Stock ({product.quantity} available)</span>
                  ) : (
                    <span className="text-danger">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="price-section mb-4">
                {product.discount > 0 ? (
                  <>
                    <span className="original-price">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="discounted-price">
                      ${(product.price - (product.price * product.discount / 100)).toFixed(2)}
                    </span>
                    <span className="discount-percent">
                      You save {product.discount}%
                    </span>
                  </>
                ) : (
                  <span className="current-price">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div className="product-description mb-4">
                <h5>Description</h5>
                <p>{product.description || 'No description available.'}</p>
              </div>

              {/* Color Selection */}
              {product.colors && product.colors.length > 0 && (
                <div className="color-selection mb-4">
                  <h5>Color</h5>
                  <div className="color-options">
                    {product.colors.map((color, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="size-selection mb-4">
                  <h5>Size</h5>
                  <div className="size-options">
                    {product.sizes.map((size, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`size-option ${selectedSize === size ? 'selected' : ''}`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="quantity-selector mb-4">
                <h5>Quantity</h5>
                <div className="quantity-control">
                  <Button
                    variant="outline-secondary"
                    onClick={decrementQuantity}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="quantity-value">{quantity}</span>
                  <Button
                    variant="outline-secondary"
                    onClick={incrementQuantity}
                    disabled={quantity >= product.quantity}
                  >
                    +
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <Button
                  variant="primary"
                  className="me-3"
                  onClick={handleBuyNow}
                  disabled={product.quantity <= 0}
                >
                  Buy Now
                </Button>
                <Button
                  variant="outline-primary"
                  className="me-3"
                  onClick={handleAddToCart}
                  disabled={product.quantity <= 0}
                >
                  <FiShoppingCart className="me-1" /> Add to Cart
                </Button>
                <Button variant="outline-secondary">
                  <FiHeart className="me-1" /> Wishlist
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="shipping-info mt-4">
                <div className="shipping-item">
                  <FiTruck className="me-2" />
                  <span>
                    <strong>Shipping:</strong> ${product.shippingPrice.toFixed(2)} - 
                    Estimated delivery in 3-5 business days
                  </span>
                </div>
                <div className="shipping-item">
                  <FiRefreshCw className="me-2" />
                  <span>
                    <strong>Returns:</strong> Free returns within {product.returnDays} days
                  </span>
                </div>
                <div className="shipping-item">
                  <FiShield className="me-2" />
                  <span>
                    <strong>Warranty:</strong> 1 year manufacturer warranty
                  </span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Product Tabs */}
      <Row className="mt-4">
        <Col>
          <Card>
            <Tabs defaultActiveKey="description" id="product-tabs">
              <Tab eventKey="description" title="Description">
                <div className="p-4">
                  <h4>Product Description</h4>
                  <p>{product.description || 'No detailed description available.'}</p>
                </div>
              </Tab>
              <Tab eventKey="specifications" title="Specifications">
                <div className="p-4">
                  <h4>Product Specifications</h4>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Category:</strong> {product.category?.name || 'N/A'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Available Colors:</strong> {product.colors?.join(', ') || 'N/A'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Available Sizes:</strong> {product.sizes?.join(', ') || 'N/A'}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Shipping Price:</strong> ${product.shippingPrice.toFixed(2)}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Return Policy:</strong> {product.returnDays} days return policy
                    </ListGroup.Item>
                  </ListGroup>
                </div>
              </Tab>
              <Tab eventKey="reviews" title="Reviews">
                <div className="p-4">
                  <h4>Customer Reviews</h4>
                  <p>No reviews yet. Be the first to review this product!</p>
                </div>
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ViewDetails;