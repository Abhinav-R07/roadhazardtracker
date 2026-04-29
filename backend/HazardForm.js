import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { getToken } from '../utils/auth';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Fix for leaflet marker icons
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const styles = {
  container: {
  maxWidth: '600px',
  margin: '40px auto',
  padding: '20px',
  backgroundColor: 'rgba(31, 41, 55, 0.85)', // dark semi-transparent
  borderRadius: '12px',
  boxShadow: '0 6px 15px rgba(0,0,0,0.3)',
  color: '#f0f0f0', // light text color
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
},

  title: {
    textAlign: 'center',
    color: '#2c3e50',
    fontWeight: '600',
    marginBottom: '25px',
  },
  label: {
    fontWeight: '600',
    color: '#34495e',
    marginBottom: '8px',
    display: 'block',
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '20px',
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '20px',
    resize: 'vertical',
  },
  select: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginBottom: '20px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '16px',
    cursor: 'pointer',
  },
  alertError: {
    color: '#842029',
    backgroundColor: '#f8d7da',
    borderColor: '#f5c2c7',
    padding: '10px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  alertSuccess: {
    color: '#0f5132',
    backgroundColor: '#d1e7dd',
    borderColor: '#badbcc',
    padding: '10px 15px',
    borderRadius: '8px',
    marginBottom: '20px',
  },
  mapContainer: {
    height: '300px',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '10px',
  },
  mapNote: {
    fontSize: '0.875rem',
    color: '#6c757d',
  },
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : <Marker position={position} />;
};

const HazardForm = ({ onNewHazard }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High');
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!position) {
      setError('Please select the hazard location on the map.');
      return;
    }

    const token = getToken();
    if (!token) {
      setError('You must be logged in to report a hazard.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/hazards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          description,
          severity,
          location: { type: 'Point', coordinates: [position[1], position[0]] },
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Hazard reported successfully.');
        setTitle('');
        setDescription('');
        setSeverity('High');
        setPosition(null);
        if (onNewHazard) onNewHazard(data);
      } else {
        setError(data.message || 'Failed to report hazard.');
      }
    } catch {
      setError('Network error.');
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Report Road Hazard</h2>

      {error && <div style={styles.alertError}>{error}</div>}
      {success && <div style={styles.alertSuccess}>{success}</div>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="title" style={styles.label}>
          Title
        </label>
        <input
          id="title"
          type="text"
          style={styles.input}
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />

        <label htmlFor="description" style={styles.label}>
          Description
        </label>
        <textarea
          id="description"
          style={styles.textarea}
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
        />

        <label htmlFor="severity" style={styles.label}>
          Severity
        </label>
        <select
          id="severity"
          style={styles.select}
          value={severity}
          onChange={e => setSeverity(e.target.value)}
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <label style={styles.label}>Select Location on Map</label>
        <div style={styles.mapContainer}>
          <MapContainer
            center={[51.505, -0.09]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker position={position} setPosition={setPosition} />
          </MapContainer>
        </div>
        <small style={styles.mapNote}>
          Click on the map to select hazard location.
        </small>

        <button type="submit" style={styles.button}>
          Report Hazard
        </button>
      </form>
    </div>
  );
};

export default HazardForm;
