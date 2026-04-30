import React from 'react';

const Header = ({ user, onLogout }) => {
  return (
    <header style={styles.header}>
      <h1 style={styles.title}>Road Hazard Tracker</h1>
      <nav>
        {user ? (
          <div style={styles.userSection}>
            <span>Welcome, {user.name}!</span>
            <button style={styles.button} onClick={onLogout}>Logout</button>
          </div>
        ) : (
          <div>Please log in or register.</div>
        )}
      </nav>
    </header>
  );
};

const styles = {
  header: {
    padding: '10px 20px',
    borderBottom: '1px solid #ddd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    margin: 0,
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  button: {
    cursor: 'pointer',
    padding: '6px 12px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '3px',
  },
};

export default Header;
