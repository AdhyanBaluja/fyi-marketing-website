import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; // Ensure this path is correct
import axios from 'axios';

// Import NavBar component
import NavBar from './NavBar.jsx';
import AiChatbot from './AiChatbot.jsx';

// Import the local MP4 file
import landingPageVideo from '../assets/landingPage9.mp4';

// Import images
import benefitsBkg from '../assets/benefitsBkg.png';
import brandLeft from '../assets/brandLeft.png';
import brandRight from '../assets/brandRight.png';
import inflLeft from '../assets/inflLeft.png';
import inflRight from '../assets/inflRight.png';
import dashboardImg from '../assets/dashboard.png';

// Define API base URL from env variable; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function TypewriterTitle() {
  const typedWords = useMemo(
    () => ['nfluence....', 'nsights....', 'nteraction....', 'nnovation....', 'mpact....'],
    []
  );

  const TYPING_SPEED = 100;
  const DELETING_SPEED = 50;
  const PAUSE_TIME = 1800;

  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pause, setPause] = useState(false);
  const [visible, setVisible] = useState(true);

 

  useEffect(() => {
    if (pause) return;

    const currentWord = typedWords[wordIndex];
    const isWordComplete = charIndex === currentWord.length;
    const isWordEmpty = charIndex === 0;

    let speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;

    if (!isDeleting && isWordComplete) {
      setPause(true);
      setTimeout(() => {
        setIsDeleting(true);
        setPause(false);
      }, PAUSE_TIME);
    } else if (isDeleting && isWordEmpty) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % typedWords.length);
    } else {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [charIndex, isDeleting, pause, typedWords, wordIndex]);

  useEffect(() => {
    setText(typedWords[wordIndex].substring(0, charIndex));
  }, [charIndex, typedWords, wordIndex]);

  return (
    <div className="hero-title-container">
      <h1 className="hero-title">
        <span className="hero-title-text">Let's<span className="hero-title-accent">FYI</span></span>
        <span className="typewriter-text">{text}</span>
      </h1>
    </div>
  );
}

