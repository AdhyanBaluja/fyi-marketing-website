import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./InfluencerProfile.css";

// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function InfluencerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("audience");
  const profileRef = useRef(null);
  const canvasRef = useRef(null);
  const ratingRef = useRef(null);

  // Animation states
  const [showHeader, setShowHeader] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [platformsExpanded, setPlatformsExpanded] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // We'll read userType from localStorage to show a "Rate" section only if brand
  const userType = localStorage.getItem("userType");

  // (A) local rating input state
  const [newRating, setNewRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [ratingSuccess, setRatingSuccess] = useState("");
  const [showThankYou, setShowThankYou] = useState(false);

  // 1) STAR RATING RENDERING
  const renderStars = (rating, size = 'medium', interactive = false) => {
    if (!rating || rating <= 0) {
      return <span className="premium-no-rating">No rating yet</span>;
    }
    
    const rounded = Math.round(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(
          <span 
            key={i} 
            className={`premium-filled-star ${size}`}
            onClick={interactive ? () => setNewRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          >
            <span className="star-glow">★</span>
          </span>
        );
      } else {
        stars.push(
          <span 
            key={i} 
            className={`premium-empty-star ${size}`}
            onClick={interactive ? () => setNewRating(i) : undefined}
            onMouseEnter={interactive ? () => setHoveredRating(i) : undefined}
            onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
          >
            ★
          </span>
        );
      }
    }
    
    return (
      <div className={`premium-stars-container ${interactive ? 'interactive' : ''}`}>
        {stars}
        <span className="premium-rating-number">({Number(rating).toFixed(1)})</span>
      </div>
    );
  };
  
  // Interactive rating stars
  const renderInteractiveStars = () => {
    const stars = [];
    const displayRating = hoveredRating || newRating;
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span 
          key={i} 
          className={`premium-rating-star ${i <= displayRating ? 'active' : ''}`}
          onClick={() => handleStarClick(i)}
          onMouseEnter={() => setHoveredRating(i)}
          onMouseLeave={() => setHoveredRating(0)}
        >
          ★
        </span>
      );
    }
    
    return (
      <div className="premium-rating-stars">
        {stars}
        {displayRating > 0 && 
          <div className="rating-tooltip">
            {getRatingText(displayRating)}
          </div>
        }
      </div>
    );
  };
  
  const getRatingText = (rating) => {
    switch(rating) {
      case 1: return "Poor";
      case 2: return "Fair";
      case 3: return "Good";
      case 4: return "Very Good";
      case 5: return "Excellent";
      default: return "";
    }
  };
  
  const handleStarClick = (rating) => {
    setNewRating(rating);
  };

  // Canvas background effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    // Particles
    const particlesArray = [];
    const numberOfParticles = 40;
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.color = `hsla(${Math.random() * 60 + 200}, 80%, 60%, ${Math.random() * 0.2 + 0.1})`;
      }
      
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
        if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;
      }
      
      draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const init = () => {
      for (let i = 0; i < numberOfParticles; i++) {
        particlesArray.push(new Particle());
      }
    };
    
    init();
    
    // Connection lines between particles
    const connectParticles = () => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 150) {
            const opacity = 1 - distance / 150;
            ctx.strokeStyle = `rgba(88, 150, 255, ${opacity * 0.2})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Create gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(10, 15, 30, 1)');
      gradient.addColorStop(1, 'rgba(20, 25, 45, 1)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw and update particles
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
      }
      
      connectParticles();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Track mouse position for hover effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Set up scroll animations
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const docHeight = document.body.scrollHeight;
      const totalScrollHeight = docHeight - windowHeight;
      const progress = scrollTop / totalScrollHeight;
      
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 2) FETCH via AXIOS using API_BASE_URL
  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    
    axios
      .get(`${API_BASE_URL}/api/influencer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.influencer) {
          setInfluencer(res.data.influencer);
          
          // Staggered animations
          setTimeout(() => setShowHeader(true), 300);
          setTimeout(() => setShowContent(true), 600);
        } else {
          setError("Influencer not found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching influencer detail:", err);
        setError("Failed to fetch influencer detail");
      })
      .finally(() => setTimeout(() => setLoading(false), 800));
  }, [id]);

  // 4) SUBMIT RATING => API call using API_BASE_URL
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    if (!newRating || newRating < 1 || newRating > 5) {
      // Show error with animation
      if (ratingRef.current) {
        ratingRef.current.classList.add('shake-error');
        setTimeout(() => {
          ratingRef.current.classList.remove('shake-error');
        }, 500);
      }
      return;
    }
    
    // Button loading state
    const button = e.target.querySelector('button');
    if (button) {
      button.disabled = true;
      button.classList.add('loading');
      button.innerHTML = '<span class="loading-spinner"></span> Submitting...';
    }
    
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/influencer/${id}/rate`,
        { ratingValue: Number(newRating) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Animate thank you message
      setShowThankYou(true);
      
      // Re-fetch influencer to update averageRating
      const refreshed = await axios.get(
        `${API_BASE_URL}/api/influencer/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfluencer(refreshed.data.influencer);
      
      // Reset UI after delay
      setTimeout(() => {
        setRatingSuccess("Rating submitted successfully!");
        setShowThankYou(false);
        setNewRating(0);
        
        if (button) {
          button.disabled = false;
          button.classList.remove('loading');
          button.innerHTML = 'Submit Rating';
        }
        
        setTimeout(() => setRatingSuccess(""), 3000);
      }, 2000);
      
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to submit rating.");
      
      if (button) {
        button.disabled = false;
        button.classList.remove('loading');
        button.innerHTML = 'Submit Rating';
      }
    }
  };
  
  const handleBackClick = () => {
    // Add a class to the main container for fade out
    if (profileRef.current) {
      profileRef.current.classList.add('fade-out');
    }
    
    // Navigate after a short delay
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };
  
  const togglePlatformsView = () => {
    setPlatformsExpanded(!platformsExpanded);
  };

  // 3) LOADING / ERROR STATES
  if (loading) {
    return (
      <div className="premium-profile-loading">
        <canvas ref={canvasRef} className="premium-background-canvas"></canvas>
        <div className="premium-loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-center"></div>
        </div>
        <p className="loading-text">Loading influencer profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="premium-profile-error">
        <canvas ref={canvasRef} className="premium-background-canvas"></canvas>
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>Something went wrong</h3>
          <p className="error-msg">{error}</p>
          <button className="back-btn" onClick={handleBackClick}>
            <span className="btn-icon">←</span>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="premium-profile-error">
        <canvas ref={canvasRef} className="premium-background-canvas"></canvas>
        <div className="error-container">
          <div className="error-icon">?</div>
          <h3>Profile Not Found</h3>
          <p>No influencer data available.</p>
          <button className="back-btn" onClick={handleBackClick}>
            <span className="btn-icon">←</span>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Destructure fields (joinedCampaigns assumed to be part of influencer data)
  const {
    name,
    numFollowers,
    experience,
    influencerLocation,
    majorityAudienceLocation,
    audienceAgeGroup,
    audienceGenderDemographics,
    gender,
    industries,
    nichePlatforms,
    profileImage,
    joinedCampaigns,
    averageRating,
    platformDetails = {}, // Map of handle/price info
  } = influencer;

  // Convert platformDetails if needed (if Mongoose Map, you can do Object.entries)
  let platformDetailsObj = platformDetails;
  // Optionally: platformDetailsObj = Object.fromEntries(platformDetails);
  
  // Platform icons mapping
  const platformIcons = {
    "Instagram": "📸",
    "LinkedIn": "💼",
    "Facebook": "👥",
    "Twitch": "🎮",
    "Reddit": "🔍",
    "Pinterest": "📌",
    "TikTok": "📱",
    "X": "🐦",
    "Youtube": "▶️",
    "Threads": "🧵",
    "Quora": "❓",
    "Discord": "💬",
    "Snapchat": "👻"
  };

  return (
    <div className="premium-profile-universe" ref={profileRef}>
      {/* Canvas background */}
      <canvas ref={canvasRef} className="premium-background-canvas"></canvas>
      
      {/* Scroll progress indicator */}
      <div className="scroll-progress-bar">
        <div 
          className="scroll-progress-indicator" 
          style={{ width: `${scrollProgress * 100}%` }}
        ></div>
      </div>
      
      {/* Back button */}
      <button className="premium-back-button" onClick={handleBackClick}>
        <span className="btn-icon">←</span>
        Back
      </button>
      
      <div className="premium-profile-wrapper">
        {/* TOP HEADER / HERO */}
        <div className={`premium-profile-header ${showHeader ? 'visible' : ''}`}>
          <div className="header-glow"></div>
          <div className="profile-avatar-container">
            <div className="avatar-glow"></div>
            <img
              src={profileImage || "https://via.placeholder.com/120"}
              alt={name}
              className="premium-profile-avatar"
            />
            <div className="avatar-pulse"></div>
          </div>
          
          <div className="profile-header-info">
            <h1 className="premium-profile-name">{name}</h1>

            {/* STAR RATING */}
            <div className="premium-profile-rating">
              {renderStars(averageRating, 'large')}
            </div>

            <div className="premium-header-stats">
              <div className="stat-item">
                <span className="stat-icon">⭐</span>
                <span className="stat-value">{experience}</span>
                <span className="stat-label">Years</span>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <span className="stat-icon">👥</span>
                <span className="stat-value">{numFollowers?.toLocaleString()}</span>
                <span className="stat-label">Followers</span>
              </div>
              
              <div className="stat-divider"></div>
              
              <div className="stat-item">
                <span className="stat-icon">📍</span>
                <span className="stat-value location-value">{influencerLocation || "N/A"}</span>
              </div>
            </div>
            
            {/* Platform badges */}
            <div className="premium-platform-badges">
              {nichePlatforms && nichePlatforms.slice(0, 5).map((platform, index) => (
                <div key={index} className="platform-badge" data-platform={platform}>
                  <span className="platform-icon">{platformIcons[platform] || '🔗'}</span>
                  <span className="platform-name">{platform}</span>
                </div>
              ))}
              {nichePlatforms && nichePlatforms.length > 5 && (
                <div className="platform-badge more">
                  +{nichePlatforms.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* CONTENT TABS */}
        <div className={`premium-profile-tabs ${showContent ? 'visible' : ''}`}>
          <button 
            className={`premium-tab ${activeTab === 'audience' ? 'active' : ''}`}
            onClick={() => setActiveTab('audience')}
          >
            <span className="tab-icon">👥</span>
            Audience & Demographics
          </button>
          <button 
            className={`premium-tab ${activeTab === 'details' ? 'active' : ''}`}
            onClick={() => setActiveTab('details')}
          >
            <span className="tab-icon">ℹ️</span>
            Influencer Details
          </button>
          <button 
            className={`premium-tab ${activeTab === 'platforms' ? 'active' : ''}`}
            onClick={() => setActiveTab('platforms')}
          >
            <span className="tab-icon">📱</span>
            Platform Details
          </button>
          <button 
            className={`premium-tab ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <span className="tab-icon">🚀</span>
            Campaigns
          </button>
        </div>
        
        {/* TAB CONTENT */}
        <div className={`premium-profile-content ${showContent ? 'visible' : ''}`}>
          {/* AUDIENCE & DEMOGRAPHICS */}
          <div className={`premium-content-section ${activeTab === 'audience' ? 'active' : ''}`}>
            <div className="premium-card audience-card">
              <div className="card-glow"></div>
              <div className="premium-card-content">
                <div className="audience-location">
                  <h3>
                    <span className="section-icon">🌎</span>
                    Audience Location
                  </h3>
                  <div className="location-bubble">
                    {majorityAudienceLocation || "Not specified"}
                  </div>
                </div>
                
                <div className="audience-info-grid">
                  <div className="audience-info-item">
                    <h4>
                      <span className="info-icon">👨‍👩‍👧‍👦</span>
                      Age Group
                    </h4>
                    <div className="info-value gradient-text">
                      {audienceAgeGroup || "Not specified"}
                    </div>
                  </div>
                  
                  <div className="audience-info-item">
                    <h4>
                      <span className="info-icon">👫</span>
                      Gender Distribution
                    </h4>
                    <div className="info-value gradient-text">
                      {audienceGenderDemographics || "Not specified"}
                    </div>
                  </div>
                </div>
                
                {/* Animated audience visualization */}
                <div className="audience-visualization">
                  <div className="audience-circle"></div>
                  <div className="audience-circle"></div>
                  <div className="audience-circle"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* INFLUENCER DETAILS */}
          <div className={`premium-content-section ${activeTab === 'details' ? 'active' : ''}`}>
            <div className="premium-card details-card">
              <div className="card-glow"></div>
              <div className="premium-card-content">
                <div className="premium-details-grid">
                  <div className="premium-detail-item">
                    <h4>
                      <span className="info-icon">👤</span>
                      Gender
                    </h4>
                    <p className="detail-value">{gender || "Not specified"}</p>
                  </div>
                  
                  <div className="premium-detail-item">
                    <h4>
                      <span className="info-icon">🏭</span>
                      Industries
                    </h4>
                    <div className="industries-tags">
                      {industries && industries.length > 0 ? (
                        industries.map((industry, index) => (
                          <span key={index} className="industry-tag">
                            {industry}
                          </span>
                        ))
                      ) : (
                        <p className="no-data">No industries specified</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="premium-detail-item full-width">
                    <h4>
                      <span className="info-icon">📱</span>
                      Niche Platforms
                    </h4>
                    <div className="platform-tags">
                      {nichePlatforms && nichePlatforms.length > 0 ? (
                        nichePlatforms.map((platform, index) => (
                          <span key={index} className="platform-tag">
                            <span className="platform-icon">{platformIcons[platform] || '🔗'}</span>
                            {platform}
                          </span>
                        ))
                      ) : (
                        <p className="no-data">No platforms specified</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Experience visualization */}
                <div className="experience-visualization">
                  <h4>
                    <span className="info-icon">⭐</span>
                    Experience Timeline
                  </h4>
                  <div className="timeline">
                    <div className="timeline-track">
                      {[...Array(Math.max(10, experience))].map((_, i) => (
                        <div 
                          key={i} 
                          className={`timeline-node ${i < experience ? 'active' : ''}`}
                          style={{ 
                            animationDelay: `${i * 0.1}s` 
                          }}
                        ></div>
                      ))}
                    </div>
                    <div className="timeline-labels">
                      <span>0 yrs</span>
                      <span>{Math.max(10, experience)} yrs</span>
                    </div>
                  </div>
                  <div className="experience-indicator">
                    <span className="value">{experience} years</span>
                    <span className="label">of influence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* PLATFORM DETAILS SECTION */}
          <div className={`premium-content-section ${activeTab === 'platforms' ? 'active' : ''}`}>
            <div className="premium-card platforms-card">
              <div className="card-glow"></div>
              <div className="premium-card-content">
                <div className="platforms-header">
                  <h3>
                    <span className="section-icon">📱</span>
                    Platform Details & Pricing
                  </h3>
                  {Object.keys(platformDetailsObj).length > 3 && (
                    <button 
                      className="expand-btn"
                      onClick={togglePlatformsView}
                    >
                      {platformsExpanded ? 'Show Less' : 'Show All'}
                    </button>
                  )}
                </div>
                
                {platformDetailsObj && Object.keys(platformDetailsObj).length > 0 ? (
                  <div className={`platform-details-grid ${platformsExpanded ? 'expanded' : ''}`}>
                    {Object.entries(platformDetailsObj).map(([platformName, detail], idx) => (
                      <div key={idx} className="platform-detail-card">
                        <div className="platform-icon-large">
                          {platformIcons[platformName] || '🔗'}
                        </div>
                        <h4 className="platform-name">{platformName}</h4>
                        <div className="platform-info">
                          <div className="platform-handle">
                            <span className="info-label">Handle:</span>
                            <span className="info-value">{detail.handle || "N/A"}</span>
                          </div>
                          <div className="platform-price">
                            <span className="info-label">Price per Post:</span>
                            <span className="info-value price">
                              ${detail.price?.toLocaleString() || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-platforms-message">
                    <div className="message-icon">📝</div>
                    <p>No platform details found.</p>
                    <p className="message-sub">The influencer hasn't added platform pricing information yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* JOINED CAMPAIGNS */}
          <div className={`premium-content-section ${activeTab === 'campaigns' ? 'active' : ''}`}>
            <div className="premium-card campaigns-card">
              <div className="card-glow"></div>
              <div className="premium-card-content">
                <h3>
                  <span className="section-icon">🚀</span>
                  Campaign History
                </h3>
                
                {joinedCampaigns && joinedCampaigns.length > 0 ? (
                  <div className="premium-campaigns-grid">
                    {joinedCampaigns.map((c, idx) => (
                      <div key={idx} className={`premium-campaign-card status-${c.status}`}>
                        <div className="campaign-header">
                          <h4 className="campaign-name">
                            {c.campaignName || c.campaignId}
                          </h4>
                          <div className={`campaign-status ${c.status}`}>
                            {c.status}
                          </div>
                        </div>
                        
                        <div className="campaign-details">
                          <div className="campaign-platform">
                            <span className="detail-label">Platform:</span>
                            <span className="detail-value">
                              {c.platform ? (
                                <>
                                  <span className="platform-icon">{platformIcons[c.platform] || '🔗'}</span>
                                  {c.platform}
                                </>
                              ) : 'N/A'}
                            </span>
                          </div>
                          
                          <div className="campaign-budget">
                            <span className="detail-label">Budget:</span>
                            <span className="detail-value">{c.budget || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div className="campaign-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-indicator"
                              style={{ width: `${c.progress}%` }}
                            ></div>
                          </div>
                          <div className="progress-percentage">{c.progress}% Complete</div>
                        </div>
                        
                        {c.tasks && c.tasks.length > 0 && (
                          <div className="campaign-tasks">
                            <div className="tasks-header">Tasks:</div>
                            <div className="tasks-list">
                              {c.tasks.map((task, taskIdx) => (
                                <div key={task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
                                  <span className="task-status">
                                    {task.completed ? '✓' : '○'}
                                  </span>
                                  <span className="task-text">{task.text}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-campaigns-message">
                    <div className="message-icon">🚀</div>
                    <p>No campaigns joined yet</p>
                    <p className="message-sub">This influencer hasn't participated in any campaigns yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* RATING SECTION (brand only) */}
        {userType === "brand" && (
          <div className={`premium-rating-section ${showContent ? 'visible' : ''}`} ref={ratingRef}>
            <div className="premium-card rating-card">
              <div className="card-glow"></div>
              <div className="premium-card-content">
                <h3>
                  <span className="section-icon">⭐</span>
                  Rate This Influencer
                </h3>
                
                {ratingSuccess && (
                  <div className="success-message">
                    <div className="success-icon">✓</div>
                    <p>{ratingSuccess}</p>
                  </div>
                )}
                
                {showThankYou ? (
                  <div className="thank-you-animation">
                    <div className="thank-you-stars">
                      <div className="thank-you-star">⭐</div>
                      <div className="thank-you-star">⭐</div>
                      <div className="thank-you-star">⭐</div>
                    </div>
                    <h4>Thank You for Your Rating!</h4>
                    <p>Your feedback helps other brands make informed decisions.</p>
                  </div>
                ) : (
                  <form onSubmit={handleRatingSubmit} className="premium-rating-form">
                    <div className="rating-prompt">
                      <p>How would you rate your experience with this influencer?</p>
                    </div>
                    
                    {renderInteractiveStars()}
                    
                    <button type="submit" className="rating-submit-btn" disabled={!newRating}>
                      Submit Rating
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default InfluencerProfile;