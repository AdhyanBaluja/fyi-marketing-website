// src/components/FindInfluencer.jsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AiChatbot from './AiChatbot.jsx';
import axios from "axios";
import "./FindInfluencer.css";

function FindInfluencer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // used for brand calls

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
  const [allInfluencers, setAllInfluencers] = useState([]); // original from /api/influencer/all
  const [influencers, setInfluencers] = useState([]);       // displayed after filtering
  const [searchTerm, setSearchTerm] = useState("");

  // brand's campaigns => so brand can pick a campaign to invite
  const [brandCampaigns, setBrandCampaigns] = useState([]);
  // track each influencer's selected campaign => { influencerId: campaignId }
  const [selectedCampaignMap, setSelectedCampaignMap] = useState({});

  // location + industry + platform options
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

  // -------------------------------
  // 1) FETCH all influencers
  // -------------------------------
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:4000/api/influencer/all", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.influencers) {
          setAllInfluencers(res.data.influencers);
          setInfluencers(res.data.influencers);
        }
      })
      .catch((err) => console.error("Error fetching influencers:", err));
  }, [token]);

  // 2) FETCH brand's campaigns => /api/brand/my-campaigns
  useEffect(() => {
    if (!token) return;
    axios
      .get("http://localhost:4000/api/brand/my-campaigns", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        // res.data => { campaigns: [...] }
        if (res.data.campaigns) {
          setBrandCampaigns(res.data.campaigns);
        }
      })
      .catch((err) => console.error("Error fetching brand campaigns:", err));
  }, [token]);

  // -------------------------------
  // FILTER LOGIC
  // -------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;
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
    setFilters((prev) => ({
      ...prev,
      platforms: Array.from(new Set([...prev.platforms, ...tempPlatformSelection])),
    }));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // APPLY FILTERS
  const handleApplyFilters = () => {
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
    if (filters.influencerLocation && filters.influencerLocation !== "--Select--") {
      filtered = filtered.filter((inf) => inf.influencerLocation === filters.influencerLocation);
    }

    // majorityAudienceLocation
    if (filters.majorityAudienceLocation && filters.majorityAudienceLocation !== "--Select--") {
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

    setInfluencers(filtered);
  };

  // REMOVE ALL FILTERS
  const handleRemoveAllFilters = () => {
    // reset filter states
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

    // show all influencers again
    setInfluencers(allInfluencers);
  };

  // 4) View Profile
  const handleViewProfile = (influencerId) => {
    navigate(`/influencer-profile/${influencerId}`);
  };

  // 5) star rating
  const renderStars = (rating) => {
    if (rating == null || rating === 0) {
      return <span style={{ color: "#15616D", fontSize: "0.9rem" }}>No rating yet</span>;
    }
    const rounded = Math.round(rating);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rounded) {
        stars.push(<span key={i} className="filled-star">★</span>);
      } else {
        stars.push(<span key={i} className="empty-star">★</span>);
      }
    }
    return <>{stars}</>;
  };

  // 6) track selected campaign
  const handleCampaignSelect = (influencerId, campaignId) => {
    setSelectedCampaignMap((prev) => ({
      ...prev,
      [influencerId]: campaignId,
    }));
  };

  // 7) send invite => brand/invite-influencer
  const handleSendInvite = async (influencerId) => {
    const selectedCampaignId = selectedCampaignMap[influencerId];
    if (!selectedCampaignId) {
      alert("Please select a campaign first.");
      return;
    }
    try {
      await axios.post(
        "http://localhost:4000/api/brand/invite-influencer",
        {
          influencerId,
          campaignId: selectedCampaignId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Invite sent successfully!");
    } catch (err) {
      console.error("Error sending invite:", err);
      alert("Failed to send invite. Please try again.");
    }
  };

  return (
    <div className="find-influencer-container">
      {/* FILTERS SECTION */}
      <div className="filters-section">
        <h2>Find Influencers</h2>

        <div className="filter-item">
          <label>Experience (Years)</label>
          <input
            type="number"
            name="experience"
            placeholder="Min years"
            value={filters.experience}
            onChange={handleChange}
          />
        </div>

        <div className="filter-item">
          <label>Number of Followers</label>
          <input
            type="text"
            name="followers"
            placeholder="e.g., >10000"
            value={filters.followers}
            onChange={handleChange}
          />
        </div>

        <div className="filter-item">
          <label>Influencer Location</label>
          <select
            name="influencerLocation"
            value={filters.influencerLocation}
            onChange={handleChange}
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Majority Audience Location</label>
          <select
            name="majorityAudienceLocation"
            value={filters.majorityAudienceLocation}
            onChange={handleChange}
          >
            {locationOptions.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Audience Age-Group Demographics</label>
          <input
            type="text"
            name="audienceAgeGroup"
            placeholder="e.g., 18–25"
            value={filters.audienceAgeGroup}
            onChange={handleChange}
          />
        </div>

        <div className="filter-item">
          <label>Audience Gender Demographics</label>
          <input
            type="text"
            name="audienceGenderDemographics"
            placeholder="e.g., 70% Female"
            value={filters.audienceGenderDemographics}
            onChange={handleChange}
          />
        </div>

        <div className="filter-item">
          <label>Industry Category</label>
          <select
            name="industry"
            value={filters.industry}
            onChange={handleChange}
          >
            <option value="">Select Industry</option>
            {industryOptions.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        {/* Niche Platforms */}
        <div className="filter-item">
          <label>Niche Platforms</label>
          <select multiple onChange={handlePlatformSelect}>
            {platformOptions.map((plat) => (
              <option key={plat} value={plat}>
                {plat}
              </option>
            ))}
          </select>
          <button type="button" onClick={handleAddPlatforms}>
            Add
          </button>

          {/* Show selected platforms */}
          {filters.platforms.length > 0 && (
            <div style={{ marginTop: "8px" }}>
              {filters.platforms.map((p, idx) => (
                <span
                  key={idx}
                  style={{
                    display: "inline-block",
                    backgroundColor: "#d5e8ff",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    margin: "0 5px 5px 0",
                    fontSize: "0.85rem",
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="filter-buttons">
          <button className="apply-filters-btn" onClick={handleApplyFilters}>
            Apply Filters
          </button>
          <button className="remove-filters-btn" onClick={handleRemoveAllFilters}>
            Remove All Filters
          </button>
        </div>
      </div>

      {/* INFLUENCERS SECTION */}
      <div className="influencers-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        <div className="influencers-grid">
          {influencers.map((inf) => (
            <div key={inf._id} className="influencer-card">
              <div className="card-header">
                <img
                  src={inf.profileImage || "https://via.placeholder.com/60"}
                  alt={inf.name}
                  className="profile-image"
                />
                <div className="card-info">
                  <h3>{inf.name}</h3>
                  <p>{inf.influencerLocation || "N/A"}</p>
                </div>
              </div>

              {/* Niche Platforms => tags */}
              <div className="card-tags">
                {inf.nichePlatforms?.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Basic stats */}
              <div className="card-followers">
                <p>Followers: {inf.numFollowers || 0}</p>
                <p>Experience: {inf.experience || 0} yrs</p>
              </div>

              {/* EXTRA INFO => majorityAudienceLocation, audienceAgeGroup, gender, industries */}
              <div className="card-extra-info">
                <p>Majority Audience Loc: {inf.majorityAudienceLocation || "N/A"}</p>
                <p>Audience Age Group: {inf.audienceAgeGroup || "N/A"}</p>
                <p>Audience Gender Demo: {inf.audienceGenderDemographics || "N/A"}</p>
                <p>Gender: {inf.gender || "N/A"}</p>
                <p>
                  Industries:{" "}
                  {inf.industries && inf.industries.length > 0
                    ? inf.industries.join(", ")
                    : "N/A"}
                </p>
              </div>

              {/* RATING */}
              <div className="card-rating">
                {renderStars(inf.averageRating)}
              </div>

              {/* Invite Section */}
              <div className="invite-section">
                <label style={{ fontSize: "0.8rem" }}>Invite to:</label>
                <select
                  style={{ marginLeft: "5px", marginRight: "5px" }}
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
                  className="invite-btn"
                  onClick={() => handleSendInvite(inf._id)}
                >
                  Send Invite
                </button>
              </div>

              <div className="card-buttons">
                <button
                  className="view-profile-btn"
                  onClick={() => handleViewProfile(inf._id)}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AiChatbot />
    </div>
  );
}

export default FindInfluencer;
