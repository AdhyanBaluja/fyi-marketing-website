import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Loading.css';

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// Sophisticated processing steps for enterprise marketing AI
const processingPhases = [
  {
    title: "Data Ingestion & Analysis",
    steps: [
      "Importing brand positioning data...",
      "Analyzing market segment parameters...",
      "Calculating competitive landscape metrics...",
      "Indexing demographic target profiles...",
      "Evaluating historical campaign performance...",
      "Processing audience sentiment vectors...",
      "Mapping customer journey touchpoints...",
      "Quantifying engagement propensity factors..."
    ]
  },
  {
    title: "Strategy Synthesis",
    steps: [
      "Constructing message taxonomy framework...",
      "Building platform-specific optimization models...",
      "Developing cross-channel integration matrices...",
      "Formulating content pillar architecture...",
      "Generating timing optimization algorithms...",
      "Establishing performance tracking parameters...",
      "Analyzing contextual relevance patterns...",
      "Mapping audience interaction pathways..."
    ]
  },
  {
    title: "Campaign Blueprint",
    steps: [
      "Formulating tactical execution strategies...",
      "Constructing content deployment sequences...",
      "Optimizing resource allocation frameworks...",
      "Mapping conversion acceleration pathways...",
      "Building engagement optimization models...",
      "Establishing ROI projection analytics...",
      "Finalizing performance measurement criteria...",
      "Rendering campaign visualization outputs..."
    ]
  }
];

// Processing simulation logs that look like code/terminal output
const simulatedProcessingLogs = [
  ">> Initializing neural network model layers...",
  ">> Loading GPT-4 marketing optimization parameters...",
  ">> Accessing brand sentiment database...",
  ">> Processing 3,572 industry benchmarks...",
  ">> Analyzing competitor performance metrics...",
  ">> Running NLP analysis on engagement patterns...",
  ">> Generating correlation matrices for 18 platforms...",
  ">> Evaluating 27 content structure variations...",
  ">> Computing optimal posting frequency distributions...",
  ">> Executing Bayesian probability models...",
  ">> Calculating audience overlap coefficients...",
  ">> Predicting engagement probability factors...",
  ">> Running A/B hypothesis simulations...",
  ">> Optimizing call-to-action effectiveness ratings...",
  ">> Computing ROI projection scenarios...",
  ">> Generating resource allocation recommendations...",
  ">> Compiling platform-specific strategy modules...",
  ">> Assembling campaign timeline architecture...",
  ">> Finalizing content optimization recommendations...",
  ">> Generating content calendar visualization..."
];

// High-value insights
const strategyInsights = [
  "Consistent multi-channel messaging increases conversion rates by 287% vs. single-channel approaches",
  "Businesses that implement AI-driven content strategies see 78% higher engagement than manual approaches",
  "Personalized messaging based on behavioral data yields 49% higher response rates than demographic targeting alone",
  "Integrated marketing approaches reduce customer acquisition costs by 36% compared to siloed campaigns",
  "Strategic content calendars improve team efficiency by 42% while increasing content quality by 28%",
  "Cross-platform optimization strategies increase audience reach by 64% with only 22% more resource investment",
  "AI-optimized posting schedules show a 52% improvement in organic engagement across all platforms"
];

