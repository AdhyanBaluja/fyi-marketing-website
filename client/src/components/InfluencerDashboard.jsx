import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './InfluencerDashboard.module.css';
import brandLogo from '../assets/bird_2.jpg';
import influencerBack from '../assets/InfluencerBack.png';

// Environment Variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// Enhanced theme options with color schemes
const themeOptions = [
  {
    name: "Cosmic Blue",
    id: "cosmic-blue",
    colors: {
      primary: "#FF7D00",
      secondary: "#1a4870",
      background: "linear-gradient(135deg, #001524 0%, #00294d 100%)",
      cardBg: "rgba(16, 39, 57, 0.3)",
      text: "#e0e0e0"
    }
  },
  {
    name: "Royal Purple",
    id: "royal-purple",
    colors: {
      primary: "#9D4EDD",
      secondary: "#3A0CA3",
      background: "linear-gradient(135deg, #240046 0%, #3C096C 100%)",
      cardBg: "rgba(58, 12, 163, 0.3)",
      text: "#F8F9FA"
    }
  },
  {
    name: "Emerald Forest",
    id: "emerald-forest",
    colors: {
      primary: "#57CC99",
      secondary: "#38A3A5",
      background: "linear-gradient(135deg, #22577A 0%, #38A3A5 100%)",
      cardBg: "rgba(34, 87, 122, 0.3)",
      text: "#F8F9FA"
    }
  },
  {
    name: "Sunset Gold",
    id: "sunset-gold",
    colors: {
      primary: "#FFB627",
      secondary: "#FF7B00",
      background: "linear-gradient(135deg, #2A0944 0%, #3B185F 100%)",
      cardBg: "rgba(42, 9, 68, 0.3)",
      text: "#F8F9FA"
    }
  },
  {
    name: "Dark Elegance",
    id: "dark-elegance",
    colors: {
      primary: "#E63946",
      secondary: "#457B9D",
      background: "linear-gradient(135deg, #1D3557 0%, #2C4875 100%)",
      cardBg: "rgba(29, 53, 87, 0.3)",
      text: "#F1FAEE"
    }
  }
];

// Enhanced Cosmic Nebula Loader Component
function CosmicNebulaLoader() {
  const [loadingText, setLoadingText] = useState("Preparing Your Dashboard");
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const textInterval = setInterval(() => {
      setDotCount((prev) => (prev < 3 ? prev + 1 : 0));
    }, 500);

    return () => clearInterval(textInterval);
  }, []);

  return (
    <div className={styles["cosmic-loader-container"]}>
      <div className={styles["nebula-background"]}></div>
      <div className={styles["cosmic-loader"]}>
        <div className={styles["orbit-container"]}>
          <div className={`${styles["orbit"]} ${styles["orbit-1"]}`}>
            <div className={styles["planet"]}></div>
          </div>
          <div className={`${styles["orbit"]} ${styles["orbit-2"]}`}>
            <div className={styles["planet"]}></div>
          </div>
          <div className={`${styles["orbit"]} ${styles["orbit-3"]}`}>
            <div className={styles["planet"]}></div>
          </div>
        </div>
        <div className={styles["star-field"]}>
          {[...Array(30)].map((_, i) => (
            <div key={i} className={styles["star"]} style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              opacity: Math.random() * 0.7 + 0.3
            }}></div>
          ))}
        </div>
        <div className={styles["loading-text"]}>
          {`${loadingText}${'.'.repeat(dotCount)}`}
        </div>
      </div>
    </div>
  );
}

// Enhanced Notification Toast Component with animations
function NotificationToast({ message, type, onClose, visible }) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [visible, onClose]);

  return (
    <div 
      className={`${styles["toast-notification"]} ${styles[`toast-${type}`]} ${visible ? styles["toast-visible"] : ""}`}
      onClick={onClose}
    >
      <div className={styles["toast-icon"]}>
        {type === "success" && "✓"}
        {type === "error" && "✗"}
        {type === "info" && "ⓘ"}
      </div>
      <div className={styles["toast-message"]}>{message}</div>
      <button className={styles["toast-close"]}>×</button>
    </div>
  );
}

