import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import RequesterDashboard from './Components/RequesterDashboard';
import AdminDashboard from './Components/AdminDashboard';
import CharlesDashboard from './Components/CharlesDashboard';
import CarylDashboard from './Components/CarylDashboard';
import PatrickDashboard from './Components/PatrickDashboard';
import VincentDashboard from './Components/VincentDashboard';
import JayDashboard from './Components/JayDashboard';
import RodelDashboard from './Components/RodelDashboard';
import TristanDashboard from './Components/TristanDashboard';
import AllProfiles from './Components/AllProfiles'; // Import the AllProfiles component
import Dashboard from './Components/Dashboard'; // Import the Dashboard component


function App() {
  return (
    <Router>
      <div>
        <Routes>
          {/* Main login route */}
          <Route path="/" element={<Login />} />

          {/* Main dashboard route */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Requester dashboard */}
          <Route path="/dashboard/requester" element={<RequesterDashboard />} />

          {/* Admin dashboard */}
          <Route path="/dashboard/admin" element={<AdminDashboard />} />

          {/* All profiles page */}
          <Route path="/profiles" element={<AllProfiles />} /> 

          {/* Routes for each evaluator */}
          <Route path="/dashboard/evaluator/charles" element={<CharlesDashboard />} />
          <Route path="/dashboard/evaluator/caryl" element={<CarylDashboard />} />
          <Route path="/dashboard/evaluator/patrick" element={<PatrickDashboard />} />
          <Route path="/dashboard/evaluator/vincent" element={<VincentDashboard />} />
          <Route path="/dashboard/evaluator/jay" element={<JayDashboard />} />
          <Route path="/dashboard/evaluator/rodel" element={<RodelDashboard />} />
          <Route path="/dashboard/evaluator/tristan" element={<TristanDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
