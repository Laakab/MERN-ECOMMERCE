import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Spinner, Alert, Image, Badge ,Row,Col} from 'react-bootstrap';
import { FaEdit, FaTrash, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { motion } from 'framer-motion';

const AdsTable = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAd, setSelectedAd] = useState(null);
  const [formData, setFormData] = useState({
    adsName: '',
    adsDescription: '',
    targetAudience: '',
    setArea: { lat: 0, lng: 0, address: '' },
    fromDate: '',
    fromTime: '',
    toDate: '',
    toTime: ''
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');

  // Fetch ads from the server
  useEffect(() => {
    const fetchAds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/ads');
        setAds(response.data.ads);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch ads');
      } finally {
        setLoading(false);
      }
    };

    fetchAds();
  }, []);

  // Handle delete confirmation
  const handleDelete = async () => {
    try {
      await axios.delete(`http://localhost:5000/api/ads/${selectedAd._id}`);
      setAds(ads.filter(ad => ad._id !== selectedAd._id));
      setShowDeleteModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ad');
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

  // Handle location change
  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      setArea: {
        ...prev.setArea,
        [name]: value
      }
    }));
  };

  // Handle edit submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
    setUpdateError('');

    try {
      // Format dates for the API
      const updatedAd = {
        ...formData,
        fromDate: formData.fromDate.split('T')[0],
        toDate: formData.toDate.split('T')[0],
        setArea: {
          lat: parseFloat(formData.setArea.lat),
          lng: parseFloat(formData.setArea.lng),
          address: formData.setArea.address
        }
      };

      const response = await axios.put(
        `http://localhost:5000/api/ads/${selectedAd._id}`,
        updatedAd
      );

      setAds(ads.map(ad => 
        ad._id === selectedAd._id ? response.data.ad : ad
      ));
      setShowEditModal(false);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update ad');
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

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading ads...</p>
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
        <FaMapMarkerAlt className="me-2" /> Advertisements Management
      </h3>

      {ads.length === 0 ? (
        <Alert variant="info">
          No ads found. Create your first advertisement!
        </Alert>
      ) : (
        <div className="table-responsive">
          <Table striped bordered hover className="shadow-sm">
            <thead className="bg-primary text-white">
              <tr>
                <th>Image</th>
                <th>Ad Name</th>
                <th>Description</th>
                <th>Target Audience</th>
                <th>Location</th>
                <th>Date Range</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr key={ad._id}>
                  <td>
                    {ad.images?.length > 0 ? (
                      <Image 
                        src={`http://localhost:5000/${ad.images[0]}`} 
                        alt={ad.adsName}
                        thumbnail
                        style={{ width: '80px', height: '60px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="text-muted">No image</div>
                    )}
                  </td>
                  <td>{ad.adsName}</td>
                  <td>
                    <div className="text-truncate" style={{ maxWidth: '200px' }}>
                      {ad.adsDescription}
                    </div>
                  </td>
                  <td>
                    <Badge bg="info">{ad.targetAudience}</Badge>
                  </td>
                  <td>
                    <small>{ad.setArea?.address}</small>
                  </td>
                  <td>
                    {formatDate(ad.fromDate)} - {formatDate(ad.toDate)}
                    <br />
                    <small>
                      {formatTime(ad.fromTime)} - {formatTime(ad.toTime)}
                    </small>
                  </td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => {
                        setSelectedAd(ad);
                        setFormData({
                          adsName: ad.adsName,
                          adsDescription: ad.adsDescription,
                          targetAudience: ad.targetAudience,
                          setArea: {
                            lat: ad.setArea?.lat || 0,
                            lng: ad.setArea?.lng || 0,
                            address: ad.setArea?.address || ''
                          },
                          fromDate: new Date(ad.fromDate).toISOString().slice(0, 16),
                          fromTime: ad.fromTime,
                          toDate: new Date(ad.toDate).toISOString().slice(0, 16),
                          toTime: ad.toTime
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
                        setSelectedAd(ad);
                        setShowDeleteModal(true);
                      }}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
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
          Are you sure you want to delete the ad "{selectedAd?.adsName}"?
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

      {/* Edit Ad Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <FaEdit className="me-2" />
            Edit Advertisement
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
              <Form.Label>Ad Name</Form.Label>
              <Form.Control
                type="text"
                name="adsName"
                value={formData.adsName}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="adsDescription"
                value={formData.adsDescription}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Target Audience</Form.Label>
              <Form.Control
                type="text"
                name="targetAudience"
                value={formData.targetAudience}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <h5 className="mt-4 mb-3">
              <FaMapMarkerAlt className="me-2" />
              Location Details
            </h5>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Latitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.000001"
                    name="lat"
                    value={formData.setArea.lat}
                    onChange={handleLocationChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Longitude</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.000001"
                    name="lng"
                    value={formData.setArea.lng}
                    onChange={handleLocationChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Address</Form.Label>
                  <Form.Control
                    type="text"
                    name="address"
                    value={formData.setArea.address}
                    onChange={handleLocationChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <h5 className="mt-4 mb-3">
              <FaCalendarAlt className="me-2" />
              Date & Time
            </h5>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date</Form.Label>
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
                  <Form.Label>Start Time</Form.Label>
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
                  <Form.Label>End Date</Form.Label>
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
                  <Form.Label>End Time</Form.Label>
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

            {selectedAd?.images?.length > 0 && (
              <Form.Group className="mb-3">
                <Form.Label>Current Images</Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {selectedAd.images.map((img, index) => (
                    <Image
                      key={index}
                      src={`http://localhost:5000/${img}`}
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
                'Update Ad'
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </motion.div>
  );
};

export default AdsTable;