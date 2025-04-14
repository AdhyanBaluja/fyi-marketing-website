import React, { useState, useEffect, useRef } from 'react';
import './BrandBuilderGame.css';

// Game collectibles - different types of treasures
const gameCollectibles = [
  { type: "coin", icon: "🪙", name: "Gold Coin", points: 10, color: "#FFD700" },
  { type: "gem", icon: "💎", name: "Diamond", points: 25, color: "#00BFFF" },
  { type: "chest", icon: "🧰", name: "Treasure Chest", points: 50, color: "#8B4513" },
  { type: "crown", icon: "👑", name: "Crown", points: 75, color: "#9370DB" },
  { type: "ruby", icon: "❤️", name: "Ruby", points: 30, color: "#FF0000" }
];

// Game obstacles
const gameObstacles = [
  { type: "trap", icon: "⚡", name: "Trap", color: "#FF4500" },
  { type: "snake", icon: "🐍", name: "Snake", color: "#32CD32" }
];

// Power-ups for extra engagement
const gamePowerUps = [
  { type: "magnet", icon: "🧲", name: "Magnet", duration: 5000, color: "#C0C0C0" },
  { type: "shield", icon: "🛡️", name: "Shield", duration: 3000, color: "#4682B4" },
  { type: "doubler", icon: "✨", name: "Point Doubler", duration: 4000, color: "#FFD700" }
];

