import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InfluencerDashboard.css';
import useScrollReveal from '../hooks/useScrollReveal';
import AiChatbot from './AiChatbot.jsx';
import brandLogo from '../assets/bird_2.jpg';

// ==================== Environment Variable ====================
// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

/* 
  CHILD COMPONENTS:
  1) ActiveCampaignCard
  2) AllCampaignCard
  3) BrandRequestCard
*/

// ==================== ActiveCampaignCard ====================
function ActiveCampaignCard({ campaign, onUpdateProgress, onRefresh }) {
  const [cardRef, cardRevealed] = useScrollReveal({ threshold: 0.15 });
  const [tempProgress, setTempProgress] = useState(campaign.progress || 0);

  const token = localStorage.getItem('token');
  const realId = campaign.campaignId?._id || campaign._id;

  const realCampaign = campaign.campaignId || campaign;
  const brandName = realCampaign.brandName || 'Unknown Brand';
  const campaignName = realCampaign.name || 'Untitled';

  // To-Do Tasks
  const [tasks, setTasks] = useState(campaign.tasks || []);
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    setTasks(campaign.tasks || []);
  }, [campaign.tasks]);

  // (A.1) Add Task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${realId}/tasks`,
        { text: newTaskText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data.tasks);
      setNewTaskText('');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error adding task:', err);
      alert('Failed to add task. Check console for details.');
    }
  };

  // (A.2) Remove Task
  const handleRemoveTask = async (taskId) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${realId}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data.tasks);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error removing task:', err);
      alert('Failed to remove task. Check console for details.');
    }
  };

  // Save progress
  const handleSaveProgress = () => {
    onUpdateProgress(realId, tempProgress);
  };

  // Leave campaign
  const handleLeave = async () => {
    const confirmed = window.confirm(`Are you sure you want to leave "${campaignName}"?`);
    if (!confirmed) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${realId}/leave`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`You left the campaign "${campaignName}".`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error leaving campaign:', err);
      alert('Failed to leave the campaign. Check console for details.');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`campaign-card hover-rise colored-container shadow-effect ${
        cardRevealed ? 'scroll-reveal' : ''
      }`}
    >
      <img src={brandLogo} alt={brandName} className="campaign-logo" />
      <div className="campaign-info">
        <h3>{campaignName}</h3>
        <p><strong>Brand:</strong> {brandName}</p>
        <p><strong>Budget:</strong> {campaign.budget || realCampaign.budget || 'N/A'}</p>
        <p><strong>Platform:</strong> {campaign.platform || 'N/A'}</p>
        <p><strong>Target Audience:</strong> {realCampaign.targetAudience || 'N/A'}</p>

        {/* Progress Bar */}
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${campaign.progress || 0}%` }}></div>
        </div>
        <p className="progress-text">Progress: {campaign.progress || 0}%</p>

        {/* Update Progress */}
        <div className="progress-update">
          <label>Update Progress (%): </label>
          <input
            type="number"
            min="0"
            max="100"
            value={tempProgress}
            onChange={(e) => setTempProgress(e.target.value)}
          />
          <button onClick={handleSaveProgress}>Save Progress</button>
        </div>

        {/* Leave Campaign */}
        {campaign.status === 'active' && (
          <div style={{ marginTop: '10px' }}>
            <button onClick={handleLeave} className="leave-btn">Leave Campaign</button>
          </div>
        )}

        {/* Tasks Section */}
        <div className="tasks-section">
          <h4>My To-Do List</h4>
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task._id} className="task-item">
                <span>{task.text}</span>
                <button className="remove-task-btn" onClick={() => handleRemoveTask(task._id)}>✕</button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddTask} className="add-task-form">
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <button type="submit" className="add-task-btn">+</button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ==================== AllCampaignCard ====================
function AllCampaignCard({ campaign, influencerId, onApplied, appliedCampaignIds, activeCampaignIds }) {
  const [bigRef, bigRevealed] = useScrollReveal({ threshold: 0.15 });
  const brandName = campaign.brandName || 'Unknown Brand';
  const token = localStorage.getItem('token');

  // Check if this campaign is already applied or active
  const isApplied = appliedCampaignIds.has(campaign._id);
  const isActive = activeCampaignIds.has(campaign._id);

  const handleApply = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/campaigns/${campaign._id}/apply`,
        { influencerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Successfully applied to campaign! Status = "applied" (pending brand acceptance).');
      if (onApplied) onApplied();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Failed to apply: ${error.response.data.error}`);
      } else {
        console.error('Error applying to campaign:', error);
        alert('Failed to apply. Check console for details.');
      }
    }
  };

  let actionButton = null;
  if (isActive) {
    actionButton = <button className="apply-btn" disabled>Active</button>;
  } else if (isApplied) {
    actionButton = <button className="apply-btn" disabled>Pending</button>;
  } else {
    actionButton = <button className="apply-btn" onClick={handleApply}>Apply</button>;
  }

  return (
    <div
      ref={bigRef}
      className={`big-campaign-card hover-rise colored-container shadow-effect ${
        bigRevealed ? 'scroll-reveal' : ''
      }`}
    >
      <div className="big-card-left">
        <img src={brandLogo} alt={brandName} className="campaign-logo big-logo" />
        <div className="campaign-info">
          <h3>{campaign.name || 'Untitled Campaign'}</h3>
          <p><strong>Brand:</strong> {brandName}</p>
          <p><strong>Budget:</strong> {campaign.budget || 'N/A'}</p>
          <p><strong>Target Audience:</strong> {campaign.targetAudience || 'N/A'}</p>
        </div>
      </div>
      <div className="big-card-right">{actionButton}</div>
    </div>
  );
}

