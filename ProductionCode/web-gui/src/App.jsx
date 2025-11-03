import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SimplifiedDemo from './components/pages/SimplifiedDemo';
import CompleteMonitoringDashboard from './components/pages/CompleteMonitoringDashboard';

/**
 * 🚀 ELITE ARBITRAGE SYNDICATE - DEMO APP
 * Step-by-step rebuild to find what breaks
 */
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SimplifiedDemo />} />
        <Route path="/demo" element={<SimplifiedDemo />} />
        <Route path="/simple" element={<SimplifiedDemo />} />
        <Route path="/monitoring" element={<CompleteMonitoringDashboard />} />
        <Route path="*" element={<SimplifiedDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
