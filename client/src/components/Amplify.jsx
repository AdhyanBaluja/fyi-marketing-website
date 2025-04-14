import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './combined.css';
import AiChatbot from './AiChatbot.jsx';

// Expanded marketing quotes for more variety
const marketingQuotes = [
  { text: "Your brand isn't what you say it is. It's what they say it is.", author: "Marty Neumeier" },
  { text: "A brand is no longer what we tell the consumer it is—it is what consumers tell each other it is.", author: "Scott Cook" },
  { text: "Your brand is a story unfolding across all customer touch points.", author: "Jonah Sachs" },
  { text: "Products are made in the factory, but brands are created in the mind.", author: "Walter Landor" },
  { text: "A brand for a company is like a reputation for a person. You earn reputation by trying to do hard things well.", author: "Jeff Bezos" },
  { text: "If people believe they share values with a company, they will stay loyal to the brand.", author: "Howard Schultz" },
  { text: "Your personal brand is a promise to your clients... a promise of quality, consistency, competency, and reliability.", author: "Jason Hartman" },
  { text: "People don't buy what you do, they buy why you do it.", author: "Simon Sinek" },
];

// Dopamine-triggering micro-achievements
const microAchievements = [
  "Form completion boosts brand reach by 25%!",
  "Great detail! Your campaign potential just increased!",
  "You're creating a campaign better than 78% of marketers!",
  "Excellent progress! Your campaign is shaping up nicely!",
  "Amazing strategy forming! Your audience will love this!",
  "You're unlocking premium marketing potential!"
];

// Brand elements for mini-game
const brandElements = [
  { type: "social", icon: "📱", name: "Social Media", points: 15, color: "#1DA1F2" },
  { type: "email", icon: "📧", name: "Email Marketing", points: 10, color: "#4CAF50" },
  { type: "content", icon: "📝", name: "Content Marketing", points: 20, color: "#FF5722" },
  { type: "ads", icon: "🎯", name: "Targeted Ads", points: 25, color: "#9C27B0" },
  { type: "video", icon: "🎬", name: "Video Content", points: 30, color: "#F44336" },
  { type: "seo", icon: "🔍", name: "SEO", points: 20, color: "#2196F3" },
  { type: "influencer", icon: "👥", name: "Influencer Marketing", points: 35, color: "#FF9800" },
  { type: "analytics", icon: "📊", name: "Analytics", points: 15, color: "#607D8B" },
  { type: "community", icon: "🌐", name: "Community Building", points: 25, color: "#8BC34A" },
  { type: "loyalty", icon: "🏆", name: "Loyalty Programs", points: 20, color: "#FFC107" }
];

// Obstacles for mini-game
const marketingObstacles = [
  { type: "spam", icon: "🚫", name: "Spam Filter", color: "#f44336" },
  { type: "competitor", icon: "🏢", name: "Competitor", color: "#d32f2f" },
  { type: "adblock", icon: "⛔", name: "Ad Blocker", color: "#c62828" }
];

