import React, { useEffect, useState } from 'react';
import './AllProfiles.css'; // Import your CSS for styling
import { FaBullseye } from 'react-icons/fa'; // Import an icon for the completion percentage

function AllProfiles() {
  const [teamMembers, setTeamMembers] = useState([]); // State to store team members
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  // Fetch team member data from API
  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/teamMembers/stats'); // Fetch from the new stats endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }
        const data = await response.json();
        setTeamMembers(data); // Store team members data
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Handle loading and error states
  if (loading) {
    return <div>Loading team members...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="all-profiles-container">
      <h1>EVALUATORS</h1>
      <div className="profiles-grid">
        {teamMembers.map((member) => (
          <div key={member.name} className="card">
            <div className="details">
              <h2 className="profile-name">{member.name}</h2>
              <p className="task-stats">
                Open Tasks: <span>{member.openTasks}</span>
              </p>
              <p className="task-stats">
                Closed Tasks: <span>{member.closedTasks}</span>
              </p>
              <p className="task-stats">
                Total Requests: <span>{member.openTasks + member.closedTasks}</span> {/* Total requests */}
              </p>
              <p className="task-stats">
                Efficiency: <span>{member.completionRate}%</span> {/* Use completion rate as efficiency */}
              </p>
            </div>
            <div className="completion">
              <FaBullseye className="icon" />
              <span className="completion-label">Completion Rate: </span>
              <span className="completion-rate">{member.completionRate}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllProfiles;
