import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Sidebar Component
function Sidebar() {
    return (
        <div className="sidebar2">
            <h3>Menu</h3>
            <ul>
                <li>Dashboard</li>
                <li> All Requests</li>
            </ul>
        </div>
    );
}

// Header Component
function HeaderSection({ requests }) {
    return (
        <header className="header-section2">
            <div className="header-content2">
                <div className="header-left2">
                    <h1>TECHNICAL SUPPORT GROUP</h1>
                </div>
                <div className="header-right2">
                    <p>Last Request Added: {requests[requests.length - 1]?.timestamp || 'N/A'}</p>
                </div>
            </div>
        </header>
    );
}

// Status Summary Component
function StatusSummary({ requests }) {
    const total = requests.length;
    const newRequests = requests.filter(request => request.status === 0).length;
    const unassigned = requests.filter(request => !request.assignedTo).length;
    const open = requests.filter(request => request.status === 1).length;
    const closed = requests.filter(request => request.status === 2).length;

    return (
        <div className="stat-container2">
            <div className="stat-box2">
                <span className="label">TOTAL</span>
                <span className="value">{total}</span>
            </div>
            <div className="stat-box2">
                <span className="label">NEW</span>
                <span className="value">{newRequests}</span>
            </div>
            <div className="stat-box2">
                <span className="label">UNASSIGNED</span>
                <span className="value">{unassigned}</span>
            </div>
            <div className="stat-box2">
                <span className="label">OPEN</span>
                <span className="value">{open}</span>
            </div>
            <div className="stat-box2">
                <span className="label">CLOSED</span>
                <span className="value">{closed}</span>
            </div>
        </div>
    );
}

