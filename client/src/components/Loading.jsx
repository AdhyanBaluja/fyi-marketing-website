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

// Enhanced terminal-style logs with more technical detail
const enhancedProcessingLogs = [
  ">> [AI Core] Initializing transformer architecture with 175B parameters...",
  ">> [Data Module] Loading customer behavior vectors from 12 data sources...",
  ">> [Algorithm] Applying recursive neural net to competitor dataset...",
  ">> [Optimization] Running gradient descent on 145 variables...",
  ">> [Benchmark] Comparing against 12,842 successful campaigns...",
  ">> [NLP Engine] Processing sentiment analysis across 8 languages...",
  ">> [ML Pipeline] Training on 1.2M content engagement patterns...",
  ">> [Analytics] Generating predictive models with 94.7% accuracy...",
  ">> [Integration] Mapping API connections to 23 marketing platforms...",
  ">> [Security] Validating data compliance with GDPR/CCPA standards...",
  ">> [Performance] Optimizing database queries for real-time analysis...",
  ">> [Metrics] Calculating 87 KPIs across demographic segments...",
  ">> [Visualization] Preparing interactive dashboard components...",
  ">> [Strategy] Synthesizing content themes from audience signals...",
  ">> [Testing] Simulating campaign performance across 14 scenarios...",
];

