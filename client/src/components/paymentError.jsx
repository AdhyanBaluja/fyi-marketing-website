import React from 'react';
import { useNavigate } from 'react-router-dom';

function PaymentError() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/'); // Change this route if your landing page is elsewhere.
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '4rem' }}>
      <h1>Payment Canceled or Failed</h1>
      <p>It looks like the payment process was canceled or there was an error.</p>
      <p>Please try again or contact support.</p>
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

export default PaymentError;
