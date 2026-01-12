// App_Post.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const saltRounds = 10;
const { 
    Signup,
    Accept,
    Category,
    Product,
    EventProduct,
    Ads,
    Event,
    AdminPassword,
    Carsual,
    Chat,
    Order,
    Contact
  } = require('./Schema');
// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 5 } // 5MB limit
});

// Event upload configuration
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const eventUpload = multer({ 
  storage: eventStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Update the signup route to always store in Accept collection first
router.post('/api/signup', upload.fields([
  { name: 'paymentScreenshot', maxCount: 1 }
]), async (req, res) => {
  try {
    // Check if username or email already exists in either collection
    const existingUser = await Accept.findOne({ 
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    }) || await Signup.findOne({ 
      $or: [
        { username: req.body.username },
        { email: req.body.email }
      ]
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Username or email already exists' 
      });
    }

    // Handle payment screenshot
    let paymentScreenshotPath = '';
    if (req.files && req.files.paymentScreenshot) {
      paymentScreenshotPath = req.files.paymentScreenshot[0].path.replace(/\\/g, '/');
    }

    // Create new user in Accept collection (pending approval)
    const userData = {
      ...req.body,
      paymentInfo: {
        amount: req.body.paymentAmount,
        transactionId: req.body.transactionId,
        screenshot: paymentScreenshotPath,
        status: (req.body.role === 'shop' || req.body.role === 'deliver') ? 'pending' : 'approved'
      },
      status: 'pending'
    };
    
    // Remove unnecessary fields
    delete userData.paymentAmount;
    delete userData.transactionId;
    delete userData.paymentScreenshot;

    const newUser = new Accept(userData);
    await newUser.save();

    res.status(201).json({ 
      success: true,
      message: 'User created successfully. Waiting for admin approval.',
      user: newUser
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during signup' 
    });
  }
});
// Login endpoint for accepted users (shop/deliver)
// Login Route - Only works with signups collection (approved users)
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email in signups collection ONLY (approved users)
    const user = await Signup.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials or account not approved' 
      });
    }
    
    // Check password (in real app, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    
    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Accept user endpoint - move from Accept to Signup collection
router.post('/api/accept-user', async (req, res) => {
  try {
    const { userId } = req.body;
    
    // Find user in accepts collection
    const user = await Accept.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Create user in signups collection
    const acceptedUser = new Signup(user.toObject());
    await acceptedUser.save();
    
    // Delete from accepts collection
    await Accept.findByIdAndDelete(userId);
    
    res.status(200).json({
      success: true,
      message: 'User accepted successfully'
    });
  } catch (err) {
    console.error('Accept user error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during user acceptance'
    });
  }
});
// Login Route
router.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await Signup.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // In a real app, you should use bcrypt to compare hashed passwords
    if (user.password !== password) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }
    
    // Return user data without password
    const userData = user.toObject();
    delete userData.password;
    
    res.status(200).json({ 
      success: true,
      message: 'Login successful',
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
});

// Category creation route
router.post('/api/categories', upload.array('images', 5), async (req, res) => {
  try {
    console.log('Request body:', req.body); // Debug log
    console.log('Uploaded files:', req.files); // Debug log
    
    const { name, description, quantity } = req.body;
    
    if (!name || !quantity) {
      return res.status(400).json({
        success: false,
        message: 'Name and Quantity are required fields'
      });
    }
    
    // Get file paths
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];
    
    const newCategory = new Category({
      name,
      description: description || '',
      quantity: parseInt(quantity),
      images
    });
    
    await newCategory.save();
    
    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: newCategory
    });
  } catch (err) {
    console.error('Category creation error:', err);
    
    // Clean up uploaded files if error occurred
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during category creation'
    });
  }
});

// Product creation route
router.post('/api/products', upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      quantity,
      colors,
      sizes,
      shippingPrice,
      discount,
      price,
      returnDays,
      createdBy // Get createdBy from the form data
    } = req.body;

    // Basic validation
    if (!name || !category || !quantity || !shippingPrice || !price || !returnDays) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Get file paths
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    // Parse arrays
    const colorsArray = colors ? JSON.parse(colors) : [];
    const sizesArray = sizes ? JSON.parse(sizes) : [];

    const newProduct = new Product({
      name,
      description: description || '',
      category,
      quantity: parseInt(quantity),
      colors: colorsArray,
      sizes: sizesArray,
      shippingPrice: parseFloat(shippingPrice),
      discount: discount ? parseFloat(discount) : 0,
      price: parseFloat(price),
      returnDays: parseInt(returnDays),
      images,
      createdBy // Include the user ID
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (err) {
    console.error('Product creation error:', err);
    // Clean up uploaded files if error occurred
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });
    }
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during product creation'
    });
  }
});

