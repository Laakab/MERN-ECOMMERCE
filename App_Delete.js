// App_Delete.js
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
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
  Profile,
  Store,
  Chat,
  Order,
  Contact
} = require('./Schema');
// Reject user endpoint - delete from accepts collection
router.delete('/api/reject-user/:id', async (req, res) => {
  try {
    const deletedUser = await Accept.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User rejected successfully'
    });
  } catch (err) {
    console.error('Error rejecting user:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting user'
    });
  }
});
// Delete Product Route
router.delete('/api/products/:id', async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    
    if (!deletedProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Clean up product images
    if (deletedProduct.images && deletedProduct.images.length > 0) {
      deletedProduct.images.forEach(imagePath => {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkErr) {
          console.error('Error deleting product image:', unlinkErr);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting product'
    });
  }
});

// Delete signup
router.delete('/api/signups/:id', async (req, res) => {
  try {
    const deletedUser = await Signup.findByIdAndDelete(req.params.id);
    
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user'
    });
  }
});

// Delete admin password
router.delete('/api/admin/passwords/:id', async (req, res) => {
  try {
    const deletedPassword = await AdminPassword.findByIdAndDelete(req.params.id);
    
    if (!deletedPassword) {
      return res.status(404).json({
        success: false,
        message: 'Password not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Password deleted successfully'
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting password'
    });
  }
});

// Delete carsual route
router.delete('/api/carsuals/:id', async (req, res) => {
  try {
    const deletedCarsual = await Carsual.findByIdAndDelete(req.params.id);
    
    if (!deletedCarsual) {
      return res.status(404).json({
        success: false,
        message: 'Carsual not found'
      });
    }

    // Clean up images
    if (deletedCarsual.images && deletedCarsual.images.length > 0) {
      deletedCarsual.images.forEach(imagePath => {
        try {
          fs.unlinkSync(imagePath);
        } catch (unlinkErr) {
          console.error('Error deleting carsual image:', unlinkErr);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Carsual deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting carsual:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting carsual'
    });
  }
});

// Delete store
router.delete('/api/stores/:id', async (req, res) => {
  try {
    const deletedStore = await Store.findByIdAndDelete(req.params.id);
    
    if (!deletedStore) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    // Clean up store logo if exists
    if (deletedStore.storeLogo) {
      try {
        fs.unlinkSync(deletedStore.storeLogo);
      } catch (unlinkErr) {
        console.error('Error deleting store logo:', unlinkErr);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Store deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting store:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting store'
    });
  }
});

// Delete message (soft delete)
router.delete('/api/chat/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
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
        message: 'You can only delete your own messages'
      });
    }

    // Check if message is within 15-minute window
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    if (message.timestamp < fifteenMinutesAgo) {
      return res.status(400).json({
        success: false,
        message: 'You can only delete messages within 15 minutes of sending'
      });
    }

    // Soft delete the message
    message.isDeleted = true;
    message.updatedAt = new Date();
    
    await message.save();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting message:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting message'
    });
  }
});

// Delete order
router.delete('/api/orders/:id', async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (err) {
    console.error('Error cancelling order:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// Delete Ad Route
router.delete('/api/ads/:id', async (req, res) => {
  try {
    const deletedAd = await Ads.findByIdAndDelete(req.params.id);
    
    if (!deletedAd) {
      return res.status(404).json({
        success: false,
        message: 'Ad not found'
      });
    }

    // Clean up ad images
    if (deletedAd.images && deletedAd.images.length > 0) {
      deletedAd.images.forEach(imagePath => {
        try {
          const fullPath = path.join(__dirname, '..', imagePath);
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.error('Error deleting ad image:', unlinkErr);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting ad:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting ad'
    });
  }
});

// Delete Event Route
router.delete('/api/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    
    if (!deletedEvent) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    // Clean up event images
    if (deletedEvent.images && deletedEvent.images.length > 0) {
      deletedEvent.images.forEach(imagePath => {
        try {
          const fullPath = path.join(__dirname, '..', imagePath);
          fs.unlinkSync(fullPath);
        } catch (unlinkErr) {
          console.error('Error deleting event image:', unlinkErr);
        }
      });
    }

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting event'
    });
  }
});

module.exports = router;