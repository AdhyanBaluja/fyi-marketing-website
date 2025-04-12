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

// Technical logs with code-like syntax
const technicalLogs = [
  ">> [DATA] import.fetchBrandData(apiKey, sourceId) -> SUCCESS",
  ">> [CORE] analyzer.processKeywords(data, config.nlp) -> 532 terms extracted",
  ">> [ML] models.competitorAnalysis.train(marketData) -> r²: 0.897",
  ">> [API] apis.socialPlatforms.connect() -> 8 connections established",
  ">> [CALC] optimizer.calculateEngagementMetrics(audienceData) -> completed",
  ">> [DB] database.marketBenchmarks.query({industry: client.industry}) -> 238 records",
  ">> [ALGO] algorithms.contentStrategy.execute(brand, 3) -> generating...",
  ">> [NLP] nlp.sentimentAnalysis.batch(feedbackData) -> pos:68% neg:18% neu:14%",
  ">> [UI] renderer.prepareVisualization(dataset, 'engagement') -> initialized",
  ">> [TEST] tester.validateStrategy({type: 'monteCarlo', n: 1000}) -> passed",
  ">> [PERF] performance.optimizeResourceAllocation({budget: client.budget}) -> optimal",
  ">> [SEC] security.validateCompliance(strategy, 'GDPR') -> compliant",
  ">> [SYS] system.executeParallelProcessing(['audience', 'content', 'channels']) -> complete",
  ">> [STAT] statistics.predictConversionRate(strategy) -> 4.8% (±0.3%)"
];

// Code snippets for terminal
const codeSnippets = [
  ">> function optimizeContentMix(audience, goals) { return weighted_blend(types); }",
  ">> ROI_projection = initial_investment * (1 + conversion_rate * avg_value - cost_basis);",
  ">> engagement_score = (likes * 1) + (shares * 5) + (comments * 3) + (clicks * 2);",
  ">> const optimal_times = audiences.reduce((acc, a) => [...acc, ...a.active_periods]);",
  ">> if (sentiment_score > 0.7 && reach_potential > 5000) { recommend(content_type); }",
  ">> channels.sort((a, b) => b.performance_index - a.performance_index).slice(0, 5);",
  ">> keyword_density = primary_keywords.reduce((sum, kw) => sum + content.count(kw), 0);",
  ">> conversion_funnel = stages.map(stage => { return {name: stage, rate: rates[stage]} });",
  ">> class ContentStrategy extends BaseStrategy { constructor(brand) { super(); } }",
  ">> const attribution = touchpoints.reduce((model, point) => model.add(point), new Model());"
];

// Inline insights for terminal
const inlineInsights = [
  "/* Insight: Top 5% of campaigns share consistent cross-platform messaging */",
  "/* Insight: AI-driven targeting shows 42% better ROI than traditional methods */",
  "/* Insight: Optimal posting frequency varies by platform and audience */",
  "/* Insight: Customer sentiment analysis improves targeting precision by 37% */",
  "/* Insight: Visual content generates 3.2x more engagement than text-only */",
  "/* Insight: Synchronized multi-channel launches increase conversion by 28% */",
  "/* Insight: Strategic hashtag usage can extend organic reach by up to 40% */"
];

// High-value insights
const strategyInsights = [
  { text: "Consistent multi-channel messaging increases conversion rates by 287% vs. single-channel approaches", icon: "📊" },
  { text: "Businesses that implement AI-driven content strategies see 78% higher engagement than manual approaches", icon: "🧠" },
  { text: "Personalized messaging based on behavioral data yields 49% higher response rates than demographic targeting alone", icon: "👤" },
  { text: "Integrated marketing approaches reduce customer acquisition costs by 36% compared to siloed campaigns", icon: "💰" },
  { text: "Strategic content calendars improve team efficiency by 42% while increasing content quality by 28%", icon: "📅" },
  { text: "Cross-platform optimization strategies increase audience reach by 64% with only 22% more resource investment", icon: "🌐" },
  { text: "AI-optimized posting schedules show a 52% improvement in organic engagement across all platforms", icon: "⏱️" }
];

