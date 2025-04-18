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
  
  // Refs for scroll animations
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
      const options = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fy-appear');
          }
        });
      }, options);
      
      const sections = [metricsRef, calendarRef, bingoRef, adviceRef, actionsRef];
      sections.forEach(section => {
        if (section.current) {
          observer.observe(section.current);
        }
      });
      
      return () => {
        sections.forEach(section => {
          if (section.current) {
            observer.unobserve(section.current);
          }
        });
      };
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

  // Add this function right after your existing useEffect hooks in the CampaignResults component
// Around line 82-83 after the existing useEffects

// Add this new useEffect for enabling image downloads
useEffect(() => {
  if (!loading && campaign) {
    // Function to enable right-clicks on images
    const enableImageDownloads = () => {
      // Find all image elements
      const images = document.querySelectorAll('.fy-bingo-card-image');
      
      // For each image, ensure right-clicks work
      images.forEach(img => {
        img.addEventListener('contextmenu', (e) => {
          // Allow the default right-click menu
          e.stopPropagation();
        });
        
        // Remove any other click handlers that might interfere
        img.addEventListener('click', (e) => {
          e.stopPropagation();
        });
      });
    };
    
    // Call the function
    enableImageDownloads();
    
    // Set a small timeout to ensure images are loaded
    const imageLoadTimeout = setTimeout(() => {
      enableImageDownloads();
    }, 1000);
    
    // Cleanup
    return () => {
      clearTimeout(imageLoadTimeout);
    };
  }
}, [loading, campaign]);

// The rest of your component continues as before...

// Add this function to implement click-to-expand functionality for images
// Place this with your other useEffect hooks