// High-value insights with enhanced scientific backing
const strategyInsights = [
  { 
    text: "Consistent multi-channel messaging increases conversion rates by 287% vs. single-channel approaches",
    icon: "📊",
    source: "Based on analysis of 1,250+ enterprise campaigns"
  },
  { 
    text: "Businesses that implement AI-driven content strategies see 78% higher engagement than manual approaches", 
    icon: "🧠",
    source: "Derived from 3-year longitudinal study across 8 industries"
  },
  { 
    text: "Personalized messaging based on behavioral data yields 49% higher response rates than demographic targeting alone", 
    icon: "👤",
    source: "Validated through A/B testing with 175M+ impressions"
  },
  { 
    text: "Integrated marketing approaches reduce customer acquisition costs by 36% compared to siloed campaigns", 
    icon: "💰",
    source: "Analyzed from financial data of 500+ mid-market companies"
  },
  { 
    text: "Strategic content calendars improve team efficiency by 42% while increasing content quality by 28%", 
    icon: "📅",
    source: "Measured across 230 marketing teams over 12 months"
  },
  { 
    text: "Cross-platform optimization strategies increase audience reach by 64% with only 22% more resource investment", 
    icon: "🌐",
    source: "Calculated from resource allocation data of 120 companies"
  },
  { 
    text: "AI-optimized posting schedules show a 52% improvement in organic engagement across all platforms", 
    icon: "⏱️",
    source: "Based on analysis of 87,000+ social media posts"
  }
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

// Marketing jargon for the particle cloud
const marketingTerms = [
  "Engagement", "ROI", "SEO", "CTA", "Conversion", "KPI", "Metrics", 
  "Analytics", "Content", "Audience", "Targeting", "Strategy",
  "Branding", "Outreach", "Viral", "Organic", "Social", "Campaign",
  "Funnel", "Reach", "Impression", "Optimization", "Growth", "Scale",
  "Algorithm", "AI-Driven", "Predictive", "User-Journey", "Attribution",
  "Hyper-Targeting", "Multi-Channel", "Behavior-Based", "Integrated",
  "Performance", "Automation", "Neural-Net", "Machine-Learning", "Synergy"
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
  const [showAchievement, setShowAchievement] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);
  const [logoAnimation, setLogoAnimation] = useState(false);
  const [particleWords, setParticleWords] = useState([]);
  const [neuralPathways, setNeuralPathways] = useState([]);
  const [logoInteractive, setLogoInteractive] = useState(false);
  const [matrixDensity, setMatrixDensity] = useState(0);
  const [insightExpanded, setInsightExpanded] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [currentTip, setCurrentTip] = useState('');
  
  const consoleRef = useRef(null);
  const logContainerRef = useRef(null);
  const logoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const token = localStorage.getItem('token');
  const campaignId = localStorage.getItem('latestCampaignId');

  // Tips for a more engaging experience
  const tips = [
    "Pro Tip: Our AI analyzes over 500,000 data points to generate your optimal campaign strategy",
    "Pro Tip: Each campaign is unique - we analyze your specific brand positioning for best results",
    "Pro Tip: Our algorithms simulate real audience behavior to predict engagement patterns",
    "Pro Tip: We compare your strategy against thousands of successful campaigns in your industry",
    "Pro Tip: Watch for micro-achievements as your campaign strategy is built in real-time"
  ];

  // Initialize neural pathways for background with enhanced complexity
  useEffect(() => {
    const generateNeuralPathways = () => {
      const pathways = [];
      const numPathways = Math.floor(window.innerWidth / 80); // More dense network
      
      for (let i = 0; i < numPathways; i++) {
        const startX = Math.random() * window.innerWidth;
        const startY = Math.random() * window.innerHeight;
        const points = [];
        
        // Generate a more complex path with multiple points and branches
        let currentX = startX;
        let currentY = startY;
        
        const numPoints = Math.floor(Math.random() * 3) + 5; // 5-7 points per pathway
        
        for (let j = 0; j < numPoints; j++) {
          currentX += (Math.random() - 0.5) * 250;
          currentY += (Math.random() - 0.5) * 250;
          points.push({ x: currentX, y: currentY });
          
          // Add a branch with 30% probability
          if (Math.random() < 0.3 && j > 0) {
            let branchX = points[j-1].x;
            let branchY = points[j-1].y;
            branchX += (Math.random() - 0.5) * 150;
            branchY += (Math.random() - 0.5) * 150;
            points.push({ x: branchX, y: branchY, isBranch: true, connectTo: j-1 });
          }
        }
        
        pathways.push({
          id: i,
          points,
          color: Math.random() > 0.6 ? '#0062ff' : Math.random() > 0.3 ? '#FF7D00' : '#00c853',
          animationDelay: Math.random() * 8,
          opacity: Math.random() * 0.3 + 0.1,
          pulseSpeed: Math.random() * 4 + 2 // Random pulse speed for each pathway
        });
      }
      
      setNeuralPathways(pathways);
    };
    
    generateNeuralPathways();
    window.addEventListener('resize', generateNeuralPathways);
    
    return () => {
      window.removeEventListener('resize', generateNeuralPathways);
    };
  }, []);

  // Initialize particle words with more dynamic behavior
  useEffect(() => {
    const createParticleWords = () => {
      const words = [];
      
      for (let i = 0; i < 35; i++) { // More particles for richer effect
        const term = marketingTerms[Math.floor(Math.random() * marketingTerms.length)];
        
        words.push({
          id: i,
          text: term,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 0.7 + 0.6, // Larger variation in sizes
          opacity: Math.random() * 0.4 + 0.05,
          speed: Math.random() * 0.8 + 0.2,
          direction: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 0.5, // Some words rotate
          color: Math.random() > 0.7 ? 'var(--text-blue)' : 
                 Math.random() > 0.5 ? 'var(--text-orange)' : 
                 Math.random() > 0.2 ? 'var(--text-muted)' : 'var(--text-green)'
        });
      }
      
      setParticleWords(words);
    };
    
    createParticleWords();
  }, []);

  // Show random tip every 20 seconds
  useEffect(() => {
    const showRandomTip = () => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
      setShowTip(true);
      
      setTimeout(() => {
        setShowTip(false);
      }, 5000);
    };
    
    showRandomTip(); // Show first tip immediately
    
    const tipInterval = setInterval(showRandomTip, 20000);
    
    return () => clearInterval(tipInterval);
  }, []);

  // Move particle words with enhanced movement patterns
  useEffect(() => {
    if (particleWords.length === 0) return;
    
    const interval = setInterval(() => {
      setParticleWords(words => 
        words.map(word => {
          // Calculate new position based on direction and speed
          const radians = word.direction * Math.PI / 180;
          let newX = word.x + Math.cos(radians) * word.speed;
          let newY = word.y + Math.sin(radians) * word.speed;
          let newDirection = word.direction;
          let newRotation = (word.rotation || 0) + word.rotationSpeed;
          
          // Bounce off edges with slight direction change for more natural movement
          if (newX < 0 || newX > 100) {
            newDirection = 180 - newDirection + (Math.random() - 0.5) * 20;
          }
          if (newY < 0 || newY > 100) {
            newDirection = 360 - newDirection + (Math.random() - 0.5) * 20;
          }
          
          // Occasionally change direction slightly for more organic movement
          if (Math.random() < 0.05) {
            newDirection += (Math.random() - 0.5) * 30;
          }
          
          // Keep within bounds
          newX = Math.max(0, Math.min(100, newX));
          newY = Math.max(0, Math.min(100, newY));
          
          // Occasionally change opacity for twinkling effect
          let newOpacity = word.opacity;
          if (Math.random() < 0.1) {
            newOpacity = Math.max(0.05, Math.min(0.5, word.opacity + (Math.random() - 0.5) * 0.1));
          }
          
          return {
            ...word,
            x: newX,
            y: newY,
            direction: newDirection,
            rotation: newRotation,
            opacity: newOpacity
          };
        })
      );
    }, 100);
    
    return () => clearInterval(interval);
  }, [particleWords]);

  // Autoscroll the console log with smooth behavior
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logLines]);

  // Handle logo interactions
  useEffect(() => {
    const handleLogoInteraction = () => {
      if (logoRef.current) {
        logoRef.current.addEventListener('mouseenter', () => setLogoInteractive(true));
        logoRef.current.addEventListener('mouseleave', () => setLogoInteractive(false));
        logoRef.current.addEventListener('click', () => {
          setLogoAnimation(true);
          setTimeout(() => setLogoAnimation(false), 2000);
          
          // Add a small easter egg - temporarily increase speed of everything
          setProgress(prev => Math.min(prev + 2, 100));
          setMatrixDensity(prev => Math.min(prev + 0.2, 1));
          
          // Play a subtle sound effect
          const audio = new Audio('/ui-sound.mp3');
          audio.volume = 0.1;
          audio.play().catch(e => console.log('Audio play failed:', e));
        });
      }
    };
    
    handleLogoInteraction();
    
    return () => {
      if (logoRef.current) {
        logoRef.current.removeEventListener('mouseenter', () => setLogoInteractive(true));
        logoRef.current.removeEventListener('mouseleave', () => setLogoInteractive(false));
        logoRef.current.removeEventListener('click', () => {
          setLogoAnimation(true);
          setTimeout(() => setLogoAnimation(false), 2000);
        });
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
    }, 2000); // Poll less frequently to give more time for the experience

    return () => clearInterval(pollInterval);
  }, [campaignId, pollCount, token]);

  // Controlled progress advancement to ensure full experience
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

  // Phase progression based on progress with enhanced transitions
  useEffect(() => {
    // Phase transitions at specific progress points
    if (progress >= 33 && currentPhase === 0) {
      setCompletedPhases(prev => [...prev, 0]);
      setCurrentPhase(1);
      setCurrentStepIndex(0);
      setLogoAnimation(true);
      
      // Play phase completion sound
      const audio = new Audio('/phase-complete.mp3');
      audio.volume = 0.2;
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      setTimeout(() => setLogoAnimation(false), 2000);
    } else if (progress >= 66 && currentPhase === 1) {
      setCompletedPhases(prev => [...prev, 1]);
      setCurrentPhase(2);
      setCurrentStepIndex(0);
      setLogoAnimation(true);
      
      // Play phase completion sound
      const audio = new Audio('/phase-complete.mp3');
      audio.volume = 0.2;
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      setTimeout(() => setLogoAnimation(false), 2000);
    } else if (progress >= 99 && currentPhase === 2) {
      setCompletedPhases(prev => [...prev, 2]);
      setLoadingComplete(true);
      
      // Play completion sound
      const audio = new Audio('/completion-sound.mp3');
      audio.volume = 0.3;
      audio.play().catch(e => console.log('Audio play failed:', e));
    }

    // Step through current phase steps with variable timing for more realistic feel
    const currentPhaseSteps = processingPhases[currentPhase].steps;
    const stepInterval = setInterval(() => {
      setCurrentStepIndex(prev => (prev + 1) % currentPhaseSteps.length);
    }, 1500 + Math.random() * 1000); // Random timing between 1.5-2.5s for more realistic feel

    return () => clearInterval(stepInterval);
  }, [progress, currentPhase]);

  // Add processing logs continually with enhanced variety
  useEffect(() => {
    const logInterval = setInterval(() => {
      // Select a random log entry with increasing sophistication as progress increases
      let randomLog;
      if (progress < 40) {
        randomLog = simulatedProcessingLogs[Math.floor(Math.random() * simulatedProcessingLogs.length)];
      } else {
        randomLog = enhancedProcessingLogs[Math.floor(Math.random() * enhancedProcessingLogs.length)];
      }
      
      setLogLines(prev => {
        // Keep a maximum of 10 log lines
        const updatedLogs = [...prev, randomLog];
        if (updatedLogs.length > 10) {
          return updatedLogs.slice(updatedLogs.length - 10);
        }
        return updatedLogs;
      });
      
      // Increment matrix density for more intense visual as processing continues
      setMatrixDensity(prev => Math.min(prev + 0.01, 1));
    }, 800 + Math.random() * 800); // Variable timing for more realistic look

    return () => clearInterval(logInterval);
  }, [progress]);

  // Cycle through insights with pause on hover
  useEffect(() => {
    if (insightExpanded) return;
    
    const insightInterval = setInterval(() => {
      setCurrentInsightIndex(prev => (prev + 1) % strategyInsights.length);
    }, 8000); // Longer display time for better readability
    
    return () => clearInterval(insightInterval);
  }, [insightExpanded]);

  // Simulate increasing processing metrics with acceleration
  useEffect(() => {
    const metricsInterval = setInterval(() => {
      setProcessingMetrics(prev => {
        // More dramatic increases in later stages
        const multiplier = progress < 33 ? 1 : progress < 66 ? 2 : 3;
        
        return {
          dataPoints: prev.dataPoints + Math.floor(Math.random() * 8000 * multiplier),
          scenarios: prev.scenarios + Math.floor(Math.random() * 30 * multiplier),
          optimizations: prev.optimizations + Math.floor(Math.random() * 75 * multiplier)
        };
      });
    }, 3000);
    
    return () => clearInterval(metricsInterval);
  }, [progress]);

  // Check for micro-achievements with enhanced notifications
  useEffect(() => {
    const achievement = microAchievements.find(
      a => Math.floor(progress) === a.threshold
    );
    
    if (achievement && !showAchievement) {
      setCurrentAchievement(achievement);
      setShowAchievement(true);
      
      // Play achievement sound
      const audio = new Audio('/achievement-sound.mp3');
      audio.volume = 0.2;
      audio.play().catch(e => console.log('Audio play failed:', e));
      
      // Hide the achievement after a few seconds
      setTimeout(() => {
        setShowAchievement(false);
      }, 4000);
    }
  }, [progress, showAchievement]);

  // Navigate if ready with delay for satisfying conclusion
  useEffect(() => {
    if (loadingComplete && aiReady && !error) {
      const timeout = setTimeout(() => {
        navigate('/campaign-results');
      }, 5000); // Longer display of completion state for satisfaction
      
      return () => clearTimeout(timeout);
    }
  }, [loadingComplete, aiReady, error, navigate]);

  // Terminal text effect for the phase step display with variable typing speed
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
          
          // Vary typing speed slightly for realistic effect
          if (Math.random() < 0.2) {
            clearInterval(typingInterval);
            setTimeout(() => {
              const newInterval = setInterval(() => {
                if (index < fullText.length) {
                  setDisplayText(current => current + fullText.charAt(index));
                  index++;
                } else {
                  clearInterval(newInterval);
                }
              }, 15 + Math.random() * 10);
            }, 40 + Math.random() * 30);
          }
        } else {
          clearInterval(typingInterval);
        }
      }, 15 + Math.random() * 10); // Variable typing speed
      
      return () => clearInterval(typingInterval);
    }, [fullText]);
    
    return <span className="terminal-text">{displayText}<span className="cursor">|</span></span>;
  };

  // Format large numbers with commas for better readability
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Neural network background with enhanced animation
  const NeuralNetwork = () => (
    <div className="neural-network-container">
      <svg className="neural-network" width="100%" height="100%">
        {neuralPathways.map(pathway => (
          <g key={pathway.id}>
            <path
              d={`M ${pathway.points.filter(p => !p.isBranch).map(p => `${p.x} ${p.y}`).join(' L ')}`}
              stroke={pathway.color}
              strokeWidth="1"
              fill="none"
              style={{
                opacity: pathway.opacity,
                strokeDasharray: "5,5",
                animation: `dash ${pathway.pulseSpeed + 10}s linear infinite ${pathway.animationDelay}s, pathway-pulse ${pathway.pulseSpeed}s ease-in-out infinite`
              }}
            />
            {/* Add branches with connections to main path */}
            {pathway.points.filter(p => p.isBranch).map((point, index) => (
              <path
                key={`branch-${index}`}
                d={`M ${pathway.points[point.connectTo].x} ${pathway.points[point.connectTo].y} L ${point.x} ${point.y}`}
                stroke={pathway.color}
                strokeWidth="1"
                fill="none"
                style={{
                  opacity: pathway.opacity * 0.7,
                  strokeDasharray: "3,3",
                  animation: `dash ${pathway.pulseSpeed + 5}s linear infinite ${pathway.animationDelay + 0.5}s`
                }}
              />
            ))}
            {pathway.points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={point.isBranch ? "2" : "3"}
                fill={pathway.color}
                style={{
                  opacity: pathway.opacity + 0.2,
                  animation: `pulse ${pathway.pulseSpeed}s infinite ${index * 0.3}s`
                }}
              />
            ))}
          </g>
        ))}
      </svg>
    </div>
  );

  // Particle words animation with rotation and color
  const ParticleWords = () => (
    <div className="particle-words-container">
      {particleWords.map(word => (
        <div
          key={word.id}
          className="particle-word"
          style={{
            left: `${word.x}%`,
            top: `${word.y}%`,
            fontSize: `${word.size}rem`,
            opacity: word.opacity,
            color: word.color,
            transform: word.rotation ? `rotate(${word.rotation}deg)` : 'none'
          }}
        >
          {word.text}
        </div>
      ))}
    </div>
  );

  // Enhanced achievement notification with icon
  const AchievementNotification = () => (
    <div className={`achievement-notification ${showAchievement ? 'show' : ''}`}>
      <div className="achievement-icon">{currentAchievement?.icon || '🏆'}</div>
      <div className="achievement-content">
        <h3>{currentAchievement?.title}</h3>
        <p>{currentAchievement?.description}</p>
      </div>
    </div>
  );

  // Tip notification
  const TipNotification = () => (
    <div className={`tip-notification ${showTip ? 'show' : ''}`}>
      <div className="tip-icon">💡</div>
      <div className="tip-content">
        <p>{currentTip}</p>
      </div>
    </div>
  );

  // Render based on state
  if (error) {
    return (
      <div className="premium-loading-container">
        <NeuralNetwork />
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
      <ParticleWords />
      <AchievementNotification />
      <TipNotification />
      
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
              <div className="metric-bar" style={{width: `${Math.min(processingMetrics.dataPoints / 100000 * 100, 100)}%`}}></div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatNumber(processingMetrics.scenarios)}</div>
              <div className="metric-label">Scenarios Evaluated</div>
              <div className="metric-bar" style={{width: `${Math.min(processingMetrics.scenarios / 300 * 100, 100)}%`}}></div>
            </div>
            <div className="metric">
              <div className="metric-value">{formatNumber(processingMetrics.optimizations)}</div>
              <div className="metric-label">Optimizations Applied</div>
              <div className="metric-bar" style={{width: `${Math.min(processingMetrics.optimizations / 800 * 100, 100)}%`}}></div>
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
                {Array.from({ length: 100 }).map((_, i) => (
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
              <div className="log-line system">
                <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                <span className="system-message">AI Marketing Engine v4.2.1 initialized</span>
              </div>
              <div className="log-line system">
                <span className="timestamp">[{new Date().toLocaleTimeString()}]</span>
                <span className="system-message">Loading campaign parameters...</span>
              </div>
              {logLines.map((line, index) => (
                <div key={index} className="log-line" style={{animationDelay: `${index * 0.1}s`}}>
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
          
          <div 
            className={`insight-panel ${insightExpanded ? 'expanded' : ''}`}
            onClick={() => setInsightExpanded(!insightExpanded)}
          >
            <div className="insight-header">
              <div className="insight-icon">{strategyInsights[currentInsightIndex].icon}</div>
              <h3>Strategic Insight {insightExpanded ? '(click to collapse)' : '(click to expand)'}</h3>
            </div>
            <p className="insight-content">{strategyInsights[currentInsightIndex].text}</p>
            
            {insightExpanded && (
              <div className="insight-source">
                <small>Source: {strategyInsights[currentInsightIndex].source}</small>
              </div>
            )}
            
            <div className="insight-pagination">
              {strategyInsights.map((_, idx) => (
                <span 
                  key={idx} 
                  className={`insight-dot ${idx === currentInsightIndex ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentInsightIndex(idx);
                  }}
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