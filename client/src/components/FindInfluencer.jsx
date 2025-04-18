import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AiChatbot from "./AiChatbot.jsx";
import axios from "axios";
import "./FindInfluencer.css"; // New ultra-premium CSS file
import NavBar from "./NavBar.jsx";

function FindInfluencer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const filtersRef = useRef(null);
  const searchInputRef = useRef(null);
  const mainContainerRef = useRef(null);
  const canvasRef = useRef(null);

  // -------------------------------
  // STATES
  // -------------------------------
  const [filters, setFilters] = useState({
    experience: "",
    followers: "",
    influencerLocation: "",
    majorityAudienceLocation: "",
    audienceAgeGroup: "",
    audienceGenderDemographics: "",
    industry: "",
    platforms: [],
  });

  const [tempPlatformSelection, setTempPlatformSelection] = useState([]);
  const [allInfluencers, setAllInfluencers] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  const [selectedCampaignMap, setSelectedCampaignMap] = useState({});
  
  // Animation and UI states
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilterTab, setActiveFilterTab] = useState("basic");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [focusedCard, setFocusedCard] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [sortOption, setSortOption] = useState("followers");
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [mouseCursor, setMouseCursor] = useState({ x: 0, y: 0 });
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [transitionState, setTransitionState] = useState({
    isActive: false,
    influencerId: null
  });

  // Options
  const locationOptions = [
    "--Select--",
    "United States",
    "Canada",
    "United Kingdom",
    "Australia",
    "India",
    "Germany",
    "France",
    "London",
    "Others",
  ];
  const industryOptions = [
    "Agriculture", "Aviation", "Beauty", "Biotechnology", "Chemical",
    "Construction", "Defense and Security", "E-commerce", "Education",
    "Energy", "Event Planning", "Fashion", "Finance", "Fintech", "Fitness",
    "Food", "Fundraising", "Gaming", "Healthcare", "Hospitality Industry",
    "Insurance", "Legal Services", "Logistics", "Luxury Goods", "Marine",
    "Mining", "Pet Care", "Pharmaceutics", "Photography", "Real Estate",
    "Retail", "Space", "Sports", "Technology", "Telecommunication",
    "Travel", "Utilities"
  ];
  const platformOptions = [
    "Instagram", "LinkedIn", "Facebook", "Twitch", "Reddit", "Pinterest",
    "TikTok", "X", "Youtube", "Threads", "Quora", "Discord", "Snapchat"
  ];

  // Platform icons mapping (using emoji as placeholders - you could replace with SVG icons)
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

  // Environment variable for API base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

  // -------------------------------
  // CANVAS BACKGROUND ANIMATION
  // -------------------------------
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
    const numberOfParticles = 100;
    
    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.color = `hsla(${Math.random() * 60 + 200}, 80%, 60%, ${Math.random() * 0.3 + 0.1})`;
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
          
          if (distance < 100) {
            const opacity = 1 - distance / 100;
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
    
    // Mouse interaction
    const mouse = {
      x: undefined,
      y: undefined,
      radius: 150
    };
    
    canvas.addEventListener('mousemove', (e) => {
      mouse.x = e.x;
      mouse.y = e.y;
    });
    
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
        
        // Mouse interaction
        if (mouse.x && mouse.y) {
          const dx = particlesArray[i].x - mouse.x;
          const dy = particlesArray[i].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (mouse.radius - distance) / mouse.radius;
            particlesArray[i].x += Math.cos(angle) * force * 3;
            particlesArray[i].y += Math.sin(angle) * force * 3;
          }
        }
      }
      
      connectParticles();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', () => {});
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // -------------------------------
  // CUSTOM CURSOR EFFECT
  // -------------------------------
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseCursor({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // -------------------------------
  // INITIAL LOADING SEQUENCE
  // -------------------------------
  useEffect(() => {
    // Staggered animation sequence for initial load
    const timer1 = setTimeout(() => {
      setIsInitialLoad(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer1);
    };
  }, []);

  // -------------------------------
  // FETCH DATA WITH LOADING EFFECTS
  // -------------------------------
  useEffect(() => {
    if (!token) return;
    
    setIsLoading(true);
    
    // Simulate staggered loading for visual effect
    const fetchInfluencers = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/influencer/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        if (res.data.influencers) {
          // Sort data initially
          const sorted = sortInfluencers(res.data.influencers, sortOption);
          setAllInfluencers(sorted);
          setInfluencers(sorted);
          
          // Staggered card appearance animation
          setTimeout(() => {
            setIsLoading(false);
          }, 800);
        }
      } catch (err) {
        console.error("Error fetching influencers:", err);
        setIsLoading(false);
      }
    };

    fetchInfluencers();
  }, [token, API_BASE_URL, sortOption]);

  // Fetch campaigns
  useEffect(() => {
    if (!token) return;
    
    axios
      .get(`${API_BASE_URL}/api/brand/my-campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.campaigns) {
          setBrandCampaigns(res.data.campaigns);
        }
      })
      .catch((err) => console.error("Error fetching brand campaigns:", err));
  }, [token, API_BASE_URL]);

  // -------------------------------
  // FILTER LOGIC with animations
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Add ripple effect animation
    const input = e.target;
    const ripple = document.createElement('span');
    ripple.className = 'input-ripple';
    input.parentNode.appendChild(ripple);
    
    setTimeout(() => {
      input.parentNode.removeChild(ripple);
    }, 600);
    
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handlePlatformSelect = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) {
        selected.push(options[i].value);
      }
    }
    setTempPlatformSelection(selected);
  };

  const handleAddPlatforms = () => {
    if (tempPlatformSelection.length === 0) return;
    
    // Animation for adding platforms
    const platformsContainer = document.querySelector('.platform-tags-container');
    if (platformsContainer) {
      platformsContainer.classList.add('tag-pulse');
      setTimeout(() => {
        platformsContainer.classList.remove('tag-pulse');
      }, 700);
    }
    
    setFilters((prev) => ({
      ...prev,
      platforms: Array.from(new Set([...prev.platforms, ...tempPlatformSelection])),
    }));
    
    // Clear selection after adding
    setTempPlatformSelection([]);
  };

  const handleRemovePlatform = (platform) => {
    // Animation for tag removal
    const tag = document.querySelector(`.premium-platform-tag[data-platform="${platform}"]`);
    if (tag) {
      tag.classList.add('tag-remove');
    }
    
    setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        platforms: prev.platforms.filter(p => p !== platform)
      }));
    }, 300);
  };

  const handleSearchChange = (e) => {
    // Search animation effect
    const searchInput = searchInputRef.current;
    if (searchInput) {
      searchInput.classList.add('premium-search-active');
      setTimeout(() => {
        searchInput.classList.remove('premium-search-active');
      }, 500);
    }
    
    setSearchTerm(e.target.value);
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const changeFilterTab = (tab) => {
    // Tab switching animation
    const tabElement = document.querySelector(`.premium-filter-tab-btn[data-tab="${tab}"]`);
    if (tabElement) {
      tabElement.classList.add('tab-active');
      
      // Reset other tabs
      document.querySelectorAll('.premium-filter-tab-btn').forEach(el => {
        if (el.getAttribute('data-tab') !== tab) {
          el.classList.remove('tab-active');
        }
      });
    }
    
    setActiveFilterTab(tab);
  };

  // Toggle dark/light mode
  const toggleThemeMode = () => {
    document.body.classList.toggle('light-mode');
    setIsDarkMode(!isDarkMode);
  };

  // Sort influencers based on selected option
  const sortInfluencers = (influencers, option) => {
    const sortedInfluencers = [...influencers];
    
    switch (option) {
      case 'followers':
        return sortedInfluencers.sort((a, b) => (b.numFollowers || 0) - (a.numFollowers || 0));
      case 'experience':
        return sortedInfluencers.sort((a, b) => (b.experience || 0) - (a.experience || 0));
      case 'rating':
        return sortedInfluencers.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
      default:
        return sortedInfluencers;
    }
  };

  const handleSortChange = (option) => {
    // Don't sort if already selected
    if (option === sortOption) return;
    
    // Animate the sort button
    const sortBtn = document.querySelector(`.sort-btn[data-sort="${option}"]`);
    if (sortBtn) {
      sortBtn.classList.add('sort-btn-active');
      setTimeout(() => {
        sortBtn.classList.remove('sort-btn-active');
      }, 500);
    }
    
    setSortOption(option);
    
    // Animation for sorting change
    setIsLoading(true);
    
    setTimeout(() => {
      setInfluencers(sortInfluencers([...influencers], option));
      setIsLoading(false);
    }, 500);
  };

  // APPLY FILTERS with fluid animations
  const handleApplyFilters = () => {
    // Start loading animation
    setIsLoading(true);
    
    // Add button click effect
    const button = document.querySelector('.premium-apply-btn');
    if (button) {
      button.classList.add('btn-pulse');
      setTimeout(() => {
        button.classList.remove('btn-pulse');
      }, 500);
    }
    
    setTimeout(() => {
      let filtered = [...allInfluencers];

      // search bar
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        filtered = filtered.filter((inf) =>
          inf.name.toLowerCase().includes(term)
        );
      }

      // experience
      if (filters.experience) {
        const exp = parseInt(filters.experience, 10);
        if (!isNaN(exp)) {
          filtered = filtered.filter((inf) => inf.experience >= exp);
        }
      }

      // followers
      if (filters.followers) {
        const f = parseInt(filters.followers.replace(/\D/g, ""), 10);
        if (!isNaN(f)) {
          filtered = filtered.filter((inf) => inf.numFollowers >= f);
        }
      }

     // Modified filter with case-insensitive comparison
if (filters.influencerLocation && filters.influencerLocation !== "--Select--") {
  filtered = filtered.filter(
    (inf) => inf.influencerLocation?.toLowerCase() === filters.influencerLocation.toLowerCase()
  );
}
      // majorityAudienceLocation
      if (
        filters.majorityAudienceLocation &&
        filters.majorityAudienceLocation !== "--Select--"
      ) {
        filtered = filtered.filter(
          (inf) => inf.majorityAudienceLocation === filters.majorityAudienceLocation
        );
      }

      // audienceAgeGroup
      if (filters.audienceAgeGroup.trim()) {
        const aag = filters.audienceAgeGroup.toLowerCase();
        filtered = filtered.filter((inf) =>
          inf.audienceAgeGroup?.toLowerCase().includes(aag)
        );
      }

      // audienceGenderDemographics
      if (filters.audienceGenderDemographics.trim()) {
        const agd = filters.audienceGenderDemographics.toLowerCase();
        filtered = filtered.filter((inf) =>
          inf.audienceGenderDemographics?.toLowerCase().includes(agd)
        );
      }

      // industry
      if (filters.industry) {
        filtered = filtered.filter((inf) =>
          inf.industries?.includes(filters.industry)
        );
      }

      // platforms
      if (filters.platforms.length > 0) {
        filtered = filtered.filter((inf) => {
          const intersection = inf.nichePlatforms?.filter((p) =>
            filters.platforms.includes(p)
          );
          return intersection && intersection.length > 0;
        });
      }
      
      // Sort the filtered results
      filtered = sortInfluencers(filtered, sortOption);
      
      // If on mobile, close filter panel after applying
      if (window.innerWidth <= 768) {
        setShowMobileFilters(false);
      }
      
      // Update state with filtered results
      setInfluencers(filtered);
      setIsLoading(false);
      
      // Show results count notification
      setSuccessMessage(`Found ${filtered.length} influencers`);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }, 800);
  };

  // REMOVE ALL FILTERS with fluid animations
  const handleRemoveAllFilters = () => {
    // Start loading animation
    setIsLoading(true);
    
    // Add button click effect
    const button = document.querySelector('.premium-reset-btn');
    if (button) {
      button.classList.add('btn-pulse');
      setTimeout(() => {
        button.classList.remove('btn-pulse');
      }, 500);
    }
    
    // Clear all form fields with animation
    document.querySelectorAll('.premium-filter-input').forEach(input => {
      input.classList.add('input-clear');
      setTimeout(() => {
        input.classList.remove('input-clear');
      }, 500);
    });
    
    setFilters({
      experience: "",
      followers: "",
      influencerLocation: "",
      majorityAudienceLocation: "",
      audienceAgeGroup: "",
      audienceGenderDemographics: "",
      industry: "",
      platforms: [],
    });
    setTempPlatformSelection([]);
    setSearchTerm("");
    
    setTimeout(() => {
      // Reset to original sorted data
      const sorted = sortInfluencers([...allInfluencers], sortOption);
      setInfluencers(sorted);
      setIsLoading(false);
      
      // Show confirmation message
      setSuccessMessage("All filters cleared");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 600);
  };

  // Card hover and interaction effects
  const handleCardHover = (id, isHovering, e) => {
    if (e) {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left; // x position within the element
      const y = e.clientY - rect.top;  // y position within the element
      setHoverPosition({ x, y });
    }
    
    setFocusedCard(isHovering ? id : null);
  };

  // 4) View Profile with transition effect
  const handleViewProfile = (influencerId) => {
    // Update state to trigger the transition animation
    setTransitionState({
      isActive: true,
      influencerId
    });
    
    // Wait for animation to complete before navigating
    setTimeout(() => {
      navigate(`/influencer-profile/${influencerId}`);
    }, 900);
  };

  // 5) star rating with animation
  const renderStars = (rating) => {
    if (rating == null || rating === 0) {
      return (
        <div className="premium-no-rating">
          <span className="premium-rating-text">No rating yet</span>
        </div>
      );
    }
    
    const rounded = Math.round(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(
          <span key={i} className="premium-filled-star">
            <span className="star-glow">★</span>
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="premium-empty-star">
            ★
          </span>
        );
      }
    }
    
    return <div className="premium-star-rating">{stars}</div>;
  };

  // 6) Track selected campaign
  const handleCampaignSelect = (influencerId, campaignId) => {
    // Add selection animation
    const select = document.querySelector(`.campaign-select-${influencerId}`);
    if (select) {
      select.classList.add('select-active');
      setTimeout(() => {
        select.classList.remove('select-active');
      }, 500);
    }
    
    setSelectedCampaignMap((prev) => ({
      ...prev,
      [influencerId]: campaignId,
    }));
  };

  // 7) Send invite with enhanced UI feedback
  const handleSendInvite = async (influencerId) => {
    const selectedCampaignId = selectedCampaignMap[influencerId];
    if (!selectedCampaignId) {
      // Show animated error tooltip
      const button = document.querySelector(`.invite-btn-${influencerId}`);
      if (button) {
        button.classList.add('btn-error');
        
        const tooltip = document.createElement('div');
        tooltip.className = 'premium-error-tooltip';
        tooltip.textContent = 'Please select a campaign first';
        button.appendChild(tooltip);
        
        setTimeout(() => {
          button.classList.remove('btn-error');
          button.removeChild(tooltip);
        }, 3000);
      }
      return;
    }
    
    // Add loading animation to button
    const button = document.querySelector(`.invite-btn-${influencerId}`);
    if (button) {
      button.classList.add('btn-loading');
      button.disabled = true;
      button.innerHTML = '<span class="loading-spinner"></span>';
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/brand/invite-influencer`,
        {
          influencerId,
          campaignId: selectedCampaignId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Success animation
      if (button) {
        button.classList.remove('btn-loading');
        button.classList.add('btn-success');
        button.innerHTML = '<span class="success-icon">✓</span> Sent!';
        
        setTimeout(() => {
          button.classList.remove('btn-success');
          button.disabled = false;
          button.innerHTML = 'Send Invite';
        }, 3000);
      }
      
      // Show success notification
      setSuccessMessage("Invite sent successfully!");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      
    } catch (err) {
      console.error("Error sending invite:", err);
      
      // Error animation
      if (button) {
        button.classList.remove('btn-loading');
        button.classList.add('btn-error');
        button.innerHTML = '<span class="error-icon">×</span> Failed';
        
        setTimeout(() => {
          button.classList.remove('btn-error');
          button.disabled = false;
          button.innerHTML = 'Send Invite';
        }, 3000);
      }
      
      // Show error notification
      setSuccessMessage("Failed to send invite. Please try again.");
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
    }
  };

  return (
    <div className="premium-finder-universe" ref={mainContainerRef}>
      {/* Initial loading screen */}
      {isInitialLoad && (
        <div className="premium-initial-loader">
          <div className="loader-content">
            <div className="loader-logo">Let'sFYI</div>
            <div className="loader-spinner">
              <div className="spinner-circles">
                <div></div>
                <div></div>
                <div></div>
              </div>
            </div>
            <div className="loader-text">Preparing Your Influencer Discovery...</div>
          </div>
        </div>
      )}
      
      {/* Dynamic Canvas Background */}
      <canvas ref={canvasRef} className="premium-background-canvas"></canvas>
      
      {/* Custom cursor effect */}
      <div 
        className={`premium-cursor ${focusedCard ? 'cursor-active' : ''}`}
        style={{ 
          left: `${mouseCursor.x}px`, 
          top: `${mouseCursor.y}px`
        }}
      >
        <div className="cursor-dot"></div>
        <div className="cursor-ring"></div>
      </div>
      
      {/* Profile transition effect */}
      <div className={`profile-transition-overlay ${transitionState.isActive ? 'active' : ''}`}>
        <div className="transition-circles">
          <div className="circle circle-1"></div>
          <div className="circle circle-2"></div>
          <div className="circle circle-3"></div>
        </div>
      </div>
      
      {/* Success notification */}
      <div className={`premium-notification-1 ${showSuccess ? 'show' : ''}`}>
        <div className="notification-icon-1">✓</div>
        <div className="notification-message-1">{successMessage}</div>
        <div className="notification-progress-1"></div>
      </div>
      
      {/* Theme toggle */}
      <button 
        className={`theme-toggle-btn ${isDarkMode ? 'dark' : 'light'}`}
        onClick={toggleThemeMode}
      >
        <div className="toggle-icon">
          <span className="light-icon">☀️</span>
          <span className="dark-icon">🌙</span>
        </div>
      </button>
      
      {/* Fixed NavBar at the top */}
      <NavBar />

      {/* Main content container */}
      <div className="premium-finder-container">
        {/* Mobile filter toggle */}
        <button 
          className={`premium-filter-toggle ${showMobileFilters ? 'active' : ''}`} 
          onClick={toggleMobileFilters}
        >
          <span className="filter-icon">⚙️</span>
          <span className="filter-text">{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
        
        {/* FILTERS SECTION */}
        <div className={`premium-filters-panel ${showMobileFilters ? 'mobile-active' : ''}`}>
          <div className="premium-glass-effect"></div>
          <div className="premium-filters-glow"></div>
          
          <div className="premium-filters-content">
            <h2 className="premium-section-title">
              <span className="title-icon">🔍</span>
              Find Influencers
              <div className="title-underline"></div>
            </h2>
            
            {/* Filter tabs for better organization */}
            <div className="premium-filter-tabs">
              <button 
                className={`premium-filter-tab-btn ${activeFilterTab === 'basic' ? 'active' : ''}`}
                data-tab="basic"
                onClick={() => changeFilterTab('basic')}
              >
                <span className="tab-icon">⭐</span>
                Basic Filters
              </button>
              <button 
                className={`premium-filter-tab-btn ${activeFilterTab === 'audience' ? 'active' : ''}`}
                data-tab="audience"
                onClick={() => changeFilterTab('audience')}
              >
                <span className="tab-icon">👨‍👩‍👧‍👦</span>
                Audience
              </button>
              <button 
                className={`premium-filter-tab-btn ${activeFilterTab === 'platforms' ? 'active' : ''}`}
                data-tab="platforms"
                onClick={() => changeFilterTab('platforms')}
              >
                <span className="tab-icon">📱</span>
                Platforms
              </button>
            </div>
            
            {/* Basic Filters Tab */}
            <div className={`premium-filter-tab-content ${activeFilterTab === 'basic' ? 'active' : ''}`}>
              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">⭐</span>
                  Experience (Years)
                </label>
                <div className="input-container">
                  <input
                    type="number"
                    name="experience"
                    placeholder="Min years"
                    value={filters.experience}
                    onChange={handleChange}
                    className="premium-filter-input"
                  />
                  <div className="input-focus-effect"></div>
                </div>
              </div>

              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">👥</span>
                  Number of Followers
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    name="followers"
                    placeholder="e.g., >10000"
                    value={filters.followers}
                    onChange={handleChange}
                    className="premium-filter-input"
                  />
                  <div className="input-focus-effect"></div>
                </div>
              </div>

              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">📍</span>
                  Influencer Location
                </label>
                <div className="select-container">
                  <select
                    name="influencerLocation"
                    value={filters.influencerLocation}
                    onChange={handleChange}
                    className="premium-filter-select"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                  <div className="select-focus-effect"></div>
                </div>
              </div>
              
              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">🏭</span>
                  Industry Category
                </label>
                <div className="select-container">
                  <select
                    name="industry"
                    value={filters.industry}
                    onChange={handleChange}
                    className="premium-filter-select"
                  >
                    <option value="">Select Industry</option>
                    {industryOptions.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                  <div className="select-focus-effect"></div>
                </div>
              </div>
            </div>
            
            {/* Audience Filters Tab */}
            <div className={`premium-filter-tab-content ${activeFilterTab === 'audience' ? 'active' : ''}`}>
              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">🌎</span>
                  Audience Location
                </label>
                <div className="select-container">
                  <select
                    name="majorityAudienceLocation"
                    value={filters.majorityAudienceLocation}
                    onChange={handleChange}
                    className="premium-filter-select"
                  >
                    {locationOptions.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow">▼</div>
                  <div className="select-focus-effect"></div>
                </div>
              </div>

              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">👨‍👩‍👧‍👦</span>
                  Audience Age Group
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    name="audienceAgeGroup"
                    placeholder="e.g., 18–25"
                    value={filters.audienceAgeGroup}
                    onChange={handleChange}
                    className="premium-filter-input"
                  />
                  <div className="input-focus-effect"></div>
                </div>
              </div>

              <div className="premium-filter-item">
                <label>
                  <span className="filter-icon">👫</span>
                  Gender Demographics
                </label>
                <div className="input-container">
                  <input
                    type="text"
                    name="audienceGenderDemographics"
                    placeholder="e.g., 70% Female"
                    value={filters.audienceGenderDemographics}
                    onChange={handleChange}
                    className="premium-filter-input"
                  />
                  <div className="input-focus-effect"></div>
                </div>
              </div>
            </div>
            
            {/* Platforms Filters Tab */}
            <div className={`premium-filter-tab-content ${activeFilterTab === 'platforms' ? 'active' : ''}`}>
              <div className="premium-filter-item platforms-filter">
                <label>
                  <span className="filter-icon">📱</span>
                  Niche Platforms
                </label>
                <div className="platform-select-container">
                  <select 
                    multiple 
                    onChange={handlePlatformSelect}
                    className="premium-platform-select"
                    value={tempPlatformSelection}
                  >
                    {platformOptions.map((plat) => (
                      <option key={plat} value={plat}>
                        <span className="platform-option-icon">{platformIcons[plat]}</span>
                        {plat}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="premium-add-platforms-btn" 
                    onClick={handleAddPlatforms}
                  >
                    <div className="btn-glow"></div>
                    <span className="btn-icon">+</span>
                    <span className="btn-text">Add</span>
                  </button>
                </div>

                {/* Selected platforms tags with animations */}
                {filters.platforms.length > 0 && (
                  <div className="platform-tags-container">
                    {filters.platforms.map((p, idx) => (
                      <span
                        key={idx}
                        className="premium-platform-tag"
                        data-platform={p}
                      >
                        <span className="platform-icon">{platformIcons[p] || '🔗'}</span>
                        {p}
                        <button 
                          className="tag-remove-btn" 
                          onClick={() => handleRemovePlatform(p)}
                        >
                          ×
                        </button>
                        <div className="tag-glow"></div>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Filter action buttons */}
            <div className="premium-filter-actions">
              <button 
                className="premium-apply-btn" 
                onClick={handleApplyFilters}
              >
                <div className="btn-glow"></div>
                <span className="btn-text">Apply Filters</span>
                <span className="btn-icon">✓</span>
              </button>
              <button
                className="premium-reset-btn"
                onClick={handleRemoveAllFilters}
              >
                <span className="btn-text">Reset</span>
                <span className="btn-icon">↺</span>
              </button>
            </div>
          </div>
        </div>

        {/* INFLUENCERS SECTION */}
        <div className="premium-influencers-panel">
          <div className="premium-search-section">
            <div className="premium-search-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="premium-search-input"
              />
              <div className="search-icon-container">
                <span className="search-icon">🔍</span>
              </div>
              <div className="search-input-glow"></div>
            </div>
            
            {/* Results count and sorting options */}
            <div className="premium-results-tools">
              <div className="results-count">
                <div className="count-bubble">
                  <span className="count-number">{influencers.length}</span>
                </div>
                <span className="count-label">influencers found</span>
              </div>
              
              <div className="premium-sort-options">
                <span className="sort-label">Sort by:</span>
                <div className="sort-buttons">
                  <button 
                    className={`sort-btn ${sortOption === 'followers' ? 'active' : ''}`}
                    data-sort="followers"
                    onClick={() => handleSortChange('followers')}
                  >
                    <span className="sort-icon">👥</span>
                    Followers
                  </button>
                  <button 
                    className={`sort-btn ${sortOption === 'experience' ? 'active' : ''}`}
                    data-sort="experience"
                    onClick={() => handleSortChange('experience')}
                  >
                    <span className="sort-icon">⭐</span>
                    Experience
                  </button>
                  <button 
                    className={`sort-btn ${sortOption === 'rating' ? 'active' : ''}`}
                    data-sort="rating"
                    onClick={() => handleSortChange('rating')}
                  >
                    <span className="sort-icon">⭐⭐</span>
                    Rating
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="premium-loading-container">
              <div className="premium-loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-center"></div>
              </div>
              <p className="loading-text">Discovering perfect influencers...</p>
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          ) : (
            <div className="premium-influencers-grid">
              {influencers.length === 0 ? (
                <div className="premium-no-results">
                  <div className="no-results-icon">🔍</div>
                  <div className="no-results-illustration">
                    <div className="illustration-magnifier"></div>
                    <div className="illustration-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                  <h3>No influencers match your filters</h3>
                  <p>Try adjusting your search criteria</p>
                  <button 
                    className="premium-reset-search-btn"
                    onClick={handleRemoveAllFilters}
                  >
                    <div className="btn-glow"></div>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                influencers.map((inf, index) => (
                  <div 
                    key={inf._id} 
                    className={`premium-influencer-card ${focusedCard === inf._id ? 'focused' : ''}`}
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                    }}
                    onMouseEnter={(e) => handleCardHover(inf._id, true, e)}
                    onMouseLeave={(e) => handleCardHover(inf._id, false, e)}
                  >
                    <div className="card-glow-effect"></div>
                    <div className="card-hover-effect" style={{ 
                      left: `${hoverPosition.x}px`, 
                      top: `${hoverPosition.y}px` 
                    }}></div>
                    
                    <div className="premium-card-content">
                      {/* Card header with avatar */}
                      <div className="premium-card-header">
                        <div className="avatar-container">
                          <div className="avatar-glow"></div>
                          <img
                            src={inf.profileImage || "https://via.placeholder.com/60"}
                            alt={inf.name}
                            className="premium-profile-image"
                          />
                          <div className="avatar-highlight"></div>
                        </div>
                        <div className="premium-card-info">
                          <h3 className="influencer-name">{inf.name}</h3>
                          <p className="influencer-location">
                            <span className="location-icon">📍</span>
                            {inf.influencerLocation || "N/A"}
                          </p>
                        </div>
                        {/* Rating */}
                        <div className="premium-rating-container">
                          {renderStars(inf.averageRating)}
                        </div>
                      </div>

                      {/* Niche Platforms with icons */}
                      <div className="premium-platform-tags">
                        {inf.nichePlatforms?.slice(0, 4).map((tag, index) => (
                          <span key={index} className="premium-platform-tag card-tag">
                            <span className="platform-icon">{platformIcons[tag] || '🔗'}</span>
                            {tag}
                            <div className="tag-glow"></div>
                          </span>
                        ))}
                        {inf.nichePlatforms?.length > 4 && (
                          <span className="more-platforms">+{inf.nichePlatforms.length - 4}</span>
                        )}
                      </div>

                      {/* Stats with visualization */}
                      <div className="premium-stats-container">
                        <div className="premium-stat">
                          <div className="stat-label">
                            <span className="stat-icon">👥</span>
                            Followers
                          </div>
                          <div className="stat-value-container">
                            <div 
                              className="stat-bar"
                              style={{ 
                                width: `${Math.min(100, (inf.numFollowers || 0) / 1000)}%` 
                              }}
                            >
                              <div className="stat-bar-glow"></div>
                            </div>
                            <span className="stat-value">{inf.numFollowers?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                        
                        <div className="premium-stat">
                          <div className="stat-label">
                            <span className="stat-icon">⭐</span>
                            Experience
                          </div>
                          <div className="stat-value-container">
                            <div 
                              className="stat-bar"
                              style={{ 
                                width: `${Math.min(100, ((inf.experience || 0) / 10) * 100)}%` 
                              }}
                            >
                              <div className="stat-bar-glow"></div>
                            </div>
                            <span className="stat-value">{inf.experience || 0} years</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive buttons for expanded view */}
                      <div className="premium-card-details">
                        <div className="details-header">
                          <h4>Audience Demographics</h4>
                          <div className="details-underline"></div>
                        </div>
                        
                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-icon">🌎</span>
                            <span className="detail-label">Location</span>
                            <span className="detail-value">{inf.majorityAudienceLocation || "N/A"}</span>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-icon">👨‍👩‍👧‍👦</span>
                            <span className="detail-label">Age</span>
                            <span className="detail-value">{inf.audienceAgeGroup || "N/A"}</span>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-icon">👫</span>
                            <span className="detail-label">Gender</span>
                            <span className="detail-value">{inf.audienceGenderDemographics || "N/A"}</span>
                          </div>
                          
                          <div className="detail-item">
                            <span className="detail-icon">🏭</span>
                            <span className="detail-label">Industries</span>
                            <span className="detail-value">
                              {inf.industries?.length 
                                ? (inf.industries.length > 2 
                                  ? `${inf.industries[0]}, ${inf.industries[1]}...` 
                                  : inf.industries.join(", ")) 
                                : "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Invite Section with animation */}
                      <div className="premium-invite-section">
                        <div className="select-container invite-select-container">
                          <select
                            className={`premium-campaign-select campaign-select-${inf._id}`}
                            value={selectedCampaignMap[inf._id] || ""}
                            onChange={(e) => handleCampaignSelect(inf._id, e.target.value)}
                          >
                            <option value="">--Select Campaign--</option>
                            {brandCampaigns.map((camp) => (
                              <option key={camp._id} value={camp._id}>
                                {camp.name}
                              </option>
                            ))}
                          </select>
                          <div className="select-arrow">▼</div>
                          <div className="select-focus-effect"></div>
                        </div>
                        <button
                          className={`premium-invite-btn invite-btn-${inf._id}`}
                          onClick={() => handleSendInvite(inf._id)}
                        >
                          <div className="btn-glow"></div>
                          Send Invite
                        </button>
                      </div>

                      <div className="premium-card-actions">
                        <button
                          className="premium-view-profile-btn"
                          onClick={() => handleViewProfile(inf._id)}
                        >
                          <div className="btn-glow"></div>
                          <span className="btn-text">View Full Profile</span>
                          <span className="btn-icon">→</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chatbot container */}
      <div className="premium-chatbot-wrapper">
        <div className="chatbot-pulse"></div>
        <div className="chatbot-container">
          <AiChatbot />
        </div>
      </div>
    </div>
  );
}

export default FindInfluencer;