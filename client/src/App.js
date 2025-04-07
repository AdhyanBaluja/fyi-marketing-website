// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './components/LandingPage';
import ChooseAccountType from './components/ChooseAccountType';

import BrandSignUpForm from './components/BrandSignUpForm';
import InfluencerSignUpForm from './components/InfluencerSignUpForm';
import SignIn from './components/SignIn';

import BrandDashboard from './components/BrandDashboard';
import InfluencerDashboard from './components/InfluencerDashboard';

import CampaignBuilder from './components/CampaignBuilder';
import CampaignResults from './components/CampaignResults';
import CampaignDetail from './components/CampaignDetail';

import Amplify from './components/Amplify';
import MarketProduct from './components/MarketProduct';
import DriveSales from './components/DriveSales';
import FindNewCustomers from './components/FindNewCustomers';
import DriveEventAwareness from './components/DriveEventAwareness';

import Loading from './components/Loading';

import FindInfluencer from './components/FindInfluencer';
import PlanPage from './components/PlanPage';
import PaymentSuccess from './components/paymentSuccess';
import PaymentError from './components/paymentError';
import InfluencerProfile from './components/InfluencerProfile';

import PageDetection from './components/PageDetection'; // Added import for page detection

function App() {
  return (
    <Router>
      <PageDetection /> {/* Added PageDetection component for page tracking */}
      <Routes>
        {/* Landing */}
        <Route path="/" element={<LandingPage />} />

        {/* Step 1: Choose brand or influencer */}
        <Route path="/signup" element={<ChooseAccountType />} />

        {/* Step 2a: If brand is chosen -> /signup/brand */}
        <Route path="/signup/brand" element={<BrandSignUpForm />} />

        {/* Step 2b: If influencer is chosen -> /signup/influencer */}
        <Route path="/signup/influencer" element={<InfluencerSignUpForm />} />

        {/* Sign In */}
        <Route path="/signin" element={<SignIn />} />

        {/* Dashboards */}
        <Route path="/brand/dashboard" element={<BrandDashboard />} />
        <Route path="/influencer/dashboard" element={<InfluencerDashboard />} />

        {/* AI Campaign Builder */}
        <Route path="/brand/campaign-builder" element={<CampaignBuilder />} />

        {/* These are optional or placeholders for your pages */}
        <Route path="/amplify" element={<Amplify />} />
        <Route path="/market-product" element={<MarketProduct />} />
        <Route path="/drive-sales" element={<DriveSales />} />
        <Route path="/find-new-customers" element={<FindNewCustomers />} />
        <Route path="/drive-event-awareness" element={<DriveEventAwareness />} />

        {/* Old route: <Route path="/campaign-detail" element={<CampaignDetail />} /> */}
        {/* Replaced by a dynamic route for detail page: */}
        <Route path="/campaign-detail/:campaignId" element={<CampaignDetail />} />

        {/* Influencer search */}
        <Route path="/find-influencer" element={<FindInfluencer />} />

        {/* Loading screen */}
        <Route path="/loading" element={<Loading />} />

        {/* Campaign Results (the big calendar with "Add to My Campaign" button) */}
        <Route path="/campaign-results" element={<CampaignResults />} />

        {/* Payment/Plan pages */}
        <Route path="/plans" element={<PlanPage />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-error" element={<PaymentError />} />

        {/* Influencer Profile */}
        <Route path="/influencer-profile/:id" element={<InfluencerProfile />} />
      </Routes>
    </Router>
  );
}

export default App;
