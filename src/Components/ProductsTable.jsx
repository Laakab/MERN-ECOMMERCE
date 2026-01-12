import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Modal, Form } from 'react-bootstrap';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaSync } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [refresh, setRefresh] = useState(false);

  // Form state for editing
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    quantity: '',
    colors: [],
    sizes: [],
    shippingPrice: '',
    discount: '',
    price: '',
    returnDays: '1',
  });

  // Fetch products from API
  useEffect(() => {
    console.log('Fetching products...');
    const fetchProducts = async () => {
      try {
        setLoading(true);
        console.log('Making API call to /api/products');
        const response = await axios.get('http://localhost:5000/api/products', {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        console.log('API response:', response);
        
        if (response.data.success) {
          console.log('Products received:', response.data.products);
          setProducts(response.data.products);
          setError(null);
        } else {
          console.error('API returned success=false:', response.data.message);
          setError(response.data.message || 'Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.response?.data?.message || 
                 err.message || 
                 'Failed to fetch products. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [refresh]);

  // Fetch categories for dropdown
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/categories/list');
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };

    fetchCategories();
  }, []);

  // Handle search
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || '')
  );

  // Handle delete confirmation
  const confirmDelete = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  // Handle actual deletion
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${productToDelete._id}`);
      setProducts(products.filter(p => p._id !== productToDelete._id));
      setShowDeleteModal(false);
      setProductToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product');
    }
  };

  // Handle edit initiation
  const initiateEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      category: product.category?._id || '',
      quantity: product.quantity.toString(),
      colors: product.colors?.join(', ') || '',
      sizes: product.sizes?.join(', ') || '',
      shippingPrice: product.shippingPrice.toString(),
      discount: product.discount?.toString() || '0',
      price: product.price.toString(),
      returnDays: product.returnDays.toString(),
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedProduct = {
        ...formData,
        colors: formData.colors.split(',').map(c => c.trim()).filter(c => c),
        sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        quantity: parseInt(formData.quantity),
        shippingPrice: parseFloat(formData.shippingPrice),
        discount: parseFloat(formData.discount),
        price: parseFloat(formData.price),
        returnDays: parseInt(formData.returnDays),
      };

      await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, updatedProduct);
      setRefresh(!refresh);
      setShowEditModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update product');
    }
  };

  // Animation variants
  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3
      }
    })
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Products Management</h2>
        <div className="d-flex">
          <Button variant="primary" className="me-2">
            <FaPlus className="me-2" />
            Add Product
          </Button>
          <Button variant="outline-secondary" onClick={() => setRefresh(!refresh)}>
            <FaSync />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <Form.Group controlId="search">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch />
            </span>
            <Form.Control
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </Form.Group>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center py-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading products...</p>
        </div>
      )}

      {/* Products Table */}
      {!loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Table striped bordered hover responsive className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Discount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    {searchTerm ? 'No products match your search' : 'No products found'}
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product, index) => (
                  <motion.tr
                    key={product._id}
                    variants={tableRowVariants}
                    initial="hidden"
                    animate="visible"
                    custom={index}
                  >
                    <td>{index + 1}</td>
                    <td>
                      {product.images?.length > 0 ? (
                        <img
                          src={`http://localhost:5000/uploads/${product.images[0].split('/').pop()}`}
                          alt={product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/50';
                          }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', backgroundColor: '#f8f9fa' }} />
                      )}
                    </td>
                    <td>{product.name}</td>
                    <td>{product.category?.name || 'Uncategorized'}</td>
                    <td>${product.price?.toFixed(2) || '0.00'}</td>
                    <td>{product.quantity || 0}</td>
                    <td>{product.discount || 0}%</td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => initiateEdit(product)}
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => confirmDelete(product)}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </Table>
        </motion.div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the product "{productToDelete?.name}"? This action cannot be undone.
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

      {/* Edit Product Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Product</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
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
                onChange={handleInputChange}
              />
            </Form.Group>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  name="quantity"
                  min="0"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Shipping Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="shippingPrice"
                  min="0"
                  step="0.01"
                  value={formData.shippingPrice}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Discount (%)</Form.Label>
                <Form.Control
                  type="number"
                  name="discount"
                  min="0"
                  max="100"
                  value={formData.discount}
                  onChange={handleInputChange}
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Return Days</Form.Label>
                <Form.Select
                  name="returnDays"
                  value={formData.returnDays}
                  onChange={handleInputChange}
                  required
                >
                  {[1, 2, 3, 4, 5, 6, 7].map(days => (
                    <option key={days} value={days}>{days} day{days !== 1 ? 's' : ''}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </div>

            <div className="row">
              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Colors (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="colors"
                  value={formData.colors}
                  onChange={handleInputChange}
                  placeholder="e.g., Red, Blue, Green"
                />
              </Form.Group>

              <Form.Group className="mb-3 col-md-6">
                <Form.Label>Sizes (comma separated)</Form.Label>
                <Form.Control
                  type="text"
                  name="sizes"
                  value={formData.sizes}
                  onChange={handleInputChange}
                  placeholder="e.g., S, M, L, XL"
                />
              </Form.Group>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductsTable;