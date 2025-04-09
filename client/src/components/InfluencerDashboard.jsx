import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './InfluencerDashboard.module.css';
import useScrollReveal from '../hooks/useScrollReveal';
import AiChatbot from './AiChatbot.jsx';
import brandLogo from '../assets/bird_2.jpg';
import influencerBack from '../assets/InfluencerBack.jpg'; // Using this for profile placeholder & background

// ==================== Environment Variable ====================
// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

/* 
  CHILD COMPONENTS:
  1) ActiveCampaignCard
  2) AllCampaignCard
  3) BrandRequestCard
  4) AmplifyPlanCard
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
      className={`${styles['campaign-card']} ${styles['hover-rise']} ${styles['colored-container']} ${styles['shadow-effect']} ${
        cardRevealed ? styles['scroll-reveal'] : ''
      }`}
    >
      <img src={brandLogo} alt={brandName} className={styles['campaign-logo']} />
      <div className={styles['campaign-info']}>
        <h3>{campaignName}</h3>
        <p><strong>Brand:</strong> {brandName}</p>
        <p><strong>Budget:</strong> {campaign.budget || realCampaign.budget || 'N/A'}</p>
        <p><strong>Platform:</strong> {campaign.platform || 'N/A'}</p>
        <p><strong>Target Audience:</strong> {realCampaign.targetAudience || 'N/A'}</p>

        {/* Progress Bar */}
        <div className={styles['progress-bar']}>
          <div className={styles['progress-fill']} style={{ width: `${campaign.progress || 0}%` }}></div>
        </div>
        <p className={styles['progress-text']}>Progress: {campaign.progress || 0}%</p>

        {/* Update Progress */}
        <div className={styles['progress-update']}>
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
            <button onClick={handleLeave} className={styles['leave-btn']}>Leave Campaign</button>
          </div>
        )}

        {/* Tasks Section */}
        <div className={styles['tasks-section']}>
          <h4>My To-Do List</h4>
          <ul className={styles['task-list']}>
            {tasks.map((task) => (
              <li key={task._id} className={styles['task-item']}>
                <span>{task.text}</span>
                <button className={styles['remove-task-btn']} onClick={() => handleRemoveTask(task._id)}>✕</button>
              </li>
            ))}
          </ul>
          <form onSubmit={handleAddTask} className={styles['add-task-form']}>
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <button type="submit" className={styles['add-task-btn']}>+</button>
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
    actionButton = <button className={styles['apply-btn']} disabled>Active</button>;
  } else if (isApplied) {
    actionButton = <button className={styles['apply-btn']} disabled>Pending</button>;
  } else {
    actionButton = <button className={styles['apply-btn']} onClick={handleApply}>Apply</button>;
  }

  return (
    <div
      ref={bigRef}
      className={`${styles['big-campaign-card']} ${styles['hover-rise']} ${styles['colored-container']} ${styles['shadow-effect']} ${
        bigRevealed ? styles['scroll-reveal'] : ''
      }`}
    >
      <div className={styles['big-card-left']}>
        <img src={brandLogo} alt={brandName} className={`${styles['campaign-logo']} ${styles['big-logo']}`} />
        <div className={styles['campaign-info']}>
          <h3>{campaign.name || 'Untitled Campaign'}</h3>
          <p><strong>Brand:</strong> {brandName}</p>
          <p><strong>Budget:</strong> {campaign.budget || 'N/A'}</p>
          <p><strong>Target Audience:</strong> {campaign.targetAudience || 'N/A'}</p>
        </div>
      </div>
      <div className={styles['big-card-right']}>{actionButton}</div>
    </div>
  );
}

// ==================== BrandRequestCard ====================
function BrandRequestCard({ request, onAccept }) {
  const [reqRef, reqRevealed] = useScrollReveal({ threshold: 0.15 });

  return (
    <div
      ref={reqRef}
      className={`${styles['brand-request-card']} ${styles['hover-rise']} ${styles['colored-container']} ${styles['shadow-effect']} ${
        reqRevealed ? styles['scroll-reveal'] : ''
      }`}
    >
      <h3>{request.campaignName}</h3>
      <p><strong>Brand:</strong> {request.brandName || 'Unknown Brand'}</p>
      <p><strong>Budget:</strong> {request.budget || 'N/A'}</p>
      <p><strong>Status:</strong> {request.status}</p>
      {request.status === 'pending' && (
        <button className={styles['accept-btn']} onClick={() => onAccept(request._id)}>Accept</button>
      )}
    </div>
  );
}

// ==================== AmplifyPlanCard ====================
function AmplifyPlanCard() {
  return (
    <div className={styles['amplify-card']}>
      <h3>amplify Plan (AI)</h3>
      <p><strong>Brand:</strong> LetS FYI</p>
      <p><strong>Budget:</strong> undefined</p>
      <p><strong>Platform:</strong> Instagram</p>
      <p><strong>Target Audience:</strong> Females in the United Kingdom, age group 18-50</p>
    </div>
  );
}

