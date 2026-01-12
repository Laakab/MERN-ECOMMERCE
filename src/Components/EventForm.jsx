import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUpload, FiCalendar, FiClock, FiType } from 'react-icons/fi';
import '../Css/EventForm.css';

const EventForm = () => {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDescription: '',
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: '',
    images: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!formData.eventDescription.trim()) newErrors.eventDescription = 'Description is required';
    if (!formData.fromDate) newErrors.fromDate = 'Start date is required';
    if (!formData.fromTime) newErrors.fromTime = 'Start time is required';
    if (!formData.toDate) newErrors.toDate = 'End date is required';
    if (!formData.toTime) newErrors.toTime = 'End time is required';

    // Validate date range
    if (formData.fromDate && formData.toDate) {
      const fromDate = new Date(`${formData.fromDate}T${formData.fromTime}`);
      const toDate = new Date(`${formData.toDate}T${formData.toTime}`);
      
      if (toDate <= fromDate) {
        newErrors.toDate = 'End date/time must be after start date/time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setErrors(prev => ({ ...prev, images: '' }));
  };

  const removeImage = (index) => {
    const updatedImages = previewImages.filter((_, i) => i !== index);
    setPreviewImages(updatedImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
  
    setIsSubmitting(true);
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('eventName', formData.eventName);
      formDataToSend.append('eventDescription', formData.eventDescription);
      formDataToSend.append('fromDate', formData.fromDate);
      formDataToSend.append('fromTime', formData.fromTime);
      formDataToSend.append('toDate', formData.toDate);
      formDataToSend.append('toTime', formData.toTime);
      
      previewImages.forEach((image) => {
        formDataToSend.append('images', image.file);
      });
  
      // Use absolute URL in development
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/events' 
        : '/api/events';
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
        // credentials: 'include' // Uncomment if using cookies
      });
  
      const data = await response.json();
      console.log('Response:', data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit event');
      }
  
      // Reset form on success
      setFormData({
        eventName: '',
        eventDescription: '',
        fromDate: '',
        fromTime: '',
        toDate: '',
        toTime: '',
        images: []
      });
      setPreviewImages([]);
      setSubmitSuccess(true);
      
    } catch (error) {
      console.error('Event submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to submit event. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="event-form-container">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">Create New Event</h3>
              </Card.Header>
              <Card.Body>
                {submitSuccess && (
                  <Alert variant="success" onClose={() => setSubmitSuccess(false)} dismissible>
                    Event created successfully!
                  </Alert>
                )}

                {errors.submit && (
                  <Alert variant="danger" onClose={() => setErrors(prev => ({ ...prev, submit: '' }))} dismissible>
                    {errors.submit}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Event Name */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiType className="me-2" />
                      Event Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="eventName"
                      value={formData.eventName}
                      onChange={handleChange}
                      isInvalid={!!errors.eventName}
                      placeholder="Enter event name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.eventName}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Description */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiType className="me-2" />
                      Description
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      name="eventDescription"
                      value={formData.eventDescription}
                      onChange={handleChange}
                      isInvalid={!!errors.eventDescription}
                      placeholder="Enter detailed description of your event"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.eventDescription}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Date and Time Range */}
                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FiCalendar className="me-2" />
                          Start Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="fromDate"
                          value={formData.fromDate}
                          onChange={handleChange}
                          isInvalid={!!errors.fromDate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fromDate}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FiClock className="me-2" />
                          Start Time
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="fromTime"
                          value={formData.fromTime}
                          onChange={handleChange}
                          isInvalid={!!errors.fromTime}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.fromTime}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row className="mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FiCalendar className="me-2" />
                          End Date
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="toDate"
                          value={formData.toDate}
                          onChange={handleChange}
                          isInvalid={!!errors.toDate}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.toDate}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>
                          <FiClock className="me-2" />
                          End Time
                        </Form.Label>
                        <Form.Control
                          type="time"
                          name="toTime"
                          value={formData.toTime}
                          onChange={handleChange}
                          isInvalid={!!errors.toTime}
                        />
                        <Form.Control.Feedback type="invalid">
                          {errors.toTime}
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Image Upload */}
                  <Form.Group className="mb-4">
                    <Form.Label>
                      <FiUpload className="me-2" />
                      Event Images
                    </Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    
                    {/* Image Previews */}
                    {previewImages.length > 0 && (
                      <div className="mt-3">
                        <h6>Selected Images:</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {previewImages.map((image, index) => (
                            <div key={index} className="image-preview-container">
                              <img
                                src={image.preview}
                                alt={`Preview ${index}`}
                                className="img-thumbnail"
                              />
                              <button
                                type="button"
                                className="btn-close image-remove-btn"
                                onClick={() => removeImage(index)}
                                aria-label="Remove image"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Form.Group>

                  <div className="d-grid">
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Event'}
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </motion.div>
  );
};

export default EventForm;