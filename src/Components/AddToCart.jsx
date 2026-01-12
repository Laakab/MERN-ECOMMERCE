import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Table,
  Badge,
  ListGroup,
  Form,
  Alert,
  Spinner
} from 'react-bootstrap';
import {
  FiShoppingCart,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
  FiPlus,
  FiMinus
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import '../Css/AddToCart.css'
const AddToCart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch cart items from localStorage or API
  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        // In a real app, you might fetch from an API
        const savedCart = JSON.parse(localStorage.getItem('cart')) || [];

        // If we have product IDs but not full details, fetch product details
        if (savedCart.length > 0 && !savedCart[0].product) {
          const productIds = savedCart.map(item => item.productId);
          const { data } = await axios.post('http://localhost:5000/api/products/batch', {
            ids: productIds
          });

          const updatedCart = savedCart.map(item => {
            const product = data.products.find(p => p._id === item.productId);
            return { ...item, product };
          });

          setCartItems(updatedCart);
          localStorage.setItem('cart', JSON.stringify(updatedCart));
        } else {
          setCartItems(savedCart);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching cart items:', err);
        setError('Failed to load cart items');
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  // Update quantity for a cart item
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedCart = cartItems.map(item => {
      if (item.productId === productId) {
        // Ensure we don't exceed available quantity
        const quantity = Math.min(newQuantity, item.product.quantity);
        return { ...item, quantity };
      }
      return item;
    });

    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Remove item from cart
  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter(item => item.productId !== productId);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = item.product.price * (1 - (item.product.discount / 100));
      return sum + (price * item.quantity);
    }, 0);

    const shipping = cartItems.reduce((sum, item) => {
      return sum + item.product.shippingPrice;
    }, 0);

    const total = subtotal + shipping;

    return { subtotal, shipping, total };
  };

  const { subtotal, shipping, total } = calculateTotals();

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-3">Loading your cart...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="outline-primary" onClick={() => navigate('/customer')}>
          <FiChevronLeft className="me-1" /> Continue Shopping
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
        <FiChevronLeft className="me-1" /> Back
      </Button>

      <h2 className="mb-4">Your Shopping Cart</h2>

      {cartItems.length === 0 ? (
        <Card className="text-center py-5">
          <Card.Body>
            <h4>Your cart is empty</h4>
            <p className="text-muted mb-4">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button variant="primary" onClick={() => navigate('/customer')}>
              Continue Shopping
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {/* Cart Items Column */}
          <Col lg={8} className="mb-4">
            <Card>
              <Card.Body>
                <Table responsive hover className="cart-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Price</th>
                      <th>Quantity</th>
                      <th>Total</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => (
                      <motion.tr
                        key={item.productId}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        layout
                      >
                        <td>
                          <div className="d-flex align-items-center">
                            <img
                              src={`http://localhost:5000/${item.product.images[0]}`}
                              alt={item.product.name}
                              className="cart-product-image me-3"
                            />
                            <div>
                              <h6 className="mb-1">{item.product.name}</h6>
                              <small className="text-muted">
                                {item.color && `Color: ${item.color}`}
                                {item.color && item.size && ' • '}
                                {item.size && `Size: ${item.size}`}
                              </small>
                              {item.product.discount > 0 && (
                                <Badge pill bg="danger" className="ms-2">
                                  {item.product.discount}% OFF
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td>
                          ${(item.product.price * (1 - (item.product.discount / 100))).toFixed(2)}
                          {item.product.discount > 0 && (
                            <div className="text-muted text-decoration-line-through small">
                              ${item.product.price.toFixed(2)}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FiMinus />
                            </Button>
                            <Form.Control
                              type="number"
                              min="1"
                              max={item.product.quantity}
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value))}
                              className="mx-2 text-center"
                              style={{ width: '60px' }}
                            />
                            <Button
                              variant="outline-secondary"
                              size="sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              disabled={item.quantity >= item.product.quantity}
                            >
                              <FiPlus />
                            </Button>
                          </div>
                        </td>
                        <td>
                          ${(item.product.price * (1 - (item.product.discount / 100)) * item.quantity).toFixed(2)}
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeFromCart(item.productId)}
                          >
                            <FiTrash2 />
                          </Button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Col>

          {/* Order Summary Column */}
          <Col lg={4}>
            <Card className="sticky-top" style={{ top: '20px' }}>
              <Card.Body>
                <h5 className="mb-4">Order Summary</h5>

                <ListGroup variant="flush">
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Shipping:</span>
                    <span>${shipping.toFixed(2)}</span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between">
                    <span>Return Policy:</span>
                    <span>
                      {Math.min(...cartItems.map(item => item.product.returnDays))} days
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item className="d-flex justify-content-between fw-bold">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </ListGroup.Item>
                </ListGroup>

                
                <Button
                  variant="primary"
                  size="lg"
                  className="w-100 mt-3"
                  onClick={() => {
                    localStorage.setItem('checkoutItems', JSON.stringify(cartItems));
                    navigate('/checkout');
                  }}
                >
                  Proceed to Checkout
                </Button>

                <Button
                  variant="outline-primary"
                  size="lg"
                  className="w-100 mt-2"
                  onClick={() => navigate('/customer')}
                >
                  Continue Shopping
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default AddToCart;