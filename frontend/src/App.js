import React from 'react';
import './App.css';
import Home from './pages/home';
import Navbar from './components/navbar';
import Login from './pages/login';
import Signup from './pages/signup';
import Pdp from './pages/pdp';
import Confirmation from './pages/confirmation';
import Logout from './pages/logout';
import Cancel from './pages/cancel';
import History from './pages/history';
import Checkout from './pages/checkout';
import Paid from './pages/pconfirm';
import Business from './pages/business';
import Add from './pages/add';

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import Browse from './pages/browse';

import { Routes, Route, useLocation } from 'react-router-dom';

function App() {
  const location = useLocation();
  return (
    <div>
      <Navbar location={location}/>
      <Routes>
        <Route index element={<Home/>}/>
        <Route path="/browse" element={<Browse/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/logout" element={<Logout/>}/>
        <Route path="/business" element={<Business/>}/>
        <Route path="/pdp/:restaurant_name" element={<Pdp/>}/>
        <Route path="/confirmation/:booking_id" element={<Confirmation/>}/>
        <Route path="/cancel" element={<Cancel/>}/>
        <Route path="/history" element={<History/>}/>
        <Route path="/checkout/:booking_id" element={<Checkout/>}/>
        <Route path="/pconfirm/:booking_id" element={<Paid/>}/>
        <Route path="/add/:booking_id" element={<Add/>}/>
      </Routes>
    </div>
  );
}

export default App;
