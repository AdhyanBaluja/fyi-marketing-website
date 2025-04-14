import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './NavBar.css';

import logoBird from '../assets/newLogo.png';

/**
 * Enhanced NavBar component with animations and interactive effects:
 * - Shows Let'sFYI logo + brand name with animations
 * - Dynamic background with transparency effect on scroll
 * - Interactive elements with hover and magnetic button effects
 * - Responsive design with mobile adaptations
 * - Shows "Buy Premium Plan" for brand users and a profile circle for logged-in users
 * - Clicking on the logo/title navigates to appropriate dashboard or sign in
 */

function NavBar({ isLoggedIn, userType, scrolled }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoadingEffect, setShowLoadingEffect] = useState(true);
  const [authState, setAuthState] = useState({ isLoggedIn, userType });
  const navbarRef = useRef(null);
  const buttonsRef = useRef([]);

  // Update authentication state when props or route change
  useEffect(() => {
    const protectedRoutes = [
      '/brand/',
      '/influencer/',
      '/plans',
      '/campaign-results',
      '/campaign-builder',
      '/find-influencer'
    ];
    
    const isLoggedInByRoute = protectedRoutes.some(route => 
      location.pathname.includes(route)
    );
    
    let detectedUserType = userType;
    if (!detectedUserType && location.pathname.includes('/brand/')) {
      detectedUserType = 'brand';
    } else if (!detectedUserType && location.pathname.includes('/influencer/')) {
      detectedUserType = 'influencer';
    } else if (!detectedUserType && (
      location.pathname.includes('/campaign-results') || 
      location.pathname.includes('/campaign-builder') ||
      location.pathname.includes('/find-influencer')
    )) {
      detectedUserType = 'brand';
    }

    setAuthState({
      isLoggedIn: isLoggedIn || isLoggedInByRoute,
      userType: detectedUserType
    });
  }, [isLoggedIn, userType, location.pathname]);

  // Navigate based on user authentication state when clicking the logo/title
  const handleTitleClick = () => {
    if (!authState.isLoggedIn) {
      navigate('/signin');
    } else if (authState.userType === 'brand') {
      navigate('/brand/dashboard');
    } else {
      navigate('/influencer/dashboard');
    }
  };

  // Navigate to plans for brand users
  const handleBuyPremium = () => {
    navigate('/plans');
  };

  // Navigate to the appropriate dashboard when clicking the profile circle
  const handleProfileClick = () => {
    if (authState.userType === 'brand') navigate('/brand/dashboard');
    else navigate('/influencer/dashboard');
  };

  // Magnetic button effect handlers
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

  // Initialize loading effect and magnetic button event listeners
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoadingEffect(false);
    }, 2000);

    // Store event handlers to remove them later
    const mouseMoveHandlers = [];
    const mouseLeaveHandlers = [];
    
    buttonsRef.current.forEach((button, index) => {
      if (!button) return;
      const mouseMoveHandler = (e) => handleButtonMouseMove(e, index);
      const mouseLeaveHandler = () => handleButtonMouseLeave(index);
      mouseMoveHandlers[index] = mouseMoveHandler;
      mouseLeaveHandlers[index] = mouseLeaveHandler;
      button.addEventListener('mousemove', mouseMoveHandler);
      button.addEventListener('mouseleave', mouseLeaveHandler);
    });

    return () => {
      clearTimeout(timer);
      buttonsRef.current.forEach((button, index) => {
        if (!button) return;
        button.removeEventListener('mousemove', mouseMoveHandlers[index]);
        button.removeEventListener('mouseleave', mouseLeaveHandlers[index]);
      });
    };
  }, []);

  return (
    <nav 
      ref={navbarRef}
      className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${showLoadingEffect ? 'loading' : ''}`}
      style={{ justifyContent: 'space-between' }} // Force space-between layout
    >
      {/* Background pattern for extra visual interest */}
      <div className="navbar-pattern"></div>
      
      <div className="navbar-left" onClick={handleTitleClick} style={{ margin: 0 }}>
        <div className="logo-container">
          <img src={logoBird} alt="FYI logo" className="navbar-logo" />
        </div>
        <h1 className="navbar-title typing-animation">Let'sFYI</h1>
      </div>

      <div className="navbar-right">
        {authState.isLoggedIn && authState.userType === 'brand' && (
          <button 
            ref={el => buttonsRef.current[0] = el}
            className="navbar-btn plan-btn clip-animation" 
            onClick={handleBuyPremium}
          >
            Buy Premium Plan
          </button>
        )}

        {authState.isLoggedIn && (
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
          </div>
        )}
        
        {!authState.isLoggedIn && (
          <>
            <button 
              ref={el => buttonsRef.current[1] = el}
              className="navbar-btn" 
              onClick={() => navigate('/signin')}
            >
              Sign In
            </button>
            <button 
              ref={el => buttonsRef.current[2] = el}
              className="navbar-btn plan-btn" 
              onClick={() => navigate('/signup')}
            >
              Sign Up
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;