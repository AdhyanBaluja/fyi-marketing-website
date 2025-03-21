import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "./InfluencerProfile.css";

// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function InfluencerProfile() {
  const { id } = useParams();
  const [influencer, setInfluencer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // We'll read userType from localStorage to show a "Rate" section only if brand
  const userType = localStorage.getItem("userType");

  // (A) local rating input state
  const [newRating, setNewRating] = useState(0);
  const [ratingSuccess, setRatingSuccess] = useState("");

  // 1) STAR RATING RENDERING
  const renderStars = (rating) => {
    if (!rating || rating <= 0) {
      return <span className="no-rating">No rating yet</span>;
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
    return (
      <div className="stars-container">
        {stars}
        <span className="rating-number">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // 2) FETCH via AXIOS using API_BASE_URL
  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get(`${API_BASE_URL}/api/influencer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.influencer) {
          setInfluencer(res.data.influencer);
        } else {
          setError("Influencer not found.");
        }
      })
      .catch((err) => {
        console.error("Error fetching influencer detail:", err);
        setError("Failed to fetch influencer detail");
      })
      .finally(() => setLoading(false));
  }, [id]);

  // 3) LOADING / ERROR STATES
  if (loading) {
    return (
      <div className="profile-container">
        <p>Loading influencer profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  if (!influencer) {
    return (
      <div className="profile-container">
        <p>No influencer data available.</p>
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

  // 4) SUBMIT RATING => API call using API_BASE_URL
  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    if (!newRating || newRating < 1 || newRating > 5) {
      alert("Please enter a rating between 1 and 5.");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${API_BASE_URL}/api/influencer/${id}/rate`,
        { ratingValue: Number(newRating) },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setRatingSuccess("Rating submitted successfully!");

      // Re-fetch influencer to update averageRating
      const refreshed = await axios.get(
        `${API_BASE_URL}/api/influencer/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfluencer(refreshed.data.influencer);

      // Reset rating input
      setNewRating(0);
      setTimeout(() => setRatingSuccess(""), 3000);
    } catch (err) {
      console.error("Error submitting rating:", err);
      setError("Failed to submit rating.");
    }
  };

  // Convert platformDetails if needed (if Mongoose Map, you can do Object.entries)
  let platformDetailsObj = platformDetails;
  // Optionally: platformDetailsObj = Object.fromEntries(platformDetails);

  return (
    <div className="profile-container">
      {/* TOP HEADER / HERO */}
      <div className="profile-header">
        <img
          src={profileImage || "https://via.placeholder.com/120"}
          alt={name}
          className="profile-avatar"
        />
        <h2 className="profile-name">{name}</h2>

        {/* STAR RATING */}
        <div className="profile-rating">
          {renderStars(averageRating)}
        </div>

        <p className="profile-subtext">
          {experience} years of experience | {numFollowers} followers
        </p>
        <p className="profile-subtext">
          Location: {influencerLocation || "N/A"}
        </p>
      </div>

      {/* AUDIENCE & DEMOGRAPHICS */}
      <div className="profile-info-section">
        <h3>Audience &amp; Demographics</h3>
        <div className="profile-info-item">
          <span>Majority Audience Location:</span>{" "}
          {majorityAudienceLocation || "N/A"}
        </div>
        <div className="profile-info-item">
          <span>Age Group:</span> {audienceAgeGroup || "N/A"}
        </div>
        <div className="profile-info-item">
          <span>Gender Demographics:</span>{" "}
          {audienceGenderDemographics || "N/A"}
        </div>
      </div>

      {/* INFLUENCER DETAILS */}
      <div className="profile-info-section">
        <h3>Influencer Details</h3>
        <div className="profile-info-item">
          <span>Gender:</span> {gender || "N/A"}
        </div>
        <div className="profile-info-item">
          <span>Industries:</span>{" "}
          {industries && industries.length > 0 ? industries.join(", ") : "N/A"}
        </div>
        <div className="profile-info-item">
          <span>Niche Platforms:</span>{" "}
          {nichePlatforms && nichePlatforms.length > 0
            ? nichePlatforms.join(", ")
            : "N/A"}
        </div>
      </div>

      {/* PLATFORM DETAILS SECTION */}
      <div className="profile-info-section">
        <h3>Platform Details</h3>
        {platformDetailsObj && Object.keys(platformDetailsObj).length > 0 ? (
          Object.entries(platformDetailsObj).map(([platformName, detail], idx) => (
            <div key={idx} className="profile-info-item">
              <p><strong>{platformName} Handle:</strong> {detail.handle || "N/A"}</p>
              <p><strong>{platformName} Price per Post:</strong> {detail.price || 0}</p>
            </div>
          ))
        ) : (
          <p>No platform details found.</p>
        )}
      </div>

      {/* JOINED CAMPAIGNS */}
      <div className="profile-info-section">
        <h3>Joined Campaigns</h3>
        {joinedCampaigns && joinedCampaigns.length > 0 ? (
          joinedCampaigns.map((c, idx) => (
            <div key={idx} className="campaign-card">
              <p>
                <strong>Campaign Name:</strong>{" "}
                {c.campaignName || c.campaignId}
              </p>
              <p>
                <strong>Status:</strong> {c.status}
              </p>
              <p>
                <strong>Progress:</strong> {c.progress}%
              </p>
            </div>
          ))
        ) : (
          <p>No campaigns joined yet.</p>
        )}
      </div>

      {/* RATING SECTION (brand only) */}
      {userType === "brand" && (
        <div className="profile-info-section rating-section">
          <h3>Rate This Influencer</h3>
          {ratingSuccess && <p className="success-msg">{ratingSuccess}</p>}
          <form onSubmit={handleRatingSubmit} className="rating-form">
            <label htmlFor="newRating">Your Rating (1 to 5):</label>
            <input
              type="number"
              id="newRating"
              min="1"
              max="5"
              value={newRating}
              onChange={(e) => setNewRating(e.target.value)}
            />
            <button type="submit" className="rating-submit-btn">
              Submit Rating
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default InfluencerProfile;