// Use environment variable for API base URL; fallback to localhost if not defined
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function Amplify() {
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
    marketTrends: '',
    targetAudience: '',
    brandMessage: '',
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
  const [gameElements, setGameElements] = useState([]);
  const [gameObstacles, setGameObstacles] = useState([]);
  const [gameLevel, setGameLevel] = useState(1);
  const [gameTime, setGameTime] = useState(60); // 60 seconds timer
  const [gamePaused, setGamePaused] = useState(false);
  const [userAvatar, setUserAvatar] = useState({ x: 250, y: 350, radius: 20 });
  const [gameStreak, setGameStreak] = useState(0);
  const [gameMultiplier, setGameMultiplier] = useState(1);
  const [gameHighScore, setGameHighScore] = useState(0);
  const [gameMessage, setGameMessage] = useState({ text: "", color: "#FFFFFF", opacity: 0 });
  const [showGameTutorial, setShowGameTutorial] = useState(true);
  const [powerUps, setPowerUps] = useState([]);
  const [activePowerUps, setActivePowerUps] = useState({
    magnet: false,
    shield: false,
    multiplier: false
  });
  const gameCanvasRef = useRef(null);
  const gameAnimationRef = useRef(null);
  const userInteractionRef = useRef(null);
  const gameTimeIntervalRef = useRef(null);
  const campaignCreationTimer = useRef(null);
  const lastMousePosition = useRef({ x: 250, y: 350 });

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
        icon: ['📱', '🌐', '📊', '👥', '🚀', '💡', '📢', '🎯', '📈', '🔍'][Math.floor(Math.random() * 10)]
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
      setActiveNode(Math.floor(Math.random() * networkNodes.length));
      
      // Create pulse effect on the active node
      setNetworkNodes(nodes => 
        nodes.map((node, idx) => idx === activeNode ? { ...node, pulseIntensity: 1 } : node)
      );
      
      setTimeout(() => setActiveNode(null), 2000);
    }
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
    initializeGame();

    // Set up a simulated campaign creation time (15-25 seconds)
    const campaignCreationTime = Math.floor(Math.random() * 10000) + 15000;
    
    campaignCreationTimer.current = setTimeout(async () => {
      try {
        const payload = {
          campaignType: 'amplify',
          businessDescription: formData.businessDescription,
          industry: formData.industry,
          timeframeStart: formData.timeframe.start,
          timeframeEnd: formData.timeframe.end,
          platforms: formData.platforms,
          marketTrends: formData.marketTrends,
          targetAudience: formData.targetAudience,
          brandMessage: formData.brandMessage,
        };

        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${API_BASE_URL}/api/ai/generateCampaign`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const newCampaign = response.data.campaign;
        if (newCampaign && newCampaign._id) {
          // Clean up game timers
          cleanupGameTimers();
          
          // Show success animation before navigating
          setShowMiniGame(false);
          setShowSuccessPopup(true);
          
          // Store the new campaign ID in localStorage
          localStorage.setItem('latestCampaignId', newCampaign._id);
          // Store high score if applicable
          if (gameScore > gameHighScore) {
            localStorage.setItem('brandBuilderHighScore', gameScore);
          }
          
          // Add delay for animation
          setTimeout(() => {
            // Then navigate to /loading
            navigate('/loading');
          }, 3000);
        } else {
          setErrorMessage('Campaign created, but no ID returned.');
          setNetworkMode('default');
          cleanupGameTimers();
          setShowMiniGame(false);
        }
      } catch (err) {
        console.error('Error creating amplify campaign:', err);
        setErrorMessage('Failed to create AI campaign. Please try again.');
        setNetworkMode('default');
        cleanupGameTimers();
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
    }, campaignCreationTime);

    // Simulate API response
    // In a real implementation, this would be replaced with actual API call handling
  };

  // Clean up all game-related timers and intervals
  const cleanupGameTimers = () => {
    if (gameAnimationRef.current) {
      cancelAnimationFrame(gameAnimationRef.current);
      gameAnimationRef.current = null;
    }
    
    if (gameTimeIntervalRef.current) {
      clearInterval(gameTimeIntervalRef.current);
      gameTimeIntervalRef.current = null;
    }
    
    if (campaignCreationTimer.current) {
      clearTimeout(campaignCreationTimer.current);
      campaignCreationTimer.current = null;
    }
  };

  // Initialize the brand builder mini-game
  const initializeGame = () => {
    // Reset game state
    setGameScore(0);
    setGameLevel(1);
    setGameTime(60);
    setGameStreak(0);
    setGameMultiplier(1);
    setGameMessage({ text: "", color: "#FFFFFF", opacity: 0 });
    setActivePowerUps({
      magnet: false,
      shield: false,
      multiplier: false
    });
    
    // Try to retrieve previous high score
    const savedHighScore = localStorage.getItem('brandBuilderHighScore');
    if (savedHighScore) {
      setGameHighScore(parseInt(savedHighScore));
    }
    
    // Generate initial game elements (brand elements to collect)
    setGameElements(generateGameElements(6));
    
    // Generate obstacles
    setGameObstacles(generateGameObstacles(3));
    
    // Generate power-ups
    setPowerUps(generatePowerUps(1));
    
    // Start game timer - the game runs for 60 seconds or until campaign creation is complete
    gameTimeIntervalRef.current = setInterval(() => {
      setGameTime(prevTime => {
        if (prevTime <= 1) {
          // Game over by time expiration
          clearInterval(gameTimeIntervalRef.current);
          levelUpGame(); // Start a new round
          return 60; // Reset timer
        }
        return prevTime - 1;
      });
    }, 1000);
  };
  
  // Generate brand elements (collectibles) for the mini-game
  const generateGameElements = (count) => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return [];
    
    const width = canvas.width;
    const height = canvas.height;
    const elements = [];
    
    // Create a copy of brand elements and shuffle it
    const shuffledElements = [...brandElements]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
    
    shuffledElements.forEach((element, index) => {
      // Ensure elements don't spawn too close to the player's starting position
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30; // Keep away from bottom where player starts
        
        // Check if this position is too close to the player start position
        const distToPlayer = Math.sqrt(
          Math.pow(x - 250, 2) + Math.pow(y - 350, 2)
        );
        
        tooClose = distToPlayer < 100;
      } while (tooClose);
      
      elements.push({
        id: Date.now() + index,
        x,
        y,
        radius: 25,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        ...element,
        collected: false,
        pulsePhase: Math.random() * Math.PI * 2, // Random starting phase for pulsing
      });
    });
    
    return elements;
  };
  
  // Generate obstacles for the mini-game
  const generateGameObstacles = (count) => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return [];
    
    const width = canvas.width;
    const height = canvas.height;
    const obstacles = [];
    
    for (let i = 0; i < count; i++) {
      // Shuffle obstacles array
      const shuffledObstacles = [...marketingObstacles].sort(() => Math.random() - 0.5);
      const obstacleType = shuffledObstacles[0];
      
      // Ensure obstacles don't spawn too close to the player's starting position
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30;
        
        // Check if this position is too close to the player start position
        const distToPlayer = Math.sqrt(
          Math.pow(x - 250, 2) + Math.pow(y - 350, 2)
        );
        
        tooClose = distToPlayer < 120;
      } while (tooClose);
      
      obstacles.push({
        id: Date.now() + i + 1000,
        x,
        y,
        radius: 30,
        speedX: (Math.random() - 0.5) * 2,
        speedY: (Math.random() - 0.5) * 2,
        ...obstacleType
      });
    }
    
    return obstacles;
  };
  
  // Generate power-ups for the mini-game
  const generatePowerUps = (count) => {
    const canvas = gameCanvasRef.current;
    if (!canvas) return [];
    
    const width = canvas.width;
    const height = canvas.height;
    const powerUpTypes = [
      { type: "magnet", icon: "🧲", name: "Magnet", color: "#FF9800", duration: 8 },
      { type: "shield", icon: "🛡️", name: "Shield", color: "#2196F3", duration: 10 },
      { type: "multiplier", icon: "✨", name: "Multiplier", color: "#E91E63", duration: 6 }
    ];
    
    const powerUps = [];
    
    for (let i = 0; i < count; i++) {
      const powerUpType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
      
      powerUps.push({
        id: Date.now() + i + 2000,
        x: Math.random() * (width - 60) + 30,
        y: Math.random() * (height - 150) + 30,
        radius: 20,
        collected: false,
        ...powerUpType
      });
    }
    
    return powerUps;
  };
  
  // Level up the game
  const levelUpGame = () => {
    // Increase level
    setGameLevel(prev => prev + 1);
    
    // Set message
    showGameStatusMessage(`Level ${gameLevel + 1}!`, "#FFC107");
    
    // Add more elements and obstacles based on level
    const elementCount = Math.min(6 + Math.floor(gameLevel / 2), 12);
    const obstacleCount = Math.min(3 + Math.floor(gameLevel / 3), 6);
    const powerUpCount = Math.min(1 + Math.floor(gameLevel / 4), 3);
    
    setGameElements(generateGameElements(elementCount));
    setGameObstacles(generateGameObstacles(obstacleCount));
    setPowerUps(generatePowerUps(powerUpCount));
    
    // Reset timer for next round
    setGameTime(60);
  };
  
  // Show a status message in the game
  const showGameStatusMessage = (text, color = "#FFFFFF") => {
    setGameMessage({ text, color, opacity: 1 });
    
    setTimeout(() => {
      setGameMessage(prev => ({ ...prev, opacity: 0 }));
    }, 2000);
  };
  
  // Mouse/touch movement handler for mini-game
  const handleMouseMove = (e) => {
    if (!gameCanvasRef.current || gamePaused) return;
    
    const canvas = gameCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate mouse position relative to canvas
    const x = Math.max(
      userAvatar.radius,
      Math.min(
        canvas.width - userAvatar.radius,
        e.clientX - rect.left
      )
    );
    
    const y = Math.max(
      userAvatar.radius,
      Math.min(
        canvas.height - userAvatar.radius,
        e.clientY - rect.top
      )
    );
    
    // Update last mouse position
    lastMousePosition.current = { x, y };
    
    // Update user avatar position with smooth movement
    setUserAvatar(prev => ({
      ...prev,
      x: x,
      y: y
    }));
  };
  
  // Handle touch movement for mobile devices
  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!gameCanvasRef.current || gamePaused) return;
    
    const touch = e.touches[0];
    const canvas = gameCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    // Calculate touch position relative to canvas
    const x = Math.max(
      userAvatar.radius,
      Math.min(
        canvas.width - userAvatar.radius,
        touch.clientX - rect.left
      )
    );
    
    const y = Math.max(
      userAvatar.radius,
      Math.min(
        canvas.height - userAvatar.radius,
        touch.clientY - rect.top
      )
    );
    
    // Update last position
    lastMousePosition.current = { x, y };
    
    // Update user avatar position
    setUserAvatar(prev => ({
      ...prev,
      x: x,
      y: y
    }));
  };
  
  // Close tutorial and start playing
  const handleStartPlaying = () => {
    setShowGameTutorial(false);
  };
  
  // Main game loop
  useEffect(() => {
    if (!showMiniGame || !gameCanvasRef.current || showGameTutorial) return;
    
    const canvas = gameCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set up mouse movement tracking
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    // Game animation loop
    const animate = () => {
      if (!canvas) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background grid
      drawGrid(ctx, canvas.width, canvas.height);
      
      // Draw game info
      drawGameInfo(ctx, canvas.width, canvas.height);
      
      // Update and draw power-ups
      const updatedPowerUps = powerUps.map(powerUp => {
        if (powerUp.collected) return powerUp;
        
        // Check collision with player
        const distToPlayer = Math.sqrt(
          Math.pow(powerUp.x - userAvatar.x, 2) + 
          Math.pow(powerUp.y - userAvatar.y, 2)
        );
        
        if (distToPlayer < userAvatar.radius + powerUp.radius) {
          // Collect power-up
          showGameStatusMessage(`${powerUp.name} Activated!`, powerUp.color);
          
          // Activate power-up effect
          setActivePowerUps(prev => ({
            ...prev,
            [powerUp.type]: true
          }));
          
          // Schedule power-up deactivation
          setTimeout(() => {
            setActivePowerUps(prev => ({
              ...prev,
              [powerUp.type]: false
            }));
            showGameStatusMessage(`${powerUp.name} Expired`, "#607D8B");
          }, powerUp.duration * 1000);
          
          return { ...powerUp, collected: true };
        }
        
        // Draw power-up
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
        ctx.fillStyle = powerUp.color;
        ctx.fill();
        
        // Draw glow effect
        ctx.save();
        ctx.shadowBlur = 15;
        ctx.shadowColor = powerUp.color;
        ctx.stroke();
        ctx.restore();
        
        // Draw icon
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(powerUp.icon, powerUp.x, powerUp.y);
        
        return powerUp;
      });
      
      setPowerUps(updatedPowerUps);
      
      // Update and draw brand elements
      const updatedElements = gameElements.map(element => {
        if (element.collected) return element;
        
        // Move element
        let newX = element.x + element.speedX;
        let newY = element.y + element.speedY;
        
        // Bounce off walls
        if (newX <= element.radius || newX >= canvas.width - element.radius) {
          element.speedX = -element.speedX;
          newX = element.x + element.speedX;
        }
        
        if (newY <= element.radius || newY >= canvas.height - element.radius) {
          element.speedY = -element.speedY;
          newY = element.y + element.speedY;
        }
        
        // Apply magnet effect if active
        if (activePowerUps.magnet) {
          const dx = userAvatar.x - newX;
          const dy = userAvatar.y - newY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 150) {
            const factor = 0.05;
            newX += dx * factor;
            newY += dy * factor;
          }
        }
        
        // Check collision with player
        const distToPlayer = Math.sqrt(
          Math.pow(newX - userAvatar.x, 2) + 
          Math.pow(newY - userAvatar.y, 2)
        );
        
        if (distToPlayer < userAvatar.radius + element.radius) {
          // Calculate points with multiplier
          const basePoints = element.points;
          const multiplier = activePowerUps.multiplier ? 2 : gameMultiplier;
          const points = basePoints * multiplier;
          
          // Update score
          setGameScore(prev => prev + points);
          
          // Update streak
          setGameStreak(prev => prev + 1);
          
          // Update multiplier every 3 collected items
          if ((gameStreak + 1) % 3 === 0) {
            const newMultiplier = Math.min(gameMultiplier + 0.5, 3);
            setGameMultiplier(newMultiplier);
            showGameStatusMessage(`${newMultiplier}x Multiplier!`, "#FFC107");
          }
          
          // Show points earned
          showPointsIndicator(newX, newY, points);
          
          return { ...element, collected: true };
        }
        
        // Pulse effect for elements
        const pulseOffset = Math.sin(Date.now() * 0.005 + element.pulsePhase) * 0.2 + 1;
        const displayRadius = element.radius * pulseOffset;
        
        // Draw element
        ctx.beginPath();
        ctx.arc(newX, newY, displayRadius, 0, Math.PI * 2);
        ctx.fillStyle = element.color;
        ctx.fill();
        
        // Draw element icon
        ctx.fillStyle = "white";
        ctx.font = "16px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(element.icon, newX, newY);
        
        return {
          ...element,
          x: newX,
          y: newY
        };
      });
      
      // If all elements are collected, level up
      if (updatedElements.every(e => e.collected) && updatedElements.length > 0) {
        levelUpGame();
      }
      
      setGameElements(updatedElements);
      
      // Update and draw obstacles
      const updatedObstacles = gameObstacles.map(obstacle => {
        // Move obstacle
        let newX = obstacle.x + obstacle.speedX;
        let newY = obstacle.y + obstacle.speedY;
        
        // Bounce off walls
        if (newX <= obstacle.radius || newX >= canvas.width - obstacle.radius) {
          obstacle.speedX = -obstacle.speedX;
          newX = obstacle.x + obstacle.speedX;
        }
        
        if (newY <= obstacle.radius || newY >= canvas.height - obstacle.radius) {
          obstacle.speedY = -obstacle.speedY;
          newY = obstacle.y + obstacle.speedY;
        }
        
        // Check collision with player (if shield is not active)
        if (!activePowerUps.shield) {
          const distToPlayer = Math.sqrt(
            Math.pow(newX - userAvatar.x, 2) + 
            Math.pow(newY - userAvatar.y, 2)
          );
          
          if (distToPlayer < userAvatar.radius + obstacle.radius) {
            // Penalty for hitting obstacle
            const penalty = 10 * gameLevel;
            setGameScore(prev => Math.max(0, prev - penalty));
            
            // Reset streak and multiplier
            setGameStreak(0);
            setGameMultiplier(1);
            
            // Show penalty message
            showGameStatusMessage(`-${penalty} points!`, "#F44336");
            
            // Bounce away from player
            const dx = newX - userAvatar.x;
            const dy = newY - userAvatar.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const nx = dx / dist;
            const ny = dy / dist;
            
            obstacle.speedX = nx * 3;
            obstacle.speedY = ny * 3;
            
            newX = userAvatar.x + nx * (userAvatar.radius + obstacle.radius + 5);
            newY = userAvatar.y + ny * (userAvatar.radius + obstacle.radius + 5);
          }
        }
        
        // Draw obstacle
        ctx.beginPath();
        ctx.arc(newX, newY, obstacle.radius, 0, Math.PI * 2);
        ctx.fillStyle = obstacle.color;
        ctx.fill();
        
        // Add warning pattern
        ctx.save();
        ctx.strokeStyle = "#FFD700";
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 3]);
        ctx.stroke();
        ctx.restore();
        
        // Draw obstacle icon
        ctx.fillStyle = "white";
        ctx.font = "18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(obstacle.icon, newX, newY);
        
        return {
          ...obstacle,
          x: newX,
          y: newY
        };
      });
      
      setGameObstacles(updatedObstacles);
      
      // Draw player avatar
      drawPlayerAvatar(ctx, userAvatar, activePowerUps);
      
      // Draw game message if active
      if (gameMessage.opacity > 0) {
        ctx.save();
        ctx.fillStyle = gameMessage.color;
        ctx.globalAlpha = gameMessage.opacity;
        ctx.font = "bold 24px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(gameMessage.text, canvas.width / 2, canvas.height / 2);
        ctx.restore();
      }
      
      // Continue animation
      gameAnimationRef.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    gameAnimationRef.current = requestAnimationFrame(animate);
    
    // Cleanup event listeners on unmount
    return () => {
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      if (gameAnimationRef.current) {
        cancelAnimationFrame(gameAnimationRef.current);
      }
    };
  }, [
    showMiniGame, 
    gameElements, 
    gameObstacles, 
    userAvatar, 
    gameScore, 
    gamePaused, 
    gameLevel, 
    gameMessage,
    gameMultiplier,
    gameStreak,
    activePowerUps,
    powerUps,
    showGameTutorial
  ]);
  
  // Helper function to draw the background grid
  const drawGrid = (ctx, width, height) => {
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    
    // Draw vertical lines
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Draw horizontal lines
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    
    ctx.restore();
  };
  
  // Helper function to draw player avatar
  const drawPlayerAvatar = (ctx, avatar, powerUps) => {
    ctx.save();
    
    // Draw shield if active
    if (powerUps.shield) {
      ctx.beginPath();
      ctx.arc(avatar.x, avatar.y, avatar.radius + 10, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(33, 150, 243, 0.3)";
      ctx.fill();
      
      // Add shield glow effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#2196F3";
      ctx.strokeStyle = "#2196F3";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw magnet field if active
    if (powerUps.magnet) {
      ctx.beginPath();
      ctx.arc(avatar.x, avatar.y, 150, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 152, 0, 0.1)";
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(avatar.x, avatar.y, 150, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 152, 0, 0.3)";
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    
    // Draw multiplier indicator if active
    if (powerUps.multiplier) {
      ctx.font = "14px Arial";
      ctx.fillStyle = "#E91E63";
      ctx.textAlign = "center";
      ctx.fillText("2x", avatar.x, avatar.y - avatar.radius - 15);
    }
    
    // Draw player circle
    ctx.beginPath();
    ctx.arc(avatar.x, avatar.y, avatar.radius, 0, Math.PI * 2);
    
    // Create gradient fill
    const gradient = ctx.createRadialGradient(
      avatar.x, avatar.y, 0,
      avatar.x, avatar.y, avatar.radius
    );
    gradient.addColorStop(0, "#FF9E00");
    gradient.addColorStop(1, "#FF7D00");
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add glow
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#FF7D00";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#FFB74D";
    ctx.stroke();
    
    // Draw player icon
    ctx.fillStyle = "white";
    ctx.font = "18px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🚀", avatar.x, avatar.y);
    
    ctx.restore();
  };
  
  // Helper function to draw game info
  const drawGameInfo = (ctx, width, height) => {
    ctx.save();
    
    // Draw semi-transparent header
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, 60);
    
    // Draw time remaining
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Time: ${gameTime}s`, 20, 30);
    
    // Draw score
    ctx.textAlign = "center";
    ctx.font = "18px Arial";
    ctx.fillText(`Score: ${gameScore}`, width / 2, 30);
    
    // Draw level
    ctx.textAlign = "right";
    ctx.fillText(`Level: ${gameLevel}`, width - 20, 30);
    
    // Draw multiplier
    if (gameMultiplier > 1) {
      ctx.fillStyle = "#FFC107";
      ctx.textAlign = "center";
      ctx.font = "14px Arial";
      ctx.fillText(`${gameMultiplier}x Multiplier`, width / 2, 55);
    }
    
    // Draw active power-ups
    let powerUpX = 20;
    if (activePowerUps.magnet) {
      ctx.fillStyle = "#FF9800";
      ctx.fillText("🧲", powerUpX, 55);
      powerUpX += 30;
    }
    
    if (activePowerUps.shield) {
      ctx.fillStyle = "#2196F3";
      ctx.fillText("🛡️", powerUpX, 55);
      powerUpX += 30;
    }
    
    if (activePowerUps.multiplier) {
      ctx.fillStyle = "#E91E63";
      ctx.fillText("✨", powerUpX, 55);
    }
    
    ctx.restore();
  };
  
  // Show points indicator animation
  const showPointsIndicator = (x, y, points) => {
    // Create points indicator element
    const indicator = document.createElement('div');
    indicator.className = 'points-indicator';
    indicator.textContent = `+${points}`;
    indicator.style.left = `${x}px`;
    indicator.style.top = `${y}px`;
    
    // Add to game container
    const gameContainer = document.querySelector('.minigame-container');
    if (gameContainer) {
      gameContainer.appendChild(indicator);
      
      // Remove after animation completes
      setTimeout(() => {
        if (gameContainer.contains(indicator)) {
          gameContainer.removeChild(indicator);
        }
      }, 1000);
    }
  };

  return (
    <div className={`amplify-redesigned-container ${colorTheme}`}>
      <div className="cosmic-background">
        <div className="star-field"></div>
        <div className="nebula-effect"></div>
        <div className="gradient-overlay"></div>
      </div>
      
      <div className="content-wrapper">
        <div className="brand-badge">
          <div className="badge-icon">🚀</div>
          <span>Brand Boost</span>
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
            <h2 className="title-glow">Amplify Your Brand Awareness</h2>
            <p className="subtitle">
              Provide details about your campaign to create a personalized
              multi-channel strategy.
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
              <p>Creating your campaign magic, enjoy the mini-game while you wait...</p>
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
                <option value="">--Select Industry--</option>
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

            <div className={`form-group floating-label ${activeField === 'marketTrends' ? 'active-field' : ''}`}>
              <textarea
                name="marketTrends"
                rows="2"
                placeholder=" "
                value={formData.marketTrends}
                onChange={handleChange}
                className={formData.marketTrends ? 'field-filled' : ''}
                onFocus={() => setActiveField('marketTrends')}
                onBlur={() => setActiveField(null)}
              />
              <label>Any market trends or events?</label>
              <div className="focus-border"></div>
              <div className="field-icon">📈</div>
            </div>

            <div className={`form-group floating-label ${activeField === 'targetAudience' ? 'active-field' : ''}`}>
              <textarea
                name="targetAudience"
                rows="2"
                placeholder=" "
                value={formData.targetAudience}
                onChange={handleChange}
                className={formData.targetAudience ? 'field-filled' : ''}
                onFocus={() => setActiveField('targetAudience')}
                onBlur={() => setActiveField(null)}
              />
              <label>Your target audience?</label>
              <div className="focus-border"></div>
              <div className="field-icon">👥</div>
            </div>

            <div className={`form-group floating-label ${activeField === 'brandMessage' ? 'active-field' : ''}`}>
              <textarea
                name="brandMessage"
                rows="2"
                placeholder=" "
                value={formData.brandMessage}
                onChange={handleChange}
                className={formData.brandMessage ? 'field-filled' : ''}
                onFocus={() => setActiveField('brandMessage')}
                onBlur={() => setActiveField(null)}
              />
              <label>Key brand message or USP?</label>
              <div className="focus-border"></div>
              <div className="field-icon">💡</div>
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
                <h3>Brand Network Visualizer</h3>
                <p>Watch your brand connections evolve as you build your campaign</p>
              </div>
              
              {isCreating && (
                <div className="creating-animation">
                  <div className="processing-text">Building Your Campaign</div>
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
                    <div className="metric-label">Brand Connections</div>
                    <div className="metric-bar">
                      <div 
                        className="metric-fill" 
                        style={{ width: `${Math.min((networkConnections.length / 40) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="metric-item">
                    <div className="metric-value">{brandStrength}/10</div>
                    <div className="metric-label">Brand Strength</div>
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
                <h4>Marketing Wisdom</h4>
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
                <h4>Engagement Potential</h4>
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
                    <div className="platform-name">Search</div>
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
                <h4>Brand Reach Simulator</h4>
                <div className="reach-value">{brandReach}%</div>
              </div>
              <div className="impact-visualization">
                <div className="brand-center">
                  <div className="brand-pulse"></div>
                  <div className="brand-icon">🚀</div>
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
      
      {/* Mini-Game Popup */}
      {showMiniGame && (
        <div className="minigame-popup">
          <div className="minigame-container">
            {showGameTutorial ? (
              <div className="game-tutorial">
                <h3>Brand Builder Challenge</h3>
                <p>While we create your campaign, try this mini-game!</p>
                
                <div className="tutorial-items">
                  <div className="tutorial-item">
                    <div className="tutorial-icon collect">📱</div>
                    <div className="tutorial-text">
                      <h4>Collect Brand Elements</h4>
                      <p>Move your cursor to collect marketing channels and boost your score</p>
                    </div>
                  </div>
                  
                  <div className="tutorial-item">
                    <div className="tutorial-icon avoid">🚫</div>
                    <div className="tutorial-text">
                      <h4>Avoid Obstacles</h4>
                      <p>Steer clear of spam filters and competitors that will reduce your score</p>
                    </div>
                  </div>
                  
                  <div className="tutorial-item">
                    <div className="tutorial-icon power">✨</div>
                    <div className="tutorial-text">
                      <h4>Grab Power-Ups</h4>
                      <p>Special power-ups give you temporary abilities to boost your brand</p>
                    </div>
                  </div>
                </div>
                
                <button className="start-game-btn" onClick={handleStartPlaying}>
                  Start Playing
                </button>
                
                <div className="tutorial-note">
                  Your campaign will continue to generate while you play!
                </div>
              </div>
            ) : (
              <>
                <div className="minigame-header">
                  <h3>Brand Builder Challenge</h3>
                  <div className="game-stats">
                    <div className="game-stat">
                      <span className="stat-value">{gameScore}</span>
                      <span className="stat-label">Score</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-value">{gameLevel}</span>
                      <span className="stat-label">Level</span>
                    </div>
                    <div className="game-stat">
                      <span className="stat-value">{gameTime}</span>
                      <span className="stat-label">Time</span>
                    </div>
                    {gameHighScore > 0 && (
                      <div className="game-stat">
                        <span className="stat-value">{gameHighScore}</span>
                        <span className="stat-label">Best</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <canvas 
                  ref={gameCanvasRef} 
                  className="minigame-canvas" 
                  width="500"
                  height="400"
                ></canvas>
                
                <div className="game-controls">
                  <div className="control-tip">
                    Move your mouse cursor to control your brand rocket
                  </div>
                  
                  <div className="campaign-progress">
                    <div className="progress-label">Campaign Creation:</div>
                    <div className="progress-bar">
                      <div className="progress-fill"></div>
                    </div>
                  </div>
                </div>
              </>
            )}
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
            <h3>Campaign Successfully Created!</h3>
            <p>Preparing your brand amplification strategy...</p>
            <div className="success-progress">
              <div className="success-bar"></div>
            </div>
            
            {gameScore > 0 && (
              <div className="game-result">
                <div className="game-score-final">
                  Brand Builder Score: <span>{gameScore}</span>
                </div>
                {gameScore > gameHighScore && gameHighScore > 0 && (
                  <div className="new-record">New High Score!</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      
      <AiChatbot />
    </div>
  );
}

export default Amplify;