// ==================== BrandRequestCard ====================
function BrandRequestCard({ request, onAccept }) {
  const [reqRef, reqRevealed] = useScrollReveal({ threshold: 0.15 });

  return (
    <div
      ref={reqRef}
      className={`brand-request-card hover-rise colored-container shadow-effect ${
        reqRevealed ? 'scroll-reveal' : ''
      }`}
    >
      <h3>{request.campaignName}</h3>
      <p><strong>Brand:</strong> {request.brandName || 'Unknown Brand'}</p>
      <p><strong>Budget:</strong> {request.budget || 'N/A'}</p>
      <p><strong>Status:</strong> {request.status}</p>
      {request.status === 'pending' && (
        <button className="accept-btn" onClick={() => onAccept(request._id)}>Accept</button>
      )}
    </div>
  );
}

// ==================== MAIN InfluencerDashboard ====================
function InfluencerDashboard() {
  const navigate = useNavigate();

  const [influencerInfo, setInfluencerInfo] = useState({
    _id: '',
    profileImage: '',
    name: '',
    experience: 0,
    numFollowers: 0,
    influencerLocation: '',
    majorityAudienceLocation: '',
    audienceAgeGroup: '',
    audienceGenderDemographics: '',
    gender: '',
    industries: [],
    nichePlatforms: [],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState({ ...influencerInfo });

  const [brandRequests, setBrandRequests] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);

  const [appliedCampaignIds, setAppliedCampaignIds] = useState(new Set());
  const [activeCampaignIds, setActiveCampaignIds] = useState(new Set());

  // NEW: Banner for incomplete profile
  const [showProfileBanner, setShowProfileBanner] = useState(false);

  useEffect(() => {
    fetchInfluencerProfile();
    fetchDashboardData();
    // eslint-disable-next-line
  }, []);

  // Check if profile photo is missing
  useEffect(() => {
    if (!influencerInfo.profileImage || influencerInfo.profileImage.trim() === '') {
      setShowProfileBanner(true);
    } else {
      setShowProfileBanner(false);
    }
  }, [influencerInfo]);

  // Fetch Influencer Profile
  const fetchInfluencerProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/influencer/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInfluencerInfo(res.data.influencer);
      setTempInfo(res.data.influencer);
    } catch (error) {
      console.error('Error fetching influencer profile:', error);
    }
  };

  // Save Updated Profile
  const handleSaveClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const patchData = {
        profileImage: tempInfo.profileImage,
        name: tempInfo.name,
        experience: tempInfo.experience,
        numFollowers: tempInfo.numFollowers,
        influencerLocation: tempInfo.influencerLocation,
        majorityAudienceLocation: tempInfo.majorityAudienceLocation,
        audienceAgeGroup: tempInfo.audienceAgeGroup,
        audienceGenderDemographics: tempInfo.audienceGenderDemographics,
        gender: tempInfo.gender,
        industries: tempInfo.industries,
        platforms: tempInfo.nichePlatforms,
      };

      await axios.patch(
        `${API_BASE_URL}/api/influencer/my-profile`,
        patchData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setInfluencerInfo(tempInfo);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating influencer profile:', error);
    }
  };

  const handleCancelClick = () => {
    setTempInfo(influencerInfo);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setTempInfo(influencerInfo);
    setIsEditing(true);
  };

  // Fetch brand requests, active campaigns, all campaigns
  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      // 1) Brand requests
      const reqRes = await axios.get(`${API_BASE_URL}/api/influencer/brand-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requestsArr = reqRes.data.requests || [];
      const visibleRequests = requestsArr.filter((r) => r.status !== 'accepted');
      setBrandRequests(visibleRequests);

      // 2) Active campaigns
      const activeRes = await axios.get(`${API_BASE_URL}/api/influencer/my-active-campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeArr = activeRes.data.activeCampaigns || [];
      setActiveCampaigns(activeArr);

      // 3) All campaigns
      const allRes = await axios.get(`${API_BASE_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allArr = allRes.data.campaigns || [];
      setAllCampaigns(allArr);

      // Build sets for applied and active campaigns
      const appliedSet = new Set();
      requestsArr.forEach((req) => {
        if (req.status === 'applied' && req.campaignId) {
          appliedSet.add(req.campaignId.toString());
        }
      });

      const activeSet = new Set();
      activeArr.forEach((act) => {
        const realId = act.campaignId?._id || act._id;
        if (realId) {
          activeSet.add(realId.toString());
        }
      });

      setAppliedCampaignIds(appliedSet);
      setActiveCampaignIds(activeSet);
    } catch (error) {
      console.error('Error fetching influencer dashboard data:', error);
    }
  };

  // Accept brand request
  const handleAcceptRequest = async (requestId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/influencer/brand-requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error accepting brand request:', error);
    }
  };

  // Update progress on active campaign
  const handleUpdateProgress = async (campaignId, newProgress) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${campaignId}/progress`,
        { progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating campaign progress:', error);
    }
  };

  // Logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  // Smooth Scrolling for nav
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dashboard-container-big" id="top">
      {/* NAVIGATION BAR */}
      <nav className="main-nav fade-in-down">
        <h2 className="nav-logo">letsFYI</h2>
        <ul>
          <li onClick={() => scrollToSection('top')}>Dashboard</li>
          <li onClick={() => scrollToSection('brandRequests')}>Brand Requests</li>
          <li onClick={() => scrollToSection('activeCampaigns')}>Active Campaigns</li>
          <li onClick={() => scrollToSection('allCampaigns')}>All Campaigns</li>
          <li onClick={handleLogout} style={{ color: 'red', cursor: 'pointer' }}>
            Logout
          </li>
        </ul>
      </nav>

      {/* COMPLETE PROFILE BANNER */}
      {showProfileBanner && (
        <div className="complete-profile-banner">
          Please add your profile photo in the Edit Info section.
        </div>
      )}

      {/* TOP SECTION - Influencer Profile */}
      <div className="top-section fade-in-right">
        <h1 className="page-title">Influencer Dashboard</h1>
        <div className="influencer-details colored-container shadow-effect">
          {isEditing ? (
            <div className="edit-form">
              <div className="profile-pic-container">
                <img
                  src={tempInfo.profileImage || brandLogo}
                  alt="Profile"
                  className="profile-pic"
                />
              </div>
              <label>Profile Image (URL):</label>
              <input
                type="text"
                value={tempInfo.profileImage}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, profileImage: e.target.value })
                }
              />
              <label>Name:</label>
              <input
                type="text"
                value={tempInfo.name}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, name: e.target.value })
                }
              />
              <label>Experience (Years):</label>
              <input
                type="number"
                value={tempInfo.experience}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, experience: e.target.value })
                }
              />
              <label>Number of Followers:</label>
              <input
                type="number"
                value={tempInfo.numFollowers}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, numFollowers: e.target.value })
                }
              />
              <label>Influencer Location:</label>
              <input
                type="text"
                value={tempInfo.influencerLocation}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, influencerLocation: e.target.value })
                }
              />
              <label>Majority Audience Location:</label>
              <input
                type="text"
                value={tempInfo.majorityAudienceLocation}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, majorityAudienceLocation: e.target.value })
                }
              />
              <label>Audience Age Group:</label>
              <input
                type="text"
                value={tempInfo.audienceAgeGroup}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, audienceAgeGroup: e.target.value })
                }
              />
              <label>Audience Gender Demographics:</label>
              <input
                type="text"
                value={tempInfo.audienceGenderDemographics}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, audienceGenderDemographics: e.target.value })
                }
              />
              <label>Gender:</label>
              <input
                type="text"
                value={tempInfo.gender}
                onChange={(e) =>
                  setTempInfo({ ...tempInfo, gender: e.target.value })
                }
              />
              <label>Industries (comma-separated):</label>
              <input
                type="text"
                value={tempInfo.industries.join(', ')}
                onChange={(e) =>
                  setTempInfo({
                    ...tempInfo,
                    industries: e.target.value.split(','),
                  })
                }
              />
              <label>Niche Platforms (comma-separated):</label>
              <input
                type="text"
                value={tempInfo.nichePlatforms.join(', ')}
                onChange={(e) =>
                  setTempInfo({
                    ...tempInfo,
                    nichePlatforms: e.target.value.split(','),
                  })
                }
              />
              <div className="edit-form-buttons">
                <button className="save-btn" onClick={handleSaveClick}>
                  Save
                </button>
                <button className="cancel-btn" onClick={handleCancelClick}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-section">
              <div className="profile-pic-container">
                <img
                  src={influencerInfo.profileImage || brandLogo}
                  alt="Profile"
                  className="profile-pic"
                />
              </div>
              <div className="profile-view">
                <p><strong>Name:</strong> {influencerInfo.name}</p>
                <p><strong>Experience:</strong> {influencerInfo.experience} years</p>
                <p><strong>Number of Followers:</strong> {influencerInfo.numFollowers}</p>
                <p><strong>Influencer Location:</strong> {influencerInfo.influencerLocation}</p>
                <p><strong>Majority Audience Location:</strong> {influencerInfo.majorityAudienceLocation}</p>
                <p><strong>Audience Age Group:</strong> {influencerInfo.audienceAgeGroup}</p>
                <p><strong>Audience Gender Demographics:</strong> {influencerInfo.audienceGenderDemographics}</p>
                <p><strong>Gender:</strong> {influencerInfo.gender}</p>
                <p><strong>Industries:</strong> {influencerInfo.industries.join(', ')}</p>
                <p><strong>Niche Platforms:</strong> {influencerInfo.nichePlatforms.join(', ')}</p>
                <button className="edit-btn" onClick={handleEditClick}>
                  Edit Info
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* BRAND REQUESTS SECTION */}
      <section id="brandRequests" className="brand-requests-section fade-in-left">
        <h2>Brand Requests</h2>
        <div className="requests-list">
          {brandRequests.length === 0 ? (
            <p>No brand requests at the moment.</p>
          ) : (
            brandRequests.map((req) => (
              <BrandRequestCard key={req._id} request={req} onAccept={handleAcceptRequest} />
            ))
          )}
        </div>
      </section>

      {/* Active Campaigns Section */}
      <section id="activeCampaigns" className="campaign-section fade-in-left">
        <h2>Active Campaigns</h2>
        <div className="campaigns">
          {activeCampaigns.map((campaign) => (
            <ActiveCampaignCard
              key={campaign._id || campaign.campaignId?._id}
              campaign={campaign}
              onUpdateProgress={handleUpdateProgress}
              onRefresh={fetchDashboardData}
            />
          ))}
        </div>
      </section>

      {/* All Campaigns Section */}
      <section id="allCampaigns" className="campaign-section fade-in-right">
        <h2>All Campaigns</h2>
        <div className="big-campaigns">
          {allCampaigns.map((campaign) => (
            <AllCampaignCard
              key={campaign._id}
              campaign={campaign}
              influencerId={influencerInfo._id}
              onApplied={fetchDashboardData}
              appliedCampaignIds={appliedCampaignIds}
              activeCampaignIds={activeCampaignIds}
            />
          ))}
        </div>
      </section>
      <AiChatbot />
    </div>
  );
}

export default InfluencerDashboard;
