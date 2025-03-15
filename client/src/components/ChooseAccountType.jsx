// src/components/ChooseAccountType.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import './ChooseAccountType.css';
import logo from '../assets/logo.jpg'; // adjust if needed

function ChooseAccountType() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('');

  // choose influencer or brand
  const handleSelect = (type) => {
    setSelectedType(type);
  };

  // on next, go to brand or influencer sign-up form
  const handleNext = () => {
    if (!selectedType) return;

    if (selectedType === 'influencer') {
      navigate('/signup/influencer');
    } else if (selectedType === 'brand') {
      navigate('/signup/brand');
    }
  };

  // container class changes color based on selection
  let containerClass = 'choose-type-container';
  if (selectedType === 'influencer') {
    containerClass += ' influencer-bg';
  }
  if (selectedType === 'brand') {
    containerClass += ' brand-bg';
  }

  return (
    <div className={containerClass}>
      {/* NavBar at the top */}
      <NavBar />

      <header className="choose-type-header">
        
      </header>

      <div className="choose-type-content">
        <h2>Are you a brand or influencer?</h2>
        <p className="choose-type-subtitle">
          Select one of the account types below to get started:
        </p>

        <div className="option-cards">
          {/* Brand card (now on the LEFT) */}
          <div
            className={`option-card brand-card ${
              selectedType === 'brand' ? 'selected' : ''
            }`}
            onClick={() => handleSelect('brand')}
          >
            <div className="option-icon">
              <img
                src="https://cdn-icons-png.flaticon.com/512/7474/7474835.png"
                alt="Brand icon"
              />
            </div>
            <div className="option-label">I want Influence</div>
            {selectedType === 'brand' && <div className="checkmark">✓</div>}
          </div>

          <span className="or-text">OR</span>

          {/* Influencer card (now on the RIGHT) */}
          <div
            className={`option-card influencer-card ${
              selectedType === 'influencer' ? 'selected' : ''
            }`}
            onClick={() => handleSelect('influencer')}
          >
            <div className="option-icon">
              <img
                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                alt="Influencer icon"
              />
            </div>
            <div className="option-label">I want to Influence</div>
            {selectedType === 'influencer' && <div className="checkmark">✓</div>}
          </div>
        </div>

        <button
          className="next-button"
          onClick={handleNext}
          disabled={!selectedType}
        >
          NEXT
        </button>
      </div>
    </div>
  );
}

export default ChooseAccountType;