// Micro achievements to trigger dopamine response
const microAchievements = [
  { threshold: 15, title: "Data Collection Complete", description: "Brand positioning data successfully integrated", icon: "🔍" },
  { threshold: 30, title: "Audience Analysis Finished", description: "Target demographic profile established", icon: "👥" },
  { threshold: 45, title: "Competitive Analysis Ready", description: "Market differentiation factors identified", icon: "📊" },
  { threshold: 60, title: "Channel Strategy Optimized", description: "Platform-specific approaches formulated", icon: "🌐" },
  { threshold: 75, title: "Content Strategy Developed", description: "Message framework structuring complete", icon: "📝" },
  { threshold: 90, title: "Campaign Timeline Generated", description: "Optimal scheduling parameters identified", icon: "📅" },
  { threshold: 98, title: "Final Optimizations Applied", description: "Performance predictions calculated", icon: "🚀" }
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
    dataPoints: 12543,
    scenarios: 87,
    optimizations: 156
  });
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [logoAnimation, setLogoAnimation] = useState(false);
  const [stars, setStars] = useState([]);
  const [neuralPathways, setNeuralPathways] = useState([]);
  const [logoInteractive, setLogoInteractive] = useState(false);
  const [matrixDensity, setMatrixDensity] = useState(0);
  
  const consoleRef = useRef(null);
  const logContainerRef = useRef(null);
  const logoRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const campaignId = localStorage.getItem('latestCampaignId');

  // Generate star field background for better performance
  useEffect(() => {
    const generateStarField = () => {
      const starsArray = [];
      const numStars = Math.min(window.innerWidth / 3, 200); // Limit for performance
      
      for (let i = 0; i < numStars; i++) {
        starsArray.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 0.5,
          animationDuration: Math.random() * 4 + 2,
          animationDelay: Math.random() * 4
        });
      }
      
      return starsArray;
    };
    
    setStars(generateStarField());
    
    const handleResize = () => {
      setStars(generateStarField());
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Simplified neural pathways for better performance
  useEffect(() => {
    const generateNeuralPathways = () => {
      const pathways = [];
      const numPathways = Math.min(Math.floor(window.innerWidth / 120), 15); // Limit for performance
      
      for (let i = 0; i < numPathways; i++) {
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const points = [];
        
        // Generate simpler paths with fewer points
        let currentX = startX;
        let currentY = startY;
        
        const numPoints = Math.floor(Math.random() * 2) + 3; // 3-4 points per pathway
        
        for (let j = 0; j < numPoints; j++) {
          currentX += (Math.random() - 0.5) * 200;
          currentY += (Math.random() - 0.5) * 200;
          points.push({ x: currentX, y: currentY });
        }
        
        pathways.push({
          id: i,
          points,
          color: i % 3 === 0 ? '#0062ff' : i % 3 === 1 ? '#FF7D00' : '#00c853',
          animationDelay: Math.random() * 5,
          opacity: Math.random() * 0.2 + 0.1
        });
      }
      
      setNeuralPathways(pathways);
    };
    
    generateNeuralPathways();
    
    const handleResize = () => {
      generateNeuralPathways();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Autoscroll the console log
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines]);

  // Handle logo interactions
  useEffect(() => {
    const handleMouseEnter = () => setLogoInteractive(true);
    const handleMouseLeave = () => setLogoInteractive(false);
    const handleClick = () => {
      setLogoAnimation(true);
      setTimeout(() => setLogoAnimation(false), 2000);
      
      // Add a small easter egg - temporarily increase speed
      setProgress(prev => Math.min(prev + 2, 100));
      setMatrixDensity(prev => Math.min(prev + 0.2, 1));
      
      // Play a subtle sound effect if available
      try {
        const audio = new Audio('/ui-sound.mp3');
        audio.volume = 0.1;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio not available');
      }
    };
    
    if (logoRef.current) {
      logoRef.current.addEventListener('mouseenter', handleMouseEnter);
      logoRef.current.addEventListener('mouseleave', handleMouseLeave);
      logoRef.current.addEventListener('click', handleClick);
    }
    
    return () => {
      if (logoRef.current) {
        logoRef.current.removeEventListener('mouseenter', handleMouseEnter);
        logoRef.current.removeEventListener('mouseleave', handleMouseLeave);
        logoRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [logoRef]);

  // Poll for AI readiness
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
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [campaignId, pollCount, token]);

  // Controlled progress advancement
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        // Ensure we don't complete too quickly
        if (prev >= 95) {
          return Math.min(prev + 0.2, 100);
        } else if (prev >= 85) {
          return prev + 0.4;
        } else if (prev >= 70) {
          return prev + 0.6;
        } else if (prev >= 40) {
          return prev + 0.8;
        } else {
          return prev + 1;
        }
      });
    }, 300);

    return () => clearInterval(progressInterval);
  }, []);

  // Phase progression based on progress
  useEffect(() => {
    // Phase transitions at specific progress points
    if (progress >= 33 && currentPhase === 0) {
      setCompletedPhases(prev => [...prev, 0]);
      setCurrentPhase(1);
      setCurrentStepIndex(0);
      setLogoAnimation(true);
      
      // Play phase completion sound if available
      try {
        const audio = new Audio('/phase-complete.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio not available');
      }
      
      setTimeout(() => setLogoAnimation(false), 2000);
    } else if (progress >= 66 && currentPhase === 1) {
      setCompletedPhases(prev => [...prev, 1]);
      setCurrentPhase(2);
      setCurrentStepIndex(0);
      setLogoAnimation(true);
      
      // Play phase completion sound if available
      try {
        const audio = new Audio('/phase-complete.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio not available');
      }
      
      setTimeout(() => setLogoAnimation(false), 2000);
    } else if (progress >= 99 && currentPhase === 2) {
      setCompletedPhases(prev => [...prev, 2]);
      setLoadingComplete(true);
      
      // Play completion sound if available
      try {
        const audio = new Audio('/completion-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio not available');
      }
    }

    // Step through current phase steps
    const currentPhaseSteps = processingPhases[currentPhase].steps;
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % currentPhaseSteps.length);
    }, 1500 + Math.random() * 1000); // Random timing between 1.5-2.5s for more realistic feel

    return () => clearInterval(stepInterval);
  }, [progress, currentPhase]);

  // Generate terminal logs with fast-scrolling code effect
  useEffect(() => {
    // Clear logs first
    setLogLines([]);

    // Initial system logs
    setLogLines([
      "AI Marketing Engine v4.2.1 initialized",
      "Loading campaign parameters...",
      "Establishing secure connection to marketing API...",
      "Fetching brand guidelines from repository..."
    ]);

    const addLog = (log) => {
      setLogLines(prev => {
        // Keep maximum 15 log lines for better scrolling
        const updatedLogs = [...prev, log];
        if (updatedLogs.length > 15) {
          return updatedLogs.slice(updatedLogs.length - 15);
        }
        return updatedLogs;
      });
    };

    // All logs combined for variety
    const allLogs = [
      ...simulatedProcessingLogs,
      ...technicalLogs,
      ...technicalLogs, // Double weight to technical logs
      ...codeSnippets
    ];

    // Add logs at a faster pace
    const logInterval = setInterval(() => {
      const randomLog = allLogs[Math.floor(Math.random() * allLogs.length)];
      addLog(randomLog);
      
      // Increment matrix density
      setMatrixDensity(prev => Math.min(prev + 0.01, 1));
    }, 350); // Faster for rapid scrolling effect

    // Add occasional insights
    const insightInterval = setInterval(() => {
      if (Math.random() < 0.15) { // 15% chance to show insight
        const randomInsight = inlineInsights[Math.floor(Math.random() * inlineInsights.length)];
        addLog(randomInsight);
      }
    }, 5000);

    return () => {
      clearInterval(logInterval);
      clearInterval(insightInterval);
    };
  }, []);

  // Cycle through insights
  useEffect(() => {
    const insightInterval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % strategyInsights.length);
    }, 8000);
    
    return () => clearInterval(insightInterval);
  }, []);

  // Simulate increasing processing metrics with non-zero values
