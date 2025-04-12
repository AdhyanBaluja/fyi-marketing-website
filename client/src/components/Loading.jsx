import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Loading.css';

// Use environment variable for API base URL; fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// Array of loading messages to cycle through
const loadingMessages = [
  "Analyzing brand goals and metrics...",
  "Crafting personalized content strategy...",
  "Developing engagement opportunities...",
  "Identifying top-performing platforms...",
  "Creating calendar of optimal posting times...",
  "Designing targeted messaging frameworks...",
  "Generating influencer collaboration suggestions...",
  "Optimizing conversion pathways...",
  "Finalizing campaign recommendations..."
];

// Array of campaign tips
const campaignTips = [
  "Tip: Consistency in posting schedule increases audience retention by up to 31%",
  "Tip: User-generated content drives 29% higher engagement than branded content",
  "Tip: Videos under 60 seconds have the highest completion rate across platforms",
  "Tip: Responding to comments within an hour can boost conversion by 25%",
  "Tip: Micro-influencers often generate 7x more engagement per follower than celebrities",
  "Tip: A/B testing your CTAs can improve click-through rates by up to 40%",
  "Tip: Storytelling content receives 22% more shares than promotional content"
];

function FixedLoading() {
  const [progress, setProgress] = useState(0);
  const [aiReady, setAiReady] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const [loadingComplete, setLoadingComplete] = useState(false);
  
  const particlesContainer = useRef(null);
  const progressBarRef = useRef(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const campaignId = localStorage.getItem('latestCampaignId'); // read from localStorage

  // Create particles effect
  useEffect(() => {
    if (particlesContainer.current) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random position, size and animation delay
        const size = Math.random() * 6 + 2;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particle.style.opacity = Math.random() * 0.5 + 0.1;
        
        particlesContainer.current.appendChild(particle);
      }
    }
    
    return () => {
      if (particlesContainer.current) {
        while (particlesContainer.current.firstChild) {
          particlesContainer.current.removeChild(particlesContainer.current.firstChild);
        }
      }
    };
  }, []);

  // 1) Poll for AI readiness
  useEffect(() => {
    if (!campaignId) {
      setError('No campaign ID found in localStorage.');
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        setPollCount((prev) => prev + 1);

        if (pollCount >= 100) {
          setError('AI results are taking longer than expected. Please refresh or try again.');
          clearInterval(pollInterval);
          return;
        }

        // Use API_BASE_URL from the environment variable
        const res = await axios.get(`${API_BASE_URL}/api/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const campaignDoc = res.data.campaign;

        // if campaignDoc.aiResponse exists, then AI processing is done
        if (campaignDoc && campaignDoc.aiResponse) {
          setAiReady(true);
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 1000);

    return () => clearInterval(pollInterval);
  }, [campaignId, pollCount, token]);

  // 2) Progress bar
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Slow down progress as it gets closer to 100%
        if (prev >= 95) {
          return Math.min(prev + 0.5, 100);
        } else if (prev >= 85) {
          return prev + 1;
        } else if (prev >= 70) {
          return prev + 2;
        } else {
          return prev + 3;
        }
      });
    }, 250);

    return () => clearInterval(progressInterval);
  }, []);

  // Update progress bar glow based on progress
  useEffect(() => {
    if (progressBarRef.current) {
      const intensity = Math.min(progress / 100 * 15, 15);
      progressBarRef.current.style.boxShadow = `0 0 ${intensity}px 0 rgba(255, 125, 0, 0.8)`;
    }

    // Set loading complete when progress hits 100
    if (progress >= 100) {
      setLoadingComplete(true);
    }
  }, [progress]);

  // 3) Cycle through loading messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => 
        prevIndex === loadingMessages.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    
    return () => clearInterval(messageInterval);
  }, []);
  
  // 4) Cycle through tips
  useEffect(() => {
    const tipInterval = setInterval(() => {
      setShowTip(false);
      setTimeout(() => {
        setCurrentTipIndex((prevIndex) => 
          prevIndex === campaignTips.length - 1 ? 0 : prevIndex + 1
        );
        setShowTip(true);
      }, 500);
    }, 6000);
    
    return () => clearInterval(tipInterval);
  }, []);

  // 5) Navigate if ready
  useEffect(() => {
    if (loadingComplete && aiReady && !error) {
      // Navigate to results page after 3 seconds of completion
      console.log("Loading complete and AI ready - will navigate in 3 seconds");
      const timeout = setTimeout(() => {
        console.log("Navigating to campaign-results");
        navigate('/campaign-results');
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [loadingComplete, aiReady, error, navigate]);

  // 6) Render
  if (error) {
    return (
      <div className="enhanced-loading-container">
        <div className="particles-container" ref={particlesContainer}></div>
        <div className="loading-card error-card">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" width="60" height="60">
              <circle cx="12" cy="12" r="10" stroke="#f44336" strokeWidth="2" fill="none"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="#f44336" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="#f44336"/>
            </svg>
          </div>
          <h1>Generation Error</h1>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-loading-container">
      <div className="particles-container" ref={particlesContainer}></div>
      <div className="gradient-overlay"></div>
      <div className="grid-pattern"></div>
      
      <div className="loading-card">
        <div className={`loading-icon ${loadingComplete ? 'complete' : ''}`}>
          {loadingComplete ? (
            <svg className="checkmark" viewBox="0 0 52 52">
              <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
              <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          ) : (
            <div className="spinner-container">
              <div className="spinner"></div>
              <div className="spinner-inner"></div>
            </div>
          )}
        </div>
        
        <h1 className="loading-title">Generating Your Campaign</h1>
        
        <div className="loading-message-container">
          <div className="loading-message">
            {loadingComplete 
              ? "Campaign successfully generated!" 
              : loadingMessages[currentMessageIndex]
            }
          </div>
        </div>
        
        <div className="progress-container">
          <div className="progress-bar-container">
            <div 
              className="progress-bar" 
              ref={progressBarRef}
              style={{ width: `${progress}%` }}
            >
              <div className="progress-glow"></div>
            </div>
          </div>
          <div className="progress-text">
            <span className="progress-percentage">{Math.min(Math.round(progress), 100)}%</span>
            <span className="progress-status">
              {loadingComplete && !aiReady ? 'Finalizing results...' : 'Completed'}
            </span>
          </div>
        </div>
        
        <div className={`campaign-tip ${showTip ? 'visible' : 'hidden'}`}>
          <div className="tip-icon">💡</div>
          <p>{campaignTips[currentTipIndex]}</p>
        </div>
        
        {loadingComplete && (
          <div className="redirect-message">
            <p>Redirecting to results in 3 seconds...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FixedLoading;