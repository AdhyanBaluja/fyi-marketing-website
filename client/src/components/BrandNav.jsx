import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BrandNav.css';

function BrandNav() {
  const navigate = useNavigate();

  // Example: Read membership plan from local storage (if you need to lock features).
  const membershipPlan = localStorage.getItem('membershipPlan') || 'Free';

  // Clicking the "letsFYI" logo => go to landing page
  const handleLetsFyiClick = () => {
    navigate('/');
  };

  // Scroll to top => "Dashboard"
  const handleDashboardClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // "Start a Campaign" => locked if plan is Free
  const handleStartCampaignClick = () => {
    if (membershipPlan === 'Free') {
      alert('AI Campaign Builder is locked. Please upgrade to Premium or Pro.');
      return;
    }
    navigate('/brand/campaign-builder');
  };

  // "Your Campaigns" => tries to scroll to an element with id="allCampaigns"
  const handleScrollToCampaigns = () => {
    const campaignsSection = document.getElementById('allCampaigns');
    if (campaignsSection) {
      campaignsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      alert("Campaigns section not found on this page.");
    }
  };

  // "Find Influencers" => go to find-influencer route
  const handleFindInfluencersClick = () => {
    navigate('/find-influencer');
  };

  // "Buy Plan"
  const handleBuyPlanClick = () => {
    navigate('/plans');
  };

  // "Help" => placeholder
  const handleHelpClick = () => {
    alert('Help is on the way!');
  };

  // "Logout" => clear localStorage, navigate to signin
  const handleLogoutClick = () => {
    localStorage.clear();
    navigate('/signin');
  };

  return (
    <nav className="brand-nav">
      <div className="brand-logo" onClick={handleLetsFyiClick}>
        letsFYI
      </div>
      <ul className="nav-links">
        <li onClick={handleDashboardClick}>Dashboard</li>
        <li onClick={handleStartCampaignClick}>Start a Campaign</li>
        <li onClick={handleScrollToCampaigns}>Your Campaigns</li>
        <li onClick={handleFindInfluencersClick}>Find Influencers</li>
        <li onClick={handleBuyPlanClick}>Buy Plan</li>
        <li onClick={handleHelpClick}>Help</li>
        <li onClick={handleLogoutClick}>Logout</li>
      </ul>
    </nav>
  );
}

export default BrandNav;
