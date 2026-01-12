// App_Get.js
const express = require('express');
const router = express.Router();
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
// Signup routes
router.get('/api/signups/:id', async (req, res) => {
  try {
    const user = await Signup.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Remove sensitive data
    const userData = user.toObject();
    delete userData.password;
    
    res.status(200).json({
      success: true,
      user: userData
    });
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
});

// router.get('/api/signups', async (req, res) => {
//   try {
//     const { page = 1, pageSize = 10 } = req.query;
//     const skip = (page - 1) * pageSize;

//     const [users, total] = await Promise.all([
//       Signup.find().skip(skip).limit(parseInt(pageSize)),
//       Signup.countDocuments()
//     ]);

//     res.status(200).json({
//       success: true,
//       users,
//       total
//     });
//   } catch (err) {
//     console.error('Error fetching signups:', err);
//     res.status(500).json({
//       success: false,
//       message: 'Server error while fetching signups'
//     });
//   }
// });

// Category routes
router.get('/api/signups', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, status } = req.query;
    const skip = (page - 1) * pageSize;

    let query = {};
    if (status) {
      query.status = status;
    } else {
      // Default: show only pending users
      query.status = 'pending';
    }

    const [users, total] = await Promise.all([
      Signup.find(query).skip(skip).limit(parseInt(pageSize)),
      Signup.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      users,
      total
    });
  } catch (err) {
    console.error('Error fetching signups:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching signups'
    });
  }
});

router.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    
    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category._id });
        return {
          ...category.toObject(),
          productCount
        };
      })
    );
    
    res.status(200).json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

router.get('/api/categories/list', async (req, res) => {
  try {
    const categories = await Category.find({}, 'name');
    res.status(200).json({
      success: true,
      categories
    });
  } catch (err) {
    console.error('Error fetching categories list:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories list'
    });
  }
});

// Product routes
router.get('/api/products', async (req, res) => {
  try {
    const { category, createdBy } = req.query;
    let query = {};
    
    if (category) {
      query.category = category;
    }
    if (createdBy) {
      query.createdBy = createdBy;
    }

    const products = await Product.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching products'
    });
  }
});

router.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (err) {
    console.error('Error fetching product:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching product'
    });
  }
});

// Event routes
router.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      events
    });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events'
    });
  }
});

router.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.status(200).json({
      success: true,
      event
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event'
    });
  }
});

router.get('/api/events/list', async (req, res) => {
  try {
    const events = await Event.find({}, 'eventName');
    res.status(200).json({
      success: true,
      events
    });
  } catch (err) {
    console.error('Error fetching events list:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching events list'
    });
  }
});

// Event Product routes
router.get('/api/event-products', async (req, res) => {
  try {
    const { event } = req.query;
    let query = {};
    if (event) {
      query.event = event;
    }
    
    const products = await EventProduct.find(query)
      .populate('category', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      success: true,
      products
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching event products'
    });
  }
});

// Get all event products route
// app.get('/api/event-products', async (req, res) => {
//     try {
//       const products = await EventProduct.find()
//         .sort({ createdAt: -1 })
//         .populate('event', 'eventName')
//         .populate('category', 'name');
//       res.status(200).json({
//         success: true,
//         products
//       });
//     } catch (err) {
//       console.error('Error fetching event products:', err);
//       res.status(500).json({
//         success: false,
//         message: 'Server error while fetching event products'
//       });
//     }
//   });

// Ads routes
router.get('/api/ads', async (req, res) => {
  try {
    const ads = await Ads.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      ads
    });
  } catch (err) {
    console.error('Error fetching ads:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching ads'
    });
  }
});

// Admin routes
router.get('/api/admin/has-password', async (req, res) => {
  try {
    const hasPassword = await AdminPassword.exists({});
    res.status(200).json({ hasPassword });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/api/admin/passwords', async (req, res) => {
  try {
    const passwords = await AdminPassword.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      passwords
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admin passwords'
    });
  }
});

// Carsual routes
router.get('/api/carsuals', async (req, res) => {
  try {
    const carsuals = await Carsual.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      carsuals
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching carsuals'
    });
  }
});

