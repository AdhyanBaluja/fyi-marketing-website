import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignResults.css'; // Changed to regular CSS
import NavBar from './NavBar';
import Lottie from 'react-lottie';
import { motion, AnimatePresence } from 'framer-motion';

// Import animations
import brandingAnimation from '../assets/animations/branding-lottie.json';
import confettiAnimation from '../assets/animations/confetti.json';
import rocketAnimation from '../assets/animations/rocket.json';
import successAnimation from '../assets/animations/success.json';
import loadingAnimation from '../assets/animations/loading.json';
import errorAnimation from '../assets/animations/error-icon.json';
import targetAnimation from '../assets/animations/target-audience.json';
import guidanceAnimation from '../assets/animations/guidance.json';

// Platform colors with enhanced palette
const platformColors = {
  Instagram: '#E1306C',
  Facebook: '#4267B2',
  Twitter: '#1DA1F2',
  LinkedIn: '#0A66C2',
  YouTube: '#FF0000',
  TikTok: '#EE1D52',
  Default: '#FF7D00', // Signature orange
};

// Animation variants for framer motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  }
};

const cardVariants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: 'spring', stiffness: 100 }
  },
  hover: {
    scale: 1.05,
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
    transition: { duration: 0.3 }
  }
};

// Use environment variable for API base URL, fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function CampaignResults() {
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

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

  // Animation options for Lottie
  const defaultLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });

  const successLottieOptions = {
    ...defaultLottieOptions(successAnimation),
    loop: false
  };

  useEffect(() => {
    if (!campaignId) {
      setErrorMsg('No campaign ID found in localStorage.');
      setLoading(false);
      return;
    }
    fetchCampaign(campaignId);
    
    // Set animation complete after 2 seconds
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 2000);
    
    return () => clearTimeout(timer);
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
      setActivationSuccess(true);
      setTimeout(() => {
        setActivationSuccess(false);
        fetchCampaign(campaign._id);
      }, 2500);
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
    return (
      <div className="loading-container">
        <Lottie 
          options={defaultLottieOptions(loadingAnimation)}
          height={200}
          width={200}
        />
        <h2 className="loading-text">Loading your campaign insights...</h2>
      </div>
    );
  }
  
  if (errorMsg) {
    return (
      <div className="error-container">
        <Lottie 
          options={defaultLottieOptions(errorAnimation)}
          height={150}
          width={150}
        />
        <p className="error-message">{errorMsg}</p>
        <motion.button 
          className="retry-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => fetchCampaign(campaignId)}
        >
          Try Again
        </motion.button>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="no-campaign-container">
        <h2>No campaign found.</h2>
        <motion.button 
          className="create-campaign-button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/create-campaign')}
        >
          Create a New Campaign
        </motion.button>
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

      {activationSuccess && (
        <div className="activation-success-overlay">
          <Lottie 
            options={successLottieOptions}
            height={300}
            width={300}
          />
          <h2>Campaign Activated!</h2>
        </div>
      )}

      {/* Hero Section with Campaign Title */}
      <motion.div 
        className="campaign-hero"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="campaign-title">{campaign.name || 'Amplify Plan (AI)'}</h1>
        <div className="campaign-brief">
          <p>{campaign.description || 'Your campaign insights and analytics'}</p>
        </div>
        {isActive && (
          <div className="active-badge">
            <span>ACTIVE</span>
          </div>
        )}
      </motion.div>

      {/* Ephemeral images notice */}
      <AnimatePresence>
        {showImageNotice && (
          <motion.div 
            className="image-notice"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="notice-icon">
              <Lottie 
                options={defaultLottieOptions(brandingAnimation)}
                height={60}
                width={60}
              />
            </div>
            <p>
              If you like the generated images and want to save them, please
              Right Click on the image and save them to your local device, as they will disappear after 2–3 hours.
            </p>
            <motion.button
              onClick={() => setShowImageNotice(false)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="notice-button"
            >
              Got it
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top metrics */}
      <motion.div 
        className="metrics-section"
        variants={containerVariants}
        initial="hidden"
        animate={animationComplete ? "visible" : "hidden"}
      >
        <motion.div className="metric-card" variants={cardVariants} whileHover="hover">
          <div className="metric-icon">
            <Lottie 
              options={defaultLottieOptions(rocketAnimation)}
              height={50}
              width={50}
            />
          </div>
          <h3>Total Calendar Events</h3>
          <p className="metric-value">{totalEvents}</p>
        </motion.div>
        
        <motion.div className="metric-card" variants={cardVariants} whileHover="hover">
          <div className="metric-icon">
            <Lottie 
              options={defaultLottieOptions(targetAnimation)}
              height={50}
              width={50}
            />
          </div>
          <h3>Bingo Suggestions</h3>
          <p className="metric-value">{bingoSuggestions.length}</p>
        </motion.div>
        
        <motion.div className="metric-card" variants={cardVariants} whileHover="hover">
          <div className="metric-icon">
            <Lottie 
              options={defaultLottieOptions(guidanceAnimation)}
              height={50}
              width={50}
            />
          </div>
          <h3>Advice Tips</h3>
          <p className="metric-value">{moreAdvice.length}</p>
        </motion.div>
        
        <motion.div className="metric-card" variants={cardVariants} whileHover="hover">
          <div className="metric-icon">
            <Lottie 
              options={defaultLottieOptions(successAnimation)}
              height={50}
              width={50}
            />
          </div>
          <h3>Status</h3>
          <p className="metric-value">{campaign.status || 'Draft'}</p>
        </motion.div>
      </motion.div>

      {/* Calendar */}
      <motion.div 
        className="calendar-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="calendar-header">
          <motion.button 
            onClick={handlePrevMonth} 
            className="month-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            &lt;
          </motion.button>
          <h3>
            {new Date(currentYear, currentMonth).toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h3>
          <motion.button 
            onClick={handleNextMonth} 
            className="month-btn"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            &gt;
          </motion.button>
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
              <motion.div
                key={day}
                className={`calendar-day ${dayEvents.length > 0 ? 'has-event' : ''} ${isSelected ? 'selected' : ''}`}
                style={{ background: bgColor, color: fontColor }}
                onClick={() => handleDayClick(day)}
                whileHover={{ scale: 1.05, zIndex: 5 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
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
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Day Details */}
      <AnimatePresence>
        {selectedDayEvents.length > 0 && (
          <motion.div 
            className="day-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2>Day Details</h2>
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
                  <motion.div 
                    key={i} 
                    className="day-event-card"
                    style={{ borderTop: `4px solid ${platformColor}` }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: `0 10px 20px rgba(0, 0, 0, 0.2), 0 0 0 1px ${platformColor}33` 
                    }}
                  >
                    <h4>{ev.date}</h4>
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
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bingo Suggestions */}
      <motion.div 
        className="bingo-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <h2 className="section-title">
          <span className="section-icon">🎯</span>
          Bingo Suggestions
        </h2>
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
                <motion.div 
                  key={i} 
                  className="bingo-card"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1, duration: 0.4 }}
                  whileHover={{ 
                    scale: 1.03, 
                    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.2)",
                    y: -10
                  }}
                >
                  {bingo.imageUrl ? (
                    <div className="bingo-image-container">
                      <img
                        src={bingo.imageUrl}
                        alt={suggestionVal}
                        className="bingo-card-image"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="bingo-image-container placeholder">
                      <Lottie 
                        options={defaultLottieOptions(brandingAnimation)}
                        height={120}
                        width={120}
                      />
                    </div>
                  )}
                  <div className="bingo-card-content">
                    <h3>{suggestionVal}</h3>
                    <p>{strategyVal}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* More Advice */}
      <motion.div 
        className="more-advice-section"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <h2 className="section-title">
          <span className="section-icon">💡</span>
          Additional Advice
        </h2>
        {!moreAdvice.length ? (
          <p>No additional advice found.</p>
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
                  <motion.div 
                    key={i} 
                    className="advice-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ x: 5, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)" }}
                  >
                    <h4>{adviceData.title || 'Untitled Advice'}</h4>
                    <p>{adviceData.description || 'No description provided.'}</p>
                  </motion.div>
                );
              } else {
                // Fallback: show as plain text or stringified
                return (
                  <motion.div 
                    key={i} 
                    className="advice-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.4 }}
                    whileHover={{ x: 5, boxShadow: "0 5px 15px rgba(0, 0, 0, 0.15)" }}
                  >
                    <h4>Note</h4>
                    <p>
                      {typeof advice === 'object'
                        ? JSON.stringify(advice)
                        : advice}
                    </p>
                  </motion.div>
                );
              }
            })}
          </div>
        )}
      </motion.div>

      {/* Action Buttons */}
      <motion.div 
        className="action-buttons"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {!isActive && (
          <motion.button 
            onClick={handleActivateCampaign} 
            className="activate-button"
            whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(255, 125, 0, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <Lottie 
              options={defaultLottieOptions(rocketAnimation)}
              height={30}
              width={30}
            />
            <span>Activate Campaign</span>
          </motion.button>
        )}
        <motion.button 
          onClick={handleDelete} 
          className="delete-button"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(244, 67, 54, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Delete Campaign</span>
        </motion.button>
        <motion.button 
          onClick={handleFindInfluencers} 
          className="find-button"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(3, 169, 244, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          <span>Find Influencers</span>
        </motion.button>
      </motion.div>
    </div>
  );
}

export default CampaignResults;