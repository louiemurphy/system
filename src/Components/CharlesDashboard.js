import React, { useEffect, useState } from 'react';
import './CharlesDashboard.css'; // Ensure you have the appropriate styles

function CharlesDashboard() {
  const [requests, setRequests] = useState([]); // Store the list of requests
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const [selectedRequest, setSelectedRequest] = useState(null); // Selected request for modal
  const [modalVisible, setModalVisible] = useState(false); // Modal visibility state
  const teamMember = "Charles Coscos"; // Explicitly set the team member for filtering

  // Fetching requests assigned to Charles on component mount
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/requests?assignedTo=${teamMember}`, {
          mode: 'cors',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
        const data = await response.json();
        setRequests(data);
        setLoading(false); // Stop loading once requests are fetched
      } catch (err) {
        setError(err.message); // Set error state if request fails
        setLoading(false);
      }
    };

    fetchRequests();
  }, [teamMember]); // Only run this once when the component mounts

  // Function to open the modal and set the selected request
  const openModal = (request) => {
    setSelectedRequest(request); // Set the request details
    setModalVisible(true); // Show modal
  };

  // Function to close the modal
  const closeModal = () => {
    setModalVisible(false); // Hide modal
    setSelectedRequest(null); // Reset the selected request
  };

  // Render loading state
  if (loading) {
    return <div>Loading requests...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>;
  }

  // Main return for Charles' dashboard
  return (
    <div className="dashboard-container">
      {/* Sidebar with profile information */}
      <div className="profile-sidebar">
        <div className="profile-image-container">
          <img className="profile-image" src="https://via.placeholder.com/150" alt="Charles Coscos" />
        </div>
        <div className="profile-details">
          <h3>Charles Coscos</h3>
          <p>charles.coscos@mail.com</p>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="dashboard-content">
        <h1>Welcome, Charles Coscos</h1>
        <p>Here are your assigned requests:</p>

        {/* Table displaying the list of requests */}
        <div className="table-container">
          <h3>List of Requests</h3>
          <table className="request-table">
            <thead>
              <tr>
                <th>REQID</th>
                <th>TIMESTAMP</th>
                <th>PROJECT TITLE</th>
                <th>STATUS</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests
                  .filter(request => request.assignedTo === teamMember)  // Only show requests assigned to Charles Coscos
                  .map((request) => (
                    <tr key={request._id} onClick={() => openModal(request)}>
                      <td>{request.referenceNumber}</td>
                      <td>{request.timestamp}</td>
                      <td>{request.projectTitle}</td>
                      <td>{request.status === 0 ? 'Pending' : request.status === 1 ? 'Ongoing' : 'Completed'}</td>
                      <td>
                        <button onClick={() => openModal(request)}>View Details</button>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5">No requests assigned to you</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {modalVisible && selectedRequest && (
  <div className="modal">
    <div className="modal-content">
      <h3 className="modal-header">Request Details</h3>
      <table className="modal-table">
        <tbody>
          <tr>
            <th>ID</th>
            <td>{selectedRequest._id}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{selectedRequest.email}</td>
          </tr>
          <tr>
            <th>Name</th>
            <td>{selectedRequest.name}</td>
          </tr>
          <tr>
            <th>Type of Client</th>
            <td>{selectedRequest.typeOfClient}</td>
          </tr>
          <tr>
            <th>Classification</th>
            <td>{selectedRequest.classification}</td>
          </tr>
          <tr>
            <th>Project Title</th>
            <td>{selectedRequest.projectTitle}</td>
          </tr>
          <tr>
            <th>Philgeps Reference Number</th>
            <td>{selectedRequest.philgepsReferenceNumber}</td>
          </tr>
          <tr>
            <th>Product Type</th>
            <td>{selectedRequest.productType}</td>
          </tr>
          <tr>
            <th>Request Type</th>
            <td>{selectedRequest.requestType}</td>
          </tr>
          <tr>
            <th>Date Needed</th>
            <td>{selectedRequest.dateNeeded}</td>
          </tr>
          <tr>
            <th>Special Instructions</th>
            <td>{selectedRequest.specialInstructions}</td>
          </tr>
        </tbody>
      </table>
      <button onClick={closeModal} className="close-modal-btn">Close</button>
    </div>
  </div>
)}

      </div>
    </div>
  );
}

export default CharlesDashboard;
