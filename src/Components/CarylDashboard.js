import React, { useEffect, useState } from 'react';
import './CarylDashboard.css';

function CarylDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const teamMember = "Caryl Apa"; // Explicitly set team member for filtering

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/requests?assignedTo=${teamMember}`, {
          mode: 'cors',
        });
        if (!response.ok) throw new Error('Failed to fetch requests');
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [teamMember]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT', // Use PUT for status update
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      
      setRequests(prevRequests =>
        prevRequests.map(req =>
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation(); // Prevent the row click event
  };

  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return <div className="error">Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div className="dashboard-container">
      <div className="profile-sidebar">
        <div className="profile-image-container">
          <img className="profile-image" src="https://via.placeholder.com/150" alt={teamMember} />
        </div>
        <div className="profile-details">
          <h3>{teamMember}</h3>
          <p>{`${teamMember.toLowerCase().replace(' ', '.')}@mail.com`}</p>
        </div>
      </div>

      <div className="dashboard-content">
        <h1>Welcome, {teamMember}</h1>
        <p>Here are your assigned requests:</p>

        <div className="table-container">
          <h3>List of Requests</h3>
          <table className="request-table">
            <thead>
              <tr>
                <th>REQID</th>
                <th>TIMESTAMP</th>
                <th>PROJECT TITLE</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {requests.length > 0 ? (
                requests
                  .filter(request => request.assignedTo === teamMember)
                  .map((request) => (
                    <tr key={request._id} onClick={() => openModal(request)}>
                      <td>{request.referenceNumber}</td>
                      <td>{request.timestamp}</td>
                      <td>{request.projectTitle}</td>
                      <td>
                        <select
                          value={request.status}
                          onChange={(e) => handleStatusChange(request._id, Number(e.target.value))}
                          onClick={handleDropdownClick} // Prevent row click event
                        >
                          <option value={0}>Pending</option>
                          <option value={1}>Ongoing</option>
                          <option value={2}>Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="4">No requests assigned to you</td>
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

export default CarylDashboard;
