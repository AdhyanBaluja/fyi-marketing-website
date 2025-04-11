import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CampaignDetail.css';
import './campaign-detail-animations.css';
import demoImage from '../assets/demo.png';
import './campaign-detail-animations.jsx';

// Import Lottie player
import Lottie from 'react-lottie';

// Import the lottie animations
import campaignLottie from '../assets/animations/campaign-animation.json';
import targetAudienceLottie from '../assets/animations/target-audience.json';
import influencerLottie from '../assets/animations/influencer.json';
import progressLottie from '../assets/animations/progress.json';

// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const detailsRef = useRef(null);

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState(null);
  const [animatedItems, setAnimatedItems] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saveAnimation, setSaveAnimation] = useState(false);

  // Lottie animation options
  const defaultLottieOptions = {
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Create options for each Lottie animation
  const campaignLottieOptions = {
    ...defaultLottieOptions,
    animationData: campaignLottie
  };

  const targetAudienceLottieOptions = {
    ...defaultLottieOptions,
    animationData: targetAudienceLottie
  };

  const influencerLottieOptions = {
    ...defaultLottieOptions,
    animationData: influencerLottie
  };

  const progressLottieOptions = {
    ...defaultLottieOptions,
    animationData: progressLottie
  };

  // Handle section hover
  const handleSectionHover = (section) => {
    setActiveSection(section);
  };

  // Parallax effect for campaign header
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (!detailsRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setAnimatedItems(prev => [...prev, entry.target.dataset.item]);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const items = detailsRef.current.querySelectorAll('.animate-on-scroll');
    items.forEach(item => observer.observe(item));
    
    return () => {
      items.forEach(item => observer.unobserve(item));
    };
  }, [campaign]);

  // 1) Fetch the campaign document on mount with enhanced loading animation
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        // Start with an artificial delay for the loading animation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/campaigns/${campaignId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const c = response.data.campaign;
        setCampaign(c);

        // Prepare local state for editing: top-level fields + formInputs subdoc
        setEditData({
          campaignImage: c.campaignImage || '',
          name: c.name || '',
          objective: c.objective || '',
          targetAudience: c.targetAudience || '',
          duration: c.duration || '',
          budget: c.budget || '',
          influencerCollaboration: c.influencerCollaboration || '',
          aboutCampaign: c.aboutCampaign || '',
          progress: c.progress || 0,
          clicks: c.clicks || 0,
          conversions: c.conversions || 0,
          status: c.status || 'Draft',

          // subdoc: formInputs
          businessDescription: c.formInputs?.businessDescription || '',
          industry: c.formInputs?.industry || '',
          timeframeStart: c.formInputs?.timeframeStart || '',
          timeframeEnd: c.formInputs?.timeframeEnd || '',
          platforms: c.formInputs?.platforms || '',
          marketTrends: c.formInputs?.marketTrends || '',
          targetAudienceForm: c.formInputs?.targetAudience || '',
          brandUSP: c.formInputs?.brandUSP || '',
        });
      } catch (err) {
        console.error('Error fetching campaign detail:', err);
        setError('Failed to load campaign details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  // 2) Handle input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) Save updates (PATCH request)
  const handleSave = async () => {
    setSaveAnimation(true);
    try {
      const token = localStorage.getItem('token');

      const payload = {
        campaignImage: editData.campaignImage,
        name: editData.name,
        objective: editData.objective,
        targetAudience: editData.targetAudience,
        duration: editData.duration,
        budget: editData.budget,
        influencerCollaboration: editData.influencerCollaboration,
        aboutCampaign: editData.aboutCampaign,
        progress: editData.progress,
        clicks: editData.clicks,
        conversions: editData.conversions,
        status: editData.status,
        formInputs: {
          businessDescription: editData.businessDescription,
          industry: editData.industry,
          timeframeStart: editData.timeframeStart,
          timeframeEnd: editData.timeframeEnd,
          platforms: editData.platforms,
          marketTrends: editData.marketTrends,
          targetAudience: editData.targetAudienceForm,
          brandUSP: editData.brandUSP,
        },
      };

      // Add artificial delay for save animation to show
      await new Promise(resolve => setTimeout(resolve, 800));

      await axios.patch(
        `${API_BASE_URL}/api/campaigns/${campaignId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch updated document
      const refreshed = await axios.get(
        `${API_BASE_URL}/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCampaign(refreshed.data.campaign);
      setSaveAnimation(false);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving campaign edits:', err);
      setError('Failed to save changes.');
      setSaveAnimation(false);
    }
  };

  // Helper function to get status color
  const getStatusStyles = (status) => {
    switch(status) {
      case 'Active':
        return {
          className: 'status-active',
          icon: '●',
          pulsate: true
        };
      case 'Paused':
        return {
          className: 'status-paused',
          icon: '❙❙',
          pulsate: false
        };
      case 'Completed':
        return {
          className: 'status-completed',
          icon: '✓',
          pulsate: false
        };
      default: // Draft
        return {
          className: 'status-draft',
          icon: '◯',
          pulsate: false
        };
    }
  };

  // Enhanced loading state with animation
  if (loading) {
    return (
      <div className="cosmic-loading-container">
        <div className="cosmic-loading-orbit">
          <div className="cosmic-loading-planet"></div>
          <div className="cosmic-loading-satellite"></div>
        </div>
        <p className="cosmic-loading-text">Loading campaign details<span className="dot-1">.</span><span className="dot-2">.</span><span className="dot-3">.</span></p>
      </div>
    );
  }

  // Enhanced error state with interactive elements
  if (error) {
    return (
      <div className="cosmic-error-container">
        <div className="cosmic-error-icon">!</div>
        <h2 className="cosmic-error-message">{error}</h2>
        <button 
          className="cosmic-retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Enhanced not found state with stellar theme
  if (!campaign) {
    return (
      <div className="cosmic-notfound-container">
        <div className="cosmic-notfound-visual">
          <div className="cosmic-lost-planet"></div>
          <div className="cosmic-asteroids"></div>
        </div>
        <h2 className="cosmic-notfound-message">Campaign not found</h2>
        <p className="cosmic-notfound-subtitle">This campaign may have been removed or never existed</p>
        <button 
          className="cosmic-return-button"
          onClick={() => navigate('/your-campaigns')}
        >
          Return to Your Campaigns
        </button>
      </div>
    );
  }

  // Display campaign image or fallback to demo image
  const displayedImage = campaign.campaignImage || demoImage;
  const statusInfo = getStatusStyles(campaign.status || 'Draft');

  return (
    <div 
      className="campaign-detail-container cosmic-theme" 
      ref={detailsRef}
    >
      {/* Animated Background Elements */}
      <div className="cosmic-stars-container">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i}
            className="cosmic-star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 7}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="cosmic-nebula-container">
        <div className="cosmic-nebula cosmic-nebula-1"></div>
        <div className="cosmic-nebula cosmic-nebula-2"></div>
        <div className="cosmic-nebula cosmic-nebula-3"></div>
      </div>

      {/* Enhanced Success Save Animation */}
      {saveAnimation && (
        <div className="cosmic-save-animation">
          <div className="cosmic-save-circle"></div>
          <div className="cosmic-save-checkmark">✓</div>
        </div>
      )}

      {/* Enhanced Campaign Header with Parallax Effect */}
      <div 
        className="campaign-header cosmic-campaign-header"
        style={{
          transform: `translateY(${scrollPosition * 0.3}px)`
        }}
      >
        <div className="cosmic-image-wrapper">
          <div className="cosmic-image-glow"></div>
          <div className="cosmic-image-container">
            <img
              className="cosmic-campaign-image"
              src={displayedImage}
              alt="Campaign Visual"
            />
            <div className="cosmic-image-reflection"></div>
          </div>
        </div>
        
        <div className="cosmic-campaign-intro">
          <div className="cosmic-status-indicator">
            <span className={`cosmic-status-dot ${statusInfo.className}`}>
              {statusInfo.icon}
            </span>
            {campaign.status || 'Draft'}
          </div>
          
          <h1 className="cosmic-campaign-title">
            {campaign.name || 'Untitled Campaign'}
            <div className="cosmic-title-underline"></div>
          </h1>
          
          <p className="cosmic-campaign-subtitle">
            {campaign.objective || 'No objective provided yet.'}
          </p>
        </div>
      </div>

      {isEditing ? (
        /* ================== EDIT MODE ================== */
        <div className="cosmic-campaign-edit-form">
          <div className="cosmic-edit-header">
            <h2 className="cosmic-edit-title">Edit Campaign</h2>
            <div className="cosmic-edit-note">Make changes to your campaign details</div>
          </div>
          
          <div className="cosmic-form-section">
            <div className="cosmic-form-section-title">Campaign Basics</div>
            
            {/* Campaign Image field */}
            <div className="cosmic-input-group">
              <label className="cosmic-label">Campaign Image (URL)</label>
              <input
                className="cosmic-input"
                type="text"
                name="campaignImage"
                value={editData.campaignImage}
                onChange={handleChange}
              />
            </div>
            
            {/* Basic fields */}
            <div className="cosmic-input-group">
              <label className="cosmic-label">Name</label>
              <input
                className="cosmic-input"
                type="text"
                name="name"
                value={editData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Objective</label>
              <input
                className="cosmic-input"
                type="text"
                name="objective"
                value={editData.objective}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Target Audience</label>
              <input
                className="cosmic-input"
                type="text"
                name="targetAudience"
                value={editData.targetAudience}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-two-column">
              <div className="cosmic-input-group">
                <label className="cosmic-label">Duration</label>
                <input
                  className="cosmic-input"
                  type="text"
                  name="duration"
                  value={editData.duration}
                  onChange={handleChange}
                />
              </div>
              
              <div className="cosmic-input-group">
                <label className="cosmic-label">Budget</label>
                <input
                  className="cosmic-input"
                  type="text"
                  name="budget"
                  value={editData.budget}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Influencer Collaboration</label>
              <input
                className="cosmic-input"
                type="text"
                name="influencerCollaboration"
                value={editData.influencerCollaboration}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">About Campaign</label>
              <textarea
                className="cosmic-textarea"
                name="aboutCampaign"
                rows="2"
                value={editData.aboutCampaign}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="cosmic-form-section">
            <div className="cosmic-form-section-title">Campaign Metrics</div>
            
            <div className="cosmic-three-column">
              <div className="cosmic-input-group">
                <label className="cosmic-label">Progress (%)</label>
                <input
                  className="cosmic-input"
                  type="number"
                  name="progress"
                  value={editData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                />
                <div className="cosmic-progress-visualizer" style={{width: `${editData.progress}%`}}></div>
              </div>
              
              <div className="cosmic-input-group">
                <label className="cosmic-label">Clicks</label>
                <input
                  className="cosmic-input"
                  type="number"
                  name="clicks"
                  value={editData.clicks}
                  onChange={handleChange}
                  min="0"
                />
              </div>
              
              <div className="cosmic-input-group">
                <label className="cosmic-label">Conversions</label>
                <input
                  className="cosmic-input"
                  type="number"
                  name="conversions"
                  value={editData.conversions}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Status</label>
              <select 
                className="cosmic-select" 
                name="status" 
                value={editData.status} 
                onChange={handleChange}
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Paused">Paused</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Original form fields (subdoc) */}
          <div className="cosmic-form-section">
            <div className="cosmic-form-section-title">Original Form Inputs</div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Business Description</label>
              <textarea
                className="cosmic-textarea"
                name="businessDescription"
                rows="2"
                value={editData.businessDescription}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Industry</label>
              <input
                className="cosmic-input"
                type="text"
                name="industry"
                value={editData.industry}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-two-column">
              <div className="cosmic-input-group">
                <label className="cosmic-label">Timeframe Start</label>
                <input
                  className="cosmic-input"
                  type="text"
                  name="timeframeStart"
                  value={editData.timeframeStart}
                  onChange={handleChange}
                />
              </div>
              
              <div className="cosmic-input-group">
                <label className="cosmic-label">Timeframe End</label>
                <input
                  className="cosmic-input"
                  type="text"
                  name="timeframeEnd"
                  value={editData.timeframeEnd}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Platforms</label>
              <textarea
                className="cosmic-textarea"
                name="platforms"
                rows="2"
                value={editData.platforms}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Market Trends</label>
              <textarea
                className="cosmic-textarea"
                name="marketTrends"
                rows="2"
                value={editData.marketTrends}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Target Audience (Form)</label>
              <textarea
                className="cosmic-textarea"
                name="targetAudienceForm"
                rows="2"
                value={editData.targetAudienceForm}
                onChange={handleChange}
              />
            </div>
            
            <div className="cosmic-input-group">
              <label className="cosmic-label">Brand USP</label>
              <textarea
                className="cosmic-textarea"
                name="brandUSP"
                rows="2"
                value={editData.brandUSP}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Save / Cancel */}
          <div className="cosmic-edit-actions">
            <button 
              className="cosmic-save-button"
              onClick={handleSave}
              disabled={saveAnimation}
            >
              {saveAnimation ? (
                <>
                  <span className="cosmic-save-spinner"></span>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
            
            <button 
              className="cosmic-cancel-button"
              onClick={() => setIsEditing(false)}
              disabled={saveAnimation}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ================== VIEW MODE ================== */
        <>
          {/* Campaign Dashboard Summary */}
          <div className="cosmic-dashboard-summary animate-on-scroll" data-item="dashboard">
            <div className="cosmic-summary-stat">
              <div className="cosmic-summary-value">{campaign.progress || 0}%</div>
              <div className="cosmic-summary-label">Progress</div>
              <div className="cosmic-progress-bar">
                <div 
                  className="cosmic-progress-fill" 
                  style={{width: `${campaign.progress || 0}%`}}
                ></div>
              </div>
              <div className="cosmic-lottie-container">
                <Lottie options={progressLottieOptions} height={40} width={40} />
              </div>
            </div>
            
            <div className="cosmic-summary-stat">
              <div className="cosmic-summary-value">{campaign.clicks || 0}</div>
              <div className="cosmic-summary-label">Clicks</div>
              <div className="cosmic-stat-icon cosmic-clicks-icon"></div>
              <div className="cosmic-lottie-container">
                <Lottie options={campaignLottieOptions} height={40} width={40} />
              </div>
            </div>
            
            <div className="cosmic-summary-stat">
              <div className="cosmic-summary-value">{campaign.conversions || 0}</div>
              <div className="cosmic-summary-label">Conversions</div>
              <div className="cosmic-stat-icon cosmic-conversions-icon"></div>
            </div>
            
            <div className="cosmic-summary-stat">
              <div className="cosmic-summary-value cosmic-budget-value">{campaign.budget || '$0'}</div>
              <div className="cosmic-summary-label">Budget</div>
              <div className="cosmic-stat-icon cosmic-budget-icon"></div>
            </div>
          </div>

          {/* Campaign Details Section */}
          <div 
            className="cosmic-campaign-detail-box animate-on-scroll" 
            data-item="details"
            onMouseEnter={() => handleSectionHover('details')}
            onMouseLeave={() => handleSectionHover(null)}
          >
            <h2 className="cosmic-detail-title">
              Campaign Details
              <div className="cosmic-title-accent"></div>
            </h2>
            
            <div className="cosmic-detail-grid">
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible' : ''}`}>
                <h3>Name</h3>
                <p>{campaign.name || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-1' : ''}`}>
                <h3>Objective</h3>
                <p>{campaign.objective || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-2' : ''}`}>
                <h3>Target Audience</h3>
                <p>{campaign.targetAudience || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
                <div className="cosmic-lottie-container">
                  <Lottie options={targetAudienceLottieOptions} height={40} width={40} />
                </div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-3' : ''}`}>
                <h3>Duration</h3>
                <p>{campaign.duration || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-4' : ''}`}>
                <h3>Budget</h3>
                <p>{campaign.budget || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-5' : ''}`}>
                <h3>Influencer Collaboration</h3>
                <p>{campaign.influencerCollaboration || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
                <div className="cosmic-lottie-container">
                  <Lottie options={influencerLottieOptions} height={40} width={40} />
                </div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-6' : ''}`}>
                <h3>About Campaign</h3>
                <p>{campaign.aboutCampaign || 'N/A'}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-7' : ''}`}>
                <h3>Progress</h3>
                <div className="cosmic-progress-container">
                  <div className="cosmic-progress-indicator">
                    <div 
                      className="cosmic-progress-bar-detail" 
                      style={{width: `${campaign.progress || 0}%`}}
                    >
                      <span className="cosmic-progress-text">{campaign.progress || 0}%</span>
                    </div>
                  </div>
                </div>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-8' : ''}`}>
                <h3>Clicks</h3>
                <p>{campaign.clicks || 0}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-9' : ''}`}>
                <h3>Conversions</h3>
                <p>{campaign.conversions || 0}</p>
                <div className="cosmic-detail-glow"></div>
              </div>
              
              <div className={`cosmic-detail-item ${animatedItems.includes('details') ? 'cosmic-item-visible cosmic-item-delay-10' : ''}`}>
                <h3>Status</h3>
                <p className={`cosmic-status ${statusInfo.className}`}>
                  <span className="cosmic-status-indicator-small">{statusInfo.icon}</span>
                  {campaign.status || 'Draft'}
                </p>
                <div className="cosmic-detail-glow"></div>
              </div>
            </div>
          </div>

          {/* Original Form Inputs */}
          {campaign.formInputs && (
            <div 
              className="cosmic-campaign-detail-box cosmic-form-inputs animate-on-scroll" 
              data-item="formInputs"
              onMouseEnter={() => handleSectionHover('formInputs')}
              onMouseLeave={() => handleSectionHover(null)}
            >
              <h2 className="cosmic-detail-title">
                Original Form Inputs
                <div className="cosmic-title-accent cosmic-accent-alt"></div>
              </h2>
              
              <div className="cosmic-form-inputs-grid">
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-business"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Business Description</h3>
                    <p>{campaign.formInputs.businessDescription || 'N/A'}</p>
                  </div>
                </div>
                
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible cosmic-item-delay-1' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-industry"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Industry</h3>
                    <p>{campaign.formInputs.industry || 'N/A'}</p>
                  </div>
                </div>
                
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible cosmic-item-delay-2' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-timeframe"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Timeframe</h3>
                    <p>
                      {campaign.formInputs.timeframeStart ? (
                        <>
                          {campaign.formInputs.timeframeStart} 
                          {campaign.formInputs.timeframeEnd ? ` to ${campaign.formInputs.timeframeEnd}` : ''}
                        </>
                      ) : 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible cosmic-item-delay-3' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-platforms"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Platforms</h3>
                    <p>{campaign.formInputs.platforms || 'N/A'}</p>
                  </div>
                </div>
                
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible cosmic-item-delay-4' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-trends"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Market Trends</h3>
                    <p>{campaign.formInputs.marketTrends || 'N/A'}</p>
                  </div>
                </div>
                
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible cosmic-item-delay-5' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-audience"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Target Audience (Form)</h3>
                    <p>{campaign.formInputs.targetAudience || 'N/A'}</p>
                  </div>
                </div>
                
                <div className={`cosmic-form-input-item ${animatedItems.includes('formInputs') ? 'cosmic-item-visible cosmic-item-delay-6' : ''}`}>
                  <div className="cosmic-form-input-icon cosmic-icon-usp"></div>
                  <div className="cosmic-form-input-content">
                    <h3>Brand USP</h3>
                    <p>{campaign.formInputs.brandUSP || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* About Campaign Section with animated reveal */}
          <div 
            className="cosmic-campaign-description animate-on-scroll" 
            data-item="description"
          >
            <h2 className="cosmic-description-title">
              About the Campaign
              <div className="cosmic-title-accent cosmic-accent-green"></div>
            </h2>
            
            <div className={`cosmic-description-wrapper ${animatedItems.includes('description') ? 'cosmic-description-visible' : ''}`}>
              <p className="cosmic-description-text">
                {campaign.aboutCampaign || 'No further description provided.'}
              </p>
              
              <div className="cosmic-description-decoration">
                <div className="cosmic-decoration-item d1"></div>
                <div className="cosmic-decoration-item d2"></div>
                <div className="cosmic-decoration-item d3"></div>
              </div>
            </div>
          </div>

          {/* Calendar Events with dynamic cards */}
          {campaign.calendarEvents && campaign.calendarEvents.length > 0 && (
            <div 
              className="cosmic-calendar-events animate-on-scroll" 
              data-item="calendarEvents"
            >
              <h2 className="cosmic-calendar-title">
                Calendar Events
                <div className="cosmic-title-accent cosmic-accent-blue"></div>
              </h2>
              
              <div className="cosmic-events-wrapper">
                {campaign.calendarEvents.map((ev, idx) => {
                  let platformsString = '';
                  if (ev.platforms) {
                    if (Array.isArray(ev.platforms)) {
                      platformsString = ev.platforms.join(', ');
                    } else {
                      platformsString = String(ev.platforms);
                    }
                  }
                  let kpisString = '';
                  if (ev.kpis) {
                    if (Array.isArray(ev.kpis)) {
                      kpisString = ev.kpis.join(', ');
                    } else {
                      kpisString = String(ev.kpis);
                    }
                  }
                  
                  return (
                    <div 
                      key={idx} 
                      className={`cosmic-event-card ${animatedItems.includes('calendarEvents') ? `cosmic-item-visible cosmic-item-delay-${idx}` : ''}`}
                    >
                      <div className="cosmic-event-date">
                        <div className="cosmic-date-indicator"></div>
                        {ev.date || 'N/A'}
                      </div>
                      
                      <div className="cosmic-event-content">
                        <h3 className="cosmic-event-title">{ev.event || 'No details'}</h3>
                        
                        {ev.platforms && (
                          <div className="cosmic-event-detail">
                            <span className="cosmic-detail-label">Platforms:</span> 
                            <span className="cosmic-detail-value">{platformsString}</span>
                          </div>
                        )}
                        
                        {ev.cta && (
                          <div className="cosmic-event-detail">
                            <span className="cosmic-detail-label">CTA:</span> 
                            <span className="cosmic-detail-value">{ev.cta}</span>
                          </div>
                        )}
                        
                        {ev.captions && (
                          <div className="cosmic-event-detail">
                            <span className="cosmic-detail-label">Captions:</span> 
                            <span className="cosmic-detail-value">{ev.captions}</span>
                          </div>
                        )}
                        
                        {ev.kpis && (
                          <div className="cosmic-event-detail">
                            <span className="cosmic-detail-label">KPIs:</span> 
                            <span className="cosmic-detail-value">{kpisString}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="cosmic-event-indicator"></div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bingo Suggestions with hover effects */}
          {campaign.bingoSuggestions && campaign.bingoSuggestions.length > 0 && (
            <div 
              className="cosmic-campaign-suggestions animate-on-scroll" 
              data-item="suggestions"
            >
              <h2 className="cosmic-suggestions-title">
                Campaign Suggestions
                <div className="cosmic-title-accent cosmic-accent-purple"></div>
              </h2>
              
              <div className="cosmic-suggestions-grid">
                {campaign.bingoSuggestions.map((item, idx) => {
                  const suggestionVal =
                    typeof item.suggestion === 'object'
                      ? JSON.stringify(item.suggestion)
                      : item.suggestion || 'No suggestion';
                  const strategyVal =
                    typeof item.strategy === 'object'
                      ? JSON.stringify(item.strategy)
                      : item.strategy || 'No strategy';
                  
                  return (
                    <div 
                      key={idx} 
                      className={`cosmic-suggestion-card ${animatedItems.includes('suggestions') ? `cosmic-item-visible cosmic-item-delay-${idx % 4}` : ''}`}
                    >
                      <div className="cosmic-suggestion-bulb">
                        <div className="cosmic-bulb-glow"></div>
                      </div>
                      
                      <div className="cosmic-suggestion-content">
                        <h3 className="cosmic-suggestion-idea">{suggestionVal}</h3>
                        <p className="cosmic-suggestion-strategy">{strategyVal}</p>
                        
                        {item.imageUrl && (
                          <div className="cosmic-suggestion-image-container">
                            <img
                              src={item.imageUrl}
                              alt="Suggestion Visual"
                              className="cosmic-suggestion-image"
                            />
                            <div className="cosmic-image-glow-effect"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* More Advice with advanced card effects */}
          {campaign.moreAdvice && campaign.moreAdvice.length > 0 && (
            <div 
              className="cosmic-advice-section animate-on-scroll" 
              data-item="advice"
            >
              <h2 className="cosmic-advice-title">
                Additional Advice
                <div className="cosmic-title-accent cosmic-accent-orange"></div>
              </h2>
              
              <div className="cosmic-advice-container">
                {campaign.moreAdvice.map((advice, idx) => {
                  // Handle JSON object advice
                  if (typeof advice === 'object') {
                    // Parse influencer recommendations
                    if (advice.type === "Influencer Recommendation") {
                      return (
                        <div 
                          key={idx} 
                          className={`cosmic-influencer-recommendation ${idx === 0 ? 'cosmic-new-recommendation' : ''} ${animatedItems.includes('advice') ? `cosmic-item-visible cosmic-item-delay-${idx % 3}` : ''}`}
                        >
                          <div className="cosmic-recommendation-header">
                            <span className="cosmic-icon-star">★</span>
                            <h3>{advice.title || "Connect with influencer"}</h3>
                          </div>
                          
                          <div className="cosmic-recommendation-body">
                            <p>{advice.description || "Consider collaborating for your campaign."}</p>
                          </div>
                          
                          <div className="cosmic-influencer-profile">
                            <div className="cosmic-influencer-avatar">
                              {advice.title?.split(' ')?.pop()?.charAt(0) || "I"}
                              <div className="cosmic-avatar-glow"></div>
                            </div>
                            
                            <div className="cosmic-influencer-details">
                              <div className="cosmic-influencer-handle">
                                <span className="cosmic-platform-icon">
                                  {advice.description?.includes('Instagram') ? '📱' : 
                                  advice.description?.includes('YouTube') ? '📺' : '🌐'}
                                </span>
                                {advice.description?.match(/@[\w]+/) || "Influencer"}
                              </div>
                              
                              <div className="cosmic-influencer-metrics">
                                <div className="cosmic-metric">
                                  <span className="cosmic-metric-value">
                                    {advice.description?.match(/(\d+(\.\d+)?(K|M)?)/) || ""}
                                  </span>
                                  <span className="cosmic-metric-label">followers</span>
                                </div>
                                
                                <div className="cosmic-metric">
                                  <span className="cosmic-metric-value">~1%</span>
                                  <span className="cosmic-metric-label">engagement</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="cosmic-recommendation-actions">
                            <button className="cosmic-connect-button">Connect</button>
                            <button className="cosmic-learn-button">Learn More</button>
                          </div>
                        </div>
                      );
                    }
                    
                    // Generic object display
                    return (
                      <div 
                        key={idx} 
                        className={`cosmic-generic-recommendation ${animatedItems.includes('advice') ? `cosmic-item-visible cosmic-item-delay-${idx % 3}` : ''}`}
                      >
                        <div className="cosmic-recommendation-header">
                          <span className="cosmic-icon-tip">💡</span>
                          <h3>Advice</h3>
                        </div>
                        
                        <div className="cosmic-recommendation-body">
                          <p>{JSON.stringify(advice)}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Simple text advice
                  return (
                    <div 
                      key={idx}
                      className={`cosmic-tip-recommendation ${animatedItems.includes('advice') ? `cosmic-item-visible cosmic-item-delay-${idx % 3}` : ''}`}
                    >
                      <div className="cosmic-recommendation-header">
                        <span className="cosmic-icon-tip">💡</span>
                        <h3>Tip</h3>
                      </div>
                      
                      <div className="cosmic-recommendation-body">
                        <p>{advice}</p>
                      </div>
                      
                      <div className="cosmic-tip-decoration"></div>
                    </div>
                  );
                })}
                
                {campaign.moreAdvice.length === 0 && (
                  <div className="cosmic-no-recommendations">
                    <div className="cosmic-no-recommendations-icon">📋</div>
                    <div className="cosmic-no-recommendations-text">No advice available yet</div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Joined Influencers Section with advanced interactions */}
          <div 
            className="cosmic-influencers-section animate-on-scroll" 
            data-item="influencers"
          >
            <h2 className="cosmic-influencers-title">
              Joined Influencers
              <div className="cosmic-title-accent cosmic-accent-yellow"></div>
            </h2>
            
            {campaign.joinedInfluencers && campaign.joinedInfluencers.length > 0 ? (
              <div className="cosmic-influencers-list">
                {campaign.joinedInfluencers.map((inf, index) => (
                  <div 
                    key={inf._id} 
                    className={`cosmic-influencer-card ${animatedItems.includes('influencers') ? `cosmic-item-visible cosmic-item-delay-${index % 4}` : ''}`}
                  >
                    <div className="cosmic-influencer-header">
                      <div className="cosmic-influencer-profile-image">
                        <img
                          src={inf.profileImage || 'https://via.placeholder.com/40'}
                          alt="Influencer"
                          className="cosmic-profile-img"
                        />
                        <div className="cosmic-profile-glow"></div>
                      </div>
                      
                      <div className="cosmic-influencer-info">
                        <h3 className="cosmic-influencer-name">{inf.name}</h3>
                        <div className="cosmic-influencer-progress-container">
                          <div className="cosmic-influencer-progress-text">{inf.progress}% complete</div>
                          <div className="cosmic-influencer-progress-bar">
                            <div 
                              className="cosmic-influencer-progress-fill"
                              style={{width: `${inf.progress}%`}}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {inf.tasks && inf.tasks.length > 0 ? (
                      <div className="cosmic-influencer-tasks">
                        <h4 className="cosmic-tasks-title">Tasks</h4>
                        <ul className="cosmic-tasks-list">
                          {inf.tasks.map((task) => (
                            <li 
                              key={task._id} 
                              className={`cosmic-task-item ${task.completed ? 'cosmic-task-completed' : ''}`}
                            >
                              <div className="cosmic-task-checkbox">
                                {task.completed ? '✓' : ''}
                              </div>
                              <div className="cosmic-task-text">{task.text}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="cosmic-no-tasks">
                        <p>No tasks assigned yet</p>
                      </div>
                    )}
                    
                    <div className="cosmic-influencer-actions">
                      <button className="cosmic-message-button">Message</button>
                      <button className="cosmic-assign-button">Assign Task</button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="cosmic-empty-influencers">
                <div className="cosmic-empty-animation">
                  <div className="cosmic-empty-planet"></div>
                  <div className="cosmic-empty-satellite"></div>
                </div>
                <p className="cosmic-empty-message">No joined influencers yet</p>
                <button 
                  className="cosmic-find-influencers-button"
                  onClick={() => navigate('/find-influencer')}
                >
                  Find Influencers
                </button>
              </div>
            )}
          </div>

          {/* Campaign Tasks with interactive elements */}
          {campaign.tasks && campaign.tasks.length > 0 && (
            <div 
              className="cosmic-tasks-section animate-on-scroll" 
              data-item="tasks"
            >
              <h2 className="cosmic-tasks-section-title">
                To-Do List
                <div className="cosmic-title-accent cosmic-accent-pink"></div>
              </h2>
              
              <div className="cosmic-tasks-container">
                {campaign.tasks.map((task, idx) => (
                  <div 
                    key={idx} 
                    className={`cosmic-task-card ${task.completed ? 'cosmic-task-card-completed' : ''} ${animatedItems.includes('tasks') ? `cosmic-item-visible cosmic-item-delay-${idx % 5}` : ''}`}
                  >
                    <div className="cosmic-task-status">
                      <div className="cosmic-task-checkbox-large">
                        {task.completed ? '✓' : ''}
                      </div>
                    </div>
                    
                    <div className="cosmic-task-content">
                      <p className="cosmic-task-text-large">{task.text}</p>
                      {task.completed && <div className="cosmic-task-completed-badge">Done</div>}
                    </div>
                    
                    <div className="cosmic-task-glow"></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons with hover animations */}
          <div className="cosmic-action-buttons animate-on-scroll" data-item="buttons">
            <button 
              className={`cosmic-edit-button ${animatedItems.includes('buttons') ? 'cosmic-item-visible' : ''}`}
              onClick={() => setIsEditing(true)}
            >
              <div className="cosmic-button-icon cosmic-edit-icon"></div>
              <span className="cosmic-button-text">Edit Campaign</span>
              <div className="cosmic-button-glow"></div>
            </button>
            
            <button 
              className={`cosmic-find-button ${animatedItems.includes('buttons') ? 'cosmic-item-visible cosmic-item-delay-1' : ''}`}
              onClick={() => navigate('/find-influencer')}
            >
              <div className="cosmic-button-icon cosmic-find-icon"></div>
              <span className="cosmic-button-text">Find Influencers</span>
              <div className="cosmic-button-glow"></div>
            </button>
          </div>
        </>
      )}
      
      {/* Quick Access Floating Action Button */}
      <div className="cosmic-quick-actions">
        <div className="cosmic-quick-action-button">
          <span className="cosmic-quick-icon">+</span>
          
          <div className="cosmic-quick-menu">
            <div 
              className="cosmic-menu-item"
              onClick={() => navigate('/your-campaigns')}
            >
              <span className="cosmic-menu-icon">🏠</span>
              <span className="cosmic-menu-tooltip">Campaigns</span>
            </div>
            
            <div 
              className="cosmic-menu-item"
              onClick={() => setIsEditing(true)}
            >
              <span className="cosmic-menu-icon">✏️</span>
              <span className="cosmic-menu-tooltip">Edit</span>
            </div>
            
            <div 
              className="cosmic-menu-item"
              onClick={() => navigate('/find-influencer')}
            >
              <span className="cosmic-menu-icon">👥</span>
              <span className="cosmic-menu-tooltip">Find</span>
            </div>
            
            <div 
              className="cosmic-menu-item"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="cosmic-menu-icon">⬆️</span>
              <span className="cosmic-menu-tooltip">Top</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;