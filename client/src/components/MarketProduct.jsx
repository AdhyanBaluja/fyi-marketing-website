// src/components/MarketProduct.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './MarketProduct.css';
import AiChatbot from './AiChatbot.jsx';
import demoImage from '../assets/demo.png';

function MarketProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessDescription: '',
    industry: '',
    timeframe: { start: '', end: '' },
    platforms: '',
    productDescription: '',
    productFeatures: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsCreating(true);

    try {
      const payload = {
        campaignType: 'marketProduct',
        describeBusiness: formData.businessDescription,
        industry: formData.industry,
        timeframeStart: formData.timeframe.start,
        timeframeEnd: formData.timeframe.end,
        platforms: formData.platforms,
        product: formData.productDescription,
        productFeatures: formData.productFeatures,
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
      console.error('Error creating MarketProduct campaign:', error);
      setErrorMessage('Failed to create AI campaign plan. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="market-product-container">
      <div className="form-section">
        <h2>Market a Product</h2>
        <p>
          Showcase your product to attract more customers and increase sales.
          Provide the details below to create a personalized multi-channel
          strategy.
        </p>

        {errorMessage && <p className="error-message">{errorMessage}</p>}
        {isCreating && (
          <p style={{ fontStyle: 'italic', color: '#666' }}>
            Creating campaign, please wait...
          </p>
        )}

        <form className="market-product-form" onSubmit={handleSubmit}>
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

          <div className="form-group">
            <label>What is the product you want to market?</label>
            <textarea
              name="productDescription"
              rows="3"
              placeholder="Describe the product, its features, and purpose..."
              value={formData.productDescription}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>What are the key features and benefits of the product?</label>
            <textarea
              name="productFeatures"
              rows="3"
              placeholder="Unique aspects of the product to highlight in the campaign..."
              value={formData.productFeatures}
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

export default MarketProduct;
