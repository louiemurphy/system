// Components/Sidebar.js
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div className="sidebar">
      <h3>Menu</h3>
      <ul>
        <li onClick={() => navigate('/dashboard')}>Dashboard</li> {/* Dashboard menu item */}
        <li onClick={() => navigate('/profiles')}>All Profiles</li> {/* Profiles menu item */}
        {/* Add more menu items as needed */}
      </ul>
    </div>
  );
}

export default Sidebar;
