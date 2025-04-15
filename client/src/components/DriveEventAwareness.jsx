import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './combined.css';
import AiChatbot from './AiChatbot.jsx';
import BrandBuilderGame from './BrandBuilderGame.jsx';

// Expanded marketing quotes for more variety
const marketingQuotes = [
  { text: "Great events deserve great promotion. The right message at the right time.", author: "Seth Godin" },
  { text: "An event's success is measured by how many people talk about it afterward.", author: "David Ogilvy" },
  { text: "Events create community; marketing creates awareness.", author: "Jay Baer" },
  { text: "The best marketing doesn't feel like marketing.", author: "Tom Fishburne" },
  { text: "Event marketing is not just about the event itself - it's about creating an experience.", author: "Andrea Michaels" },
  { text: "The goal is to turn data into information, and information into insight.", author: "Carly Fiorina" },
  { text: "The best events create memories that last longer than the event itself.", author: "Jeff Kear" },
  { text: "An event is not a one-day achievement, but a lasting impression.", author: "Jack Morton" },
];

// Dopamine-triggering micro-achievements
const microAchievements = [
  "Form completion boosts event visibility by 30%!",
  "Great details! Your event potential just increased!",
  "You're creating an event campaign better than 82% of marketers!",
  "Excellent progress! Your event strategy is shaping up nicely!",
  "Amazing plan forming! Your audience will be excited for this event!",
  "You're unlocking premium event marketing potential!"
];