// Enhanced Theme Selector with advanced motion effects
function ThemeSelector({ currentTheme, onThemeChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <div className={styles["theme-selector-container"]} ref={dropdownRef}>
      <button 
        className={`${styles["theme-selector-button"]} ${isOpen ? styles["theme-button-active"] : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span 
          className={styles["color-circle"]} 
          style={{ background: themeOptions.find(t => t.id === currentTheme)?.colors.primary }}
        ></span>
        <span>Theme</span>
      </button>
      
      {isOpen && (
        <div className={styles["theme-dropdown"]}>
          {themeOptions.map((theme, index) => (
            <div 
              key={theme.id}
              className={`${styles["theme-option"]} ${currentTheme === theme.id ? styles["active-theme"] : ""}`}
              onClick={() => {
                onThemeChange(theme.id);
                setIsOpen(false);
              }}
              style={{
                animationDelay: `${index * 0.05}s`
              }}
            >
              <div className={styles["theme-preview"]}>
                <div 
                  className={styles["theme-color-primary"]} 
                  style={{ background: theme.colors.primary }}
                ></div>
                <div 
                  className={styles["theme-color-secondary"]} 
                  style={{ background: theme.colors.secondary }}
                ></div>
              </div>
              <span>{theme.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Enhanced Animated Background with responsive floating shapes
function AnimatedBackground() {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const shapesCount = dimensions.width < 768 ? 8 : 15;

  return (
    <div className={styles["animated-background"]}>
      <div className={styles["floating-shapes-container"]}>
        {Array(shapesCount).fill().map((_, i) => {
          const size = Math.random() * (dimensions.width < 768 ? 40 : 60) + 20;
          return (
            <div 
              key={i}
              className={styles["floating-shape"]}
              style={{
                width: `${size}px`,
                height: `${size}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 15 + 15}s`,
                animationDelay: `${Math.random() * 5}s`,
                opacity: Math.random() * 0.5 + 0.1,
                transform: `rotate(${Math.random() * 360}deg)`
              }}
            ></div>
          );
        })}
      </div>
      <div className={styles["glow-overlay"]}></div>
    </div>
  );
}

// Enhanced Section Underline for better visual separation
function SectionUnderline({ width = "100px" }) {
  return <div className={styles['section-underline']} style={{ width }}></div>;
}

// Enhanced Active Campaign Card with interactive animations
function ActiveCampaignCard({ campaign, onUpdateProgress, onRefresh }) {
  const cardRef = useRef(null);
  const [tempProgress, setTempProgress] = useState(campaign.progress || 0);
  const token = localStorage.getItem('token');
  const realId = campaign.campaignId?._id || campaign._id;
  const realCampaign = campaign.campaignId || campaign;
  const brandName = realCampaign.brandName || 'Unknown Brand';
  const campaignName = realCampaign.name || 'Untitled';

  const [tasks, setTasks] = useState(campaign.tasks || []);
  const [newTaskText, setNewTaskText] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setTasks(campaign.tasks || []);
  }, [campaign.tasks]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${realId}/tasks`,
        { text: newTaskText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data.tasks);
      setNewTaskText('');
      showToast('Task added successfully!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error adding task:', err);
      showToast('Failed to add task. Please try again.', 'error');
    }
  };

  const handleRemoveTask = async (taskId) => {
    try {
      const res = await axios.delete(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${realId}/tasks/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(res.data.tasks);
      showToast('Task removed successfully!', 'success');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error removing task:', err);
      showToast('Failed to remove task. Please try again.', 'error');
    }
  };

  const handleSaveProgress = () => {
    onUpdateProgress(realId, tempProgress);
    showToast('Progress updated successfully!', 'success');
  };

  const handleLeave = async () => {
    const confirmed = window.confirm(`Are you sure you want to leave "${campaignName}"?`);
    if (!confirmed) return;
    try {
      await axios.delete(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${realId}/leave`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`You left the campaign "${campaignName}".`, 'info');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Error leaving campaign:', err);
      showToast('Failed to leave the campaign. Please try again.', 'error');
    }
  };

  return (
    <div
      ref={cardRef}
      className={`${styles['campaign-card']} ${styles['neo-card']} ${isExpanded ? styles['expanded'] : ''} ${isVisible ? styles['visible'] : ''} ${isHovered ? styles['card-hovered'] : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        animationDelay: '0.3s'
      }}
    >
      <NotificationToast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={hideToast} 
      />
      
      <div className={styles['card-glare']}></div>
      
      <div className={styles['card-header']}>
        <div className={styles['brand-info']}>
          <div className={styles['logo-wrapper']}>
            <img src={brandLogo} alt={brandName} className={styles['campaign-logo']} />
            <div className={styles['logo-shimmer']}></div>
          </div>
          <h3 className={styles['campaign-title']}>
            {campaignName}
            <div className={styles['title-underline']}>
              <div className={styles['underline-shine']}></div>
            </div>
          </h3>
        </div>
        <div className={styles['expand-indicator']}>
          <span>{isExpanded ? '−' : '+'}</span>
        </div>
      </div>
      
      <div className={styles['card-content']}>
        <div className={styles['campaign-info']}>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Brand:</span>
            <span className={styles['info-value']}>{brandName}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Budget:</span>
            <span className={styles['info-value']}>{campaign.budget || realCampaign.budget || 'N/A'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Platform:</span>
            <span className={styles['info-value']}>{campaign.platform || 'N/A'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Target:</span>
            <span className={styles['info-value']}>{realCampaign.targetAudience || 'N/A'}</span>
          </div>
        </div>

        <div className={styles['progress-container']} onClick={(e) => e.stopPropagation()}>
          <div className={styles['progress-label']}>
            <span>Progress</span>
            <span>{campaign.progress || 0}%</span>
          </div>
          
          <div className={styles['progress-bar']}>
            <div 
              className={styles['progress-fill']} 
              style={{ width: `${campaign.progress || 0}%` }}
            ></div>
            <div className={styles['progress-glow']}></div>
          </div>
          
          {/* Progress Update Controls */}
          <div className={styles['progress-update']} onClick={(e) => e.stopPropagation()}>
            <input
              type="range"
              min="0"
              max="100"
              value={tempProgress}
              onChange={(e) => setTempProgress(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={styles['range-slider']}
            />
            <span className={styles['range-value']}>{tempProgress}%</span>
            <button 
              className={styles['save-progress-btn']} 
              onClick={(e) => {
                e.stopPropagation();
                handleSaveProgress();
              }}
            >
              Update
            </button>
          </div>
        </div>

        {/* Tasks Section */}
        <div 
          className={`${styles['tasks-section']} ${isExpanded ? styles['tasks-visible'] : ''}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles['section-header']}>
            <h4>My To-Do List</h4>
            <div className={styles['tasks-counter']}>{tasks.length} tasks</div>
          </div>
          
          <ul className={styles['task-list']}>
            {tasks.map((task, index) => (
              <li 
                key={task._id} 
                className={styles['task-item']}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span>{task.text}</span>
                <button 
                  className={styles['remove-task-btn']} 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveTask(task._id);
                  }}
                >
                  <span className={styles['remove-icon']}>×</span>
                </button>
              </li>
            ))}
          </ul>
          
          <form 
            onSubmit={(e) => {
              e.stopPropagation();
              handleAddTask(e);
            }} 
            className={styles['add-task-form']}
          >
            <input
              type="text"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
            <button 
              type="submit" 
              className={styles['add-task-btn']}
              onClick={(e) => e.stopPropagation()}
            >
              <span>+</span>
            </button>
          </form>
        </div>
        
        {/* Leave Campaign Button */}
        {campaign.status === 'active' && (
          <div className={styles['leave-campaign-container']}>
            <button 
              className={styles['leave-btn']} 
              onClick={(e) => {
                e.stopPropagation();
                handleLeave();
              }}
            >
              Leave Campaign
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Enhanced All Campaign Card with hover effects
function AllCampaignCard({ campaign, influencerId, onApplied, appliedCampaignIds, activeCampaignIds }) {
  const cardRef = useRef(null);
  const brandName = campaign.brandName || 'Unknown Brand';
  const token = localStorage.getItem('token');
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isApplied = appliedCampaignIds.has(campaign._id);
  const isActive = activeCampaignIds.has(campaign._id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleApply = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/campaigns/${campaign._id}/apply`,
        { influencerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Successfully applied to campaign!', 'success');
      if (onApplied) onApplied();
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        showToast(`Failed to apply: ${error.response.data.error}`, 'error');
      } else {
        console.error('Error applying to campaign:', error);
        showToast('Failed to apply. Please try again.', 'error');
      }
    }
  };

  let buttonLabel = "Apply";
  let buttonStatus = "";
  
  if (isActive) {
    buttonLabel = "Active";
    buttonStatus = "active";
  } else if (isApplied) {
    buttonLabel = "Pending";
    buttonStatus = "pending";
  }

  return (
    <div
      ref={cardRef}
      className={`${styles['big-campaign-card']} ${styles['neo-card']} ${isVisible ? styles['visible'] : ''} ${isHovered ? styles['card-hovered'] : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <NotificationToast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={hideToast} 
      />
      
      <div className={styles['card-glare']}></div>
      
      <div className={styles['big-card-left']}>
        <div className={styles['logo-wrapper']}>
          <img src={brandLogo} alt={brandName} className={`${styles['campaign-logo']} ${styles['big-logo']}`} />
          <div className={styles['logo-shimmer']}></div>
        </div>
        <div className={styles['campaign-info']}>
          <h3 className={styles['campaign-title']}>
            {campaign.name || 'Untitled Campaign'}
            <div className={styles['title-underline']}>
              <div className={styles['underline-shine']}></div>
            </div>
          </h3>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Brand:</span>
            <span className={styles['info-value']}>{brandName}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Budget:</span>
            <span className={styles['info-value']}>{campaign.budget || 'N/A'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Target:</span>
            <span className={styles['info-value']}>{campaign.targetAudience || 'N/A'}</span>
          </div>
        </div>
      </div>
      
      <div className={styles['big-card-right']}>
        <button 
          className={`${styles['apply-btn']} ${buttonStatus ? styles[`apply-btn-${buttonStatus}`] : ''}`} 
          onClick={handleApply}
          disabled={isActive || isApplied}
        >
          <span className={styles['btn-label']}>{buttonLabel}</span>
          {!isActive && !isApplied && (
            <span className={styles['btn-icon']}>→</span>
          )}
        </button>
      </div>
    </div>
  );
}

// Enhanced Flipcard for Brand Requests
function BrandRequestCard({ request, onAccept }) {
  const cardRef = useRef(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      if (cardRef.current) {
        observer.unobserve(cardRef.current);
      }
    };
  }, []);

  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleAcceptClick = (e) => {
    e.stopPropagation();
    onAccept(request._id);
    showToast('Request accepted successfully!', 'success');
  };

  return (
    <div
      ref={cardRef}
      className={`${styles['brand-request-card']} ${styles['neo-card']} ${styles['flip-card']} ${isFlipped ? styles['is-flipped'] : ''} ${isVisible ? styles['visible'] : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <NotificationToast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={hideToast} 
      />
      
      <div className={styles['card-inner']}>
        {/* Front of card */}
        <div className={styles['card-front']}>
          <div className={styles['card-glare']}></div>
          <h3 className={styles['request-title']}>
            {request.campaignName}
            <div className={styles['title-underline']}>
              <div className={styles['underline-shine']}></div>
            </div>
          </h3>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Brand:</span>
            <span className={styles['info-value']}>{request.brandName || 'Unknown Brand'}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Budget:</span>
            <span className={styles['info-value']}>{request.budget || 'N/A'}</span>
          </div>
          <div className={styles['request-status']}>
            <span className={`${styles['status-indicator']} ${styles[`status-${request.status}`]}`}></span>
            <span className={styles['status-text']}>{request.status}</span>
          </div>
          <div className={styles['card-footer']}>
            <div className={styles['flip-indicator']}>Click to view details</div>
          </div>
        </div>
        
        {/* Back of card */}
        <div className={styles['card-back']}>
          <div className={styles['card-glare']}></div>
          <h3 className={styles['request-title']}>
            Request Details
            <div className={styles['title-underline']}>
              <div className={styles['underline-shine']}></div>
            </div>
          </h3>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Campaign:</span>
            <span className={styles['info-value']}>{request.campaignName}</span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Received:</span>
            <span className={styles['info-value']}>
              {new Date(request.createdAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
          <div className={styles['info-row']}>
            <span className={styles['info-label']}>Platform:</span>
            <span className={styles['info-value']}>
              {request.platform || 'Not specified'}
            </span>
          </div>
          
          {request.status === 'pending' && (
            <button 
              className={styles['accept-btn']} 
              onClick={handleAcceptClick}
            >
              Accept Request
            </button>
          )}
          
          <div className={styles['card-footer']}>
            <div className={styles['flip-indicator']}>Click to flip back</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Enhanced Profile Avatar Component with interactive elements
function ProfileAvatar({ imageUrl, altImage, name }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className={styles['profile-avatar-container']}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`${styles['avatar-frame']} ${isHovered ? styles['avatar-hovered'] : ''}`}>
        <img 
          src={imageUrl || altImage} 
          alt={name || "Profile"} 
          className={styles['profile-avatar']} 
        />
        <div className={styles['avatar-glow']}></div>
      </div>
      <div className={styles['avatar-name']}>{name}</div>
    </div>
  );
}

// Enhanced Empty State Component with animations
function EmptyState({ icon, message, tip }) {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-icon']}>{icon}</div>
      <p className={styles['empty-message']}>{message}</p>
      {tip && <p className={styles['empty-tip']}>{tip}</p>}
    </div>
  );
}

// Enhanced Animated Counter component for dashboard stats
function AnimatedCounter({ value, label, icon, index }) {
  const [count, setCount] = useState(0);
  const counterRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!isVisible) return;
    
    let start = 0;
    const end = parseInt(value);
    const duration = 1500;
    const increment = end / (duration / 16); // 60fps
    
    const timer = setInterval(() => {
      start += increment;
      if (start > end) start = end;
      setCount(Math.floor(start));
      if (start === end) clearInterval(timer);
    }, 16);
    
    return () => clearInterval(timer);
  }, [value, isVisible]);
  
  return (
    <div 
      ref={counterRef} 
      className={`${styles['stat-card']} ${isVisible ? styles['stat-visible'] : ''}`}
      style={{ 
        '--i': index,
        animationDelay: `${index * 0.1}s`
      }}
    >
      <div className={styles['stat-icon']}>{icon}</div>
      <div className={styles['stat-value']}>{count}</div>
      <div className={styles['stat-label']}>{label}</div>
    </div>
  );
}

// Main Dashboard Component
function InfluencerDashboard() {
  const navigate = useNavigate();
  const [activeTheme, setActiveTheme] = useState("cosmic-blue");
  const pageRef = useRef(null);

  // State for influencer profile and editing
  const initialProfile = {
    _id: '',
    profileImage: '',
    name: 'Voguish Affair',
    experience: 1,
    numFollowers: 80000,
    influencerLocation: 'London',
    majorityAudienceLocation: 'United Kingdom',
    audienceAgeGroup: '25-45',
    audienceGenderDemographics: 'Female',
    gender: 'Female',
    industries: ['Fashion', 'Fitness', 'Food'],
    nichePlatforms: ['Instagram', 'Facebook'],
  };

  const [influencerInfo, setInfluencerInfo] = useState(initialProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [tempInfo, setTempInfo] = useState({ ...initialProfile });
  const [brandRequests, setBrandRequests] = useState([]);
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [allCampaigns, setAllCampaigns] = useState([]);
  const [appliedCampaignIds, setAppliedCampaignIds] = useState(new Set());
  const [activeCampaignIds, setActiveCampaignIds] = useState(new Set());
  const [showProfileBanner, setShowProfileBanner] = useState(true);
  const [isMobileNavActive, setIsMobileNavActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Toast notification state
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  
  // Dashboard stats for animated counters
  const [dashboardStats, setDashboardStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    pendingRequests: 0,
    completedCampaigns: 0,
    averageProgress: 0
  });
  
  // Active section for navigation highlight
  const [activeSection, setActiveSection] = useState('top');
  
  // Scroll position tracking for parallax effects
  const [scrollY, setScrollY] = useState(0);

  // Show toast notification
  const showToast = (message, type) => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  useEffect(() => {
    fetchInfluencerProfile();
    fetchDashboardData();
    
    // Set up scroll event listener for parallax effects
    const handleScroll = () => {
      setScrollY(window.scrollY);

      // Update active section based on scroll position
      const sections = ['top', 'brandRequests', 'activeCampaigns', 'allCampaigns'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate initial data loading
  useEffect(() => {
    // Artificially delay the loading state to showcase the loader animation
    const timer = setTimeout(() => { 
      setIsLoading(false); 
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!influencerInfo.profileImage || influencerInfo.profileImage.trim() === '') {
      setShowProfileBanner(true);
    } else {
      setShowProfileBanner(false);
    }
  }, [influencerInfo]);

  // Apply active theme
  useEffect(() => {
    const theme = themeOptions.find(t => t.id === activeTheme);
    if (theme) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', theme.colors.primary);
      root.style.setProperty('--primary-color-rgb', hexToRgb(theme.colors.primary));
      root.style.setProperty('--secondary-color', theme.colors.secondary);
      root.style.setProperty('--secondary-color-rgb', hexToRgb(theme.colors.secondary));
      root.style.setProperty('--bg-gradient-start', theme.colors.background.split('(')[1].split(',')[0]);
      root.style.setProperty('--bg-gradient-end', theme.colors.background.split(',')[1].split(')')[0]);
      root.style.setProperty('--card-bg', theme.colors.cardBg);
      root.style.setProperty('--text-color', theme.colors.text);
    }
  }, [activeTheme]);

  // Calculate dashboard stats when data changes
  useEffect(() => {
    const totalCampaigns = allCampaigns.length;
    const activeCount = activeCampaigns.length;
    const pendingCount = brandRequests.filter(req => req.status === 'pending').length;
    
    // Calculate average progress for active campaigns
    let totalProgress = 0;
    activeCampaigns.forEach(campaign => {
      totalProgress += campaign.progress || 0;
    });
    const avgProgress = activeCount > 0 ? Math.round(totalProgress / activeCount) : 0;
    
    // Count completed campaigns (assume >95% progress means completed)
    const completedCount = activeCampaigns.filter(campaign => (campaign.progress || 0) > 95).length;
    
    setDashboardStats({
      totalCampaigns,
      activeCampaigns: activeCount,
      pendingRequests: pendingCount,
      completedCampaigns: completedCount,
      averageProgress: avgProgress
    });
  }, [allCampaigns, activeCampaigns, brandRequests]);

  // Utility function to convert hex to rgb for CSS variables
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? 
      `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
  };

  const fetchInfluencerProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE_URL}/api/influencer/my-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiData = res.data.influencer;
      const mergedData = {
        ...initialProfile,
        ...apiData,
        industries: apiData.industries || initialProfile.industries,
        nichePlatforms: apiData.nichePlatforms || initialProfile.nichePlatforms
      };
      setInfluencerInfo(mergedData);
      setTempInfo(mergedData);
    } catch (error) {
      console.error('Error fetching influencer profile:', error);
      setInfluencerInfo(initialProfile);
      setTempInfo(initialProfile);
      showToast('Failed to load profile data', 'error');
    }
  };

  const handleSaveClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const patchData = {
        profileImage: tempInfo.profileImage,
        name: tempInfo.name,
        experience: tempInfo.experience,
        numFollowers: tempInfo.numFollowers,
        influencerLocation: tempInfo.influencerLocation,
        majorityAudienceLocation: tempInfo.majorityAudienceLocation,
        audienceAgeGroup: tempInfo.audienceAgeGroup,
        audienceGenderDemographics: tempInfo.audienceGenderDemographics,
        gender: tempInfo.gender,
        industries: tempInfo.industries,
        platforms: tempInfo.nichePlatforms,
      };
      await axios.patch(
        `${API_BASE_URL}/api/influencer/my-profile`,
        patchData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfluencerInfo(tempInfo);
      setIsEditing(false);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating influencer profile:', error);
      showToast('Failed to update profile', 'error');
    }
  };

  const handleCancelClick = () => {
    setTempInfo(influencerInfo);
    setIsEditing(false);
  };

  const handleEditClick = () => {
    setTempInfo(influencerInfo);
    setIsEditing(true);
  };

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const reqRes = await axios.get(`${API_BASE_URL}/api/influencer/brand-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const requestsArr = reqRes.data.requests || [];
      const visibleRequests = requestsArr.filter((r) => r.status !== 'accepted');
      setBrandRequests(visibleRequests);

      const activeRes = await axios.get(`${API_BASE_URL}/api/influencer/my-active-campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeArr = activeRes.data.activeCampaigns || [];
      setActiveCampaigns(activeArr);

      const allRes = await axios.get(`${API_BASE_URL}/api/campaigns`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allArr = allRes.data.campaigns || [];
      setAllCampaigns(allArr);

      const appliedSet = new Set();
      requestsArr.forEach((req) => {
        if (req.status === 'applied' && req.campaignId) {
          appliedSet.add(req.campaignId.toString());
        }
      });
      const activeSet = new Set();
      activeArr.forEach((act) => {
        const realId = act.campaignId?._id || act._id;
        if (realId) {
          activeSet.add(realId.toString());
        }
      });
      setAppliedCampaignIds(appliedSet);
      setActiveCampaignIds(activeSet);
      
      showToast('Dashboard data refreshed', 'info');
    } catch (error) {
      console.error('Error fetching influencer dashboard data:', error);
      showToast('Failed to load dashboard data', 'error');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/influencer/brand-requests/${requestId}/accept`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
      showToast('Request accepted successfully!', 'success');
    } catch (error) {
      console.error('Error accepting brand request:', error);
      showToast('Failed to accept request', 'error');
    }
  };

  const handleUpdateProgress = async (campaignId, newProgress) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.patch(
        `${API_BASE_URL}/api/influencer/my-active-campaigns/${campaignId}/progress`,
        { progress: newProgress },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating campaign progress:', error);
      showToast('Failed to update progress', 'error');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/signin');
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    if (isMobileNavActive) setIsMobileNavActive(false);
    setActiveSection(id);
  };

  // Mobile navigation toggle handler
  const toggleMobileNav = () => {
    setIsMobileNavActive((prev) => !prev);
  };

  return (
    <div 
      ref={pageRef} 
      className={styles['dashboard-page']} 
      style={{ 
        backgroundImage: `url(${influencerBack})`,
        '--scroll-y': `${scrollY}px` 
      }}
    >
      {/* Loading Screen */}
      {isLoading && <CosmicNebulaLoader />}
      
      {/* Animated Background Effects */}
      <AnimatedBackground />
      
      {/* Toast Notification */}
      <NotificationToast 
        message={toast.message} 
        type={toast.type} 
        visible={toast.visible} 
        onClose={hideToast} 
      />
      
      {/* Theme Selector */}
      <ThemeSelector 
        currentTheme={activeTheme} 
        onThemeChange={setActiveTheme} 
      />
      
      {/* Main Dashboard Container */}
      <div className={styles['dashboard-container']}>
        {/* Navigation Bar */}
        <nav className={styles['main-nav']}>
          <div className={styles['nav-left']}>
            <h2 className={styles['nav-logo']}>
              lets<span>FYI</span>
              <div className={styles['logo-shine']}></div>
            </h2>
          </div>
          
          <ul className={`${styles['nav-menu']} ${isMobileNavActive ? styles['menu-active'] : ''}`}>
            <li 
              onClick={() => scrollToSection('top')}
              className={activeSection === 'top' ? styles['active'] : ''}
            >
              <span className={styles['nav-icon']}>📊</span>
              Dashboard
            </li>
            <li 
              onClick={() => scrollToSection('brandRequests')}
              className={activeSection === 'brandRequests' ? styles['active'] : ''}
            >
              <span className={styles['nav-icon']}>🔔</span>
              Requests
              {brandRequests.length > 0 && (
                <span className={styles['nav-badge']}>{brandRequests.length}</span>
              )}
            </li>
            <li 
              onClick={() => scrollToSection('activeCampaigns')}
              className={activeSection === 'activeCampaigns' ? styles['active'] : ''}
            >
              <span className={styles['nav-icon']}>🚀</span>
              Active
            </li>
            <li 
              onClick={() => scrollToSection('allCampaigns')}
              className={activeSection === 'allCampaigns' ? styles['active'] : ''}
            >
              <span className={styles['nav-icon']}>🔍</span>
              Explore
            </li>
            <li onClick={handleLogout} className={styles['logout-item']}>
              <span className={styles['nav-icon']}>🚪</span>
              Logout
            </li>
          </ul>
          
          <div 
            className={`${styles['mobile-menu-toggle']} ${isMobileNavActive ? styles['menu-active'] : ''}`}
            onClick={toggleMobileNav}
          >
            <span></span>
            <span></span>
            <span></span>
          </div>
        </nav>
        
        {/* Profile Completion Banner */}
        {showProfileBanner && (
          <div className={styles['profile-banner']}>
            <div className={styles['banner-icon']}>💡</div>
            <div className={styles['banner-message']}>
              Complete your profile by adding a profile photo to increase your visibility to brands!
            </div>
            <button 
              className={styles['banner-action']} 
              onClick={handleEditClick}
            >
              Update Now
            </button>
          </div>
        )}
        
        {/* Top Section - Dashboard Header */}
        <section 
          id="top" 
          className={`${styles['dashboard-header']} ${activeSection === 'top' ? styles['active-section'] : ''}`}
        >
          <div className={styles['header-content']}>
            <div className={styles['welcome-message']}>
              <h1 className={styles['page-title']}>
                <span className={styles['title-highlight']}>
                  Influencer Dashboard
                  <div className={styles['shining-underline-container']}>
                    <div className={styles['shining-underline']}>
                      <div className={styles['shining-effect']}></div>
                    </div>
                  </div>
                </span>
              </h1>
              <p className={styles['greeting-text']}>
                Welcome back, <span className={styles['user-name']}>{influencerInfo.name}</span>!
              </p>
            </div>
            
            {/* Dashboard Stats */}
            <div className={styles['stats-container']}>
              <AnimatedCounter 
                value={dashboardStats.activeCampaigns} 
                label="Active Campaigns" 
                icon="🔥" 
                index={0}
              />
              <AnimatedCounter 
                value={dashboardStats.pendingRequests} 
                label="Pending Requests" 
                icon="🔔" 
                index={1}
              />
              <AnimatedCounter 
                value={dashboardStats.averageProgress} 
                label="Avg. Progress %" 
                icon="📈" 
                index={2}
              />
              <AnimatedCounter 
                value={dashboardStats.completedCampaigns} 
                label="Completed" 
                icon="✅" 
                index={3}
              />
            </div>
          </div>
        </section>
        
        {/* AI Recommendation Card */}
        <section className={styles['ai-recommendation']}>
          <div className={`${styles['amplify-card']} ${styles['ai-glow']} ${styles['neo-card']} ${styles['visible']}`}>
            <div className={styles['card-glare']}></div>
            <div className={styles['ai-badge']}>
              <span className={styles['ai-icon']}>AI</span> Recommendation
            </div>
            <h3 className={styles['ai-title']}>
              Personalized Growth Strategy
              <span className={styles['sparkle-effect']}></span>
            </h3>
            <div className={styles['info-column']}>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Insight:</span>
                <span className={styles['info-value']}>Based on your profile, fashion and fitness content performs best with your audience demographic.</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Suggestion:</span>
                <span className={styles['info-value']}>Focus on creating collaborative content with fitness brands to increase engagement by up to 34%.</span>
              </div>
              <div className={styles['info-row']}>
                <span className={styles['info-label']}>Action:</span>
                <span className={styles['info-value']}>Apply to the "Fitness Revolution" campaign which matches your content style.</span>
              </div>
            </div>
            <div className={styles['ai-action-btn']}>
              <button className={styles['learn-more-btn']}>
                Apply Now
                <span className={styles['btn-icon']}>→</span>
              </button>
            </div>
          </div>
        </section>
        
        {/* Profile Card */}
        <section className={styles['profile-section']}>
          <div className={styles['profile-card']}>
            {isEditing ? (
              /* Edit Profile Mode */
              <div className={styles['edit-profile-container']}>
                <h3 className={styles['section-title']}>
                  Edit Profile
                  <div className={styles['section-underline']}></div>
                </h3>
                
                <div className={styles['edit-form']}>
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Profile Image URL</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.profileImage}
                        onChange={(e) => setTempInfo({ ...tempInfo, profileImage: e.target.value })}
                        placeholder="Enter image URL"
                      />
                    </div>
                    
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Display Name</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.name}
                        onChange={(e) => setTempInfo({ ...tempInfo, name: e.target.value })}
                        placeholder="Your name"
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Experience (Years)</label>
                      <input
                        type="number"
                        className={styles['form-input']}
                        value={tempInfo.experience}
                        onChange={(e) => setTempInfo({ ...tempInfo, experience: e.target.value })}
                      />
                    </div>
                    
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Followers Count</label>
                      <input
                        type="number"
                        className={styles['form-input']}
                        value={tempInfo.numFollowers}
                        onChange={(e) => setTempInfo({ ...tempInfo, numFollowers: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Your Location</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.influencerLocation}
                        onChange={(e) => setTempInfo({ ...tempInfo, influencerLocation: e.target.value })}
                      />
                    </div>
                    
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Audience Location</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.majorityAudienceLocation}
                        onChange={(e) => setTempInfo({ ...tempInfo, majorityAudienceLocation: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Audience Age Group</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.audienceAgeGroup}
                        onChange={(e) => setTempInfo({ ...tempInfo, audienceAgeGroup: e.target.value })}
                      />
                    </div>
                    
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Audience Gender</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.audienceGenderDemographics}
                        onChange={(e) => setTempInfo({ ...tempInfo, audienceGenderDemographics: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Your Gender</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={tempInfo.gender}
                        onChange={(e) => setTempInfo({ ...tempInfo, gender: e.target.value })}
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Industries (comma-separated)</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={Array.isArray(tempInfo.industries) ? tempInfo.industries.join(', ') : ''}
                        onChange={(e) =>
                          setTempInfo({
                            ...tempInfo,
                            industries: e.target.value.split(',').map(item => item.trim()),
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-row']}>
                    <div className={styles['form-group']}>
                      <label className={styles['form-label']}>Platforms (comma-separated)</label>
                      <input
                        type="text"
                        className={styles['form-input']}
                        value={Array.isArray(tempInfo.nichePlatforms) ? tempInfo.nichePlatforms.join(', ') : ''}
                        onChange={(e) =>
                          setTempInfo({
                            ...tempInfo,
                            nichePlatforms: e.target.value.split(',').map(item => item.trim()),
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className={styles['form-buttons']}>
                    <button 
                      className={styles['save-btn']} 
                      onClick={handleSaveClick}
                    >
                      Save Changes
                    </button>
                    <button 
                      className={styles['cancel-btn']} 
                      onClick={handleCancelClick}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Profile View Mode */
              <div className={styles['profile-content']}>
                <div className={styles['profile-main']}>
                  <ProfileAvatar 
                    imageUrl={influencerInfo.profileImage} 
                    altImage={influencerBack}
                    name={influencerInfo.name}
                  />
                  
                  <button 
                    className={styles['edit-profile-btn']} 
                    onClick={handleEditClick}
                  >
                    Edit Profile
                  </button>
                </div>
                
                <div className={styles['profile-details']}>
                  <div className={styles['profile-section-header']}>
                    <h3 className={styles['profile-section-title']}>
                      Personal Info
                      <div className={styles['section-underline']}></div>
                    </h3>
                  </div>
                  
                  <div className={styles['detail-grid']}>
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-label']}>Audience Location:</span>
                      <span className={styles['detail-value']}>{influencerInfo.majorityAudienceLocation}</span>
                    </div>
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-label']}>Age Group:</span>
                      <span className={styles['detail-value']}>{influencerInfo.audienceAgeGroup}</span>
                    </div>
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-label']}>Gender Distribution:</span>
                      <span className={styles['detail-value']}>{influencerInfo.audienceGenderDemographics}</span>
                    </div>
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-label']}>Followers:</span>
                      <span className={styles['detail-value']}>{influencerInfo.numFollowers.toLocaleString()}</span>
                    </div>
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-label']}>Experience:</span>
                      <span className={styles['detail-value']}>{influencerInfo.experience} years</span>
                    </div>
                    <div className={styles['detail-item']}>
                      <span className={styles['detail-label']}>Location:</span>
                      <span className={styles['detail-value']}>{influencerInfo.influencerLocation}</span>
                    </div>
                  </div>
                  
                  <div className={styles['tag-sections']}>
                    <div className={styles['tag-section']}>
                      <h3 className={styles['tag-section-title']}>
                        Industries
                        <div className={styles['section-underline']}></div>
                      </h3>
                      <div className={styles['tags']}>
                        {Array.isArray(influencerInfo.industries) && influencerInfo.industries.map((industry, index) => (
                          <span key={index} className={styles['tag']} style={{ animationDelay: `${index * 0.1}s` }}>{industry}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className={styles['tag-section']}>
                      <h3 className={styles['tag-section-title']}>
                        Platforms
                        <div className={styles['section-underline']}></div>
                      </h3>
                      <div className={styles['tags']}>
                        {Array.isArray(influencerInfo.nichePlatforms) && influencerInfo.nichePlatforms.map((platform, index) => (
                          <span key={index} className={styles['tag']} style={{ animationDelay: `${index * 0.1}s` }}>{platform}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
        
        {/* Brand Requests Section */}
        <section 
          id="brandRequests" 
          className={`${styles['section-container']} ${activeSection === 'brandRequests' ? styles['active-section'] : ''}`}
        >
          <div className={styles['section-header']}>
            <div className={styles['section-title']}>
              <span className={styles['section-icon']}>🔔</span>
              Brand Requests
              <div className={styles['section-underline']}></div>
            </div>
            <div className={styles['section-actions']}>
              <button 
                className={styles['refresh-button']} 
                onClick={fetchDashboardData}
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className={styles['cards-container']}>
            {brandRequests.length === 0 ? (
              <EmptyState 
                icon="📭" 
                message="No brand requests at the moment." 
                tip="Apply to campaigns below to connect with brands!" 
              />
            ) : (
              brandRequests.map((req, index) => (
                <BrandRequestCard
                  key={req._id}
                  request={req}
                  onAccept={handleAcceptRequest}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))
            )}
          </div>
        </section>
        
        {/* Active Campaigns Section */}
        <section 
          id="activeCampaigns" 
          className={`${styles['section-container']} ${activeSection === 'activeCampaigns' ? styles['active-section'] : ''}`}
        >
          <div className={styles['section-header']}>
            <div className={styles['section-title']}>
              <span className={styles['section-icon']}>🚀</span>
              Active Campaigns
              <div className={styles['section-underline']}></div>
            </div>
            <div className={styles['section-actions']}>
              <button 
                className={styles['refresh-button']} 
                onClick={fetchDashboardData}
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className={styles['cards-container']}>
            {activeCampaigns.length === 0 ? (
              <EmptyState 
                icon="🚀" 
                message="No active campaigns yet." 
                tip="Apply for campaigns or accept brand requests to get started!"
              />
            ) : (
              activeCampaigns.map((campaign, index) => (
                <ActiveCampaignCard
                  key={campaign._id || campaign.campaignId?._id}
                  campaign={campaign}
                  onUpdateProgress={handleUpdateProgress}
                  onRefresh={fetchDashboardData}
                  style={{ '--i': index }}
                />
              ))
            )}
          </div>
        </section>
        
        {/* All Campaigns Section */}
        <section 
          id="allCampaigns" 
          className={`${styles['section-container']} ${activeSection === 'allCampaigns' ? styles['active-section'] : ''}`}
        >
          <div className={styles['section-header']}>
            <div className={styles['section-title']}>
              <span className={styles['section-icon']}>🔍</span>
              Explore Campaigns
              <div className={styles['section-underline']}></div>
            </div>
            <div className={styles['section-actions']}>
              <button 
                className={styles['refresh-button']} 
                onClick={fetchDashboardData}
              >
                Refresh
              </button>
            </div>
          </div>
          
          <div className={styles['big-cards-container']}>
            {allCampaigns.length === 0 ? (
              <EmptyState 
                icon="📝" 
                message="No campaigns available at the moment." 
                tip="Check back later for new opportunities!"
              />
            ) : (
              allCampaigns.map((campaign, index) => (
                <AllCampaignCard
                  key={campaign._id}
                  campaign={campaign}
                  influencerId={influencerInfo._id}
                  onApplied={fetchDashboardData}
                  appliedCampaignIds={appliedCampaignIds}
                  activeCampaignIds={activeCampaignIds}
                  style={{ animationDelay: `${index * 0.1}s` }}
                />
              ))
            )}
          </div>
        </section>
        
        {/* Chatbot Button */}
        <div className={styles['chatbot-bubble']}>
          <div className={styles['chat-icon']}>💬</div>
          <div className={styles['chat-pulse']}></div>
        </div>
        
        {/* Footer Section */}
        <footer className={styles['dashboard-footer']}>
          <p>© {new Date().getFullYear()} letsFYI - Influencer Dashboard</p>
        </footer>
        
        {/* Scroll To Top Button */}
        <button 
          className={styles['scroll-top-btn']} 
          onClick={() => scrollToSection('top')}
        >
          <span className={styles['scroll-icon']}>⬆</span>
        </button>
      </div>
    </div>
  );
}

export default InfluencerDashboard;