import React, { useState, useEffect, useRef } from 'react';
import './BrandBuilderGame.css';

const gameElements = [
  { type: "social", icon: "📱", name: "Social Media", points: 15, color: "#1DA1F2" },
  { type: "email", icon: "📧", name: "Email Marketing", points: 10, color: "#4CAF50" },
  { type: "content", icon: "📝", name: "Content Marketing", points: 20, color: "#FF5722" },
  { type: "ads", icon: "🎯", name: "Targeted Ads", points: 25, color: "#9C27B0" },
  { type: "video", icon: "🎬", name: "Video Content", points: 30, color: "#F44336" }
];

const gameObstacles = [
  { type: "spam", icon: "🚫", name: "Spam Filter", color: "#f44336" }
];

function BrandBuilderGame({ onClose }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [elements, setElements] = useState([]);
  const [obstacles, setObstacles] = useState([]);
  const [playerPosition, setPlayerPosition] = useState({ x: 250, y: 350 });
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(0);
  const [showTutorial, setShowTutorial] = useState(true);

  // NEW: State to lock the Done button for 10 minutes and to show a message.
  const [doneButtonDisabled, setDoneButtonDisabled] = useState(true);
  const [doneButtonLockedMessage, setDoneButtonLockedMessage] = useState(true);

  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const gameContainerRef = useRef(null);

  // NEW: Unlock the Done button after 10 minutes (600,000 milliseconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDoneButtonDisabled(false);
      setDoneButtonLockedMessage(false);
    }, 600000); // 600,000 ms = 10 minutes

    return () => clearTimeout(timer);
  }, []);

  // Initialize the game and load high score
  useEffect(() => {
    const storedHighScore = localStorage.getItem('brandBuilderHighScore');
    if (storedHighScore) {
      setHighScore(parseInt(storedHighScore, 10));
    }
    
    if (!showTutorial && !gameStarted) {
      startGame();
    }
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [showTutorial, gameStarted]);

  // Start the game
  const startGame = () => {
    setGameStarted(true);
    setGameScore(0);
    setLevel(1);
    generateElements(4);
    generateObstacles(2);
    
    if (canvasRef.current) {
      runGameLoop();
    }
  };

  // Generate collectable brand elements
  const generateElements = (count) => {
    const newElements = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    const shuffled = [...gameElements].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < count; i++) {
      const element = shuffled[i % shuffled.length];
      
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30;
        
        const distToPlayer = Math.sqrt(Math.pow(x - 250, 2) + Math.pow(y - 350, 2));
        tooClose = distToPlayer < 100;
      } while (tooClose);
      
      newElements.push({
        id: Date.now() + i,
        x,
        y,
        radius: 20,
        speedX: (Math.random() - 0.5) * 1.2,
        speedY: (Math.random() - 0.5) * 1.2,
        ...element,
        collected: false
      });
    }
    
    setElements(newElements);
  };

  // Generate obstacles
  const generateObstacles = (count) => {
    const newObstacles = [];
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    for (let i = 0; i < count; i++) {
      const obstacle = gameObstacles[i % gameObstacles.length];
      
      let x, y, tooClose;
      do {
        x = Math.random() * (width - 60) + 30;
        y = Math.random() * (height - 150) + 30;
        
        const distToPlayer = Math.sqrt(Math.pow(x - 250, 2) + Math.pow(y - 350, 2));
        tooClose = distToPlayer < 120;
      } while (tooClose);
      
      newObstacles.push({
        id: Date.now() + i + 1000,
        x,
        y,
        radius: 20,
        speedX: (Math.random() - 0.5) * 1.5,
        speedY: (Math.random() - 0.5) * 1.5,
        ...obstacle
      });
    }
    
    setObstacles(newObstacles);
  };

  // Handle mouse/touch move
  const handleMouseMove = (e) => {
    if (!canvasRef.current || !gameStarted) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(20, Math.min(canvas.width - 20, e.clientX - rect.left));
    const y = Math.max(20, Math.min(canvas.height - 20, e.clientY - rect.top));
    setPlayerPosition({ x, y });
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (!canvasRef.current || !gameStarted) return;
    
    const touch = e.touches[0];
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(20, Math.min(canvas.width - 20, touch.clientX - rect.left));
    const y = Math.max(20, Math.min(canvas.height - 20, touch.clientY - rect.top));
    setPlayerPosition({ x, y });
  };

  // Show points popup
  const showPoints = (x, y, points) => {
    const pointsEl = document.createElement('div');
    pointsEl.className = 'points-popup';
    pointsEl.textContent = `+${points}`;
    pointsEl.style.left = `${x}px`;
    pointsEl.style.top = `${y}px`;
    
    if (gameContainerRef.current) {
      gameContainerRef.current.appendChild(pointsEl);
      setTimeout(() => {
        if (gameContainerRef.current && gameContainerRef.current.contains(pointsEl)) {
          gameContainerRef.current.removeChild(pointsEl);
        }
      }, 1000);
    }
  };

  // Level up
  const levelUp = () => {
    const newLevel = level + 1;
    setLevel(newLevel);
    generateElements(3 + Math.min(newLevel, 4));
    generateObstacles(1 + Math.min(Math.floor(newLevel / 2), 3));
  };

  // Main game loop
  const runGameLoop = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    drawGrid(ctx, width, height);
    drawGameInfo(ctx, width);
    
    let allCollected = elements.length > 0;
    const updatedElements = elements.map(element => {
      if (element.collected) {
        allCollected = allCollected && true;
        return element;
      } else {
        allCollected = false;
      }
      
      let newX = element.x + element.speedX;
      let newY = element.y + element.speedY;
      
      if (newX <= element.radius || newX >= width - element.radius) {
        element.speedX = -element.speedX;
        newX = element.x + element.speedX;
      }
      
      if (newY <= element.radius || newY >= height - element.radius) {
        element.speedY = -element.speedY;
        newY = element.y + element.speedY;
      }
      
      const distToPlayer = Math.sqrt(Math.pow(newX - playerPosition.x, 2) + Math.pow(newY - playerPosition.y, 2));
      if (distToPlayer < 20 + element.radius) {
        setGameScore(prev => prev + element.points);
        showPoints(newX, newY, element.points);
        return { ...element, collected: true };
      }
      
      ctx.beginPath();
      ctx.arc(newX, newY, element.radius, 0, Math.PI * 2);
      ctx.fillStyle = element.color;
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(element.icon, newX, newY);
      
      return { ...element, x: newX, y: newY };
    });
    
    if (allCollected && updatedElements.length > 0) {
      levelUp();
    }
    setElements(updatedElements);
    
    const updatedObstacles = obstacles.map(obstacle => {
      let newX = obstacle.x + obstacle.speedX;
      let newY = obstacle.y + obstacle.speedY;
      
      if (newX <= obstacle.radius || newX >= width - obstacle.radius) {
        obstacle.speedX = -obstacle.speedX;
        newX = obstacle.x + obstacle.speedX;
      }
      
      if (newY <= obstacle.radius || newY >= height - obstacle.radius) {
        obstacle.speedY = -obstacle.speedY;
        newY = obstacle.y + obstacle.speedY;
      }
      
      const distToPlayer = Math.sqrt(Math.pow(newX - playerPosition.x, 2) + Math.pow(newY - playerPosition.y, 2));
      if (distToPlayer < 20 + obstacle.radius) {
        setGameScore(prev => Math.max(0, prev - 5));
        const dx = newX - playerPosition.x;
        const dy = newY - playerPosition.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const nx = dx / dist;
        const ny = dy / dist;
        obstacle.speedX = nx * 3;
        obstacle.speedY = ny * 3;
        newX = playerPosition.x + nx * (20 + obstacle.radius + 5);
        newY = playerPosition.y + ny * (20 + obstacle.radius + 5);
      }
      
      ctx.beginPath();
      ctx.arc(newX, newY, obstacle.radius, 0, Math.PI * 2);
      ctx.fillStyle = obstacle.color;
      ctx.fill();
      
      ctx.fillStyle = 'white';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(obstacle.icon, newX, newY);
      
      return { ...obstacle, x: newX, y: newY };
    });
    
    setObstacles(updatedObstacles);
    
    ctx.beginPath();
    ctx.arc(playerPosition.x, playerPosition.y, 20, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(playerPosition.x, playerPosition.y, 0, playerPosition.x, playerPosition.y, 20);
    gradient.addColorStop(0, "#FF9E00");
    gradient.addColorStop(1, "#FF7D00");
    ctx.fillStyle = gradient;
    ctx.fill();
    
    ctx.fillStyle = 'white';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText("🚀", playerPosition.x, playerPosition.y);
    
    animationRef.current = requestAnimationFrame(runGameLoop);
  };

  // Helper function to draw grid
  const drawGrid = (ctx, width, height) => {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= width; x += 50) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += 50) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Helper function to draw game info
  const drawGameInfo = (ctx, width) => {
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, width, 40);
    
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText(`Score: ${gameScore}`, 20, 20);
    
    ctx.textAlign = "center";
    ctx.fillText(`Level: ${level}`, width / 2, 20);
    
    ctx.textAlign = "right";
    ctx.fillText(`High Score: ${Math.max(highScore, gameScore)}`, width - 20, 20);
  };

  // Handle starting the game
  const handleStartGame = () => {
    setShowTutorial(false);
  };

  // Handle closing (Done button)
  const handleClose = () => {
    if (doneButtonDisabled) {
      // Optionally, you might display a message or alert here.
      return;
    }
    if (gameScore > highScore) {
      localStorage.setItem('brandBuilderHighScore', gameScore.toString());
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    onClose(gameScore);
  };

  return (
    <div className="brand-builder-game" ref={gameContainerRef}>
      {showTutorial ? (
        <div className="game-tutorial">
          <h2>Brand Builder Challenge</h2>
          <p>While we create your campaign, enjoy this mini-game!</p>
          
          <div className="tutorial-items">
            <div className="tutorial-item">
              <div className="tutorial-icon collect">📱</div>
              <p>Move your cursor to collect brand elements</p>
            </div>
            
            <div className="tutorial-item">
              <div className="tutorial-icon avoid">🚫</div>
              <p>Avoid obstacles that reduce your score</p>
            </div>
          </div>
          
          <button className="start-game-btn" onClick={handleStartGame}>
            Start Game
          </button>
        </div>
      ) : (
        <>
          <div className="game-header">
            <h2>Brand Builder Challenge</h2>
            <button className="close-btn" onClick={handleClose} disabled={doneButtonDisabled}>
              Done
            </button>
            {doneButtonLockedMessage && (
              <div className="done-locked-message">
                The Done button is locked for 10 minutes.
              </div>
            )}
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
            <p>Move your cursor to control the rocket</p>
          </div>
        </>
      )}
    </div>
  );
}

export default BrandBuilderGame;
