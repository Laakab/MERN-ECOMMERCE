import Footer from './Components/Footer';
import Signup from './Components/Signup';
import DeliverSignup from './Components/DeliverSignup';
import ShopSignup from './Components/ShopSignup';
import AdminSignup from './Components/AdminSignup';
import Home from './Components/Home';
import Login from './Components/Login'
import Admin from './Components/Admin';
import Customer from './Components/Customer';
import Shop from './Components/Shop';
import Shops from './Components/Shops';
import Deliver from './Components/Deliver';
import Header from './Components/Header';
import CustomerHeader from './Components/CustomerHeader';
import StoreManager from './Components/StoreManger';
import CategoryForm from './Components/CategoryForm';
import CategoryTable from './Components/CategoryTable';
import ProductForm from './Components/ProductForm';
import AdsForm from './Components/AdsForm';
import EventForm from './Components/EventForm';
import EventsTable from './Components/EventsTable';
import EventProduct from './Components/EventProduct';
import SignupTable from './Components/SignupTable';
import AdminPasswordTable from './Components/AdminPassTable'
import AdsTable from './Components/AdsTable'
import ProductsTable from './Components/ProductsTable'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ProtectedRoute from './Components/ProtectedRoute';
import EventCard from './Components/EventCard';
import Team from './Components/Team';
import Product from './Components/Product';
import About from './Components/About';
import Services from './Components/Services';
import Contact from './Components/Contact';
import ViewProductsEvent from './Components/ViewProductsEvent'
import Carsualform from './Components/CarsualForm'
import DeliverTable from './Components/DeliverTable';
import OrderTable from './Components/OrderTable';
import StoreTable from './Components/StoreTable';
import CarsualTable from './Components/CarsualTable';
import ViewDetails from './Components/ViewDetails';
import AddToCart from './Components/AddToCart';
import Checkout from './Components/Checkout';
import OrderDetails from './Components/OrderDetails';
import ShopManage from './Components/ShopManage';
import ForgotPassword from './Components/ForgotPassword';
import ContactTable from './Components/ContactTable';
import AcceptTable from './Components/AcceptTable';
import CaptchaVerify from './Components/CaptchaVerify';
import UpdatePass from './Components/UpdatePass';
import './App.css';
function App() {

  return (
    <div className="App">
      <Analytics />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={
            <>
              <Header />
              <main className="main-content">
                <Home />
              </main>
              <Footer />
            </>
          } />
          <Route path="/signup" element={<Signup />} />
          <Route path="/deliversignup" element={<DeliverSignup />} />
          <Route path="/adminsignup" element={<AdminSignup />} />
          <Route path="/shopsignup" element={<ShopSignup />} />
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<Admin />} />
            <Route path="/categorytable" element={<CategoryTable />} />
            <Route path="/category" element={<CategoryForm />} />
            <Route path="/event" element={<EventForm />} />
            <Route path="/carsualtable" element={<CarsualTable />} />
            <Route path="/producttable" element={<ProductsTable />} />
            <Route path="/ordertable" element={<OrderTable />} />
            <Route path="/storetable" element={<StoreTable />} />
            <Route path="/delivertable" element={<DeliverTable />} />
            <Route path="/adstable" element={<AdsTable />} />
            <Route path="/eventtable" element={<EventsTable />} />
            <Route path="/accepttable" element={<AcceptTable />} />
            <Route path="/signuptable" element={<SignupTable />} />
            <Route path="/contacttable" element={<ContactTable />} />
            <Route path="/Adminpasstable" element={<AdminPasswordTable />} />
          </Route>


          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/customer" element={
              <>
                <CustomerHeader />
                <main className="main-content">
                  <Customer />
                </main>
                <Footer />
              </>
            } />

          </Route>


          <Route element={<ProtectedRoute allowedRoles={['shop']} />}>
            <Route path="/store" element={<StoreManager />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/eventcard" element={<EventCard />} />
            <Route path="addproduct" element={<ProductForm />} />
            <Route path="/ads" element={<AdsForm />} />
            <Route path="/carsualform" element={<Carsualform />} />
            <Route path="/eventproduct" element={<EventProduct />} />
            <Route path="/shopmanage" element={<ShopManage />} />
          </Route>


          <Route element={<ProtectedRoute allowedRoles={['deliver']} />}>
            <Route path="/deliver" element={<Deliver />} />

          </Route>
          <Route path="/product" element={<Product />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/team" element={<Team />} />
          <Route path="/events/:eventId/products" element={<ViewProductsEvent />} />
          <Route path="/products/:id" element={<ViewDetails />} />
          <Route path="/cart" element={<AddToCart />} />
          <Route path="/shop/:ownerId?" element={<Shop />} />
          <Route path="/shop/:userId" element={<Shop />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/captcha-verify" element={<CaptchaVerify />} />
          <Route path="/update-password" element={<UpdatePass />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}
export default App;