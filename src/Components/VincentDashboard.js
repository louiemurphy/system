import React, { useEffect, useState } from 'react';
import './VincentDashboard.css';

function VincentDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 5;
  const teamMember = "Vincent Go";

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch(`https://backend-test-u9zl.onrender.com/api/requests?assignedTo=${teamMember}`, {
          mode: 'cors',
        });
        if (!response.ok) {
          throw new Error('Failed to fetch requests');
        }
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
    if (newStatus === 2 && !selectedRequest.fileUrl) {
      alert('You cannot mark this request as completed without an evaluator file.');
      return; // Exit early if evaluator file is not uploaded
    }

    const completedAt = newStatus === 2 ? new Date().toISOString() : null;

    try {
      const response = await fetch(`https://backend-test-u9zl.onrender.com/api/requests/${requestId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          completedAt: completedAt,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      const updatedRequest = await response.json();
      setRequests(prevRequests =>
        prevRequests.map(req => (req._id === updatedRequest._id ? updatedRequest : req))
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
    setUploadedFile(null);
  };

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
        const response = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to upload file');
        }

        const updatedRequest = await response.json();
        setRequests(prevRequests =>
          prevRequests.map(req => (req._id === updatedRequest._id ? updatedRequest : req))
        );

        alert('File uploaded successfully!');
        closeModal();
      } catch (error) {
        alert(`File upload failed: ${error.message}`);
      }
    } else {
      alert('Please select a file to upload.');
    }
  };

  const downloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(`http://localhost:5000${fileUrl}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to download file');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      alert(`Download failed: ${error.message}`);
    }
  };

  const filteredRequests = requests.filter(req => {
    if (!selectedMonth) return true;
    const requestDate = new Date(req.timestamp);
    return requestDate.getMonth() === getMonthNumber(selectedMonth);
  });

  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);

  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  const getMonthNumber = (monthName) => {
    const months = {
      January: 0, February: 1, March: 2, April: 3,
      May: 4, June: 5, July: 6, August: 7,
      September: 8, October: 9, November: 10, December: 11
    };
    return months[monthName];
  };

  if (loading) return <div>Loading requests...</div>;
  if (error) return <div>Error: {error} <button onClick={() => window.location.reload()}>Retry</button></div>;

  return (
    <div className="dashboard-container4">
      <div className="status-summary4">
        <div className="status-box4">
          <span className="status-value4">{filteredRequests.length}</span>
          <h3>Total Requests</h3>
        </div>
        <div className="status-box4">
          <span className="status-value4">{filteredRequests.filter(req => req.status === 1).length}</span>
          <h3>Open Requests</h3>
        </div>
        <div className="status-box4">
          <span className="status-value4">{filteredRequests.filter(req => req.status === 2).length}</span>
          <h3>Closed Requests</h3>
        </div>
      </div>

      <div className="profile-sidebar4">
        <div className="profile-image-container4">
          <img className="profile-image4" src="https://via.placeholder.com/150" alt={teamMember} />
        </div>
        <div className="profile-details4">
          <h3>{teamMember}</h3>
          <p>{`${teamMember.toLowerCase().replace(' ', '.')}@mail.com`}</p>
        </div>
      </div>

      <div className="table-container4">
        <h3>List of Requests</h3>
        <div className="month-filter-container">
        <select value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
          <option value="">All Months</option>
          <option value="January">January</option>
          <option value="February">February</option>
          <option value="March">March</option>
          <option value="April">April</option>
          <option value="May">May</option>
          <option value="June">June</option>
          <option value="July">July</option>
          <option value="August">August</option>
          <option value="September">September</option>
          <option value="October">October</option>
          <option value="November">November</option>
          <option value="December">December</option>
        </select>
        </div>

        <table className="request-table4">
          <thead>
            <tr>
              <th>REQID</th>
              <th>TIMESTAMP</th>
              <th>PROJECT TITLE</th>
              <th>STATUS</th>
              <th>DATE COMPLETED</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.length > 0 ? (
              currentRequests.map(request => (
                <tr key={request._id} onClick={() => openModal(request)}>
                  <td>{request.referenceNumber}</td>
                  <td>{request.timestamp}</td>
                  <td>{request.projectTitle}</td>
                  <td>
                    <select
                      value={request.status}
                      onChange={(e) => handleStatusChange(request._id, Number(e.target.value))}
                    >
                      <option value={0}>Pending</option>
                      <option value={1}>Ongoing</option>
                      <option value={2}>Completed</option>
                    </select>
                  </td>
                  <td>{request.completedAt ? new Date(request.completedAt).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5">No requests assigned to you</td>
              </tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination">
            <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
            <span>Page {currentPage} of {totalPages}</span>
            <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
          </div>
        )}
      </div>

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
                    <th>Download Evaluation:</th>
                    <td>
                      <button onClick={() => downloadFile(selectedRequest.fileUrl, selectedRequest.fileName)}>
                        Download {selectedRequest.fileName || 'evaluation'}
                      </button>
                    </td>
                  </tr>
                )}
                <tr>
                  <th>Upload Evaluation:</th>
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

export default VincentDashboard;
