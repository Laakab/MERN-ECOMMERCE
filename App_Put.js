// App_Put.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { 
  Signup,
  Accept,
  Product,
  Profile,
  Store,
  Chat,
  Order,
  Contact
} = require('./Schema');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for images only
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
// Update payment status
router.put('/api/signups/:id/payment-status', async (req, res) => {
  try {
    const { status } = req.body;
    
    const updatedUser = await Signup.findByIdAndUpdate(
      req.params.id,
      { 'paymentInfo.status': status },
      { new: true }
    );
    
    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Payment status updated successfully',
      user: updatedUser
    });
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating payment status'
    });
  }
});
// Update Product Route
router.put('/api/products/:id', upload.array('images', 10), async (req, res) => {
  try {
    const productId = req.params.id;
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
      returnDays
    } = req.body;

    // Basic validation
    if (!name || !category || !quantity || !shippingPrice || !price || !returnDays) {
      return res.status(400).json({
        success: false,
        message: 'Required fields are missing'
      });
    }

    // Get file paths for new images
    const newImages = req.files?.map(file => file.path.replace(/\\/g, '/')) || [];
    
    // Find existing product to merge with new data
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Parse arrays
    const colorsArray = colors ? JSON.parse(colors) : existingProduct.colors;
    const sizesArray = sizes ? JSON.parse(sizes) : existingProduct.sizes;

    // Combine existing images with new ones (or use only new ones if replacing)
    const images = [...existingProduct.images, ...newImages];

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        name,
        description: description || existingProduct.description,
        category,
        quantity: parseInt(quantity),
        colors: colorsArray,
        sizes: sizesArray,
        shippingPrice: parseFloat(shippingPrice),
        discount: discount ? parseFloat(discount) : existingProduct.discount,
        price: parseFloat(price),
        returnDays: parseInt(returnDays),
        images
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (err) {
    console.error('Product update error:', err);
    
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
      message: err.message || 'Server error during product update'
    });
  }
});

// Update profile route
router.put('/api/profile/:userId', upload.single('backgroundImage'), async (req, res) => {
  try {
    const { themeColor, darkMode } = req.body;
    const userId = req.params.userId;
    
    // Find or create profile
    let profile = await Profile.findOne({ userId });
    
    const updateData = {
      themeColor,
      darkMode: darkMode === 'true',
      updatedAt: new Date()
    };
    
    // Handle background image upload
    if (req.file) {
      updateData.backgroundImage = req.file.path.replace(/\\/g, '/');
    }
    
    if (!profile) {
      updateData.userId = userId;
      profile = new Profile(updateData);
    } else {
      profile.set(updateData);
    }
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Update profile details route
router.put('/api/profile/:userId/update', upload.single('avatar'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const userId = req.params.userId;
    
    // Update user data in Signup collection
    const userUpdate = {};
    if (name) {
      const nameParts = name.split(' ');
      userUpdate.firstName = nameParts[0];
      userUpdate.lastName = nameParts.slice(1).join(' ') || '';
      userUpdate.username = name.replace(/\s+/g, '').toLowerCase();
    }
    if (email) {
      // Check if email already exists
      const existingUser = await Signup.findOne({ email, _id: { $ne: userId } });
      if (existingUser) {
        // Delete uploaded file if email exists
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: 'Email already exists'
        });
      }
      userUpdate.email = email;
    }
    
    const updatedUser = await Signup.findByIdAndUpdate(
      userId,
      userUpdate,
      { new: true }
    );
    
    // Update profile data
    let avatarPath = '';
    if (req.file) {
      avatarPath = `/uploads/${req.file.filename}`; // Store relative path
    }
    
    let profile = await Profile.findOne({ userId });
    if (!profile && req.file) {
      profile = new Profile({
        userId,
        avatar: avatarPath || profile?.avatar || '',
      });
      await profile.save();
    } else if (profile && req.file) {
      // Delete old avatar if exists
      if (profile.avatar) {
        try {
          const oldAvatarPath = path.join(__dirname, '..', profile.avatar);
          fs.unlinkSync(oldAvatarPath);
        } catch (err) {
          console.error('Error deleting old avatar:', err);
        }
      }
      profile.avatar = avatarPath;
      await profile.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role
      },
      profile: profile || {}
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    // Clean up uploaded file if error occurred
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile'
    });
  }
});

// Update password route
router.put('/api/profile/:userId/password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.userId;
    
    // Find user
    const user = await Signup.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password (in real app, use bcrypt.compare)
    if (user.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password (in real app, hash the new password)
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password'
    });
  }
});

// Update store route
router.put('/api/store', upload.single('storeLogo'), async (req, res) => {
  try {
    const { userId, storeName, slogan, country, province, city, town, district, ...tools } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const updateData = {
      storeName,
      slogan,
      location: {
        country,
        province,
        city,
        town,
        district
      },
      tools: {
        featuredProducts: tools.featuredProducts === 'true',
        customerReviews: tools.customerReviews === 'true',
        discountBanner: tools.discountBanner === 'true',
        socialMediaLinks: tools.socialMediaLinks === 'true',
        newsletterSignup: tools.newsletterSignup === 'true'
      },
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.storeLogo = req.file.path.replace(/\\/g, '/');
    }

    const store = await Store.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Store updated successfully',
      store
    });
  } catch (err) {
    console.error('Error updating store:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating store'
    });
  }
});

// Mark messages as read route
router.put('/api/chat/mark-read', async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    
    await Chat.updateMany(
      { senderId, receiverId, read: false },
      { $set: { read: true } }
    );

    res.status(200).json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (err) {
    console.error('Error marking messages as read:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while marking messages as read'
    });
  }
});

// Update message route
router.put('/api/chat/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { newMessage, userId } = req.body;
    
    if (!newMessage || !userId) {
      return res.status(400).json({
        success: false,
        message: 'New message and user ID are required'
      });
    }

    const message = await Chat.findById(id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender
    if (message.senderId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }

    // Check if message is within 15-minute window
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.timestamp < fifteenMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'You can only edit messages within 15 minutes of sending'
      });
    }

    // Update message
    message.message = newMessage;
    message.isEdited = true;
    message.updatedAt = new Date();
    
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message updated successfully',
      updatedMessage: message
    });
  } catch (err) {
    console.error('Error updating message:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating message'
    });
  }
});

// Update order status route
router.put('/api/orders/:id', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });
  } catch (err) {
    console.error('Error updating order:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order'
    });
  }
});


// Mark contact as read
router.put('/api/contacts/:id/read', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Contact marked as read',
      contact
    });
  } catch (err) {
    console.error('Error updating contact:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while updating contact'
    });
  }
});

module.exports = router;