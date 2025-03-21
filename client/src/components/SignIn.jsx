import React, { useState } from 'react';
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

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit => API call to backend using API_BASE_URL
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      console.log('Attempting to login with:', formData);

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

    } catch (error) {
      console.error('Login error:', error);
      let msg = 'Login failed. Please try again.';
      if (error.response && error.response.data && error.response.data.error) {
        msg = error.response.data.error;
      } else if (error.message) {
        msg = error.message;
      }
      setErrorMessage(msg);
    }
  };

  // Sign up navigation
  const handleSignUpNavigation = () => {
    navigate('/signup');
  };

  return (
    <div className="signin-container">
      <div className="signin-card">
        <h2>Sign In</h2>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <div className="forgot-password">
            <a href="#0">Forgot Your Password?</a>
          </div>

          <button type="submit" className="signin-btn">Login</button>
        </form>

        <p className="signup-cta">
          Don't have an account? <span onClick={handleSignUpNavigation}>Sign Up</span>
        </p>
      </div>
    </div>
  );
}

export default SignIn;
