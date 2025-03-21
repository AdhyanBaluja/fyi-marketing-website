import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignResults.css';

// Colors for single platforms
const platformColors = {
  Instagram: '#E1306C',
  Facebook: '#4267B2',
  Twitter: '#1DA1F2',
  LinkedIn: '#0A66C2',
  YouTube: '#FF0000',
  TikTok: '#EE1D52',
  Default: '#ffa726',
};

// Use environment variable for API base URL, fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function CampaignResults() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Calendar state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [selectedDayEvents, setSelectedDayEvents] = useState([]);

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
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDayEvents([]);
  };

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const calendarEvents = campaign?.calendarEvents || [];

  const getEventsForDay = (day) => {
    const dateString = new Date(currentYear, currentMonth, day)
      .toISOString()
      .split('T')[0];
    return calendarEvents.filter((ev) => ev.date?.startsWith(dateString));
  };

  const handleDayClick = (day) => {
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
      setErrorMsg('Failed to activate campaign. Please try again.');
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
      setErrorMsg('Failed to delete campaign. Please try again.');
    }
  };

  const handleFindInfluencers = () => {
    navigate('/find-influencer');
  };

  if (loading) {
    return <p>Loading campaign results...</p>;
  }
  if (errorMsg) {
    return <p className="error-message">{errorMsg}</p>;
  }
  if (!campaign) {
    return <p>No campaign found.</p>;
  }

  const totalEvents = calendarEvents.length;
  const isActive = campaign.status === 'Active';

  // Helper to compute background for a given day cell
  const computeDayBg = (dayEvents) => {
    if (dayEvents.length === 0) {
      return { bgColor: 'rgba(255,255,255,0.2)', fontColor: '#333' };
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
      bgColor: platformColors.Default,
      fontColor: '#fff',
    };
  };

  return (
    <div className="campaign-results-container">
      {/* Ephemeral images notice */}
      {showImageNotice && (
        <div
          className="image-notice"
          style={{
            background: '#FFECD1',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <p style={{ marginBottom: '0.5rem' }}>
            If you like the generated images and want to save them, please
            Right Click on the image and save them to your local device, as they will disappear after 2–3 hours.
          </p>
          <button
            onClick={() => setShowImageNotice(false)}
            style={{
              background: '#FF7D00',
              color: '#FFECD1',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            OK
          </button>
        </div>
      )}

      {/* Top metrics */}
      <div className="metrics-section fade-in-down">
        <div className="metric-card hover-scale">
          <h3>Total Calendar Events</h3>
          <p className="metric-value">{totalEvents}</p>
        </div>
        <div className="metric-card hover-scale">
          <h3>Bingo Suggestions</h3>
          <p className="metric-value">{bingoSuggestions.length}</p>
        </div>
        <div className="metric-card hover-scale">
          <h3>Advice Tips</h3>
          <p className="metric-value">{moreAdvice.length}</p>
        </div>
        <div className="metric-card hover-scale">
          <h3>Status</h3>
          <p className="metric-value">{campaign.status || 'Draft'}</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="calendar-section bounce-in">
        <div className="calendar-header">
          <button onClick={handlePrevMonth} className="month-btn">
            &lt;
          </button>
          <h3>
            {new Date(currentYear, currentMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <button onClick={handleNextMonth} className="month-btn">
            &gt;
          </button>
        </div>

        <div className="calendar-grid">
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const day = idx + 1;
            const dayEvents = getEventsForDay(day);
            const { bgColor, fontColor } = computeDayBg(dayEvents);

            return (
              <div
                key={day}
                className={`calendar-day ${dayEvents.length > 0 ? 'has-event' : ''}`}
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

      {/* Day Details */}
      {selectedDayEvents.length > 0 && (
        <div className="day-details fade-in-up">
          <h2>Day Details</h2>
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

            return (
              <div key={i} className="day-event-card">
                <h4>{ev.date}</h4>
                <p>
                  <strong>Event/Content:</strong> {ev.event || 'No event text'}
                </p>
                {Array.isArray(ev.platforms) && ev.platforms.length > 0 && (
                  <p>
                    <strong>Platforms:</strong> {ev.platforms.join(', ')}
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
            );
          })}
        </div>
      )}

      {/* Bingo Suggestions */}
      <div className="bingo-section fade-in">
        <h2 className="section-title">Bingo Suggestions</h2>
        {!bingoSuggestions.length ? (
          <p>No suggestions found.</p>
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
                <div key={i} className="bingo-card hover-rise">
                  {bingo.imageUrl ? (
                    <img
                      src={bingo.imageUrl}
                      alt={suggestionVal}
                      className="bingo-card-image"
                    />
                  ) : (
                    <img
                      src="https://via.placeholder.com/300x150.png?text=No+Image"
                      alt="Placeholder"
                      className="bingo-card-image"
                    />
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
      <div className="more-advice-section fade-in-up">
        <h2 className="section-title">Additional Advice</h2>
        {!moreAdvice.length ? (
          <p>No additional advice found.</p>
        ) : (
          <ul className="advice-list">
            {moreAdvice.map((advice, i) => (
              <li key={i} style={{ marginBottom: '0.5rem' }}>
                {typeof advice === 'object' ? JSON.stringify(advice) : advice}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Action Buttons */}
      <div className="action-buttons" style={{ marginTop: '2rem' }}>
        {!isActive && (
          <button onClick={handleActivateCampaign} className="add-button">
            Activate Campaign
          </button>
        )}
        <button onClick={handleDelete} className="delete-button">
          Delete Campaign
        </button>
        <button onClick={handleFindInfluencers} className="find-button">
          Find Influencers
        </button>
      </div>
    </div>
  );
}

export default CampaignResults;
