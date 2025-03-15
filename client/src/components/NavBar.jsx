// src/components/NavBar.jsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css'; // (Optional) if you want separate styling

import logoBird from '../assets/newLogo.png'; // Adjust path if needed

/**
 * NavBar component that:
 * - Shows letFYI logo + brand name
 * - If user is logged in + brand => "Buy Premium Plan" button
 * - If user is logged in (brand or influencer) => Profile circle
 * - No Sign In / Sign Up buttons (they appear only on LandingPage)
 * - Clicking on the brand name or logo: 
 *    - if not logged in => goes to Sign In
 *    - if brand => /brand/dashboard
 *    - if influencer => /influencer/dashboard
 */
function NavBar({ isLoggedIn, userType, scrolled }) {
  const navigate = useNavigate();

  // Click brand name / logo => navigate accordingly
  const handleTitleClick = () => {
    if (!isLoggedIn) {
      navigate('/signin');
    } else if (userType === 'brand') {
      navigate('/brand/dashboard');
    } else {
      navigate('/influencer/dashboard');
    }
  };

  // Buy Premium => if brand user
  const handleBuyPremium = () => {
    navigate('/plans');
  };

  // Profile circle => brand or influencer dashboard
  const handleProfileClick = () => {
    if (userType === 'brand') navigate('/brand/dashboard');
    else navigate('/influencer/dashboard');
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-left" onClick={handleTitleClick}>
        <img src={logoBird} alt="FYI logo" className="navbar-logo" />
        <h1 className="navbar-title">letFYI</h1>
      </div>

      <div className="navbar-right">
        {/* If user is brand & logged in => show "Buy Premium Plan" */}
        {isLoggedIn && userType === 'brand' && (
          <button className="navbar-btn plan-btn" onClick={handleBuyPremium}>
            Buy Premium Plan
          </button>
        )}

        {/* If user is logged in => show profile circle */}
        {isLoggedIn && (
          <div
            className="profile-circle"
            onClick={handleProfileClick}
            title="Go to Dashboard"
          >
            <img
              src="https://via.placeholder.com/40x40.png?text=User"
              alt="Profile"
              className="profile-img"
            />
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
