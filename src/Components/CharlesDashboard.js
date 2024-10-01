import React, { useEffect, useState } from 'react';
import './CharlesDashboard.css';

function CharlesDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const teamMember = "Charles Coscos";

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
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchRequests();
  }, [teamMember]);

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
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

  // Calculate total, open, and closed requests
  const totalRequests = requests.length;
  const openRequests = requests.filter(request => request.status === 1).length;
  const closedRequests = requests.filter(request => request.status === 2).length;

  if (loading) {
    return <div>Loading requests...</div>;
  }

  if (error) {
    return <div>Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>;
  }

  return (
    <div className="dashboard-container4">
      {/* Status Summary at the Top */}
      <div className="status-summary4">
        <div className="status-box4">
          <span className="status-value4">{totalRequests}</span>
          <h3>Total Requests</h3>
        </div>
        <div className="status-box4">
          <span className="status-value4">{openRequests}</span>
          <h3>Open Requests</h3>
        </div>
        <div className="status-box4">
          <span className="status-value4">{closedRequests}</span>
          <h3>Closed Requests</h3>
        </div>
      </div>

      {/* Sidebar for Profile */}
      <div className="profile-sidebar4">
        <div className="profile-image-container4">
          <img className="profile-image4" src="https://via.placeholder.com/150" alt="Charles Coscos" />
        </div>
        <div className="profile-details4">
          <h3>Charles Coscos</h3>
          <p>charles.coscos@mail.com</p>
        </div>
      </div>

      {/* Request Table */}
      <div className="table-container4">
        <h3>List of Requests</h3>
        <table className="request-table4">
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

      {/* Modal for Request Details */}
      {modalVisible && selectedRequest && (
        <div className="modal4">
          <div className="modal-content4">
            <h3 className="modal-header4">Request Details</h3>
            <table className="modal-table4">
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
  );
}

export default CharlesDashboard;
