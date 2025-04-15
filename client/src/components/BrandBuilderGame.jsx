import React, { useState, useEffect, useRef } from 'react';
import './BrandBuilderGame.css';

// Extended collection of riddles with answers and quotes
const allRiddles = [
  // Marketing and Brand Riddles
  {
    question: "I'm seen by millions but recognized by few. I stand for trust but can't be touched. I'm both a promise and a symbol. What am I?",
    answer: "logo",
    hint: "Companies use it for recognition",
    reward: "A great logo speaks volumes without saying a word. - David Airey"
  },
  {
    question: "The more you share me, the more I grow. But keep me to yourself, and I'll fade away. What am I?",
    answer: "brand",
    hint: "You're building a campaign to increase this",
    reward: "Your brand is what other people say about you when you're not in the room. - Jeff Bezos"
  },
  {
    question: "I connect strangers instantly. I'm both personal and public. Businesses thrive or fall on my words. What am I?",
    answer: "social media",
    hint: "It's where many digital campaigns live",
    reward: "Social media is not just an activity; it's an investment of valuable time and resources. - Sean Gardner"
  },
  {
    question: "I'm invisible yet powerful. I shape decisions without being seen. I'm built over time but destroyed in moments. What am I?",
    answer: "reputation",
    hint: "It's what people think about your company",
    reward: "It takes 20 years to build a reputation and five minutes to ruin it. - Warren Buffett"
  },
  {
    question: "The more specific I am, the more powerful I become. I divide to unite. I separate to connect. What am I?",
    answer: "target audience",
    hint: "You defined this in your campaign form",
    reward: "Everyone is not your customer. - Seth Godin"
  },
  {
    question: "I'm a story that's true. I'm authentic yet crafted. I connect hearts to products. What am I?",
    answer: "brand story",
    hint: "It tells people why you exist",
    reward: "People don't buy what you do; they buy why you do it. - Simon Sinek"
  },
  {
    question: "I convert strangers to friends, friends to customers, and customers to evangelists. What am I?",
    answer: "marketing",
    hint: "It's the field this whole campaign is about",
    reward: "Marketing is no longer about the stuff that you make, but about the stories you tell. - Seth Godin"
  },
  {
    question: "I'm remembered long after the price is forgotten. I create desire beyond function. What am I?",
    answer: "value",
    hint: "It's what your customers really pay for",
    reward: "Your premium price is a way of telling the customer about your product's value. - Rory Sutherland"
  },
  
  // Business Wisdom Riddles
  {
    question: "I grow when shared. I multiply when divided. What am I?",
    answer: "knowledge",
    hint: "It's what makes your team stronger",
    reward: "An investment in knowledge pays the best interest. - Benjamin Franklin"
  },
  {
    question: "I can't be seen or touched, but I'm at the heart of every transaction. I'm easily lost, hard to rebuild. What am I?",
    answer: "trust",
    hint: "Without it, customers won't return",
    reward: "The best way to find out if you can trust somebody is to trust them. - Ernest Hemingway"
  },
  {
    question: "I'm a precious resource that once spent can never be recovered. Everyone has the same amount of me each day. What am I?",
    answer: "time",
    hint: "It's always running out",
    reward: "Time is more valuable than money. You can get more money, but you cannot get more time. - Jim Rohn"
  },
  {
    question: "I'm both a destination and a journey. I'm set, revised, and pursued. The best of me are SMART. What am I?",
    answer: "goal",
    hint: "You're working toward it",
    reward: "A goal without a plan is just a wish. - Antoine de Saint-Exupéry"
  },
  
  // Creative Thinking Riddles
  {
    question: "I can be stormed, I can be bright, I can be shifted or outside the box. What am I?",
    answer: "idea",
    hint: "It's where innovation begins",
    reward: "Ideas are the root of creation. - Ernest Dimnet"
  },
  {
    question: "I'm always present but never seen. I can be caught but never held. I'm often wasted yet essential for success. What am I?",
    answer: "opportunity",
    hint: "You need to seize it when it comes",
    reward: "Opportunities don't happen. You create them. - Chris Grosser"
  },
  {
    question: "I grow stronger when challenged and weaker when comfortable. I determine your highest potential. What am I?",
    answer: "mindset",
    hint: "Fixed or growth? The choice is yours",
    reward: "Whether you think you can or you think you can't, you're right. - Henry Ford"
  },
  {
    question: "I'm free to make, but can cost everything to break. What am I?",
    answer: "promise",
    hint: "Your brand makes this to customers",
    reward: "The most important thing in communication is hearing what isn't said. - Peter Drucker"
  },
  
  // Classic Wisdom Riddles
  {
    question: "I am not what I am, I am not what I seem. Find me where light turns to shadow, where substance turns to dream. What am I?",
    answer: "reflection",
    hint: "Look in the mirror",
    reward: "The real voyage of discovery consists not in seeking new landscapes, but in having new eyes. - Marcel Proust"
  },
  {
    question: "The person who makes it doesn't want it. The person who buys it doesn't use it. The person who uses it doesn't know it. What is it?",
    answer: "coffin",
    hint: "Think about life's end",
    reward: "To fear death is to misunderstand life. - Lao Tzu"
  },
  {
    question: "I fly without wings. I cry without eyes. Wherever I go, darkness follows me. What am I?",
    answer: "cloud",
    hint: "Look up to the sky",
    reward: "No individual raindrop ever considers itself responsible for the flood. - Anonymous"
  },
  {
    question: "The more you take, the more you leave behind. What am I?",
    answer: "footsteps",
    hint: "They mark your journey",
    reward: "The journey of a thousand miles begins with a single step. - Lao Tzu"
  },
  
  // Innovation Riddles
  {
    question: "I bring death to comfort zones and life to progress. I'm feared by many, embraced by few. What am I?",
    answer: "change",
    hint: "It's the only constant",
    reward: "Innovation is the ability to see change as an opportunity - not a threat. - Steve Jobs"
  },
  {
    question: "I connect dots that others don't see. I find patterns in chaos. I leap before looking sometimes. What am I?",
    answer: "creativity",
    hint: "It leads to breakthroughs",
    reward: "Creativity is intelligence having fun. - Albert Einstein"
  },
  {
    question: "I'm first rough, then refined. I start as many and end as one. The best of me solve real problems. What am I?",
    answer: "solution",
    hint: "It resolves the challenge",
    reward: "We cannot solve our problems with the same thinking we used when we created them. - Albert Einstein"
  },
  {
    question: "I'm both a process and an outcome. I transform what exists into what could be. I'm incremental or disruptive. What am I?",
    answer: "innovation",
    hint: "It drives progress",
    reward: "Innovation is taking two things that exist and putting them together in a new way. - Tom Freston"
  },
  
  // Leadership Riddles
  {
    question: "I elevate others above myself. I am found in service rather than command. My true strength is making others strong. What am I?",
    answer: "leadership",
    hint: "It's about influence, not authority",
    reward: "The greatest leader is not necessarily the one who does the greatest things. He is the one that gets people to do the greatest things. - Ronald Reagan"
  },
  {
    question: "I'm built through consistent small actions. I reveal true priorities better than words. I'm contagious through example. What am I?",
    answer: "culture",
    hint: "It defines organizational behavior",
    reward: "Culture eats strategy for breakfast. - Peter Drucker"
  },
  {
    question: "I require vulnerability. I crumble with ego. I flourish in openness. The wisest seek me daily. What am I?",
    answer: "growth",
    hint: "It comes from learning",
    reward: "If we don't challenge ourselves, we don't change ourselves. - Anonymous"
  },
  {
    question: "I'm whispered in hallways and spread like wildfire. I define reputations. I can heal or harm. What am I?",
    answer: "word of mouth",
    hint: "It's the most powerful marketing",
    reward: "The best advertising is done by satisfied customers. - Philip Kotler"
  },
  
  // Customer-Focused Riddles
  {
    question: "I'm the space between expectation and reality. When positive, I create loyalty. When negative, I destroy trust. What am I?",
    answer: "experience",
    hint: "It's what customers remember most",
    reward: "Every touchpoint is an opportunity to exceed expectations. - Anonymous"
  },
  {
    question: "I reveal truth better than words. I'm honest even when dishonest. I speak volumes through silence. What am I?",
    answer: "behavior",
    hint: "Actions speak louder than...",
    reward: "Your actions speak so loudly, I cannot hear what you are saying. - Ralph Waldo Emerson"
  },
  {
    question: "I transform transactions into relationships. I'm remembered long after price is forgotten. I determine lifetime value. What am I?",
    answer: "service",
    hint: "It distinguishes great brands",
    reward: "The goal as a company is to have customer service that is not just the best but legendary. - Sam Walton"
  }
];