// ==================== MAIN InfluencerDashboard ====================
function InfluencerDashboard() {
  const navigate = useNavigate();

  // Based on screenshot data
  const initialProfile = {
    _id: '',
    profileImage: '',
    name: 'Voguish Affair',
    experience: 1,
    numFollowers: 80000,
    influencerLocation: 'London',
    majorityAudienceLocation: 'United Kingdom',
    audienceAgeGroup: '25-45',
    audienceGenderDemographics: 'Female',
    gender: 'Female',
    industries: ['Fashion', 'Fitness', 'Food'],
    nichePlatforms: ['Instagram', 'Facebook'],
  };

  const [influencerInfo, setInfluencerInfo] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState({ ...initialProfile });

  const [brandRequests, setBrandRequests] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);

  const [appliedCampaignIds, setAppliedCampaignIds] = useState(new Set());
  const [activeCampaignIds, setActiveCampaignIds] = useState(new Set());

  // Banner for incomplete profile
  const [showProfileBanner, setShowProfileBanner] = useState(true);

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
      // Preserve the initial data if API returns empty values
      const apiData = res.data.influencer;
      const mergedData = {
        ...initialProfile,
        ...apiData,
        // Ensure arrays are preserved even if API returns null
        industries: apiData.industries || initialProfile.industries,
        nichePlatforms: apiData.nichePlatforms || initialProfile.nichePlatforms
      };
      setInfluencerInfo(mergedData);
      setTempInfo(mergedData);
    } catch (error) {
      console.error('Error fetching influencer profile:', error);
      // On error, use the initial profile data
      setInfluencerInfo(initialProfile);
      setTempInfo(initialProfile);
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
    // Outer wrapper with background
    <div
      className={styles['influencer-dashboard-wrapper']}
      style={{
        backgroundImage: `url(${influencerBack})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh'
      }}
    >
      {/* Main container renamed for clarity */}
      <div className={styles['influencer-dashboard']} id="top">
        {/* NAVIGATION BAR */}
        <nav className={`${styles['main-nav']} ${styles['fade-in-down']}`}>
          <h2 className={styles['nav-logo']}>letsFYI</h2>
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
          <div className={styles['complete-profile-banner']}>
            Please add your profile photo in the Edit Info section.
          </div>
        )}

        {/* TOP SECTION - Influencer Profile */}
        <div className={`${styles['top-section']} ${styles['fade-in-right']}`}>
          <h1 className={styles['page-title']}>Influencer Dashboard</h1>
          <div className={`${styles['influencer-details']} ${styles['colored-container']} ${styles['shadow-effect']}`}>
            {isEditing ? (
              <div className={styles['edit-form']}>
                <div className={styles['profile-pic-container']}>
                  <img
                    src={tempInfo.profileImage || influencerBack}
                    alt="Profile"
                    className={styles['profile-pic']}
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
                  value={Array.isArray(tempInfo.industries) ? tempInfo.industries.join(', ') : ''}
                  onChange={(e) =>
                    setTempInfo({
                      ...tempInfo,
                      industries: e.target.value.split(',').map(item => item.trim()),
                    })
                  }
                />
                <label>Niche Platforms (comma-separated):</label>
                <input
                  type="text"
                  value={Array.isArray(tempInfo.nichePlatforms) ? tempInfo.nichePlatforms.join(', ') : ''}
                  onChange={(e) =>
                    setTempInfo({
                      ...tempInfo,
                      nichePlatforms: e.target.value.split(',').map(item => item.trim()),
                    })
                  }
                />
                <div className={styles['edit-form-buttons']}>
                  <button className={styles['save-btn']} onClick={handleSaveClick}>
                    Save
                  </button>
                  <button className={styles['cancel-btn']} onClick={handleCancelClick}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles['profile-section']}>
                <div className={styles['profile-pic-container']}>
                  <img
                    src={influencerInfo.profileImage || influencerBack}
                    alt="Profile"
                    className={styles['profile-pic']}
                  />
                </div>
                <div className={styles['profile-view']}>
                  <p><strong>Name:</strong> {influencerInfo.name}</p>
                  <p><strong>Experience:</strong> {influencerInfo.experience} year</p>
                  <p><strong>Number of Followers:</strong> {influencerInfo.numFollowers}</p>
                  <p><strong>Location:</strong> {influencerInfo.influencerLocation}</p>
                  <p><strong>Majority Audience Location:</strong> {influencerInfo.majorityAudienceLocation}</p>
                  <p><strong>Audience Age Group:</strong> {influencerInfo.audienceAgeGroup}</p>
                  <p><strong>Audience Gender Demographics:</strong> {influencerInfo.audienceGenderDemographics}</p>
                  <p><strong>Gender:</strong> {influencerInfo.gender}</p>
                  <p><strong>Industry:</strong> {Array.isArray(influencerInfo.industries) ? influencerInfo.industries.join(', ') : ''}</p>
                  <p><strong>Niche Platforms:</strong> {Array.isArray(influencerInfo.nichePlatforms) ? influencerInfo.nichePlatforms.join(', ') : ''}</p>
                  <button className={styles['edit-btn']} onClick={handleEditClick}>
                    Edit Info
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AmplifyPlanCard - Positioned as shown in screenshot */}
        <AmplifyPlanCard />

        {/* BRAND REQUESTS SECTION */}
        <section id="brandRequests" className={`${styles['brand-requests-section']} ${styles['fade-in-left']}`}>
          <h2>Brand Requests</h2>
          <div className={styles['requests-list']}>
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
        <section id="activeCampaigns" className={`${styles['campaign-section']} ${styles['fade-in-left']}`}>
          <h2>ACTIVE CAMPAIGNS</h2>
          <div className={styles.campaigns}>
            {activeCampaigns.length > 0 ? (
              activeCampaigns.map((campaign) => (
                <ActiveCampaignCard
                  key={campaign._id || campaign.campaignId?._id}
                  campaign={campaign}
                  onUpdateProgress={handleUpdateProgress}
                  onRefresh={fetchDashboardData}
                />
              ))
            ) : (
              <p>No active campaigns at the moment.</p>
            )}
          </div>
        </section>

        {/* All Campaigns Section */}
        <section id="allCampaigns" className={`${styles['campaign-section']} ${styles['fade-in-right']}`}>
          <h2>All Campaigns</h2>
          <div className={styles['big-campaigns']}>
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
    </div>
  );
}

export default InfluencerDashboard;