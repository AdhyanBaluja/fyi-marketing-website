// src/pages/PaymentSuccess.jsx

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const sessionId = query.get('session_id');
    console.log('Paid session id:', sessionId);
    // Optionally, fetch additional session details if needed.
  }, [location]);

  const handleGoHome = () => {
    navigate('/'); // Change this route if your landing page is elsewhere.
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Payment Successful!</h1>
      <p>Thank you for purchasing our plan.</p>
      <p>You now have access to the premium features.</p>
      <button
        onClick={handleGoHome}
        style={{
          marginTop: '2rem',
          padding: '0.75rem 1.5rem',
          backgroundColor: '#FF7D00',
          color: '#FFECD1',
          border: 'none',
          borderRadius: '6px',
          fontSize: '1rem',
          cursor: 'pointer',
          transition: 'background-color 0.3s',
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = '#78290F')}
        onMouseOut={(e) => (e.target.style.backgroundColor = '#FF7D00')}
      >
        Go to Landing Page
      </button>
    </div>
  );
}

export default PaymentSuccess;
