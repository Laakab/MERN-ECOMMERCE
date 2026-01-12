import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaUser } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "The Future of E-Commerce",
      excerpt: "Discover how AI and VR are transforming online shopping experiences worldwide.",
      date: "May 15, 2023",
      author: "Jane Doe",
      image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 2,
      title: "Sustainable Shopping",
      excerpt: "Learn how to make eco-friendly choices when shopping online and reduce your carbon footprint.",
      date: "April 28, 2023",
      author: "John Smith",
      image: "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    },
    {
      id: 3,
      title: "Mobile Commerce Trends",
      excerpt: "Why mobile shopping is dominating the e-commerce landscape and what to expect next.",
      date: "March 10, 2023",
      author: "Alex Johnson",
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=80"
    }
  ];

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const fadeInUp = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10
      }
    }
  };

  return (
    <section className="py-5 bg-light">
      <Container>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-5"
        >
          <h2 className="fw-bold">Latest From Our Blog</h2>
          <p className="lead">Stay updated with the latest trends and news in e-commerce</p>
        </motion.div>
        
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Row className="g-4">
            {blogPosts.map((post) => (
              <Col md={4} key={post.id}>
                <motion.div variants={fadeInUp}>
                  <Card className="h-100 border-0 shadow-sm overflow-hidden blog-card">
                    <div className="blog-image-container">
                      <Card.Img variant="top" src={post.image} className="blog-image" />
                    </div>
                    <Card.Body>
                      <div className="d-flex mb-3 text-muted small">
                        <span className="me-3"><FaCalendarAlt className="me-1" /> {post.date}</span>
                        <span><FaUser className="me-1" /> {post.author}</span>
                      </div>
                      <Card.Title>{post.title}</Card.Title>
                      <Card.Text>{post.excerpt}</Card.Text>
                      <Button variant="outline-primary" className="mt-3">Read More</Button>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </motion.div>
        
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="text-center mt-5"
        >
          <Button variant="primary" size="lg">View All Blog Posts</Button>
        </motion.div>
      </Container>
    </section>
  );
};

export default Blog; 
// import React, { useState } from 'react';
// import { Container, Form, Button, Row, Col, Card, FloatingLabel, Alert } from 'react-bootstrap';
// import { FaPlus, FaImage, FaPaperPlane, FaTimes } from 'react-icons/fa';
// import { motion } from 'framer-motion';
// import axios from 'axios';

// const BlogForm = () => {
//   const [formData, setFormData] = useState({
//     title: '',
//     author: '',
//     content: '',
//     excerpt: '',
//     categories: [],
//     tags: [],
//     isFeatured: false
//   });
//   const [featuredImage, setFeaturedImage] = useState(null);
//   const [previewImage, setPreviewImage] = useState(null);
//   const [newCategory, setNewCategory] = useState('');
//   const [newTag, setNewTag] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [success, setSuccess] = useState(false);
//   const [error, setError] = useState(null);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === 'checkbox' ? checked : value
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFeaturedImage(file);
//       setPreviewImage(URL.createObjectURL(file));
//     }
//   };

//   const handleAddCategory = () => {
//     if (newCategory.trim() && !formData.categories.includes(newCategory.trim())) {
//       setFormData({
//         ...formData,
//         categories: [...formData.categories, newCategory.trim()]
//       });
//       setNewCategory('');
//     }
//   };

//   const handleRemoveCategory = (category) => {
//     setFormData({
//       ...formData,
//       categories: formData.categories.filter(c => c !== category)
//     });
//   };

//   const handleAddTag = () => {
//     if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
//       setFormData({
//         ...formData,
//         tags: [...formData.tags, newTag.trim()]
//       });
//       setNewTag('');
//     }
//   };

//   const handleRemoveTag = (tag) => {
//     setFormData({
//       ...formData,
//       tags: formData.tags.filter(t => t !== tag)
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
//     setError(null);
    
//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append('title', formData.title);
//       formDataToSend.append('author', formData.author);
//       formDataToSend.append('content', formData.content);
//       formDataToSend.append('excerpt', formData.excerpt);
//       formDataToSend.append('categories', JSON.stringify(formData.categories));
//       formDataToSend.append('tags', JSON.stringify(formData.tags));
//       formDataToSend.append('isFeatured', formData.isFeatured);
//       if (featuredImage) {
//         formDataToSend.append('featuredImage', featuredImage);
//       }

//       const response = await axios.post('/api/blogs', formDataToSend, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       if (response.data.success) {
//         setSuccess(true);
//         // Reset form
//         setFormData({
//           title: '',
//           author: '',
//           content: '',
//           excerpt: '',
//           categories: [],
//           tags: [],
//           isFeatured: false
//         });
//         setFeaturedImage(null);
//         setPreviewImage(null);
//         // Hide success message after 5 seconds
//         setTimeout(() => setSuccess(false), 5000);
//       }
//     } catch (err) {
//       console.error('Error submitting blog:', err);
//       setError(err.response?.data?.message || 'Failed to create blog');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Container className="py-5">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         <Card className="border-0 shadow-sm">
//           <Card.Body>
//             <Card.Title className="mb-4 text-center">
//               <h2 className="fw-bold">Add New Blog Post</h2>
//             </Card.Title>

//             {success && (
//               <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//               >
//                 <Alert variant="success" className="mb-4">
//                   Blog post created successfully!
//                 </Alert>
//               </motion.div>
//             )}

//             {error && (
//               <motion.div
//                 initial={{ opacity: 0, y: -20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 exit={{ opacity: 0, y: -20 }}
//               >
//                 <Alert variant="danger" className="mb-4">
//                   {error}
//                 </Alert>
//               </motion.div>
//             )}

//             <Form onSubmit={handleSubmit}>
//               <Row className="g-4">
//                 <Col md={6}>
//                   <FloatingLabel controlId="title" label="Title" className="mb-3">
//                     <Form.Control
//                       type="text"
//                       name="title"
//                       value={formData.title}
//                       onChange={handleChange}
//                       placeholder="Enter blog title"
//                       required
//                     />
//                   </FloatingLabel>
//                 </Col>

//                 <Col md={6}>
//                   <FloatingLabel controlId="author" label="Author" className="mb-3">
//                     <Form.Control
//                       type="text"
//                       name="author"
//                       value={formData.author}
//                       onChange={handleChange}
//                       placeholder="Enter author name"
//                       required
//                     />
//                   </FloatingLabel>
//                 </Col>

//                 <Col md={12}>
//                   <FloatingLabel controlId="excerpt" label="Excerpt" className="mb-3">
//                     <Form.Control
//                       as="textarea"
//                       name="excerpt"
//                       value={formData.excerpt}
//                       onChange={handleChange}
//                       placeholder="Enter short excerpt"
//                       style={{ height: '100px' }}
//                       required
//                     />
//                   </FloatingLabel>
//                 </Col>

//                 <Col md={12}>
//                   <FloatingLabel controlId="content" label="Content" className="mb-3">
//                     <Form.Control
//                       as="textarea"
//                       name="content"
//                       value={formData.content}
//                       onChange={handleChange}
//                       placeholder="Enter blog content"
//                       style={{ height: '200px' }}
//                       required
//                     />
//                   </FloatingLabel>
//                 </Col>

//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Categories</Form.Label>
//                     <div className="d-flex mb-2">
//                       <Form.Control
//                         type="text"
//                         value={newCategory}
//                         onChange={(e) => setNewCategory(e.target.value)}
//                         placeholder="Add new category"
//                       />
//                       <Button
//                         variant="outline-primary"
//                         className="ms-2"
//                         onClick={handleAddCategory}
//                         type="button"
//                       >
//                         <FaPlus />
//                       </Button>
//                     </div>
//                     <div className="d-flex flex-wrap gap-2">
//                       {formData.categories.map((category) => (
//                         <motion.div
//                           key={category}
//                           initial={{ scale: 0.9 }}
//                           animate={{ scale: 1 }}
//                           whileHover={{ scale: 1.05 }}
//                           className="badge bg-primary d-flex align-items-center"
//                         >
//                           {category}
//                           <Button
//                             variant="link"
//                             className="text-white p-0 ms-1"
//                             onClick={() => handleRemoveCategory(category)}
//                           >
//                             <FaTimes size={12} />
//                           </Button>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </Form.Group>
//                 </Col>

//                 <Col md={6}>
//                   <Form.Group className="mb-3">
//                     <Form.Label>Tags</Form.Label>
//                     <div className="d-flex mb-2">
//                       <Form.Control
//                         type="text"
//                         value={newTag}
//                         onChange={(e) => setNewTag(e.target.value)}
//                         placeholder="Add new tag"
//                       />
//                       <Button
//                         variant="outline-secondary"
//                         className="ms-2"
//                         onClick={handleAddTag}
//                         type="button"
//                       >
//                         <FaPlus />
//                       </Button>
//                     </div>
//                     <div className="d-flex flex-wrap gap-2">
//                       {formData.tags.map((tag) => (
//                         <motion.div
//                           key={tag}
//                           initial={{ scale: 0.9 }}
//                           animate={{ scale: 1 }}
//                           whileHover={{ scale: 1.05 }}
//                           className="badge bg-secondary d-flex align-items-center"
//                         >
//                           {tag}
//                           <Button
//                             variant="link"
//                             className="text-white p-0 ms-1"
//                             onClick={() => handleRemoveTag(tag)}
//                           >
//                             <FaTimes size={12} />
//                           </Button>
//                         </motion.div>
//                       ))}
//                     </div>
//                   </Form.Group>
//                 </Col>

//                 <Col md={6}>
//                   <Form.Group className="mb-4">
//                     <Form.Label>Featured Image</Form.Label>
//                     <div className="border rounded p-3 text-center">
//                       {previewImage ? (
//                         <motion.div
//                           initial={{ opacity: 0 }}
//                           animate={{ opacity: 1 }}
//                           className="mb-3"
//                         >
//                           <img
//                             src={previewImage}
//                             alt="Preview"
//                             className="img-fluid rounded"
//                             style={{ maxHeight: '200px' }}
//                           />
//                           <Button
//                             variant="outline-danger"
//                             size="sm"
//                             className="mt-2"
//                             onClick={() => {
//                               setFeaturedImage(null);
//                               setPreviewImage(null);
//                             }}
//                           >
//                             <FaTimes className="me-1" />
//                             Remove Image
//                           </Button>
//                         </motion.div>
//                       ) : (
//                         <Form.Label className="d-flex flex-column align-items-center justify-content-center cursor-pointer">
//                           <FaImage size={48} className="text-muted mb-2" />
//                           <span className="text-muted">Click to upload image</span>
//                           <Form.Control
//                             type="file"
//                             accept="image/*"
//                             onChange={handleImageChange}
//                             className="d-none"
//                           />
//                         </Form.Label>
//                       )}
//                     </div>
//                   </Form.Group>
//                 </Col>

//                 <Col md={6}>
//                   <Form.Group className="mb-4">
//                     <Form.Check
//                       type="checkbox"
//                       id="isFeatured"
//                       label="Featured Post"
//                       name="isFeatured"
//                       checked={formData.isFeatured}
//                       onChange={handleChange}
//                     />
//                   </Form.Group>
//                 </Col>

//                 <Col md={12} className="text-center">
//                   <motion.div
//                     whileHover={{ scale: 1.02 }}
//                     whileTap={{ scale: 0.98 }}
//                   >
//                     <Button
//                       variant="primary"
//                       size="lg"
//                       type="submit"
//                       disabled={isSubmitting}
//                     >
//                       {isSubmitting ? 'Submitting...' : (
//                         <>
//                           <FaPaperPlane className="me-2" />
//                           Submit Blog Post
//                         </>
//                       )}
//                     </Button>
//                   </motion.div>
//                 </Col>
//               </Row>
//             </Form>
//           </Card.Body>
//         </Card>
//       </motion.div>
//     </Container>
//   );
// };

// export default BlogForm;