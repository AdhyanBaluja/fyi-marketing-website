// src/components/PlanPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PlanPage.css';
import AiChatbot from './AiChatbot.jsx';
import axios from 'axios';

import logoImage from '../assets/logo.jpg';

// Use an environment variable for your API base URL
// Fallback to localhost:4000 if REACT_APP_API_BASE_URL is not set
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function PlanPage() {
  const navigate = useNavigate();

  // We only keep two plans: Premium & Standard
  const plans = [
    {
      name: 'Premium',
      price: 100,
      description: [
        'Full access to all advanced features',
        'Priority 24/7 customer support',
        'Unlimited AI campaigns and influencer research',
        'Campaign Builder Tool included',
      ],
      colorClass: 'premium-plan',
    },
    {
      name: 'Standard',
      price: 50,
      description: [
        'Essential features for moderate usage',
        'Standard email/chat support',
        'Limited AI campaigns per month',
        'Campaign Builder Tool is not included',
      ],
      colorClass: 'standard-plan',
    },
  ];

  const [membershipPlan, setMembershipPlan] = useState('');
  const [loadingUser, setLoadingUser] = useState(true);

  // We assume userId and token are stored in localStorage at login
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!token || !userId) {
      navigate('/signin');
      return;
    }
    fetchUserData();
    // eslint-disable-next-line
  }, []);

  const fetchUserData = async () => {
    try {
      setLoadingUser(true);
      // Use API_BASE_URL from environment variable
      const res = await axios.get(`${API_BASE_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // res.data => { user: { membershipPlan: 'Free', ... } }
      setMembershipPlan(res.data.user.membershipPlan || 'Free');
    } catch (err) {
      console.error('Error fetching user data for plan:', err);
    } finally {
      setLoadingUser(false);
    }
  };

  // Create a Stripe Checkout session
  const handleBuyPlan = async (planName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planName, userId }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe checkout
      } else {
        alert('Error creating checkout session: ' + data.error);
      }
    } catch (err) {
      console.error('Buy plan error:', err);
      alert('Something went wrong creating the checkout session');
    }
  };

  return (
    <div className="plan-page-container">
      {/* Header */}
      <header className="plan-header">
        <div className="plan-header-left">
          <img src={logoImage} alt="letsFYI logo" className="logo-img" />
          <h1 className="header-title">letsFYI</h1>
        </div>
      </header>

      {/* Tagline */}
      <section className="plan-tagline">
        <h2>Give us your stress and let the magic begin</h2>
      </section>

      {/* If still loading user data */}
      {loadingUser ? (
        <p style={{ textAlign: 'center', marginTop: '2rem' }}>
          Loading your current plan...
        </p>
      ) : (
        <section style={{ textAlign: 'center', margin: '1rem' }}>
          <h3>Your Current Plan:</h3>
          <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
            {membershipPlan}
          </p>
        </section>
      )}

      {/* Plans Section */}
      <section className="plans-section">
        <h3 className="plans-title">Choose the plan that’s best for you.</h3>
        
        <div className="plans-cards-container">
          {plans.map((plan) => (
            <div key={plan.name} className={`plan-card ${plan.colorClass}`}>
              <div className="plan-header-box">
                <h4 className="plan-name">{plan.name}</h4>
                <p className="plan-price">£{plan.price}/month</p>
              </div>
              <ul className="plan-description">
                {plan.description.map((desc, idx) => (
                  <li key={idx}>{desc}</li>
                ))}
              </ul>
              <button
                className="buy-plan-btn"
                onClick={() => handleBuyPlan(plan.name)}
              >
                Buy Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Chatbot Icon + Logic */}
      <AiChatbot />
    </div>
  );
}

export default PlanPage;
