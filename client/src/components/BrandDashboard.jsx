// src/components/BrandDashboard.jsx

import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BrandDashboard.css';

function BrandDashboard() {
  const navigate = useNavigate();
  const campaignsRef = useRef(null);

  const [campaigns, setCampaigns] = useState([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(true);

  // Stats from /api/brand/dashboard
  const [totalCampaigns, setTotalCampaigns] = useState(0);
  const [activeCampaigns, setActiveCampaigns] = useState(0);
  const [draftPaused, setDraftPaused] = useState(0);

  // Requests counts
  const [activeRequests, setActiveRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // We'll store the full list of requests for the UI
  const [requestsByCampaign, setRequestsByCampaign] = useState([]);

  // The user's membership plan
  const [membershipPlan, setMembershipPlan] = useState('Free');

  // We'll store aggregated events for brand's active campaigns
  const [allActiveEvents, setAllActiveEvents] = useState([]);

  // For the brand-level calendar
  const now = new Date();
  const [calendarMonth, setCalendarMonth] = useState(now.getMonth());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());
  const [selectedCalendarEvents, setSelectedCalendarEvents] = useState([]);

  // For joined influencers
  const [joinedInfluencers, setJoinedInfluencers] = useState([]);

  // For "Influencer Applications" => those with status='applied'
  const [influencerApplications, setInfluencerApplications] = useState([]);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token || !userId) {
      navigate('/signin');
      return;
    }
    fetchUserPlan();
    fetchBrandDashboardData();
    fetchBrandRequests();
    fetchAllActiveEvents();
    fetchJoinedInfluencers();
    // eslint-disable-next-line
  }, []);

  // 1) membership plan
  const fetchUserPlan = async () => {
    try {
      const res = await axios.get(`http://localhost:4000/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMembershipPlan(res.data.user.membershipPlan || 'Free');
    } catch (error) {
      console.error('Error fetching user plan:', error);
    }
  };

  // 2) brand dashboard
  const fetchBrandDashboardData = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await axios.get('http://localhost:4000/api/brand/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      setTotalCampaigns(data.totalCampaigns || 0);
      setActiveCampaigns(data.activeCampaigns || 0);
      setDraftPaused(data.draftPaused || 0);
      setCampaigns(data.campaigns || []);
    } catch (error) {
      console.error('Error fetching brand dashboard:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  // 3) brand requests => to find "applied" influencer requests
  const fetchBrandRequests = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/brand/requests', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data;
      if (data && data.requestsByCampaign) {
        setRequestsByCampaign(data.requestsByCampaign);

        let toCount = 0;
        let fromCount = 0;
        const appList = [];

        data.requestsByCampaign.forEach((camp) => {
          const campaignTitle = camp.campaignName || camp.name || 'Untitled';

          const toInf = camp.requestsToInfluencers || [];
          const fromInf = camp.requestsFromInfluencers || [];

          // brand->influencer invites => status=pending
          toCount += toInf.filter(r => r.status === 'pending').length;

          // influencer->brand apps => status=applied
          const applied = fromInf.filter(r => r.status === 'applied');
          fromCount += applied.length;

          applied.forEach((r) => {
            appList.push({
              requestId: r._id,
              campaignName: campaignTitle,
              influencer: r.influencerId?.name || 'Unknown',
              influencerId: r.influencerId?._id,
              status: r.status
            });
          });
        });

        setActiveRequests(toCount);
        setPendingRequests(fromCount);
        setInfluencerApplications(appList);
      }
    } catch (error) {
      console.error('Error fetching brand requests:', error);
    }
  };

  // 4) brand active events
  const fetchAllActiveEvents = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/brand/active-events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllActiveEvents(response.data.events || []);
    } catch (error) {
      console.error('Error fetching all active events:', error);
    }
  };

  // 5) joined influencers
  const fetchJoinedInfluencers = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/brand/joinedInfluencers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJoinedInfluencers(response.data.campaigns || []);
    } catch (error) {
      console.error('Error fetching joined influencers:', error);
    }
  };

  // Nav actions
  const handleScrollToCampaigns = () => {
    campaignsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  const handleDashboardClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const handleStartCampaignClick = () => {
    if (membershipPlan === 'Free') {
      alert('AI Campaign Builder is locked. Please upgrade to Premium or Pro.');
      return;
    }
    navigate('/brand/campaign-builder');
  };
  const handleFindInfluencersClick = () => {
    navigate('/find-influencer');
  };
  const handleHelpClick = () => {};
  const handleLogoutClick = () => {
    localStorage.clear();
    navigate('/signin');
  };

  // Clicking on a campaign => detail
  const handleCampaignClick = (campaignId) => {
    navigate(`/campaign-detail/${campaignId}`);
  };

  // Update campaign status
  const handleUpdateStatus = async (campaignId, newStatus) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/brand/campaigns/${campaignId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBrandDashboardData();
      fetchAllActiveEvents();
    } catch (err) {
      console.error('Error updating campaign status:', err);
      alert('Failed to update campaign status. Please try again.');
    }
  };

  // Delete a campaign
  const handleDeleteCampaign = async (campaignId) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return;
    }
    try {
      await axios.delete(
        `http://localhost:4000/api/brand/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBrandDashboardData();
      fetchAllActiveEvents();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  // Accept influencer request => brand route /api/brand/requests/:requestId/accept
  const handleAcceptInfluencerRequest = async (requestId) => {
    try {
      await axios.patch(
        `http://localhost:4000/api/brand/requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Request accepted successfully!');
      fetchBrandRequests();
      fetchJoinedInfluencers();
    } catch (err) {
      console.error('Error accepting influencer request:', err);
      alert('Failed to accept request. Please try again.');
    }
  };

  // REMOVE influencer from a campaign => brand route /api/brand/campaigns/:campaignId/influencers/:influencerId
  const handleRemoveInfluencer = async (campaignId, influencerId) => {
    const confirmed = window.confirm('Are you sure you want to remove this influencer?');
    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:4000/api/brand/campaigns/${campaignId}/influencers/${influencerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Influencer removed from the campaign successfully!');
      // Refresh the joined influencer list
      fetchJoinedInfluencers();
    } catch (err) {
      console.error('Error removing influencer:', err);
      alert('Failed to remove influencer. Please try again.');
    }
  };

  // PLATFORM COLORS for calendar
  const platformColors = {
    instagram: '#FFC0CC',
    facebook: '#AFC2FF',
    twitter: '#A0E2FF',
    youtube: '#FFB0B0',
    linkedin: '#A5CCE8',
    tiktok: '#CFCFCF',
    snapchat: '#FFF66E',
    reddit: '#FFBA9E',
    twitch: '#C8ACFF',
    default: '#CCCCCC'
  };

  const getDayStyle = (dayEvents) => {
    let platformSet = new Set();
    dayEvents.forEach((ev) => {
      if (ev.platforms) {
        if (Array.isArray(ev.platforms)) {
          ev.platforms.forEach((pf) => platformSet.add(pf.toLowerCase()));
        } else {
          platformSet.add(String(ev.platforms).toLowerCase());
        }
      }
    });

    if (platformSet.size === 0) {
      return {
        backgroundColor: '#B7D4D2',
        color: '#001524'
      };
    }

    const uniquePlatforms = Array.from(platformSet);
    const colors = uniquePlatforms.map((pf) => platformColors[pf] || platformColors.default);

    if (colors.length === 1) {
      return {
        backgroundColor: colors[0],
        color: '#333'
      };
    } else {
      const step = 100 / (colors.length - 1);
      const gradientParts = colors.map((clr, idx) => `${clr} ${Math.round(step * idx)}%`);
      const gradientStr = `linear-gradient(135deg, ${gradientParts.join(', ')})`;
      return {
        background: gradientStr,
        color: '#333'
      };
    }
  };

  // Calendar logic
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
    setSelectedCalendarEvents([]);
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
    setSelectedCalendarEvents([]);
  };

  const getEventsForDay = (day) => {
    const dateString = new Date(calendarYear, calendarMonth, day)
      .toISOString()
      .split('T')[0];
    return allActiveEvents.filter((ev) => ev.date?.startsWith(dateString));
  };

  const handleDayClick = (day) => {
    const dayEvents = getEventsForDay(day);
    setSelectedCalendarEvents(dayEvents);
  };

  return (
    <div className="brand-dashboard-container">
      {/* NAVBAR */}
      <nav className="brand-nav">
        <div className="brand-logo">BrandPortal</div>
        <ul className="nav-links">
          <li onClick={handleDashboardClick}>Dashboard</li>
          <li onClick={handleStartCampaignClick}>Start a Campaign</li>
          <li onClick={handleScrollToCampaigns}>Your Campaigns</li>
          <li onClick={handleFindInfluencersClick}>Find Influencers</li>
          <li onClick={handleHelpClick}>Help</li>
          <li onClick={handleLogoutClick}>Logout</li>
        </ul>
      </nav>

      {/* Header with AI button */}
      <header className="brand-dash-header fade-in-down">
        <h1>Your Brand Dashboard</h1>
        {membershipPlan === 'Free' ? (
          <button
            className="ai-campaign-btn disabled-btn"
            onClick={() => alert('AI Campaign Builder is locked. Please upgrade your plan.')}
          >
            Campaign Builder (AI) - Locked
          </button>
        ) : (
          <button className="ai-campaign-btn" onClick={() => navigate('/brand/campaign-builder')}>
            Campaign Builder (AI) for You
          </button>
        )}
      </header>

      {/* Stats / progress area */}
      <section className="stats-section fade-in-up">
        <div className="stats-card hover-scale">
          <h3>Total Campaigns</h3>
          <p>{totalCampaigns}</p>
        </div>
        <div className="stats-card hover-scale">
          <h3>Active Campaigns</h3>
          <p>{activeCampaigns}</p>
        </div>
        <div className="stats-card hover-scale">
          <h3>Draft/Paused</h3>
          <p>{draftPaused}</p>
        </div>
      </section>

      {/* Additional "Requests" columns */}
      <section className="requests-section fade-in-up">
        <div className="requests-card hover-scale">
          <h3>Active Requests Sent</h3>
          <p>{activeRequests}</p>
        </div>
        <div className="requests-card hover-scale">
          <h3>Pending Requests (From Influencers)</h3>
          <p>{pendingRequests}</p>
        </div>
      </section>

      {/* Influencer Applications Section (always visible) */}
      <section className="applications-section fade-in-up">
        <h2>Influencer Applications</h2>
        {influencerApplications.length === 0 ? (
          <p>No influencer applications at the moment.</p>
        ) : (
          <div className="applications-container">
            {influencerApplications.map((app) => (
              <div className="application-card" key={app.requestId}>
                <h3>{app.campaignName}</h3>
                <p>
                  <strong>Influencer:</strong> {app.influencer}
                </p>
                <p>Status: {app.status}</p>
                <button
                  onClick={() => handleAcceptInfluencerRequest(app.requestId)}
                  className="accept-btn"
                >
                  Accept
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Campaigns Section */}
      <section id="allCampaigns" className="campaigns-section bounce-in" ref={campaignsRef}>
        <h2>All Campaigns</h2>
        {loadingCampaigns ? (
          <p>Loading campaigns...</p>
        ) : campaigns.length === 0 ? (
          <p>No campaigns found</p>
        ) : (
          <table className="campaigns-table">
            <thead>
              <tr>
                <th>Campaign Name</th>
                
                
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c._id}>
                  <td onClick={() => handleCampaignClick(c._id)} style={{ cursor: 'pointer' }}>
                    {c.name}
                  </td>
                
                  
                  <td>{c.status}</td>
                  <td>
                    <select
                      className="status-select"
                      value={c.status}
                      onChange={(e) => handleUpdateStatus(c._id, e.target.value)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Active">Active</option>
                      <option value="Paused">Paused</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteCampaign(c._id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* BRAND-LEVEL CALENDAR => All Active Campaign Events */}
      <section className="calendar-section fade-in-up">
        <h2>All Active Campaign Events</h2>
        <div className="calendar-controls">
          <button className="arrow-btn prev-arrow" onClick={handlePrevMonth}>
            &lt;
          </button>
          <h3>
            {new Date(calendarYear, calendarMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <button className="arrow-btn next-arrow" onClick={handleNextMonth}>
            &gt;
          </button>
        </div>
        <div className="calendar-grid">
          {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }).map(
            (_, idx) => {
              const day = idx + 1;
              const dayEvents = getEventsForDay(day);
              const styleForDay = getDayStyle(dayEvents);

              return (
                <div
                  key={day}
                  className="calendar-day"
                  style={styleForDay}
                  onClick={() => setSelectedCalendarEvents(dayEvents)}
                >
                  <span className="day-number">{day}</span>
                  {dayEvents.length > 1 && (
                    <div className="event-title">{dayEvents.length} events</div>
                  )}
                  {dayEvents.length === 1 && (
                    <div className="event-title">
                      {dayEvents[0].event || 'No Title'}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
        {selectedCalendarEvents && selectedCalendarEvents.length > 0 && (
          <div className="day-details">
            <h3>Day Details</h3>
            {selectedCalendarEvents.map((ev, i) => {
              let platformsStr = '';
              if (ev.platforms) {
                if (Array.isArray(ev.platforms)) {
                  platformsStr = ev.platforms.join(', ');
                } else {
                  platformsStr = String(ev.platforms);
                }
              }
              let kpisStr = '';
              if (ev.kpis) {
                if (Array.isArray(ev.kpis)) {
                  kpisStr = ev.kpis.join(', ');
                } else {
                  kpisStr = String(ev.kpis);
                }
              }

              return (
                <div key={i} className="day-event-card">
                  <p><strong>Date:</strong> {ev.date}</p>
                  <p><strong>Event:</strong> {ev.event || 'No event'}</p>
                  {ev.platforms && <p><strong>Platforms:</strong> {platformsStr}</p>}
                  {ev.campaignName && <p><strong>Campaign:</strong> {ev.campaignName}</p>}
                  {ev.cta && <p><strong>CTA:</strong> {ev.cta}</p>}
                  {ev.captions && <p><strong>Captions:</strong> {ev.captions}</p>}
                  {ev.kpis && <p><strong>KPIs:</strong> {kpisStr}</p>}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Joined Influencers Section */}
      <section className="influencer-requests-section fade-in-up">
        <h2>Joined Influencers For Each Campaign</h2>
        {joinedInfluencers.map((camp) => (
          <div key={camp.campaignId} className="joined-influencers-card">
            <h3>{camp.campaignName}</h3>
            {camp.joinedInfluencers.length === 0 ? (
              <p>No joined influencers yet.</p>
            ) : (
              <div className="joined-influencers-list">
                {camp.joinedInfluencers.map((inf, idx) => (
                  <div key={idx} className="joined-influencer-item improved-item">
                    <img
                      src={inf.profileImage || 'https://via.placeholder.com/40'}
                      alt={inf.name}
                      className="influencer-avatar"
                    />
                    <div className="inf-details">
                      <p className="inf-name">{inf.name}</p>
                      <span className="join-source">({inf.source})</span>
                    </div>
                    {/* REMOVE influencer button */}
                    <button
                      className="remove-influencer-btn"
                      onClick={() => handleRemoveInfluencer(camp.campaignId, inf.influencerId)}
                      style={{ marginLeft: '10px', color: 'red', cursor: 'pointer' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}

export default BrandDashboard;
