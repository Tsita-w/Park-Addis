import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// --- AUTH & LANDING PAGES ---
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// --- DRIVER PAGES ---
import NearbyParkingView from "./pages/NearbyParkingView";
import MyBookings from "./pages/MyBookings";
import BookingSuccess from "./pages/BookingSuccess";
import UserQRCode from "./pages/UserQRCode";

// --- STAFF PAGES ---
import AdminDashboard from "./pages/AdminDashboard";
import AttendantDashboard from "./pages/AttendantDashboard";
import IncidentReport from "./pages/IncidentReport";

function App() {
  // Check if user is logged in (checks for JWT token in local storage)
  const isAuthenticated = !!localStorage.getItem("token");

  return (
    <Router>
      {/* Toast notifications for login success/errors */}
      <Toaster position="top-center" reverseOrder={false} />

      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* --- MAP VIEW (Can be public or private depending on your goal) --- */}
        <Route path="/find-parking" element={<NearbyParkingView />} />

        {/* --- PROTECTED DRIVER ROUTES --- */}
        <Route
          path="/books"
          element={isAuthenticated ? <MyBookings /> : <Navigate to="/login" />}
        />
        <Route
          path="/booking-success"
          element={isAuthenticated ? <BookingSuccess /> : <Navigate to="/login" />}
        />
        <Route
          path="/generate-pass"
          element={isAuthenticated ? <UserQRCode /> : <Navigate to="/login" />}
        />

        {/* --- PROTECTED STAFF ROUTES --- */}
        <Route
          path="/attendant"
          element={isAuthenticated ? <AttendantDashboard /> : <Navigate to="/login" />}
        />
        <Route
          path="/report-incident"
          element={isAuthenticated ? <IncidentReport /> : <Navigate to="/login" />}
        />
        <Route
          path="/admin"
          element={isAuthenticated ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* Catch-all: Redirect unknown routes to Landing */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;