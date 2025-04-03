import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './NavBar.css';

import logoBird from '../assets/newLogo.png';

/**
 * Enhanced NavBar component with animations and interactive effects:
 * - Shows letFYI logo + brand name with animations
 * - Dynamic background with gradient shift
 * - Interactive elements with hover and click effects
 * - Responsive design with mobile adaptations
 * - If user is logged in & is a brand, shows "Buy Premium Plan" button
 * - If user is logged in (brand or influencer), shows a profile circle
 * - Clicking on the brand name or logo navigates accordingly
 */

function NavBar({ isLoggedIn, userType, scrolled }) {
  const navigate = useNavigate();
  const [showLoadingEffect, setShowLoadingEffect] = useState(true);
  const navbarRef = useRef(null);
  const buttonsRef = useRef([]);

  // Handle clicking on the brand logo/title
  const handleTitleClick = () => {
    if (!isLoggedIn) {
      navigate('/signin');
    } else if (userType === 'brand') {
      navigate('/brand/dashboard');
    } else {
      navigate('/influencer/dashboard');
    }
  };

  // Handle "Buy Premium Plan" button click for brand users
  const handleBuyPremium = () => {
    navigate('/plans');
  };

  // Handle clicking on the profile circle
  const handleProfileClick = () => {
    if (userType === 'brand') navigate('/brand/dashboard');
    else navigate('/influencer/dashboard');
  };

  // Magnetic button effect
  const handleButtonMouseMove = (e, index) => {
    const button = buttonsRef.current[index];
    if (!button) return;
    
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const moveX = (x - centerX) / 5;
    const moveY = (y - centerY) / 5;
    
    button.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  const handleButtonMouseLeave = (index) => {
    const button = buttonsRef.current[index];
    if (!button) return;
    button.style.transform = 'translate(0, 0)';
  };

  // Initialize animations and effects on component mount
  useEffect(() => {
    // Remove loading effect after animation completes
    const timer = setTimeout(() => {
      setShowLoadingEffect(false);
    }, 2000);

    // Add event listeners for magnetic effect
    buttonsRef.current.forEach((button, index) => {
      if (!button) return;
      
      button.addEventListener('mousemove', (e) => handleButtonMouseMove(e, index));
      button.addEventListener('mouseleave', () => handleButtonMouseLeave(index));
    });

    return () => {
      clearTimeout(timer);
      
      // Clean up event listeners
      buttonsRef.current.forEach((button, index) => {
        if (!button) return;
        
        button.removeEventListener('mousemove', (e) => handleButtonMouseMove(e, index));
        button.removeEventListener('mouseleave', () => handleButtonMouseLeave(index));
      });
    };
  }, []);

  return (
    <nav 
      ref={navbarRef}
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${showLoadingEffect ? 'loading' : ''}`}
    >
      {/* Background pattern for extra visual interest */}
      <div className="navbar-pattern"></div>
      
      <div className="navbar-left" onClick={handleTitleClick}>
  <div className="logo-container">
    <img src={logoBird} alt="FYI logo" className="navbar-logo" />
  </div>
  <h1 className="navbar-title typing-animation">Let'sFYI</h1>
</div>

      <div className="navbar-right">
        {/* Show "Buy Premium Plan" button only if user is logged in as a brand */}
        {isLoggedIn && userType === 'brand' && (
          <button 
            ref={el => buttonsRef.current[0] = el}
            className="navbar-btn plan-btn clip-animation" 
            onClick={handleBuyPremium}
          >
            Buy Premium Plan
          </button>
        )}

        {/* Show profile circle if user is logged in */}
        {isLoggedIn && (
          <div
            className="profile-circle"
            onClick={handleProfileClick}
            title="Go to Dashboard"
          >
            <img
              src="https://i.pinimg.com/736x/ee/93/08/ee9308209e84dacf627e251004eeab64.jpg"
              alt="Profile"
              className="profile-img"
            />
            {/* Uncomment for notification indicator */}
            {/* <span className="notification-badge"></span> */}
          </div>
        )}
        
        {/* Show Sign In / Sign Up buttons when not logged in */}
        
      </div>
    </nav>
  );
}

export default NavBar;