// Use environment variable for API base URL; fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function DriveEventAwareness() {
  const navigate = useNavigate();
  const formRef = useRef(null);
  const progressBarRef = useRef(null);
  const networkRef = useRef(null);

  // Basic form fields
  const [formData, setFormData] = useState({
    businessDescription: '',
    industry: '',
    timeframe: { start: '', end: '' },
    platforms: '',
    eventDescription: '',
    uniqueFeatures: '',
  });

  // UI states
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formCompletion, setFormCompletion] = useState(0);
  const [activeField, setActiveField] = useState(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [showQuoteAnimation, setShowQuoteAnimation] = useState(true);
  const [achievementMessage, setAchievementMessage] = useState('');
  const [showAchievement, setShowAchievement] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const [networkMode, setNetworkMode] = useState('default'); // 'default', 'celebration', 'processing'
  const [campaignCreated, setCampaignCreated] = useState(false);
  
  // Interactive visualization state
  const [networkNodes, setNetworkNodes] = useState(generateRandomNodes(16));
  const [networkConnections, setNetworkConnections] = useState([]);
  const [activeNode, setActiveNode] = useState(null);
  const [brandStrength, setBrandStrength] = useState(Math.floor(formCompletion / 10));
  const [brandReach, setBrandReach] = useState(Math.floor(formCompletion / 5));
  const [insightDrops, setInsightDrops] = useState([]);

  // Mini-game state
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  
  // Campaign creation timer
  const campaignCreationTimer = useRef(null);

  // Color theme options that users can toggle (professional dark themes)
  const [colorTheme, setColorTheme] = useState('orange-navy'); // 'orange-navy', 'blue-teal', 'purple-indigo'

  // Quote rotation effect with more dramatic animation
  useEffect(() => {
    const interval = setInterval(() => {
      setShowQuoteAnimation(false);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % marketingQuotes.length);
        setShowQuoteAnimation(true);
      }, 800);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Update form completion percentage with micro-achievements for dopamine hits
  useEffect(() => {
    const totalFields = Object.keys(formData).length + 1; // +1 for timeframe which has two inputs
    let filledFields = 0;
    
    Object.entries(formData).forEach(([key, value]) => {
      if (key === 'timeframe') {
        if (value.start) filledFields += 0.5;
        if (value.end) filledFields += 0.5;
      } else if (value) {
        filledFields += 1;
      }
    });
    
    const previousCompletion = formCompletion;
    const newCompletion = Math.round((filledFields / totalFields) * 100);
    setFormCompletion(newCompletion);
    
    // Trigger micro-achievements based on milestones
    if (newCompletion > previousCompletion && [25, 50, 75, 90, 100].includes(newCompletion)) {
      triggerAchievement();
    } else if (newCompletion > previousCompletion && newCompletion % 20 === 0) {
      triggerAchievement();
    }
    
    // Update brand metrics 
    setBrandStrength(Math.floor(newCompletion / 10));
    setBrandReach(Math.floor(newCompletion / 5));
    
    // Boost network activity when form completion increases
    if (newCompletion > previousCompletion) {
      setNetworkMode('celebration');
      setTimeout(() => setNetworkMode('default'), 2000);
    }
  }, [formData]);

  // Generate random nodes for visualization
  function generateRandomNodes(count) {
    const nodes = [];
    const colors = [
      '#FF7D00', // orange
      '#15616D', // teal
      '#001524', // navy
      '#78290F', // deep brown
      '#FF9E00', // light orange
    ];
    
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: i,
        x: Math.random() * 400, 
        y: Math.random() * 500,
        size: Math.random() * 10 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        pulseIntensity: 0,
        speed: {
          x: (Math.random() - 0.5) * 0.8,
          y: (Math.random() - 0.5) * 0.8
        },
        icon: ['📅', '🎪', '📊', '👥', '🚀', '💡', '📢', '🎯', '📈', '🎟️'][Math.floor(Math.random() * 10)]
      });
    }
    return nodes;
  }

  // Trigger a dopamine-boosting micro-achievement
  const triggerAchievement = () => {
    const randomAchievement = microAchievements[Math.floor(Math.random() * microAchievements.length)];
    setAchievementMessage(randomAchievement);
    setShowAchievement(true);
    setPulseEffect(true);
    
    // Generate new insight drop
    addInsightDrop();
    
    setTimeout(() => {
      setShowAchievement(false);
      setPulseEffect(false);
    }, 3000);
  };
  
  // Add falling insight drop animation
  const addInsightDrop = () => {
    const newDrop = {
      id: Date.now(),
      x: Math.random() * 400,
      y: -30,
      text: '💡',
      opacity: 1
    };
    setInsightDrops(prev => [...prev, newDrop]);
    
    // Remove older drops to prevent memory issues
    if (insightDrops.length > 10) {
      setInsightDrops(prev => prev.slice(1));
    }
  };

  // Update network visualization with advanced physics
  useEffect(() => {
    const interval = setInterval(() => {
      // Update nodes with physics-based movement
      const updatedNodes = networkNodes.map(node => {
        // Different behaviors based on network mode
        let speedMultiplier = 1;
        let pulseIntensity = node.pulseIntensity;
        
        if (networkMode === 'celebration') {
          speedMultiplier = 3;
          pulseIntensity = 1;
        } else if (networkMode === 'processing') {
          speedMultiplier = 0.5;
          pulseIntensity = 0.7;
        } else {
          // In default mode, gradually reduce pulse intensity
          pulseIntensity = Math.max(0, pulseIntensity - 0.02);
        }
        
        // Calculate new position with boundaries
        let newX = node.x + node.speed.x * speedMultiplier;
        let newY = node.y + node.speed.y * speedMultiplier;
        
        // Boundary checks and bounce effect
        if (newX < 0 || newX > 400) {
          node.speed.x = -node.speed.x;
          newX = node.x + node.speed.x;
        }
        
        if (newY < 0 || newY > 500) {
          node.speed.y = -node.speed.y;
          newY = node.y + node.speed.y;
        }
        
        return {
          ...node,
          x: newX,
          y: newY,
          pulseIntensity
        };
      });
      
      // Generate dynamic connections based on form completion and proximity
      const connectRadius = 120 + (formCompletion / 2);
      const connections = [];
      
      for (let i = 0; i < updatedNodes.length; i++) {
        for (let j = i + 1; j < updatedNodes.length; j++) {
          const distance = Math.sqrt(
            Math.pow(updatedNodes[i].x - updatedNodes[j].x, 2) + 
            Math.pow(updatedNodes[i].y - updatedNodes[j].y, 2)
          );
          
          if (distance < connectRadius) {
            connections.push({
              source: i,
              target: j,
              distance,
              opacity: 1 - (distance / connectRadius),
              strength: formCompletion / 100
            });
          }
        }
      }
      
      // Update insight drops animations
      setInsightDrops(prev => prev.map(drop => {
        // Make drop fall down the screen and fade out near bottom
        const newY = drop.y + 3;
        const newOpacity = newY > 450 ? Math.max(0, 1 - (newY - 450) / 50) : drop.opacity;
        
        return {
          ...drop,
          y: newY,
          opacity: newOpacity
        };
      }).filter(drop => drop.opacity > 0));
      
      setNetworkNodes(updatedNodes);
      setNetworkConnections(connections);
    }, 50);
    
    return () => clearInterval(interval);
  }, [networkNodes, formCompletion, networkMode]);

  // Handle input changes with enhanced focus effects
  const handleChange = (e) => {
    const { name, value } = e.target;
    setActiveField(name);
    
    // Previous value for comparison
    let previousValue = '';
    if (name === 'timeframeStart' || name === 'timeframeEnd') {
      previousValue = formData.timeframe[name === 'timeframeStart' ? 'start' : 'end'];
    } else {
      previousValue = formData[name];
    }
    
    // Update form data
    if (name === 'timeframeStart' || name === 'timeframeEnd') {
      setFormData((prev) => ({
        ...prev,
        timeframe: {
          ...prev.timeframe,
          [name === 'timeframeStart' ? 'start' : 'end']: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Add class for filled fields
    if (value && !e.target.classList.contains('field-filled')) {
      e.target.classList.add('field-filled');
      e.target.classList.add('highlight-animation');
      
      // Remove highlight animation after a delay
      setTimeout(() => {
        e.target && e.target.classList.remove('highlight-animation');
      }, 1000);
    } else if (!value && e.target.classList.contains('field-filled')) {
      e.target.classList.remove('field-filled');
    }
    
    // If field was empty but now has content, activate the node interaction for visual feedback
    if (!previousValue && value) {
      const randomIndex = Math.floor(Math.random() * networkNodes.length);
      setActiveNode(randomIndex);
    
      setNetworkNodes(nodes =>
        nodes.map((node, idx) =>
          idx === randomIndex ? { ...node, pulseIntensity: 1 } : node
        )
      );
    
      setTimeout(() => setActiveNode(null), 2000);
    }
  };

  // Handle the game's completion
  const handleGameComplete = (finalScore) => {
    setGameScore(finalScore);
    setShowMiniGame(false);
    
    // Show success popup and then navigate
    setShowSuccessPopup(true);
    
    setTimeout(() => {
      navigate('/loading');
    }, 3000);
  };

  // Submit form with enhanced animations
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsCreating(true);
    setNetworkMode('processing');
    
    // Add ripple effect to form
    if (formRef.current) {
      formRef.current.classList.add('submit-ripple');
    }
    
    // Initiate network "processing" state
    if (networkRef.current) {
      networkRef.current.classList.add('network-processing');
    }
  
    // Show mini-game
    setShowMiniGame(true);
  
    try {
      const payload = {
        campaignType: 'driveEventAwareness',
        describeBusiness: formData.businessDescription,
        industry: formData.industry,
        timeframeStart: formData.timeframe.start,
        timeframeEnd: formData.timeframe.end,
        platforms: formData.platforms,
        eventName: formData.eventDescription,
        eventUniqueness: formData.uniqueFeatures,
      };
  
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API_BASE_URL}/api/ai/generateCampaign`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const newCampaign = response.data.campaign;
      if (newCampaign && newCampaign._id) {
        // Store the new campaign ID in localStorage
        localStorage.setItem('latestCampaignId', newCampaign._id);
        
        // Signal to game that campaign is created
        setCampaignCreated(true);
      } else {
        setErrorMessage('Campaign created, but no ID returned.');
        setNetworkMode('default');
        setShowMiniGame(false);
      }
    } catch (err) {
      console.error('Error creating event awareness campaign:', err);
      setErrorMessage('Failed to create AI campaign. Please try again.');
      setNetworkMode('default');
      setShowMiniGame(false);
      
      if (formRef.current) {
        formRef.current.classList.add('submit-error');
        setTimeout(() => {
          formRef.current.classList.remove('submit-error');
        }, 800);
      }
    } finally {
      setIsCreating(false);
      if (formRef.current) {
        formRef.current.classList.remove('submit-ripple');
      }
    }
  };

  // Clean up timers when component unmounts
  useEffect(() => {
    return () => {
      if (campaignCreationTimer.current) {
        clearTimeout(campaignCreationTimer.current);
      }
    };
  }, []);

  return (
    <div className={`amplify-redesigned-container ${colorTheme}`}>
      <div className="cosmic-background">
        <div className="star-field"></div>
        <div className="nebula-effect"></div>
        <div className="gradient-overlay"></div>
      </div>
      
      <div className="content-wrapper">
        <div className="brand-badge">
          <div className="badge-icon">🎪</div>
          <span>Event Boost</span>
          <div className="badge-pulse"></div>
        </div>
        
        <div className="theme-selector">
          <div 
            className={`theme-option orange-navy ${colorTheme === 'orange-navy' ? 'active' : ''}`}
            onClick={() => setColorTheme('orange-navy')}
          ></div>
          <div 
            className={`theme-option blue-teal ${colorTheme === 'blue-teal' ? 'active' : ''}`}
            onClick={() => setColorTheme('blue-teal')}
          ></div>
          <div 
            className={`theme-option purple-indigo ${colorTheme === 'purple-indigo' ? 'active' : ''}`}
            onClick={() => setColorTheme('purple-indigo')}
          ></div>
        </div>
        
        <div className="form-section" ref={formRef}>
          <div className="form-header">
            <h2 className="title-glow">Drive Event Awareness</h2>
            <p className="subtitle">
              Increase visibility and excitement for your event. Provide details below to
              create a personalized multi-channel strategy.
            </p>
            
            <div className="progress-container">
              <div className="progress-label">
                <span>Form Completion</span>
                <span className={`percentage ${pulseEffect ? 'pulse-text' : ''}`}>
                  {formCompletion}%
                </span>
              </div>
              <div className="progress-track">
                <div 
                  className={`progress-fill ${pulseEffect ? 'pulse-fill' : ''}`}
                  ref={progressBarRef}
                  style={{ width: `${formCompletion}%` }}
                >
                  <div className="progress-glow"></div>
                </div>
              </div>
            </div>
          </div>

          {showAchievement && (
            <div className="achievement-notification">
              <div className="achievement-icon">🎯</div>
              <p className="achievement-text">{achievementMessage}</p>
            </div>
          )}

          {errorMessage && (
            <div className="error-notification">
              <div className="error-icon">!</div>
              <p>{errorMessage}</p>
            </div>
          )}
          
          {isCreating && (
            <div className="creating-notification">
              <div className="loader">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
              <p>Creating your event campaign magic, enjoy the mini-game while you wait...</p>
            </div>
          )}

          <form className="amplify-form" onSubmit={handleSubmit}>
            <div className={`form-group floating-label ${activeField === 'businessDescription' ? 'active-field' : ''}`}>
              <textarea
                name="businessDescription"
                rows="3"
                placeholder=" "
                value={formData.businessDescription}
                onChange={handleChange}
                className={formData.businessDescription ? 'field-filled' : ''}
                onFocus={() => setActiveField('businessDescription')}
                onBlur={() => setActiveField(null)}
              />
              <label>Describe your business</label>
              <div className="focus-border"></div>
              <div className="field-icon">💼</div>
            </div>

            <div className={`form-group floating-label ${activeField === 'industry' ? 'active-field' : ''}`}>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className={formData.industry ? 'field-filled' : ''}
                onFocus={() => setActiveField('industry')}
                onBlur={() => setActiveField(null)}
              >
                <option value=""></option>
                <option value="Fashion">Fashion</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Food">Food</option>
                <option value="Retail">Retail</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Travel">Travel</option>
              </select>
              <label>Industry that describes your business</label>
              <div className="select-arrow"></div>
              <div className="focus-border"></div>
              <div className="field-icon">🏭</div>
            </div>

            <div className={`form-group timeframe-group ${activeField === 'timeframeStart' || activeField === 'timeframeEnd' ? 'active-field' : ''}`}>
              <label className="timeframe-label">Campaign timeframe?</label>
              <div className="timeframe-inputs">
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="timeframeStart"
                    value={formData.timeframe.start}
                    onChange={handleChange}
                    className={formData.timeframe.start ? 'field-filled' : ''}
                    onFocus={() => setActiveField('timeframeStart')}
                    onBlur={() => setActiveField(null)}
                  />
                  <div className="focus-border"></div>
                </div>
                <span className="timeframe-separator">to</span>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    name="timeframeEnd"
                    value={formData.timeframe.end}
                    onChange={handleChange}
                    className={formData.timeframe.end ? 'field-filled' : ''}
                    onFocus={() => setActiveField('timeframeEnd')}
                    onBlur={() => setActiveField(null)}
                  />
                  <div className="focus-border"></div>
                </div>
              </div>
              <div className="field-icon">📅</div>
            </div>

            <div className={`form-group floating-label ${activeField === 'platforms' ? 'active-field' : ''}`}>
              <textarea
                name="platforms"
                rows="2"
                placeholder=" "
                value={formData.platforms}
                onChange={handleChange}
                className={formData.platforms ? 'field-filled' : ''}
                onFocus={() => setActiveField('platforms')}
                onBlur={() => setActiveField(null)}
              />
              <label>Platforms to promote on?</label>
              <div className="focus-border"></div>
              <div className="field-icon">📱</div>
            </div>

            <div className={`form-group floating-label ${activeField === 'eventDescription' ? 'active-field' : ''}`}>
              <textarea
                name="eventDescription"
                rows="2"
                placeholder=" "
                value={formData.eventDescription}
                onChange={handleChange}
                className={formData.eventDescription ? 'field-filled' : ''}
                onFocus={() => setActiveField('eventDescription')}
                onBlur={() => setActiveField(null)}
              />
              <label>What is the event you want to promote?</label>
              <div className="focus-border"></div>
              <div className="field-icon">🎪</div>
            </div>

            <div className={`form-group floating-label ${activeField === 'uniqueFeatures' ? 'active-field' : ''}`}>
              <textarea
                name="uniqueFeatures"
                rows="2"
                placeholder=" "
                value={formData.uniqueFeatures}
                onChange={handleChange}
                className={formData.uniqueFeatures ? 'field-filled' : ''}
                onFocus={() => setActiveField('uniqueFeatures')}
                onBlur={() => setActiveField(null)}
              />
              <label>What makes this event unique or exciting?</label>
              <div className="focus-border"></div>
              <div className="field-icon">✨</div>
            </div>

            <button 
              type="submit" 
              className={`submit-btn ${formCompletion >= 100 ? 'ready-pulse' : 'pulse'}`} 
              disabled={isCreating}
            >
              <span>{isCreating ? 'Creating Magic...' : 'Create Campaign'}</span>
              <div className="btn-glow"></div>
              <div className="btn-particles"></div>
            </button>
          </form>
        </div>

        <div className="visualization-section">
          <div className="brand-network-card" ref={networkRef}>
            <div className="network-container">
              <svg width="100%" height="100%" className="network-visualization">
                {/* Draw connections between nodes */}
                {networkConnections.map((connection, index) => (
                  <line 
                    key={`connection-${index}`}
                    x1={networkNodes[connection.source].x}
                    y1={networkNodes[connection.source].y}
                    x2={networkNodes[connection.target].x}
                    y2={networkNodes[connection.target].y}
                    stroke="var(--color-accent)"
                    strokeOpacity={connection.opacity * 0.7}
                    strokeWidth={1 + connection.strength * 2}
                    className="network-connection"
                  />
                ))}
                
                {/* Draw nodes */}
                {networkNodes.map((node, index) => (
                  <g key={`node-${index}`} className="node-group">
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size * (1 + node.pulseIntensity * 0.3)}
                      fill={node.color}
                      className={`floating-node ${activeNode === index ? 'active-node' : ''}`}
                      opacity={0.8}
                    />
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={node.size * (1 + node.pulseIntensity * 0.6)}
                      fill="transparent"
                      stroke={node.color}
                      strokeWidth="1.5"
                      opacity={node.pulseIntensity * 0.6}
                      className="node-pulse"
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize={node.size * 1.2}
                      className="node-icon"
                    >
                      {node.icon}
                    </text>
                  </g>
                ))}
                
                {/* Render insight drops */}
                {insightDrops.map(drop => (
                  <text
                    key={drop.id}
                    x={drop.x}
                    y={drop.y}
                    fontSize="24"
                    textAnchor="middle"
                    opacity={drop.opacity}
                    className="insight-drop"
                  >
                    {drop.text}
                  </text>
                ))}
              </svg>
            </div>
            
            <div className="overlay-content">
              <div className="overlay-header">
                <h3>Event Network Visualizer</h3>
                <p>Watch your event connections evolve as you build your campaign</p>
              </div>
              
              {isCreating && (
                <div className="creating-animation">
                  <div className="processing-text">Building Your Event Campaign</div>
                  <div className="wave-bars">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                  </div>
                  <div className="processing-subtext">Analyzing audience touchpoints...</div>
                </div>
              )}
              
              <div className="brand-metrics">
                <div className="metric-item">
                  <div className="metric-value">{formCompletion}%</div>
                  <div className="metric-label">Campaign Readiness</div>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${formCompletion}%` }}></div>
                  </div>
                </div>
                
                <div className="metrics-row">
                  <div className="metric-item">
                    <div className="metric-value">{networkConnections.length}</div>
                    <div className="metric-label">Event Connections</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill" 
                        style={{ width: `${Math.min((networkConnections.length / 40) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <div className="metric-value">{brandStrength}/10</div>
                    <div className="metric-label">Engagement Potential</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill" 
                        style={{ width: `${brandStrength * 10}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="interactive-section">
            <div className="quote-card">
              <div className="quote-header">
                <h4>Event Marketing Wisdom</h4>
                <div className="indicators">
                  {marketingQuotes.map((_, index) => (
                    <div 
                      key={index}
                      className={`indicator ${index === currentQuote ? 'active' : ''}`}
                    ></div>
                  ))}
                </div>
              </div>
              <div className={`quote-content ${showQuoteAnimation ? 'show' : ''}`}>
                <div className="quote-mark">"</div>
                <p>{marketingQuotes[currentQuote].text}</p>
                <div className="author">— {marketingQuotes[currentQuote].author}</div>
              </div>
            </div>
            
            <div className="engagement-card">
              <div className="engagement-header">
                <h4>Attendance Potential</h4>
                <div className="potential-badge">
                  {formCompletion > 80 ? 'High' : formCompletion > 50 ? 'Medium' : 'Low'}
                </div>
              </div>
              <div className="engagement-meter">
                <div 
                  className="engagement-level" 
                  style={{ 
                    width: `${Math.min(formCompletion * 1.2, 100)}%`,
                    backgroundColor: formCompletion > 80 ? 'var(--color-success)' : 
                                     formCompletion > 50 ? 'var(--color-accent)' : 
                                     'var(--color-primary)'
                  }}
                ></div>
              </div>
              <div className="engagement-labels">
                <span>Low</span>
                <span>Medium</span>
                <span>High</span>
              </div>
              
              <div className="platform-effectiveness">
                <h5>Platform Effectiveness</h5>
                <div className="platform-bars">
                  <div className="platform-item">
                    <div className="platform-name">Social Media</div>
                    <div className="platform-bar-container">
                      <div 
                        className="platform-bar" 
                        style={{width: `${Math.min(20 + formCompletion * 0.7, 90)}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="platform-item">
                    <div className="platform-name">Email</div>
                    <div className="platform-bar-container">
                      <div 
                        className="platform-bar" 
                        style={{width: `${Math.min(30 + formCompletion * 0.6, 85)}%`}}
                      ></div>
                    </div>
                  </div>
                  <div className="platform-item">
                    <div className="platform-name">Event Sites</div>
                    <div className="platform-bar-container">
                      <div 
                        className="platform-bar" 
                        style={{width: `${Math.min(15 + formCompletion * 0.8, 95)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="impact-simulator">
              <div className="impact-header">
                <h4>Event Reach Simulator</h4>
                <div className="reach-value">{brandReach}%</div>
              </div>
              <div className="impact-visualization">
                <div className="brand-center">
                  <div className="brand-pulse"></div>
                  <div className="brand-icon">🎪</div>
                </div>
                <div 
                  className="reach-radius" 
                  style={{
                    transform: `scale(${0.2 + (brandReach / 100) * 0.8})`,
                    opacity: 0.1 + (brandReach / 100) * 0.3
                  }}
                ></div>
                <div 
                  className="reach-radius secondary" 
                  style={{
                    transform: `scale(${0.1 + (brandReach / 100) * 0.6})`,
                    opacity: 0.1 + (brandReach / 100) * 0.5
                  }}
                ></div>
                
                {/* Audience icons positioned around brand center */}
                <div className="audience-icons">
                  {[...Array(8)].map((_, i) => {
                    const angle = (i * Math.PI / 4);
                    const distance = 80 + (i % 2) * 40;
                    const x = Math.cos(angle) * distance;
                    const y = Math.sin(angle) * distance;
                    const opacity = formCompletion > (i * 12) ? 1 : 0.3;
                    
                    return (
                      <div 
                        key={i} 
                        className="audience-icon"
                        style={{
                          transform: `translate(${x}px, ${y}px)`,
                          opacity
                        }}
                      >
                        {['👩‍💼', '👨‍💼', '👩‍🔧', '👨‍🎓', '👩‍🏫', '👨‍⚕️', '👩‍🍳', '👨‍🚀'][i]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mini-Game Modal - Now a separate imported component */}
      {showMiniGame && (
        <div className="modal-overlay">
          <div className="modal-container">
            <BrandBuilderGame 
              onClose={handleGameComplete} 
              campaignCreated={campaignCreated}
            />
          </div>
        </div>
      )}
      
      {/* Success animation popup */}
      {showSuccessPopup && (
        <div className="success-popup">
          <div className="cosmic-celebration">
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
            <div className="celebration-particle"></div>
          </div>
          <div className="success-content">
            <div className="success-icon">
              <svg viewBox="0 0 50 50" width="50" height="50">
                <circle cx="25" cy="25" r="25" fill="var(--color-success)" />
                <path d="M38 15L22 33L12 25" stroke="white" strokeWidth="4" fill="none" />
              </svg>
              <div className="icon-rays"></div>
            </div>
            <h3>Event Campaign Successfully Created!</h3>
            <p>Preparing your event promotion strategy...</p>
            <div className="success-progress">
              <div className="success-bar"></div>
            </div>
            
            {gameScore > 0 && (
              <div className="game-result">
                <div className="game-score-final">
                  Brand Builder Score: <span>{gameScore}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <AiChatbot />
    </div>
  );
}

export default DriveEventAwareness;