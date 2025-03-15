// src/components/Loading.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Loading.css';

function Loading() {
  const [progress, setProgress] = useState(0);
  const [aiReady, setAiReady] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const campaignId = localStorage.getItem('latestCampaignId'); // read from localStorage

  // 1) Poll for AI readiness
  useEffect(() => {
    if (!campaignId) {
      setError('No campaign ID found in localStorage.');
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        setPollCount((prev) => prev + 1);

        if (pollCount >= 30) {
          setError('AI results are taking longer than expected. Please refresh or try again.');
          clearInterval(pollInterval);
          return;
        }

        // Must be correct route => /api/campaigns/:id
        const res = await axios.get(`http://localhost:4000/api/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const campaignDoc = res.data.campaign;

        // if we see campaignDoc.aiResponse => AI is done
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
        if (prev >= 100) return 100;
        return prev + 5;
      });
    }, 250);

    return () => clearInterval(progressInterval);
  }, []);

  // 3) Navigate if ready
  useEffect(() => {
    if (progress >= 100 && aiReady && !error) {
      const timeout = setTimeout(() => {
        navigate('/campaign-results');
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [progress, aiReady, error, navigate]);

  // 4) Render
  if (error) {
    return (
      <div className="loading-container">
        <div className="loading-content" style={{ color: 'red' }}>
          <h1>Error</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="loading-container">
      <div className="loading-content">
        <h1>Generating Your Campaign...</h1>
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <p>
          {progress}% {progress >= 100 && !aiReady ? '(Awaiting AI results...)' : 'Completed'}
        </p>
      </div>
    </div>
  );
}

export default Loading;
