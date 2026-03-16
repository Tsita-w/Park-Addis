import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NearbyParkingView from './pages/NearbyParkingView';
import MyBookings from './pages/MyBookings';
import BookingSuccess from './pages/BookingSuccess';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>

      <Toaster position="top-center" reverseOrder={false} />
      
      <Routes>
        {/* Home page with the map and parking lots */}
        <Route path="/" element={<NearbyParkingView />} />

        {/* Your list of previous bookings */}
        <Route path="/books" element={<MyBookings />} />

        {/* 2. SUCCESS PAGE: Where Chapa sends the user after paying */}
        <Route path="/booking-success" element={<BookingSuccess />} />
      </Routes>
    </Router>
  );
}

export default App;
