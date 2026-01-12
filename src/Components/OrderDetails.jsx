import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Card,
    Button,
    Alert,
    Spinner,
    ListGroup,
    Badge,
    Row,
    Col,
    Modal
} from 'react-bootstrap';
import { FiShoppingBag, FiTruck, FiCreditCard, FiX } from 'react-icons/fi';
import { motion } from 'framer-motion';

const OrderDetails = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [cancelling, setCancelling] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`http://localhost:5000/api/orders/${orderId}`);
                setOrder(data.order);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching order:', err);
                setError(err.response?.data?.message || 'Failed to load order details');
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleCancelOrder = async () => {
        try {
            setCancelling(true);
            await axios.delete(`http://localhost:5000/api/orders/${orderId}`);
            navigate('/orders', { state: { message: 'Order cancelled successfully' } });
        } catch (err) {
            console.error('Error cancelling order:', err);
            setError(err.response?.data?.message || 'Failed to cancel order');
            setCancelling(false);
            setShowCancelModal(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending':
                return <Badge bg="warning" text="dark">Pending</Badge>;
            case 'processing':
                return <Badge bg="info">Processing</Badge>;
            case 'shipped':
                return <Badge bg="primary">Shipped</Badge>;
            case 'delivered':
                return <Badge bg="success">Delivered</Badge>;
            case 'cancelled':
                return <Badge bg="danger">Cancelled</Badge>;
            default:
                return <Badge bg="secondary">Unknown</Badge>;
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading order details...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Button variant="outline-primary" onClick={() => navigate('/')}>
                    Back to Home
                </Button>
            </Container>
        );
    }

    if (!order) {
        return (
            <Container className="py-5">
                <Alert variant="warning">Order not found</Alert>
                <Button variant="outline-primary" onClick={() => navigate('/')}>
                    Back to Home
                </Button>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Order #{order._id.substring(0, 8).toUpperCase()}</h2>
                <div>
                    {getStatusBadge(order.status)}
                    <span className="ms-2 text-muted">
                        {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <Row>
                <Col lg={8}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Order Items</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                {order.items.map((item, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <ListGroup.Item className="d-flex align-items-center">
                                            <img
                                                src={
                                                    item.image.startsWith('http')
                                                        ? item.image
                                                        : `http://localhost:5000/${item.image.replace(/^\/uploads\//, 'uploads/')}`
                                                }
                                                alt={item.productName}
                                                style={{ width: '80px', height: '80px', objectFit: 'cover', marginRight: '15px' }}
                                                onError={(e) => {
                                                    e.target.src = 'https://via.placeholder.com/80';
                                                }}
                                            />
                                            <div className="flex-grow-1">
                                                <h6 className="mb-1">{item.productName}</h6>
                                                <small className="text-muted">
                                                    {item.quantity} x ${item.price.toFixed(2)}
                                                    {item.color && ` • Color: ${item.color}`}
                                                    {item.size && ` • Size: ${item.size}`}
                                                </small>
                                            </div>
                                            <div className="text-end">
                                                <div className="fw-bold">${(item.price * item.quantity).toFixed(2)}</div>
                                            </div>
                                        </ListGroup.Item>
                                    </motion.div>
                                ))}
                            </ListGroup>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={4}>
                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Order Summary</h5>
                        </Card.Header>
                        <Card.Body>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Subtotal:</span>
                                    <span>${order.subtotal.toFixed(2)}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Shipping:</span>
                                    <span>${order.shipping.toFixed(2)}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between">
                                    <span>Tax:</span>
                                    <span>${order.tax.toFixed(2)}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="d-flex justify-content-between fw-bold">
                                    <span>Total:</span>
                                    <span>${order.total.toFixed(2)}</span>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                    <Card className="mb-4">
                        <Card.Header>
                            <h5 className="mb-0">Shipping Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <p>
                                {order.customer.firstName} {order.customer.lastName}<br />
                                {order.customer.address.street}<br />
                                {order.customer.address.city}, {order.customer.address.state} {order.customer.address.zipCode}<br />
                                {order.customer.address.country}
                            </p>
                            <p>
                                <strong>Email:</strong> {order.customer.email}<br />
                                {order.customer.phone && <><strong>Phone:</strong> {order.customer.phone}</>}
                            </p>
                            <p>
                                <strong>Shipping Method:</strong> {order.shippingMethod === 'standard' ? 'Standard Shipping' : 'Express Shipping'}
                            </p>
                        </Card.Body>
                    </Card>

                    <Card>
                        <Card.Header>
                            <h5 className="mb-0">Payment Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <p>
                                <strong>Payment Method:</strong> {order.paymentMethod === 'credit-card' ? 'Credit Card' : 'PayPal'}
                            </p>
                            {order.status === 'pending' && (
                                <Button
                                    variant="outline-danger"
                                    className="w-100"
                                    onClick={() => setShowCancelModal(true)}
                                >
                                    <FiX className="me-1" /> Cancel Order
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Cancel Order Modal */}
            <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Cancel Order</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to cancel this order?</p>
                    <p>This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
                        Go Back
                    </Button>
                    <Button variant="danger" onClick={handleCancelOrder} disabled={cancelling}>
                        {cancelling ? (
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                        ) : (
                            'Confirm Cancellation'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default OrderDetails;