// Update this useEffect to ensure metrics keep increasing
useEffect(() => {
  // Initialize with non-zero starting values (which you already have)
  
  // Set a shorter interval for more frequent updates
  const metricsInterval = setInterval(() => {
    setProcessingMetrics(prev => {
      // More dramatic increases in later stages
      const multiplier = progress < 33 ? 1 : progress < 66 ? 2 : 3;
      
      return {
        // Add larger increments and ensure they're never zero
        dataPoints: prev.dataPoints + Math.floor(Math.random() * 1200 * multiplier + 200),
        scenarios: prev.scenarios + Math.floor(Math.random() * 4 * multiplier + 2),
        optimizations: prev.optimizations + Math.floor(Math.random() * 2 * multiplier + 2)
      };
    });
  }, 1200); // Faster update frequency (was 2000)
  
  return () => clearInterval(metricsInterval);
}, []);
  // Check for micro-achievements
  useEffect(() => {
    const achievement = microAchievements.find(
      a => Math.floor(progress) === a.threshold
    );
    
    if (achievement && !showAchievement) {
      setCurrentAchievement(achievement);
      setShowAchievement(true);
      
      // Play achievement sound if available
      try {
        const audio = new Audio('/achievement-sound.mp3');
        audio.volume = 0.2;
        audio.play().catch(e => console.log('Audio play failed:', e));
      } catch (error) {
        console.log('Audio not available');
      }
      
      // Hide the achievement after a few seconds
      setTimeout(() => {
        setShowAchievement(false);
      }, 4000);
    }
  }, [progress, showAchievement]);

  // Navigate if ready
  useEffect(() => {
    if (loadingComplete && aiReady && !error) {
      const timeout = setTimeout(() => {
        navigate('/campaign-results');
      }, 5000);
      
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
      }, 20);
      
      return () => clearInterval(typingInterval);
    }, [fullText]);
    
    return <span className="terminal-text">{displayText}<span className="cursor">|</span></span>;
  };

  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Star field background for better performance
  const StarField = () => (
    <div className="star-field">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDuration: `${star.animationDuration}s`,
            animationDelay: `${star.animationDelay}s`
          }}
        />
      ))}
    </div>
  );

  // Simplified neural network background
  const NeuralNetwork = () => (
    <div className="neural-network-container">
      <svg className="neural-network" width="100%" height="100%">
        {neuralPathways.map(pathway => (
          <g key={pathway.id}>
            <path
              d={`M ${pathway.points.map(p => `${p.x} ${p.y}`).join(' L ')}`}
              stroke={pathway.color}
              strokeWidth="1"
              fill="none"
              style={{
                opacity: pathway.opacity,
                strokeDasharray: "5,5",
                animation: `dash 20s linear infinite ${pathway.animationDelay}s`
              }}
            />
            {pathway.points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="2"
                fill={pathway.color}
                style={{
                  opacity: pathway.opacity + 0.2
                }}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );

  // Achievement notification
  const AchievementNotification = () => (
    <div className={`achievement-notification ${showAchievement ? 'show' : ''}`}>
      <div className="achievement-icon">{currentAchievement?.icon || '🏆'}</div>
      <div className="achievement-content">
        <h3>{currentAchievement?.title}</h3>
        <p>{currentAchievement?.description}</p>
      </div>
    </div>
  );

  // Render based on state
  if (error) {
    return (
      <div className="premium-loading-container">
        <NeuralNetwork />
        <StarField />
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
            <span className="retry-icon">⟳</span> Restart Process
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-loading-container">
      <NeuralNetwork />
      <StarField />
      <AchievementNotification />
      
      <div className="premium-loading-grid">
        {/* Left side: Processing visualization */}
        <div className="processing-visualization">
          <div className={`company-brand ${logoAnimation ? 'pulse' : ''} ${logoInteractive ? 'interactive' : ''}`} ref={logoRef}>
            <div className="logo-container">
              <div className="logo-circle">
                <div className="logo-inner-circle"></div>
              </div>
              <div className="logo-fx">
                <span className="fx-particle one"></span>
                <span className="fx-particle two"></span>
                <span className="fx-particle three"></span>
              </div>
              <h1 className="logo-text">Let'sFYI</h1>
            </div>
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
    {/* Lower the denominator to make the bar fill faster */}
    <div className="metric-bar" style={{width: `${Math.min(processingMetrics.dataPoints / 500000 * 100, 100)}%`}}></div>
  </div>
  <div className="metric">
    <div className="metric-value">{formatNumber(processingMetrics.scenarios)}</div>
    <div className="metric-label">Scenarios Evaluated</div>
    {/* Lower the denominator to make the bar fill faster */}
    <div className="metric-bar" style={{width: `${Math.min(processingMetrics.scenarios / 2000 * 100, 100)}%`}}></div>
  </div>
  <div className="metric">
    <div className="metric-value">{formatNumber(processingMetrics.optimizations)}</div>
    <div className="metric-label">Optimizations Applied</div>
    {/* Lower the denominator to make the bar fill faster */}
    <div className="metric-bar" style={{width: `${Math.min(processingMetrics.optimizations / 4000 * 100, 100)}%`}}></div>
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
              <div className="confetti-container">
                {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="confetti-piece" style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 1}s`,
                    animationDuration: `${2 + Math.random() * 2}s`,
                    backgroundColor: i % 5 === 0 ? '#0062ff' : i % 5 === 1 ? '#FF7D00' : i % 5 === 2 ? '#00c853' : i % 5 === 3 ? '#FFC107' : '#651FFF',
                    width: `${4 + Math.random() * 6}px`,
                    height: `${Math.random() > 0.5 ? 8 + Math.random() * 10 : 4 + Math.random() * 5}px`,
                    transform: `rotate(${Math.random() * 360}deg)`
                  }}></div>
                ))}
              </div>
              <h2 data-text="Campaign Generation Complete">Campaign Generation Complete</h2>
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
            <div className="matrix-background" style={{opacity: 0.03 + matrixDensity * 0.07}}></div>
            <div className="log-container" ref={logContainerRef}>
              {logLines.map((line, index) => (
                <div key={index} className="log-line">
                  <span className="timestamp">[{new Date(Date.now() - (logLines.length - index) * 500).toLocaleTimeString()}]</span>
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
              <div className="insight-icon">{strategyInsights[currentInsightIndex].icon}</div>
              <h3>Strategic Insight</h3>
            </div>
            <p className="insight-content">{strategyInsights[currentInsightIndex].text}</p>
            
            <div className="insight-pagination">
              {strategyInsights.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`insight-dot ${idx === currentInsightIndex ? 'active' : ''}`}
                  onClick={() => setCurrentInsightIndex(idx)}
                ></span>
              ))}
            </div>
          </div>
          
          <div className="progress-container">
            <div className="progress-info">
              <span>Overall Progress</span>
              <span 
                className="progress-percentage" 
                style={{
                  color: progress < 33 ? 'var(--text-primary)' : 
                         progress < 66 ? 'var(--text-blue)' : 
                         progress < 90 ? 'var(--text-orange)' : 
                         'var(--text-green)'
                }}
              >
                {Math.min(Math.round(progress), 100)}%
              </span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar" 
                style={{ 
                  width: `${progress}%`,
                  background: progress < 33 ? 'linear-gradient(to right, var(--primary-blue), var(--accent-teal))' :
                              progress < 66 ? 'linear-gradient(to right, var(--accent-teal), var(--primary-orange))' :
                              'linear-gradient(to right, var(--primary-orange), var(--premium-green))'
                }}
              >
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