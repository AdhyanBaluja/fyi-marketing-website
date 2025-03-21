import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CampaignDetail.css';
import demoImage from '../assets/demo.png';

// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

const CampaignDetail = () => {
  const navigate = useNavigate();
  const { campaignId } = useParams();

  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  // 1) Fetch the campaign document on mount
  useEffect(() => {
    const fetchCampaign = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${API_BASE_URL}/api/campaigns/${campaignId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const c = response.data.campaign;
        setCampaign(c);

        // Prepare local state for editing: top-level fields + formInputs subdoc
        setEditData({
          campaignImage: c.campaignImage || '',
          name: c.name || '',
          objective: c.objective || '',
          targetAudience: c.targetAudience || '',
          duration: c.duration || '',
          budget: c.budget || '',
          influencerCollaboration: c.influencerCollaboration || '',
          aboutCampaign: c.aboutCampaign || '',
          progress: c.progress || 0,
          clicks: c.clicks || 0,
          conversions: c.conversions || 0,
          status: c.status || 'Draft',

          // subdoc: formInputs
          businessDescription: c.formInputs?.businessDescription || '',
          industry: c.formInputs?.industry || '',
          timeframeStart: c.formInputs?.timeframeStart || '',
          timeframeEnd: c.formInputs?.timeframeEnd || '',
          platforms: c.formInputs?.platforms || '',
          marketTrends: c.formInputs?.marketTrends || '',
          targetAudienceForm: c.formInputs?.targetAudience || '',
          brandUSP: c.formInputs?.brandUSP || '',
        });
      } catch (err) {
        console.error('Error fetching campaign detail:', err);
        setError('Failed to load campaign details.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaign();
  }, [campaignId]);

  // 2) Handle input changes in edit mode
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) Save updates (PATCH request)
  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');

      const payload = {
        campaignImage: editData.campaignImage,
        name: editData.name,
        objective: editData.objective,
        targetAudience: editData.targetAudience,
        duration: editData.duration,
        budget: editData.budget,
        influencerCollaboration: editData.influencerCollaboration,
        aboutCampaign: editData.aboutCampaign,
        progress: editData.progress,
        clicks: editData.clicks,
        conversions: editData.conversions,
        status: editData.status,
        formInputs: {
          businessDescription: editData.businessDescription,
          industry: editData.industry,
          timeframeStart: editData.timeframeStart,
          timeframeEnd: editData.timeframeEnd,
          platforms: editData.platforms,
          marketTrends: editData.marketTrends,
          targetAudience: editData.targetAudienceForm,
          brandUSP: editData.brandUSP,
        },
      };

      await axios.patch(
        `${API_BASE_URL}/api/campaigns/${campaignId}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Re-fetch updated document
      const refreshed = await axios.get(
        `${API_BASE_URL}/api/campaigns/${campaignId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCampaign(refreshed.data.campaign);
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving campaign edits:', err);
      setError('Failed to save changes.');
    }
  };

  // 4) Conditional rendering for loading, error, or no campaign found
  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        Loading campaign details...
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        {error}
      </div>
    );
  }
  if (!campaign) {
    return (
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        Campaign not found.
      </div>
    );
  }

  // Display campaign image or fallback to demo image
  const displayedImage = campaign.campaignImage || demoImage;

  return (
    <div className="campaign-detail-container">
      <div className="campaign-header">
        <div className="image-wrapper">
          <img
            className="campaign-image"
            src={displayedImage}
            alt="Campaign Visual"
          />
        </div>
        <div>
          <h1 className="campaign-title">
            {campaign.name || 'Untitled Campaign'}
          </h1>
          <p className="campaign-subtitle">
            {campaign.objective || 'No objective provided yet.'}
          </p>
        </div>
      </div>

      {isEditing ? (
        /* ================== EDIT MODE ================== */
        <div className="campaign-edit-form">
          <h2>Edit Campaign</h2>
          {/* Campaign Image field */}
          <label>Campaign Image (URL)</label>
          <input
            type="text"
            name="campaignImage"
            value={editData.campaignImage}
            onChange={handleChange}
          />
          {/* Basic fields */}
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={editData.name}
            onChange={handleChange}
          />
          <label>Objective</label>
          <input
            type="text"
            name="objective"
            value={editData.objective}
            onChange={handleChange}
          />
          <label>Target Audience</label>
          <input
            type="text"
            name="targetAudience"
            value={editData.targetAudience}
            onChange={handleChange}
          />
          <label>Duration</label>
          <input
            type="text"
            name="duration"
            value={editData.duration}
            onChange={handleChange}
          />
          <label>Budget</label>
          <input
            type="text"
            name="budget"
            value={editData.budget}
            onChange={handleChange}
          />
          <label>Influencer Collaboration</label>
          <input
            type="text"
            name="influencerCollaboration"
            value={editData.influencerCollaboration}
            onChange={handleChange}
          />
          <label>About Campaign</label>
          <textarea
            name="aboutCampaign"
            rows="2"
            value={editData.aboutCampaign}
            onChange={handleChange}
          />
          <label>Progress</label>
          <input
            type="number"
            name="progress"
            value={editData.progress}
            onChange={handleChange}
          />
          <label>Clicks</label>
          <input
            type="number"
            name="clicks"
            value={editData.clicks}
            onChange={handleChange}
          />
          <label>Conversions</label>
          <input
            type="number"
            name="conversions"
            value={editData.conversions}
            onChange={handleChange}
          />
          <label>Status</label>
          <select name="status" value={editData.status} onChange={handleChange}>
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Original form fields (subdoc) */}
          <h3>Original Form Inputs</h3>
          <label>Business Description</label>
          <textarea
            name="businessDescription"
            rows="2"
            value={editData.businessDescription}
            onChange={handleChange}
          />
          <label>Industry</label>
          <input
            type="text"
            name="industry"
            value={editData.industry}
            onChange={handleChange}
          />
          <label>Timeframe Start</label>
          <input
            type="text"
            name="timeframeStart"
            value={editData.timeframeStart}
            onChange={handleChange}
          />
          <label>Timeframe End</label>
          <input
            type="text"
            name="timeframeEnd"
            value={editData.timeframeEnd}
            onChange={handleChange}
          />
          <label>Platforms</label>
          <textarea
            name="platforms"
            rows="2"
            value={editData.platforms}
            onChange={handleChange}
          />
          <label>Market Trends</label>
          <textarea
            name="marketTrends"
            rows="2"
            value={editData.marketTrends}
            onChange={handleChange}
          />
          <label>Target Audience (Form)</label>
          <textarea
            name="targetAudienceForm"
            rows="2"
            value={editData.targetAudienceForm}
            onChange={handleChange}
          />
          <label>Brand USP</label>
          <textarea
            name="brandUSP"
            rows="2"
            value={editData.brandUSP}
            onChange={handleChange}
          />

          {/* Save / Cancel */}
          <div style={{ marginTop: '1rem' }}>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        /* ================== VIEW MODE ================== */
        <>
          {/* Campaign Details Section */}
          <div className="campaign-detail-box">
            <h2 className="detail-title">Campaign Details</h2>
            <div className="detail-grid">
              <div className="detail-item slow-fill-hover">
                <h3>Name</h3>
                <p>{campaign.name || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Objective</h3>
                <p>{campaign.objective || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Target Audience</h3>
                <p>{campaign.targetAudience || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Duration</h3>
                <p>{campaign.duration || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Budget</h3>
                <p>{campaign.budget || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Influencer Collaboration</h3>
                <p>{campaign.influencerCollaboration || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>About Campaign</h3>
                <p>{campaign.aboutCampaign || 'N/A'}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Progress</h3>
                <p>{campaign.progress || 0}%</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Clicks</h3>
                <p>{campaign.clicks || 0}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Conversions</h3>
                <p>{campaign.conversions || 0}</p>
              </div>
              <div className="detail-item slow-fill-hover">
                <h3>Status</h3>
                <p>{campaign.status || 'Draft'}</p>
              </div>
            </div>
          </div>

          {/* Additional: Original Form Inputs */}
          {campaign.formInputs && (
            <div className="campaign-detail-box">
              <h2 className="detail-title">Original Form Inputs</h2>
              <ul>
                <li>
                  <strong>Business Description:</strong>{' '}
                  {campaign.formInputs.businessDescription}
                </li>
                <li>
                  <strong>Industry:</strong> {campaign.formInputs.industry}
                </li>
                <li>
                  <strong>Timeframe Start:</strong>{' '}
                  {campaign.formInputs.timeframeStart}
                </li>
                <li>
                  <strong>Timeframe End:</strong>{' '}
                  {campaign.formInputs.timeframeEnd}
                </li>
                <li>
                  <strong>Platforms:</strong> {campaign.formInputs.platforms}
                </li>
                <li>
                  <strong>Market Trends:</strong>{' '}
                  {campaign.formInputs.marketTrends}
                </li>
                <li>
                  <strong>Target Audience (Form):</strong>{' '}
                  {campaign.formInputs.targetAudience}
                </li>
                <li>
                  <strong>Brand USP:</strong> {campaign.formInputs.brandUSP}
                </li>
              </ul>
            </div>
          )}

          {/* About Campaign Section */}
          <div className="campaign-description">
            <h2 className="description-title">About the Campaign</h2>
            <p className="description-text">
              {campaign.aboutCampaign || 'No further description provided.'}
            </p>
          </div>

          {/* Calendar Events (from AI) */}
          {campaign.calendarEvents && campaign.calendarEvents.length > 0 && (
            <div className="campaign-detail-box">
              <h2 className="detail-title">Calendar Events</h2>
              <ul>
                {campaign.calendarEvents.map((ev, idx) => {
                  let platformsString = '';
                  if (ev.platforms) {
                    if (Array.isArray(ev.platforms)) {
                      platformsString = ev.platforms.join(', ');
                    } else {
                      platformsString = String(ev.platforms);
                    }
                  }
                  let kpisString = '';
                  if (ev.kpis) {
                    if (Array.isArray(ev.kpis)) {
                      kpisString = ev.kpis.join(', ');
                    } else {
                      kpisString = String(ev.kpis);
                    }
                  }
                  return (
                    <li key={idx} style={{ marginBottom: '1rem' }}>
                      <strong>Date:</strong> {ev.date || 'N/A'}
                      <br />
                      <strong>Event:</strong> {ev.event || 'No details'}
                      <br />
                      {ev.platforms && (
                        <>
                          <strong>Platforms:</strong> {platformsString}
                          <br />
                        </>
                      )}
                      {ev.cta && (
                        <>
                          <strong>CTA:</strong> {ev.cta}
                          <br />
                        </>
                      )}
                      {ev.captions && (
                        <>
                          <strong>Captions:</strong> {ev.captions}
                          <br />
                        </>
                      )}
                      {ev.kpis && (
                        <>
                          <strong>KPIs:</strong> {kpisString}
                          <br />
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Bingo Suggestions (from AI) */}
          {campaign.bingoSuggestions && campaign.bingoSuggestions.length > 0 && (
            <div className="campaign-detail-box">
              <h2 className="detail-title">Campaign Suggestions</h2>
              <ul>
                {campaign.bingoSuggestions.map((item, idx) => {
                  const suggestionVal =
                    typeof item.suggestion === 'object'
                      ? JSON.stringify(item.suggestion)
                      : item.suggestion || 'No suggestion';
                  const strategyVal =
                    typeof item.strategy === 'object'
                      ? JSON.stringify(item.strategy)
                      : item.strategy || 'No strategy';
                  return (
                    <li key={idx} style={{ marginBottom: '1rem' }}>
                      <strong>Idea:</strong> {suggestionVal}
                      <br />
                      <strong>Strategy:</strong> {strategyVal}
                      <br />
                      {item.imageUrl && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <img
                            src={item.imageUrl}
                            alt="Suggestion Visual"
                            style={{ maxWidth: '300px' }}
                          />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* More Advice (from AI) */}
          {campaign.moreAdvice && campaign.moreAdvice.length > 0 && (
            <div className="campaign-detail-box">
              <h2 className="detail-title">Additional Advice</h2>
              <ul>
                {campaign.moreAdvice.map((advice, idx) => {
                  if (typeof advice === 'object') {
                    return (
                      <li key={idx} style={{ marginBottom: '0.5rem' }}>
                        {JSON.stringify(advice)}
                      </li>
                    );
                  }
                  return (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      {advice}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Joined Influencers Section */}
          <div className="campaign-detail-box">
            <h2 className="detail-title">Joined Influencers</h2>
            {campaign.joinedInfluencers && campaign.joinedInfluencers.length > 0 ? (
              <ul className="joined-influencers-list">
                {campaign.joinedInfluencers.map((inf) => (
                  <li key={inf._id} style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <img
                        src={inf.profileImage || 'https://via.placeholder.com/40'}
                        alt="Influencer"
                        style={{
                          width: '50px',
                          height: '50px',
                          borderRadius: '50%',
                          marginRight: '10px',
                          objectFit: 'cover',
                        }}
                      />
                      <strong>
                        {inf.name} — {inf.progress}% complete
                      </strong>
                    </div>
                    {inf.tasks && inf.tasks.length > 0 ? (
                      <ul style={{ marginLeft: '2.5rem', marginTop: '0.5rem' }}>
                        {inf.tasks.map((task) => (
                          <li key={task._id}>
                            {task.text}
                            {task.completed ? ' (Done)' : ''}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ marginLeft: '2.5rem' }}>No tasks yet.</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No joined influencers yet.</p>
            )}
          </div>

          {/* If the campaign doc itself has tasks */}
          {campaign.tasks && campaign.tasks.length > 0 && (
            <div className="campaign-detail-box">
              <h2 className="detail-title">To-Do List</h2>
              <ul>
                {campaign.tasks.map((task, idx) => (
                  <li key={idx}>
                    {task.text} {task.completed ? '(Done)' : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Buttons */}
          <div className="action-buttons">
            <button onClick={() => setIsEditing(true)}>
              Edit Campaign
            </button>
            <button onClick={() => navigate('/find-influencer')}>
              Find Influencers
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CampaignDetail;