// Request List Component with Pagination and Search Functionality
function RequestList({
    requests,
    handleStatusChange,
    openOverlay,
    openModal,
    currentPage,
    paginate,
    requestsPerPage,
    searchQuery,
    setSearchQuery,
  }) {
    const totalRequests = requests.length;
    const totalPages = Math.ceil(totalRequests / requestsPerPage); // Total number of pages
  
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;

    // Memoize filtering and pagination
    const filteredRequests = React.useMemo(() => {
        return requests.filter((request) =>
            request.projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            request.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [requests, searchQuery]);

    const currentRequests = React.useMemo(() => {
        return filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);
    }, [filteredRequests, indexOfFirstRequest, indexOfLastRequest]);
  
    const handleNextPage = () => {
      if (currentPage < totalPages) {
        paginate(currentPage + 1);
      }
    };
  
    const handlePreviousPage = () => {
      if (currentPage > 1) {
        paginate(currentPage - 1);
      }
    };
  
    return (
      <div className="request-list-container">
        {/* Search bar for filtering requests */}
        <div className="search-and-pagination-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
  
          {/* Pagination Info and Controls */}
          <div className="pagination-controls">
            <span className="pagination-info">
              {currentPage}-{totalPages}
            </span>
            <div className="pagination-buttons">
              <button
                className="pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 1} // Disable on the first page
              >
                &lt;
              </button>
              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage === totalPages} // Disable on the last page
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
  
        <table className="request-table2">
          <thead>
            <tr>
              <th>REQID</th>
              <th>TIMESTAMP</th>
              <th>PROJECT TITLE</th>
              <th>ASSIGNED TO</th>
              <th>STATUS</th>
              <th>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {currentRequests.map((request) => (
              <tr key={request._id} onClick={() => openModal(request)}>
                <td>{request.referenceNumber}</td>
                <td>{request.timestamp}</td>
                <td>{request.projectTitle}</td>
                <td>{request.assignedTo || 'Unassigned'}</td>
                <td>
                  <select
                    value={request.status}
                    onChange={(e) => handleStatusChange(request._id, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()} // Prevent row click when changing status
                    disabled={request.status === 2}
                  >
                    <option value={0}>Pending</option>
                    <option value={1}>Ongoing</option>
                    <option value={2}>Completed</option>
                  </select>
                </td>
                <td>
                  <button
                    className="assign-button2"
                    aria-label={`Assign request ${request.referenceNumber}`}
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click when assigning
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
    );
}

// Workload Section Component
function Workload({ teamMembers }) {
    return (
        <div className="workload-section2">
            <h3 className="workload-header2">WORKLOAD</h3>
            {teamMembers.map((member, index) => {
                const nameParts = member.split(' ');
                const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');

                return (
                    <div key={index} className="workload-profile2">
                        <div className="profile-pic-placeholder2">{initials}</div>
                        <div className="profile-details2">
                            <p>{member}</p>
                            <div className="progress-bar2">
                                <div className="progress-bar-complete2" style={{ width: '70%' }}></div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Main AdminDashboard Component
function AdminDashboard() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [overlayVisible, setOverlayVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [selectedTeamMember, setSelectedTeamMember] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState(''); // Search query state
    const requestsPerPage = 5;

    const teamMembers = ['Charles Coscos', 'Patrick Paclibar', 'Caryl Apa', 'Vincent Go', 'Rodel Bartolata', 'Tristan Chua', 'Jay-R'];

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('https://backend-test-u9zl.onrender.com/api/requests', { mode: 'cors' });
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
    }, []);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const openOverlay = (request) => {
        setSelectedRequest(request);
        setOverlayVisible(true);
    };

    const closeOverlay = () => {
        setOverlayVisible(false);
        setSelectedRequest(null);
        setSelectedTeamMember('');
    };

    const handleSave = async () => {
        if (selectedTeamMember) {
            const updatedRequests = requests.map((request) =>
                request._id === selectedRequest._id ? { ...request, assignedTo: selectedTeamMember } : request
            );
            setRequests(updatedRequests);

            try {
                const response = await fetch(`https://backend-test-u9zl.onrender.com/api/requests/${selectedRequest._id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ assignedTo: selectedTeamMember }),
                });

                if (!response.ok) {
                    throw new Error('Failed to update request on the server');
                }

                closeOverlay();
            } catch (err) {
                console.error('Error updating request:', err);
            }
        } else {
            alert('Please select a team member!');
        }
    };

    const handleStatusChange = async (requestId, newStatus) => {
        try {
            const updatedRequests = requests.map((request) =>
                request._id === requestId ? { ...request, status: newStatus } : request
            );
            setRequests(updatedRequests);

            const response = await fetch(`https://backend-test-u9zl.onrender.com/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update request status');
            }
        } catch (err) {
            console.error('Error updating status:', err);
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

    const downloadFile = async (fileUrl, fileName) => {
        try {
            const response = await fetch(`https://backend-test-u9zl.onrender.com${fileUrl}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/pdf', // Adjust this according to your file type
                },
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
        }
    };

    if (loading) {
        return <div>Loading requests...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="admin-dashboard">
            {/* Header Section */}
            <div className="header-wrapper">
                <HeaderSection requests={requests} />
            </div>

            {/* Status Summary Section */}
            <div className="status-summary-wrapper">
                <StatusSummary requests={requests} />
            </div>

            <div className="dashboard-container2">
                {/* Sidebar */}
                <div className="sidebar-wrapper">
                    <Sidebar />
                </div>

                {/* Main Dashboard Content */}
                <div className="main-content2">
                    {/* Main Content Section */}
                    <div className="content-section2">
                        {/* Request List Section */}
<div className="request-list-wrapper">
    <RequestList
        requests={requests} // Pass raw requests
        handleStatusChange={handleStatusChange}
        openOverlay={openOverlay}
        openModal={openModal} // Pass the openModal function
        currentPage={currentPage}
        paginate={paginate}
        requestsPerPage={requestsPerPage}
        searchQuery={searchQuery} // Pass search query state
        setSearchQuery={setSearchQuery} // Pass the function to update search query
    />
</div>


                        {/* Workload Section */}
                        <div className="workload-wrapper">
                            <Workload teamMembers={teamMembers} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Modal */}
            {modalVisible && selectedRequest && (
                <div className="modal2">
                    <div className="modal-content2">
                        <h3>Request Details</h3>
                        <table className="modal-table2">
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
                                {/* Download Evaluator Section */}
                                {selectedRequest.fileUrl && (
                                    <tr>
                                        <th>Download Evaluator:</th>
                                        <td>
                                            <button onClick={() => downloadFile(selectedRequest.fileUrl, selectedRequest.fileName)}>
                                                Download {selectedRequest.fileName || 'evaluator file'}
                                            </button>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <button onClick={closeModal} className="close-modal-btn">Close</button>
                    </div>
                </div>
            )}

            {/* Request Assignment Overlay */}
            {overlayVisible && (
                <div className="overlay2">
                    <div className="lightbox-content2">
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
                        <div className="lightbox-actions2">
                            <button onClick={handleSave} disabled={!selectedTeamMember}>
                                Save
                            </button>
                            <button onClick={closeOverlay}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