function BrandBuilderGame({ onClose }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [collectibles, setCollectibles] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [powerUps, setPowerUps] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 250, y: 350 });
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);
  const [combo, setCombo] = useState(0);
  const [activePowerUps, setActivePowerUps] = useState({
    magnet: false,
    shield: false,
    doubler: false
  });

  // 10-minute lock
  const [doneButtonDisabled, setDoneButtonDisabled] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(600); // 600 seconds = 10 minutes
  
  // Game state management
  const [gameActive, setGameActive] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);
  const [streakEffect, setStreakEffect] = useState(null);
  const [particles, setParticles] = useState([]);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameContainerRef = useRef(null);
  const gameLoopRef = useRef(null);
  const pointsMultiplier = useRef(1);

  // 10-minute timer
  useEffect(() => {
    if (gameStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setDoneButtonDisabled(false);
            clearInterval(timer);
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  // Format time for display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Set up canvas and add resize handling
  useEffect(() => {
    const setupCanvas = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Make sure canvas is properly sized
      const container = canvas.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        canvas.width = Math.min(500, containerWidth - 20);
      }
      
      setCanvasReady(true);
    };

    // Set up resize handler
    const handleResize = () => {
      setupCanvas();
    };

    window.addEventListener('resize', handleResize);
    setupCanvas();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Initialize the game and load high score
  useEffect(() => {
    const storedHighScore = localStorage.getItem('treasureHunterHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
    
    // Cleanup function
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, []);

  // Handle game start
  useEffect(() => {
    if (gameStarted && canvasReady && !showTutorial) {
      // Clear any existing game loop
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }

      setGameActive(true);
      generateCollectibles(4);
      generateObstacles(1);
      
      // Add powerups less frequently
      if (Math.random() > 0.7) {
        generatePowerUps(1);
      }
      
      // Start the game loop using setInterval for better reliability
      gameLoopRef.current = setInterval(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            updateGameState(ctx, canvas.width, canvas.height);
          }
        }
      }, 16); // ~60 FPS
    }
  }, [gameStarted, canvasReady, showTutorial]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameScore(0);
    setLevel(1);
    setCombo(0);
    pointsMultiplier.current = 1;
    setActivePowerUps({
      magnet: false,
      shield: false,
      doubler: false
    });
    setParticles([]);
  };

  // Generate collectable treasures
  const generateCollectibles = (count) => {
    const newCollectibles = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const shuffled = [...gameCollectibles].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
      const collectible = shuffled[i % shuffled.length];
      
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30;
        
        // Keep elements away from player
        const distToPlayer = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
        tooClose = distToPlayer < 80;
      } while (tooClose);
      
      newCollectibles.push({
        id: Date.now() + i,
        x,
        y,
        radius: 20,
        speedX: (Math.random() - 0.5) * (1 + level * 0.1),
        speedY: (Math.random() - 0.5) * (1 + level * 0.1),
        ...collectible,
        collected: false,
        pulseEffect: 0
      });
    }
    
    setCollectibles(newCollectibles);
  };

  // Generate obstacles
  const generateObstacles = (count) => {
    const newObstacles = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const shuffled = [...gameObstacles].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
      const obstacle = shuffled[i % shuffled.length];
      
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30;
        
        // Keep obstacles away from player
        const distToPlayer = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
        tooClose = distToPlayer < 100;
      } while (tooClose);
      
      newObstacles.push({
        id: Date.now() + i + 1000,
        x,
        y,
        radius: 20,
        speedX: (Math.random() - 0.5) * (1.5 + level * 0.15),
        speedY: (Math.random() - 0.5) * (1.5 + level * 0.15),
        ...obstacle
      });
    }
    
    setObstacles(newObstacles);
  };

  // Generate power-ups
  const generatePowerUps = (count) => {
    const newPowerUps = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const shuffled = [...gamePowerUps].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
      const powerUp = shuffled[i % shuffled.length];
      
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30;
        
        // Keep away from player
        const distToPlayer = Math.sqrt(Math.pow(x - playerPosition.x, 2) + Math.pow(y - playerPosition.y, 2));
        tooClose = distToPlayer < 80;
      } while (tooClose);
      
      newPowerUps.push({
        id: Date.now() + i + 2000,
        x,
        y,
        radius: 15,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        ...powerUp,
        collected: false,
        pulseEffect: 0
      });
    }
    
    setPowerUps(newPowerUps);
  };

  // Create particles for effects
  const createParticles = (x, y, color, count) => {
    const newParticles = [];
    
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      
      newParticles.push({
        id: Date.now() + i + Math.random(),
        x,
        y,
        radius: 2 + Math.random() * 3,
        speedX: Math.cos(angle) * speed,
        speedY: Math.sin(angle) * speed,
        color,
        life: 30 + Math.random() * 20
      });
    }
    
    setParticles(prev => [...prev, ...newParticles]);
  };

  // Handle mouse/touch move
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !gameActive) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.max(20, Math.min(canvas.width - 20, 
      (e.clientX - rect.left) * scaleX));
    const y = Math.max(20, Math.min(canvas.height - 20, 
      (e.clientY - rect.top) * scaleY));
    
    setPlayerPosition({ x, y });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!canvasRef.current || !gameActive) return;
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.max(20, Math.min(canvas.width - 20, 
      (touch.clientX - rect.left) * scaleX));
    const y = Math.max(20, Math.min(canvas.height - 20, 
      (touch.clientY - rect.top) * scaleY));
    
    setPlayerPosition({ x, y });
  };

  // Show points popup with combo multiplier
  const showPoints = (x, y, points, isCombo = false) => {
    if (!gameContainerRef.current) return;
    
    const pointsEl = document.createElement('div');
    pointsEl.className = isCombo ? 'points-popup combo' : 'points-popup';
    const finalPoints = Math.round(points * pointsMultiplier.current);
    pointsEl.textContent = `+${finalPoints}${isCombo ? ' COMBO!' : ''}`;
    
    // Position relative to the container
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      pointsEl.style.left = `${x * (rect.width / canvas.width) + rect.left - gameContainerRef.current.getBoundingClientRect().left}px`;
      pointsEl.style.top = `${y * (rect.height / canvas.height) + rect.top - gameContainerRef.current.getBoundingClientRect().top}px`;
    }
    
    gameContainerRef.current.appendChild(pointsEl);
    setTimeout(() => {
      if (gameContainerRef.current && gameContainerRef.current.contains(pointsEl)) {
        gameContainerRef.current.removeChild(pointsEl);
      }
    }, 1000);
  };

  // Handle powerup activation
  const activatePowerUp = (type) => {
    setActivePowerUps(prev => ({
      ...prev,
      [type]: true
    }));
    
    // Show powerup indicator
    const indicator = document.createElement('div');
    indicator.className = 'powerup-indicator';
    indicator.textContent = `${type.toUpperCase()} ACTIVATED!`;
    if (gameContainerRef.current) {
      gameContainerRef.current.appendChild(indicator);
      setTimeout(() => {
        if (gameContainerRef.current && gameContainerRef.current.contains(indicator)) {
          gameContainerRef.current.removeChild(indicator);
        }
      }, 2000);
    }
    
    // Set timer to deactivate powerup
    const duration = type === 'magnet' ? 5000 : type === 'shield' ? 3000 : 4000;
    
    if (type === 'doubler') {
      pointsMultiplier.current = 2;
    }
    
    setTimeout(() => {
      setActivePowerUps(prev => ({
        ...prev,
        [type]: false
      }));
      
      if (type === 'doubler') {
        pointsMultiplier.current = 1;
      }
    }, duration);
  };

  // Level up
  const levelUp = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    
    // Add more elements as levels progress
    generateCollectibles(3 + Math.min(newLevel, 4));
    generateObstacles(1 + Math.min(Math.floor(newLevel / 2), 3));
    
    // Add chance for powerup
    if (Math.random() > 0.5) {
      generatePowerUps(1);
    }
    
    // Show level up message
    const levelUpEl = document.createElement('div');
    levelUpEl.className = 'level-up-indicator';
    levelUpEl.textContent = `LEVEL ${newLevel}!`;
    
    if (gameContainerRef.current) {
      gameContainerRef.current.appendChild(levelUpEl);
      setTimeout(() => {
        if (gameContainerRef.current && gameContainerRef.current.contains(levelUpEl)) {
          gameContainerRef.current.removeChild(levelUpEl);
        }
      }, 2000);
    }
  };

  // Main game update function
  const updateGameState = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    drawBackground(ctx, width, height);
    drawGameInfo(ctx, width);
    
    // Update particles first (to be in background)
    const updatedParticles = particles.filter(particle => {
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      particle.life -= 1;
      
      if (particle.life > 0) {
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * (particle.life / 50), 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.globalAlpha = particle.life / 50;
        ctx.fill();
        ctx.globalAlpha = 1;
        return true;
      }
      return false;
    });
    setParticles(updatedParticles);
    
    // Update collectibles
    let allCollected = collectibles.length > 0;
    const updatedCollectibles = collectibles.map(collectible => {
      if (collectible.collected) {
        return collectible;
      } else {
        allCollected = false;
      }
      
      // Magnet powerup effect
      if (activePowerUps.magnet) {
        const distToPlayer = Math.sqrt(Math.pow(collectible.x - playerPosition.x, 2) + Math.pow(collectible.y - playerPosition.y, 2));
        if (distToPlayer < 150) {
          // Move towards player
          const dx = playerPosition.x - collectible.x;
          const dy = playerPosition.y - collectible.y;
          const angle = Math.atan2(dy, dx);
          collectible.speedX = Math.cos(angle) * 3;
          collectible.speedY = Math.sin(angle) * 3;
        }
      }
      
      let newX = collectible.x + collectible.speedX;
      let newY = collectible.y + collectible.speedY;
      
      // Bounce off walls
      if (newX <= collectible.radius || newX >= width - collectible.radius) {
        collectible.speedX = -collectible.speedX;
        newX = collectible.x + collectible.speedX;
      }
      
      if (newY <= collectible.radius || newY >= height - collectible.radius) {
        collectible.speedY = -collectible.speedY;
        newY = collectible.y + collectible.speedY;
      }
      
      // Pulse effect for collectibles
      collectible.pulseEffect = (collectible.pulseEffect + 0.05) % (Math.PI * 2);
      const pulseSize = 1 + Math.sin(collectible.pulseEffect) * 0.2;
      
      // Check collision with player
      const distToPlayer = Math.sqrt(Math.pow(newX - playerPosition.x, 2) + Math.pow(newY - playerPosition.y, 2));
      if (distToPlayer < 20 + collectible.radius) {
        // Increase combo
        const newCombo = combo + 1;
        setCombo(newCombo);
        
        let points = collectible.points;
        
        // Apply combo bonus
        if (newCombo > 1) {
          points = Math.round(points * (1 + (newCombo * 0.1)));
          showPoints(newX, newY, points, true);
          // Show combo streak
          setStreakEffect({
            text: `${newCombo}x COMBO!`,
            time: Date.now()
          });
        } else {
          showPoints(newX, newY, points);
        }
        
        setGameScore(prev => prev + Math.round(points * pointsMultiplier.current));
        
        // Create particle effect on collection
        createParticles(newX, newY, collectible.color, 12);
        
        return { ...collectible, collected: true };
      }
      
      // Draw collectible with pulse effect
      ctx.beginPath();
      ctx.arc(newX, newY, collectible.radius * pulseSize, 0, Math.PI * 2);
      
      // Gradient fill for better visual appeal
      const gradient = ctx.createRadialGradient(newX, newY, 0, newX, newY, collectible.radius * pulseSize);
      gradient.addColorStop(0, collectible.color);
      gradient.addColorStop(1, adjustColor(collectible.color, -30));
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Add a subtle glow effect
      ctx.shadowBlur = 10;
      ctx.shadowColor = collectible.color;
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(collectible.icon, newX, newY);
      
      // Reset shadow for other elements
      ctx.shadowBlur = 0;
      
      return { ...collectible, x: newX, y: newY, pulseEffect: collectible.pulseEffect };
    });
    
    // Level up if all collectibles are collected
    if (allCollected && updatedCollectibles.length > 0) {
      levelUp();
    }
    setCollectibles(updatedCollectibles);
    
    // Update power-ups
    const updatedPowerUps = powerUps.map(powerUp => {
      if (powerUp.collected) {
        return powerUp;
      }
      
      let newX = powerUp.x + powerUp.speedX;
      let newY = powerUp.y + powerUp.speedY;
      
      // Bounce off walls
      if (newX <= powerUp.radius || newX >= width - powerUp.radius) {
        powerUp.speedX = -powerUp.speedX;
        newX = powerUp.x + powerUp.speedX;
      }
      
      if (newY <= powerUp.radius || newY >= height - powerUp.radius) {
        powerUp.speedY = -powerUp.speedY;
        newY = powerUp.y + powerUp.speedY;
      }
      
      // Pulse effect for powerups
      powerUp.pulseEffect = (powerUp.pulseEffect + 0.1) % (Math.PI * 2);
      const pulseSize = 1 + Math.sin(powerUp.pulseEffect) * 0.3;
      
      // Check collision with player
      const distToPlayer = Math.sqrt(Math.pow(newX - playerPosition.x, 2) + Math.pow(newY - playerPosition.y, 2));
      if (distToPlayer < 20 + powerUp.radius) {
        // Activate the power-up
        activatePowerUp(powerUp.type);
        createParticles(newX, newY, powerUp.color, 20);
        return { ...powerUp, collected: true };
      }
      
      // Draw power-up with pulse and glow
      ctx.beginPath();
      ctx.arc(newX, newY, powerUp.radius * pulseSize, 0, Math.PI * 2);
      
      // Star-shaped power-up
      ctx.fillStyle = powerUp.color;
      ctx.fill();
      
      // Glowing effect
      ctx.shadowBlur = 15;
      ctx.shadowColor = powerUp.color;
      
      ctx.fillStyle = 'white';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(powerUp.icon, newX, newY);
      
      // Reset shadow for other elements
      ctx.shadowBlur = 0;
      
      return { ...powerUp, x: newX, y: newY, pulseEffect: powerUp.pulseEffect };
    });
    
    setPowerUps(updatedPowerUps);
    
    // Update obstacles
    const updatedObstacles = obstacles.map(obstacle => {
      let newX = obstacle.x + obstacle.speedX;
      let newY = obstacle.y + obstacle.speedY;
      
      // Bounce off walls
      if (newX <= obstacle.radius || newX >= width - obstacle.radius) {
        obstacle.speedX = -obstacle.speedX;
        newX = obstacle.x + obstacle.speedX;
      }
      
      if (newY <= obstacle.radius || newY >= height - obstacle.radius) {
        obstacle.speedY = -obstacle.speedY;
        newY = obstacle.y + obstacle.speedY;
      }
      
      // Check collision with player if shield is not active
      const distToPlayer = Math.sqrt(Math.pow(newX - playerPosition.x, 2) + Math.pow(newY - playerPosition.y, 2));
      if (distToPlayer < 20 + obstacle.radius && !activePowerUps.shield) {
        // Reset combo on obstacle hit
        setCombo(0);
        
        // Lose points
        setGameScore(prev => Math.max(0, prev - 10));
        
        // Show negative points
        const pointsEl = document.createElement('div');
        pointsEl.className = 'points-popup negative';
        pointsEl.textContent = '-10';
        
        if (gameContainerRef.current) {
          const canvas = canvasRef.current;
          if (canvas) {
            const rect = canvas.getBoundingClientRect();
            pointsEl.style.left = `${newX * (rect.width / canvas.width) + rect.left - gameContainerRef.current.getBoundingClientRect().left}px`;
            pointsEl.style.top = `${newY * (rect.height / canvas.height) + rect.top - gameContainerRef.current.getBoundingClientRect().top}px`;
          }
          
          gameContainerRef.current.appendChild(pointsEl);
          setTimeout(() => {
            if (gameContainerRef.current && gameContainerRef.current.contains(pointsEl)) {
              gameContainerRef.current.removeChild(pointsEl);
            }
          }, 1000);
        }
        
        // Push obstacle away from player
        const dx = newX - playerPosition.x;
        const dy = newY - playerPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        obstacle.speedX = nx * 4;
        obstacle.speedY = ny * 4;
        newX = playerPosition.x + nx * (20 + obstacle.radius + 5);
        newY = playerPosition.y + ny * (20 + obstacle.radius + 5);
        
        // Create particle effect for collision
        createParticles(playerPosition.x, playerPosition.y, '#FF5252', 15);
      }
      
      // Draw obstacle
      ctx.beginPath();
      ctx.arc(newX, newY, obstacle.radius, 0, Math.PI * 2);
      
      // Gradient fill for better visual appeal
      const gradient = ctx.createRadialGradient(newX, newY, 0, newX, newY, obstacle.radius);
      gradient.addColorStop(0, adjustColor(obstacle.color, 30));
      gradient.addColorStop(1, obstacle.color);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obstacle.icon, newX, newY);
      
      return { ...obstacle, x: newX, y: newY };
    });
    
    setObstacles(updatedObstacles);
    
    // Draw player
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y, 20, 0, Math.PI * 2);
    
    // Player appearance based on powerups
    if (activePowerUps.shield) {
      ctx.save();
      ctx.strokeStyle = '#4682B4';
      ctx.lineWidth = 4;
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4682B4';
      ctx.stroke();
      ctx.restore();
    }
    
    if (activePowerUps.magnet) {
      const magnetGradient = ctx.createRadialGradient(
        playerPosition.x, playerPosition.y, 0,
        playerPosition.x, playerPosition.y, 20
      );
      magnetGradient.addColorStop(0, "#C0C0C0");
      magnetGradient.addColorStop(1, "#808080");
      ctx.fillStyle = magnetGradient;
    } else if (activePowerUps.doubler) {
      const doublerGradient = ctx.createRadialGradient(
        playerPosition.x, playerPosition.y, 0,
        playerPosition.x, playerPosition.y, 20
      );
      doublerGradient.addColorStop(0, "#FFD700");
      doublerGradient.addColorStop(1, "#FFA500");
      ctx.fillStyle = doublerGradient;
    } else {
      const playerGradient = ctx.createRadialGradient(
        playerPosition.x, playerPosition.y, 0,
        playerPosition.x, playerPosition.y, 20
      );
      playerGradient.addColorStop(0, "#FF9E00");
      playerGradient.addColorStop(1, "#FF7D00");
      ctx.fillStyle = playerGradient;
    }
    
    ctx.fill();
    
    // Draw player icon
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("👤", playerPosition.x, playerPosition.y);
    
