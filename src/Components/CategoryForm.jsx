import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiUpload, FiX } from 'react-icons/fi';
import axios from 'axios';
import '../Css/CategoryForm.css';

const CategoryForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '',
    images: []
  });
  const [previewImages, setPreviewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate number of images
    if (files.length + previewImages.length > 5) {
      setError('You can upload maximum 5 images');
      return;
    }
    
    // Validate image types and size
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} is not an image`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError(`File ${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return;
    
    // Create preview URLs
    const newPreviewImages = validFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setPreviewImages(prev => [...prev, ...newPreviewImages]);
    setError('');
  };

  const removeImage = (index) => {
    const newPreviewImages = [...previewImages];
    URL.revokeObjectURL(newPreviewImages[index].preview);
    newPreviewImages.splice(index, 1);
    setPreviewImages(newPreviewImages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.name || !formData.quantity) {
      setError('Name and Quantity are required fields');
      return;
    }
    
    if (isNaN(formData.quantity) || parseInt(formData.quantity) < 0) {
      setError('Quantity must be a positive number');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('quantity', formData.quantity);
      
      previewImages.forEach((image) => {
        formDataToSend.append('images', image.file);
      });
      
      // Add withCredentials if using sessions
      const response = await axios.post('http://localhost:5000/api/categories', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess('Category created successfully!');
      setFormData({
        name: '',
        description: '',
        quantity: '',
        images: []
      });
      setPreviewImages([]);
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err.response?.data?.message || 
               err.message || 
               'Failed to create category. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="category-form-container"
    >
      <Card className="shadow">
        <Card.Header as="h5" className="bg-primary text-white">
          Create New Category
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter category name"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter description (optional)"
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Quantity *</Form.Label>
              <Form.Control
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Enter quantity"
                min="0"
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Images (Max 5)</Form.Label>
              <div className="image-upload-container">
                <label htmlFor="image-upload" className="upload-btn">
                  <FiUpload className="me-2" />
                  Choose Images
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                    disabled={previewImages.length >= 5}
                  />
                </label>
                <span className="ms-2 text-muted">
                  {previewImages.length} / 5 images selected
                </span>
              </div>
              
              {previewImages.length > 0 && (
                <div className="image-preview-container mt-3">
                  {previewImages.map((image, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={image.preview} alt={`Preview ${index}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>
            
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading}
              className="submit-btn"
            >
              {isLoading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default CategoryForm;