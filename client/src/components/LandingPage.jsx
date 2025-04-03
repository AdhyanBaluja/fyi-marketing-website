import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css'; 
import AiChatbot from './AiChatbot.jsx';
import NavBar from './NavBar.jsx';
import axios from 'axios';

// Import the local MP4 file
import landingPageVideo from '../assets/landingPage.mp4';

// Import images
import benefitsBkg from '../assets/benefitsBkg.png';

// Use different left and right images for brand & influencer
import brandLeft from '../assets/brandLeft.png';
import brandRight from '../assets/brandRight.png';
import inflLeft from '../assets/inflLeft.png';
import inflRight from '../assets/inflRight.png';

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


// ----- Simple Typewriter Component ----- //
function TypewriterTitle() {
  // Wrap the array in useMemo to avoid re-creating it on each render
  const typedWords = useMemo(
    () => ['nfluence....', 'nsights....', 'nteraction....', 'nnovation....', 'mpact....'],
    []
  );

  // Slower typing, slower deleting, longer pause
  const TYPING_SPEED = 120;     
  const DELETING_SPEED = 60;   
  const PAUSE_TIME = 1500;     

  const [text, setText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pause, setPause] = useState(false);

  useEffect(() => {
    if (pause) return;

    const currentWord = typedWords[wordIndex];
    const isWordComplete = charIndex === currentWord.length;
    const isWordEmpty = charIndex === 0;

    let speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;

    if (!isDeleting && isWordComplete) {
      setPause(true);
      setTimeout(() => {
        setIsDeleting(true);
        setPause(false);
      }, PAUSE_TIME);
    } else if (isDeleting && isWordEmpty) {
      setIsDeleting(false);
      setWordIndex((prev) => (prev + 1) % typedWords.length);
    } else {
      const timer = setTimeout(() => {
        setCharIndex((prev) => prev + (isDeleting ? -1 : 1));
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [charIndex, isDeleting, pause, typedWords, wordIndex]);

  useEffect(() => {
    setText(typedWords[wordIndex].substring(0, charIndex));
  }, [charIndex, typedWords, wordIndex]);

  return (
    <h1 className="hero-title">
      Let’sFYI<span className="typewriter-text" style={{ whiteSpace: 'nowrap' }}>{text}</span>
    </h1>
  );
}


function LandingPage() {
  const navigate = useNavigate();

  // Auth state (could come from real auth logic or localStorage)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState(null); // 'brand' or 'influencer' or null

  // Track scroll for NavBar background effect
  const [scrolled, setScrolled] = useState(false);

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
        {/* Local video background container (replaces the old YouTube iframe) */}
        <div className="hero-video-container">
          <video className="hero-video" autoPlay muted loop>
            <source src={landingPageVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          <div className="hero-overlay"></div>
        </div>

        {/* Sign In / Sign Up at top-right only if user is NOT logged in */}
        

        {/* Centered hero content */}
        <div className="hero-content">
          <TypewriterTitle />

          {/* New smaller text below the typewriter */}
          <p className="hero-subtitle">
            Get started today to know more
          </p>

          <div className="hero-cta">
            <button
              className="cta-button influencer-cta"
              onClick={handleInfluencerClick}
            >
              I AM INFLUENCER
            </button>
            <button
              className="cta-button brand-cta"
              onClick={handleBrandClick}
            >
              I AM BRAND
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
                <img className="orange-icon" src={iconAi} alt="AI" />
                <span>AI Powered</span>
              </div>
              <div className="benefit-box">
                <img className="orange-icon" src={iconIdeas} alt="Ideas" />
                <span>Personalised Influencer Campaigns</span>
              </div>
              <div className="benefit-box">
                <img className="orange-icon" src={iconSeam} alt="Seamless" />
                <span>Seamless Collaboration</span>
              </div>
              <div className="benefit-box">
                <img className="orange-icon" src={iconDiverse} alt="Diverse" />
                <span>Diverse Creators</span>
              </div>
              <div className="benefit-box">
                <img className="orange-icon" src={iconGlobal} alt="Global" />
                <span>Global Reach</span>
              </div>
              <div className="benefit-box">
                <img className="orange-icon" src={iconTrust} alt="Trusted" />
                <span>Trusted Partnerships</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== BRAND OFFERINGS ========== */}
      <section className="brand-offerings-page">
        <h2 className="benefits-heading">BRAND OFFERINGS</h2>
        <div className="offerings-big-container">
          <div className="offering-box old-colors">
            <img
              src={brandLeft}
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
              src={brandRight}
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
        <h2 className="benefits-heading">INFLUENCER OFFERINGS</h2>
        <div className="offerings-big-container">
          <div className="offering-box old-colors">
            <img
              src={inflLeft}
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
              src={inflRight}
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
          <h4>© 2025 Let’sFYI</h4>
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