// Draw combo streak
if (streakEffect && Date.now() - streakEffect.time < 2000) {
    const alpha = 1 - ((Date.now() - streakEffect.time) / 2000);
    ctx.fillStyle = `rgba(255, 215, 0, ${alpha})`;
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(streakEffect.text, width / 2, height / 2 - 40);
  }
  
  // Draw active power-ups
  let powerUpX = 10;
  if (activePowerUps.magnet) {
    ctx.fillStyle = "#C0C0C0";
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText("🧲", powerUpX, 60);
    powerUpX += 30;
  }
  
  if (activePowerUps.shield) {
    ctx.fillStyle = "#4682B4";
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText("🛡️", powerUpX, 60);
    powerUpX += 30;
  }
  
  if (activePowerUps.doubler) {
    ctx.fillStyle = "#FFD700";
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText("✨", powerUpX, 60);
  }
};

// Helper function to adjust colors for gradients
const adjustColor = (color, amount) => {
  // For named colors, provide fallback hex values
  const colorMap = {
    "#FFD700": "#FFD700", // Gold
    "#00BFFF": "#00BFFF", // Diamond blue
    "#8B4513": "#8B4513", // Brown
    "#9370DB": "#9370DB", // Purple
    "#FF0000": "#FF0000", // Red
    "#FF4500": "#FF4500", // Orange red
    "#32CD32": "#32CD32", // Lime green
    "#C0C0C0": "#C0C0C0", // Silver
    "#4682B4": "#4682B4", // Steel blue
  };
  
  // Use the mapped color or the original
  const baseColor = colorMap[color] || color;
  
  // Convert hex to RGB
  let r = parseInt(baseColor.slice(1, 3), 16);
  let g = parseInt(baseColor.slice(3, 5), 16);
  let b = parseInt(baseColor.slice(5, 7), 16);
  
  // Adjust RGB values
  r = Math.max(0, Math.min(255, r + amount));
  g = Math.max(0, Math.min(255, g + amount));
  b = Math.max(0, Math.min(255, b + amount));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

// Helper function to draw background
const drawBackground = (ctx, width, height) => {
  // Create a grid pattern
  ctx.fillStyle = "#001524";
  ctx.fillRect(0, 0, width, height);
  
  // Draw grid lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 1;
  
  // Draw horizontal grid lines
  for (let y = 0; y <= height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Draw vertical grid lines
  for (let x = 0; x <= width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
};

// Helper function to draw game info
const drawGameInfo = (ctx, width) => {
  // Draw top info panel
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(0, 0, width, 40);
  
  // Draw score with animation if changed
  ctx.fillStyle = "white";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText(`Score: ${gameScore}`, 20, 20);
  
  // Draw level
  ctx.textAlign = "center";
  ctx.fillText(`Level: ${level}`, width / 2, 20);
  
  // Draw high score
  ctx.textAlign = "right";
  ctx.fillText(`High Score: ${Math.max(highScore, gameScore)}`, width - 20, 20);
  
  // Draw combo counter if active
  if (combo > 1) {
    ctx.fillStyle = "#FFD700";
    ctx.font = "14px Arial";
    ctx.textAlign = "left";
    ctx.fillText(`Combo: ${combo}x`, 20, 45);
  }
  
  // Show timer for done button
  if (doneButtonDisabled) {
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.font = "12px Arial";
    ctx.textAlign = "right";
    ctx.fillText(`Unlock in: ${formatTime(timeRemaining)}`, width - 20, 45);
  }
};

// Handle starting the game
const handleStartGame = () => {
  setShowTutorial(false);
  startGame();
};

// Handle closing (Done button)
const handleClose = () => {
  if (doneButtonDisabled) {
    return;
  }
  
  if (gameScore > highScore) {
    localStorage.setItem('treasureHunterHighScore', gameScore.toString());
  }
  
  // Clean up game resources
  if (animationRef.current) {
    cancelAnimationFrame(animationRef.current);
  }
  
  if (gameLoopRef.current) {
    clearInterval(gameLoopRef.current);
  }
  
  setGameActive(false);
  onClose && onClose(gameScore);
};

// Handle visibility change
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause the game when tab is not visible
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    } else if (gameStarted && !showTutorial) {
      // Resume the game when tab becomes visible again
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
      
      gameLoopRef.current = setInterval(() => {
        if (canvasRef.current) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            updateGameState(ctx, canvas.width, canvas.height);
          }
        }
      }, 16);
    }
  };
  
  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, [gameStarted, showTutorial]);

