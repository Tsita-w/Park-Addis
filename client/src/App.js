import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NearbyParkingView from './pages/NearbyParkingView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Only keep the page that actually exists */}
        <Route path="/" element={<NearbyParkingView />} />
      </Routes>
    </Router>
  );
}

export default App;