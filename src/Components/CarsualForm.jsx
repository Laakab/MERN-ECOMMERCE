import React, { useState } from 'react';
import { Button, Form, Card, Row, Col } from 'react-bootstrap';
import { FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../Css/CarsualForm.css'; // Import the CSS file

const CarsualForm = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedStore, setSelectedStore] = useState('');
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const stores = [
    'Electronics',
    'Furniture',
    'Clothing',
    'Grocery',
    'Books',
    'Toys',
    'Sports',
    'Beauty'
  ];

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + images.length > 5) {
      setError('You can upload a maximum of 5 images');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewImages([...previewImages, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewImages];
    URL.revokeObjectURL(newPreviews[index]); // Clean up memory
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !description || !selectedStore || images.length === 0) {
      setError('All fields are required');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('store', selectedStore);
      
      images.forEach((image, index) => {
        formData.append('images', image);
      });

      const response = await axios.post('http://localhost:5000/api/carsuals', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        // Reset form
        setName('');
        setDescription('');
        setSelectedStore('');
        setImages([]);
        setPreviewImages([]);
      }
    } catch (err) {
      console.error('Error creating carsual:', err);
      setError(err.response?.data?.message || 'Failed to create carsual');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="carsual-form-container">
    <h4 className="carsual-form-title">Create New Carsual</h4>
    <Form onSubmit={handleSubmit} className="carsual-form">
      <Form.Group className="mb-4">
        <Form.Label>Carsual Name</Form.Label>
        <Form.Control
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter carsual name"
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter description"
        />
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Select Store</Form.Label>
        <Form.Select
          value={selectedStore}
          onChange={(e) => setSelectedStore(e.target.value)}
        >
          <option value="">Select a store</option>
          {stores.map((store, index) => (
            <option key={index} value={store}>
              {store}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-4">
        <Form.Label>Upload Images (Max 5)</Form.Label>
        <Form.Control
          type="file"
          multiple
          onChange={handleImageChange}
          accept="image/*"
        />
      </Form.Group>

      {error && <div className="error-message">{error}</div>}

      <div className="mb-4">
        <h6 className="mb-3">Image Previews</h6>
        <Row>
          {previewImages.map((preview, index) => (
            <Col key={index} xs={6} md={4} className="mb-3">
              <Card className="image-preview-card">
                <Card.Img variant="top" src={preview} />
                <Card.Body className="p-2">
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => removeImage(index)}
                    className="w-100 remove-image-btn"
                  >
                    <FiX /> Remove
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      <div className="d-flex justify-content-end mt-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
            className="submit-btn"
          >
            {isSubmitting ? 'Creating...' : (
              <>
                <FiCheck /> Create Carsual
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </Form>
  </div>
  );
};

export default CarsualForm;