return (
  <div className="treasure-hunter-game" ref={gameContainerRef}>
    {showTutorial ? (
      <div className="game-tutorial">
        <h2>Treasure Hunter</h2>
        <p>Collect treasures while we prepare your experience!</p>
        
        <div className="tutorial-items">
          <div className="tutorial-item">
            <div className="tutorial-icon collect">💎</div>
            <p>Catch treasures to earn points<br />Build combos for bonus points!</p>
          </div>
          
          <div className="tutorial-item">
            <div className="tutorial-icon powerup">✨</div>
            <p>Grab power-ups for special abilities</p>
          </div>
          
          <div className="tutorial-item">
            <div className="tutorial-icon avoid">⚡</div>
            <p>Avoid traps that reduce your score and break combos</p>
          </div>
        </div>
        
        <button className="start-game-btn" onClick={handleStartGame}>
          Start Hunting!
        </button>
      </div>
    ) : (
      <>
        <div className="game-header">
          <h2>Treasure Hunter</h2>
          <button 
            className={`close-btn ${doneButtonDisabled ? 'disabled' : ''}`} 
            onClick={handleClose} 
            disabled={doneButtonDisabled}
          >
            {doneButtonDisabled ? `Done (${formatTime(timeRemaining)})` : 'Done'}
          </button>
        </div>
        
        <canvas 
          ref={canvasRef}
          width={500}
          height={400}
          className="game-canvas"
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
        />
        
        <div className="game-controls">
          <p>Move your cursor to collect treasures and avoid traps</p>
        </div>
      </>
    )}
  </div>
);
}

export default BrandBuilderGame;