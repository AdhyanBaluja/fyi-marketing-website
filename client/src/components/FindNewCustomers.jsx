// src/components/FindNewCustomers.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './FindNewCustomers.css';
import AiChatbot from './AiChatbot.jsx';
import demoImage from '../assets/demo.png';

function FindNewCustomers() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessDescription: '',
    industry: '',
    timeframe: { start: '', end: '' },
    platforms: '',
    newSegments: '',
    valueProposition: '',
  });
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

  // Submit form: Create campaign via AI endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsCreating(true);

    try {
      const payload = {
        campaignType: 'findNewCustomers',
        describeBusiness: formData.businessDescription,
        industry: formData.industry,
        timeframeStart: formData.timeframe.start,
        timeframeEnd: formData.timeframe.end,
        platforms: formData.platforms,
        exploringNewSegments: formData.newSegments,
        newCustomerValueProp: formData.valueProposition,
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/ai/generateCampaign',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newCampaign = response.data.campaign;
      if (newCampaign && newCampaign._id) {
        localStorage.setItem('latestCampaignId', newCampaign._id);
      } else {
        setErrorMessage('Campaign created, but no ID was returned.');
      }
      navigate('/loading');
    } catch (error) {
      console.error('Error creating FindNewCustomers campaign:', error);
      setErrorMessage('Failed to create AI campaign plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="find-customers-container">
      <div className="form-section">
        <h2>Find New Customers</h2>
        <p>
          Reach untapped markets and expand your customer base. Provide the details below to create a personalized multi-channel strategy.
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isCreating && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            Creating campaign, please wait...
          </p>
        )}

        <form className="find-customers-form" onSubmit={handleSubmit}>
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
            <label>Are you open to exploring new customer segments or markets?</label>
            <textarea
              name="newSegments"
              rows="3"
              placeholder="Example: Testing new demographics, geographic regions, or interests..."
              value={formData.newSegments}
              onChange={handleChange}
            />
          </div>

          {/* Question 6 */}
          <div className="form-group">
            <label>What is the primary value proposition for attracting new customers?</label>
            <textarea
              name="valueProposition"
              rows="3"
              placeholder="Example: What makes your product/service appealing to first-time customers?"
              value={formData.valueProposition}
              onChange={handleChange}
            />
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

export default FindNewCustomers;
