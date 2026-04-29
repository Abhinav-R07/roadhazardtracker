import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { getToken } from '../utils/auth';
import 'leaflet/dist/leaflet.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Fix leaflet marker icon issue
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return position === null ? null : <Marker position={position}></Marker>;
};

const HazardForm = ({ onNewHazard }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('High'); // default High
  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
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
          location: {
            type: 'Point',
            coordinates: [position[1], position[0]],
          },
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
    } catch (err) {
      setError('Network error.');
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: '600px' }}>
  <div className="card shadow rounded">
    <div className="card-body">
      <h2 className="card-title text-center mb-4">Report Road Hazard</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            id="title"
            type="text"
            className="form-control"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="severity" className="form-label">Severity</label>
          <select
            id="severity"
            className="form-select"
            value={severity}
            onChange={e => setSeverity(e.target.value)}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="form-label">Select Location on Map</label>
          <div style={{ height: '300px', borderRadius: '5px', overflow: 'hidden' }}>
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
          <small className="text-muted">Click on the map to select hazard location.</small>
        </div>

        <button type="submit" className="btn btn-primary w-100 fw-bold">Report Hazard</button>
      </form>
    </div>
  </div>
</div>

  );
};

export default HazardForm;