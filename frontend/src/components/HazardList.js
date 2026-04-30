import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('https://roadhazardtracker-4hu8.onrender.com'); // Use your backend URL here

const HazardList = () => {
  const [hazards, setHazards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const response = await fetch('https://roadhazardtracker-4hu8.onrender.com/api/hazards');
        const data = await response.json();
        if (response.ok) {
          setHazards(data);
        } else {
          setError(data.message || 'Failed to fetch hazards');
        }
      } catch (err) {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchHazards();

    // Listen for new hazard reports via Socket.IO
    socket.on('newHazard', (newHazard) => {
      setHazards(prevHazards => [newHazard, ...prevHazards]);
    });

    // Cleanup on unmount
    return () => {
      socket.off('newHazard');
    };
  }, []);

  if (loading) return <p>Loading hazards...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!hazards.length) return <p>No hazards reported yet.</p>;

  return (
    <div style={{ maxWidth: '700px', margin: 'auto' }}>
      <h2>Reported Hazards</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {hazards.map(hazard => (
          <li key={hazard._id} style={styles.hazardItem}>
            <h3>{hazard.title} <small>({hazard.severity})</small></h3>
            <p>{hazard.description}</p>
            <p><em>Reported by: {hazard.reportedBy?.name || 'Unknown'}</em></p>
            <p><small>Reported at: {new Date(hazard.createdAt).toLocaleString()}</small></p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  hazardItem: {
    borderBottom: '1px solid #ccc',
    padding: '10px 0',
  },
};

export default HazardList;
