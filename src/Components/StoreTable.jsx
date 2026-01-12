import React, { useState, useEffect } from 'react';
import { Table, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import { FaTrash, FaStore } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const ShopTable = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState(null);

  // Animation variants
  const tableVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  // Fetch stores from API
  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/stores');
        setStores(response.data.stores);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch stores');
        setLoading(false);
      }
    };

    fetchStores();
  }, []);

  // Handle delete confirmation
  const handleDeleteClick = (store) => {
    setStoreToDelete(store);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/stores/${storeToDelete._id}`);
      setStores(stores.filter(store => store._id !== storeToDelete._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete store');
      setShowDeleteModal(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center mt-5">
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
    <div className="p-4">
      <h2 className="mb-4 d-flex align-items-center">
        <FaStore className="me-2" /> Shops Management
      </h2>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={tableVariants}
      >
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Logo</th>
              <th>Shop Name</th>
              <th>Owner</th>
              <th>Location</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {stores.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center">No shops found</td>
              </tr>
            ) : (
              stores.map((store) => (
                <motion.tr key={store._id} variants={rowVariants}>
                  <td>
                    {store.storeLogo ? (
                      <img 
                        src={`http://localhost:5000/${store.storeLogo}`} 
                        alt="Store Logo" 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0' }}></div>
                    )}
                  </td>
                  <td>{store.storeName}</td>
                  <td>
                    {store.userId?.firstName} {store.userId?.lastName}
                    <br />
                    <small className="text-muted">{store.userId?.email}</small>
                  </td>
                  <td>
                    {store.location?.city && `${store.location.city}, `}
                    {store.location?.country}
                  </td>
                  <td>{formatDate(store.createdAt)}</td>
                  <td>
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDeleteClick(store)}
                    >
                      <FaTrash /> Delete
                    </Button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </Table>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the shop "{storeToDelete?.storeName}"?
          <br />
          This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ShopTable;