// Create event product route
router.post('/api/event-products', upload.array('images', 10), async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      event,
      quantity,
      colors,
      sizes,
      shippingPrice,
      discount,
      price,
      returnDays
    } = req.body;

    // Basic validation
    if (!name || !category || !quantity || !shippingPrice || !price || !returnDays) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Get file paths
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    // Parse arrays
    const colorsArray = colors ? JSON.parse(colors) : [];
    const sizesArray = sizes ? JSON.parse(sizes) : [];

    // In a real app, you'd get the user ID from the session/token
    const createdBy = req.user?.id || null;

    const newEventProduct = new EventProduct({
      name,
      description: description || '',
      category,
      event: event || null,
      quantity: parseInt(quantity),
      colors: colorsArray,
      sizes: sizesArray,
      shippingPrice: parseFloat(shippingPrice),
      discount: discount ? parseFloat(discount) : 0,
      price: parseFloat(price),
      returnDays: parseInt(returnDays),
      images,
      createdBy
    });

    await newEventProduct.save();

    res.status(201).json({
      success: true,
      message: 'Event product created successfully',
      product: newEventProduct
    });
  } catch (err) {
    console.error('Event product creation error:', err);
    
    // Clean up uploaded files if error occurred
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during event product creation'
    });
  }
});

// Ads creation route
router.post('/api/ads', upload.array('images', 5), async (req, res) => {
  try {
    const {
      adsName,
      adsDescription,
      targetAudience,
      setArea,
      fromDate,
      fromTime,
      toDate,
      toTime
    } = req.body;

    // Basic validation
    if (!adsName || !adsDescription || !targetAudience || !setArea || 
        !fromDate || !fromTime || !toDate || !toTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Parse location data
    let locationData;
    try {
      locationData = JSON.parse(setArea);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: 'Invalid location data'
      });
    }

    // Combine date and time for proper Date objects
    const startDateTime = new Date(`${fromDate}T${fromTime}`);
    const endDateTime = new Date(`${toDate}T${toTime}`);

    // Validate date range
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'End date/time must be after start date/time'
      });
    }

    // Get file paths
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    // In a real app, you'd get the user ID from the session/token
    const createdBy = req.user?.id || null;

    const newAd = new Ads({
      adsName,
      adsDescription,
      targetAudience,
      setArea: locationData,
      fromDate: startDateTime,
      fromTime,
      toDate: endDateTime,
      toTime,
      images,
      createdBy
    });

    await newAd.save();

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      ad: newAd
    });
  } catch (err) {
    console.error('Ad creation error:', err);
    
    // Clean up uploaded files if error occurred
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during ad creation'
    });
  }
});

// Event creation route
router.post('/api/events', eventUpload.array('images'), async (req, res) => {
  try {
    const {
      eventName,
      eventDescription,
      fromDate,
      fromTime,
      toDate,
      toTime
    } = req.body;

    // Basic validation
    if (!eventName || !eventDescription || !fromDate || !fromTime || !toDate || !toTime) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Combine date and time for proper Date objects
    const startDateTime = new Date(`${fromDate}T${fromTime}`);
    const endDateTime = new Date(`${toDate}T${toTime}`);

    // Validate date range
    if (endDateTime <= startDateTime) {
      return res.status(400).json({
        success: false,
        message: 'End date/time must be after start date/time'
      });
    }

    // Get file paths
    const images = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];

    // In a real app, you'd get the user ID from the session/token
    const createdBy = req.user?.id || null;

    const newEvent = new Event({
      eventName,
      eventDescription,
      fromDate: startDateTime,
      fromTime,
      toDate: endDateTime,
      toTime,
      images,
      createdBy
    });

    await newEvent.save();

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      event: newEvent
    });
  } catch (err) {
    console.error('Event creation error:', err);
    
    // Clean up uploaded files if error occurred
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during event creation'
    });
  }
});

