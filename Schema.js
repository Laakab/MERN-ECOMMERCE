// Schema.js
const mongoose = require('mongoose');


// In your existing signupSchema in Schema.js, make sure these fields exist:
const signupSchema = new mongoose.Schema({
  role: String,
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  phoneNo: String,
  address: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: { type: Date, default: Date.now }
});
// Accept Schema (for pending approval)
const acceptSchema = new mongoose.Schema({
  role: String,
  firstName: String,
  lastName: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  phoneNo: String,
  address: String,
  paymentInfo: {
    amount: Number,
    transactionId: String,
    screenshot: String,
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

// Category Schema
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  quantity: { type: Number, required: true },
  images: [String], // This will store file paths
  createdAt: { type: Date, default: Date.now }
});

// Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  quantity: { type: Number, required: true, min: 0 },
  colors: [String],
  sizes: [String],
  shippingPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  price: { type: Number, required: true, min: 0 },
  returnDays: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7], required: true },
  images: [String],
  soldCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }
});

// Event Product Schema
const eventProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  quantity: { type: Number, required: true, min: 0 },
  colors: [String],
  sizes: [String],
  shippingPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0, max: 100 },
  price: { type: Number, required: true, min: 0 },
  returnDays: { type: Number, enum: [1, 2, 3, 4, 5, 6, 7], required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }
});

// Ads Schema
const adsSchema = new mongoose.Schema({
  adsName: { type: String, required: true },
  adsDescription: { type: String, required: true },
  targetAudience: { type: String, required: true },
  setArea: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, required: true }
  },
  fromDate: { type: Date, required: true },
  fromTime: { type: String, required: true },
  toDate: { type: Date, required: true },
  toTime: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }
});

// Event Schema
const eventSchema = new mongoose.Schema({
  eventName: { type: String, required: true },
  eventDescription: { type: String, required: true },
  fromDate: { type: Date, required: true },
  fromTime: { type: String, required: true },
  toDate: { type: Date, required: true },
  toTime: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup' }
});

// Admin Password Schema
const adminPasswordSchema = new mongoose.Schema({
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Carsual Schema
const carsualSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  store: { type: String, required: true },
  images: [String],
  createdAt: { type: Date, default: Date.now }
});

// Profile Schema
const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup', required: true, unique: true },
  avatar: String,
  themeColor: { type: String, default: '#4e73df' },
  darkMode: { type: Boolean, default: false },
  backgroundImage: String,
  updatedAt: { type: Date, default: Date.now }
});

// Store Schema
const storeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup', required: true, unique: true },
  storeName: { type: String, required: true },
  storeLogo: String,
  location: {
    country: String,
    province: String,
    city: String,
    town: String,
    district: String
  },
  slogan: String,
  tools: {
    featuredProducts: Boolean,
    customerReviews: Boolean,
    discountBanner: Boolean,
    socialMediaLinks: Boolean,
    newsletterSignup: Boolean
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Chat Schema
const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Signup', required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  isEdited: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}, { timestamps: true });

// Order Schema
const orderSchema = new mongoose.Schema({
  customer: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: String,
      zipCode: { type: String, required: true },
      country: { type: String, required: true }
    }
  },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    color: String,
    size: String,
    image: String
  }],
  shippingMethod: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  subtotal: { type: Number, required: true, min: 0 },
  shipping: { type: Number, required: true, min: 0 },
  tax: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
// Add to Schema.js
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: String,
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }
});

// Create and export models
const Signup = mongoose.model('Signup', signupSchema);
const Accept = mongoose.model('Accept', acceptSchema);
const Category = mongoose.model('Category', categorySchema);
const Product = mongoose.model('Product', productSchema);
const EventProduct = mongoose.model('EventProduct', eventProductSchema);
const Ads = mongoose.model('Ads', adsSchema);
const Event = mongoose.model('Event', eventSchema);
const AdminPassword = mongoose.model('AdminPassword', adminPasswordSchema);
const Carsual = mongoose.model('Carsual', carsualSchema);
const Profile = mongoose.model('Profile', profileSchema);
const Store = mongoose.model('Store', storeSchema);
const Chat = mongoose.model('Chat', chatSchema);
const Order = mongoose.model('Order', orderSchema);
const Contact = mongoose.model('Contact', contactSchema, 'contacts');
module.exports = {
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
};