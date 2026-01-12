import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Form,
    Alert,
    Spinner,
    ListGroup,
    Modal
} from 'react-bootstrap';
import {
    FiShoppingCart,
    FiChevronLeft,
    FiCreditCard,
    FiTruck,
    FiCheck,
    FiMapPin
} from 'react-icons/fi';
import { motion } from 'framer-motion';

const Checkout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        shippingMethod: 'standard',
        paymentMethod: 'credit-card',
        cardNumber: '',
        cardName: '',
        cardExpiry: '',
        cardCvv: ''
    });
    const [formErrors, setFormErrors] = useState({});
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState(null);
    const navigate = useNavigate();

    // Fetch cart items from localStorage
    // In Checkout.jsx, update the useEffect hook to make fetchCartItems async
    useEffect(() => {
        const fetchCartItems = async () => {
            try {
                // Try checkoutItems first, then fall back to cart
                let savedCart = JSON.parse(localStorage.getItem('checkoutItems')) ||
                    JSON.parse(localStorage.getItem('cart')) || [];

                // Ensure each item has product details
                const itemsWithProducts = await Promise.all(savedCart.map(async (item) => {
                    if (item.product) return item;

                    try {
                        const { data } = await axios.get(`http://localhost:5000/api/products/${item.id}`);
                        return {
                            ...item,
                            product: data.product
                        };
                    } catch (err) {
                        console.error('Error fetching product details:', err);
                        return item; // Return item even if product fetch fails
                    }
                }));

                setCartItems(itemsWithProducts);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching cart items:', err);
                setError('Failed to load cart items');
                setLoading(false);
            }
        };

        fetchCartItems();
    }, []);

    // Calculate cart totals
    const calculateTotals = () => {
        const subtotal = cartItems.reduce((sum, item) => {
            const price = (item.product?.price || item.price || 0) * (1 - ((item.product?.discount || 0) / 100));
            const quantity = item.quantity || 1;
            return sum + (price * quantity);
        }, 0);

        const shipping = formData.shippingMethod === 'express' ? 15 : 5;
        const tax = subtotal * 0.1; // 10% tax
        const total = subtotal + shipping + tax;

        return {
            subtotal: isNaN(subtotal) ? 0 : subtotal,
            shipping: isNaN(shipping) ? 0 : shipping,
            tax: isNaN(tax) ? 0 : tax,
            total: isNaN(total) ? 0 : total
        };
    };

    const { subtotal, shipping, tax, total } = calculateTotals();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });

        // Clear error when field is edited
        if (formErrors[name]) {
            setFormErrors({
                ...formErrors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const errors = {};
        let isValid = true;

        // Shipping info validation
        if (!formData.firstName.trim()) {
            errors.firstName = 'First name is required';
            isValid = false;
        }
        if (!formData.lastName.trim()) {
            errors.lastName = 'Last name is required';
            isValid = false;
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
            isValid = false;
        }
        if (!formData.address.trim()) {
            errors.address = 'Address is required';
            isValid = false;
        }
        if (!formData.city.trim()) {
            errors.city = 'City is required';
            isValid = false;
        }
        if (!formData.zipCode.trim()) {
            errors.zipCode = 'ZIP code is required';
            isValid = false;
        }
        if (!formData.country.trim()) {
            errors.country = 'Country is required';
            isValid = false;
        }

        // Payment validation if credit card
        if (formData.paymentMethod === 'credit-card') {
            if (!formData.cardNumber.replace(/\s/g, '')) {
                errors.cardNumber = 'Card number is required';
                isValid = false;
            } else if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
                errors.cardNumber = 'Invalid card number';
                isValid = false;
            }
            if (!formData.cardName.trim()) {
                errors.cardName = 'Name on card is required';
                isValid = false;
            }
            if (!formData.cardExpiry.trim()) {
                errors.cardExpiry = 'Expiry date is required';
                isValid = false;
            } else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) {
                errors.cardExpiry = 'Invalid format (MM/YY)';
                isValid = false;
            }
            if (!formData.cardCvv.trim()) {
                errors.cardCvv = 'CVV is required';
                isValid = false;
            } else if (!/^\d{3,4}$/.test(formData.cardCvv)) {
                errors.cardCvv = 'Invalid CVV';
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    };

    const formatCardNumber = (value) => {
        const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
        const matches = v.match(/\d{4,16}/g);
        const match = matches && matches[0] || '';
        const parts = [];
        for (let i = 0, len = match.length; i < len; i += 4) {
            parts.push(match.substring(i, i + 4));
        }
        if (parts.length) {
            return parts.join(' ');
        } else {
            return value;
        }
    };

    const handleCardNumberChange = (e) => {
        const formattedValue = formatCardNumber(e.target.value);
        setFormData({
            ...formData,
            cardNumber: formattedValue
        });
    };

// In Checkout.jsx, update the handleSubmit function:
// In the handleSubmit function, update the success handling:
const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
  
    try {
      setLoading(true);
  
      // Prepare order data
      const orderData = {
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          }
        },
        items: cartItems.map(item => ({
          productId: item.product?._id || item.id,
          productName: item.product?.name || item.name,
          quantity: item.quantity,
          price: (item.product?.price || item.price || 0) * (1 - ((item.product?.discount || 0) / 100)),
          color: item.color,
          size: item.size,
          image: item.product?.images?.[0] || ''
        })),
        shippingMethod: formData.shippingMethod,
        paymentMethod: formData.paymentMethod,
        subtotal,
        shipping,
        tax,
        total
      };
  
      // Send order to backend
      const response = await axios.post('http://localhost:5000/api/orders', orderData);
      
      // Clear cart after successful order
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutItems');
      
      // Navigate to order details page
      navigate(`/orders/${response.data.orderId}`);
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

    if (loading && cartItems.length === 0) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading your order...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="outline-primary" onClick={() => navigate('/cart')}>
                    <FiChevronLeft className="me-1" /> Back to Cart
                </Button>
            </Container>
        );
    }

    if (cartItems.length === 0) {
        return (
            <Container className="py-5">
                <Card className="text-center py-5">
                    <Card.Body>
                        <h4>Your cart is empty</h4>
                        <p className="text-muted mb-4">
                            Looks like you haven't added any items to your cart yet.
                        </p>
                        <Button variant="primary" onClick={() => navigate('/')}>
                            Continue Shopping
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    return (
        <Container className="py-5 checkout-page">
            <Button
                variant="outline-primary"
                className="mb-4"
                onClick={() => navigate(-1)}
            >
                <FiChevronLeft className="me-1" /> Back
            </Button>

            <h2 className="mb-4">Checkout</h2>

            <Form onSubmit={handleSubmit}>
                <Row>
                    {/* Shipping and Payment Column */}
                    <Col lg={8} className="mb-4">
                        {/* Shipping Information */}
                        <Card className="mb-4">
                            <Card.Header className="d-flex align-items-center">
                                <FiMapPin className="me-2" />
                                <h5 className="mb-0">Shipping Information</h5>
                            </Card.Header>
                            <Card.Body>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.firstName}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.firstName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.lastName}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.lastName}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Email*</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.email}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.email}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Phone</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Address*</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.address}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.address}
                                    </Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.city}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.city}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>State/Province</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>ZIP/Postal Code*</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="zipCode"
                                                value={formData.zipCode}
                                                onChange={handleInputChange}
                                                isInvalid={!!formErrors.zipCode}
                                            />
                                            <Form.Control.Feedback type="invalid">
                                                {formErrors.zipCode}
                                            </Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Country*</Form.Label>
                                    <Form.Control
                                        as="select"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        isInvalid={!!formErrors.country}
                                    >
                                        <option value="">Select Country</option>
                                        <option value="US">United States</option>
                                        <option value="CA">Canada</option>
                                        <option value="UK">United Kingdom</option>
                                        <option value="AU">Australia</option>
                                        <option value="DE">Germany</option>
                                        <option value="FR">France</option>
                                        <option value="JP">Japan</option>
                                    </Form.Control>
                                    <Form.Control.Feedback type="invalid">
                                        {formErrors.country}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        {/* Shipping Method */}
                        <Card className="mb-4">
                            <Card.Header className="d-flex align-items-center">
                                <FiTruck className="me-2" />
                                <h5 className="mb-0">Shipping Method</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group>
                                    <Form.Check
                                        type="radio"
                                        id="standard-shipping"
                                        name="shippingMethod"
                                        label={
                                            <div className="d-flex justify-content-between">
                                                <span>Standard Shipping (5-7 business days)</span>
                                                <span>${shipping.toFixed(2)}</span>
                                            </div>
                                        }
                                        value="standard"
                                        checked={formData.shippingMethod === 'standard'}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Check
                                        type="radio"
                                        id="express-shipping"
                                        name="shippingMethod"
                                        label={
                                            <div className="d-flex justify-content-between">
                                                <span>Express Shipping (2-3 business days)</span>
                                                <span>$15.00</span>
                                            </div>
                                        }
                                        value="express"
                                        checked={formData.shippingMethod === 'express'}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>

                        {/* Payment Method */}
                        <Card className="mb-4">
                            <Card.Header className="d-flex align-items-center">
                                <FiCreditCard className="me-2" />
                                <h5 className="mb-0">Payment Method</h5>
                            </Card.Header>
                            <Card.Body>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="radio"
                                        id="credit-card"
                                        name="paymentMethod"
                                        label="Credit/Debit Card"
                                        value="credit-card"
                                        checked={formData.paymentMethod === 'credit-card'}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>

                                {formData.paymentMethod === 'credit-card' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Row>
                                            <Col md={12}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Card Number*</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="cardNumber"
                                                        value={formData.cardNumber}
                                                        onChange={handleCardNumberChange}
                                                        placeholder="1234 5678 9012 3456"
                                                        isInvalid={!!formErrors.cardNumber}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formErrors.cardNumber}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={6}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Name on Card*</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="cardName"
                                                        value={formData.cardName}
                                                        onChange={handleInputChange}
                                                        isInvalid={!!formErrors.cardName}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formErrors.cardName}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>Expiry Date*</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="cardExpiry"
                                                        value={formData.cardExpiry}
                                                        onChange={handleInputChange}
                                                        placeholder="MM/YY"
                                                        isInvalid={!!formErrors.cardExpiry}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formErrors.cardExpiry}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                            <Col md={3}>
                                                <Form.Group className="mb-3">
                                                    <Form.Label>CVV*</Form.Label>
                                                    <Form.Control
                                                        type="text"
                                                        name="cardCvv"
                                                        value={formData.cardCvv}
                                                        onChange={handleInputChange}
                                                        placeholder="123"
                                                        isInvalid={!!formErrors.cardCvv}
                                                    />
                                                    <Form.Control.Feedback type="invalid">
                                                        {formErrors.cardCvv}
                                                    </Form.Control.Feedback>
                                                </Form.Group>
                                            </Col>
                                        </Row>
                                    </motion.div>
                                )}

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="radio"
                                        id="paypal"
                                        name="paymentMethod"
                                        label="PayPal"
                                        value="paypal"
                                        checked={formData.paymentMethod === 'paypal'}
                                        onChange={handleInputChange}
                                    />
                                </Form.Group>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Order Summary Column */}
                    <Col lg={4}>
                        <Card className="sticky-top" style={{ top: '20px' }}>
                            <Card.Header>
                                <h5 className="mb-0">Order Summary</h5>
                            </Card.Header>
                            <Card.Body>
                                <ListGroup variant="flush" className="mb-3">
                                    {/* In the order summary section */}
                                    {cartItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            layout
                                        >
                                            <ListGroup.Item className="d-flex justify-content-between align-items-center">
                                                <div>
                                                    <h6 className="mb-1">{item.product?.name || item.name}</h6>
                                                    <small className="text-muted">
                                                        {item.quantity} x ${((item.product?.price || item.price || 0) * (1 - ((item.product?.discount || 0) / 100))).toFixed(2)}
                                                        {item.color && ` • Color: ${item.color}`}
                                                        {item.size && ` • Size: ${item.size}`}
                                                    </small>
                                                </div>
                                                <span>
                                                    ${((item.product?.price || item.price || 0) * (1 - ((item.product?.discount || 0) / 100)) * item.quantity).toFixed(2)}
                                                </span>
                                            </ListGroup.Item>
                                        </motion.div>
                                    ))}
                                </ListGroup>

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
                                        <span>Tax:</span>
                                        <span>${tax.toFixed(2)}</span>
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
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                                    ) : (
                                        'Place Order'
                                    )}
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Form>

            {/* Order Success Modal */}
            <Modal show={showSuccessModal} onHide={() => navigate('/')} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Order Confirmed!</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <FiCheck className="text-success mb-3" style={{ fontSize: '3rem' }} />
                    <h4>Thank you for your order!</h4>
                    <p className="mb-4">
                        Your order has been placed successfully. Your order ID is <strong>{orderId}</strong>.
                        We've sent a confirmation email with your order details.
                    </p>
                    <Button variant="primary" onClick={() => navigate('/')}>
                        Continue Shopping
                    </Button>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default Checkout;