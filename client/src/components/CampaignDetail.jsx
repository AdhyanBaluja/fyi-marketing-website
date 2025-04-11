import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CampaignDetail.css';
import demoImage from '../assets/demo.png';
import lottie from 'lottie-web';

// Importing animation JSON files
import brandingAnimation from '../assets/animations/branding-lottie.json';
import campaignAnimation from '../assets/animations/campaign-animation.json';
import confettiAnimation from '../assets/animations/confetti.json';
import progressAnimation from '../assets/animations/progress.json';
import rocketAnimation from '../assets/animations/rocket.json';
import targetAudienceAnimation from '../assets/animations/target-audience.json';
import influencerAnimation from '../assets/animations/influencer.json';

// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [activeSection, setActiveSection] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);

  // Lottie animation refs
  const headerAnimationRef = useRef(null);
  const progressAnimationRef = useRef(null);
  const influencerAnimationRef = useRef(null);
  const confettiAnimationRef = useRef(null);
  
  // Section refs for scroll animations
  const detailsRef = useRef(null);
  const formRef = useRef(null);
  const aboutRef = useRef(null);
  const calendarRef = useRef(null);
  const suggestionsRef = useRef(null);
  const adviceRef = useRef(null);
  const influencersRef = useRef(null);
  const tasksRef = useRef(null);

  // Initialize animations
  useEffect(() => {
    if (!loading && campaign) {
      // Header animation
      const headerAnim = lottie.loadAnimation({
        container: headerAnimationRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: campaignAnimation
      });

      // Progress animation
      const progressAnim = lottie.loadAnimation({
        container: progressAnimationRef.current,
        renderer: 'svg',
        loop: false,
        autoplay: false,
        animationData: progressAnimation
      });

      // Influencer animation
      const influencerAnim = lottie.loadAnimation({
        container: influencerAnimationRef.current,
        renderer: 'svg',
        loop: true,
        autoplay: true,
        animationData: influencerAnimation
      });

      // Cleanup animations on unmount
      return () => {
        headerAnim.destroy();
        progressAnim.destroy();
        influencerAnim.destroy();
      };
    }
  }, [loading, campaign]);

  // Play confetti animation when campaign is loaded
  useEffect(() => {
    if (!loading && campaign && !showConfetti) {
      setShowConfetti(true);
      
      // Set a timeout to load the confetti animation after the component is fully rendered
      setTimeout(() => {
        if (confettiAnimationRef.current) {
          const confettiAnim = lottie.loadAnimation({
            container: confettiAnimationRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: confettiAnimation
          });
          
          // Destroy the animation after it plays once
          confettiAnim.addEventListener('complete', () => {
            confettiAnim.destroy();
          });
        }
      }, 500);
    }
  }, [loading, campaign, showConfetti]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    if (!loading && campaign) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            setActiveSection(entry.target.id);
          }
        });
      }, options);

      // Observe all section refs
      const refs = [detailsRef, formRef, aboutRef, calendarRef, suggestionsRef, adviceRef, influencersRef, tasksRef];
      refs.forEach(ref => {
        if (ref.current) {
          observer.observe(ref.current);
        }
      });

      return () => {
        refs.forEach(ref => {
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        });
      };
    }
  }, [loading, campaign]);

  // 1) Fetch the campaign document on mount
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
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
      setIsEditing(false);
      
      // Show confetti on successful save
      setShowConfetti(true);
    } catch (err) {
      console.error('Error saving campaign edits:', err);
      setError('Failed to save changes.');
    }
  };

  // 4) Conditional rendering for loading, error, or no campaign found
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-animation" ref={headerAnimationRef}></div>
        <h2 className="loading-text">Loading campaign magic...</h2>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon"></div>
        <h2 className="error-text">{error}</h2>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="not-found-container">
        <div className="not-found-icon"></div>
        <h2 className="not-found-text">Campaign not found.</h2>
        <button className="back-button" onClick={() => navigate('/')}>
          Go Back
        </button>
      </div>
    );
  }

  // Display campaign image or fallback to demo image
  const displayedImage = campaign.campaignImage || demoImage;

  // Calculate status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Draft': return '#FFA500'; // Orange
      case 'Active': return '#4CAF50'; // Green
      case 'Paused': return '#FFC107'; // Amber
      case 'Completed': return '#2196F3'; // Blue
      default: return '#9E9E9E'; // Grey
    }
  };

  return (
    <div className="campaign-detail-container">
      {/* Confetti overlay for celebrations */}
      {showConfetti && (
        <div className="confetti-overlay">
          <div ref={confettiAnimationRef} className="confetti-animation"></div>
        </div>
      )}
      
      <div className="campaign-header">
        <div className="header-content">
          <div className="image-wrapper">
            <img
              className="campaign-image pulse-effect"
              src={displayedImage}
              alt="Campaign Visual"
            />
            <div className="image-overlay">
              <div ref={headerAnimationRef} className="header-animation"></div>
            </div>
          </div>
          <div className="title-content">
            <h1 className="campaign-title">
              {campaign.name || 'Untitled Campaign'}
            </h1>
            <p className="campaign-subtitle">
              {campaign.objective || 'No objective provided yet.'}
            </p>
            <div className="campaign-status">
              <span 
                className="status-badge"
                style={{ backgroundColor: getStatusColor(campaign.status) }}
              >
                {campaign.status || 'Draft'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="campaign-metrics">
          <div className="metric-card">
            <div className="metric-icon progress-icon">
              <div ref={progressAnimationRef}></div>
            </div>
            <div className="metric-content">
              <h3>Progress</h3>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar" 
                  style={{ width: `${campaign.progress || 0}%` }}
                ></div>
              </div>
              <p className="metric-value">{campaign.progress || 0}%</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon clicks-icon"></div>
            <div className="metric-content">
              <h3>Clicks</h3>
              <p className="metric-value">{campaign.clicks || 0}</p>
            </div>
          </div>
          
          <div className="metric-card">
            <div className="metric-icon conversions-icon"></div>
            <div className="metric-content">
              <h3>Conversions</h3>
              <p className="metric-value">{campaign.conversions || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* ================== EDIT MODE ================== */
        <div className="campaign-edit-form">
          <h2 className="edit-title">Edit Campaign</h2>
          <div className="edit-grid">
            <div className="edit-column">
              <h3 className="section-title">Basic Information</h3>
              
              <div className="form-group">
                <label>Campaign Image (URL)</label>
                <input
                  type="text"
                  name="campaignImage"
                  value={editData.campaignImage}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Objective</label>
                <input
                  type="text"
                  name="objective"
                  value={editData.objective}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={editData.targetAudience}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={editData.duration}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Budget</label>
                <input
                  type="text"
                  name="budget"
                  value={editData.budget}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Influencer Collaboration</label>
                <input
                  type="text"
                  name="influencerCollaboration"
                  value={editData.influencerCollaboration}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>About Campaign</label>
                <textarea
                  name="aboutCampaign"
                  rows="3"
                  value={editData.aboutCampaign}
                  onChange={handleChange}
                  className="input-field textarea"
                />
              </div>
            </div>
            
            <div className="edit-column">
              <h3 className="section-title">Performance & Status</h3>
              
              <div className="form-group">
                <label>Progress</label>
                <input
                  type="number"
                  name="progress"
                  value={editData.progress}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Clicks</label>
                <input
                  type="number"
                  name="clicks"
                  value={editData.clicks}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Conversions</label>
                <input
                  type="number"
                  name="conversions"
                  value={editData.conversions}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-group">
                <label>Status</label>
                <select 
                  name="status" 
                  value={editData.status} 
                  onChange={handleChange}
                  className="input-field select"
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <h3 className="section-title">Original Form Inputs</h3>
              
              <div className="form-group">
                <label>Business Description</label>
                <textarea
                  name="businessDescription"
                  rows="2"
                  value={editData.businessDescription}
                  onChange={handleChange}
                  className="input-field textarea"
                />
              </div>
              
              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={editData.industry}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label>Timeframe Start</label>
                  <input
                    type="text"
                    name="timeframeStart"
                    value={editData.timeframeStart}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
                <div className="form-group half">
                  <label>Timeframe End</label>
                  <input
                    type="text"
                    name="timeframeEnd"
                    value={editData.timeframeEnd}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Platforms</label>
                <textarea
                  name="platforms"
                  rows="2"
                  value={editData.platforms}
                  onChange={handleChange}
                  className="input-field textarea"
                />
              </div>
              
              <div className="form-group">
                <label>Market Trends</label>
                <textarea
                  name="marketTrends"
                  rows="2"
                  value={editData.marketTrends}
                  onChange={handleChange}
                  className="input-field textarea"
                />
              </div>
              
              <div className="form-group">
                <label>Target Audience (Form)</label>
                <textarea
                  name="targetAudienceForm"
                  rows="2"
                  value={editData.targetAudienceForm}
                  onChange={handleChange}
                  className="input-field textarea"
                />
              </div>
              
              <div className="form-group">
                <label>Brand USP</label>
                <textarea
                  name="brandUSP"
                  rows="2"
                  value={editData.brandUSP}
                  onChange={handleChange}
                  className="input-field textarea"
                />
              </div>
            </div>
          </div>

          <div className="edit-actions">
            <button onClick={handleSave} className="save-button">
              <span className="button-icon">✓</span> Save Changes
            </button>
            <button onClick={() => setIsEditing(false)} className="cancel-button">
              <span className="button-icon">✕</span> Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ================== VIEW MODE ================== */
        <>
          {/* Campaign Details Section */}
          <div id="details" ref={detailsRef} className="campaign-detail-box section-fade-in">
            <div className="section-header">
              <h2 className="detail-title">Campaign Details</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="detail-grid">
              <div className="detail-item glowing-card">
                <div className="detail-icon name-icon"></div>
                <h3>Name</h3>
                <p>{campaign.name || 'N/A'}</p>
              </div>
              
              <div className="detail-item glowing-card">
                <div className="detail-icon objective-icon"></div>
                <h3>Objective</h3>
                <p>{campaign.objective || 'N/A'}</p>
              </div>
              
              <div className="detail-item glowing-card">
                <div className="detail-icon audience-icon"></div>
                <h3>Target Audience</h3>
                <p>{campaign.targetAudience || 'N/A'}</p>
              </div>
              
              <div className="detail-item glowing-card">
                <div className="detail-icon duration-icon"></div>
                <h3>Duration</h3>
                <p>{campaign.duration || 'N/A'}</p>
              </div>
              
              <div className="detail-item glowing-card">
                <div className="detail-icon budget-icon"></div>
                <h3>Budget</h3>
                <p>{campaign.budget || 'N/A'}</p>
              </div>
              
              <div className="detail-item glowing-card">
                <div className="detail-icon collab-icon"></div>
                <h3>Influencer Collaboration</h3>
                <p>{campaign.influencerCollaboration || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* About Campaign Section */}
          <div id="about" ref={aboutRef} className="campaign-description section-fade-in">
            <div className="section-header">
              <h2 className="description-title">About the Campaign</h2>
              <div className="section-divider"></div>
            </div>
            
            <div className="description-content">
              <p className="description-text">
                {campaign.aboutCampaign || 'No further description provided.'}
              </p>
            </div>
          </div>

          {/* Additional: Original Form Inputs */}
          {campaign.formInputs && (
            <div id="form" ref={formRef} className="campaign-detail-box form-inputs-section section-fade-in">
              <div className="section-header">
                <h2 className="detail-title">Original Form Inputs</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="form-inputs-grid">
                <div className="form-input-item">
                  <h3>Business Description</h3>
                  <p>{campaign.formInputs.businessDescription || 'N/A'}</p>
                </div>
                
                <div className="form-input-item">
                  <h3>Industry</h3>
                  <p>{campaign.formInputs.industry || 'N/A'}</p>
                </div>
                
                <div className="form-input-item">
                  <h3>Timeframe</h3>
                  <p>
                    {campaign.formInputs.timeframeStart || 'N/A'} to {campaign.formInputs.timeframeEnd || 'N/A'}
                  </p>
                </div>
                
                <div className="form-input-item">
                  <h3>Platforms</h3>
                  <p>{campaign.formInputs.platforms || 'N/A'}</p>
                </div>
                
                <div className="form-input-item">
                  <h3>Market Trends</h3>
                  <p>{campaign.formInputs.marketTrends || 'N/A'}</p>
                </div>
                
                <div className="form-input-item">
                  <h3>Target Audience</h3>
                  <p>{campaign.formInputs.targetAudience || 'N/A'}</p>
                </div>
                
                <div className="form-input-item">
                  <h3>Brand USP</h3>
                  <p>{campaign.formInputs.brandUSP || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Events (from AI) */}
          {campaign.calendarEvents && campaign.calendarEvents.length > 0 && (
            <div id="calendar" ref={calendarRef} className="campaign-detail-box calendar-section section-fade-in">
              <div className="section-header">
                <h2 className="detail-title">Calendar Events</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="calendar-grid">
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
                    <div key={idx} className="calendar-event-card">
                      <div className="event-date">{ev.date || 'N/A'}</div>
                      <div className="event-title">{ev.event || 'No details'}</div>
                      {ev.platforms && (
                        <div className="event-platforms">
                          <span className="event-label">Platforms:</span> {platformsString}
                        </div>
                      )}
                      {ev.cta && (
                        <div className="event-cta">
                          <span className="event-label">CTA:</span> {ev.cta}
                        </div>
                      )}
                      {ev.captions && (
                        <div className="event-captions">
                          <span className="event-label">Captions:</span> {ev.captions}
                        </div>
                      )}
                      {ev.kpis && (
                        <div className="event-kpis">
                          <span className="event-label">KPIs:</span> {kpisString}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bingo Suggestions (from AI) */}
          {campaign.bingoSuggestions && campaign.bingoSuggestions.length > 0 && (
            <div id="suggestions" ref={suggestionsRef} className="campaign-detail-box suggestions-section section-fade-in">
              <div className="section-header">
                <h2 className="detail-title">Campaign Suggestions</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="suggestions-grid">
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
                    <div key={idx} className="suggestion-card">
                      <div className="suggestion-content">
                        <h3 className="suggestion-title">Idea #{idx + 1}</h3>
                        <p className="suggestion-text">{suggestionVal}</p>
                        <div className="suggestion-divider"></div>
                        <h4 className="strategy-title">Strategy</h4>
                        <p className="strategy-text">{strategyVal}</p>
                      </div>
                      
                      {item.imageUrl && (
                        <div className="suggestion-image">
                          <img
                            src={item.imageUrl}
                            alt="Suggestion Visual"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* More Advice (from AI) */}
          {campaign.moreAdvice && campaign.moreAdvice.length > 0 && (
            <div id="advice" ref={adviceRef} className="campaign-detail-box advice-section section-fade-in">
              <div className="section-header">
                <h2 className="advice-title">Additional Advice</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="advice-grid">
                {campaign.moreAdvice.map((advice, idx) => {
                  // Handle JSON object advice
                  if (typeof advice === 'object') {
                    // Parse influencer recommendations
                    if (advice.type === "Influencer Recommendation") {
                      return (
                        <div key={idx} className={`influencer-recommendation ${idx === 0 ? 'new-recommendation' : ''}`}>
                          <div className="recommendation-title">
                            <span className="icon">★</span>
                            {advice.title || "Connect with influencer"}
                          </div>
                          <div className="recommendation-description">
                            {advice.description || "Consider collaborating for your campaign."}
                          </div>
                          
                          <div className="influencer-stats">
                            <div className="influencer-avatar">
                              {advice.title?.split(' ')?.pop()?.charAt(0) || "I"}
                            </div>
                            <div className="influencer-details">
                              <div className="influencer-handle">
                                <span className="platform-icon">
                                  {advice.description?.includes('Instagram') ? '📱' : 
                                  advice.description?.includes('YouTube') ? '📺' : '🌐'}
                                </span>
                                {advice.description?.match(/@[\w]+/) || "Influencer"}
                              </div>
                              <div className="influencer-metrics">
                                <div className="metric">
                                  <span className="metric-value">
                                    {advice.description?.match(/(\d+(\.\d+)?(K|M)?)/) || ""}
                                  </span>
                                  <span>followers</span>
                                </div>
                                <div className="metric">
                                  <span className="metric-value">~1%</span>
                                  <span>engagement</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    
                    // Generic object display
                    return (
                      <div key={idx} className="advice-card">
                        <div className="advice-icon">💡</div>
                        <div className="advice-content">
                          <h3 className="advice-card-title">Strategic Advice</h3>
                          <p className="advice-text">{JSON.stringify(advice)}</p>
                        </div>
                      </div>
                    );
                  }
                  
                  // Simple text advice
                  return (
                    <div key={idx} className="advice-card">
                      <div className="advice-icon">💡</div>
                      <div className="advice-content">
                        <h3 className="advice-card-title">Tip #{idx + 1}</h3>
                        <p className="advice-text">{advice}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Joined Influencers Section */}
          <div id="influencers" ref={influencersRef} className="campaign-detail-box influencers-section section-fade-in">
            <div className="section-header">
              <h2 className="detail-title">Joined Influencers</h2>
              <div className="section-divider"></div>
              <div className="influencer-animation" ref={influencerAnimationRef}></div>
            </div>
            
            {campaign.joinedInfluencers && campaign.joinedInfluencers.length > 0 ? (
              <div className="influencers-grid">
                {campaign.joinedInfluencers.map((inf) => (
                  <div key={inf._id} className="influencer-card">
                    <div className="influencer-header">
                      <div className="influencer-image-container">
                        <img
                          src={inf.profileImage || 'https://via.placeholder.com/40'}
                          alt={inf.name}
                          className="influencer-image"
                        />
                      </div>
                      <div className="influencer-info">
                        <h3 className="influencer-name">{inf.name}</h3>
                        <div className="influencer-progress-container">
                          <div 
                            className="influencer-progress-bar" 
                            style={{ width: `${inf.progress}%` }}
                          ></div>
                        </div>
                        <span className="influencer-progress">{inf.progress}% complete</span>
                      </div>
                    </div>
                    
                    {inf.tasks && inf.tasks.length > 0 ? (
                      <div className="influencer-tasks">
                        <h4 className="tasks-title">Tasks</h4>
                        <ul className="tasks-list">
                          {inf.tasks.map((task) => (
                            <li key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                              <span className="task-checkbox">
                                {task.completed ? '✓' : '○'}
                              </span>
                              <span className="task-text">{task.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="no-tasks">No tasks assigned yet.</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-influencers">
                <p>No joined influencers yet.</p>
                <button 
                  className="find-influencers-button" 
                  onClick={() => navigate('/find-influencer')}
                >
                  Find Influencers Now
                </button>
              </div>
            )}
          </div>

          {/* If the campaign doc itself has tasks */}
          {campaign.tasks && campaign.tasks.length > 0 && (
            <div id="tasks" ref={tasksRef} className="campaign-detail-box tasks-section section-fade-in">
              <div className="section-header">
                <h2 className="detail-title">To-Do List</h2>
                <div className="section-divider"></div>
              </div>
              
              <div className="tasks-grid">
                {campaign.tasks.map((task, idx) => (
                  <div key={idx} className={`task-card ${task.completed ? 'completed' : ''}`}>
                    <div className="task-status">
                      {task.completed ? '✓' : ''}
                    </div>
                    <div className="task-content">
                      <p className="task-text">{task.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button 
              onClick={() => setIsEditing(true)}
              className="edit-button pulse-button"
            >
              <span className="button-icon">✏️</span> Edit Campaign
            </button>
            <button 
              onClick={() => navigate('/find-influencer')}
              className="find-button pulse-button"
            >
              <span className="button-icon">🔍</span> Find Influencers
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignDetail;