import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignResults.css';
import NavBar from './NavBar';

// Platform colors with enhanced palette
const platformColors = {
  Instagram: '#E1306C',
  Facebook: '#4267B2',
  Twitter: '#1DA1F2',
  LinkedIn: '#0A66C2',
  YouTube: '#FF0000',
  TikTok: '#EE1D52',
  Default: '#FF7D00',
};

// Use environment variable for API base URL, fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function CampaignResults() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('');
  const [animatedSections, setAnimatedSections] = useState({});
  
  // Refs for scroll animations
  const heroRef = useRef(null);
  const metricsRef = useRef(null);
  const calendarRef = useRef(null);
  const bingoRef = useRef(null);
  const adviceRef = useRef(null);
  const actionsRef = useRef(null);
  
  // Calendar state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  // Notice about ephemeral images
  const [showImageNotice, setShowImageNotice] = useState(true);

  // Retrieve campaign ID from localStorage
  const campaignId = localStorage.getItem('latestCampaignId');

  // Setup intersection observer for scroll animations
  useEffect(() => {
    if (!loading && campaign) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setAnimatedSections(prev => ({
                ...prev,
                [entry.target.id]: true
              }));
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -100px 0px" }
      );

      const sections = document.querySelectorAll('.animate-on-scroll');
      sections.forEach((section) => {
        observer.observe(section);
      });

      return () => {
        sections.forEach((section) => {
          observer.unobserve(section);
        });
      };
    }
  }, [loading, campaign]);

  // Background animation elements
  useEffect(() => {
    if (!loading && campaign) {
      // Create particles
      const container = document.querySelector('.campaign-results-background');
      if (container) {
        for (let i = 0; i < 50; i++) {
          const particle = document.createElement('div');
          particle.className = 'background-particle';
          
          // Random position, size and animation delay
          const size = Math.random() * 4 + 1;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          particle.style.left = `${Math.random() * 100}vw`;
          particle.style.top = `${Math.random() * 100}vh`;
          particle.style.animationDelay = `${Math.random() * 10}s`;
          particle.style.animationDuration = `${Math.random() * 20 + 10}s`;
          
          container.appendChild(particle);
        }
      }
    }
  }, [loading, campaign]);

  useEffect(() => {
    if (!campaignId) {
      setErrorMsg('No campaign ID found in localStorage.');
      setLoading(false);
      return;
    }
    fetchCampaign(campaignId);
  }, [campaignId]);

  const fetchCampaign = async (id) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_BASE_URL}/api/campaigns/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCampaign(res.data.campaign);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setErrorMsg('Failed to load campaign data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Month navigation
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDayEvents([]);
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDayEvents([]);
    setSelectedDay(null);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarEvents = campaign?.calendarEvents || [];

  const getEventsForDay = (day) => {
    const dateString = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split('T')[0];
    return calendarEvents.filter((ev) => ev.date?.startsWith(dateString));
  };

  const handleDayClick = (day) => {
    setSelectedDay(day);
    setSelectedDayEvents(getEventsForDay(day));
  };

  const bingoSuggestions = campaign?.bingoSuggestions || [];
  const moreAdvice = campaign?.moreAdvice || [];

  const showToast = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  const handleActivateCampaign = async () => {
    if (!campaign?._id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/campaigns/${campaign._id}`,
        { status: 'Active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Campaign successfully activated!');
      fetchCampaign(campaign._id);
    } catch (err) {
      console.error('Error activating campaign:', err);
      showToast('Failed to activate campaign. Please try again.', 'error');
    }
  };

  const handleDelete = async () => {
    if (!campaign?._id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/campaigns/${campaign._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showToast('Campaign successfully deleted');
      setTimeout(() => {
        navigate('/brand/dashboard');
      }, 1000);
    } catch (err) {
      console.error('Error deleting campaign:', err);
      showToast('Failed to delete campaign. Please try again.', 'error');
    }
  };

  const handleFindInfluencers = () => {
    navigate('/find-influencer');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
          <div className="spinner-circle"></div>
        </div>
        <h2 className="loading-text">Loading your campaign insights...</h2>
      </div>
    );
  }
  
  if (errorMsg) {
    return (
      <div className="error-container">
        <div className="error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#f44336" strokeWidth="2"/>
            <path d="M12 7V13" stroke="#f44336" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#f44336"/>
          </svg>
        </div>
        <p className="error-message">{errorMsg}</p>
        <button 
          className="retry-button"
          onClick={() => fetchCampaign(campaignId)}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="no-campaign-container">
        <div className="empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>No campaign found.</h2>
        <button 
          className="create-campaign-button"
          onClick={() => navigate('/create-campaign')}
        >
          Create a New Campaign
        </button>
      </div>
    );
  }

  const totalEvents = calendarEvents.length;
  const isActive = campaign.status === 'Active';

  // Helper to compute background for a given day cell
  const computeDayBg = (dayEvents) => {
    if (dayEvents.length === 0) {
      return { bgColor: 'rgba(30, 33, 43, 0.5)', fontColor: '#f5f5f5' };
    }
    if (dayEvents.length === 1) {
      const firstPlatform = dayEvents[0].platforms?.[0] || 'Default';
      return {
        bgColor: platformColors[firstPlatform] || platformColors.Default,
        fontColor: '#fff',
      };
    }
    if (dayEvents.length === 2) {
      const platform1 = dayEvents[0].platforms?.[0] || 'Default';
      const platform2 = dayEvents[1].platforms?.[0] || 'Default';
      const color1 = platformColors[platform1] || platformColors.Default;
      const color2 = platformColors[platform2] || platformColors.Default;
      return {
        bgColor: `linear-gradient(135deg, ${color1}, ${color2})`,
        fontColor: '#fff',
      };
    }
    return {
      bgColor: '#FF7D00',
      fontColor: '#fff',
    };
  };

  return (
    <div className="campaign-results-container">
      <NavBar />
      
      {/* Animated Background */}
      <div className="campaign-results-background">
        <div className="bg-gradient-overlay"></div>
        <div className="bg-grid"></div>
      </div>
      
      {/* Toast Notification */}
      <div className={`toast-notification ${showNotification ? 'show' : ''} ${notificationType}`}>
        <div className="toast-content">
          <div className="toast-icon">
            {notificationType === 'success' ? (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M8 12L11 15L16 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 7V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="12" cy="16" r="1" fill="currentColor"/>
              </svg>
            )}
          </div>
          <span className="toast-message">{notificationMessage}</span>
        </div>
      </div>

      {/* Hero Section with Campaign Title */}
      <div id="hero-section" ref={heroRef} className="campaign-hero animate-on-scroll">
        <div className="hero-content">
          <h1 className="campaign-title">
            <span className="title-gradient">amplify</span> 
            <span className="title-gradient">Plan</span> 
            <span className="title-gradient">(AI)</span>
          </h1>
          <div className="campaign-brief">
            <p>Your campaign insights and analytics</p>
          </div>
          {isActive && (
            <div className="active-badge">
              <span>ACTIVE</span>
            </div>
          )}
        </div>
        <div className="hero-decoration">
          <div className="hero-circle"></div>
          <div className="hero-wave"></div>
        </div>
      </div>

      {/* Ephemeral images notice */}
      {showImageNotice && (
        <div className="image-notice">
          <div className="notice-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#FFA726" strokeWidth="2"/>
              <path d="M12 8V12" stroke="#FFA726" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="#FFA726"/>
            </svg>
          </div>
          <p>
            If you like the generated images and want to save them, please
            Right Click on the image and save them to your local device, as they will disappear after 2–3 hours.
          </p>
          <button 
            onClick={() => setShowImageNotice(false)}
            className="notice-button"
          >
            Got it
          </button>
        </div>
      )}

      {/* Top metrics */}
      <div id="metrics-section" ref={metricsRef} className="metrics-section animate-on-scroll">
        <div className="metric-card">
          <div className="metric-icon">
            <svg className="icon-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L12 12M22 2H17M22 2V7" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 19C22 19.5523 21.5523 20 21 20H3C2.44772 20 2 19.5523 2 19V5C2 4.44772 2.44772 4 3 4H10" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 14V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 16V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 18V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 17V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>Total Calendar Events</h3>
          <div className="metric-value-container">
            <p className="metric-value">{totalEvents}</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <svg className="icon-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#1DA1F2" strokeWidth="2"/>
              <circle cx="12" cy="12" r="6" stroke="#1DA1F2" strokeWidth="2"/>
              <circle cx="12" cy="12" r="2" stroke="#1DA1F2" strokeWidth="2"/>
            </svg>
          </div>
          <h3>Bingo Suggestions</h3>
          <div className="metric-value-container">
            <p className="metric-value">{bingoSuggestions.length}</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <svg className="icon-pulse" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#0A66C2"/>
              <path d="M12 17a1 1 0 100-2 1 1 0 000 2z" fill="#0A66C2"/>
              <path d="M12 14c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1z" fill="#0A66C2"/>
            </svg>
          </div>
          <h3>Advice Tips</h3>
          <div className="metric-value-container">
            <p className="metric-value">{moreAdvice.length}</p>
          </div>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">
            <svg className={`icon-pulse ${isActive ? 'active' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke={isActive ? "#4CAF50" : "#FF7D00"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke={isActive ? "#4CAF50" : "#FF7D00"} strokeWidth="2"/>
            </svg>
          </div>
          <h3>Status</h3>
          <div className="metric-value-container">
            <p className="metric-value status-value">{campaign.status || 'Draft'}</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div id="calendar-section" ref={calendarRef} className="calendar-section animate-on-scroll">
        <div className="section-header">
          <div className="section-title-group">
            <div className="section-icon calendar-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#FF7D00" strokeWidth="2"/>
                <path d="M3 10H21" stroke="#FF7D00" strokeWidth="2"/>
                <path d="M16 2L16 6" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
                <path d="M8 2L8 6" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <h2>Campaign Calendar</h2>
          </div>
          <div className="section-divider"></div>
        </div>
        
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="month-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <h3>
              {new Date(currentYear, currentMonth).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <button onClick={handleNextMonth} className="month-btn">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          <div className="weekday-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="weekday-cell">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {/* Empty cells for days of the week before the 1st of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="calendar-day empty"></div>
            ))}
            
            {/* Actual days of the month */}
            {Array.from({ length: daysInMonth }).map((_, idx) => {
              const day = idx + 1;
              const dayEvents = getEventsForDay(day);
              const { bgColor, fontColor } = computeDayBg(dayEvents);
              const isSelected = selectedDay === day;

              return (
                <div
                  key={day}
                  className={`calendar-day ${dayEvents.length > 0 ? 'has-event' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{ background: bgColor, color: fontColor }}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="day-number">{day}</span>
                  {dayEvents.length === 1 && (
                    <div className="event-title">
                      {dayEvents[0].event || 'No Title'}
                    </div>
                  )}
                  {dayEvents.length > 1 && (
                    <div className="event-title">
                      {dayEvents.length} events
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day Details */}
      {selectedDayEvents.length > 0 && (
        <div className="day-details">
          <div className="section-header">
            <div className="section-title-group">
              <div className="section-icon details-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="#0A66C2" strokeWidth="2"/>
                  <path d="M7 9H17" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 12H17" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M7 15H13" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h2>Day Details</h2>
            </div>
            <div className="section-divider"></div>
          </div>
          <div className="day-events-container">
            {selectedDayEvents.map((ev, i) => {
              const ctaVal =
                typeof ev.cta === 'object' ? JSON.stringify(ev.cta) : ev.cta;
              const captionsVal =
                Array.isArray(ev.captions)
                  ? ev.captions.join(', ')
                  : typeof ev.captions === 'object'
                  ? JSON.stringify(ev.captions)
                  : ev.captions;
              const kpisVal =
                Array.isArray(ev.kpis)
                  ? ev.kpis.join(', ')
                  : typeof ev.kpis === 'object'
                  ? JSON.stringify(ev.kpis)
                  : ev.kpis;

              // Determine platform color for the card
              const platformColor = ev.platforms && ev.platforms.length > 0
                ? platformColors[ev.platforms[0]] || platformColors.Default
                : platformColors.Default;

              return (
                <div 
                  key={i} 
                  className="day-event-card"
                  style={{ borderLeft: `4px solid ${platformColor}` }}
                >
                  <div className="event-date-header" style={{ background: `linear-gradient(to right, ${platformColor}20, transparent)` }}>
                    <h4>{ev.date}</h4>
                  </div>
                  <div className="event-content">
                    <p>
                      <strong>Event/Content:</strong> {ev.event || 'No event text'}
                    </p>
                    {Array.isArray(ev.platforms) && ev.platforms.length > 0 && (
                      <p>
                        <strong>Platforms:</strong>
                        <div className="platform-tags">
                          {ev.platforms.map(platform => (
                            <span 
                              key={platform} 
                              className="platform-tag"
                              style={{ background: platformColors[platform] || platformColors.Default }}
                            >
                              {platform}
                            </span>
                          ))}
                        </div>
                      </p>
                    )}
                    {ev.cta && (
                      <p>
                        <strong>CTA:</strong> {ctaVal}
                      </p>
                    )}
                    {ev.captions && (
                      <p>
                        <strong>Captions:</strong> {captionsVal}
                      </p>
                    )}
                    {ev.kpis && ev.kpis.length > 0 && (
                      <p>
                        <strong>KPIs:</strong> {kpisVal}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bingo Suggestions */}
      <div id="bingo-section" ref={bingoRef} className="bingo-section animate-on-scroll">
        <div className="section-header">
          <div className="section-title-group">
            <div className="section-icon">🎯</div>
            <h2>Bingo Suggestions</h2>
          </div>
          <div className="section-divider"></div>
        </div>
        
        {!bingoSuggestions.length ? (
          <p className="empty-state">No suggestions found.</p>
        ) : (
          <div className="bingo-cards">
            {bingoSuggestions.map((bingo, i) => {
              const suggestionVal =
                typeof bingo.suggestion === 'object'
                  ? JSON.stringify(bingo.suggestion)
                  : bingo.suggestion || 'No suggestion';
              const strategyVal =
                typeof bingo.strategy === 'object'
                  ? JSON.stringify(bingo.strategy)
                  : bingo.strategy || 'No strategy';
              return (
                <div 
                  key={i} 
                  className="bingo-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {bingo.imageUrl ? (
                    <div className="bingo-image-container">
                      <img
                        src={bingo.imageUrl}
                        alt={suggestionVal}
                        className="bingo-card-image"
                        loading="lazy"
                      />
                      <div className="image-overlay">
                        <div className="overlay-text">{suggestionVal}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="bingo-image-container placeholder">
                      <div className="placeholder-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 13V19M18 16H13M12 21H6C4.89543 21 4 20.1046 4 19V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V12" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 16.5L7 14L10 16.5" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.5 9C8.5 9.82843 7.82843 10.5 7 10.5C6.17157 10.5 5.5 9.82843 5.5 9C5.5 8.17157 6.17157 7.5 7 7.5C7.82843 7.5 8.5 8.17157 8.5 9Z" stroke="#FF7D00" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="overlay-text">{suggestionVal}</div>
                    </div>
                  )}
                  <div className="bingo-card-content">
                    <h3>{suggestionVal}</h3>
                    <p>{strategyVal}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* More Advice */}
      <div id="advice-section" ref={adviceRef} className="advice-section animate-on-scroll">
        <div className="section-header">
          <div className="section-title-group">
            <div className="section-icon">💡</div>
            <h2>Additional Advice</h2>
          </div>
          <div className="section-divider"></div>
        </div>
        
        {!moreAdvice.length ? (
          <p className="empty-state">No additional advice found.</p>
        ) : (
          <div className="advice-list">
            {moreAdvice.map((advice, i) => {
              // Attempt to parse advice if it's a JSON string
              let adviceData = null;

              if (typeof advice === 'string') {
                try {
                  adviceData = JSON.parse(advice);
                } catch {
                  // Not valid JSON, ignore
                }
              } else if (typeof advice === 'object') {
                adviceData = advice;
              }

              // If we have valid JSON/object with a title or description
              if (
                adviceData &&
                typeof adviceData === 'object' &&
                (adviceData.title || adviceData.description)
              ) {
                return (
                  <div 
                    key={i} 
                    className="advice-item"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="advice-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0A66C2" strokeWidth="2"/>
                        <path d="M12 8V12L14 14" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="advice-content">
                      <h4>{adviceData.title || 'Untitled Advice'}</h4>
                      <p>{adviceData.description || 'No description provided.'}</p>
                    </div>
                  </div>
                );
              } else {
                // Fallback: show as plain text or stringified
                return (
                  <div 
                    key={i} 
                    className="advice-item"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="advice-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0A66C2" strokeWidth="2"/>
                        <path d="M12 8V12L14 14" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="advice-content">
                      <h4>Note</h4>
                      <p>
                        {typeof advice === 'object'
                          ? JSON.stringify(advice)
                          : advice}
                      </p>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Connect with Influencers Section */}
      <div id="influencers-section" ref={adviceRef} className="influencers-section animate-on-scroll">
        <div className="section-header">
          <div className="section-title-group">
            <div className="section-icon">👥</div>
            <h2>Connect with Influencers</h2>
          </div>
          <div className="section-divider"></div>
        </div>
        
        <div className="influencers-carousel">
          <div className="influencer-card">
            <div className="influencer-profile">
              <div className="influencer-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#1DA1F2" strokeWidth="2"/>
                  <path d="M20 19C20 16.2386 16.4183 14 12 14C7.58172 14 4 16.2386 4 19" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="influencer-header">
                <h3>Connect with Miks</h3>
              </div>
            </div>
            <div className="influencer-content">
              <div className="influencer-stats">
                <div className="stat-item">
                  <span className="stat-value">15.3k</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">9.22%</span>
                  <span className="stat-label">Engagement</span>
                </div>
              </div>
              <p>Miks (@bodybymiks) has 15.3k followers on Instagram with 9.22% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-button">Connect Now</button>
            </div>
          </div>
          
          <div className="influencer-card">
            <div className="influencer-profile">
              <div className="influencer-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#1DA1F2" strokeWidth="2"/>
                  <path d="M20 19C20 16.2386 16.4183 14 12 14C7.58172 14 4 16.2386 4 19" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="influencer-header">
                <h3>Connect with Andréa Zoe</h3>
              </div>
            </div>
            <div className="influencer-content">
              <div className="influencer-stats">
                <div className="stat-item">
                  <span className="stat-value">13.9k</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">8%</span>
                  <span className="stat-label">Engagement</span>
                </div>
              </div>
              <p>Andréa Zoe (@andreasinfluencingyou) has 13.9k followers on Instagram with 8% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-button">Connect Now</button>
            </div>
          </div>
          
          <div className="influencer-card">
            <div className="influencer-profile">
              <div className="influencer-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#1DA1F2" strokeWidth="2"/>
                  <path d="M20 19C20 16.2386 16.4183 14 12 14C7.58172 14 4 16.2386 4 19" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="influencer-header">
                <h3>Connect with Abibat</h3>
              </div>
            </div>
            <div className="influencer-content">
              <div className="influencer-stats">
                <div className="stat-item">
                  <span className="stat-value">43k</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">6%</span>
                  <span className="stat-label">Engagement</span>
                </div>
              </div>
              <p>Abibat (Natural Hair) (@abs.tract_) has 43k followers on Instagram with 6% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-button">Connect Now</button>
            </div>
          </div>
          
          <div className="influencer-card">
            <div className="influencer-profile">
              <div className="influencer-avatar">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8" r="4" stroke="#1DA1F2" strokeWidth="2"/>
                  <path d="M20 19C20 16.2386 16.4183 14 12 14C7.58172 14 4 16.2386 4 19" stroke="#1DA1F2" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="influencer-header">
                <h3>Connect with Milly Mason</h3>
              </div>
            </div>
            <div className="influencer-content">
              <div className="influencer-stats">
                <div className="stat-item">
                  <span className="stat-value">19k</span>
                  <span className="stat-label">Followers</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">6%</span>
                  <span className="stat-label">Engagement</span>
                </div>
              </div>
              <p>Milly Mason (@millymason_) has 19k followers on Instagram with 6% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-button">Connect Now</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div id="action-section" ref={actionsRef} className="action-buttons animate-on-scroll">
        {!isActive && (
          <button 
            onClick={handleActivateCampaign} 
            className="activate-button"
          >
            <div className="button-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Activate Campaign</span>
          </button>
        )}
        <button 
          onClick={handleDelete} 
          className="delete-button"
        >
          <div className="button-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Delete Campaign</span>
        </button>
        <button 
          onClick={handleFindInfluencers} 
          className="find-button"
        >
          <div className="button-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Find Influencers</span>
        </button>
      </div>
    </div>
  );
}

export default CampaignResults;