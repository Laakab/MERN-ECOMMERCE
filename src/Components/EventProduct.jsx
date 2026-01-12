import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import axios from 'axios';
import '../Css/ProductForm.css';
import { useLocation } from 'react-router-dom';
const EventProduct = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const eventId = queryParams.get('event');

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        event: '', // Add this line
        quantity: '',
        colors: [],
        sizes: [],
        shippingPrice: '',
        discount: '',
        price: '',
        returnDays: '',
        event: eventId || '',
        images: []
    });

    // Add events state
    const [categories, setCategories] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [newColor, setNewColor] = useState('#000000');
    const [newSize, setNewSize] = useState('');
    const [previewImages, setPreviewImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate prices
    const discountAmount = formData.discount ? (formData.price * formData.discount / 100) : 0;
    const totalPrice = formData.price ? (parseFloat(formData.price) - discountAmount + parseFloat(formData.shippingPrice || 0)) : 0;
    // Create an axios instance with base URL
    const api = axios.create({
        baseURL: 'http://localhost:5000', // Your backend URL
        withCredentials: true
    });
    // Update useEffect to fetch both categories and events
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await api.get('/api/categories/list');

                if (response.data.success && response.data.categories) {
                    setCategories(response.data.categories);
                } else {
                    setError(response.data.message || 'No categories found');
                }
            } catch (err) {
                console.error('Category fetch error:', err);
                setError('Failed to load categories. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };


        const fetchData = async () => {
            try {
                setLoading(true);
                setError('');
                // Fetch events
                const eventsResponse = await api.get('/api/events/list');
                if (eventsResponse.data.success) {
                    setEvents(eventsResponse.data.events);
                }

            } catch (err) {
                console.error('Data fetch error:', err);
                setError('Failed to load data. Please check your connection and try again.');
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddColor = () => {
        if (newColor && !formData.colors.includes(newColor)) {
            setFormData({
                ...formData,
                colors: [...formData.colors, newColor]
            });
            setNewColor('#000000');
        }
    };

    const handleRemoveColor = (colorToRemove) => {
        setFormData({
            ...formData,
            colors: formData.colors.filter(color => color !== colorToRemove)
        });
    };

    const handleAddSize = () => {
        if (newSize && !formData.sizes.includes(newSize)) {
            setFormData({
                ...formData,
                sizes: [...formData.sizes, newSize]
            });
            setNewSize('');
        }
    };

    const handleRemoveSize = (sizeToRemove) => {
        setFormData({
            ...formData,
            sizes: formData.sizes.filter(size => size !== sizeToRemove)
        });
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages([...previewImages, ...previews]);

        // Add to form data
        setFormData({
            ...formData,
            images: [...formData.images, ...files]
        });
    };

    const handleRemoveImage = (index) => {
        const newImages = [...formData.images];
        newImages.splice(index, 1);
        setFormData({
            ...formData,
            images: newImages
        });

        const newPreviews = [...previewImages];
        newPreviews.splice(index, 1);
        setPreviewImages(newPreviews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const formDataToSend = new FormData();

            // Append all fields to formData
            Object.keys(formData).forEach(key => {
                if (key === 'colors' || key === 'sizes') {
                    formDataToSend.append(key, JSON.stringify(formData[key]));
                } else if (key !== 'images') {
                    formDataToSend.append(key, formData[key]);
                }
            });

            // Append images
            formData.images.forEach(image => {
                formDataToSend.append('images', image);
            });

            // In EventProduct.jsx, update the axios post call:
            const response = await api.post('/api/event-products', formDataToSend, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess('Product created successfully!');
                // Reset form
                setFormData({
                    name: '',
                    description: '',
                    category: '',
                    event: '',
                    quantity: '',
                    colors: [],
                    sizes: [],
                    shippingPrice: '',
                    discount: '',
                    price: '',
                    returnDays: '',
                    images: []
                });
                setPreviewImages([]);
            } else {
                setError(response.data.message || 'Failed to create product');
            }
        } catch (err) {
            console.error('Product creation error:', err);
            setError(err.response?.data?.message || 'Failed to create product. Please check the console for details.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="product-form-container"
        >
            <Card className="p-4 shadow">
                <Card.Body>
                    <h2 className="mb-4 text-center">Add New EventProduct</h2>

                    {error && <Alert variant="danger">{error}</Alert>}
                    {success && <Alert variant="success">{success}</Alert>}

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Product Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Associated Event (Optional)</Form.Label>
                                    <Form.Select
                                        name="event"
                                        value={formData.event}
                                        onChange={handleChange}
                                        disabled={loading}
                                    >
                                        <option value="">Select an event (optional)</option>
                                        {events.map(event => (
                                            <option key={event._id} value={event._id}>{event.eventName}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Category *</Form.Label>
                                    <Form.Select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map(cat => (
                                            <option key={cat._id} value={cat._id}>{cat.name}</option>
                                        ))}
                                    </Form.Select>
                                    {loading && <small className="text-muted">Loading categories...</small>}
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Quantity *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleChange}
                                        min="0"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Price ($) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Discount (%)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="discount"
                                        value={formData.discount}
                                        onChange={handleChange}
                                        min="0"
                                        max="100"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Shipping Price ($) *</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="shippingPrice"
                                        value={formData.shippingPrice}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        required
                                    />
                                </Form.Group>
                            </Col>

                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Return Policy (Days) *</Form.Label>
                                    <Form.Select
                                        name="returnDays"
                                        value={formData.returnDays}
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="">Select return days</option>
                                        {[1, 2, 3, 4, 5, 6, 7].map(day => (
                                            <option key={day} value={day}>{day} day{day !== 1 ? 's' : ''}</option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Colors</Form.Label>
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control
                                    type="color"
                                    value={newColor}
                                    onChange={(e) => setNewColor(e.target.value)}
                                    style={{ width: '60px', height: '38px', padding: '3px' }}
                                    className="me-2"
                                />
                                <Button variant="outline-primary" onClick={handleAddColor}>
                                    <FiPlus /> Add Color
                                </Button>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                                {formData.colors.map((color, index) => (
                                    <div key={index} className="d-flex align-items-center color-chip">
                                        <div
                                            className="color-preview"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        ></div>
                                        <span className="ms-1 me-2">{color}</span>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleRemoveColor(color)}
                                        >
                                            <FiTrash2 />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Sizes</Form.Label>
                            <div className="d-flex align-items-center mb-2">
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., S, M, L, XL, 36, 38, etc."
                                    value={newSize}
                                    onChange={(e) => setNewSize(e.target.value)}
                                    className="me-2"
                                />
                                <Button variant="outline-primary" onClick={handleAddSize}>
                                    <FiPlus /> Add Size
                                </Button>
                            </div>

                            <div className="d-flex flex-wrap gap-2">
                                {formData.sizes.map((size, index) => (
                                    <div key={index} className="d-flex align-items-center size-chip">
                                        <span className="me-2">{size}</span>
                                        <Button
                                            variant="outline-danger"
                                            size="sm"
                                            onClick={() => handleRemoveSize(size)}
                                        >
                                            <FiTrash2 />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Product Images</Form.Label>
                            <Form.Control
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="d-none"
                                id="productImages"
                            />
                            <Form.Label
                                htmlFor="productImages"
                                className="d-block border rounded p-4 text-center cursor-pointer"
                            >
                                <FiUpload size={24} className="mb-2" />
                                <div>Click to upload images</div>
                                <small className="text-muted">Maximum 10 images</small>
                            </Form.Label>

                            {previewImages.length > 0 && (
                                <div className="mt-3">
                                    <h6>Preview:</h6>
                                    <div className="d-flex flex-wrap gap-3">
                                        {previewImages.map((preview, index) => (
                                            <div key={index} className="image-preview-container">
                                                <img
                                                    src={preview}
                                                    alt={`Preview ${index + 1}`}
                                                    className="img-thumbnail"
                                                />
                                                <Button
                                                    variant="danger"
                                                    size="sm"
                                                    className="position-absolute top-0 end-0 m-1"
                                                    onClick={() => handleRemoveImage(index)}
                                                >
                                                    <FiTrash2 />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Form.Group>

                        <Card className="mb-4">
                            <Card.Header>Order Summary</Card.Header>
                            <Card.Body>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Product Price:</span>
                                    <span>${formData.price || '0.00'}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span>Shipping Price:</span>
                                    <span>${formData.shippingPrice || '0.00'}</span>
                                </div>
                                {formData.discount > 0 && (
                                    <div className="d-flex justify-content-between mb-2">
                                        <span>Discount ({formData.discount}%):</span>
                                        <span>-${discountAmount.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total Price:</span>
                                    <span>${totalPrice.toFixed(2)}</span>
                                </div>
                            </Card.Body>
                        </Card>

                        <div className="text-center">
                            <Button
                                variant="primary"
                                type="submit"
                                disabled={isSubmitting}
                                className="px-5"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" />
                                        Creating Product...
                                    </>
                                ) : 'Create Product'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </motion.div>
    );
};

export default EventProduct;