function Loading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [aiReady, setAiReady] = useState(false);
  const [error, setError] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedPhases, setCompletedPhases] = useState([]);
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [logLines, setLogLines] = useState([]);
  const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
  const [processingMetrics, setProcessingMetrics] = useState({
    dataPoints: 0,
    scenarios: 0,
    optimizations: 0
  });
  
  const consoleRef = useRef(null);
  const logContainerRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const campaignId = localStorage.getItem('latestCampaignId');

  // Autoscroll the console log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines]);

  // 1) Poll for AI readiness
  useEffect(() => {
    if (!campaignId) {
      setError('No campaign ID found. Please create a campaign first.');
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        setPollCount((prev) => prev + 1);

        if (pollCount >= 100) {
          setError('AI processing is taking longer than expected. Please try again.');
          clearInterval(pollInterval);
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/campaigns/${campaignId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const campaignDoc = res.data.campaign;

        if (campaignDoc && campaignDoc.aiResponse) {
          setAiReady(true);
        }
      } catch (err) {
        console.warn('Polling error:', err);
      }
    }, 2000); // Poll less frequently to give more time for the experience

    return () => clearInterval(pollInterval);
  }, [campaignId, pollCount, token]);

  // 2) Controlled progress advancement to ensure full experience
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Ensure we don't complete too quickly
        if (prev >= 95) {
          return Math.min(prev + 0.2, 100);
        } else if (prev >= 85) {
          return prev + 0.5;
        } else if (prev >= 70) {
          return prev + 0.8;
        } else if (prev >= 40) {
          return prev + 1.2;
        } else {
          return prev + 1.5;
        }
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  // 3) Phase progression based on progress
  useEffect(() => {
    // Phase transitions at specific progress points
    if (progress >= 33 && currentPhase === 0) {
      setCompletedPhases(prev => [...prev, 0]);
      setCurrentPhase(1);
      setCurrentStepIndex(0);
    } else if (progress >= 66 && currentPhase === 1) {
      setCompletedPhases(prev => [...prev, 1]);
      setCurrentPhase(2);
      setCurrentStepIndex(0);
    } else if (progress >= 99 && currentPhase === 2) {
      setCompletedPhases(prev => [...prev, 2]);
      setLoadingComplete(true);
    }

    // Step through current phase steps
    const currentPhaseSteps = processingPhases[currentPhase].steps;
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % currentPhaseSteps.length);
    }, 2000);

    return () => clearInterval(stepInterval);
  }, [progress, currentPhase]);

  // 4) Add processing logs continually
  useEffect(() => {
    const logInterval = setInterval(() => {
      // Select a random log entry
      const randomLog = simulatedProcessingLogs[Math.floor(Math.random() * simulatedProcessingLogs.length)];
      
      setLogLines(prev => {
        // Keep a maximum of 8 log lines
        const updatedLogs = [...prev, randomLog];
        if (updatedLogs.length > 8) {
          return updatedLogs.slice(updatedLogs.length - 8);
        }
        return updatedLogs;
      });
    }, 1200);

    return () => clearInterval(logInterval);
  }, []);

  // 5) Cycle through insights
  useEffect(() => {
    const insightInterval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % strategyInsights.length);
    }, 6000);
    
    return () => clearInterval(insightInterval);
  }, []);

  // 6) Simulate increasing processing metrics
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setProcessingMetrics(prev => ({
        dataPoints: prev.dataPoints + Math.floor(Math.random() * 5000),
        scenarios: prev.scenarios + Math.floor(Math.random() * 20),
        optimizations: prev.optimizations + Math.floor(Math.random() * 50)
      }));
    }, 3000);
    
    return () => clearInterval(metricsInterval);
  }, []);

  // 7) Navigate if ready
  useEffect(() => {
    if (loadingComplete && aiReady && !error) {
      const timeout = setTimeout(() => {
        navigate('/campaign-results');
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [loadingComplete, aiReady, error, navigate]);

  // Terminal text effect for the phase step display
  const TerminalText = ({ text }) => {
    const [displayText, setDisplayText] = useState('');
    const fullText = text || '';
    
    useEffect(() => {
      let index = 0;
      setDisplayText('');
      
      const typingInterval = setInterval(() => {
        if (index < fullText.length) {
          setDisplayText(current => current + fullText.charAt(index));
          index++;
        } else {
          clearInterval(typingInterval);
        }
      }, 20); // Fast typing effect
      
      return () => clearInterval(typingInterval);
    }, [fullText]);
    
    return <span className="terminal-text">{displayText}<span className="cursor">|</span></span>;
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Render based on state
  if (error) {
    return (
      <div className="premium-loading-container">
        <div className="premium-error-container">
          <div className="error-icon">
            <svg viewBox="0 0 24 24" width="64" height="64">
              <circle cx="12" cy="12" r="10" stroke="#f44336" strokeWidth="2" fill="none"/>
              <path d="M12 7V13" stroke="#f44336" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="12" cy="16" r="1" fill="#f44336"/>
            </svg>
          </div>
          <h2>Processing Error</h2>
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Restart Process
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-loading-container">
      <div className="premium-loading-grid">
        {/* Left side: Processing visualization */}
        <div className="processing-visualization">
          <div className="company-brand">
            <h1>Let'sFYI</h1>
            <span className="brand-tagline">AI-Powered Campaign Generator</span>
          </div>
          
          <div className="phase-indicator">
            {processingPhases.map((phase, index) => (
              <div 
                key={index} 
                className={`phase-item ${currentPhase === index ? 'current' : ''} ${completedPhases.includes(index) ? 'completed' : ''}`}
              >
                <div className="phase-number">{index + 1}</div>
                <div className="phase-info">
                  <h3>{phase.title}</h3>
                  {currentPhase === index && (
                    <div className="current-step">
                      <TerminalText text={phase.steps[currentStepIndex]} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="processing-metrics">
            <div className="metric">
              <div className="metric-value">{formatNumber(processingMetrics.dataPoints)}</div>
              <div className="metric-label">Data Points Analyzed</div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatNumber(processingMetrics.scenarios)}</div>
              <div className="metric-label">Scenarios Evaluated</div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatNumber(processingMetrics.optimizations)}</div>
              <div className="metric-label">Optimizations Applied</div>
            </div>
          </div>
          
          {loadingComplete && (
            <div className="completion-message">
              <div className="checkmark-circle">
                <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                  <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
                  <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                </svg>
              </div>
              <h2>Campaign Generation Complete</h2>
              <p>Redirecting to your campaign dashboard...</p>
            </div>
          )}
        </div>
        
        {/* Right side: Console output and insights */}
        <div className="processing-console">
          <div className="console-header">
            <div className="console-controls">
              <span className="control red"></span>
              <span className="control yellow"></span>
              <span className="control green"></span>
            </div>
            <div className="console-title">AI Processing Terminal</div>
          </div>
          
          <div className="console-body" ref={consoleRef}>
            <div className="log-container" ref={logContainerRef}>
              <div className="log-line system">
                <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                <span className="system-message">AI Marketing Engine v4.2.1 initialized</span>
              </div>
              <div className="log-line system">
                <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                <span className="system-message">Loading campaign parameters...</span>
              </div>
              {logLines.map((line, index) => (
                <div key={index} className="log-line">
                  <span className="timestamp">[{new Date(Date.now() - (logLines.length - index) * 1200).toLocaleTimeString()}]</span>
                  <span className="log-content">{line}</span>
                </div>
              ))}
              {loadingComplete && (
                <div className="log-line success">
                  <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                  <span className="success-message">Campaign generation complete. Results ready for review.</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="insight-panel">
            <div className="insight-header">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#1DA1F2"/>
              </svg>
              <h3>Strategic Insight</h3>
            </div>
            <p className="insight-content">{strategyInsights[currentInsightIndex]}</p>
          </div>
          
          <div className="progress-container">
            <div className="progress-info">
              <span>Overall Progress</span>
              <span className="progress-percentage">{Math.min(Math.round(progress), 100)}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar" style={{ width: `${progress}%` }}>
                <div className="progress-glow"></div>
              </div>
            </div>
            {!loadingComplete && !aiReady && progress >= 90 && (
              <div className="realtime-processing">
                <div className="pulse-dot"></div>
                <span>AI Engine processing in real-time...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Loading;