import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import './BrandSignUpForm.css';

// API base URL
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

  // Form animation states
  const [activeSection, setActiveSection] = useState(0);
  const [formProgress, setFormProgress] = useState(0);
  const [isHovering, setIsHovering] = useState({});
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showGuidance, setShowGuidance] = useState(true);

  // Effects
  const [showWelcome, setShowWelcome] = useState(true);
  
  // Refs for scroll tracking
  const containerRef = useRef(null);
  const formRef = useRef(null);
  const sidebarRef = useRef(null);

  // Hide welcome message after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Handle scroll position for sticky elements
  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current) return;
      
      const navHeight = 72; // Approximate navbar height
      const container = containerRef.current;
      const containerRect = container?.getBoundingClientRect();
      const sidebarRect = sidebarRef.current?.getBoundingClientRect();
      const formRect = formRef.current?.getBoundingClientRect();
      
      if (containerRect && sidebarRect && formRect) {
        // When to make sidebar fixed
        if (containerRect.top < navHeight) {
          sidebarRef.current.style.position = 'fixed';
          sidebarRef.current.style.top = `${navHeight + 20}px`; // 20px extra spacing
          sidebarRef.current.style.width = `${sidebarRect.width}px`;
          
          // If we're scrolling past the form's bottom, make sidebar absolute at bottom
          if (formRect.bottom < window.innerHeight) {
            sidebarRef.current.style.position = 'absolute';
            sidebarRef.current.style.top = `${formRect.height - sidebarRect.height}px`;
          }
        } else {
          // Reset to original position when scrolled to top
          sidebarRef.current.style.position = 'relative';
          sidebarRef.current.style.top = '0';
          sidebarRef.current.style.width = '100%';
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initial positioning
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  // Show guidance for 6 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowGuidance(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

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

  // Update form progress when fields are filled
  useEffect(() => {
    // Calculate how complete the form is
    const requiredFields = ['firstName', 'lastName', 'email', 'password', 'businessName'];
    const filledRequired = requiredFields.filter(field => formData[field] !== '').length;
    const hasIndustries = selectedIndustries.length > 0;
    
    // Calculate percentage (required fields + industries selection)
    const totalRequired = requiredFields.length + 1; // +1 for industries
    const filledTotal = filledRequired + (hasIndustries ? 1 : 0);
    const newProgress = Math.floor((filledTotal / totalRequired) * 100);
    
    setFormProgress(newProgress);
  }, [formData, selectedIndustries]);

  // Form navigation animation
  const handleSectionFocus = (sectionIndex) => {
    setActiveSection(sectionIndex);
    setHasInteracted(true);
    setShowGuidance(false);
  };

  // Standard text input changes with animation
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Trigger micro-animation for the changed field
    setIsHovering(prev => ({ ...prev, [name]: true }));
    setTimeout(() => {
      setIsHovering(prev => ({ ...prev, [name]: false }));
    }, 300);
    
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
    
    // Trigger a success micro-animation
    setIsHovering(prev => ({ ...prev, industry: true }));
    setTimeout(() => {
      setIsHovering(prev => ({ ...prev, industry: false }));
    }, 500);
    
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
    
    // Trigger a success micro-animation
    setIsHovering(prev => ({ ...prev, platform: true }));
    setTimeout(() => {
      setIsHovering(prev => ({ ...prev, platform: false }));
    }, 500);
    
    setSelectedPlatforms(newPlatforms);
  };

  // Remove item from selected lists
  const removeIndustry = (item) => {
    setSelectedIndustries(selectedIndustries.filter(i => i !== item));
  };
  
  const removePlatform = (item) => {
    setSelectedPlatforms(selectedPlatforms.filter(p => p !== item));
  };

  // Submit form => call backend
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
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
      
      // Show success animation
      setSubmitSuccess(true);
      
      // Delay navigation to show success animation
      setTimeout(() => {
        // On success, navigate to sign in
        navigate('/signin');
      }, 2000);
      
    } catch (error) {
      console.error('Error signing up brand:', error);
      setErrorMessage(
        error.response?.data?.error || 'Brand signup failed. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="brand-container" ref={containerRef}>
      {/* NavBar at the top */}
      <NavBar />
      
      {/* Animated background with particle effect */}
      <div className="brand-background">
        <div className="particle-overlay">
          <div className="particle particle-1"></div>
          <div className="particle particle-2"></div>
          <div className="particle particle-3"></div>
          <div className="particle particle-4"></div>
          <div className="particle particle-5"></div>
        </div>
        <img 
          src="assets/InfluencerBack.png" 
          alt="Background" 
          className="brand-bg-image" 
        />
      </div>
      
      {/* Welcome overlay that fades away */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-content">
            <div className="welcome-icon"></div>
            <h1>Welcome to Brand Registration</h1>
            <p>Let's create your brand profile</p>
          </div>
        </div>
      )}
      
      {/* Main content wrapper with glass effect */}
      <div className="brand-content-wrapper">
        {/* Side decoration */}
        <div className="brand-sidebar-wrapper">
          <div className="brand-sidebar" ref={sidebarRef}>
            <div className="brand-logo-wrapper">
              <div className="brand-logo-container">
              
<div className="premium-logo-container">
  {/* Animated background elements */}
  <div className="logo-background">
    <div className="bg-particle particle-1"></div>
    <div className="bg-particle particle-2"></div>
    <div className="bg-particle particle-3"></div>
    <div className="bg-particle particle-4"></div>
    <div className="bg-particle particle-5"></div>
    <div className="bg-glow"></div>
  </div>

  {/* Main logo SVG */}
  <svg 
    className="premium-logo" 
    viewBox="0 0 240 140" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Definitions for effects */}
    <defs>
      <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="50%" stopColor="#f0f4ff" />
        <stop offset="100%" stopColor="#ffffff" />
      </linearGradient>
      
      <filter id="textGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <filter id="orangeGlow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="2.5" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#ff7043" />
        <stop offset="50%" stopColor="#ff9259" />
        <stop offset="100%" stopColor="#ff7043" />
      </linearGradient>
      
      <mask id="letterMask">
        <rect x="0" y="0" width="100%" height="100%" fill="white" />
      </mask>
    </defs>
    
    {/* Tech grid background */}
    <g className="logo-grid">
      {Array.from({ length: 8 }).map((_, i) => (
        <line key={`h-${i}`} x1="40" y1={40 + i * 10} x2="200" y2={40 + i * 10} stroke="#4f65f1" strokeWidth="0.3" opacity="0.3" />
      ))}
      {Array.from({ length: 16 }).map((_, i) => (
        <line key={`v-${i}`} x1={40 + i * 10} y1="40" x2={40 + i * 10} y2="110" stroke="#4f65f1" strokeWidth="0.3" opacity="0.3" />
      ))}
    </g>
    
    {/* Letter F */}
    <g className="logo-letter letter-f" filter="url(#textGlow)">
      <path 
        d="M70,55 L70,95 M70,55 L100,55 M70,75 L95,75" 
        stroke="url(#textGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none"
      />
    </g>
    
    {/* Letter Y */}
    <g className="logo-letter letter-y" filter="url(#textGlow)">
      <path 
        d="M115,55 L130,75 M145,55 L130,75 L130,95" 
        stroke="url(#textGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none"
      />
    </g>
    
    {/* Letter I (full letter, not just a dot) */}
    <g className="logo-letter letter-i" filter="url(#textGlow)">
      <path 
        d="M165,55 L165,95" 
        stroke="url(#textGradient)" 
        strokeWidth="8" 
        strokeLinecap="round" 
        fill="none"
      />
      <circle 
        cx="165" 
        cy="45" 
        r="7" 
        fill="url(#orangeGradient)" 
        filter="url(#orangeGlow)"
        className="i-dot"
      />
    </g>
    
    {/* Accent elements */}
    <g className="logo-accents">
      {/* Plus icon */}
      <path 
        className="logo-plus" 
        d="M50,45 L50,55 M45,50 L55,50" 
        stroke="url(#orangeGradient)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        filter="url(#orangeGlow)"
      />
      
      {/* Underline */}
      <path
        className="logo-underline"
        d="M60,108 L180,108"
        stroke="url(#orangeGradient)"
        strokeWidth="3"
        strokeLinecap="round"
        filter="url(#orangeGlow)"
      />
      
      {/* Decorative connector lines */}
      <path 
        className="connector-line line-1" 
        d="M70,95 Q117.5,110 165,95" 
        stroke="#4f65f1" 
        strokeWidth="1.5" 
        strokeDasharray="3,3" 
        fill="none"
      />
      
      <path 
        className="connector-line line-2" 
        d="M50,50 Q107.5,35 165,45" 
        stroke="#ff7043" 
        strokeWidth="1.5" 
        strokeDasharray="3,3" 
        fill="none"
      />
    </g>
    
    {/* Floating points of light */}
    <g className="floating-points">
      <circle className="point point-1" cx="80" cy="65" r="1.5" fill="#ffffff" />
      <circle className="point point-2" cx="150" cy="85" r="1.5" fill="#ffffff" />
      <circle className="point point-3" cx="120" cy="45" r="1.5" fill="#ffffff" />
      <circle className="point point-4" cx="95" cy="90" r="1.5" fill="#ffffff" />
      <circle className="point point-5" cx="135" cy="65" r="1.5" fill="#ffffff" />
    </g>
  </svg>
  
  {/* Logo text */}
  <div className="logo-text-wrapper">
    <span className="logo-text-lets">Let's</span>
    <span className="logo-text-fyi">FYI</span>
  </div>
</div>
              </div>
            </div>
            
            {/* Progress indicator */}
            <div className="brand-progress-container">
              <div className="progress-label">
                <span>Your progress</span>
                <span className="progress-percentage">{formProgress}%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill"
                  style={{ width: `${formProgress}%` }}
                ></div>
              </div>
              
              {formProgress === 100 && (
                <div className="progress-complete-message">
                  <div className="check-icon"></div>
                  <span>Ready to launch!</span>
                </div>
              )}
            </div>

            {/* Quick tips section */}
            <div className="brand-tips-container">
              <h4>
                <span className="tips-icon"></span>
                Tips
              </h4>
              <ul className="tips-list">
                <li>
                  <span className="tip-arrow">→</span>
                  Fill in all required fields marked with <span className="required-tip">*</span>
                </li>
                <li>
                  <span className="tip-arrow">→</span>
                  Select at least one industry for your brand
                </li>
                <li>
                  <span className="tip-arrow">→</span>
                  Be specific with your campaign goals
                </li>
              </ul>
            </div>
            
           
          </div>
        </div>
      
        {/* Form content with glass morphism */}
        <div className="brand-form-wrapper" ref={formRef}>
          <div className="brand-form-container">
            <h2 className="brand-title">
              <span className="title-gradient">Brand Registration</span>
              <span className="title-underline"></span>
            </h2>
            
            {errorMessage && (
              <div className="brand-error-message">
                <div className="error-icon"></div>
                <p>{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="brand-form">
              {/* Personal Information Section */}
              <div 
                className={`brand-section ${activeSection === 0 ? 'active-section' : ''}`}
                onClick={() => handleSectionFocus(0)}
              >
                <h3 className="section-title">
                  <span className="section-number">01</span>
                  <span>Personal Information</span>
                </h3>
                
                <div className="brand-row">
                  <div 
                    className="brand-form-group"
                    style={{
                      boxShadow: isHovering.firstName 
                        ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <label>
                      First Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      onFocus={() => handleSectionFocus(0)}
                      className="brand-input"
                    />
                    {isHovering.firstName && (
                      <div className="input-success-indicator"></div>
                    )}
                  </div>

                  <div 
                    className="brand-form-group"
                    style={{
                      boxShadow: isHovering.lastName 
                        ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                        : '0 4px 15px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <label>
                      Last Name <span className="required-star">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      onFocus={() => handleSectionFocus(0)}
                      className="brand-input"
                    />
                  </div>
                </div>

                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.email 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>
                    Email <span className="required-star">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    onFocus={() => handleSectionFocus(0)}
                    className="brand-input"
                  />
                </div>

                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.password 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>
                    Password <span className="required-star">*</span>
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => handleSectionFocus(0)}
                      className="brand-input"
                    />
                    <div className="password-strength-indicator">
                      <div className={`strength-bar ${formData.password.length > 0 ? 'weak' : ''}`}></div>
                      <div className={`strength-bar ${formData.password.length > 5 ? 'medium' : ''}`}></div>
                      <div className={`strength-bar ${formData.password.length > 8 ? 'strong' : ''}`}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information Section */}
              <div 
                className={`brand-section ${activeSection === 1 ? 'active-section' : ''}`}
                onClick={() => handleSectionFocus(1)}
              >
                <h3 className="section-title">
                  <span className="section-number">02</span>
                  <span>Business Details</span>
                </h3>
                
                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.businessName 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>
                    Business Name <span className="required-star">*</span>
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    required
                    value={formData.businessName}
                    onChange={handleChange}
                    onFocus={() => handleSectionFocus(1)}
                    className="brand-input"
                  />
                </div>

                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.brandWebsite 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>Brand Website</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">🌐</span>
                    <input
                      type="url"
                      name="brandWebsite"
                      placeholder="https://"
                      value={formData.brandWebsite}
                      onChange={handleChange}
                      onFocus={() => handleSectionFocus(1)}
                      className="brand-input with-icon"
                    />
                  </div>
                </div>

                {/* Industry multi-select with enhanced UI */}
                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.industry 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>
                    Industry <span className="required-star">*</span>
                  </label>
                  <div className="multi-select-container">
                    <select 
                      multiple 
                      onChange={handleIndustryChange} 
                      className="brand-select"
                      onFocus={() => handleSectionFocus(1)}
                    >
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
                      <span className="btn-icon">+</span>
                      <span>Add Industry</span>
                    </button>
                  </div>
                  
                  <div className="selected-items">
                    {selectedIndustries.map((item, idx) => (
                      <span 
                        key={idx} 
                        className="brand-tag"
                      >
                        {item}
                        <button 
                          type="button" 
                          className="tag-remove-btn"
                          onClick={() => removeIndustry(item)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Campaign Details Section */}
              <div 
                className={`brand-section ${activeSection === 2 ? 'active-section' : ''}`}
                onClick={() => handleSectionFocus(2)}
              >
                <h3 className="section-title">
                  <span className="section-number">03</span>
                  <span>Campaign Details</span>
                </h3>
                
                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.campaignGoals 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>Define Your Campaign Goals</label>
                  <textarea
                    name="campaignGoals"
                    rows="3"
                    value={formData.campaignGoals}
                    onChange={handleChange}
                    onFocus={() => handleSectionFocus(2)}
                    className="brand-textarea"
                    placeholder="What would you like to achieve with your campaign?"
                  ></textarea>
                </div>

                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.budgetRange 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>Budget Range (GBP)</label>
                  <div className="input-icon-wrapper">
                    <span className="input-icon">£</span>
                    <input
                      type="number"
                      name="budgetRange"
                      value={formData.budgetRange}
                      onChange={handleChange}
                      onFocus={() => handleSectionFocus(2)}
                      className="brand-input with-icon"
                      placeholder="Enter your campaign budget"
                    />
                  </div>
                  <div className="budget-slider-container">
                    <input 
                      type="range" 
                      min="100" 
                      max="50000" 
                      value={formData.budgetRange || 0} 
                      onChange={(e) => handleChange({
                        target: {
                          name: 'budgetRange',
                          value: e.target.value
                        }
                      })}
                      className="budget-slider"
                    />
                    <div className="range-labels">
                      <span>£100</span>
                      <span>£50,000+</span>
                    </div>
                  </div>
                </div>

                {/* Platforms multi-select with enhanced UI */}
                <div 
                  className="brand-form-group"
                  style={{
                    boxShadow: isHovering.platform 
                      ? '0 8px 25px rgba(79, 101, 241, 0.35)' 
                      : '0 4px 15px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <label>Platforms</label>
                  <div className="multi-select-container">
                    <select 
                      multiple 
                      onChange={handlePlatformChange} 
                      className="brand-select"
                      onFocus={() => handleSectionFocus(2)}
                    >
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
                      <span className="btn-icon">+</span>
                      <span>Add Platform</span>
                    </button>
                  </div>
                  
                  <div className="selected-items platform-items">
                    {selectedPlatforms.map((p, idx) => (
                      <span 
                        key={idx} 
                        className="brand-tag platform-tag"
                      >
                        {p}
                        <button 
                          type="button" 
                          className="tag-remove-btn"
                          onClick={() => removePlatform(p)}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Submit button with loading state */}
              <button 
                type="submit" 
                className={`brand-submit-btn ${isSubmitting ? 'submitting' : ''} ${submitSuccess ? 'success' : ''}`}
                disabled={isSubmitting || submitSuccess}
              >
                {isSubmitting ? (
                  <div className="submit-loading">
                    <div className="loading-spinner"></div>
                    <span>Creating your account...</span>
                  </div>
                ) : submitSuccess ? (
                  <div className="submit-success">
                    <div className="success-icon"></div>
                    <span>Account Created!</span>
                  </div>
                ) : (
                  <>
                    <span>Register Your Brand</span>
                    <div className="btn-shine"></div>
                  </>
                )}
              </button>
              
              {/* Animated guidance for first-time users */}
              {showGuidance && !hasInteracted && (
                <div className="form-guidance">
                  <div className="guidance-icon-container">
                    <div className="guidance-icon"></div>
                  </div>
                  <p>Click on each section to fill in your information</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BrandSignUpForm;