// Admin password set route
router.post('/api/admin/set-password', async (req, res) => {
  try {
    console.log('Received password set request:', req.body); // Add this line
    const { password } = req.body;

    if (!password) {
      console.log('Password is required'); // Add this line
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Hash the password before saving
    console.log('Hashing password...'); // Add this line
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log('Password hashed successfully'); // Add this line

    // Delete any existing admin passwords (only one should exist)
    console.log('Deleting existing admin passwords...'); // Add this line
    await AdminPassword.deleteMany({});
    console.log('Existing passwords deleted'); // Add this line

    // Create new admin password
    console.log('Creating new admin password...'); // Add this line
    const newAdminPassword = new AdminPassword({
      password: hashedPassword
    });

    await newAdminPassword.save();
    console.log('Admin password saved successfully'); // Add this line

    res.status(201).json({
      success: true,
      message: 'Admin password set successfully'
    });
  } catch (err) {
    console.error('Admin password set error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during admin password setup'
    });
  }
});

// Verify admin password
router.post('/api/admin/verify', async (req, res) => {
  try {
    const { password } = req.body;
    const adminPass = await AdminPassword.findOne({});
    
    if (!adminPass) {
      return res.status(404).json({ success: false, message: 'Admin password not set' });
    }

    const isMatch = await bcrypt.compare(password, adminPass.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin password' });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create carsual route
router.post('/api/carsuals', upload.array('images', 5), async (req, res) => {
  try {
    const { name, description, store } = req.body;
    
    if (!name || !description || !store || !req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required including at least one image'
      });
    }

    // Get file paths
    const images = req.files.map(file => file.path.replace(/\\/g, '/'));

    const newCarsual = new Carsual({
      name,
      description,
      store,
      images
    });

    await newCarsual.save();

    res.status(201).json({
      success: true,
      message: 'Carsual created successfully',
      carsual: newCarsual
    });
  } catch (err) {
    console.error('Carsual creation error:', err);
    
    // Clean up uploaded files if error occurred
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (unlinkErr) {
          console.error('Error deleting uploaded file:', unlinkErr);
        }
      });
    }
    
    res.status(500).json({
      success: false,
      message: err.message || 'Server error during carsual creation'
    });
  }
});

// Send a message
router.post('/api/chat/send', async (req, res) => {
  try {
    const { senderId, receiverId, message } = req.body;
    
    if (!senderId || !receiverId || !message) {
      return res.status(400).json({
        success: false,
        message: 'Sender ID, receiver ID and message are required'
      });
    }

    const newMessage = new Chat({
      senderId,
      receiverId,
      message
    });

    await newMessage.save();

    // Populate sender info in response
    const populatedMessage = await Chat.findById(newMessage._id)
      .populate('senderId', 'firstName lastName')
      .populate('receiverId', 'firstName lastName');

    res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// Order creation route
router.post('/api/orders', async (req, res) => {
  try {
    const orderData = req.body;
    
    // Basic validation
    if (!orderData.customer || !orderData.items || orderData.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Customer information and at least one item are required'
      });
    }

    // Create new order
    const newOrder = new Order(orderData);
    await newOrder.save();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId: newOrder._id,
      order: newOrder
    });
  } catch (err) {
    console.error('Error creating order:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

router.post('/api/products/batch', async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product IDs'
      });
    }

    const products = await Product.find({ _id: { $in: ids } })
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Error fetching batch products:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});
// Add these endpoints to your existing App_Post.js file

// In App_Post.js - Update the check-email endpoint
router.post('/api/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email exists in Signup collection
    const user = await Signup.findOne({ email });
    
    if (!user) {
      return res.status(200).json({
        success: true,
        exists: false,
        message: 'If this email exists, a reset code has been sent'
      });
    }

    // Generate reset code
    const generateCaptcha = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const resetCode = generateCaptcha();
    const resetCodeExpiry = Date.now() + 600000; // 10 minutes

    // Store reset code in user document
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(resetCodeExpiry);
    await user.save();

// In your check-email endpoint
try {
  await sendResetCodeEmail(email, resetCode);
  res.status(200).json({
    success: true,
    exists: true,
    message: 'Reset code sent to your email'
  });
} catch (emailError) {
  console.error('Email sending failed:', emailError.message);
  
  // Still return success for security, but log the error
  res.status(200).json({
    success: true,
    exists: true,
    message: 'If this email exists, a reset code has been sent'
  });
}
  } catch (err) {
    console.error('Check email error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during email check'
    });
  }
});

