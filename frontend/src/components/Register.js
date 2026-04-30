import React, { useState } from 'react';
import { saveAuthData } from '../utils/auth';

const Register = ({ onRegisterSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
     const response = await fetch('https://roadhazardtracker-4hu8.onrender.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, email, password }),
});

      const data = await response.json();

      if (response.ok) {
        saveAuthData(data.token, data.user);
        onRegisterSuccess(data.user);
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2>Register</h2>
      {error && <p style={styles.error}>{error}</p>}
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          required
          style={styles.input}
        />
      </div>
      <div>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />
      </div>
      <div>
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          minLength={6}
          style={styles.input}
        />
      </div>
      <button type="submit" style={styles.button}>Register</button>
    </form>
  );
};

const styles = {
  form: { maxWidth: '400px', margin: 'auto', padding: '20px', border: '1px solid #ccc', borderRadius: '5px' },
  input: { width: '100%', padding: '8px', margin: '8px 0' },
  button: { padding: '10px 15px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '3px', cursor: 'pointer' },
  error: { color: 'red' },
};

export default Register;
