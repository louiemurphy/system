import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Components/Login';
import RequesterDashboard from './Components/RequesterDashboard';
import AdminDashboard from './Components/AdminDashboard';
import CharlesDashboard from './Components/CharlesDashboard';
import CarylDashboard from './Components/CarylDashboard';
import PatrickDashboard from './Components/PatrickDashboard';
import VincentDashboard from './Components/VincentDashboard';

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard/requester" element={<RequesterDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
          
          {/* Routes for each evaluator */}
          <Route path="/dashboard/evaluator/charles" element={<CharlesDashboard />} />
          <Route path="/dashboard/evaluator/caryl" element={<CarylDashboard />} />
          <Route path="/dashboard/evaluator/patrick" element={<PatrickDashboard />} />
          <Route path="/dashboard/evaluator/vincent" element={<VincentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