// Store reset code with expiration
router.post('/api/store-reset-code', async (req, res) => {
  try {
    const { email, resetCode, resetCodeExpiry } = req.body;
    
    if (!email || !resetCode || !resetCodeExpiry) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset code and expiry are required'
      });
    }

    // Find user and update reset code fields
    const user = await Signup.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store reset code and expiry
    user.resetPasswordToken = resetCode;
    user.resetPasswordExpires = new Date(resetCodeExpiry);
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Reset code stored successfully'
    });
  } catch (err) {
    console.error('Store reset code error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during reset code storage'
    });
  }
});

// Verify reset code
router.post('/api/verify-reset-code', async (req, res) => {
  try {
    const { email, resetCode } = req.body;
    
    if (!email || !resetCode) {
      return res.status(400).json({
        success: false,
        message: 'Email and reset code are required'
      });
    }

    // Find user by email and check reset code
    const user = await Signup.findOne({
      email,
      resetPasswordToken: resetCode,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset code'
      });
    }

    // Generate a secure token for password reset
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    
    // Store the token for the final reset step
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Reset code verified successfully',
      resetToken: resetToken
    });
  } catch (err) {
    console.error('Verify reset code error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during reset code verification'
    });
  }
});

// In App_Post.js - Update the resend-reset-code endpoint
const { sendResetCodeEmail } = require('./emailService');

// Resend reset code - UPDATED
router.post('/api/resend-reset-code', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user
    const user = await Signup.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'If this email exists, a reset code has been sent'
      });
    }

    // Generate new reset code
    const generateCaptcha = () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newResetCode = generateCaptcha();
    const resetCodeExpiry = Date.now() + 600000; // 10 minutes

    // Update user with new reset code
    user.resetPasswordToken = newResetCode;
    user.resetPasswordExpires = new Date(resetCodeExpiry);
    
    await user.save();

    // Send email from server
    try {
      await sendResetCodeEmail(email, newResetCode);
      res.status(200).json({
        success: true,
        message: 'New reset code sent successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({
        success: false,
        message: 'Failed to send email. Please try again later.'
      });
    }
  } catch (err) {
    console.error('Resend reset code error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during reset code resend'
    });
  }
});

// Reset password with token
router.post('/api/reset-password', async (req, res) => {
  try {
    const { email, resetToken, password } = req.body;
    
    if (!email || !resetToken || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email, reset token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user by email and valid reset token
    const user = await Signup.findOne({
      email,
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Update password and clear reset fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset'
    });
  }
});
// Add this to App_Post.js
router.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Find user by email
    const user = await Signup.findOne({ email });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'If this email exists, a reset link has been sent'
      });
    }

    // Generate reset token (simple version - in production use crypto or a library)
    const resetToken = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Save token to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // In a real app, you would send an email here with the reset link
    // For this example, we'll just return the token (don't do this in production)
    
    res.status(200).json({
      success: true,
      message: 'If this email exists, a reset link has been sent',
      token: resetToken // Only for development - remove in production
    });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset request'
    });
  }
});


// Updated /api/contact route in App_Post.js
router.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and message are required fields'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // Create new contact record
    const newContact = new Contact({
      name,
      email,
      subject: subject || 'No subject',
      message
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Thank you for contacting us! We will get back to you soon.'
    });
  } catch (err) {
    console.error('Contact form submission error:', {
      error: err.message,
      stack: err.stack,
      requestBody: req.body,
      timestamp: new Date().toISOString()
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});

// Add rate limiting middleware (install express-rate-limit first)
const rateLimit = require('express-rate-limit');

const resetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many reset attempts, please try again later'
  }
});

// Apply rate limiting to reset endpoints
router.post('/api/check-email', resetLimiter);
router.post('/api/store-reset-code', resetLimiter);
router.post('/api/verify-reset-code', resetLimiter);
router.post('/api/resend-reset-code', resetLimiter);
module.exports = router;