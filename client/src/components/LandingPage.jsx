import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; 
import AiChatbot from './AiChatbot.jsx';
import NavBar from './NavBar.jsx';  // your separate NavBar component
import axios from 'axios'; // Minimal addition for the token check

// Asset imports
import benefitsBkg from '../assets/benefitsBkg.png';
import brandimg1 from '../assets/leftimg.png';
import brandimg2 from '../assets/rightimg.png';
import inflimg1 from '../assets/leftimg.png';
import inflimg2 from '../assets/rightimg.png';
import dashboardImg from '../assets/dashboard.png';

// Example icons
const iconAi     = 'https://cdn-icons-png.flaticon.com/512/1041/1041916.png';
const iconIdeas  = 'https://cdn-icons-png.flaticon.com/512/2375/2375506.png';
const iconSeam   = 'https://cdn-icons-png.flaticon.com/512/2285/2285582.png';
const iconDiverse= 'https://cdn-icons-png.flaticon.com/512/2278/2278125.png';
const iconGlobal = 'https://cdn-icons-png.flaticon.com/512/984/984233.png';
const iconTrust  = 'https://cdn-icons-png.flaticon.com/512/709/709624.png';

// Define API base URL from env variable; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function LandingPage() {
  const navigate = useNavigate();

  // Auth state (could come from real auth logic or localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'brand' or 'influencer' or null

  // Track scroll for NavBar background effect
  const [scrolled, setScrolled] = useState(false);

  // On mount, read from localStorage, then check token validity
  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserType = localStorage.getItem('userType');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    setIsLoggedIn(storedLoggedIn);
    setUserType(storedUserType || null);

    // If a token is present, verify it's still valid by calling a protected route
    if (token && userId) {
      axios
        .get(`${API_BASE_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .catch((error) => {
          if (error.response && error.response.status === 401) {
            // token expired => log out
            localStorage.clear();
            setIsLoggedIn(false);
            setUserType(null);
          }
        });
    }

    const handleScroll = () => {
      if (window.scrollY > 50) setScrolled(true);
      else setScrolled(false);
    };
    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handlers for CTA
  const handleInfluencerClick = () => {
    navigate('/signup/influencer');
  };
  const handleBrandClick = () => {
    navigate('/signup/brand');
  };

  // Sign In / Sign Up
  const handleSignUp = () => {
    navigate('/signup');
  };
  const handleSignIn = () => {
    navigate('/signin');
  };

  return (
    <div className={`landing-page ${scrolled ? 'scrolled' : ''}`}>
      {/* NavBar at top (fixed) */}
      <NavBar isLoggedIn={isLoggedIn} userType={userType} scrolled={scrolled} />

      {/* ========== HERO SECTION ========== */}
      <section className="hero-section">
        {/* Video background container */}
        <div className="hero-video-container">
          <iframe
            className="hero-video"
            src="https://www.youtube.com/embed/V3cB0WmBV5M?autoplay=1&mute=1&controls=0&loop=1&playlist=V3cB0WmBV5M"
            title="Background Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
          <div className="hero-overlay"></div>
        </div>

        {/* Sign In / Sign Up at top-right only if user is NOT logged in */}
        {!isLoggedIn && (
          <div className="hero-header">
            <button className="auth-btn" onClick={handleSignUp}>
              SIGN UP
            </button>
            <button className="auth-btn" onClick={handleSignIn}>
              SIGN IN
            </button>
          </div>
        )}

        {/* Centered hero content */}
        <div className="hero-content">
          <h1 className="hero-title">
            Free <em>and easy</em> influencer &amp; creator<br />
            marketing platform
          </h1>
          <div className="hero-cta">
            <button
              className="cta-button influencer-cta"
              onClick={handleInfluencerClick}
            >
              I AM AN INFLUENCER
            </button>
            <button
              className="cta-button brand-cta"
              onClick={handleBrandClick}
            >
              I AM A BRAND
            </button>
          </div>
        </div>
      </section>

      {/* ========== BENEFITS SECTION ========== */}
      <section
        className="benefits-section"
        style={{
          background: `url(${benefitsBkg}) center center / cover no-repeat`,
        }}
      >
        <div className="benefits-overlay">
          <div className="benefits-content">
            <h2>FROM CONCEPT TO CONVERSION</h2>
            <p className="benefits-subtext">
              ELEVATE YOUR INFLUENCER MARKETING CAMPAIGNS USING OUR PLATFORM
            </p>
            <div className="benefits-boxes">
              <div className="benefit-box">
                <img src={iconAi} alt="AI" />
                <span>AI Powered</span>
              </div>
              <div className="benefit-box">
                <img src={iconIdeas} alt="Ideas" />
                <span>Personalised Influencer Campaigns</span>
              </div>
              <div className="benefit-box">
                <img src={iconSeam} alt="Seamless" />
                <span>Seamless Collaboration</span>
              </div>
              <div className="benefit-box">
                <img src={iconDiverse} alt="Diverse" />
                <span>Diverse Creators</span>
              </div>
              <div className="benefit-box">
                <img src={iconGlobal} alt="Global" />
                <span>Global Reach</span>
              </div>
              <div className="benefit-box">
                <img src={iconTrust} alt="Trusted" />
                <span>Trusted Partnerships</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BRAND OFFERINGS ========== */}
      <section className="brand-offerings-page">
        <h2 className="page-title">Brand Offerings</h2>
        <div className="offerings-big-container">
          <div className="offering-box old-colors">
            <img
              src={brandimg1}
              alt="Brand 1"
              className="offering-img hover-zoom"
            />
            <h3>Campaign Management</h3>
            <p>
              Start creating and managing impactful campaigns tailored for your
              brand needs, across all major marketing platforms.
            </p>
          </div>

          <div className="offering-box old-colors">
            <img
              src={brandimg2}
              alt="Brand 2"
              className="offering-img hover-zoom"
            />
            <h3>Influencer Discovery</h3>
            <p>
              Collaborate with creators using our advanced search filters and
              AI-powered recommendations tailored for your campaigns.
            </p>
          </div>
        </div>
      </section>

      {/* ========== INFLUENCER OFFERINGS ========== */}
      <section className="influencer-offerings-page">
        <h2 className="page-title">Influencer Offerings</h2>
        <div className="offerings-big-container">
          <div className="offering-box old-colors">
            <img
              src={inflimg1}
              alt="Infl 1"
              className="offering-img hover-zoom"
            />
            <h3>Brand Collaboration</h3>
            <p>
              Access a variety of brand campaigns tailored to your niche,
              with enhanced visibility to top brands looking for creators
              like you.
            </p>
          </div>

          <div className="offering-box old-colors">
            <img
              src={inflimg2}
              alt="Infl 2"
              className="offering-img hover-zoom"
            />
            <h3>Campaigns Tracking</h3>
            <p>
              Seamlessly track all your campaign briefs, drafts and revisions
              in one place. Track deadlines and posting schedules easily
              through your dashboard.
            </p>
          </div>
        </div>
      </section>

      {/* ========== CALL TO ACTION ========== */}
      <section className="call-to-action-section final-cta">
        <div className="cta-content">
          <h2>Take your marketing campaigns to the next level</h2>
          <button className="cta-demo-btn">Book Your Demo</button>
        </div>
        <div className="cta-dashboard-img">
          <img src={dashboardImg} alt="Dashboard" />
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="brand-footer">
        <div className="footer-content">
          <h4>© 2025 letFYI</h4>
          <div className="footer-links">
            <a href="#0">Terms &amp; Conditions</a>
            <a href="#0">Privacy Policy</a>
            <a href="#0">Contact Us</a>
          </div>
        </div>
      </footer>

      {/* AI Chatbot */}
      <AiChatbot />
    </div>
  );
}

export default LandingPage;
