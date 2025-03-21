import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignBuilder.css';

// Use the environment variable for the API base URL, falling back to localhost if not set
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function CampaignBuilder() {
  const navigate = useNavigate();

  // 1) Store membership plan to block usage if it's "Free"
  const [membershipPlan, setMembershipPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(true);

  // 2) Selected Goals
  const [selectedGoals, setSelectedGoals] = useState([]);

  // 3) Read user info from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // 4) On mount, check user and fetch membership plan
  useEffect(() => {
    if (!token || !userId) {
      navigate('/signin');
      return;
    }
    fetchUserPlan();
    // eslint-disable-next-line
  }, []);

  const fetchUserPlan = async () => {
    try {
      setLoadingPlan(true);
      const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const plan = res.data.user.membershipPlan || 'Free';
      setMembershipPlan(plan);
      setLoadingPlan(false);

      // If plan is "Free", block usage & redirect
      if (plan === 'Free') {
        alert('AI Campaign Builder is locked. Please upgrade your plan.');
        navigate('/brand/dashboard');
      }
    } catch (err) {
      console.error('Error fetching user plan:', err);
      alert('Error verifying your plan. Redirecting...');
      navigate('/brand/dashboard');
    }
  };

  // 5) Define available goals
  const goals = [
    {
      id: 'amplify-brand-awareness',
      label: 'Amplify Awareness',
      description: "Boost my brand's presence and make it top of mind for audiences.",
      icon: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      category: 'top',
      tint: '#ffeff3',
    },
    {
      id: 'market-a-product',
      label: 'Market a Product',
      description: 'Showcase my product to attract more customers and increase sales.',
      icon: 'https://cdn-icons-png.flaticon.com/512/2910/2910795.png',
      category: 'top',
      tint: '#eafcff',
    },
    {
      id: 'drive-sales',
      label: 'Drive Sales',
      description: 'Accelerate my sales efforts and push for higher conversion rates.',
      icon: 'https://cdn-icons-png.flaticon.com/512/1170/1170576.png',
      category: 'top',
      tint: '#f1eeff',
    },
    {
      id: 'find-new-customers',
      label: 'Find New Customers',
      description: 'Reach untapped markets and expand my customer base.',
      icon: 'https://cdn-icons-png.flaticon.com/512/847/847969.png',
      category: 'more',
      tint: '#fff3e6',
    },
    {
      id: 'drive-event-awareness',
      label: 'Drive Event Awareness',
      description: 'Increase visibility and excitement for my event.',
      icon: 'https://cdn-icons-png.flaticon.com/512/921/921347.png',
      category: 'more',
      tint: '#ffeef1',
    },
  ];

  // Toggle goal selection
  const handleToggleGoal = (id) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  const handleCancel = () => {
    setSelectedGoals([]);
  };

  // On continue, ensure exactly one goal is selected and navigate accordingly
  const handleContinue = () => {
    if (selectedGoals.length === 1) {
      const selectedGoal = goals.find((g) => g.id === selectedGoals[0]);
      if (selectedGoal.id === 'amplify-brand-awareness') {
        navigate('/amplify', { state: { selectedGoal } });
      } else if (selectedGoal.id === 'market-a-product') {
        navigate('/market-product', { state: { selectedGoal } });
      } else if (selectedGoal.id === 'drive-sales') {
        navigate('/drive-sales', { state: { selectedGoal } });
      } else if (selectedGoal.id === 'find-new-customers') {
        navigate('/find-new-customers', { state: { selectedGoal } });
      } else if (selectedGoal.id === 'drive-event-awareness') {
        navigate('/drive-event-awareness', { state: { selectedGoal } });
      } else {
        alert(`Navigation for "${selectedGoal.label}" is not yet implemented.`);
      }
    } else {
      alert('Please select exactly one goal to continue.');
    }
  };

  // Split goals into top vs. more categories
  const topGoals = goals.filter((g) => g.category === 'top');
  const moreGoals = goals.filter((g) => g.category === 'more');

  if (loadingPlan) {
    return (
      <div className="campaign-builder-full-page">
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Verifying your plan...
        </p>
      </div>
    );
  }

  return (
    <div className="campaign-builder-full-page">
      <div className="campaign-builder-panel">
        <div className="campaign-builder-header">
          <h2>
            Campaign Builder <span className="new-badge">New</span>
          </h2>
          <p>Choose one and get a multi-channel campaign to meet your goal.</p>
        </div>

        <div className="top-goals-section">
          {topGoals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-box ${selectedGoals.includes(goal.id) ? 'selected' : ''}`}
              style={{ backgroundColor: goal.tint }}
              onClick={() => handleToggleGoal(goal.id)}
            >
              <div className="goal-icon">
                <img src={goal.icon} alt={goal.label} />
              </div>
              <h3>{goal.label}</h3>
              <p>{goal.description}</p>
            </div>
          ))}
        </div>

        <h4 className="more-goals-title">More goals</h4>
        <div className="more-goals-section">
          {moreGoals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-box ${selectedGoals.includes(goal.id) ? 'selected' : ''}`}
              style={{ backgroundColor: goal.tint }}
              onClick={() => handleToggleGoal(goal.id)}
            >
              <div className="goal-icon">
                <img src={goal.icon} alt={goal.label} />
              </div>
              <h3>{goal.label}</h3>
              <p>{goal.description}</p>
            </div>
          ))}
        </div>

        <div className="campaign-builder-buttons">
          <button className="cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="continue-btn" onClick={handleContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default CampaignBuilder;
