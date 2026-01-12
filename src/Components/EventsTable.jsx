import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Row, Col, Form, Spinner, Alert, Image } from 'react-bootstrap';
import { FaEdit, FaTrash, FaCalendarAlt, FaInfoCircle, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';

const EventsTable = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Check and remove expired events
  const checkExpiredEvents = async () => {
    try {
      const now = new Date();
      const expiredEvents = events.filter(event => {
        const eventEnd = new Date(`${event.toDate}T${event.toTime}`);
        return eventEnd < now;
      });

      if (expiredEvents.length > 0) {
        // Delete expired events from the database
        await Promise.all(
          expiredEvents.map(event => 
            axios.delete(`http://localhost:5000/api/events/${event._id}`)
          )
        );
        
        // Update local state
        setEvents(events.filter(event => {
          const eventEnd = new Date(`${event.toDate}T${event.toTime}`);
          return eventEnd >= now;
        }));
      }
    } catch (err) {
      console.error('Error removing expired events:', err);
    }
  };

  // Fetch events from the server
  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/events');
      setEvents(response.data.events);
      await checkExpiredEvents(); // Check for expired events after fetching
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    
    // Set up interval to check for expired events every minute
    const interval = setInterval(() => {
      checkExpiredEvents();
    }, 60000); // 1 minute

    return () => clearInterval(interval);
  }, []);

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/events/${selectedEvent._id}`);
      setEvents(events.filter(event => event._id !== selectedEvent._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete event');
    }
  };

  // Handle edit form changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');

    try {
      // Format dates for the API
      const updatedEvent = {
        ...formData,
        fromDate: formData.fromDate.split('T')[0],
        toDate: formData.toDate.split('T')[0]
      };

      const response = await axios.put(
        `http://localhost:5000/api/events/${selectedEvent._id}`,
        updatedEvent
      );

      setEvents(events.map(event => 
        event._id === selectedEvent._id ? response.data.event : event
      ));
      setShowEditModal(false);
      
      // Check if the updated event is now expired
      await checkExpiredEvents();
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update event');
    } finally {
      setUpdateLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format time for display
  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Check if event is expired
  const isEventExpired = (event) => {
    const now = new Date();
    const eventEnd = new Date(`${event.toDate}T${event.toTime}`);
    return eventEnd < now;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-4">
        {error}
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-3"
    >
      <h3 className="mb-4 d-flex align-items-center">
        <FaCalendarAlt className="me-2" /> Events Management
      </h3>

      {events.length === 0 ? (
        <Alert variant="info">
          No events found. Create your first event!
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="shadow-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th>Image</th>
                <th>Event Name</th>
                <th>Description</th>
                <th>Date Range</th>
                <th>Time Range</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const expired = isEventExpired(event);
                return (
                  <tr key={event._id} className={expired ? 'table-secondary' : ''}>
                    <td>
                      {event.images?.length > 0 ? (
                        <Image 
                          // src={`http://localhost:5000/uploads/events/${event.images[0].split('/').pop()}`} 
                          src={`http://localhost:5000/${event.images[0]}`}
                          alt={event.eventName}
                          thumbnail
                          style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                        />
                      ) : (
                        <div className="text-muted">No image</div>
                      )}
                    </td>
                    <td>{event.eventName}</td>
                    <td>
                      <div className="text-truncate" style={{ maxWidth: '200px' }}>
                        {event.eventDescription}
                      </div>
                    </td>
                    <td>
                      {formatDate(event.fromDate)} - {formatDate(event.toDate)}
                    </td>
                    <td>
                      {formatTime(event.fromTime)} - {formatTime(event.toTime)}
                    </td>
                    <td>
                      {expired ? (
                        <span className="text-danger">Expired</span>
                      ) : (
                        <span className="text-success">Active</span>
                      )}
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => {
                          setSelectedEvent(event);
                          setFormData({
                            eventName: event.eventName,
                            eventDescription: event.eventDescription,
                            fromDate: new Date(event.fromDate).toISOString().slice(0, 16),
                            fromTime: event.fromTime,
                            toDate: new Date(event.toDate).toISOString().slice(0, 16),
                            toTime: event.toTime
                          });
                          setShowEditModal(true);
                        }}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setShowDeleteModal(true);
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the event "{selectedEvent?.eventName}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Event Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Event
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleEditSubmit}>
          <Modal.Body>
            {updateError && (
              <Alert variant="danger" className="mb-3">
                {updateError}
              </Alert>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Event Name</Form.Label>
              <Form.Control
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="eventDescription"
                value={formData.eventDescription}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    Start Date
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaClock className="me-2" />
                    Start Time
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="fromTime"
                    value={formData.fromTime}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaCalendarAlt className="me-2" />
                    End Date
                  </Form.Label>
                  <Form.Control
                    type="datetime-local"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaClock className="me-2" />
                    End Time
                  </Form.Label>
                  <Form.Control
                    type="time"
                    name="toTime"
                    value={formData.toTime}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {selectedEvent?.images?.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Current Images</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {selectedEvent.images.map((img, index) => (
                    <Image
                      key={index}
                      src={`http://localhost:5000/uploads/events/${img.split('/').pop()}`}
                      thumbnail
                      style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                    />
                  ))}
                </div>
              </Form.Group>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={updateLoading}>
              {updateLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Updating...
                </>
              ) : (
                'Update Event'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default EventsTable;