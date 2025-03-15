// src/components/Amplify.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Amplify.css';
import AiChatbot from './AiChatbot.jsx';
import demoImage from '../assets/demo.png';

function Amplify() {
  const navigate = useNavigate();

  // Basic form fields
  const [formData, setFormData] = useState({
    businessDescription: '',
    industry: '',
    timeframe: { start: '', end: '' },
    platforms: '',
    marketTrends: '',
    targetAudience: '',
    brandMessage: '',
  });

  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1) Handle input changes
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

  // 2) Submit form -> create campaign -> store ID -> navigate to /loading
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsCreating(true);

    try {
      const payload = {
        campaignType: 'amplify',
        businessDescription: formData.businessDescription,
        industry: formData.industry,
        timeframeStart: formData.timeframe.start,
        timeframeEnd: formData.timeframe.end,
        platforms: formData.platforms,
        marketTrends: formData.marketTrends,
        targetAudience: formData.targetAudience,
        brandMessage: formData.brandMessage,
      };

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/ai/generateCampaign',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newCampaign = response.data.campaign;
      if (newCampaign && newCampaign._id) {
        // Store the new ID in localStorage
        localStorage.setItem('latestCampaignId', newCampaign._id);

        // Then navigate to /loading
        navigate('/loading');
      } else {
        setErrorMessage('Campaign created, but no _id returned.');
      }
    } catch (err) {
      console.error('Error creating amplify campaign:', err);
      setErrorMessage('Failed to create AI campaign. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="amplify-container">
      <div className="form-section">
        <h2>Amplify Your Brand Awareness</h2>
        <p>
          Provide details about your campaign to create a personalized
          multi-channel strategy.
        </p>

        {errorMessage && <p className="error-msg">{errorMessage}</p>}
        {isCreating && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            Creating campaign, please wait...
          </p>
        )}

        <form className="amplify-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Describe your business</label>
            <textarea
              name="businessDescription"
              rows="3"
              placeholder="Enter a brief description..."
              value={formData.businessDescription}
              onChange={handleChange}
            />
          </div>

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

          <div className="form-group timeframe">
            <label>Campaign timeframe?</label>
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

          <div className="form-group">
            <label>Platforms to promote on?</label>
            <textarea
              name="platforms"
              rows="2"
              placeholder="e.g. Instagram, TikTok..."
              value={formData.platforms}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Any market trends or events?</label>
            <textarea
              name="marketTrends"
              rows="2"
              placeholder="Mention seasonal trends or events..."
              value={formData.marketTrends}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Your target audience?</label>
            <textarea
              name="targetAudience"
              rows="2"
              placeholder="Age group, interests, etc."
              value={formData.targetAudience}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Key brand message or USP?</label>
            <textarea
              name="brandMessage"
              rows="2"
              placeholder="Unique selling points or brand identity..."
              value={formData.brandMessage}
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

export default Amplify;
