import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiCalendar, FiClock, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Css/EventCard.css'; // Create this CSS file for custom styles

const EventCard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Create an axios instance with base URL
    const api = axios.create({
        baseURL: 'http://localhost:5000', // Your backend URL
        withCredentials: true
    });

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/api/events');
                if (response.data.success) {
                    setEvents(response.data.events);
                } else {
                    setError('Failed to fetch events');
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                setError('Failed to fetch events. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCardClick = (eventId) => {
        navigate(`/eventproduct?event=${eventId}`);
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <Spinner animation="border" variant="primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <Alert variant="danger">{error}</Alert>
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <Alert variant="info">No events available</Alert>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <h2 className="text-center mb-4">Upcoming Events</h2>
            <Row xs={1} md={2} lg={3} className="g-4">
                {events.map((event) => (
                    <Col key={event._id}>
                        <motion.div
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleCardClick(event._id)}
                        >
                            <Card className="h-100 event-card">
                                {event.images && event.images.length > 0 && (
                                    <Card.Img 
                                        variant="top" 
                                        src={`http://localhost:5000/${event.images[0]}`} 
                                        alt={event.eventName}
                                        style={{ height: '200px', objectFit: 'cover' }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title>{event.eventName}</Card.Title>
                                    <Card.Text className="text-muted">
                                        {event.eventDescription}
                                    </Card.Text>
                                    <div className="event-details">
                                        <div className="d-flex align-items-center mb-2">
                                            <FiCalendar className="me-2" />
                                            <span>
                                                {formatDate(event.fromDate)} - {formatDate(event.toDate)}
                                            </span>
                                        </div>
                                        <div className="d-flex align-items-center">
                                            <FiClock className="me-2" />
                                            <span>
                                                {event.fromTime} - {event.toTime}
                                            </span>
                                        </div>
                                    </div>
                                </Card.Body>
                                <Card.Footer className="text-center bg-transparent border-top-0">
                                    <button className="btn btn-link">
                                        View Products <FiArrowRight />
                                    </button>
                                </Card.Footer>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default EventCard;