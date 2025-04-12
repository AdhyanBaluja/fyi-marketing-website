import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './SimplifiedCampaignResults.css';
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

function SimplifiedCampaignResults() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  
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

  const handleActivateCampaign = async () => {
    if (!campaign?._id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${API_BASE_URL}/api/campaigns/${campaign._id}`,
        { status: 'Active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCampaign(campaign._id);
    } catch (err) {
      console.error('Error activating campaign:', err);
      alert('Failed to activate campaign. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!campaign?._id) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/campaigns/${campaign._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/brand/dashboard');
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleFindInfluencers = () => {
    navigate('/find-influencer');
  };

  if (loading) {
    return (
      <div className="campaign-results-container simple-background">
        <NavBar />
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading campaign results...</p>
        </div>
      </div>
    );
  }
  
  if (errorMsg) {
    return (
      <div className="campaign-results-container simple-background">
        <NavBar />
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <p className="error-message">{errorMsg}</p>
          <button 
            className="action-button primary-button"
            onClick={() => fetchCampaign(campaignId)}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="campaign-results-container simple-background">
        <NavBar />
        <div className="error-state">
          <p>No campaign found.</p>
          <button 
            className="action-button primary-button"
            onClick={() => navigate('/create-campaign')}
          >
            Create a New Campaign
          </button>
        </div>
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
    if (dayEvents.length >= 2) {
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
      
      {/* Hero Section with Campaign Title */}
      <div className="campaign-hero">
        <h1 className="campaign-title">
          <span className="highlight">amplify</span> Plan (AI)
        </h1>
        <p className="campaign-description">Your campaign insights and analytics</p>
        {isActive && (
          <div className="status-badge active">ACTIVE</div>
        )}
      </div>

      {/* Ephemeral images notice */}
      {showImageNotice && (
        <div className="notice-box">
          <div className="notice-icon">ℹ️</div>
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
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <h3>Total Calendar Events</h3>
          <p className="metric-value">{totalEvents}</p>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">🎯</div>
          <h3>Bingo Suggestions</h3>
          <p className="metric-value">{bingoSuggestions.length}</p>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">💡</div>
          <h3>Advice Tips</h3>
          <p className="metric-value">{moreAdvice.length}</p>
        </div>
        
        <div className="metric-card">
          <div className="metric-icon">{isActive ? '✅' : '🔄'}</div>
          <h3>Status</h3>
          <p className="metric-value">{campaign.status || 'Draft'}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="section-container">
        <div className="section-header">
          <h2>Campaign Calendar</h2>
        </div>
        
        <div className="calendar-container">
          <div className="calendar-header">
            <button onClick={handlePrevMonth} className="month-navigate-btn">
              &lt;
            </button>
            <h3>
              {new Date(currentYear, currentMonth).toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </h3>
            <button onClick={handleNextMonth} className="month-navigate-btn">
              &gt;
            </button>
          </div>

          <div className="calendar-weekdays">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="weekday-cell">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
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
        <div className="section-container">
          <div className="section-header">
            <h2>Day Details</h2>
          </div>
          <div className="event-cards-grid">
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
                  className="event-card"
                  style={{ borderLeft: `4px solid ${platformColor}` }}
                >
                  <div className="event-date">
                    <h4>{ev.date}</h4>
                  </div>
                  <div className="event-details">
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
      <div className="section-container">
        <div className="section-header">
          <h2>🎯 Bingo Suggestions</h2>
        </div>
        
        {!bingoSuggestions.length ? (
          <p className="empty-message">No suggestions found.</p>
        ) : (
          <div className="bingo-cards-grid">
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
                >
                  {bingo.imageUrl ? (
                    <div className="bingo-image">
                      <img
                        src={bingo.imageUrl}
                        alt={suggestionVal}
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="bingo-image placeholder">
                      <div className="placeholder-icon">📷</div>
                    </div>
                  )}
                  <div className="bingo-content">
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
      <div className="section-container">
        <div className="section-header">
          <h2>💡 Additional Advice</h2>
        </div>
        
        {!moreAdvice.length ? (
          <p className="empty-message">No additional advice found.</p>
        ) : (
          <div className="advice-cards-grid">
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
                    className="advice-card"
                  >
                    <div className="advice-icon">🔍</div>
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
                    className="advice-card"
                  >
                    <div className="advice-icon">📝</div>
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
      <div className="section-container">
        <div className="section-header">
          <h2>👥 Connect with Influencers</h2>
        </div>
        
        <div className="influencer-cards-grid">
          <div className="influencer-card">
            <div className="influencer-header">
              <h3>Connect with Miks</h3>
            </div>
            <div className="influencer-content">
              <p>Miks (@bodybymiks) has 15.3k followers on Instagram with 9.22% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
          
          <div className="influencer-card">
            <div className="influencer-header">
              <h3>Connect with Andréa Zoe</h3>
            </div>
            <div className="influencer-content">
              <p>Andréa Zoe (@andreasinfluencingyou) has 13.9k followers on Instagram with 8% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
          
          <div className="influencer-card">
            <div className="influencer-header">
              <h3>Connect with Abibat</h3>
            </div>
            <div className="influencer-content">
              <p>Abibat (Natural Hair) (@abs.tract_) has 43k followers on Instagram with 6% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
          
          <div className="influencer-card">
            <div className="influencer-header">
              <h3>Connect with Milly Mason</h3>
            </div>
            <div className="influencer-content">
              <p>Milly Mason (@millymason_) has 19k followers on Instagram with 6% engagement. Consider collaborating for your campaign.</p>
              <button className="connect-btn">Connect</button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons-container">
        {!isActive && (
          <button 
            onClick={handleActivateCampaign} 
            className="action-button activate-button"
          >
            Activate Campaign
          </button>
        )}
        <button 
          onClick={handleDelete} 
          className="action-button delete-button"
        >
          Delete Campaign
        </button>
        <button 
          onClick={handleFindInfluencers} 
          className="action-button find-button"
        >
          Find Influencers
        </button>
      </div>
    </div>
  );
}

export default SimplifiedCampaignResults;