useEffect(() => {
  if (!loading && campaign) {
    // Function to enable expanding images on click
    const enableImageExpand = () => {
      // Find all image elements
      const images = document.querySelectorAll('.fy-bingo-card-image');
      
      // For each image, add click handler to expand/collapse
      images.forEach(img => {
        img.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Toggle expanded class
          img.classList.toggle('expanded');
          
          // If expanded, add click handler to document to close on click outside
          if (img.classList.contains('expanded')) {
            document.addEventListener('click', function closeExpandedImage(e) {
              if (e.target !== img) {
                img.classList.remove('expanded');
                document.removeEventListener('click', closeExpandedImage);
              }
            });
            
            // Also close on ESC key
            document.addEventListener('keydown', function handleEsc(e) {
              if (e.key === 'Escape') {
                img.classList.remove('expanded');
                document.removeEventListener('keydown', handleEsc);
              }
            });
          }
        });
      });
    };
    
    // Call the function once images should be loaded
    const imageLoadTimeout = setTimeout(() => {
      enableImageExpand();
    }, 1000);
    
    // Cleanup
    return () => {
      clearTimeout(imageLoadTimeout);
    };
  }
}, [loading, campaign]);


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
      <div className="fy-loading-container">
        <div className="fy-pulse-loader">
          <div className="fy-pulse-circle"></div>
          <div className="fy-pulse-circle"></div>
          <div className="fy-pulse-circle"></div>
        </div>
        <div className="fy-loading-text">
          <span>L</span>
          <span>o</span>
          <span>a</span>
          <span>d</span>
          <span>i</span>
          <span>n</span>
          <span>g</span>
          <span>.</span>
          <span>.</span>
          <span>.</span>
        </div>
      </div>
    );
  }
  
  if (errorMsg) {
    return (
      <div className="fy-error-container">
        <div className="fy-error-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="#f44336" strokeWidth="2"/>
            <path d="M12 7V13" stroke="#f44336" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="12" cy="16" r="1" fill="#f44336"/>
          </svg>
        </div>
        <p className="fy-error-message">{errorMsg}</p>
        <button 
          className="fy-retry-button"
          onClick={() => fetchCampaign(campaignId)}
        >
          Try Again
        </button>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="fy-no-campaign-container">
        <div className="fy-empty-state-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2>No campaign found.</h2>
        <button 
          className="fy-create-campaign-button"
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
    <div className="fy-campaign-results-container">
      <NavBar />
      
      {/* Toast Notification */}
      <div className={`fy-toast-notification ${showNotification ? 'show' : ''} ${notificationType}`}>
        <div className="fy-toast-content">
          <div className="fy-toast-icon">
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
          <span className="fy-toast-message">{notificationMessage}</span>
        </div>
      </div>

      {/* Hero Section with Campaign Title */}
      <div className="fy-campaign-hero">
        <div className="fy-hero-background">
          <div className="fy-hero-wave"></div>
          <div className="fy-hero-glow"></div>
        </div>
        <div className="fy-hero-content">
          <h1 className="fy-campaign-title">
            <span className="fy-title-word">amplify</span> 
            <span className="fy-title-word">Plan</span> 
            <span className="fy-title-word">(AI)</span>
          </h1>
          <div className="fy-campaign-brief">
            <p>{campaign.description || 'Your campaign insights and analytics'}</p>
          </div>
          {isActive && (
            <div className="fy-active-badge">
              <span>ACTIVE</span>
            </div>
          )}
        </div>
      </div>

      {/* Ephemeral images notice */}
      {showImageNotice && (
        <div className="fy-image-notice">
          <div className="fy-notice-icon">
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
            className="fy-notice-button"
          >
            Got it
          </button>
        </div>
      )}

      {/* Top metrics */}
      <div className="fy-metrics-section fy-scroll-section" ref={metricsRef}>
        <div className="fy-metric-card">
          <div className="fy-metric-icon">
            <svg className="fy-icon-rocket" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 2L12 12M22 2H17M22 2V7" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 19C22 19.5523 21.5523 20 21 20H3C2.44772 20 2 19.5523 2 19V5C2 4.44772 2.44772 4 3 4H10" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 14V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 16V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 18V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 17V20" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h3>Total Calendar Events</h3>
          <div className="fy-metric-value-container">
            <p className="fy-metric-value">{totalEvents}</p>
          </div>
        </div>
        
        <div className="fy-metric-card">
          <div className="fy-metric-icon">
            <svg className="fy-icon-target" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#1DA1F2" strokeWidth="2"/>
              <circle cx="12" cy="12" r="6" stroke="#1DA1F2" strokeWidth="2"/>
              <circle cx="12" cy="12" r="2" stroke="#1DA1F2" strokeWidth="2"/>
            </svg>
          </div>
          <h3>Bingo Suggestions</h3>
          <div className="fy-metric-value-container">
            <p className="fy-metric-value">{bingoSuggestions.length}</p>
          </div>
        </div>
        
        <div className="fy-metric-card">
          <div className="fy-metric-icon">
            <svg className="fy-icon-advice" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#0A66C2"/>
              <path d="M12 17a1 1 0 100-2 1 1 0 000 2z" fill="#0A66C2"/>
              <path d="M12 14c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1z" fill="#0A66C2"/>
            </svg>
          </div>
          <h3>Advice Tips</h3>
          <div className="fy-metric-value-container">
            <p className="fy-metric-value">{moreAdvice.length}</p>
          </div>
        </div>
        
        <div className="fy-metric-card">
          <div className="fy-metric-icon">
            <svg className={`fy-icon-status ${isActive ? 'active' : ''}`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12L11 14L15 10" stroke={isActive ? "#4CAF50" : "#FF7D00"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="12" r="10" stroke={isActive ? "#4CAF50" : "#FF7D00"} strokeWidth="2"/>
            </svg>
          </div>
          <h3>Status</h3>
          <div className="fy-metric-value-container">
            <p className="fy-metric-value fy-status-value">{campaign.status || 'Draft'}</p>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="fy-calendar-section fy-scroll-section" ref={calendarRef}>
        <div className="fy-section-header">
          <h2>Campaign Calendar</h2>
          <div className="fy-section-divider"></div>
        </div>
        
        <div className="fy-calendar-container">
          <div className="fy-calendar-header">
            <button onClick={handlePrevMonth} className="fy-month-btn">
              &lt;
            </button>
            <h3>
              {new Date(currentYear, currentMonth).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <button onClick={handleNextMonth} className="fy-month-btn">
              &gt;
            </button>
          </div>

          <div className="fy-weekday-header">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="fy-weekday-cell">{day}</div>
            ))}
          </div>

          <div className="fy-calendar-grid">
            {/* Empty cells for days of the week before the 1st of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, idx) => (
              <div key={`empty-${idx}`} className="fy-calendar-day empty"></div>
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
                  className={`fy-calendar-day ${dayEvents.length > 0 ? 'has-event' : ''} ${isSelected ? 'selected' : ''}`}
                  style={{ background: bgColor, color: fontColor }}
                  onClick={() => handleDayClick(day)}
                >
                  <span className="fy-day-number">{day}</span>
                  {dayEvents.length === 1 && (
                    <div className="fy-event-title">
                      {dayEvents[0].event || 'No Title'}
                    </div>
                  )}
                  {dayEvents.length > 1 && (
                    <div className="fy-event-title">
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
        <div className="fy-day-details">
          <div className="fy-section-header">
            <h2>Day Details</h2>
            <div className="fy-section-divider"></div>
          </div>
          <div className="fy-day-events-container">
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
                  className="fy-day-event-card"
                  style={{ borderLeft: `4px solid ${platformColor}` }}
                >
                  <div className="fy-event-date-header" style={{ background: `linear-gradient(to right, ${platformColor}20, transparent)` }}>
                    <h4>{ev.date}</h4>
                  </div>
                  <div className="fy-event-content">
                    <p>
                      <strong>Event/Content:</strong> {ev.event || 'No event text'}
                    </p>
                    {Array.isArray(ev.platforms) && ev.platforms.length > 0 && (
                      <p>
                        <strong>Platforms:</strong>
                        <div className="fy-platform-tags">
                          {ev.platforms.map(platform => (
                            <span 
                              key={platform} 
                              className="fy-platform-tag"
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
      <div className="fy-bingo-section fy-scroll-section" ref={bingoRef}>
        <div className="fy-section-header">
          <div className="fy-section-icon">🎯</div>
          <h2>Bingo Suggestions</h2>
          <div className="fy-section-divider"></div>
        </div>
        
        {!bingoSuggestions.length ? (
          <p className="fy-empty-state">No suggestions found.</p>
        ) : (
          <div className="fy-bingo-cards">
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
                  className="fy-bingo-card"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {bingo.imageUrl ? (
                    <div className="fy-bingo-image-container">
                      <img
                        src={bingo.imageUrl}
                        alt={suggestionVal}
                        className="fy-bingo-card-image"
                        loading="lazy"
                      />
                      <div className="fy-image-overlay">
                        <div className="fy-overlay-text">{suggestionVal}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="fy-bingo-image-container placeholder">
                      <div className="fy-placeholder-icon">
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 13V19M18 16H13M12 21H6C4.89543 21 4 20.1046 4 19V5C4 3.89543 4.89543 3 6 3H18C19.1046 3 20 3.89543 20 5V12" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4 16.5L7 14L10 16.5" stroke="#FF7D00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M8.5 9C8.5 9.82843 7.82843 10.5 7 10.5C6.17157 10.5 5.5 9.82843 5.5 9C5.5 8.17157 6.17157 7.5 7 7.5C7.82843 7.5 8.5 8.17157 8.5 9Z" stroke="#FF7D00" strokeWidth="2"/>
                        </svg>
                      </div>
                      <div className="fy-overlay-text">{suggestionVal}</div>
                    </div>
                  )}
                  <div className="fy-bingo-card-content">
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
      <div className="fy-more-advice-section fy-scroll-section" ref={adviceRef}>
        <div className="fy-section-header">
          <div className="fy-section-icon">💡</div>
          <h2>Additional Advice</h2>
          <div className="fy-section-divider"></div>
        </div>
        
        {!moreAdvice.length ? (
          <p className="fy-empty-state">No additional advice found.</p>
        ) : (
          <div className="fy-advice-list">
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
                    className="fy-advice-item"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="fy-advice-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0A66C2" strokeWidth="2"/>
                        <path d="M12 8V12L14 14" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="fy-advice-content">
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
                    className="fy-advice-item"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    <div className="fy-advice-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#0A66C2" strokeWidth="2"/>
                        <path d="M12 8V12L14 14" stroke="#0A66C2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="fy-advice-content">
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


      {/* Action Buttons */}
      <div className="fy-action-buttons fy-scroll-section" ref={actionsRef}>
        {!isActive && (
          <button 
            onClick={handleActivateCampaign} 
            className="fy-activate-button"
          >
            <div className="fy-button-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span>Activate Campaign</span>
          </button>
        )}
        <button 
          onClick={handleDelete} 
          className="fy-delete-button"
        >
          <div className="fy-button-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span>Delete Campaign</span>
        </button>
        <button 
          onClick={handleFindInfluencers} 
          className="fy-find-button"
        >
          <div className="fy-button-icon">
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