// Profile routes
router.get('/api/profile/:userId', async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.params.userId });
    const profileData = profile ? profile.toObject() : {};
    
    // Add full URL to avatar if it exists
    if (profileData.avatar) {
      profileData.avatar = `http://localhost:5000${profileData.avatar}`;
    }
    
    res.status(200).json({
      success: true,
      profile: profileData
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile'
    });
  }
});

// Store routes
router.get('/api/store', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    let store = await Store.findOne({ userId });
    
    if (!store) {
      // Create default store if not exists
      store = new Store({
        userId,
        storeName: 'My Shop',
        slogan: 'Welcome to my shop!',
        tools: {
          featuredProducts: true,
          customerReviews: true,
          discountBanner: false,
          socialMediaLinks: false,
          newsletterSignup: false
        }
      });
      await store.save();
    }

    res.status(200).json({
      success: true,
      store
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching store'
    });
  }
});

router.get('/api/stores', async (req, res) => {
  try {
    const stores = await Store.find().populate('userId', 'firstName lastName email');
    res.status(200).json({
      success: true,
      stores
    });
  } catch (err) {
    console.error('Error fetching stores:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stores'
    });
  }
});

router.get('/api/stores/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('userId', 'firstName lastName email');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      store
    });
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching store'
    });
  }
});

router.get('/api/stores/user/:userId', async (req, res) => {
  try {
    const store = await Store.findOne({ userId: req.params.userId })
      .populate('userId', 'firstName lastName email');
    
    if (!store) {
      return res.status(404).json({
        success: false,
        message: 'Store not found'
      });
    }

    res.status(200).json({
      success: true,
      store
    });
  } catch (err) {
    console.error('Error fetching store:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching store'
    });
  }
});

// Chat routes
router.get('/api/chat/admins', async (req, res) => {
  try {
    const admins = await Signup.find({ role: 'admin' }, '_id firstName lastName');
    res.status(200).json({
      success: true,
      admins
    });
  } catch (err) {
    console.error('Error fetching admins:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching admins'
    });
  }
});

router.get('/api/chat/shops', async (req, res) => {
  try {
    const shops = await Signup.find({ role: 'shop' }, '_id firstName lastName');
    res.status(200).json({
      success: true,
      shops
    });
  } catch (err) {
    console.error('Error fetching shops:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shops'
    });
  }
});

router.get('/api/chat/shop-messages', async (req, res) => {
  try {
    const { shopId } = req.query;
    
    if (!shopId) {
      return res.status(400).json({
        success: false,
        message: 'Shop ID is required'
      });
    }

    // Find all messages where shop is either sender or receiver
    const messages = await Chat.find({
      $or: [
        { senderId: shopId },
        { receiverId: shopId }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('senderId', 'firstName lastName role')
    .populate('receiverId', 'firstName lastName role');

    res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    console.error('Error fetching shop messages:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shop messages'
    });
  }
});

router.get('/api/chat/messages', async (req, res) => {
  try {
    const { userId1, userId2 } = req.query;
    
    if (!userId1 || !userId2) {
      return res.status(400).json({
        success: false,
        message: 'Both user IDs are required'
      });
    }

    const messages = await Chat.find({
      $or: [
        { senderId: userId1, receiverId: userId2, isDeleted: false },
        { senderId: userId2, receiverId: userId1, isDeleted: false }
      ]
    })
    .sort({ timestamp: 1 })
    .populate('senderId', 'firstName lastName')
    .populate('receiverId', 'firstName lastName');

    res.status(200).json({
      success: true,
      messages
    });
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

router.get('/api/chat/unread-count', async (req, res) => {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const count = await Chat.countDocuments({
      receiverId: userId,
      read: false
    });

    res.status(200).json({
      success: true,
      count
    });
  } catch (err) {
    console.error('Error fetching unread count:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
});

router.get('/api/chat/customers', async (req, res) => {
  try {
    const customers = await Signup.find({ role: 'customer' }, '_id firstName lastName');
    res.status(200).json({
      success: true,
      customers
    });
  } catch (err) {
    console.error('Error fetching customers:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching customers'
    });
  }
});

// Counter routes
router.get('/api/counters', async (req, res) => {
  try {
    const [customers, categories, products] = await Promise.all([
      Signup.countDocuments(),
      Category.countDocuments(),
      Product.countDocuments()
    ]);
    
    res.status(200).json({
      customers,
      categories,
      products
    });
  } catch (err) {
    console.error('Error fetching counters:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching counters'
    });
  }
});

// Order routes
router.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.productId', 'name price images');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (err) {
    console.error('Error fetching order:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order'
    });
  }
});

