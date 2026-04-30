import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import { getUser, clearAuthData, isAuthenticated } from './utils/auth';
import HazardForm from './components/HazardForm';
import HazardList from './components/HazardList';
import HazardMap from './components/HazardMap';


const App = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      setUser(getUser());
    }
  }, []);

  const handleLogout = () => {
    clearAuthData();
    setUser(null);
    setShowLogin(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleRegisterSuccess = (userData) => {
    setUser(userData);
    setShowLogin(true);
  };

  return (
    <div>
      <Header user={user} onLogout={handleLogout} />
      <main style={{ padding: '20px' }}>
        {!user ? (
          <>
            {showLogin ? (
              <>
                <Login onLoginSuccess={handleLoginSuccess} />
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setShowLogin(false)} style={styles.linkButton}>
                    Register here
                  </button>
                </p>
              </>
            ) : (
              <>
                <Register onRegisterSuccess={handleRegisterSuccess} />
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setShowLogin(true)} style={styles.linkButton}>
                    Login here
                  </button>
                </p>
              </>
            )}
          </>
        ) : (
           <>
          <HazardForm />
          <HazardList />
        </>
        )}
      </main>
    </div>
  );
};

const styles = {
  linkButton: {
    background: 'none',
    border: 'none',
    color: '#007bff',
    textDecoration: 'underline',
    cursor: 'pointer',
    padding: 0,
    fontSize: '1em',
  },
};

export default App;
