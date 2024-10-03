import React, { useEffect, useState } from 'react';
import './CarylDashboard.css';

function CarylDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const teamMember = "Caryl Apa"; // Define the team member's name

  // Fetch requests assigned to the specific team member
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`https://backend-test-u9zl.onrender.com/api/requests?assignedTo=${teamMember}`);
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

  // Handle status update of requests
  const handleStatusChange = async (requestId, newStatus) => {
    if (newStatus === 2 && !selectedRequest.fileUrl) {
      alert('You cannot mark this request as completed without an evaluator file.');
      return; // Exit early if evaluator file is not uploaded
    }

    try {
      const response = await fetch(`https://backend-test-u9zl.onrender.com/api/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update status');

      const updatedRequest = await response.json();
      setRequests(prevRequests =>
        prevRequests.map(req => req._id === updatedRequest._id ? updatedRequest : req)
      );
    } catch (error) {
      alert('Status update failed. Please try again.');
    }
  };

  // Open the modal for a specific request
  const openModal = (request) => {
    setSelectedRequest(request);
    setModalVisible(true);
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
    setSelectedRequest(null);
    setUploadedFile(null);
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setUploadedFile(file);
  };

  const handleFileUpload = async () => {
    if (uploadedFile && selectedRequest) {
      const formData = new FormData();
      formData.append('file', uploadedFile);
      formData.append('requestId', selectedRequest._id);
  
      try {
        const response = await fetch('https://backend-test-u9zl.onrender.com/api/upload', {
          method: 'POST',
          body: formData,  // Note that this sends the file as 'multipart/form-data'
        });
  
        if (!response.ok) {
          const errorMessage = await response.text();
          console.error('Error response from server:', errorMessage);
          throw new Error('Failed to upload file');
        }
  
        const updatedRequest = await response.json();
        setRequests(prevRequests =>
          prevRequests.map(req => req._id === updatedRequest._id ? updatedRequest : req)
        );
  
        alert('File uploaded successfully!');
        closeModal();
      } catch (error) {
        console.error('File upload failed:', error);
        alert(`File upload failed: ${error.message}`);
      }
    } else {
      alert('Please select a file to upload.');
    }
  };

  // Download file using Blob
  const downloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`https://backend-test-u9zl.onrender.com${fileUrl}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob(); // Get the response as a Blob
      const downloadUrl = window.URL.createObjectURL(blob); // Create a temporary URL

      // Create an anchor element to trigger the download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName); // Set the download attribute with the file name
      document.body.appendChild(link);
      link.click(); // Programmatically click the link to download the file
      link.remove(); // Clean up the link

      window.URL.revokeObjectURL(downloadUrl); // Free up memory after download
    } catch (error) {
      console.error('Error downloading file:', error);
      alert(`Download failed: ${error.message}`);
    }
  };

  // Loading state while fetching requests
  if (loading) return <div className="loading">Loading requests...</div>;
  if (error) return (
    <div className="error">
      Error: {error} <button onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  return (
    <div className="dashboard-container4">
      {/* Status summary */}
      <div className="status-summary4">
        <div className="status-box4">
          <span className="status-value4">{requests.length}</span>
          <h3>Total Requests</h3>
        </div>
        <div className="status-box4">
          <span className="status-value4">{requests.filter(req => req.status === 1).length}</span>
          <h3>Open Requests</h3>
        </div>
        <div className="status-box4">
          <span className="status-value4">{requests.filter(req => req.status === 2).length}</span>
          <h3>Closed Requests</h3>
        </div>
      </div>

      {/* Profile sidebar */}
      <div className="profile-sidebar4">
        <div className="profile-image-container4">
          <img className="profile-image4" src="https://via.placeholder.com/150" alt={teamMember} />
        </div>
        <div className="profile-details4">
          <h3>{teamMember}</h3>
          <p>{`${teamMember.toLowerCase().replace(' ', '.')}@mail.com`}</p>
        </div>
      </div>

      {/* Table displaying the list of requests */}
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
              requests.filter(req => req.assignedTo === teamMember).map(req => (
                <tr key={req._id} onClick={() => openModal(req)}>
                  <td>{req.referenceNumber}</td>
                  <td>{req.timestamp}</td>
                  <td>{req.projectTitle}</td>
                  <td>
                    <select
                      value={req.status}
                      onChange={(e) => handleStatusChange(req._id, Number(e.target.value))}
                    >
                      <option value={0}>Pending</option>
                      <option value={1}>Ongoing</option>
                      <option value={2} disabled={!req.fileUrl}>Completed</option> {/* Disable if no file uploaded */}
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

      {/* Modal for viewing and uploading files */}
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
                {/* From Requester Section */}
                {selectedRequest.requesterFileUrl && (
                  <tr>
                    <th>From Requester:</th>
                    <td>
                      <button onClick={() => downloadFile(selectedRequest.requesterFileUrl, selectedRequest.requesterFileName)}>
                        Download {selectedRequest.requesterFileName || 'file'}
                      </button>
                    </td>
                  </tr>
                )}
                {selectedRequest.fileUrl && (
                  <tr>
                    <th>Download Evaluation</th>
                    <td>
                      <a href={selectedRequest.fileUrl} download={selectedRequest.fileName || 'evaluation'}>
                        Download {selectedRequest.fileName}
                      </a>
                    </td>
                  </tr>
                )}
                <tr>
                  <th>Upload Evaluation</th>
                  <td>
                    <input type="file" onChange={handleFileChange} />
                    <button onClick={handleFileUpload}>Upload</button>
                    {uploadedFile && <p>File: {uploadedFile.name}</p>}
                  </td>
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

export default CarylDashboard;
