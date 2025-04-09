import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CampaignBuilder.css';
import NavBar from './NavBar';

// Use the environment variable for the API base URL, falling back to localhost if not set
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// Inline SVG components to replace external icon URLs
const MegaphoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 11 18-5v12L3 13"></path>
    <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
    <path d="M16 10a4 4 0 0 1-8 0"></path>
    <path d="M3 6h18"></path>
  </svg>
);

const BarChartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <line x1="18" y1="20" x2="18" y2="10"></line>
    <line x1="12" y1="20" x2="12" y2="4"></line>
    <line x1="6" y1="20" x2="6" y2="14"></line>
  </svg>
);

const MapPinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const CalendarHeartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
  >
    <path d="M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5Z"></path>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
    <path d="M12 18.66C12 18.66 14.5 17.9 14.5 16.1C14.5 14.67 13.38 14.15 12 16C10.62 14.15 9.5 14.67 9.5 16.1C9.5 17.9 12 18.66 12 18.66Z"></path>
  </svg>
);

function CampaignBuilder() {
  const navigate = useNavigate();

  // Membership plan and loading state
  const [membershipPlan, setMembershipPlan] = useState('');
  const [loadingPlan, setLoadingPlan] = useState(true);

  // User info state (for NavBar, etc.)
  const [userInfo, setUserInfo] = useState({});

  // Selected goals
  const [selectedGoals, setSelectedGoals] = useState([]);

  // Read user/token from localStorage
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Check user plan on mount
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

      // Also store user info for NavBar usage
      setUserInfo(res.data.user);

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

  // Available goals - defined without React components in the objects
  const goals = [
    {
      id: 'amplify-brand-awareness',
      label: 'Amplify Awareness',
      description: "Boost my brand's presence and make it top of mind for audiences.",
      iconType: 'megaphone',
      category: 'top',
    },
    {
      id: 'market-a-product',
      label: 'Market a Product',
      description: 'Showcase my product to attract more customers and increase sales.',
      iconType: 'shopping-bag',
      category: 'top',
    },
    {
      id: 'drive-sales',
      label: 'Drive Sales',
      description: 'Accelerate my sales efforts and push for higher conversion rates.',
      iconType: 'bar-chart',
      category: 'top',
    },
    {
      id: 'find-new-customers',
      label: 'Find New Customers',
      description: 'Reach untapped markets and expand my customer base.',
      iconType: 'map-pin',
      category: 'more',
    },
    {
      id: 'drive-event-awareness',
      label: 'Drive Event Awareness',
      description: 'Increase visibility and excitement for my event.',
      iconType: 'calendar-heart',
      category: 'more',
    },
  ];

  // Function to render the right icon based on the iconType
  const renderIcon = (iconType) => {
    switch (iconType) {
      case 'megaphone':
        return <MegaphoneIcon />;
      case 'shopping-bag':
        return <ShoppingBagIcon />;
      case 'bar-chart':
        return <BarChartIcon />;
      case 'map-pin':
        return <MapPinIcon />;
      case 'calendar-heart':
        return <CalendarHeartIcon />;
      default:
        return null;
    }
  };

  // Toggle goal selection
  const handleToggleGoal = (id) => {
    setSelectedGoals((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
    );
  };

  // Reset selected goals
  const handleCancel = () => {
    setSelectedGoals([]);
  };

  // Continue => Ensure exactly one selected goal => navigate
  const handleContinue = () => {
    if (selectedGoals.length === 1) {
      const selectedGoalId = selectedGoals[0];
      const selectedGoal = goals.find((g) => g.id === selectedGoalId);
      
      // Pass only serializable data (no React components or functions)
      const goalData = {
        id: selectedGoal.id,
        label: selectedGoal.label,
        description: selectedGoal.description,
        iconType: selectedGoal.iconType,
        category: selectedGoal.category
      };

      switch (selectedGoalId) {
        case 'amplify-brand-awareness':
          navigate('/amplify', { state: { selectedGoal: goalData } });
          break;
        case 'market-a-product':
          navigate('/market-product', { state: { selectedGoal: goalData } });
          break;
        case 'drive-sales':
          navigate('/drive-sales', { state: { selectedGoal: goalData } });
          break;
        case 'find-new-customers':
          navigate('/find-new-customers', { state: { selectedGoal: goalData } });
          break;
        case 'drive-event-awareness':
          navigate('/drive-event-awareness', { state: { selectedGoal: goalData } });
          break;
        default:
          alert(`Navigation for "${selectedGoal.label}" is not yet implemented.`);
          break;
      }
    } else {
      alert('Please select exactly one goal to continue.');
    }
  };

  // Split goals by category
  const topGoals = goals.filter((g) => g.category === 'top');
  const moreGoals = goals.filter((g) => g.category === 'more');

  if (loadingPlan) {
    return (
      <div className="campaign-builder-full-page">
        <p style={{ textAlign: 'center', marginTop: '2rem', color: '#F8F1E5' }}>
          Verifying your plan...
        </p>
      </div>
    );
  }

  return (
    <div className="campaign-builder-full-page">
      <NavBar userInfo={userInfo} isAuthenticated={!!token} />
      <div className="campaign-builder-panel">
        <div className="campaign-builder-header">
          <h2>Campaign Builder</h2>
          <span className="new-badge">New</span>
          <p>Choose one and get a multi-channel campaign to meet your goal.</p>
        </div>

        <div className="top-goals-section">
          {topGoals.map((goal) => (
            <div
              key={goal.id}
              className={`goal-box ${selectedGoals.includes(goal.id) ? 'selected' : ''}`}
              onClick={() => handleToggleGoal(goal.id)}
            >
              <div className="goal-icon">{renderIcon(goal.iconType)}</div>
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
              onClick={() => handleToggleGoal(goal.id)}
            >
              <div className="goal-icon">{renderIcon(goal.iconType)}</div>
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