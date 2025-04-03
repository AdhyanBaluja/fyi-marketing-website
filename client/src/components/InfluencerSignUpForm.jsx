import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import './InfluencerSignUpForm.css';

// Use environment variable for the API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function InfluencerSignUpForm() {
  const navigate = useNavigate();

  // Basic user fields required by the backend
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Influencer-specific fields
  const [formData, setFormData] = useState({
    name: '',
    experience: '',
    numFollowers: '',
    gender: '',
    influencerLocation: '',
    majorityAudienceLocation: '',
    audienceAgeGroup: '',
    audienceGenderDemographics: ''
  });

  // Multi-select fields
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformDetails, setPlatformDetails] = useState({});

  const [tempIndustrySelection, setTempIndustrySelection] = useState([]);
  const [tempPlatformSelection, setTempPlatformSelection] = useState([]);

  // Industry & Platform options
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

  const platformOptions = [
    'Instagram', 'LinkedIn', 'Facebook', 'Twitch', 'Reddit', 'Pinterest',
    'TikTok', 'X', 'Youtube', 'Threads', 'Quora', 'Discord', 'Snapchat'
  ];

  // Handle user account info
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle influencer-specific fields
  const handleInfluencerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ----- Industry multi-select
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
    tempIndustrySelection.forEach((item) => {
      if (!newIndustries.includes(item)) {
        newIndustries.push(item);
      }
    });
    setSelectedIndustries(newIndustries);
  };

  // ----- Platform multi-select
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
    tempPlatformSelection.forEach((item) => {
      if (!newPlatforms.includes(item)) {
        newPlatforms.push(item);
      }
    });
    setSelectedPlatforms(newPlatforms);

    // Initialize platform details if not present
    setPlatformDetails((prev) => {
      const newDetails = { ...prev };
      newPlatforms.forEach((p) => {
        if (!newDetails[p]) {
          newDetails[p] = { handle: '', price: '' };
        }
      });
      return newDetails;
    });
  };

  // Handle handle/price changes for each selected platform
  const handlePlatformDetailChange = (platform, field, value) => {
    setPlatformDetails((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  // Submit
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Combine all data
    const finalData = {
      // User account info
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,

      // Influencer fields
      name: formData.name,
      experience: formData.experience,
      numFollowers: formData.numFollowers,
      influencerLocation: formData.influencerLocation,
      majorityAudienceLocation: formData.majorityAudienceLocation,
      audienceAgeGroup: formData.audienceAgeGroup,
      audienceGenderDemographics: formData.audienceGenderDemographics,
      gender: formData.gender,

      // Arrays
      industries: selectedIndustries,
      platforms: selectedPlatforms,

      // Additional platform details
      platformDetails
    };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/signup/influencer`,
        finalData
      );
      console.log('Influencer signup success:', res.data);
      navigate('/signin');
    } catch (error) {
      console.error('Error signing up influencer:', error);
      setErrorMessage(
        error.response?.data?.error || 'Influencer signup failed. Please try again.'
      );
    }
  };

  return (
    <div className="influencer-form-container">
      <NavBar />
      
      <div className="influencer-form-box">
        <h2>Influencer Registration</h2>
        {errorMessage && <p className="error-message">{errorMessage}</p>}

        <form onSubmit={handleSubmit}>
          {/* ---------- User Fields ---------- */}
          <div className="form-group">
            <label>
              First Name <span>*</span>
            </label>
            <input
              type="text"
              name="firstName"
              required
              value={userData.firstName}
              onChange={handleUserChange}
            />
          </div>

          <div className="form-group">
            <label>
              Last Name <span>*</span>
            </label>
            <input
              type="text"
              name="lastName"
              required
              value={userData.lastName}
              onChange={handleUserChange}
            />
          </div>

          <div className="form-group">
            <label>
              Email <span>*</span>
            </label>
            <input
              type="email"
              name="email"
              required
              value={userData.email}
              onChange={handleUserChange}
            />
          </div>

          <div className="form-group">
            <label>
              Password <span>*</span>
            </label>
            <input
              type="password"
              name="password"
              required
              value={userData.password}
              onChange={handleUserChange}
            />
          </div>

          {/* ---------- Influencer-Specific Fields ---------- */}
          <div className="form-group">
            <label>
              Display Name <span>*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>
              Experience (Years) <span>*</span>
            </label>
            <input
              type="number"
              name="experience"
              required
              min="0"
              value={formData.experience}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>Number of Followers</label>
            <input
              type="number"
              name="numFollowers"
              min="0"
              value={formData.numFollowers}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>Influencer Location</label>
            <input
              type="text"
              name="influencerLocation"
              value={formData.influencerLocation}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>Majority Audience Location</label>
            <input
              type="text"
              name="majorityAudienceLocation"
              value={formData.majorityAudienceLocation}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>Audience Age-Group Demographics</label>
            <input
              type="text"
              name="audienceAgeGroup"
              value={formData.audienceAgeGroup}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>Audience Gender Demographics</label>
            <input
              type="text"
              name="audienceGenderDemographics"
              value={formData.audienceGenderDemographics}
              onChange={handleInfluencerChange}
            />
          </div>

          <div className="form-group">
            <label>Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInfluencerChange}
            >
              <option value="">--Select--</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other / Prefer Not to Say</option>
            </select>
          </div>

          {/* Multi-select for Industry and Platform */}
          <div className="multi-select-container">
            <div className="form-group">
              <label>Industry Category</label>
              <select multiple onChange={handleIndustryChange}>
                {industryOptions.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
              <button type="button" className="add-btn" onClick={handleAddIndustry}>
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

            <div className="form-group">
              <label>Niche Platforms</label>
              <select multiple onChange={handlePlatformChange}>
                {platformOptions.map((plat) => (
                  <option key={plat} value={plat}>
                    {plat}
                  </option>
                ))}
              </select>
              <button type="button" className="add-btn" onClick={handleAddPlatform}>
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
          </div>

          {/* Platform details for each selected platform */}
          {selectedPlatforms.length > 0 && (
            <div className="platform-details-section">
              <h3>Platform Details</h3>
              {selectedPlatforms.map((platform) => (
                <div key={platform} className="form-group platform-detail-group">
                  <label>{platform} Handle:</label>
                  <input
                    type="text"
                    value={platformDetails[platform]?.handle || ''}
                    onChange={(e) =>
                      handlePlatformDetailChange(platform, 'handle', e.target.value)
                    }
                  />
                  <label>{platform} Price per post:</label>
                  <input
                    type="number"
                    value={platformDetails[platform]?.price || ''}
                    onChange={(e) =>
                      handlePlatformDetailChange(platform, 'price', e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <button type="submit" className="submit-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
}

export default InfluencerSignUpForm;
