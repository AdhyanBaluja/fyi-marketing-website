import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SignIn.css';

// Use environment variable for the API base URL; fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function SignIn() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  
  // Animation states
  const [animationComplete, setAnimationComplete] = useState(false);
  const [typedEmail, setTypedEmail] = useState('');
  const [focusedInput, setFocusedInput] = useState(null);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input focus
  const handleFocus = (inputName) => {
    setFocusedInput(inputName);
  };

  // Handle input blur
  const handleBlur = () => {
    setFocusedInput(null);
  };

  // Entry animation sequence
  useEffect(() => {
    // Give time for the page to load before starting animations
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  // Submit => API call to backend using API_BASE_URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      console.log('Attempting to login with:', formData);

      // Simulated delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 1200));

      // POST to backend using API_BASE_URL from env
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData
      );
      console.log('Server response:', response.data);

      // Expected response: { message, token, user: { _id, email, role, ... } }
      const { token, user } = response.data;

      if (!token || !user) {
        throw new Error('Invalid response from server: missing token or user');
      }

      // Success animation before redirect
      setShowSuccessOverlay(true);

      // Short delay before storing data and navigating
      setTimeout(() => {
        // Store data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userType', user.role); // 'brand' or 'influencer'
        localStorage.setItem('userId', user._id);    // for dashboards if needed
        localStorage.setItem('isLoggedIn', 'true');

        // Navigate based on role
        if (user.role === 'brand') {
          navigate('/brand/dashboard');
        } else if (user.role === 'influencer') {
          navigate('/influencer/dashboard');
        } else {
          console.warn('Unrecognized user role:', user.role);
          navigate('/');
        }
      }, 1500);

    } catch (error) {
      console.error('Login error:', error);
      let msg = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        msg = error.response.data.error;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
      setIsLoading(false);

      // Shake animation effect on error
      const formElement = document.querySelector('.cosmic-signin-card');
      formElement.classList.add('nebula-shake');
      setTimeout(() => {
        formElement.classList.remove('nebula-shake');
      }, 500);
    }
  };

  // Sign up navigation
  const handleSignUpNavigation = () => {
    // Add exit animation
    const container = document.querySelector('.cosmic-universe');
    container.classList.add('cosmos-transition-out');
    
    setTimeout(() => {
      navigate('/signup');
    }, 800);
  };

  // Create particle effect (stars)
  useEffect(() => {
    const createStars = () => {
      const universe = document.querySelector('.cosmic-universe');
      const starsCount = 100;
      
      for (let i = 0; i < starsCount; i++) {
        const star = document.createElement('div');
        star.classList.add('stellar-particle');
        
        // Random position
        star.style.top = `${Math.random() * 100}%`;
        star.style.left = `${Math.random() * 100}%`;
        
        // Random size
        const size = Math.random() * 3;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        
        // Random opacity and animation delay
        star.style.opacity = `${Math.random() * 0.8 + 0.2}`;
        star.style.animationDelay = `${Math.random() * 8}s`;
        
        universe.appendChild(star);
      }
    };
    
    if (animationComplete) {
      createStars();
    }
    
    return () => {
      const stars = document.querySelectorAll('.stellar-particle');
      stars.forEach(star => star.remove());
    };
  }, [animationComplete]);

  return (
    <div className={`cosmic-universe ${animationComplete ? 'universe-loaded' : ''}`}>
      <div className="galactic-ring"></div>
      <div className="nebula-cloud nebula-top-right"></div>
      <div className="nebula-cloud nebula-bottom-left"></div>
      
      <div className={`cosmic-portal ${animationComplete ? 'portal-opened' : ''}`}>
        <div className="portal-inner-ring"></div>
      </div>
      
      <div className={`cosmic-signin-container ${animationComplete ? 'signin-revealed' : ''}`}>
        <div className="cosmic-signin-card">
          <div className="stardust-logo">
            <div className="logo-orbit">
              <div className="logo-planet"></div>
            </div>
          </div>
          
          <h2 className="supernova-title">Sign In</h2>

          {errorMessage && <p className="meteor-error">{errorMessage}</p>}

          <form onSubmit={handleSubmit}>
            <div className={`astral-form-group ${focusedInput === 'email' ? 'input-focused' : ''}`}>
              <label className="celestial-label">Email Address</label>
              <div className="interstellar-input-wrapper">
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  placeholder="Enter your email"
                  className="cosmic-input"
                />
                <div className="cosmic-glow"></div>
              </div>
            </div>

            <div className={`astral-form-group ${focusedInput === 'password' ? 'input-focused' : ''}`}>
              <label className="celestial-label">Password</label>
              <div className="interstellar-input-wrapper">
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  onFocus={() => handleFocus('password')}
                  onBlur={handleBlur}
                  placeholder="Enter your password"
                  className="cosmic-input"
                />
                <div className="cosmic-glow"></div>
              </div>
            </div>

            <button 
              type="submit" 
              className={`quantum-signin-btn ${isLoading ? 'pulsating' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="warp-loader">
                  <div className="warp-circle"></div>
                  <div className="warp-circle"></div>
                  <div className="warp-circle"></div>
                </div>
              ) : 'Login'}
            </button>
          </form>

          <div className="cosmic-separator">
            <div className="star-line"></div>
            <div className="galaxy-orb"></div>
            <div className="star-line"></div>
          </div>

          <p className="comet-signup-cta">
            Don't have an account? <span onClick={handleSignUpNavigation} className="pulsar-link">Sign Up</span>
          </p>
        </div>
      </div>

      {/* Success overlay animation */}
      {showSuccessOverlay && (
        <div className="interstellar-success-overlay">
          <div className="cosmic-success-icon">
            <svg viewBox="0 0 24 24" width="100" height="100">
              <circle className="success-circle" cx="12" cy="12" r="11" />
              <path className="success-checkmark" d="M7 13l3 3 7-7" />
            </svg>
          </div>
          <p className="cosmic-welcome-message">Welcome back!</p>
        </div>
      )}
    </div>
  );
}

export default SignIn;