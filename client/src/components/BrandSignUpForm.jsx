import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import './BrandSignUpForm.css';

// Use the API base URL from the environment variable (fallback to localhost for development)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function BrandSignUpForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    businessName: '',
    brandWebsite: '',
    campaignGoals: '',
    budgetRange: '',
  });

  // Multi-select arrays for confirmed selections
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);

  // Temporary selections from dropdowns
  const [tempIndustrySelection, setTempIndustrySelection] = useState([]);
  const [tempPlatformSelection, setTempPlatformSelection] = useState([]);

  // Industry options list
  const industryOptions = [
    'Agriculture', 'Aviation', 'Beauty', 'Biotechnology', 'Chemical',
    'Construction', 'Defense and Security', 'E-commerce', 'Education',
    'Energy', 'Event Planning', 'Fashion', 'Finance', 'Fintech', 'Fitness',
    'Food', 'Fundraising', 'Gaming', 'Healthcare', 'Hospitality Industry',
    'Insurance', 'Legal Services', 'Logistics', 'Luxury Goods', 'Marine',
    'Mining', 'Pet Care', 'Pharmaceutics', 'Photography', 'Real Estate',
    'Retail', 'Space', 'Sports', 'Technology', 'Telecommunication',
    'Travel', 'Utilities'
  ];

  // Platform options list
  const platformOptions = [
    'Instagram', 'TikTok', 'YouTube', 'Facebook', 'X', 'LinkedIn', 
    'Twitch', 'Reddit', 'Pinterest', 'Threads', 'Quora', 'Discord', 'Snapchat'
  ];

  // Standard text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Multi-select (industries)
  const handleIndustryChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setTempIndustrySelection(selected);
  };

  const handleAddIndustry = () => {
    const newIndustries = [...selectedIndustries];
    tempIndustrySelection.forEach((ind) => {
      if (!newIndustries.includes(ind)) {
        newIndustries.push(ind);
      }
    });
    setSelectedIndustries(newIndustries);
  };

  // Multi-select (platforms)
  const handlePlatformChange = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setTempPlatformSelection(selected);
  };

  const handleAddPlatform = () => {
    const newPlatforms = [...selectedPlatforms];
    tempPlatformSelection.forEach((plat) => {
      if (!newPlatforms.includes(plat)) {
        newPlatforms.push(plat);
      }
    });
    setSelectedPlatforms(newPlatforms);
  };

  // Submit form => call backend
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Combine form data with selected industries and platforms
    const finalData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      businessName: formData.businessName,
      brandWebsite: formData.brandWebsite,
      industries: selectedIndustries,
      campaignGoals: formData.campaignGoals,
      budgetRange: formData.budgetRange,
      platforms: selectedPlatforms,
    };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/signup/brand`,
        finalData
      );
      console.log('Brand signup success:', res.data);

      // On success, navigate to sign in
      navigate('/signin');
    } catch (error) {
      console.error('Error signing up brand:', error);
      setErrorMessage(
        error.response?.data?.error || 'Brand signup failed. Please try again.'
      );
    }
  };

  return (
    <div className="brand-form-container">
      {/* NavBar at the top */}
      <NavBar />

      <div className="video-background">
        <iframe
          className="video-iframe"
          src="https://www.youtube.com/embed/RRv5udKGG68?autoplay=1&mute=1&controls=0&loop=1&playlist=RRv5udKGG68"
          title="Brand Background Video"
          frameBorder="0"
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
        <div className="video-overlay"></div>
      </div>

      <div className="brand-form-content">
        <h2>Brand Registration</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name <span>*</span></label>
            <input
              type="text"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Last Name <span>*</span></label>
            <input
              type="text"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Email <span>*</span></label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Password <span>*</span></label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Business Name <span>*</span></label>
            <input
              type="text"
              name="businessName"
              required
              value={formData.businessName}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Brand Website</label>
            <input
              type="url"
              name="brandWebsite"
              placeholder="https://"
              value={formData.brandWebsite}
              onChange={handleChange}
            />
          </div>

          {/* Industry multi-select with add button */}
          <div className="form-group">
            <label>Industry <span>*</span></label>
            <select multiple onChange={handleIndustryChange}>
              {industryOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="add-btn"
              onClick={handleAddIndustry}
            >
              Add Industry
            </button>
            <div className="selected-items">
              {selectedIndustries.map((item, idx) => (
                <span key={idx} className="selected-tag">
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* Campaign Goals */}
          <div className="form-group">
            <label>Define Your Campaign Goals</label>
            <textarea
              name="campaignGoals"
              rows="3"
              value={formData.campaignGoals}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Budget Range (GBP)</label>
            <input
              type="number"
              name="budgetRange"
              value={formData.budgetRange}
              onChange={handleChange}
            />
          </div>

          {/* Platforms multi-select with add button */}
          <div className="form-group">
            <label>Platforms</label>
            <select multiple onChange={handlePlatformChange}>
              {platformOptions.map((plat) => (
                <option key={plat} value={plat}>
                  {plat}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="add-btn"
              onClick={handleAddPlatform}
            >
              Add Platform
            </button>
            <div className="selected-items">
              {selectedPlatforms.map((p, idx) => (
                <span key={idx} className="selected-tag">
                  {p}
                </span>
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default BrandSignUpForm;
