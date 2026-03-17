import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NearbyParkingView from './pages/NearbyParkingView';
import MyBookings from './pages/MyBookings';
import BookingSuccess from './pages/BookingSuccess';
import { Toaster } from 'react-hot-toast';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <Router>

      <Toaster position="top-center" reverseOrder={false} />

      <Routes>

        <Route path="/" element={<NearbyParkingView />} />

        <Route path="/books" element={<MyBookings />} />

        <Route path="/booking-success" element={<BookingSuccess />} />

        <Route path="/admin" element={<AdminDashboard />} />
        
      </Routes>
    </Router>
  );
}

export default App;