// Shuffle array function to randomize riddles
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Get a subset of riddles to use
const getRandomRiddles = (count) => {
  const shuffled = shuffleArray([...allRiddles]);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

function BrandBuilderGame({ onClose, campaignCreated = false }) {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameScore, setGameScore] = useState(0);
  const [currentRiddleIndex, setCurrentRiddleIndex] = useState(0);
  const [riddles, setRiddles] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState({ message: '', isCorrect: false, showReward: false });
  const [showHint, setShowHint] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60); // Increased to 60 seconds
  const [animateInput, setAnimateInput] = useState(false);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [difficulty, setDifficulty] = useState('medium'); // 'easy', 'medium', 'hard'
  const [acceptableAnswers, setAcceptableAnswers] = useState([]);
  
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  
  // Initialize game with riddles
  useEffect(() => {
    // Get 15 random riddles
    setRiddles(getRandomRiddles(15));
  }, []);
  
  // Watch for campaign creation completion
  useEffect(() => {
    if (campaignCreated) {
      // Campaign is ready - pass the final score back to parent
      handleGameEnd();
    }
  }, [campaignCreated]);
  
  // When game starts, focus on input field
  useEffect(() => {
    if (gameStarted && inputRef.current) {
      inputRef.current.focus();
    }
  }, [gameStarted, currentRiddleIndex]);
  
  // Set acceptable answers for current riddle (includes variations)
  useEffect(() => {
    if (riddles.length > 0 && currentRiddleIndex < riddles.length) {
      const currentRiddle = riddles[currentRiddleIndex];
      const mainAnswer = currentRiddle.answer.toLowerCase();
      
      // Create variations of the answer (plurals, with 'a' or 'the', etc.)
      const variations = [
        mainAnswer,
        `a ${mainAnswer}`,
        `the ${mainAnswer}`,
        `${mainAnswer}s`,
        mainAnswer.replace(/\s+/g, '') // Remove spaces
      ];
      
      setAcceptableAnswers(variations);
    }
  }, [currentRiddleIndex, riddles]);
  
  // Timer countdown effect
  useEffect(() => {
    if (!gameStarted || feedback.showReward) return;
    
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          // Time's up for this riddle
          clearInterval(timerRef.current);
          setStreak(0);
          setFeedback({
            message: `Time's up! The answer was "${riddles[currentRiddleIndex].answer}"`,
            isCorrect: false,
            showReward: false
          });
          return 60; // Reset timer for next riddle
        }
        return prevTime - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerRef.current);
  }, [gameStarted, currentRiddleIndex, feedback.showReward, riddles]);
  
  // Start the game
  const handleStartGame = () => {
    setGameStarted(true);
    setTimeLeft(60);
  };
  
  // Game end handler
  const handleGameEnd = () => {
    // Clean up
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // Return final score to parent component
    onClose(gameScore);
  };
  
  // Check user's answer
  const checkAnswer = () => {
    if (!userAnswer.trim()) {
      setAnimateInput(true);
      setTimeout(() => setAnimateInput(false), 500);
      return;
    }
    
    // Clean up answer for comparison (lowercase, trim whitespace)
    const userAnswerClean = userAnswer.trim().toLowerCase();
    
    // Check if answer is among acceptable answers
    const isCorrect = acceptableAnswers.some(answer => {
      // Different difficulty levels have different matching strictness
      if (difficulty === 'easy') {
        // In easy mode, accept partial matches
        return answer.includes(userAnswerClean) || userAnswerClean.includes(answer);
      } else if (difficulty === 'medium') {
        // In medium mode, accept if user answer contains complete answer or vice versa
        return answer.includes(userAnswerClean) || userAnswerClean.includes(answer);
      } else {
        // In hard mode, require exact match
        return userAnswerClean === answer;
      }
    });
    
    if (isCorrect) {
      // Stop the timer
      clearInterval(timerRef.current);
      
      // Calculate points (more points for faster answers and if no hint was used)
      const basePoints = 100;
      const timeBonus = Math.floor(timeLeft * 1.5);
      const streakBonus = streak * 20;
      const hintPenalty = hintUsed ? 50 : 0;
      const pointsEarned = basePoints + timeBonus + streakBonus - hintPenalty;
      
      // Update score and streak
      setGameScore(prev => prev + pointsEarned);
      setStreak(prev => prev + 1);
      setTotalCorrect(prev => prev + 1);
      
      // Show success feedback with reward
      setFeedback({
        message: `Correct! +${pointsEarned} points${streak > 0 ? ` (${streak}x streak!)` : ''}`,
        isCorrect: true,
        showReward: true
      });
    } else {
      // Wrong answer
      setStreak(0);
      setFeedback({
        message: `Not quite right. Try again!`,
        isCorrect: false,
        showReward: false
      });
      
      // Shake the input field
      setAnimateInput(true);
      setTimeout(() => setAnimateInput(false), 500);
    }
  };
  
  // Handle showing hint
  const handleShowHint = () => {
    setShowHint(true);
    setHintUsed(true);
  };
  
  // Move to next riddle
  const handleNextRiddle = () => {
    const nextIndex = currentRiddleIndex + 1;
    
    // Reset states for next riddle
    setUserAnswer('');
    setFeedback({ message: '', isCorrect: false, showReward: false });
    setShowHint(false);
    setHintUsed(false);
    setTimeLeft(60);
    
    if (nextIndex < riddles.length) {
      setCurrentRiddleIndex(nextIndex);
    } else {
      // If we've gone through all riddles, start over with reshuffled riddles
      setRiddles(getRandomRiddles(15));
      setCurrentRiddleIndex(0);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    checkAnswer();
  };
  
  // Handle input change
  const handleInputChange = (e) => {
    setUserAnswer(e.target.value);
    // Reset feedback when user starts typing a new answer
    if (feedback.message && !feedback.showReward) {
      setFeedback({ message: '', isCorrect: false, showReward: false });
    }
  };
  
  // Handle difficulty change
  const handleDifficultyChange = (level) => {
    setDifficulty(level);
  };
  
  return (
    <div className="brand-riddle-game">
      {!gameStarted ? (
        // Game intro screen
        <div className="game-intro">
          <h2>Brand Riddles Challenge</h2>
          <p>Solve thoughtful riddles while your campaign is being created! Earn points and discover inspiring quotes.</p>
          
          <div className="game-rules">
            <div className="rule-item">
              <div className="rule-icon">⏱️</div>
              <p>60 seconds per riddle</p>
            </div>
            <div className="rule-item">
              <div className="rule-icon">🔄</div>
              <p>Build streaks for bonus points</p>
            </div>
            <div className="rule-item">
              <div className="rule-icon">💡</div>
              <p>Use hints if you're stuck</p>
            </div>
          </div>
          
          <div className="difficulty-selector">
            <h3>Select Difficulty:</h3>
            <div className="difficulty-options">
              <button 
                className={`difficulty-btn ${difficulty === 'easy' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('easy')}
              >
                Easy
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'medium' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('medium')}
              >
                Medium
              </button>
              <button 
                className={`difficulty-btn ${difficulty === 'hard' ? 'active' : ''}`}
                onClick={() => handleDifficultyChange('hard')}
              >
                Hard
              </button>
            </div>
          </div>
          
          <button className="start-game-btn" onClick={handleStartGame}>
            Start Playing
          </button>
        </div>
      ) : (
        // Main game screen
        <div className="game-content">
          <div className="game-header">
            <h2>Brand Riddles</h2>
            <div className="game-stats">
              <div className="stat-item">
                <span className="stat-value">{gameScore}</span>
                <span className="stat-label">Score</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{currentRiddleIndex + 1}/{riddles.length}</span>
                <span className="stat-label">Riddle</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{totalCorrect}</span>
                <span className="stat-label">Solved</span>
              </div>
              {streak > 1 && (
                <div className="stat-item streak">
                  <span className="stat-value">{streak}x</span>
                  <span className="stat-label">Streak</span>
                </div>
              )}
            </div>
          </div>
          
          {riddles.length > 0 && (
            <div className="riddle-container">
              {/* Timer bar */}
              <div className="timer-container">
                <div 
                  className={`timer-bar ${timeLeft < 10 ? 'danger' : timeLeft < 30 ? 'warning' : ''}`} 
                  style={{ width: `${(timeLeft / 60) * 100}%` }}
                ></div>
                <span className="timer-text">{timeLeft}s</span>
              </div>
              
              {/* Current riddle */}
              <div className="riddle-question">
                <p>{riddles[currentRiddleIndex].question}</p>
              </div>
              
              {/* Answer form */}
              {!feedback.showReward ? (
                <form onSubmit={handleSubmit} className="answer-form">
                  <div className={`input-container ${animateInput ? 'shake' : ''}`}>
                    <input
                      type="text"
                      ref={inputRef}
                      value={userAnswer}
                      onChange={handleInputChange}
                      placeholder="Your answer..."
                      className={feedback.isCorrect ? 'correct' : feedback.message ? 'incorrect' : ''}
                      autoComplete="off"
                    />
                    <button type="submit" className="submit-btn-1">Submit</button>
                  </div>
                  
                  {/* Hint button */}
                  {!showHint && (
                    <button 
                      type="button" 
                      onClick={handleShowHint} 
                      className="hint-btn"
                    >
                      Need a hint? (Point penalty)
                    </button>
                  )}
                  
                  {/* Show hint if requested */}
                  {showHint && (
                    <div className="hint-box">
                      <span className="hint-label">Hint:</span> {riddles[currentRiddleIndex].hint}
                    </div>
                  )}
                  
                  {/* Feedback message */}
                  {feedback.message && !feedback.showReward && (
                    <div className={`feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
                      {feedback.message}
                    </div>
                  )}
                </form>
              ) : (
                // Show reward quote when answered correctly
                <div className="reward-container">
                  <div className="reward-header">
                    <div className="reward-icon">🏆</div>
                    <h3>Wisdom Unlocked!</h3>
                  </div>
                  <div className="reward-quote">
                    <p>"{riddles[currentRiddleIndex].reward}"</p>
                  </div>
                  <button onClick={handleNextRiddle} className="next-btn">
                    Next Riddle →
                  </button>
                </div>
              )}
            </div>
          )}
          
          <div className="campaign-progress">
            <div className="progress-label">Campaign Creation:</div>
            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
            <div className="progress-text">Building your brand campaign...</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BrandBuilderGame;