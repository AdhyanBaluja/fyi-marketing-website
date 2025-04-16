import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BrandDashboard.css';

// Use environment variable for API base URL, fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function BrandDashboard() {
  const navigate = useNavigate();
  const campaignsRef = useRef(null);

  // Theme state
  const [currentTheme, setCurrentTheme] = useState('midnight'); // Default theme
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [animatedBackground, setAnimatedBackground] = useState(true);

  // Animation states
  const [pageLoaded, setPageLoaded] = useState(false);
  const [hoverCards, setHoverCards] = useState({});

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

  // For showing welcome animation
  const [showWelcome, setShowWelcome] = useState(true);
  
  // For notifications panel
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New influencer application received!', time: '2 hours ago', read: false },
    { id: 2, text: 'Campaign "Summer Launch" is trending!', time: '1 day ago', read: false },
    { id: 3, text: '@influencer_123 completed their task', time: '2 days ago', read: true }
  ]);

  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Theme definitions
  const themes = {
    midnight: {
      name: 'Midnight Ocean',
      icon: '🌊',
      description: 'Deep blues with orange accents'
    },
    sunset: {
      name: 'Sunset Vibes',
      icon: '🌅',
      description: 'Warm oranges and purples'
    },
    forest: {
      name: 'Forest Emerald',
      icon: '🌲',
      description: 'Rich greens with earthy tones'
    },
    cosmic: {
      name: 'Cosmic Purple',
      icon: '🔮',
      description: 'Deep purples with neon accents'
    },
    desert: {
      name: 'Desert Gold',
      icon: '🏜️',
      description: 'Sandy golds with rustic accents'
    }
  };

  useEffect(() => {
    // Apply theme to document
    document.body.className = `theme-${currentTheme}`;
    return () => {
      document.body.className = '';
    };
  }, [currentTheme]);

  useEffect(() => {
    // Show welcome animation for 3 seconds then fade out
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Mark page as loaded after short delay to trigger animations
    const timer = setTimeout(() => {
      setPageLoaded(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

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
      const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/brand/dashboard`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/brand/requests`, {
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
          toCount += toInf.filter((r) => r.status === 'pending').length;

          // influencer->brand apps => status=applied
          const applied = fromInf.filter((r) => r.status === 'applied');
          fromCount += applied.length;

          applied.forEach((r) => {
            appList.push({
              requestId: r._id,
              campaignName: campaignTitle,
              influencer: r.influencerId?.name || 'Unknown',
              influencerId: r.influencerId?._id,
              status: r.status,
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
      const response = await axios.get(`${API_BASE_URL}/api/brand/active-events`, {
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
      const response = await axios.get(`${API_BASE_URL}/api/brand/joinedInfluencers`, {
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
      openModal('upgradeModal');
      return;
    }
    navigate('/brand/campaign-builder');
  };

  const handleFindInfluencersClick = () => {
    navigate('/find-influencer');
  };

  const handleBuyPlanClick = () => {
    navigate('/plans');
  };

  const handleHelpClick = () => {
    // Implement help dialog or redirect here
    openModal('helpModal');
  };

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
        `${API_BASE_URL}/api/brand/campaigns/${campaignId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchBrandDashboardData();
      fetchAllActiveEvents();
      showToast(`Campaign status updated to ${newStatus}`);
    } catch (err) {
      console.error('Error updating campaign status:', err);
      showToast('Failed to update campaign status', 'error');
    }
  };

  // Delete a campaign
  const handleDeleteCampaign = async (campaignId) => {
    openModal('deleteModal', { campaignId });
  };

  const confirmDeleteCampaign = async (campaignId) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/brand/campaigns/${campaignId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchBrandDashboardData();
      fetchAllActiveEvents();
      showToast('Campaign deleted successfully');
      closeModal();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      showToast('Failed to delete campaign', 'error');
    }
  };

  // Accept influencer request => brand route /api/brand/requests/:requestId/accept
  const handleAcceptInfluencerRequest = async (requestId) => {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/brand/requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Request accepted successfully!');
      fetchBrandRequests();
      fetchJoinedInfluencers();
    } catch (err) {
      console.error('Error accepting influencer request:', err);
      showToast('Failed to accept request', 'error');
    }
  };

  // REMOVE influencer from a campaign => brand route /api/brand/campaigns/:campaignId/influencers/:influencerId
  const handleRemoveInfluencer = async (campaignId, influencerId) => {
    openModal('removeInfluencerModal', { campaignId, influencerId });
  };

  const confirmRemoveInfluencer = async (campaignId, influencerId) => {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/brand/campaigns/${campaignId}/influencers/${influencerId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Influencer removed successfully');
      // Refresh the joined influencer list
      fetchJoinedInfluencers();
      closeModal();
    } catch (err) {
      console.error('Error removing influencer:', err);
      showToast('Failed to remove influencer', 'error');
    }
  };

  // PLATFORM COLORS for calendar
  const platformColors = {
    instagram: '#008080',   // Teal
    facebook:  '#007070',    // Darker teal
    twitter:   '#006666',    // Even darker teal
    youtube:   '#FF8C00',    // Dark orange
    linkedin:  '#009688',    // Teal variant
    tiktok:    '#FF7F00',    // Bright orange
    snapchat:  '#FFA726',    // Orange variant
    reddit:    '#FF7043',    // Warm orange
    twitch:    '#008B8B',    // Teal variant
    default:   '#004d40',    // Dark teal fallback
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

    // Default style for calendar days with no events - cream color
    if (platformSet.size === 0) {
      return {
        backgroundColor: 'var(--color-calendar-empty)',
        color: 'var(--color-text-dark)',
      };
    }

    const uniquePlatforms = Array.from(platformSet);
    const colors = uniquePlatforms.map((pf) => platformColors[pf] || platformColors.default);

    if (colors.length === 1) {
      return {
        backgroundColor: colors[0],
        color: 'var(--color-text-light)',
      };
    } else {
      const step = 100 / (colors.length - 1);
      const gradientParts = colors.map((clr, idx) => `${clr} ${Math.round(step * idx)}%`);
      const gradientStr = `linear-gradient(135deg, ${gradientParts.join(', ')})`;
      return {
        background: gradientStr,
        color: 'var(--color-text-light)',
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
    const dateString = new Date(calendarYear, calendarMonth, day).toISOString().split('T')[0];
    return allActiveEvents.filter((ev) => ev.date?.startsWith(dateString));
  };

  // Modal functionality
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    data: {}
  });

  const openModal = (type, data = {}) => {
    setModalState({
      isOpen: true,
      type,
      data
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: null,
      data: {}
    });
  };

  // Toast notification
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });

  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
    
    setTimeout(() => {
      setToast(prev => ({...prev, visible: false}));
    }, 3000);
  };

  // Handle card hover effects
  const handleCardHover = (id, isHovering) => {
    setHoverCards(prev => ({
      ...prev,
      [id]: isHovering
    }));
  };

  // Handle theme selection
  const toggleThemeSelector = () => {
    setShowThemeSelector(prev => !prev);
  };

  const selectTheme = (theme) => {
    setCurrentTheme(theme);
    setShowThemeSelector(false);
    showToast(`Theme changed to ${themes[theme].name}`);
    
    // Save theme preference to localStorage
    localStorage.setItem('preferred-theme', theme);
  };

  // Toggle notifications panel
  const toggleNotifications = () => {
    setShowNotifications(prev => !prev);
    
    // Mark all as read when opening
    if (!showNotifications) {
      setNotifications(prev => 
        prev.map(notif => ({...notif, read: true}))
      );
    }
  };

  // Toggle animated background
  const toggleAnimatedBackground = () => {
    setAnimatedBackground(prev => !prev);
  };

  // Calculate unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`brand-dashboard-container theme-${currentTheme} ${animatedBackground ? 'animated-bg' : ''}`}>
      {/* Welcome animation overlay */}
      {showWelcome && (
        <div className="welcome-overlay">
          <div className="welcome-logo pulse-animation">
            <span className="welcome-brand">Brand</span>
            <span className="welcome-portal">Portal</span>
          </div>
          <div className="welcome-tagline">Your campaign success starts here</div>
        </div>
      )}
      
      {/* Theme selector floating button */}
      <div className="theme-selector-container">
        <button 
          className={`theme-toggle-btn ${showThemeSelector ? 'active' : ''}`} 
          onClick={toggleThemeSelector}
          aria-label="Change theme"
        >
          <span className="theme-icon">{themes[currentTheme].icon}</span>
        </button>
        
        {showThemeSelector && (
          <div className="theme-options-panel">
            <h3>Select Theme</h3>
            <div className="theme-options-grid">
              {Object.entries(themes).map(([key, theme]) => (
                <div 
                  key={key} 
                  className={`theme-option ${currentTheme === key ? 'active' : ''}`}
                  onClick={() => selectTheme(key)}
                >
                  <div className="theme-icon-large">{theme.icon}</div>
                  <div className="theme-name">{theme.name}</div>
                </div>
              ))}
            </div>
            <div className="theme-controls">
              <label className="toggle-label">
                <input 
                  type="checkbox" 
                  checked={animatedBackground} 
                  onChange={toggleAnimatedBackground}
                />
                <span className="toggle-text">Animated Background</span>
              </label>
            </div>
          </div>
        )}
      </div>
      
      {/* Notification button & panel */}
      <div className="notification-container">
        <button 
          className="notification-btn" 
          onClick={toggleNotifications}
          aria-label="Notifications"
        >
          <div className="notification-icon">🔔</div>
          {unreadCount > 0 && (
            <div className="notification-badge">{unreadCount}</div>
          )}
        </button>
        
        {showNotifications && (
          <div className="notifications-panel">
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
              <p className="empty-notifications">No notifications</p>
            ) : (
              <div className="notification-list">
                {notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  >
                    <p className="notification-text">{notif.text}</p>
                    <p className="notification-time">{notif.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Toast notification */}
      {toast.visible && (
        <div className={`toast-notification ${toast.type}`}>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}

      {/* NAVBAR */}
      <nav className="brand-nav">
        <div className="brand-logo">
          <span className="brand-logo-text">Brand<span className="brand-logo-highlight">Portal</span></span>
          <div className="brand-logo-glint"></div>
        </div>
        <ul className="nav-links">
          <li onClick={handleDashboardClick} className="nav-item">
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </li>
          <li onClick={handleStartCampaignClick} className="nav-item create-campaign">
            <span className="nav-icon">🚀</span>
            <span className="nav-text">Start a Campaign</span>
            {membershipPlan === 'Free' && <span className="nav-lock">🔒</span>}
          </li>
          <li onClick={handleScrollToCampaigns} className="nav-item">
            <span className="nav-icon">📝</span>
            <span className="nav-text">Your Campaigns</span>
          </li>
          <li onClick={handleFindInfluencersClick} className="nav-item">
            <span className="nav-icon">🔍</span>
            <span className="nav-text">Find Influencers</span>
          </li>
          <li onClick={handleBuyPlanClick} className="nav-item">
            <span className="nav-icon">💎</span>
            <span className="nav-text">Buy Plan</span>
          </li>
          <li onClick={handleHelpClick} className="nav-item">
            <span className="nav-icon">❓</span>
            <span className="nav-text">Help</span>
          </li>
          <li onClick={handleLogoutClick} className="nav-item">
            <span className="nav-icon">🚪</span>
            <span className="nav-text">Logout</span>
          </li>
        </ul>
      </nav>

      {/* Header with AI button */}
      <header className={`brand-dash-header ${pageLoaded ? 'fade-in-down' : ''}`}>
        <div className="header-content">
          <h1>Your Brand Dashboard</h1>
          <p className="header-subtitle">Welcome to your command center</p>
        </div>
        {membershipPlan === 'Free' ? (
          <button
            className="ai-campaign-btn disabled-btn"
            onClick={() => openModal('upgradeModal')}
          >
            <span className="btn-icon-lock">🔒</span>
            <span>Campaign Builder (AI) - Locked</span>
          </button>
        ) : (
          <button className="ai-campaign-btn" onClick={() => navigate('/brand/campaign-builder')}>
            <span className="btn-icon">✨</span>
            <span>Campaign Builder (AI)</span>
          </button>
        )}
      </header>

      {/* Membership status */}
      <div className={`membership-banner ${membershipPlan.toLowerCase()}-plan ${pageLoaded ? 'fade-in' : ''}`}>
        <div className="membership-icon">{membershipPlan === 'Pro' ? '⭐' : membershipPlan === 'Premium' ? '💎' : '🔄'}</div>
        <div className="membership-info">
          <span className="membership-label">Current Plan:</span>
          <span className="membership-value">{membershipPlan}</span>
        </div>
        {membershipPlan === 'Free' && (
          <button className="upgrade-btn" onClick={handleBuyPlanClick}>
            Upgrade Now
          </button>
        )}
      </div>

      {/* Stats / progress area */}
      <section className={`stats-section ${pageLoaded ? 'fade-in-up' : ''}`}>
        <div 
          className={`stats-card ${hoverCards['total-campaigns'] ? 'hover-active' : ''}`}
          onMouseEnter={() => handleCardHover('total-campaigns', true)}
          onMouseLeave={() => handleCardHover('total-campaigns', false)}
        >
          <div className="stats-icon">📊</div>
          <h3>Total Campaigns</h3>
          <p className="stats-value">{totalCampaigns}</p>
          <div className="stats-glow"></div>
        </div>
        <div 
          className={`stats-card ${hoverCards['active-campaigns'] ? 'hover-active' : ''}`}
          onMouseEnter={() => handleCardHover('active-campaigns', true)}
          onMouseLeave={() => handleCardHover('active-campaigns', false)}
        >
          <div className="stats-icon">🚀</div>
          <h3>Active Campaigns</h3>
          <p className="stats-value">{activeCampaigns}</p>
          <div className="stats-glow"></div>
        </div>
        <div 
          className={`stats-card ${hoverCards['draft-campaigns'] ? 'hover-active' : ''}`}
          onMouseEnter={() => handleCardHover('draft-campaigns', true)}
          onMouseLeave={() => handleCardHover('draft-campaigns', false)}
        >
          <div className="stats-icon">📝</div>
          <h3>Draft/Paused</h3>
          <p className="stats-value">{draftPaused}</p>
          <div className="stats-glow"></div>
        </div>
      </section>

      {/* Additional "Requests" columns */}
      <section className={`requests-section ${pageLoaded ? 'fade-in-up-delay' : ''}`}>
        <div 
          className={`requests-card ${hoverCards['active-requests'] ? 'hover-active' : ''}`}
          onMouseEnter={() => handleCardHover('active-requests', true)}
          onMouseLeave={() => handleCardHover('active-requests', false)}
        >
          <div className="requests-icon">📤</div>
          <h3>Active Requests Sent</h3>
          <p className="stats-value">{activeRequests}</p>
          <div className="card-shine"></div>
        </div>
        <div 
          className={`requests-card ${hoverCards['pending-requests'] ? 'hover-active' : ''}`}
          onMouseEnter={() => handleCardHover('pending-requests', true)}
          onMouseLeave={() => handleCardHover('pending-requests', false)}
        >
          <div className="requests-icon">📥</div>
          <h3>Pending Requests (From Influencers)</h3>
          <p className="stats-value">{pendingRequests}</p>
          <div className="card-shine"></div>
        </div>
      </section>

      {/* Influencer Applications Section */}
      <section className={`applications-section ${pageLoaded ? 'fade-in-up-delay-2' : ''}`}>
        <div className="section-header">
          <h2><span className="section-icon">👋</span> Influencer Applications</h2>
          <div className="section-line"></div>
        </div>
        {influencerApplications.length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-state-icon">📭</div>
            <p className="empty-state-message">No influencer applications at the moment.</p>
            <button className="find-influencers-btn" onClick={handleFindInfluencersClick}>
              Find Influencers
            </button>
          </div>
        ) : (
          <div className="applications-container">
            {influencerApplications.map((app, index) => (
              <div 
                className={`application-card ${pageLoaded ? 'fade-in-slide slide-delay-' + index : ''}`} 
                key={app.requestId}
              >
                <div className="application-header">
                  <h3>{app.campaignName}</h3>
                  <div className="application-status">{app.status}</div>
                </div>
                <div className="application-body">
                  <p className="app-detail">
                    <span className="detail-icon">👤</span> <strong>Influencer:</strong> {app.influencer}
                  </p>
                </div>
                <div className="application-footer">
                  <button onClick={() => handleAcceptInfluencerRequest(app.requestId)} className="accept-btn">
                    <span className="btn-icon">✅</span> Accept
                  </button>
                  <button className="view-profile-btn">
                    <span className="btn-icon">👁️</span> View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Campaigns Section */}
      <section id="allCampaigns" className={`campaigns-section ${pageLoaded ? 'bounce-in' : ''}`} ref={campaignsRef}>
        <div className="section-header">
          <h2><span className="section-icon">📝</span> All Campaigns</h2>
          <div className="section-line"></div>
        </div>
        {loadingCampaigns ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-message">Loading your campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-state-icon">📂</div>
            <p className="empty-state-message">You haven't created any campaigns yet</p>
            <button 
              className="create-campaign-btn" 
              onClick={membershipPlan === 'Free' ? () => openModal('upgradeModal') : handleStartCampaignClick}
            >
              Create Your First Campaign
            </button>
          </div>
        ) : (
          <div className="campaigns-table-container">
            <table className="campaigns-table">
              <thead>
                <tr>
                  <th>Campaign Name</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c, index) => (
                  <tr key={c._id} className={`table-row ${pageLoaded ? 'fade-in-row row-delay-' + index : ''}`}>
                    <td 
                      onClick={() => handleCampaignClick(c._id)} 
                      className="campaign-name-cell"
                    >
                      {c.name}
                      <div className="cell-hover-effect"></div>
                    </td>
                    <td>
                      <div className={`status-pill status-${c.status.toLowerCase()}`}>
                        {c.status}
                      </div>
                    </td>
                    <td className="actions-cell">
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
                      <button className="delete-btn" onClick={() => handleDeleteCampaign(c._id)}>
                        <span className="btn-icon">🗑️</span> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* IMPROVED BRAND-LEVEL CALENDAR => All Active Campaign Events */}
      <section className={`calendar-section ${pageLoaded ? 'fade-in-up-delay-3' : ''}`}>
        <div className="section-header">
          <h2><span className="section-icon">📅</span> Campaign Calendar</h2>
          <div className="section-line"></div>
        </div>
        
        <div className="calendar-controls">
          <button 
            className="arrow-btn prev-arrow" 
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            <span className="arrow-icon">◀</span>
          </button>
          <h3 className="calendar-month-heading">
            {new Date(calendarYear, calendarMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <button 
            className="arrow-btn next-arrow" 
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            <span className="arrow-icon">▶</span>
          </button>
        </div>
        
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday-label">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {Array.from({
            length: new Date(calendarYear, calendarMonth, 1).getDay(),
          }).map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-day empty"></div>
          ))}
          
          {Array.from({
            length: daysInMonth,
          }).map((_, idx) => {
            const day = idx + 1;
            const dayEvents = getEventsForDay(day);
            const styleForDay = getDayStyle(dayEvents);
            const isToday = new Date().getDate() === day && 
                          new Date().getMonth() === calendarMonth && 
                          new Date().getFullYear() === calendarYear;

            return (
              <div
                key={day}
                className={`calendar-day ${dayEvents.length > 0 ? 'has-events' : ''} ${isToday ? 'today' : ''}`}
                style={styleForDay}
                onClick={() => setSelectedCalendarEvents(dayEvents)}
              >
                <span className="day-number">{day}</span>
                {dayEvents.length > 0 && (
                  <div className="event-indicator">
                    {dayEvents.length === 1 ? (
                      <div className="event-title-single">{dayEvents[0].event?.substring(0, 15) || 'Event'}</div>
                    ) : (
                      <div className="event-count">{dayEvents.length} events</div>
                    )}
                  </div>
                )}
                <div className="day-highlight"></div>
              </div>
            );
          })}
        </div>
        
        {selectedCalendarEvents.length > 0 && (
          <div className="day-details">
            <div className="day-details-header">
              <h3>Events for {new Date(calendarYear, calendarMonth, selectedCalendarEvents[0].date?.split('T')[0]?.split('-')[2]).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</h3>
              <button className="close-details" onClick={() => setSelectedCalendarEvents([])}>×</button>
            </div>
            <div className="day-events-grid">
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

                const platformIcons = {
                  instagram: '📸',
                  facebook: '👍',
                  twitter: '🐦',
                  youtube: '🎬',
                  linkedin: '💼',
                  tiktok: '🎵',
                  snapchat: '👻',
                  reddit: '🔍',
                  twitch: '🎮',
                };

                const platforms = platformsStr.split(',').map(p => p.trim().toLowerCase());
                
                return (
                  <div key={i} className={`day-event-card ${pageLoaded ? 'slide-in-right delay-' + i : ''}`}>
                    <div className="event-header">
                      <h4>{ev.event || 'Event'}</h4>
                      <span className="event-time">{ev.date?.split('T')[1]?.substring(0, 5) || 'All day'}</span>
                    </div>
                    <div className="event-body">
                      {platforms.length > 0 && (
                        <div className="event-platforms">
                          {platforms.map(platform => (
                            <div key={platform} className={`platform-badge platform-${platform}`}>
                              <span className="platform-icon">{platformIcons[platform] || '🌐'}</span>
                              <span className="platform-name">{platform}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {ev.campaignName && (
                        <p className="event-detail">
                          <span className="detail-icon">📊</span>
                          <span className="detail-label">Campaign:</span>
                          <span className="detail-value">{ev.campaignName}</span>
                        </p>
                      )}
                      
                      {ev.cta && (
                        <p className="event-detail">
                          <span className="detail-icon">🎯</span>
                          <span className="detail-label">CTA:</span>
                          <span className="detail-value">{ev.cta}</span>
                        </p>
                      )}
                      
                      {ev.captions && (
                        <p className="event-detail">
                          <span className="detail-icon">💬</span>
                          <span className="detail-label">Caption:</span>
                          <span className="detail-value caption-text">{ev.captions}</span>
                        </p>
                      )}
                      
                      {ev.kpis && (
                        <p className="event-detail">
                          <span className="detail-icon">📈</span>
                          <span className="detail-label">KPIs:</span>
                          <span className="detail-value">{kpisStr}</span>
                        </p>
                      )}
                    </div>
                    <div className="event-actions">
                      <button className="event-action-btn edit-btn">
                        <span className="btn-icon">✏️</span> Edit
                      </button>
                      <button className="event-action-btn share-btn">
                        <span className="btn-icon">🔗</span> Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Joined Influencers Section */}
      <section className={`influencer-requests-section ${pageLoaded ? 'fade-in-up-delay-4' : ''}`}>
        <div className="section-header">
          <h2><span className="section-icon">🤝</span> Joined Influencers</h2>
          <div className="section-line"></div>
        </div>
        
        {joinedInfluencers.length === 0 ? (
          <div className="empty-state-container">
            <div className="empty-state-icon">👥</div>
            <p className="empty-state-message">No joined influencers yet</p>
            <button className="find-influencers-btn" onClick={handleFindInfluencersClick}>
              Find Influencers
            </button>
          </div>
        ) : (
          <div className="joined-influencers-container">
            {joinedInfluencers.map((camp, campIndex) => (
              <div 
                key={camp.campaignId} 
                className={`joined-influencers-card ${pageLoaded ? 'fade-in-scale scale-delay-' + campIndex : ''}`}
              >
                <div className="joined-card-header">
                  <h3>{camp.campaignName}</h3>
                  <div className="influencer-count">{camp.joinedInfluencers.length} influencers</div>
                </div>
                
                {camp.joinedInfluencers.length === 0 ? (
                  <p className="empty-state-message">No joined influencers yet.</p>
                ) : (
                  <div className="joined-influencers-list">
                    {camp.joinedInfluencers.map((inf, idx) => (
                      <div 
                        key={idx} 
                        className={`joined-influencer-item ${pageLoaded ? 'pop-in pop-delay-' + idx : ''}`}
                      >
                        <div className="influencer-avatar-container">
                          <img
                            src={inf.profileImage || 'https://via.placeholder.com/40'}
                            alt={inf.name}
                            className="influencer-avatar"
                          />
                          <div className="avatar-highlight"></div>
                        </div>
                        <div className="inf-details">
                          <p className="inf-name">{inf.name}</p>
                          <span className="join-source">({inf.source})</span>
                        </div>
                        
                        <div className="influencer-actions">
                          <button className="action-btn message-btn">
                            <span className="btn-icon">💬</span>
                          </button>
                          <button
                            className="action-btn remove-influencer-btn"
                            onClick={() => handleRemoveInfluencer(camp.campaignId, inf.influencerId)}
                          >
                            <span className="btn-icon">❌</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
      
      {/* Quick Actions floating button */}
      <div className="quick-actions-container">
        <button className="quick-actions-btn pulse-animation">
          <span className="quick-btn-icon">⚡</span>
        </button>
        <div className="quick-actions-menu">
          <button className="quick-action-item" onClick={handleStartCampaignClick}>
            <span className="quick-icon">🚀</span>
            <span>New Campaign</span>
          </button>
          <button className="quick-action-item" onClick={handleFindInfluencersClick}>
            <span className="quick-icon">🔍</span>
            <span>Find Influencers</span>
          </button>
          <button className="quick-action-item" onClick={handleBuyPlanClick}>
            <span className="quick-icon">💎</span>
            <span>Upgrade Plan</span>
          </button>
        </div>
      </div>
      
      {/* Animated background elements */}
      {animatedBackground && (
        <div className="background-animations">
          <div className="floating-shape shape-1"></div>
          <div className="floating-shape shape-2"></div>
          <div className="floating-shape shape-3"></div>
          <div className="floating-shape shape-4"></div>
          <div className="floating-shape shape-5"></div>
        </div>
      )}
      
      {/* Modals */}
      {modalState.isOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            {modalState.type === 'deleteModal' && (
              <div className="delete-modal">
                <div className="modal-header">
                  <h3><span className="modal-icon">⚠️</span> Delete Campaign</h3>
                  <button className="close-modal" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to delete this campaign? This action cannot be undone.</p>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                  <button 
                    className="confirm-delete-btn" 
                    onClick={() => confirmDeleteCampaign(modalState.data.campaignId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
            
            {modalState.type === 'removeInfluencerModal' && (
              <div className="remove-influencer-modal">
                <div className="modal-header">
                  <h3><span className="modal-icon">👤</span> Remove Influencer</h3>
                  <button className="close-modal" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <p>Are you sure you want to remove this influencer from your campaign?</p>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                  <button 
                    className="confirm-remove-btn" 
                    onClick={() => confirmRemoveInfluencer(
                      modalState.data.campaignId, 
                      modalState.data.influencerId
                    )}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
            
            {modalState.type === 'upgradeModal' && (
              <div className="upgrade-modal">
                <div className="modal-header">
                  <h3><span className="modal-icon">💎</span> Upgrade Your Plan</h3>
                  <button className="close-modal" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <div className="upgrade-content">
                    <div className="upgrade-icon-large">🚀</div>
                    <h4>Unlock Premium Features</h4>
                    <p>AI Campaign Builder is only available on Premium and Pro plans.</p>
                    <div className="features-list">
                      <div className="feature-item">
                        <span className="feature-icon">✅</span>
                        <span>AI-powered campaign creation</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✅</span>
                        <span>Advanced analytics dashboard</span>
                      </div>
                      <div className="feature-item">
                        <span className="feature-icon">✅</span>
                        <span>Priority influencer matching</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={closeModal}>Maybe Later</button>
                  <button className="upgrade-now-btn" onClick={() => {
                    closeModal();
                    handleBuyPlanClick();
                  }}>
                    Upgrade Now
                  </button>
                </div>
              </div>
            )}
            
            {modalState.type === 'helpModal' && (
              <div className="help-modal">
                <div className="modal-header">
                  <h3><span className="modal-icon">❓</span> Help Center</h3>
                  <button className="close-modal" onClick={closeModal}>×</button>
                </div>
                <div className="modal-body">
                  <div className="help-tabs">
                    <div className="help-tab active">Getting Started</div>
                    <div className="help-tab">Campaigns</div>
                    <div className="help-tab">Influencers</div>
                    <div className="help-tab">FAQ</div>
                  </div>
                  <div className="help-content">
                    <h4>Welcome to BrandPortal!</h4>
                    <p>Here are some quick tips to get started:</p>
                    <div className="help-items">
                      <div className="help-item">
                        <div className="help-item-number">1</div>
                        <div className="help-item-text">Create your first campaign using our AI Campaign Builder</div>
                      </div>
                      <div className="help-item">
                        <div className="help-item-number">2</div>
                        <div className="help-item-text">Find and connect with influencers who match your brand</div>
                      </div>
                      <div className="help-item">
                        <div className="help-item-number">3</div>
                        <div className="help-item-text">Schedule content and track performance</div>
                      </div>
                    </div>
                    <button className="watch-tutorial-btn">
                      <span className="btn-icon">▶️</span> Watch Tutorial
                    </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="contact-support-btn">Contact Support</button>
                  <button className="close-help-btn" onClick={closeModal}>Got It</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandDashboard;