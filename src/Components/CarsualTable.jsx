import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const CarsualTable = () => {
  const [carsuals, setCarsuals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const API_BASE_URL = 'http://localhost:5000';

  // Fetch carsuals from API
  useEffect(() => {
    const fetchCarsuals = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/carsuals`);
        if (response.data.success) {
          setCarsuals(response.data.carsuals || []);
        } else {
          setError(response.data.message || 'Failed to fetch carsuals');
        }
      } catch (err) {
        let errorMessage = 'Failed to fetch carsuals';
        if (err.response) {
          errorMessage = err.response.data.message || err.response.statusText;
        } else if (err.request) {
          errorMessage = 'No response from server';
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCarsuals();
  }, []);

  // Handle delete button click
  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await axios.delete(`${API_BASE_URL}/api/carsuals/${deleteId}`);
      setCarsuals(carsuals.filter(carsual => carsual._id !== deleteId));
      setShowDeleteModal(false);
    } catch (err) {
      console.error('Error deleting carsual:', err);
      setError(err.response?.data?.message || 'Failed to delete carsual. Please try again.');
    } finally {
      setDeleting(false);
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

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="mt-3">
        {error}
      </Alert>
    );
  }

  return (
    <div className="mt-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h3 className="mb-4">Carsuals Management</h3>
        
        {carsuals.length === 0 ? (
          <Alert variant="info">
            No carsuals found. Please add some carsuals to display here.
          </Alert>
        ) : (
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Description</th>
                <th>Store</th>
                <th>Images</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {carsuals.map((carsual, index) => (
                <motion.tr
                  key={carsual._id}
                  variants={tableRowVariants}
                  initial="hidden"
                  animate="visible"
                  custom={index}
                >
                  <td>{index + 1}</td>
                  <td>{carsual.name}</td>
                  <td>{carsual.description}</td>
                  <td>{carsual.store}</td>
                  <td>
                    {carsual.images.length > 0 ? (
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {carsual.images.map((image, idx) => (
                          <img 
                            key={idx}
                            src={`${API_BASE_URL}/${image}`} 
                            alt={`Carsual ${idx + 1}`}
                            style={{ 
                              width: '50px', 
                              height: '50px', 
                              objectFit: 'cover',
                              borderRadius: '4px'
                            }}
                          />
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted">No images</span>
                    )}
                  </td>
                  <td>
                    {new Date(carsual.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteClick(carsual._id)}
                        disabled={deleting}
                      >
                        <FaTrash /> Delete
                      </Button>
                    </motion.div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </Table>
        )}
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Confirm Delete
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this carsual? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                {' Deleting...'}
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default CarsualTable;