import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AiChatbot from "./AiChatbot.jsx";
import axios from "axios";
import "./FindInfluencer.css"; // New unique CSS filename
import NavBar from "./NavBar.jsx";

function FindInfluencer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const filtersRef = useRef(null);
  const searchInputRef = useRef(null);
  const cardContainerRef = useRef(null);

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
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [sortOption, setSortOption] = useState("followers");
  const [transitionState, setTransitionState] = useState({
    filters: false,
    cards: false,
    search: false
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

  // Platform icons mapping (using emoji as placeholders)
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
  // Initial animations on load
  // -------------------------------
  useEffect(() => {
    // Staggered animation sequence
    setTimeout(() => {
      setTransitionState(prev => ({ ...prev, filters: true }));
    }, 300);
    
    setTimeout(() => {
      setTransitionState(prev => ({ ...prev, search: true }));
    }, 600);
    
    setTimeout(() => {
      setTransitionState(prev => ({ ...prev, cards: true }));
    }, 900);
    
    // Focus search input with pulsing animation
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 1500);
    }
    
    // Background particles/blobs effect
    const createBlob = () => {
      if (!cardContainerRef.current) return;
      
      const blob = document.createElement('div');
      blob.className = 'cosmic-blob';
      
      // Random properties
      const size = Math.random() * 200 + 50;
      const posX = Math.random() * window.innerWidth;
      const posY = Math.random() * window.innerHeight;
      const duration = Math.random() * 15 + 10;
      const hue = Math.random() * 60 + 200; // Blue range
      
      // Apply styles
      blob.style.width = `${size}px`;
      blob.style.height = `${size}px`;
      blob.style.left = `${posX}px`;
      blob.style.top = `${posY}px`;
      blob.style.animation = `float ${duration}s infinite alternate ease-in-out`;
      blob.style.background = `radial-gradient(circle at 30% 30%, hsla(${hue}, 70%, 60%, 0.08), hsla(${hue + 30}, 90%, 50%, 0.03))`;
      
      // Add to DOM
      document.body.appendChild(blob);
      
      // Remove after some time
      setTimeout(() => {
        document.body.removeChild(blob);
        if (document.body.contains(blob)) {
          createBlob();
        }
      }, duration * 1000);
    };
    
    // Create initial blobs
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        createBlob();
      }, i * 2000);
    }
    
    // Create new blobs periodically
    const blobInterval = setInterval(createBlob, 8000);
    
    return () => {
      clearInterval(blobInterval);
      // Remove any existing blobs when component unmounts
      document.querySelectorAll('.cosmic-blob').forEach(blob => {
        document.body.removeChild(blob);
      });
    };
  }, []);

  // -------------------------------
  // Fetch data with loading states
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
    
    // Add input animation
    const input = e.target;
    input.classList.add('input-pulse');
    setTimeout(() => {
      input.classList.remove('input-pulse');
    }, 500);
    
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
    const tag = document.querySelector(`.platform-tag[data-platform="${platform}"]`);
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
    const searchBox = e.target.closest('.nebula-search-container');
    if (searchBox) {
      searchBox.classList.add('search-active');
      setTimeout(() => {
        searchBox.classList.remove('search-active');
      }, 500);
    }
    
    setSearchTerm(e.target.value);
  };

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  const changeFilterTab = (tab) => {
    // Tab switching animation
    const tabElement = document.querySelector(`.filter-tab-btn[data-tab="${tab}"]`);
    if (tabElement) {
      tabElement.classList.add('tab-active');
      
      // Reset other tabs
      document.querySelectorAll('.filter-tab-btn').forEach(el => {
        if (el !== tabElement) {
          el.classList.remove('tab-active');
        }
      });
    }
    
    setActiveFilterTab(tab);
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
    const button = document.querySelector('.cosmic-apply-btn');
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

      // influencerLocation
      if (
        filters.influencerLocation &&
        filters.influencerLocation !== "--Select--"
      ) {
        filtered = filtered.filter(
          (inf) => inf.influencerLocation === filters.influencerLocation
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
          inf.audienceAgeGroup.toLowerCase().includes(aag)
        );
      }

      // audienceGenderDemographics
      if (filters.audienceGenderDemographics.trim()) {
        const agd = filters.audienceGenderDemographics.toLowerCase();
        filtered = filtered.filter((inf) =>
          inf.audienceGenderDemographics.toLowerCase().includes(agd)
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
    const button = document.querySelector('.cosmic-reset-btn');
    if (button) {
      button.classList.add('btn-pulse');
      setTimeout(() => {
        button.classList.remove('btn-pulse');
      }, 500);
    }
    
    // Clear all form fields with animation
    document.querySelectorAll('.nebula-filter-input').forEach(input => {
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
  const handleCardHover = (id, isHovering) => {
    setFocusedCard(isHovering ? id : null);
  };

  // 4) View Profile with transition effect
  const handleViewProfile = (influencerId) => {
    // Create a visual transition effect
    const ripple = document.createElement('div');
    ripple.className = 'profile-transition-ripple';
    document.body.appendChild(ripple);
    
    setTimeout(() => {
      ripple.style.transform = 'scale(100)';
      ripple.style.opacity = '1';
      
      setTimeout(() => {
        navigate(`/influencer-profile/${influencerId}`);
      }, 400);
    }, 50);
  };

  // 5) star rating with animation
  const renderStars = (rating) => {
    if (rating == null || rating === 0) {
      return (
        <div className="nebula-no-rating">
          <span className="nebula-rating-text">No rating yet</span>
        </div>
      );
    }
    
    const rounded = Math.round(rating);
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(
          <span key={i} className="nebula-filled-star">
            <span className="star-glow">★</span>
          </span>
        );
      } else {
        stars.push(
          <span key={i} className="nebula-empty-star">
            ★
          </span>
        );
      }
    }
    
    return <div className="nebula-star-rating">{stars}</div>;
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
        tooltip.className = 'nebula-error-tooltip';
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
    <div className="nebula-finder-universe">
      {/* Animated background elements */}
      <div className="nebula-stars"></div>
      <div className="nebula-glow-container">
        <div className="nebula-glow nebula-glow-1"></div>
        <div className="nebula-glow nebula-glow-2"></div>
        <div className="nebula-glow nebula-glow-3"></div>
      </div>
      
      {/* Floating particles */}
      <div className="nebula-particles">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="nebula-particle"
            style={{ 
              animationDelay: `${i * 0.3}s`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          ></div>
        ))}
      </div>
      
      {/* Success notification */}
      <div className={`nebula-notification ${showSuccess ? 'show' : ''}`}>
        <div className="notification-icon">✓</div>
        <div className="notification-message">{successMessage}</div>
      </div>
      
      {/* Fixed NavBar at the top */}
      <NavBar />

      {/* Main content container */}
      <div className="nebula-finder-container">
        {/* Mobile filter toggle */}
        <button 
          className={`nebula-filter-toggle ${showMobileFilters ? 'active' : ''}`} 
          onClick={toggleMobileFilters}
        >
          <span className="filter-icon">⚙️</span>
          <span className="filter-text">{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
        
        {/* FILTERS SECTION */}
        <div className={`nebula-filters-panel ${showMobileFilters ? 'mobile-active' : ''} ${transitionState.filters ? 'appear' : ''}`}>
          <div className="nebula-filters-glow"></div>
          
          <div className="nebula-filters-content">
            <h2 className="nebula-section-title">
              <span className="title-icon">🔍</span>
              Find Influencers
              <div className="title-underline"></div>
            </h2>
            
            {/* Filter tabs for better organization */}
            <div className="nebula-filter-tabs">
              <button 
                className={`filter-tab-btn ${activeFilterTab === 'basic' ? 'active' : ''}`}
                data-tab="basic"
                onClick={() => changeFilterTab('basic')}
              >
                Basic Filters
              </button>
              <button 
                className={`filter-tab-btn ${activeFilterTab === 'audience' ? 'active' : ''}`}
                data-tab="audience"
                onClick={() => changeFilterTab('audience')}
              >
                Audience
              </button>
              <button 
                className={`filter-tab-btn ${activeFilterTab === 'platforms' ? 'active' : ''}`}
                data-tab="platforms"
                onClick={() => changeFilterTab('platforms')}
              >
                Platforms
              </button>
            </div>
            
            {/* Basic Filters Tab */}
            <div className={`nebula-filter-tab-content ${activeFilterTab === 'basic' ? 'active' : ''}`}>
              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">⭐</span>
                  Experience (Years)
                </label>
                <input
                  type="number"
                  name="experience"
                  placeholder="Min years"
                  value={filters.experience}
                  onChange={handleChange}
                  className="nebula-filter-input"
                />
              </div>

              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">👥</span>
                  Number of Followers
                </label>
                <input
                  type="text"
                  name="followers"
                  placeholder="e.g., >10000"
                  value={filters.followers}
                  onChange={handleChange}
                  className="nebula-filter-input"
                />
              </div>

              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">📍</span>
                  Influencer Location
                </label>
                <select
                  name="influencerLocation"
                  value={filters.influencerLocation}
                  onChange={handleChange}
                  className="nebula-filter-select"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">🏭</span>
                  Industry Category
                </label>
                <select
                  name="industry"
                  value={filters.industry}
                  onChange={handleChange}
                  className="nebula-filter-select"
                >
                  <option value="">Select Industry</option>
                  {industryOptions.map((ind) => (
                    <option key={ind} value={ind}>
                      {ind}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Audience Filters Tab */}
            <div className={`nebula-filter-tab-content ${activeFilterTab === 'audience' ? 'active' : ''}`}>
              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">🌎</span>
                  Audience Location
                </label>
                <select
                  name="majorityAudienceLocation"
                  value={filters.majorityAudienceLocation}
                  onChange={handleChange}
                  className="nebula-filter-select"
                >
                  {locationOptions.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">👨‍👩‍👧‍👦</span>
                  Audience Age Group
                </label>
                <input
                  type="text"
                  name="audienceAgeGroup"
                  placeholder="e.g., 18–25"
                  value={filters.audienceAgeGroup}
                  onChange={handleChange}
                  className="nebula-filter-input"
                />
              </div>

              <div className="nebula-filter-item">
                <label>
                  <span className="filter-icon">👫</span>
                  Gender Demographics
                </label>
                <input
                  type="text"
                  name="audienceGenderDemographics"
                  placeholder="e.g., 70% Female"
                  value={filters.audienceGenderDemographics}
                  onChange={handleChange}
                  className="nebula-filter-input"
                />
              </div>
            </div>
            
            {/* Platforms Filters Tab */}
            <div className={`nebula-filter-tab-content ${activeFilterTab === 'platforms' ? 'active' : ''}`}>
              <div className="nebula-filter-item platforms-filter">
                <label>
                  <span className="filter-icon">📱</span>
                  Niche Platforms
                </label>
                <div className="platform-select-container">
                  <select 
                    multiple 
                    onChange={handlePlatformSelect}
                    className="nebula-platform-select"
                    value={tempPlatformSelection}
                  >
                    {platformOptions.map((plat) => (
                      <option key={plat} value={plat}>
                        {plat}
                      </option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="nebula-add-platforms-btn" 
                    onClick={handleAddPlatforms}
                  >
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
                        className="platform-tag"
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
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Filter action buttons */}
            <div className="nebula-filter-actions">
              <button 
                className="cosmic-apply-btn" 
                onClick={handleApplyFilters}
              >
                <span className="btn-glow"></span>
                <span className="btn-text">Apply Filters</span>
                <span className="btn-icon">✓</span>
              </button>
              <button
                className="cosmic-reset-btn"
                onClick={handleRemoveAllFilters}
              >
                <span className="btn-text">Reset</span>
                <span className="btn-icon">↺</span>
              </button>
            </div>
          </div>
        </div>

        {/* INFLUENCERS SECTION */}
        <div className={`nebula-influencers-panel ${transitionState.cards ? 'appear' : ''}`} ref={cardContainerRef}>
          <div className={`nebula-search-section ${transitionState.search ? 'appear' : ''}`}>
            <div className="nebula-search-container">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="nebula-search-input"
              />
              <div className="search-icon-container">
                <span className="search-icon">🔍</span>
              </div>
              <div className="search-input-glow"></div>
            </div>
            
            {/* Results count and sorting options */}
            <div className="nebula-results-tools">
              <div className="results-count">
                <span className="count-number">{influencers.length}</span>
                <span className="count-label">found</span>
              </div>
              
              <div className="nebula-sort-options">
                <span className="sort-label">Sort by:</span>
                <div className="sort-buttons">
                  <button 
                    className={`sort-btn ${sortOption === 'followers' ? 'active' : ''}`}
                    onClick={() => handleSortChange('followers')}
                  >
                    Followers
                  </button>
                  <button 
                    className={`sort-btn ${sortOption === 'experience' ? 'active' : ''}`}
                    onClick={() => handleSortChange('experience')}
                  >
                    Experience
                  </button>
                  <button 
                    className={`sort-btn ${sortOption === 'rating' ? 'active' : ''}`}
                    onClick={() => handleSortChange('rating')}
                  >
                    Rating
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Loading state */}
          {isLoading ? (
            <div className="nebula-loading-container">
              <div className="cosmic-loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
              </div>
              <p className="loading-text">Discovering perfect influencers...</p>
            </div>
          ) : (
            <div className="nebula-influencers-grid">
              {influencers.length === 0 ? (
                <div className="nebula-no-results">
                  <div className="no-results-icon">🔍</div>
                  <h3>No influencers match your filters</h3>
                  <p>Try adjusting your search criteria</p>
                  <button 
                    className="nebula-reset-search-btn"
                    onClick={handleRemoveAllFilters}
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                influencers.map((inf, index) => (
                  <div 
                    key={inf._id} 
                    className={`nebula-influencer-card ${focusedCard === inf._id ? 'focused' : ''}`}
                    style={{ 
                      animationDelay: `${index * 0.05}s`,
                    }}
                    onMouseEnter={() => handleCardHover(inf._id, true)}
                    onMouseLeave={() => handleCardHover(inf._id, false)}
                  >
                    <div className="card-glow-effect"></div>
                    
                    <div className="nebula-card-content">
                      {/* Card header with avatar */}
                      <div className="nebula-card-header">
                        <div className="avatar-container">
                          <div className="avatar-glow"></div>
                          <img
                            src={inf.profileImage || "https://via.placeholder.com/60"}
                            alt={inf.name}
                            className="nebula-profile-image"
                          />
                        </div>
                        <div className="nebula-card-info">
                          <h3 className="influencer-name">{inf.name}</h3>
                          <p className="influencer-location">
                            <span className="location-icon">📍</span>
                            {inf.influencerLocation || "N/A"}
                          </p>
                        </div>
                        {/* Rating */}
                        <div className="nebula-rating-container">
                          {renderStars(inf.averageRating)}
                        </div>
                      </div>

                      {/* Niche Platforms with icons */}
                      <div className="nebula-platform-tags">
                        {inf.nichePlatforms?.slice(0, 4).map((tag, index) => (
                          <span key={index} className="nebula-platform-tag">
                            <span className="platform-icon">{platformIcons[tag] || '🔗'}</span>
                            {tag}
                          </span>
                        ))}
                        {inf.nichePlatforms?.length > 4 && (
                          <span className="more-platforms">+{inf.nichePlatforms.length - 4}</span>
                        )}
                      </div>

                      {/* Stats with visualization */}
                      <div className="nebula-stats-container">
                        <div className="nebula-stat">
                          <div className="stat-label">Followers</div>
                          <div className="stat-value-container">
                            <div 
                              className="stat-bar" 
                              style={{ 
                                width: `${Math.min(100, (inf.numFollowers || 0) / 1000)}%` 
                              }}
                            ></div>
                            <span className="stat-value">{inf.numFollowers?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                        
                        <div className="nebula-stat">
                          <div className="stat-label">Experience</div>
                          <div className="stat-value-container">
                            <div 
                              className="stat-bar" 
                              style={{ 
                                width: `${Math.min(100, ((inf.experience || 0) / 10) * 100)}%` 
                              }}
                            ></div>
                            <span className="stat-value">{inf.experience || 0} years</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive buttons for expanded view */}
                      <div className="nebula-card-details">
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
                      <div className="nebula-invite-section">
                        <select
                          className={`nebula-campaign-select campaign-select-${inf._id}`}
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
                        <button
                          className={`nebula-invite-btn invite-btn-${inf._id}`}
                          onClick={() => handleSendInvite(inf._id)}
                        >
                          Send Invite
                        </button>
                      </div>

                      <div className="nebula-card-actions">
                        <button
                          className="nebula-view-profile-btn"
                          onClick={() => handleViewProfile(inf._id)}
                        >
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
      <div className="nebula-chatbot-wrapper">
        <div className="chatbot-pulse"></div>
        <AiChatbot />
      </div>
      
      {/* Profile transition effect element */}
      <div className="profile-transition-ripple"></div>
    </div>
  );
}

export default FindInfluencer;