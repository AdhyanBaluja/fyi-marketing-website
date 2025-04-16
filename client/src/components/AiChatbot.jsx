import React, { useState, useEffect, useRef } from 'react';
import './AiChatbot.css';
import ChatbotIcon from '../assets/FuturisticChatbotIcon.svg';

// Use the environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function AiChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [iconHover, setIconHover] = useState(false);
  const [sendButtonHover, setSendButtonHover] = useState(false);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Sound effects
  const notificationSound = new Audio('/notification-sound.mp3');
  const sendSound = new Audio('/send-sound.mp3');
  
  // On mount, set initial bot message with typing animation
  useEffect(() => {
    setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setMessages([{ 
          role: 'bot', 
          content: 'Hello! How can I assist you today?',
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 1500);
    }, 500);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 600); // After animation completes
    }
  }, [open]);

  const toggleOpen = () => {
    if (!open) {
      // Play notification sound when opening
      try {
        notificationSound.volume = 0.5;
        notificationSound.play();
      } catch (e) {
        console.log('Audio playback error:', e);
      }
    }
    setOpen(prev => !prev);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    
    const messageToSend = userInput;
    
    // Try to play send sound
    try {
      sendSound.volume = 0.3;
      sendSound.play();
    } catch (e) {
      console.log('Audio playback error:', e);
    }
    
    // Add user message to state
    const newMsg = { 
      role: 'user', 
      content: messageToSend,
      timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    };
    setMessages(prev => [...prev, newMsg]);
    setUserInput('');

    // Show typing indicator
    setIsTyping(true);

    try {
      // Send message to backend
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: messageToSend }),
      });
      const data = await res.json();

      // Random delay between 700-2000ms to simulate thinking/typing
      const replyDelay = 700 + Math.random() * 1300;
      
      setTimeout(() => {
        setIsTyping(false);
        if (data.reply) {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }]);
        } else {
          setMessages(prev => [...prev, { 
            role: 'bot', 
            content: "I'm sorry, I couldn't process that request. Could you try again?",
            timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
          }]);
        }
        
        // Try to play notification sound
        try {
          notificationSound.volume = 0.3;
          notificationSound.play();
        } catch (e) {
          console.log('Audio playback error:', e);
        }
      }, replyDelay);
      
    } catch (err) {
      console.error('Chat error:', err);
      setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, { 
          role: 'bot', 
          content: "I'm having trouble connecting right now. Please try again in a moment.",
          timestamp: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        }]);
      }, 800);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="futuristic-chatbot-container">
      {!open && (
  <div 
    className={`futuristic-chat-icon ${iconHover ? 'icon-hover' : ''}`}
    onClick={toggleOpen} 
    onMouseEnter={() => setIconHover(true)}
    onMouseLeave={() => setIconHover(false)}
    title="Open Assistant"
  >
    <div className="icon-pulse-ring"></div>
    <div className="icon-inner">
      <img src={ChatbotIcon} alt="Chat" className="chat-bot-icon-svg" />
    </div>
  </div>
)}

      {open && (
        <div className="futuristic-chat-window neo-brutalism-card">
          <div className="futuristic-chat-header">
            <div className="header-left">
              <div className="header-avatar">
                <div className="avatar-circle">
                  <div className="avatar-face">
                    <div className="avatar-eye"></div>
                    <div className="avatar-eye"></div>
                    <div className="avatar-smile"></div>
                  </div>
                </div>
              </div>
              <div className="header-info">
                <h4>Smart Assistant</h4>
                <div className="status-indicator">
                  <span className="status-dot"></span>
                  <span className="status-text">Online</span>
                </div>
              </div>
            </div>
            <div className="header-actions">
              <button className="minimize-btn" onClick={toggleOpen}>
                <span className="minimize-icon"></span>
              </button>
              <button className="close-btn" onClick={toggleOpen}>
                <span className="close-icon">✕</span>
              </button>
            </div>
          </div>

          <div className="futuristic-chat-messages">
            <div className="messages-date-indicator">
              <span>Today</span>
            </div>
            
            {messages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`futuristic-chat-bubble ${msg.role === 'bot' ? 'bot-bubble' : 'user-bubble'}`}
              >
                {msg.role === 'bot' && (
                  <div className="bubble-avatar">
                    <div className="avatar-mini-circle">
                      <div className="avatar-mini-face"></div>
                    </div>
                  </div>
                )}
                <div className="bubble-content">
                  <div className="bubble-text">{msg.content}</div>
                  <div className="bubble-timestamp">{msg.timestamp}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="futuristic-chat-bubble bot-bubble">
                <div className="bubble-avatar">
                  <div className="avatar-mini-circle">
                    <div className="avatar-mini-face"></div>
                  </div>
                </div>
                <div className="bubble-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          <div className="futuristic-chat-input">
            <div className="input-container">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type your message..."
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button 
                className={`send-button ${sendButtonHover ? 'send-hover' : ''} ${userInput.trim() ? 'send-active' : ''}`}
                onClick={handleSend}
                onMouseEnter={() => setSendButtonHover(true)}
                onMouseLeave={() => setSendButtonHover(false)}
                disabled={!userInput.trim()}
              >
                <svg viewBox="0 0 24 24" className="send-icon">
                  <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                </svg>
              </button>
            </div>
            <div className="input-features">
              <div className="feature-hint">Press Enter to send</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiChatbot;