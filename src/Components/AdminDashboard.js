import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';

// Sidebar Component
function Sidebar() {
    return (
        <div className="sidebar2">
            <h3>Menu</h3>
            <ul>
                <li>Dashboard</li>
                <li>Requests</li>
                <li>Workload</li>
                <li>Settings</li>
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


// Request List Component
function RequestList({ requests, handleStatusChange, openOverlay, openModal, currentPage, paginate, requestsPerPage }) {
    const indexOfLastRequest = currentPage * requestsPerPage;
    const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
    const currentRequests = requests.slice(indexOfFirstRequest, indexOfLastRequest);
    const totalPages = Math.ceil(requests.length / requestsPerPage);

    return (
        <div className="request-list2">
            <div className="search-bar2">
                <input type="text" placeholder="Search..." />
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

            {/* Pagination */}
            <div className="pagination2">
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={currentPage === index + 1 ? 'active2' : ''}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
        </div>
    );
}

// Workload Section Component
function Workload({ teamMembers }) {
    return (
        <div className="workload-section2">
            <h3 className="workload-header2">WORKLOAD</h3>
            {teamMembers.map((member, index) => {
                // Split the name into an array of words
                const nameParts = member.split(' ');

                // Use the first letter of the first name and check if there's a second part (like a last name)
                const initials = nameParts[0][0] + (nameParts[1] ? nameParts[1][0] : '');

                return (
                    <div key={index} className="workload-profile2">
                        <div className="profile-pic-placeholder2">
                            {initials}
                        </div>
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
    const requestsPerPage = 5;

    const teamMembers = ['Charles Coscos', 'Patrick Paclibar', 'Caryl Apa', 'Vincent Go', 'Rodel Bartolata', 'Tristan Chua', 'Jay-R'];

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/requests', { mode: 'cors' });
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

            const response = await fetch(`http://localhost:5000/api/requests/${requestId}`, {
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
        console.log(request); // Debug to ensure correct data is logged
        setSelectedRequest(request);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedRequest(null);
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
                                requests={requests}
                                handleStatusChange={handleStatusChange}
                                openOverlay={openOverlay}
                                openModal={openModal} // Pass the openModal function
                                currentPage={currentPage}
                                paginate={paginate}
                                requestsPerPage={requestsPerPage}
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
                            <button onClick={handleSave}>Save</button>
                            <button onClick={closeOverlay}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminDashboard;
