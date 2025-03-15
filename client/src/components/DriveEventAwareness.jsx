// src/components/DriveEventAwareness.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './DriveEventAwareness.css';
import AiChatbot from './AiChatbot.jsx';
import demoImage from '../assets/demo.png';

function DriveEventAwareness() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    businessDescription: '',
    industry: '',
    timeframe: { start: '', end: '' },
    platforms: '',
    eventDescription: '',
    uniqueFeatures: '',
  });

  // For UI states
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
        campaignType: 'driveEventAwareness',
        describeBusiness: formData.businessDescription,
        industry: formData.industry,
        timeframeStart: formData.timeframe.start,
        timeframeEnd: formData.timeframe.end,
        platforms: formData.platforms,
        eventName: formData.eventDescription,
        eventUniqueness: formData.uniqueFeatures,
      };

      // 2) Send request to /api/ai/generateCampaign
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:4000/api/ai/generateCampaign',
        payload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 3) Capture the new campaign _id
      const newCampaign = response.data.campaign;
      if (newCampaign && newCampaign._id) {
        localStorage.setItem('latestCampaignId', newCampaign._id);
      }

      // 4) Navigate to the loading page
      navigate('/loading');
    } catch (error) {
      console.error('Error creating DriveEventAwareness campaign:', error);
      setErrorMessage('Failed to create AI campaign plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="drive-event-awareness-container">
      <div className="form-section">
        <h2>Drive Event Awareness</h2>
        <p>
          Increase visibility and excitement for your event. Provide the details below to
          create a personalized multi-channel strategy.
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}

        {/* Show a small "Creating..." hint if needed */}
        {isCreating && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            Creating campaign, please wait...
          </p>
        )}

        <form className="drive-event-awareness-form" onSubmit={handleSubmit}>
          {/* Q1: Business Description */}
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

          {/* Q2: Industry */}
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

          {/* Q3: Timeframe */}
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

          {/* Q4: Platforms */}
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

          {/* Q5: Event Description */}
          <div className="form-group">
            <label>What is the event you want to promote?</label>
            <textarea
              name="eventDescription"
              rows="3"
              placeholder="Example: Conference, product launch, webinar..."
              value={formData.eventDescription}
              onChange={handleChange}
            />
          </div>

          {/* Q6: Unique Features */}
          <div className="form-group">
            <label>What makes this event unique or exciting?</label>
            <textarea
              name="uniqueFeatures"
              rows="3"
              placeholder="Example: Key speakers, special offers, exclusive access..."
              value={formData.uniqueFeatures}
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

export default DriveEventAwareness;