// ----- Animated Statistic Component ----- //
function AnimatedStatistic({ value, label, icon, delay }) {
  const [counted, setCounted] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const statRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = statRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      let start = 0;
      const duration = 2000; // 2 seconds
      const step = 16; // ~60fps
      const incrementPerStep = (value * step) / duration;

      const counter = setInterval(() => {
        start += incrementPerStep;
        setCounted(Math.min(Math.floor(start), value));

        if (start >= value) {
          clearInterval(counter);
        }
      }, step);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return (
    <div className="animated-statistic" ref={statRef}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value stat-animate">{counted}+</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

function SuccessStoriesCarousel() {
  const successStories = [
    {
      quote: "Let'sFYI transformed our influencer marketing. We're seeing 3x better ROI than our previous campaigns. The platform's AI matching helped us find creators who genuinely love our products.",
      author: "Emma Williams",
      position: "Marketing Director, FoodieCo",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Emma",
      metrics: {
        engagement: "+127%",
        conversion: "+43%",
        roi: "3.2x"
      },
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=FC&backgroundColor=ffba08"
    },
    {
      quote: "As an influencer with a focused niche audience, this platform has connected me with brands that perfectly align with my values. The collaborative tools make content creation and approval seamless.",
      author: "Jason Rodriguez",
      position: "Lifestyle Influencer, 550K followers",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Jason",
      metrics: {
        brandDeals: "+8",
        revenue: "+62%",
        audience: "+25K"
      },
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=JR&backgroundColor=3a86ff"
    },
    {
      quote: "The AI-powered matching has saved us hundreds of hours in finding the right creators. What impressed me most was the detailed analytics that showed exactly how each post performed across all metrics.",
      author: "Michaela Patterson",
      position: "Brand Manager, TechGiant",
      avatar: "https://api.dicebear.com/7.x/personas/svg?seed=Michaela",
      metrics: {
        timesSaved: "15 hrs/week",
        creatorsFound: "37",
        satisfaction: "98%"
      },
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=TG&backgroundColor=06d6a0"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  
  // Handle navigation
  const navigateToStory = (index) => {
    if (isTransitioning || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 600);
  };

  const handlePrevious = () => {
    const newIndex = currentIndex === 0 ? successStories.length - 1 : currentIndex - 1;
    navigateToStory(newIndex);
  };

  const handleNext = () => {
    const newIndex = (currentIndex + 1) % successStories.length;
    navigateToStory(newIndex);
  };

  return (
    <div className="success-stories-carousel" ref={carouselRef}>
      <div className="carousel-controls">
        <button className="nav-button prev-button" onClick={handlePrevious} aria-label="Previous story">
          <span>←</span>
        </button>
        <button className="nav-button next-button-1" onClick={handleNext} aria-label="Next story">
          <span>→</span>
        </button>
      </div>

      <div 
        className="stories-container" 
        style={{ transform: `translateX(-${currentIndex * (100/3)}%)` }}
      >
        {successStories.map((story, index) => (
          <div 
            className={`story-card ${index === currentIndex ? 'active' : ''}`} 
            key={index}
          >
            <div className="quote-icon">❝</div>
            <div className="company-logo">
              <img src={story.logo} alt="Company logo" />
            </div>
            <p className="story-quote">{story.quote}</p>
            
            <div className="story-metrics">
              {Object.entries(story.metrics).map(([key, value], idx) => (
                <div className="metric-item" key={idx}>
                  <div className="metric-value">{value}</div>
                  <div className="metric-key">{key}</div>
                </div>
              ))}
            </div>
            
            <div className="story-author">
              <img src={story.avatar} alt={story.author} className="author-avatar" />
              <div className="author-info">
                <h4>{story.author}</h4>
                <p>{story.position}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="story-progress">
        {successStories.map((_, index) => (
          <button
            key={index}
            className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => navigateToStory(index)}
            aria-label={`Go to story ${index + 1}`}
          >
            <span className="progress-indicator"></span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ----- Interactive Campaign Builder Preview ----- //
function CampaignBuilderPreview() {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  
  const features = [
    { id: 'audience', title: 'Audience Targeting', desc: 'Define your perfect audience with AI-powered precision' },
    { id: 'creative', title: 'Creative Briefs', desc: 'Custom brief templates for different campaign types' },
    { id: 'metrics', title: 'Performance Metrics', desc: 'Real-time analytics and ROI tracking' },
    { id: 'discovery', title: 'Influencer Discovery', desc: 'Find the perfect match for your brand values' }
  ];

  return (
    <div className="campaign-builder-preview">
      <div className="preview-dashboard">
        <div className="preview-sidebar">
          <div className="preview-logo">Campaign Builder</div>
          <div className="preview-nav">
            {features.map(feature => (
              <div 
                key={feature.id}
                className={`preview-nav-item ${hoveredFeature === feature.id ? 'active' : ''}`}
                onMouseEnter={() => setHoveredFeature(feature.id)}
              >
                {feature.title}
              </div>
            ))}
          </div>
        </div>
        <div className="preview-content">
          {hoveredFeature ? (
            <div className="preview-feature">
              <h3>{features.find(f => f.id === hoveredFeature).title}</h3>
              <p>{features.find(f => f.id === hoveredFeature).desc}</p>
              <div className="preview-feature-demo">
                {hoveredFeature === 'audience' && (
                  <div className="audience-demo">
                    <div className="demographic-slider">
                      <span>Age Range: 25-45</span>
                      <div className="slider-track">
                        <div className="slider-fill"></div>
                      </div>
                    </div>
                    <div className="interest-tags">
                      <span className="tag">Fashion</span>
                      <span className="tag">Eco-friendly</span>
                      <span className="tag">Luxury</span>
                      <span className="tag">+Add</span>
                    </div>
                  </div>
                )}
                {hoveredFeature === 'creative' && (
                  <div className="creative-demo">
                    <div className="template-card selected">
                      <div className="template-header">Product Review</div>
                    </div>
                    <div className="template-card">
                      <div className="template-header">Brand Story</div>
                    </div>
                    <div className="template-card">
                      <div className="template-header">Unboxing</div>
                    </div>
                  </div>
                )}
                {hoveredFeature === 'metrics' && (
                  <div className="metrics-demo">
                    <div className="metric-chart">
                      <div className="chart-bar" style={{height: '65%'}}></div>
                      <div className="chart-bar" style={{height: '80%'}}></div>
                      <div className="chart-bar" style={{height: '45%'}}></div>
                      <div className="chart-bar" style={{height: '90%'}}></div>
                    </div>
                    <div className="metric-numbers">
                      <div className="metric-item">
                        <div className="metric-value">24.5K</div>
                        <div className="metric-label">Engagements</div>
                      </div>
                      <div className="metric-item">
                        <div className="metric-value">3.2x</div>
                        <div className="metric-label">ROI</div>
                      </div>
                    </div>
                  </div>
                )}
                {hoveredFeature === 'discovery' && (
                  <div className="discovery-demo">
                    <div className="influencer-card">
                      <div className="influencer-avatar"></div>
                      <div className="influencer-match">94% Match</div>
                      <div className="influencer-stats">
                        <div>105K Followers</div>
                        <div>3.8% Engagement</div>
                      </div>
                    </div>
                    <div className="influencer-card">
                      <div className="influencer-avatar"></div>
                      <div className="influencer-match">87% Match</div>
                      <div className="influencer-stats">
                        <div>280K Followers</div>
                        <div>2.1% Engagement</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="preview-default">
              <h3>Hover over a feature to see details</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ----- Enhanced Earnings Calculator Component ----- //
function EarningsCalculator() {
  // State for calculator inputs
  const [platform, setPlatform] = useState('instagram');
  const [followers, setFollowers] = useState('5k-10k');
  const [engagement, setEngagement] = useState('1-2');
  const [contentType, setContentType] = useState('photo');
  
  // State for calculator results
  const [minRate, setMinRate] = useState(100);
  const [maxRate, setMaxRate] = useState(300);
  const [potentialPercent, setPotentialPercent] = useState(30);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Base rates by platform (starting points)
  const baseRates = {
    instagram: { min: 100, max: 300 },
    tiktok: { min: 150, max: 400 },
    youtube: { min: 200, max: 500 },
    facebook: { min: 80, max: 250 }
  };
  
  // Follower multipliers
  const followerMultipliers = {
    '5k-10k': { min: 1, max: 1 },
    '10k-50k': { min: 3, max: 4 },
    '50k-100k': { min: 5, max: 8 },
    '100k-500k': { min: 10, max: 20 },
    '500k+': { min: 25, max: 50 }
  };
  
  // Engagement rate bonuses (percentages)
  const engagementBonuses = {
    '1-2': { min: 0, max: 20 },
    '2-4': { min: 20, max: 50 },
    '4-6': { min: 50, max: 80 },
    '6+': { min: 80, max: 120 }
  };
  
  // Content type multipliers
  const contentMultipliers = {
    photo: { min: 1, max: 1 },
    story: { min: 0.5, max: 0.7 },
    video: { min: 1.5, max: 2 },
    reel: { min: 2, max: 3 }
  };

  // Calculate earnings when any input changes
  useEffect(() => {
    calculateEarnings();
  }, [platform, followers, engagement, contentType]);

  // Function to calculate earnings
  const calculateEarnings = () => {
    setIsUpdating(true);
    
    // Calculate min rate
    let newMinRate = baseRates[platform].min;
    newMinRate *= followerMultipliers[followers].min;
    newMinRate *= (1 + (engagementBonuses[engagement].min / 100));
    newMinRate *= contentMultipliers[contentType].min;
    
    // Calculate max rate
    let newMaxRate = baseRates[platform].max;
    newMaxRate *= followerMultipliers[followers].max;
    newMaxRate *= (1 + (engagementBonuses[engagement].max / 100));
    newMaxRate *= contentMultipliers[contentType].max;
    
    // Round to nearest multiple of 50
    newMinRate = Math.ceil(newMinRate / 50) * 50;
    newMaxRate = Math.ceil(newMaxRate / 50) * 50;
    
    // Update progress bar (based on max potential of $5000)
    const newPotentialPercent = Math.min(100, (newMaxRate / 5000) * 100);
    
    // Update states with new values
    setMinRate(newMinRate);
    setMaxRate(newMaxRate);
    setPotentialPercent(newPotentialPercent);
    
    // Remove updating class after animation
    setTimeout(() => setIsUpdating(false), 800);
  };
  
  const handleFindOpportunities = () => {
    // This would typically navigate to opportunities page
    alert('Navigating to matching opportunities for your profile');
    // In a real implementation, you might use navigate('/opportunities')
  };

  return (
    <div className="earnings-calculator">
      <h3>Potential Earnings Calculator</h3>
      <div className="calculator-container">
        <div className="calculator-inputs">
          <div className="input-group">
            <label>Platform</label>
            <select 
              className="platform-select" 
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
            >
              <option value="instagram">Instagram</option>
              <option value="tiktok">TikTok</option>
              <option value="youtube">YouTube</option>
              <option value="facebook">Facebook</option>
            </select>
            <div className="input-help">
              <i className="help-icon">?</i>
              <div className="tooltip">Different platforms have varying rates based on user engagement and demographics</div>
            </div>
          </div>
          <div className="input-group">
            <label>Followers</label>
            <select 
              className="followers-select" 
              value={followers}
              onChange={(e) => setFollowers(e.target.value)}
            >
              <option value="5k-10k">5K-10K</option>
              <option value="10k-50k">10K-50K</option>
              <option value="50k-100k">50K-100K</option>
              <option value="100k-500k">100K-500K</option>
              <option value="500k+">500K+</option>
            </select>
          </div>
          <div className="input-group">
            <label>Engagement Rate</label>
            <select 
              className="engagement-select" 
              value={engagement}
              onChange={(e) => setEngagement(e.target.value)}
            >
              <option value="1-2">1-2%</option>
              <option value="2-4">2-4%</option>
              <option value="4-6">4-6%</option>
              <option value="6+">6%+</option>
            </select>
            <div className="input-help">
              <i className="help-icon">?</i>
              <div className="tooltip">Higher engagement rates significantly increase your earning potential</div>
            </div>
          </div>
          <div className="input-group">
            <label>Content Type</label>
            <select 
              className="content-select" 
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <option value="photo">Post/Photo</option>
              <option value="story">Story</option>
              <option value="video">Video</option>
              <option value="reel">Reel/Short</option>
            </select>
          </div>
        </div>
        <div className={`calculator-results ${isUpdating ? 'updated' : ''}`}>
          <div className="estimated-range">
            <div className="range-label">Estimated Rate Per Post</div>
            <div className="range-value">${minRate.toLocaleString()} - ${maxRate.toLocaleString()}</div>
            <div className="calculation-note">Based on industry averages for your profile</div>
          </div>
          <div className="earnings-progress">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${potentialPercent}%` }}
              ></div>
            </div>
            <div className="progress-labels">
              <span>Low</span>
              <span>Average</span>
              <span>High</span>
            </div>
          </div>
          <button 
            className="find-opportunities-btn pulse-animation"
            onClick={handleFindOpportunities}
          >
            Find Matching Opportunities
          </button>
        </div>
      </div>
    </div>
  );
}

// ----- Floating Notification Component ----- //
function FloatingNotifications() {
  return (
    <div className="floating-notifications">
      <div className="notification-card slide-in-notification">
        <div className="notification-icon">✓</div>
        <div className="notification-content">
          <p className="notification-title">New campaign submitted</p>
          <p className="notification-info">FashionBrand Spring Collection</p>
        </div>
      </div>
      <div className="notification-card slide-in-notification" style={{animationDelay: '3s'}}>
        <div className="notification-icon">👍</div>
        <div className="notification-content">
          <p className="notification-title">Influencer accepted</p>
          <p className="notification-info">@StyleCreator has joined your campaign</p>
        </div>
      </div>
      <div className="notification-card slide-in-notification" style={{animationDelay: '6s'}}>
        <div className="notification-icon">📈</div>
        <div className="notification-content">
          <p className="notification-title">Campaign performing well</p>
          <p className="notification-info">32% above average engagement</p>
        </div>
      </div>
    </div>
  );
}

// Main Landing Page Component
function LandingPage() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const heroSectionRef = useRef(null);

  // Auth state (could come from real auth logic or localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'brand' or 'influencer' or null

  // Track scroll for NavBar background effect
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');
  const [pageLoaded, setPageLoaded] = useState(false);

// Define the available color themes based on palette tables
const colorThemes = [
  // Original themes
  'theme-amber',         // Warm orange/gold
  'theme-cyan',          // Cool blue/cyan
  'theme-lavender',      // Soft purple
  'theme-mint',          // Fresh green
  'theme-peach',         // Gentle peach/coral
  'theme-jade',          // Teal/jade
  
  // First expansion set
  'theme-emerald',       // Rich green
  'theme-ruby',          // Deep red
  'theme-sunset',        // Orange/sunset
  'theme-sapphire',      // Deep blue
  'theme-amethyst',      // Rich purple
  'theme-aqua',          // Bright teal
  'theme-rosegold',      // Pink/rose gold
  'theme-electric',      // Electric blue
  'theme-golden',        // Rich gold
  'theme-coral',         // Vibrant coral
  'theme-indigo',        // Deep indigo
  
  // Premium expansion set
  'theme-nebula',        // Purple/violet nebula
  'theme-aurora',        // Aurora green
  'theme-crimson',       // Crimson red
  'theme-prism',         // Prism blue
  'theme-opal',          // Opal teal
  'theme-magenta',       // Magenta pink
  'theme-royal',         // Royal purple
  'theme-turquoise',     // Deep turquoise
  'theme-amberglow',     // Amber glow
  'theme-ultraviolet',   // Ultraviolet purple
  'theme-flamingo',      // Flamingo pink
  'theme-ocean',         // Ocean blue
  'theme-neon',          // Neon cyan
  'theme-sunsetblaze',   // Sunset blaze orange
  'theme-emeraldfire',   // Emerald fire green
  'theme-cosmic',        // Cosmic purple
  'theme-midnightblue',  // Midnight blue
  'theme-rosepetal',     // Rose petal pink
  'theme-arctic',        // Arctic blue
  'theme-energy',        // Energy yellow
  'theme-tropical',      // Tropical teal
  'theme-galaxy'         // Galaxy purple
];
  
// State to hold the current theme
const [currentTheme, setCurrentTheme] = useState('');
  
  // Fix for cursor issue with video background
  useEffect(() => {
    // Add a small delay to ensure everything is loaded
    const loadTimer = setTimeout(() => {
      setPageLoaded(true);
      // Select a random theme on initial load
const randomTheme = colorThemes[Math.floor(Math.random() * colorThemes.length)];
setCurrentTheme(randomTheme);
    }, 500);
    
    const fixCursorIssue = () => {
      if (heroSectionRef.current) {
        // Make sure pointer events work properly with the video
        const videoContainer = heroSectionRef.current.querySelector('.hero-video-container');
        if (videoContainer) {
          videoContainer.style.pointerEvents = 'none';
        }
      }
    };
    
    fixCursorIssue();
    
    // Also ensure video properly loads and plays with error handling for autoplay issues
    if (videoRef.current) {
      const playVideo = async () => {
        try {
          // Set volume to 0 (muted) and playbackRate to lower value to reduce CPU usage
          videoRef.current.volume = 0;
          videoRef.current.playbackRate = 0.8;
          videoRef.current.muted = true; // Ensure muted for autoplay
          
          // Play video after a short delay to ensure DOM is fully loaded
          setTimeout(() => {
            videoRef.current.play().catch(e => {
              console.warn('Video autoplay was prevented:', e);
              // Add fallback class that will show the poster image instead
              if (heroSectionRef.current) {
                heroSectionRef.current.classList.add('video-fallback');
              }
            });
          }, 100);
        } catch (error) {
          console.error("Video play failed:", error);
          // If autoplay fails, make video static background instead
          if (videoRef.current) {
            videoRef.current.pause();
            // Add fallback class
            if (heroSectionRef.current) {
              heroSectionRef.current.classList.add('video-fallback');
            }
          }
        }
      };
      
      playVideo();
      
      // Add event listeners for error handling
      const handleVideoError = () => {
        console.error("Video error occurred");
        if (heroSectionRef.current) {
          heroSectionRef.current.classList.add('video-fallback');
        }
      };
      
      videoRef.current.addEventListener('error', handleVideoError);
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('error', handleVideoError);
        }
        clearTimeout(loadTimer);
      };
    }
  }, []);

  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    setIsLoggedIn(storedLoggedIn);
    setUserType(storedUserType || null);

    // If a token is present, verify it's still valid by calling a protected route
    if (token && userId) {
      axios
        .get(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            // token expired => log out
            localStorage.clear();
            setIsLoggedIn(false);
            setUserType(null);
          }
        });
    }

    // Enhanced scroll handler that also tracks current section
    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
      
      // Get all sections
      const sections = document.querySelectorAll('section[id]');
      
      // Find the current section
      let current = '';
      sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 300) {
          current = section.getAttribute('id');
        }
      });
      
      if (current && current !== currentSection) {
        setCurrentSection(current);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    // Initialize animation triggers
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animated');
        }
      });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(element => {
      observer.observe(element);
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, [currentSection]);

  // Handlers for CTA
  const handleInfluencerClick = () => {
    navigate('/signup/influencer');
  };
  
  const handleBrandClick = () => {
    navigate('/signup/brand');
  };

  // Auth-related handlers - kept for future use
  const handleAuthentication = (path) => {
    navigate(path);
  };
  
  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop,
        behavior: 'smooth'
      });
    }
  };
  
  // Book demo function
  const handleBookDemo = () => {
    // Open modal or navigate to booking page
    navigate('/book-demo');
  };

  return (
    <div className={`enhanced-landing-page ${scrolled ? 'scrolled' : ''} ${pageLoaded ? 'loaded' : ''}`}>
      {/* NavBar at top (fixed) */}
      <NavBar isLoggedIn={isLoggedIn} userType={userType} scrolled={scrolled} />

      {/* Floating Navigation Indicators */}
      <div className="section-indicators">
        <div 
          className={`indicator ${currentSection === 'hero' ? 'active' : ''}`} 
          onClick={() => scrollToSection('hero')}
          data-tooltip="Home"
        ></div>
        <div 
          className={`indicator ${currentSection === 'benefits' ? 'active' : ''}`} 
          onClick={() => scrollToSection('benefits')}
          data-tooltip="Benefits"
        ></div>
        <div 
          className={`indicator ${currentSection === 'brand-offerings' ? 'active' : ''}`} 
          onClick={() => scrollToSection('brand-offerings')}
          data-tooltip="For Brands"
        ></div>
        <div 
          className={`indicator ${currentSection === 'influencer-offerings' ? 'active' : ''}`} 
          onClick={() => scrollToSection('influencer-offerings')}
          data-tooltip="For Influencers"
        ></div>
        <div 
          className={`indicator ${currentSection === 'testimonials' ? 'active' : ''}`} 
          onClick={() => scrollToSection('testimonials')}
          data-tooltip="Testimonials"
        ></div>
        <div 
          className={`indicator ${currentSection === 'cta' ? 'active' : ''}`} 
          onClick={() => scrollToSection('cta')}
          data-tooltip="Get Started"
        ></div>
      </div>
{/* ========== ENHANCED HERO SECTION ========== */}
<section id="hero" className={`hero-section ${currentTheme}`} ref={heroSectionRef}>
  {/* Local video background container */}
  <div className="hero-video-container">
    <video 
      className="hero-video" 
      ref={videoRef} 
      muted 
      loop 
      playsInline
      poster="../assets/landingPage-fallback.jpg" // Fallback image if video fails
    >
      <source src={landingPageVideo} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
    <div className="hero-overlay"></div>
  </div>
  
  {/* Centered hero content */}
  <div className="hero-content">
    <div className="hero-title-container">
      <TypewriterTitle />
    </div>

    <p className="hero-subtitle">
      Get started today to know more
    </p>

    <div className="hero-cta">
      <button
        className="cta-button influencer-cta"
        onClick={handleInfluencerClick}
      >
        I AM INFLUENCER
      </button>
      <button
        className="cta-button brand-cta"
        onClick={handleBrandClick}
      >
        I AM BRAND
      </button>
    </div>
  </div>
  
  {/* Scroll indicator - centered at bottom */}
  <div className="scroll-indicator">
    <div className="scroll-arrow"></div>
    <p>SCROLL TO EXPLORE</p>
  </div>
</section>
      {/* ========== BENEFITS SECTION ========== */}
      <section 
        id="benefits"
        className="benefits-section" 
        style={{
          background: `url(${benefitsBkg}) center center / cover no-repeat`,
        }}
      >
        <div className="benefits-overlay">
          <div className="benefits-content">
            <h2 className="animate-on-scroll fade-up">FROM CONCEPT TO CONVERSION</h2>
            <p className="benefits-subtext animate-on-scroll fade-up">
              ELEVATE YOUR INFLUENCER MARKETING CAMPAIGNS USING OUR PLATFORM
            </p>
            <div className="benefits-boxes animate-on-scroll stagger-fade">
              <div className="benefit-box glow-on-hover">
                <div className="benefit-icon ai-icon"></div>
                <span>AI Powered</span>
              </div>
              <div className="benefit-box glow-on-hover">
                <div className="benefit-icon campaign-icon"></div>
                <span>Personalised Influencer Campaigns</span>
              </div>
              <div className="benefit-box glow-on-hover">
                <div className="benefit-icon collab-icon"></div>
                <span>Seamless Collaboration</span>
              </div>
              <div className="benefit-box glow-on-hover">
                <div className="benefit-icon diverse-icon"></div>
                <span>Diverse Creators</span>
              </div>
              <div className="benefit-box glow-on-hover">
                <div className="benefit-icon global-icon"></div>
                <span>Global Reach</span>
              </div>
              <div className="benefit-box glow-on-hover">
                <div className="benefit-icon trust-icon"></div>
                <span>Trusted Partnerships</span>
              </div>
            </div>
            
            {/* Stats Section */}
            <div className="platform-stats animate-on-scroll fade-up">
              <AnimatedStatistic 
                value={5000} 
                label="Influencers" 
                icon="👥" 
                delay={0} 
              />
              <AnimatedStatistic 
                value={1200} 
                label="Brands" 
                icon="🏢" 
                delay={200} 
              />
              <AnimatedStatistic 
                value={8500} 
                label="Campaigns" 
                icon="📊" 
                delay={400} 
              />
              <AnimatedStatistic 
                value={240} 
                label="Million Reach" 
                icon="🌎" 
                delay={600} 
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========== BRAND OFFERINGS ========== */}
      <section id="brand-offerings" className="brand-offerings-section">
        <div className="section-heading-container">
          <h2 className="section-heading animate-on-scroll fade-up">BRAND OFFERINGS</h2>
        </div>
        <div className="offerings-big-container">
          <div className="offering-box animate-on-scroll slide-in-left">
            <div className="offering-img-container">
              <img
                src={brandLeft}
                alt="Brand Campaign Management"
                className="offering-img hover-zoom"
              />
              <div className="offering-overlay">
                <div className="overlay-content">
                  <h3>Streamlined Management</h3>
                  <ul>
                    <li>Unified dashboard for all campaigns</li>
                    <li>Automated scheduling</li>
                    <li>Content approval workflows</li>
                  </ul>
                </div>
              </div>
            </div>
            <h3>Campaign Management</h3>
            <p>
              Start creating and managing impactful campaigns tailored for your
              brand needs, across all major marketing platforms.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Multi-platform</span>
              <span className="feature-tag">AI-assisted</span>
              <span className="feature-tag">Analytics</span>
            </div>
          </div>

          <div className="offering-box animate-on-scroll slide-in-right">
            <div className="offering-img-container">
              <img
                src={brandRight}
                alt="Brand Influencer Discovery"
                className="offering-img hover-zoom"
              />
              <div className="offering-overlay">
                <div className="overlay-content">
                  <h3>Advanced Matching</h3>
                  <ul>
                    <li>AI-powered creator recommendations</li>
                    <li>Audience demographics insights</li>
                    <li>Performance prediction</li>
                  </ul>
                </div>
              </div>
            </div>
            <h3>Influencer Discovery</h3>
            <p>
              Collaborate with creators using our advanced search filters and
              AI-powered recommendations tailored for your campaigns.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Smart-matching</span>
              <span className="feature-tag">Verified creators</span>
              <span className="feature-tag">Real-time data</span>
            </div>
          </div>
        </div>
        
        {/* Interactive Campaign Builder Preview */}
        <div className="campaign-builder-section animate-on-scroll fade-up">
          <h3 className="preview-title">Experience our Campaign Builder</h3>
          <CampaignBuilderPreview />
        </div>
      </section>

      {/* ========== INFLUENCER OFFERINGS ========== */}
      <section id="influencer-offerings" className="influencer-offerings-section">
        <div className="section-heading-container">
          <h2 className="section-heading animate-on-scroll fade-up">INFLUENCER OFFERINGS</h2>
        </div>
        <div className="offerings-big-container">
          <div className="offering-box animate-on-scroll slide-in-left">
            <div className="offering-img-container">
              <img
                src={inflLeft}
                alt="Influencer Brand Collaboration"
                className="offering-img hover-zoom"
              />
              <div className="offering-overlay">
                <div className="overlay-content">
                  <h3>Partnership Benefits</h3>
                  <ul>
                    <li>Personalized brand matching</li>
                    <li>Negotiation support</li>
                    <li>Long-term relationship building</li>
                  </ul>
                </div>
              </div>
            </div>
            <h3>Brand Collaboration</h3>
            <p>
              Access a variety of brand campaigns tailored to your niche,
              with enhanced visibility to top brands looking for creators
              like you.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Brand matching</span>
              <span className="feature-tag">Verified opportunities</span>
              <span className="feature-tag">Fair rates</span>
            </div>
          </div>

          <div className="offering-box animate-on-scroll slide-in-right">
            <div className="offering-img-container">
              <img
                src={inflRight}
                alt="Influencer Campaign Tracking"
                className="offering-img hover-zoom"
              />
              <div className="offering-overlay">
                <div className="overlay-content">
                  <h3>Workflow Features</h3>
                  <ul>
                    <li>Calendar integration</li>
                    <li>Revision tracking</li>
                    <li>Performance analytics</li>
                  </ul>
                </div>
              </div>
            </div>
            <h3>Campaigns Tracking</h3>
            <p>
              Seamlessly track all your campaign briefs, drafts and revisions
              in one place. Track deadlines and posting schedules easily
              through your dashboard.
            </p>
            <div className="feature-tags">
              <span className="feature-tag">Organized workflow</span>
              <span className="feature-tag">Deadline alerts</span>
              <span className="feature-tag">Content library</span>
            </div>
          </div>
        </div>
        
        {/* Enhanced Earnings Calculator */}
        <div className="calculator-container-wrapper animate-on-scroll fade-up">
          <EarningsCalculator />
        </div>
      </section>

      {/* ========== SUCCESS STORIES SECTION ========== */}
      <section id="testimonials" className="testimonials-section">
        <div className="section-heading-container">
          <h2 className="section-heading animate-on-scroll fade-up">SUCCESS STORIES</h2>
        </div>
        <div className="success-stories-container animate-on-scroll fade-up">
          <SuccessStoriesCarousel />
        </div>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section id="cta" className="call-to-action-section">
        <div className="cta-content animate-on-scroll fade-up">
          <h2>Take your marketing campaigns to the next level</h2>
          <div className="cta-features">
            <div className="cta-feature">
              <div className="feature-icon">🚀</div>
              <p>AI-powered campaign creation</p>
            </div>
            <div className="cta-feature">
              <div className="feature-icon">💡</div>
              <p>Data-driven creator matching</p>
            </div>
            <div className="cta-feature">
              <div className="feature-icon">📊</div>
              <p>Real-time performance tracking</p>
            </div>
          </div>
          <button className="cta-demo-btn shine-effect" onClick={handleBookDemo}>
            Book Your Demo
          </button>
        </div>
        <div className="cta-dashboard-img animate-on-scroll slide-in-right">
          <div className="dashboard-hover-effect"></div>
          <img src={dashboardImg} alt="Dashboard" className="floating-animation" />
        </div>
        
        {/* Floating Notification Animation */}
        <FloatingNotifications />
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="enhanced-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h3>Let'sFYI</h3>
            <p>Transforming influencer marketing with AI and data-driven insights.</p>
            <div className="social-icons">
              <a href="https://www.linkedin.com" className="social-icon" aria-label="LinkedIn"><i className="linkedin-icon">in</i></a>
              <a href="https://www.twitter.com" className="social-icon" aria-label="Twitter"><i className="twitter-icon">𝕏</i></a>
              <a href="https://www.instagram.com" className="social-icon" aria-label="Instagram"><i className="instagram-icon">📷</i></a>
            </div>
          </div>
          
          <div className="footer-links-container">
            <div className="footer-links-column">
              <h4>Platform</h4>
              <ul>
                <li><a href="/brands">For Brands</a></li>
                <li><a href="/influencers">For Influencers</a></li>
                <li><a href="/pricing">Pricing</a></li>
                <li><a href="/case-studies">Case Studies</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Resources</h4>
              <ul>
                <li><a href="/blog">Blog</a></li>
                <li><a href="/knowledge-base">Knowledge Base</a></li>
                <li><a href="/api-docs">API Documentation</a></li>
                <li><a href="/support">Support</a></li>
              </ul>
            </div>
            
            <div className="footer-links-column">
              <h4>Company</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li><a href="/careers">Careers</a></li>
                <li><a href="/press">Press</a></li>
                <li><a href="/contact">Contact</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 Let'sFYI. All rights reserved.</p>
          <div className="footer-legal-links">
            <a href="/terms">Terms &amp; Conditions</a>
            <a href="/privacy">Privacy Policy</a>
            <a href="/cookies">Cookie Policy</a>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AiChatbot />
      
      {/* Back to Top Button */}
      <button className="back-to-top" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
        <span>↑</span>
      </button>
    </div>
  );
}

export default LandingPage;