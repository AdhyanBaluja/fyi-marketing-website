import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DriveSales.css';
import AiChatbot from './AiChatbot.jsx';
import demoImage from '../assets/demo.png';

// Use environment variable for the API base URL; fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function DriveSales() {
  const navigate = useNavigate();

  // Form data
  const [formData, setFormData] = useState({
    businessDescription: '',
    industry: '',
    timeframe: { start: '', end: '' },
    platforms: '',
    productService: '',
    promotionalOffers: '',
    targetLocations: '',
  });

  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'timeframeStart' || name === 'timeframeEnd') {
      setFormData((prev) => ({
        ...prev,
        timeframe: {
          ...prev.timeframe,
          [name === 'timeframeStart' ? 'start' : 'end']: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Submit form => create campaign
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsCreating(true);

    try {
      // 1) Prepare data for AI endpoint
      const payload = {
        campaignType: 'driveSales',
        describeBusiness: formData.businessDescription,
        industry: formData.industry,
        timeframeStart: formData.timeframe.start,
        timeframeEnd: formData.timeframe.end,
        platforms: formData.platforms,
        salesProductOrService: formData.productService,
        promotionalOffers: formData.promotionalOffers,
        salesLocation: formData.targetLocations,
      };

      // 2) Call your AI endpoint using API_BASE_URL from env
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/generateCampaign`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3) If successful, store the new campaign ID in localStorage
      const newCampaign = response.data.campaign;
      if (newCampaign && newCampaign._id) {
        localStorage.setItem('latestCampaignId', newCampaign._id);
      }

      // 4) Navigate to the loading page
      navigate('/loading');
    } catch (error) {
      console.error('Error creating DriveSales campaign:', error);
      setErrorMessage('Failed to create AI campaign plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="drive-sales-container">
      <div className="form-section">
        <h2>Drive Sales</h2>
        <p>
          Accelerate your sales efforts and push for higher conversion rates. Provide the
          details below to create a personalized multi-channel strategy.
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isCreating && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            Creating campaign, please wait...
          </p>
        )}

        <form className="drive-sales-form" onSubmit={handleSubmit}>
          {/* Question 1 */}
          <div className="form-group">
            <label>Describe your business</label>
            <textarea
              name="businessDescription"
              rows="3"
              placeholder="Enter a brief description of your business..."
              value={formData.businessDescription}
              onChange={handleChange}
            />
          </div>

          {/* Question 2 */}
          <div className="form-group">
            <label>Industry that describes your business</label>
            <select
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            >
              <option value="">--Select Industry--</option>
              <option value="Fashion">Fashion</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Food">Food</option>
              <option value="Retail">Retail</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Question 3 */}
          <div className="form-group timeframe">
            <label>What is your campaign’s timeframe?</label>
            <div className="timeframe-inputs">
              <input
                type="date"
                name="timeframeStart"
                value={formData.timeframe.start}
                onChange={handleChange}
              />
              <span>to</span>
              <input
                type="date"
                name="timeframeEnd"
                value={formData.timeframe.end}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Question 4 */}
          <div className="form-group">
            <label>Which platforms do you want to promote on?</label>
            <textarea
              name="platforms"
              rows="2"
              placeholder="Specify platforms like social media, email, search engine..."
              value={formData.platforms}
              onChange={handleChange}
            />
          </div>

          {/* Question 5 */}
          <div className="form-group">
            <label>What product(s) or service(s) are you focusing on for sales?</label>
            <textarea
              name="productService"
              rows="3"
              placeholder="Specify the key offerings you want to promote..."
              value={formData.productService}
              onChange={handleChange}
            />
          </div>

          {/* Question 6 */}
          <div className="form-group">
            <label>What promotional offers will you include to boost sales?</label>
            <textarea
              name="promotionalOffers"
              rows="3"
              placeholder="Example: Discounts, free shipping, limited-time deals..."
              value={formData.promotionalOffers}
              onChange={handleChange}
            />
          </div>

          {/* Question 7 */}
          <div className="form-group">
            <label>What location(s) would you like to target for driving sales?</label>
            <select
              name="targetLocations"
              value={formData.targetLocations}
              onChange={handleChange}
            >
              <option value="">--Select Locations--</option>
              <option value="London">London</option>
              <option value="Manchester">Manchester</option>
              <option value="Birmingham">Birmingham</option>
              <option value="Liverpool">Liverpool</option>
              <option value="Edinburgh">Edinburgh</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create Campaign'}
          </button>
        </form>
      </div>

      <div className="image-section">
        <img src={demoImage} alt="Demo" className="demo-image" />
      </div>
      <AiChatbot />
    </div>
  );
}

export default DriveSales;
