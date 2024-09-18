import React, { useState, useEffect } from 'react';
import './AdminDashboard.css'; // Import the CSS for styling

function AdminDashboard() {
    const [requests, setRequests] = useState([]); // State for storing requests
    const [loading, setLoading] = useState(true); // Loading state
    const [error, setError] = useState(null); // Error state
    const [overlayVisible, setOverlayVisible] = useState(false); // Overlay visibility state
    const [selectedRequest, setSelectedRequest] = useState(null); // State to store the selected request
    const [selectedTeamMember, setSelectedTeamMember] = useState(''); // State for the selected team member
    const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
    const [editingRequestId, setEditingRequestId] = useState(null); // Track which request is being edited

    const statusOptions = [
        { value: 0, label: 'Pending' },
        { value: 1, label: 'Ongoing' },
        { value: 2, label: 'Completed' }
      ]; // Status options
    const teamMembers = ['Charles Coscos', 'Patrick Paclibar', 'Caryl Apa', 'Vincent Go', 'Rodel Bartolata']; // Team members

    // Fetch requests from the backend
    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/requests', {
                    mode: 'cors', // Ensure CORS is handled
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch requests');
                }
                const data = await response.json();
                setRequests(data); // Update state with fetched requests
                setLoading(false); // Set loading to false
            } catch (err) {
                setError(err.message); // Set error message
                setLoading(false); // Stop loading in case of error
            }
        };

        fetchRequests(); // Fetch requests on component mount
    }, []);

    // Function to open the overlay and set the selected request
    const openOverlay = (request) => {
        setSelectedRequest(request); // Set the request being assigned
        setOverlayVisible(true); // Show overlay
    };

    // Function to close the overlay
    const closeOverlay = () => {
        setOverlayVisible(false); // Hide overlay
        setSelectedRequest(null); // Reset the selected request
        setSelectedTeamMember(''); // Reset the team member selection
    };

    // Function to handle saving the assignment
    const handleSave = async () => {
        if (selectedTeamMember) {
            // Update local state first
            const updatedRequests = requests.map((request) =>
                request._id === selectedRequest._id ? { ...request, assignedTo: selectedTeamMember } : request
            );
            setRequests(updatedRequests);

            // Send the update to the backend
            try {
                const response = await fetch(`http://localhost:5000/api/requests/${selectedRequest._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ assignedTo: selectedTeamMember }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update request on the server');
                }

                const data = await response.json();
                console.log('Backend response:', data);
            } catch (err) {
                console.error('Error updating request:', err);
            }

            closeOverlay(); // Close the overlay after saving
        } else {
            alert('Please select a team member!');
        }
    };

    // Function to handle updating the status
    // Function to handle updating the status
    const handleStatusChange = async (requestId, newStatus) => {
        try {
            // Update local state with the new status
            const updatedRequests = requests.map((request) =>
                request._id === requestId ? { ...request, status: newStatus } : request
            );
            setRequests(updatedRequests);  // This updates the frontend state
    
            // Now, send the updated status to the backend
            const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update request status');
            }
    
            const data = await response.json();
            console.log('Status updated successfully on the backend:', data);
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };
    
    
    

    // Function to open the modal with request details
    const openModal = (request) => {
        setSelectedRequest(request);  // Set the request for modal
        setModalVisible(true);  // Show modal
    };

    // Function to close the modal
    const closeModal = () => {
        setModalVisible(false);  // Hide modal
        setSelectedRequest(null);  // Reset the selected request
    };

    if (loading) {
        return <div>Loading requests...</div>;  // Show loading state
    }

    if (error) {
        return <div>Error: {error}</div>;  // Show error message if fetch fails
    }

    return (
        <div className="dashboard-container">
            {/* Sidebar for navigation */}
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>ADMIN DASHBOARD</h2>
                </div>
                <ul className="sidebar-menu">
                    <li>Evaluator Profile</li>
                    <li>List of Requests</li>
                </ul>
            </div>

            {/* Main content section */}
            <div className="main-content">
                {/* Top Section with Total Requests and Profiling */}
                <div className="top-section">
                    {/* Total Requests Section */}
                    <div className="overview-panel">
                        <h3>Total Requests</h3>
                        <div className="overview-data">
                            <p>Total Requests: {requests.length}</p>
                            <p>New Request Today: --</p>
                            <p>Last Added Request: {requests[requests.length - 1]?.timestamp}</p>
                        </div>
                    </div>

                    {/* Profiling Section */}
                    <div className="profiling-panel">
                        <h3>Profiling</h3>
                        <div className="profiling-cards">
                            {teamMembers.map((member, index) => (
                                <div className="profile-card" key={index}>
                                    <div className="profile-info">
                                        <div className="profile-pic-placeholder">CC</div>
                                        <div className="profile-details">
                                            <p>{member}</p>
                                            <div className="progress-bar">
                                                <div className="progress-bar-complete" style={{ width: '70%' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table of requests */}
                <div className="table-container">
                    <h3>List of Requests</h3>
                    <table className="request-table">
                        <thead>
                            <tr>
                                <th>REQID</th>
                                <th>TIMESTAMP</th>
                                <th>PROJECT TITLE</th>
                                <th>ASSIGNED TO</th>
                                <th>STATUS</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((request) => (
                                <tr key={request._id}>
                                    <td onClick={() => openModal(request)}>{request.referenceNumber}</td>
                                    <td onClick={() => openModal(request)}>{request.timestamp}</td>
                                    <td onClick={() => openModal(request)}>{request.projectTitle}</td>
                                    <td onClick={() => openModal(request)}>{request.assignedTo || 'Unassigned'}</td>
                                    <td>
                                        {/* Status Dropdown */}
                                        <select
                                            value={request.status} // Assuming request.status is a number
                                            onChange={(e) => handleStatusChange(request._id, Number(e.target.value))} // Convert value to number
                                            disabled={request.status === 2} // Disable for completed requests
                                            >
                                            {statusOptions.map((statusOption) => (
                                                <option key={statusOption.value} value={statusOption.value}>
                                                {statusOption.label}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            className="assign-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openOverlay(request);
                                            }}
                                        >
                                            Assign
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal for request details */}
                {modalVisible && selectedRequest && (
                    <div className="modal">
                        <div className="modal-content">
                            <h3 className="modal-header">Request Details</h3>
                            <table className="modal-table">
                                <tbody>
                                    <tr><th>ID</th><td>{selectedRequest._id}</td></tr>
                                    <tr><th>Email</th><td>{selectedRequest.email}</td></tr>
                                    <tr><th>Name</th><td>{selectedRequest.name}</td></tr>
                                    <tr><th>Type of Client</th><td>{selectedRequest.typeOfClient}</td></tr>
                                    <tr><th>Classification</th><td>{selectedRequest.classification}</td></tr>
                                    <tr><th>Project Title</th><td>{selectedRequest.projectTitle}</td></tr>
                                    <tr><th>Philgeps Reference Number</th><td>{selectedRequest.philgepsReferenceNumber}</td></tr>
                                    <tr><th>Product Type</th><td>{selectedRequest.productType}</td></tr>
                                    <tr><th>Request Type</th><td>{selectedRequest.requestType}</td></tr>
                                    <tr><th>Date Needed</th><td>{selectedRequest.dateNeeded}</td></tr>
                                    <tr><th>Special Instructions</th><td>{selectedRequest.specialInstructions}</td></tr>
                                </tbody>
                            </table>
                            <button onClick={closeModal} className="close-modal-btn">Close</button>
                        </div>
                    </div>
                )}

                {/* Overlay for assigning requests */}
                {overlayVisible && (
                    <div className="overlay">
                        <div className="lightbox-content">
                            <button className="close-overlay" onClick={closeOverlay}>×</button>
                            <h3>Assign Request</h3>
                            <label>Select Team Member:</label>
                            <select
                                value={selectedTeamMember}
                                onChange={(e) => setSelectedTeamMember(e.target.value)}
                            >
                                <option value="" disabled>Select...</option>
                                {teamMembers.map((member, index) => (
                                    <option key={index} value={member}>
                                        {member}
                                    </option>
                                ))}
                            </select>
                            <div className="lightbox-actions">
                                <button onClick={handleSave}>Save</button>
                                <button onClick={closeOverlay}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;