router.get('/api/orders/user/:userId', async (req, res) => {
  try {
    // This route would need authentication to ensure users can only see their own orders
    // For now, we'll just return all orders
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name price images');
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

router.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('items.productId', 'name price images');
    
    res.status(200).json({
      success: true,
      orders
    });
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// Add this to App_Get.js
router.get('/api/reset-password/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    // Find user by token and check expiry
    const user = await Signup.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid or has expired'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      email: user.email
    });
  } catch (err) {
    console.error('Reset token verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error during token verification'
    });
  }
});

// Add this to App_Get.js
router.get('/api/dashboard', async (req, res) => {
  try {
    // Calculate metrics
    const [orders, products, customers] = await Promise.all([
      Order.find(),
      Product.find(),
      Signup.find({ role: 'customer' })
    ]);

    // Calculate total revenue
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Calculate average order value
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    // Get recent orders (last 5)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.productId', 'name price images');
    
    // Get top selling products (sort by sales)
    const topProducts = await Product.find()
      .sort({ soldCount: -1 })
      .limit(3)
      .populate('category', 'name');
    
    // Generate sales data for chart (last 30 days)
    const salesData = await generateSalesData();
    
    // Get recent activity (could be from a separate activity log)
    const recentActivity = await generateRecentActivity();
    
    res.status(200).json({
      totalRevenue,
      orderCount: orders.length,
      customerCount: customers.length,
      avgOrderValue,
      salesData,
      recentOrders,
      topProducts,
      recentActivity
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// Helper function to generate sales data
async function generateSalesData() {
  const salesData = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = new Date(date.setHours(23, 59, 59, 999));
    
    const dayOrders = await Order.find({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    });
    
    const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total, 0);
    
    salesData.push({
      date: date.toISOString().split('T')[0],
      revenue: dayRevenue,
      orders: dayOrders.length
    });
  }
  
  return salesData;
}

// Helper function to generate recent activity
async function generateRecentActivity() {
  // This would typically come from an activity log collection
  // For now, we'll simulate some activities
  return [
    {
      type: 'New order',
      description: 'Order #ORD-1234 for $150.00',
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    },
    {
      type: 'Product added',
      description: 'New product "Wireless Headphones" added',
      timestamp: new Date(Date.now() - 7200000) // 2 hours ago
    },
    {
      type: 'New customer',
      description: 'John Doe registered',
      timestamp: new Date(Date.now() - 86400000) // 1 day ago
    }
  ];
}
// Contact routes
router.get('/api/contacts', async (req, res) => {
  try {
    const { page = 1, pageSize = 10, unread } = req.query;
    const skip = (page - 1) * pageSize;
    
    let query = {};
    if (unread === 'true') {
      query.isRead = false;
    }

    const [contacts, total] = await Promise.all([
      Contact.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(pageSize)),
      Contact.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      contacts,
      total
    });
  } catch (err) {
    console.error('Error fetching contacts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contacts'
    });
  }
});

router.get('/api/contacts/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }

    res.status(200).json({
      success: true,
      contact
    });
  } catch (err) {
    console.error('Error fetching contact:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact'
    });
  }
});
// Add this to App_Get.js
router.get('/api/notifications/contacts', async (req, res) => {
  try {
    // Get unread contact messages, sorted by newest first
    const contacts = await Contact.find({ isRead: false })
      .sort({ createdAt: -1 })
      .limit(10); // Limit to 10 most recent unread messages

    res.status(200).json({
      success: true,
      contacts
    });
  } catch (err) {
    console.error('Error fetching contact notifications:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching contact notifications'
    });
  }
});
// Get accepted users
router.get('/api/accepts', async (req, res) => {
  try {
    const accepts = await Accept.find().sort({ acceptedAt: -1 });
    
    res.status(200).json({
      success: true,
      accepts
    });
  } catch (err) {
    console.error('Error fetching accepts:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching accepted users'
    });
  }
});
module.exports = router;