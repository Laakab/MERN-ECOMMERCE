import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUpload, FiCalendar, FiClock, FiMapPin, FiUser, FiType } from 'react-icons/fi';
import '../Css/AdsForm.css';

const AdsForm = () => {
  const [formData, setFormData] = useState({
    adsName: '',
    adsDescription: '',
    targetAudience: '',
    setArea: { lat: 0, lng: 0, address: '' },
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
    
    if (!formData.adsName.trim()) newErrors.adsName = 'Ads name is required';
    if (!formData.adsDescription.trim()) newErrors.adsDescription = 'Description is required';
    if (!formData.targetAudience.trim()) newErrors.targetAudience = 'Target audience is required';
    if (!formData.setArea.address) newErrors.setArea = 'Location is required';
    if (!formData.fromDate) newErrors.fromDate = 'Start date is required';
    if (!formData.fromTime) newErrors.fromTime = 'Start time is required';
    if (!formData.toDate) newErrors.toDate = 'End date is required';
    if (!formData.toTime) newErrors.toTime = 'End time is required';
    if (previewImages.length === 0) newErrors.images = 'At least one image is required';

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

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      setArea: {
        lat: location.lat,
        lng: location.lng,
        address: location.address
      }
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + previewImages.length > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'Maximum 5 images allowed'
      }));
      return;
    }

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
      formDataToSend.append('adsName', formData.adsName);
      formDataToSend.append('adsDescription', formData.adsDescription);
      formDataToSend.append('targetAudience', formData.targetAudience);
      formDataToSend.append('setArea', JSON.stringify(formData.setArea));
      formDataToSend.append('fromDate', formData.fromDate);
      formDataToSend.append('fromTime', formData.fromTime);
      formDataToSend.append('toDate', formData.toDate);
      formDataToSend.append('toTime', formData.toTime);
      
      previewImages.forEach((image) => {
        formDataToSend.append('images', image.file);
      });
  
      // Use absolute URL in development
      const apiUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:5000/api/ads' 
        : '/api/ads';
  
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formDataToSend,
        // credentials: 'include' // If using cookies for auth
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || 'Submission failed');
      }
  
      // Reset form on success
      setFormData({
        adsName: '',
        adsDescription: '',
        targetAudience: '',
        setArea: { lat: 0, lng: 0, address: '' },
        fromDate: '',
        fromTime: '',
        toDate: '',
        toTime: '',
        images: []
      });
      setPreviewImages([]);
      setSubmitSuccess(true);
      
    } catch (error) {
      console.error('Submission error:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to submit ad. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple Google Maps integration - in a real app you'd use the Google Maps API
  const openMapModal = () => {
    // This is a placeholder - in a real app you'd implement a proper map picker
    const address = prompt("Enter location address or coordinates (lat,lng):");
    if (address) {
      // Simple validation for coordinates
      if (address.includes(',')) {
        const [lat, lng] = address.split(',').map(coord => parseFloat(coord.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          handleLocationSelect({
            lat,
            lng,
            address: `Custom Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`
          });
          return;
        }
      }
      
      // Just use the address as-is for this demo
      handleLocationSelect({
        lat: 0,
        lng: 0,
        address
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Container className="ads-form-container">
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <h3 className="mb-0">Create New Advertisement</h3>
              </Card.Header>
              <Card.Body>
                {submitSuccess && (
                  <Alert variant="success" onClose={() => setSubmitSuccess(false)} dismissible>
                    Advertisement created successfully!
                  </Alert>
                )}

                {errors.submit && (
                  <Alert variant="danger" onClose={() => setErrors(prev => ({ ...prev, submit: '' }))} dismissible>
                    {errors.submit}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* Ads Name */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiType className="me-2" />
                      Advertisement Name
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="adsName"
                      value={formData.adsName}
                      onChange={handleChange}
                      isInvalid={!!errors.adsName}
                      placeholder="Enter advertisement name"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.adsName}
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
                      name="adsDescription"
                      value={formData.adsDescription}
                      onChange={handleChange}
                      isInvalid={!!errors.adsDescription}
                      placeholder="Enter detailed description of your advertisement"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.adsDescription}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Target Audience */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiUser className="me-2" />
                      Target Audience
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      isInvalid={!!errors.targetAudience}
                      placeholder="Describe your target audience"
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.targetAudience}
                    </Form.Control.Feedback>
                  </Form.Group>

                  {/* Location */}
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <FiMapPin className="me-2" />
                      Set Location
                    </Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        value={formData.setArea.address}
                        readOnly
                        isInvalid={!!errors.setArea}
                        placeholder="Select location on map"
                      />
                      <Button
                        variant="outline-secondary"
                        className="ms-2"
                        onClick={openMapModal}
                      >
                        Select on Map
                      </Button>
                    </div>
                    <Form.Control.Feedback type="invalid">
                      {errors.setArea}
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
                      Advertisement Images (Max 5)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      isInvalid={!!errors.images}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.images}
                    </Form.Control.Feedback>
                    
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
                      {isSubmitting ? 'Creating...' : 'Create Advertisement'}
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

export default AdsForm;