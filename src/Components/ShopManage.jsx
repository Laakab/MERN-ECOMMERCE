import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Form, 
  Button, 
  Card, 
  Alert, 
  Image,
  ToggleButton,
  ToggleButtonGroup,
  Badge
} from 'react-bootstrap';
import { 
  FiSave, 
  FiUpload, 
  FiMapPin, 
  FiShoppingBag, 
  FiMessageSquare,
  FiStar,
  FiPercent,
  FiShare2,
  FiMail
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ShopManage = () => {
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    storeName: '',
    slogan: '',
    country: '',
    province: '',
    city: '',
    town: '',
    district: '',
    featuredProducts: true,
    customerReviews: true,
    discountBanner: false,
    socialMediaLinks: false,
    newsletterSignup: false
  });

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user._id) {
          throw new Error('User not logged in');
        }

        const response = await axios.get(`http://localhost:5000/api/store?userId=${user._id}`);
        if (response.data.success) {
          setStore(response.data.store);
          setFormData({
            storeName: response.data.store.storeName,
            slogan: response.data.store.slogan,
            country: response.data.store.location?.country || '',
            province: response.data.store.location?.province || '',
            city: response.data.store.location?.city || '',
            town: response.data.store.location?.town || '',
            district: response.data.store.location?.district || '',
            featuredProducts: response.data.store.tools?.featuredProducts || false,
            customerReviews: response.data.store.tools?.customerReviews || false,
            discountBanner: response.data.store.tools?.discountBanner || false,
            socialMediaLinks: response.data.store.tools?.socialMediaLinks || false,
            newsletterSignup: response.data.store.tools?.newsletterSignup || false
          });

          if (response.data.store.storeLogo) {
            setLogoPreview(`http://localhost:5000/${response.data.store.storeLogo}`);
          }
        }
      } catch (err) {
        console.error('Error fetching store:', err);
        setError(err.message || 'Failed to load store settings');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleToolToggle = (toolName) => {
    setFormData(prev => ({
      ...prev,
      [toolName]: !prev[toolName]
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User not logged in');
      }

      const form = new FormData();
      form.append('userId', user._id);
      form.append('storeName', formData.storeName);
      form.append('slogan', formData.slogan);
      form.append('country', formData.country);
      form.append('province', formData.province);
      form.append('city', formData.city);
      form.append('town', formData.town);
      form.append('district', formData.district);
      form.append('featuredProducts', formData.featuredProducts);
      form.append('customerReviews', formData.customerReviews);
      form.append('discountBanner', formData.discountBanner);
      form.append('socialMediaLinks', formData.socialMediaLinks);
      form.append('newsletterSignup', formData.newsletterSignup);

      if (e.target.storeLogo.files[0]) {
        form.append('storeLogo', e.target.storeLogo.files[0]);
      }

      const response = await axios.put('http://localhost:5000/api/store', form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setStore(response.data.store);
        setSuccess('Store settings saved successfully!');
        setTimeout(() => {
          setSuccess(null);
          navigate('/shop');
        }, 2000);
      }
    } catch (err) {
      console.error('Error saving store:', err);
      setError(err.response?.data?.message || err.message || 'Failed to save store settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !store) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading your shop settings...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">
          {error}
        </Alert>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="mb-4">Shop Management</h1>
        
        {success && (
          <Alert variant="success" className="mb-4">
            {success}
          </Alert>
        )}

        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">
              <FiShoppingBag className="me-2" />
              Basic Shop Information
            </h5>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Store Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="storeName"
                      value={formData.storeName}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Slogan</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="slogan"
                      value={formData.slogan}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Store Logo</Form.Label>
                    <Form.Control
                      type="file"
                      name="storeLogo"
                      accept="image/*"
                      onChange={handleLogoChange}
                    />
                    {logoPreview && (
                      <div className="mt-3">
                        <Image 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          thumbnail 
                          style={{ maxWidth: '150px' }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <h5 className="mb-3">
                    <FiMapPin className="me-2" />
                    Location
                  </h5>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Country</Form.Label>
                    <Form.Control
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Province/State</Form.Label>
                    <Form.Control
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>City</Form.Label>
                    <Form.Control
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Town</Form.Label>
                    <Form.Control
                      type="text"
                      name="town"
                      value={formData.town}
                      onChange={handleInputChange}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>District</Form.Label>
                    <Form.Control
                      type="text"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <hr className="my-4" />

              <h5 className="mb-3">
                <FiMessageSquare className="me-2" />
                Shop Tools
              </h5>
              <p className="text-muted mb-4">
                Enable or disable additional features for your shop
              </p>

              <Row>
                <Col md={6}>
                  <ToggleButtonGroup
                    type="checkbox"
                    className="w-100 mb-3"
                  >
                    <ToggleButton
                      id="featuredProducts"
                      value={formData.featuredProducts}
                      variant={formData.featuredProducts ? 'primary' : 'outline-secondary'}
                      onChange={() => handleToolToggle('featuredProducts')}
                    >
                      <FiStar className="me-2" />
                      Featured Products
                      <Badge bg={formData.featuredProducts ? 'light' : 'secondary'} className="ms-2">
                        {formData.featuredProducts ? 'ON' : 'OFF'}
                      </Badge>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    type="checkbox"
                    className="w-100 mb-3"
                  >
                    <ToggleButton
                      id="customerReviews"
                      value={formData.customerReviews}
                      variant={formData.customerReviews ? 'primary' : 'outline-secondary'}
                      onChange={() => handleToolToggle('customerReviews')}
                    >
                      <FiMessageSquare className="me-2" />
                      Customer Reviews
                      <Badge bg={formData.customerReviews ? 'light' : 'secondary'} className="ms-2">
                        {formData.customerReviews ? 'ON' : 'OFF'}
                      </Badge>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    type="checkbox"
                    className="w-100 mb-3"
                  >
                    <ToggleButton
                      id="discountBanner"
                      value={formData.discountBanner}
                      variant={formData.discountBanner ? 'primary' : 'outline-secondary'}
                      onChange={() => handleToolToggle('discountBanner')}
                    >
                      <FiPercent className="me-2" />
                      Discount Banner
                      <Badge bg={formData.discountBanner ? 'light' : 'secondary'} className="ms-2">
                        {formData.discountBanner ? 'ON' : 'OFF'}
                      </Badge>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Col>

                <Col md={6}>
                  <ToggleButtonGroup
                    type="checkbox"
                    className="w-100 mb-3"
                  >
                    <ToggleButton
                      id="socialMediaLinks"
                      value={formData.socialMediaLinks}
                      variant={formData.socialMediaLinks ? 'primary' : 'outline-secondary'}
                      onChange={() => handleToolToggle('socialMediaLinks')}
                    >
                      <FiShare2 className="me-2" />
                      Social Media Links
                      <Badge bg={formData.socialMediaLinks ? 'light' : 'secondary'} className="ms-2">
                        {formData.socialMediaLinks ? 'ON' : 'OFF'}
                      </Badge>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <ToggleButtonGroup
                    type="checkbox"
                    className="w-100 mb-3"
                  >
                    <ToggleButton
                      id="newsletterSignup"
                      value={formData.newsletterSignup}
                      variant={formData.newsletterSignup ? 'primary' : 'outline-secondary'}
                      onChange={() => handleToolToggle('newsletterSignup')}
                    >
                      <FiMail className="me-2" />
                      Newsletter Signup
                      <Badge bg={formData.newsletterSignup ? 'light' : 'secondary'} className="ms-2">
                        {formData.newsletterSignup ? 'ON' : 'OFF'}
                      </Badge>
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Col>
              </Row>

              <div className="d-flex justify-content-end mt-4">
                <Button 
                  variant="primary" 
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (
                    <>
                      <FiSave className="me-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </motion.div>
    </Container>
  );
};

export default ShopManage;