import React, { useState, useEffect, useRef } from 'react';
import './AiChatbot.css';

// Use the environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function AiChatbot() {
  const [open, setOpen] = useState(false); // Toggles chat window
  const [messages, setMessages] = useState([]); // Array of {role, content}
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef(null);

  // On mount, set initial bot message
  useEffect(() => {
    setMessages([{ role: 'bot', content: 'Hello!! How are you today?' }]);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const toggleOpen = () => {
    setOpen(prev => !prev);
  };

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const messageToSend = userInput;
    // Add user message to state
    const newMsg = { role: 'user', content: messageToSend };
    setMessages(prev => [...prev, newMsg]);
    setUserInput('');

    try {
      // Send message to backend using API_BASE_URL from env
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: messageToSend }),
      });
      const data = await res.json();

      if (data.reply) {
        setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
      } else {
        setMessages(prev => [...prev, { role: 'bot', content: 'No reply received.' }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, { role: 'bot', content: 'Oops, error!' }]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!open && (
        <div className="ai-chat-icon bounce-pulse" onClick={toggleOpen} title="Open Chatbot">
          <img
            src="https://cdn-icons-png.flaticon.com/512/4712/4712035.png"
            alt="Chatbot"
          />
        </div>
      )}

      {open && (
        <div className="ai-chat-window gradient-shift slide-in-right">
          <div className="chat-window-header">
            <h4>Friendly Bot</h4>
            <button onClick={toggleOpen}>✕</button>
          </div>

          <div className="chat-window-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role === 'bot' ? 'bot' : 'user'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="chat-window-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}
    </>
  );
}

export default AiChatbot;
