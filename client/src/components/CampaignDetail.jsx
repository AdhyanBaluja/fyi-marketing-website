import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
// IMPORTANT: Remove your old import of './CampaignDetail.css' and replace
// it with your new ".module.css" if you like. For now, we’ll assume you have
// the updated styles in "CampaignDetail.module.css" with the animations/effects below:
import styles from './CampaignDetail.module.css'; // or rename as you like

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);

  // Track which section is active for intersection animation
  const [activeSection, setActiveSection] = useState(null);

  // Refs for intersection observer
  const headerRef = useRef(null);
  const metricsRef = useRef(null);
  const detailsRef = useRef(null);
  const formRef = useRef(null);
  const aboutRef = useRef(null);
  const calendarRef = useRef(null);
  const suggestionsRef = useRef(null);
  const adviceRef = useRef(null);
  const influencersRef = useRef(null);
  const tasksRef = useRef(null);

  // Intersection Observer to animate sections into view
  useEffect(() => {
    if (!loading && campaign) {
      const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.2
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles['animate-in']);
            const sectionId = entry.target.getAttribute('data-section-id');
            if (sectionId) setActiveSection(sectionId);
          }
        });
      }, options);

      // Observe all section refs
      const elements = [
        headerRef.current,
        metricsRef.current,
        detailsRef.current,
        formRef.current,
        aboutRef.current,
        calendarRef.current,
        suggestionsRef.current,
        adviceRef.current,
        influencersRef.current,
        tasksRef.current
      ].filter(Boolean);

      elements.forEach(element => {
        if (element) observer.observe(element);
      });

      return () => {
        elements.forEach(element => {
          if (element) observer.unobserve(element);
        });
      };
    }
  }, [loading, campaign]);

  // Show confetti on initial load if campaign is loaded
  useEffect(() => {
    if (!loading && campaign && !showConfetti) {
      setShowConfetti(true);
      // Hide confetti after 3 seconds
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
  }, [loading, campaign, showConfetti]);

  // Fetch campaign on mount
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

        // Prepare local state for editing
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

  // Handle input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // Save updates (PATCH)
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
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    } catch (err) {
      console.error('Error saving campaign edits:', err);
      setError('Failed to save changes.');
    }
  };

  // Handle special status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'Draft': return '#FFA500'; // Orange
      case 'Active': return '#4CAF50'; // Green
      case 'Paused': return '#FFC107'; // Amber
      case 'Completed': return '#2196F3'; // Blue
      default: return '#9E9E9E'; // Grey
    }
  };

  // Loading, error, or not found states
  if (loading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['pulse-rings']}>
          <div className={styles.ring}></div>
          <div className={styles.ring}></div>
          <div className={styles.ring}></div>
        </div>
        <h2 className={styles['loading-text']}>Loading campaign magic...</h2>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles['error-container']}>
        <div className={styles['error-icon']}>⚠️</div>
        <h2 className={styles['error-text']}>{error}</h2>
        <button
          className={styles['retry-button']}
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }
  if (!campaign) {
    return (
      <div className={styles['not-found-container']}>
        <div className={styles['not-found-icon']}>🔍</div>
        <h2 className={styles['not-found-text']}>Campaign not found.</h2>
        <button
          className={styles['back-button']}
          onClick={() => navigate('/')}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className={styles['campaign-detail-container']}>

      {/* Fullscreen Dark Animated Hero / top area */}
      <div
        className={`${styles['amplify-header']} ${styles['bg-hero-animation']}`}
        ref={headerRef}
        data-section-id="header"
      >
        {/* Some additional animated elements for fun/dopamine triggers */}
        <div className={styles['animated-bubbles']}></div>
        <div className={styles['animated-sparks']}></div>
        
        {/* Title & short info */}
        <div className={styles['header-content']}>
          <div className={styles['plan-title']}>
            {/* Big campaign name */}
            <h1>
              {campaign.name || 'amplify Plan'} <span className={styles['ai-badge']}>(AI)</span>
            </h1>
            <p className={styles['subheading']}>
              {campaign.objective || 'Amplify brand awareness'}
            </p>

            <span
              className={styles['status-badge']}
              style={{ backgroundColor: getStatusColor(campaign.status) }}
            >
              {campaign.status || 'Draft'}
            </span>
          </div>
        </div>
      </div>

      {/* Confetti overlay */}
      {showConfetti && (
        <div className={styles['confetti-container']}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className={styles.confetti}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                backgroundColor: [
                  '#FF5733',
                  '#FFC300',
                  '#DAF7A6',
                  '#C70039',
                  '#900C3F'
                ][Math.floor(Math.random() * 5)]
              }}
            ></div>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div
        className={styles['campaign-metrics']}
        ref={metricsRef}
        data-section-id="metrics"
      >
        <div className={styles['metric-card']}>
          <div className={`${styles['metric-icon']} ${styles['progress-icon']}`}>
            <svg viewBox="0 0 36 36">
              <path
                className={styles['progress-circle']}
                strokeDasharray={`${campaign.progress}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className={styles['progress-text']}>
                {campaign.progress}%
              </text>
            </svg>
          </div>
          <div className={styles['metric-content']}>
            <h3>Progress</h3>
          </div>
        </div>

        <div className={styles['metric-card']}>
          <div className={`${styles['metric-icon']} ${styles['clicks-icon']}`}>
            <i className={styles['icon']}>👆</i>
          </div>
          <div className={styles['metric-content']}>
            <h3>Clicks</h3>
            <p className={styles['metric-value']}>{campaign.clicks || 0}</p>
          </div>
        </div>

        <div className={styles['metric-card']}>
          <div className={`${styles['metric-icon']} ${styles['conversions-icon']}`}>
            <i className={styles['icon']}>🎯</i>
          </div>
          <div className={styles['metric-content']}>
            <h3>Conversions</h3>
            <p className={styles['metric-value']}>{campaign.conversions || 0}</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        /* ================== EDIT MODE ================== */
        <div className={styles['campaign-edit-form']}>
          <h2 className={styles['edit-title']}>Edit Campaign</h2>
          <div className={styles['edit-grid']}>

            <div className={styles['edit-column']}>
              <h3 className={styles['section-title']}>Basic Information</h3>

              <div className={styles['form-group']}>
                <label>Campaign Image (URL)</label>
                <input
                  type="text"
                  name="campaignImage"
                  value={editData.campaignImage}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Objective</label>
                <input
                  type="text"
                  name="objective"
                  value={editData.objective}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Target Audience</label>
                <input
                  type="text"
                  name="targetAudience"
                  value={editData.targetAudience}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={editData.duration}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Budget</label>
                <input
                  type="text"
                  name="budget"
                  value={editData.budget}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Influencer Collaboration</label>
                <input
                  type="text"
                  name="influencerCollaboration"
                  value={editData.influencerCollaboration}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>About Campaign</label>
                <textarea
                  name="aboutCampaign"
                  rows="3"
                  value={editData.aboutCampaign}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['textarea']}`}
                />
              </div>
            </div>

            <div className={styles['edit-column']}>
              <h3 className={styles['section-title']}>Performance & Status</h3>

              <div className={styles['form-group']}>
                <label>Progress</label>
                <input
                  type="number"
                  name="progress"
                  value={editData.progress}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Clicks</label>
                <input
                  type="number"
                  name="clicks"
                  value={editData.clicks}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Conversions</label>
                <input
                  type="number"
                  name="conversions"
                  value={editData.conversions}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Status</label>
                <select
                  name="status"
                  value={editData.status}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['select']}`}
                >
                  <option value="Draft">Draft</option>
                  <option value="Active">Active</option>
                  <option value="Paused">Paused</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <h3 className={styles['section-title']}>Original Form Inputs</h3>

              <div className={styles['form-group']}>
                <label>Business Description</label>
                <textarea
                  name="businessDescription"
                  rows="2"
                  value={editData.businessDescription}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['textarea']}`}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={editData.industry}
                  onChange={handleChange}
                  className={styles['input-field']}
                />
              </div>

              <div className={styles['form-row']}>
                <div className={`${styles['form-group']} ${styles['half']}`}>
                  <label>Timeframe Start</label>
                  <input
                    type="text"
                    name="timeframeStart"
                    value={editData.timeframeStart}
                    onChange={handleChange}
                    className={styles['input-field']}
                  />
                </div>
                <div className={`${styles['form-group']} ${styles['half']}`}>
                  <label>Timeframe End</label>
                  <input
                    type="text"
                    name="timeframeEnd"
                    value={editData.timeframeEnd}
                    onChange={handleChange}
                    className={styles['input-field']}
                  />
                </div>
              </div>

              <div className={styles['form-group']}>
                <label>Platforms</label>
                <textarea
                  name="platforms"
                  rows="2"
                  value={editData.platforms}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['textarea']}`}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Market Trends</label>
                <textarea
                  name="marketTrends"
                  rows="2"
                  value={editData.marketTrends}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['textarea']}`}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Target Audience (Form)</label>
                <textarea
                  name="targetAudienceForm"
                  rows="2"
                  value={editData.targetAudienceForm}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['textarea']}`}
                />
              </div>

              <div className={styles['form-group']}>
                <label>Brand USP</label>
                <textarea
                  name="brandUSP"
                  rows="2"
                  value={editData.brandUSP}
                  onChange={handleChange}
                  className={`${styles['input-field']} ${styles['textarea']}`}
                />
              </div>
            </div>
          </div>

          <div className={styles['edit-actions']}>
            <button
              onClick={handleSave}
              className={styles['save-button']}
            >
              <span className={styles['button-icon']}>✓</span> Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={styles['cancel-button']}
            >
              <span className={styles['button-icon']}>✕</span> Cancel
            </button>
          </div>
        </div>
      ) : (
        /* ================== VIEW MODE ================== */
        <>
          {/* Campaign Details */}
          <div
            data-section-id="details"
            ref={detailsRef}
            className={`${styles['campaign-detail-box']} ${styles['section-fade-in']}`}
          >
            <div className={styles['section-header']}>
              <h2 className={styles['detail-title']}>Campaign Details</h2>
              <div className={styles['section-divider']}></div>
            </div>
            <div className={styles['detail-grid']}>
              <div className={`${styles['detail-item']} ${styles['glowing-card']}`}>
                <div className={`${styles['detail-icon']} ${styles['name-icon']}`}>📝</div>
                <h3>Name</h3>
                <p>{campaign.name || 'N/A'}</p>
              </div>
              <div className={`${styles['detail-item']} ${styles['glowing-card']}`}>
                <div className={`${styles['detail-icon']} ${styles['objective-icon']}`}>🎯</div>
                <h3>Objective</h3>
                <p>{campaign.objective || 'N/A'}</p>
              </div>
              <div className={`${styles['detail-item']} ${styles['glowing-card']}`}>
                <div className={`${styles['detail-icon']} ${styles['audience-icon']}`}>👥</div>
                <h3>Target Audience</h3>
                <p>{campaign.targetAudience || 'N/A'}</p>
              </div>
              <div className={`${styles['detail-item']} ${styles['glowing-card']}`}>
                <div className={`${styles['detail-icon']} ${styles['duration-icon']}`}>⏱️</div>
                <h3>Duration</h3>
                <p>{campaign.duration || 'N/A'}</p>
              </div>
              <div className={`${styles['detail-item']} ${styles['glowing-card']}`}>
                <div className={`${styles['detail-icon']} ${styles['budget-icon']}`}>💰</div>
                <h3>Budget</h3>
                <p>{campaign.budget || 'N/A'}</p>
              </div>
              <div className={`${styles['detail-item']} ${styles['glowing-card']}`}>
                <div className={`${styles['detail-icon']} ${styles['collab-icon']}`}>🤝</div>
                <h3>Influencer Collaboration</h3>
                <p>{campaign.influencerCollaboration || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* About the Campaign */}
          <div
            data-section-id="about"
            ref={aboutRef}
            className={`${styles['campaign-description']} ${styles['section-fade-in']}`}
          >
            <div className={styles['section-header']}>
              <h2 className={styles['description-title']}>About the Campaign</h2>
              <div className={styles['section-divider']}></div>
            </div>
            <div className={styles['description-content']}>
              <p className={styles['description-text']}>
                {campaign.aboutCampaign || 'No further description provided.'}
              </p>
            </div>
          </div>

          {/* Original Form Inputs */}
          {campaign.formInputs && (
            <div
              data-section-id="form"
              ref={formRef}
              className={`${styles['campaign-detail-box']} ${styles['form-inputs-section']} ${styles['section-fade-in']}`}
            >
              <div className={styles['section-header']}>
                <h2 className={styles['detail-title']}>Original Form Inputs</h2>
                <div className={styles['section-divider']}></div>
              </div>
              <div className={styles['form-inputs-grid']}>
                <div className={styles['form-input-item']}>
                  <h3>Business Description</h3>
                  <p>{campaign.formInputs.businessDescription || 'N/A'}</p>
                </div>
                <div className={styles['form-input-item']}>
                  <h3>Industry</h3>
                  <p>{campaign.formInputs.industry || 'N/A'}</p>
                </div>
                <div className={styles['form-input-item']}>
                  <h3>Timeframe</h3>
                  <p>
                    {campaign.formInputs.timeframeStart || 'N/A'} to {campaign.formInputs.timeframeEnd || 'N/A'}
                  </p>
                </div>
                <div className={styles['form-input-item']}>
                  <h3>Platforms</h3>
                  <p>{campaign.formInputs.platforms || 'N/A'}</p>
                </div>
                <div className={styles['form-input-item']}>
                  <h3>Market Trends</h3>
                  <p>{campaign.formInputs.marketTrends || 'N/A'}</p>
                </div>
                <div className={styles['form-input-item']}>
                  <h3>Target Audience</h3>
                  <p>{campaign.formInputs.targetAudience || 'N/A'}</p>
                </div>
                <div className={styles['form-input-item']}>
                  <h3>Brand USP</h3>
                  <p>{campaign.formInputs.brandUSP || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

          {/* Calendar Events */}
          {campaign.calendarEvents && campaign.calendarEvents.length > 0 && (
            <div
              data-section-id="calendar"
              ref={calendarRef}
              className={`${styles['campaign-detail-box']} ${styles['calendar-section']} ${styles['section-fade-in']}`}
            >
              <div className={styles['section-header']}>
                <h2 className={styles['detail-title']}>Calendar Events</h2>
                <div className={styles['section-divider']}></div>
              </div>
              <div className={styles['calendar-grid']}>
                {campaign.calendarEvents.map((ev, idx) => {
                  let platformsString = '';
                  if (ev.platforms) {
                    platformsString = Array.isArray(ev.platforms)
                      ? ev.platforms.join(', ')
                      : String(ev.platforms);
                  }
                  let kpisString = '';
                  if (ev.kpis) {
                    kpisString = Array.isArray(ev.kpis)
                      ? ev.kpis.join(', ')
                      : String(ev.kpis);
                  }
                  return (
                    <div key={idx} className={styles['calendar-event-card']}>
                      <div className={styles['day-badge']}>Day {idx + 1}</div>
                      <div className={styles['event-content']}>
                        <div className={styles['event-title']}>
                          {ev.event || 'No details'}
                        </div>
                        {ev.platforms && (
                          <div className={styles['event-platforms']}>
                            <span className={styles['event-label']}>Platforms:</span>{' '}
                            {platformsString}
                          </div>
                        )}
                        {ev.cta && (
                          <div className={styles['event-cta']}>
                            <span className={styles['event-label']}>CTA:</span> {ev.cta}
                          </div>
                        )}
                        {ev.captions && (
                          <div className={styles['event-captions']}>
                            <span className={styles['event-label']}>Captions:</span> {ev.captions}
                          </div>
                        )}
                        {ev.kpis && (
                          <div className={styles['event-kpis']}>
                            <span className={styles['event-label']}>KPIs:</span> {kpisString}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bingo Suggestions */}
          {campaign.bingoSuggestions && campaign.bingoSuggestions.length > 0 && (
            <div
              data-section-id="suggestions"
              ref={suggestionsRef}
              className={`${styles['campaign-detail-box']} ${styles['suggestions-section']} ${styles['section-fade-in']}`}
            >
              <div className={styles['section-header']}>
                <h2 className={styles['detail-title']}>Campaign Suggestions</h2>
                <div className={styles['section-divider']}></div>
              </div>
              <div className={styles['suggestions-grid']}>
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
                    <div key={idx} className={styles['suggestion-card']}>
                      <div className={styles['suggestion-content']}>
                        <h3 className={styles['suggestion-title']}>Idea #{idx + 1}</h3>
                        <p className={styles['suggestion-text']}>{suggestionVal}</p>
                        <div className={styles['suggestion-divider']}></div>
                        <h4 className={styles['strategy-title']}>Strategy</h4>
                        <p className={styles['strategy-text']}>{strategyVal}</p>
                      </div>
                      {item.imageUrl && (
                        <div className={styles['suggestion-image']}>
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

          {/* More Advice */}
          {campaign.moreAdvice && campaign.moreAdvice.length > 0 && (
            <div
              data-section-id="advice"
              ref={adviceRef}
              className={`${styles['campaign-detail-box']} ${styles['advice-section']} ${styles['section-fade-in']}`}
            >
              <div className={styles['section-header']}>
                <h2 className={styles['advice-title']}>Additional Advice</h2>
                <div className={styles['section-divider']}></div>
              </div>
              <div className={styles['advice-grid']}>
                {campaign.moreAdvice.map((advice, idx) => {
                  // If it's an object
                  if (typeof advice === 'object') {
                    // Possibly an influencer recommendation
                    if (advice.type === "Influencer Recommendation") {
                      return (
                        <div
                          key={idx}
                          className={`${styles['influencer-recommendation']} ${
                            idx === 0 ? styles['new-recommendation'] : ''
                          }`}
                        >
                          <div className={styles['recommendation-title']}>
                            <span className={styles['icon']}>★</span>
                            {advice.title || "Connect with influencer"}
                          </div>
                          <div className={styles['recommendation-description']}>
                            {advice.description || "Consider collaborating for your campaign."}
                          </div>
                          <div className={styles['influencer-stats']}>
                            <div className={styles['influencer-avatar']}>
                              {advice.title?.split(' ')?.pop()?.charAt(0) || "I"}
                            </div>
                            <div className={styles['influencer-details']}>
                              <div className={styles['influencer-handle']}>
                                <span className={styles['platform-icon']}>
                                  {advice.description?.includes('Instagram')
                                    ? '📱'
                                    : advice.description?.includes('YouTube')
                                      ? '📺'
                                      : '🌐'}
                                </span>
                                {advice.description?.match(/@[\w]+/) || "Influencer"}
                              </div>
                              <div className={styles['influencer-metrics']}>
                                <div className={styles['metric']}>
                                  <span className={styles['metric-value']}>
                                    {advice.description?.match(/(\d+(\.\d+)?(K|M)?)/) || ""}
                                  </span>
                                  <span>followers</span>
                                </div>
                                <div className={styles['metric']}>
                                  <span className={styles['metric-value']}>~1%</span>
                                  <span>engagement</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    // Otherwise generic object advice
                    return (
                      <div key={idx} className={styles['advice-card']}>
                        <div className={styles['advice-icon']}>💡</div>
                        <div className={styles['advice-content']}>
                          <h3 className={styles['advice-card-title']}>Strategic Advice</h3>
                          <p className={styles['advice-text']}>
                            {JSON.stringify(advice)}
                          </p>
                        </div>
                      </div>
                    );
                  }
                  // Simple text advice
                  return (
                    <div key={idx} className={styles['advice-card']}>
                      <div className={styles['advice-icon']}>💡</div>
                      <div className={styles['advice-content']}>
                        <h3 className={styles['advice-card-title']}>Tip #{idx + 1}</h3>
                        <p className={styles['advice-text']}>{advice}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Joined Influencers */}
          <div
            data-section-id="influencers"
            ref={influencersRef}
            className={`${styles['campaign-detail-box']} ${styles['influencers-section']} ${styles['section-fade-in']}`}
          >
            <div className={styles['section-header']}>
              <h2 className={styles['detail-title']}>Joined Influencers</h2>
              <div className={styles['section-divider']}></div>
            </div>
            {campaign.joinedInfluencers && campaign.joinedInfluencers.length > 0 ? (
              <div className={styles['influencers-grid']}>
                {campaign.joinedInfluencers.map((inf) => (
                  <div key={inf._id} className={styles['influencer-card']}>
                    <div className={styles['influencer-header']}>
                      <div className={styles['influencer-image-container']}>
                        <img
                          src={inf.profileImage || 'https://via.placeholder.com/40'}
                          alt={inf.name}
                          className={styles['influencer-image']}
                        />
                      </div>
                      <div className={styles['influencer-info']}>
                        <h3 className={styles['influencer-name']}>{inf.name}</h3>
                        <div className={styles['influencer-progress-container']}>
                          <div
                            className={styles['influencer-progress-bar']}
                            style={{ width: `${inf.progress}%` }}
                          ></div>
                        </div>
                        <span className={styles['influencer-progress']}>
                          {inf.progress}% complete
                        </span>
                      </div>
                    </div>
                    {inf.tasks && inf.tasks.length > 0 ? (
                      <div className={styles['influencer-tasks']}>
                        <h4 className={styles['tasks-title']}>Tasks</h4>
                        <ul className={styles['tasks-list']}>
                          {inf.tasks.map((task) => (
                            <li
                              key={task._id}
                              className={`${styles['task-item']} ${
                                task.completed ? styles['completed'] : ''
                              }`}
                            >
                              <span className={styles['task-checkbox']}>
                                {task.completed ? '✓' : '○'}
                              </span>
                              <span className={styles['task-text']}>{task.text}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className={styles['no-tasks']}>No tasks assigned yet.</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles['no-influencers']}>
                <p>No joined influencers yet.</p>
                <button
                  className={styles['find-influencers-button']}
                  onClick={() => navigate('/find-influencer')}
                >
                  Find Influencers Now
                </button>
              </div>
            )}
          </div>

          {/* Campaign-level tasks */}
          {campaign.tasks && campaign.tasks.length > 0 && (
            <div
              data-section-id="tasks"
              ref={tasksRef}
              className={`${styles['campaign-detail-box']} ${styles['tasks-section']} ${styles['section-fade-in']}`}
            >
              <div className={styles['section-header']}>
                <h2 className={styles['detail-title']}>To-Do List</h2>
                <div className={styles['section-divider']}></div>
              </div>
              <div className={styles['tasks-grid']}>
                {campaign.tasks.map((task, idx) => (
                  <div
                    key={idx}
                    className={`${styles['task-card']} ${task.completed ? styles['completed'] : ''}`}
                  >
                    <div className={styles['task-status']}>
                      {task.completed ? '✓' : ''}
                    </div>
                    <div className={styles['task-content']}>
                      <p className={styles['task-text']}>{task.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles['action-buttons']}>
            <button
              onClick={() => setIsEditing(true)}
              className={`${styles['edit-button']} ${styles['pulse-button']}`}
            >
              <span className={styles['button-icon']}>✏️</span> Edit Campaign
            </button>
            <button
              onClick={() => navigate('/find-influencer')}
              className={`${styles['find-button']} ${styles['pulse-button']}`}
            >
              <span className={styles['button-icon']}>🔍</span> Find Influencers
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignDetail;
