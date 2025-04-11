/**
 * Campaign Detail Page Animations & Interactive Elements
 * This script adds stunning visual effects and animations to make the campaign detail page stand out
 */

// Execute when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all animations and interactive elements
    initBackgroundEffects();
    initScrollAnimations();
    initParallaxEffects();
    initHoverEffects();
    initMicroInteractions();
    initLoadingEffects();
    initEditModeTransitions();
    initQuickActionMenu();
  });
  
  /**
   * Creates and initializes dynamic background effects
   */
  function initBackgroundEffects() {
    // Create ambient background container if it doesn't exist
    if (!document.querySelector('.ambient-background')) {
      const container = document.querySelector('.campaign-detail-container');
      if (!container) return;
      
      // Add ambient background container
      const ambientBg = document.createElement('div');
      ambientBg.className = 'ambient-background';
      container.prepend(ambientBg);
      
      // Add gradient overlay
      const gradientOverlay = document.createElement('div');
      gradientOverlay.className = 'gradient-overlay';
      ambientBg.appendChild(gradientOverlay);
      
      // Add ambient dots
      const ambientDots = document.createElement('div');
      ambientDots.className = 'ambient-dots';
      ambientBg.appendChild(ambientDots);
      
      // Create floating particles
      createFloatingParticles(container);
    }
  }
  
  /**
   * Creates floating background particles for visual depth
   * @param {HTMLElement} container - The container element
   */
  function createFloatingParticles(container) {
    // Number of particles to create
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      
      // Random size between 20px and 80px
      const size = Math.random() * 60 + 20;
      
      // Random horizontal position
      const posX = Math.random() * 100;
      
      // Random horizontal drift during animation
      const translateX = (Math.random() - 0.5) * 200;
      
      // Random rotation during animation
      const rotate = (Math.random() - 0.5) * 360;
      
      // Random color hue (blues, purples, teals)
      const hue = Math.random() * 60 + 200;
      
      // Apply styles
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.left = `${posX}%`;
      particle.style.bottom = `-${size}px`;
      particle.style.backgroundColor = `hsla(${hue}, 70%, 60%, 0.05)`;
      
      // Set CSS variables for animation
      particle.style.setProperty('--tx', `${translateX}px`);
      particle.style.setProperty('--r', `${rotate}deg`);
      
      // Random animation delay
      const delay = Math.random() * 10;
      particle.style.animationDelay = `${delay}s`;
      
      // Random animation duration (15-25s)
      const duration = Math.random() * 10 + 15;
      particle.style.animationDuration = `${duration}s`;
      
      // Add to container
      container.appendChild(particle);
    }
  }
  
  /**
   * Initializes intersection observer for scroll-triggered animations
   */
  function initScrollAnimations() {
    const detailsRef = document.querySelector('.campaign-detail-container');
    if (!detailsRef) return;
    
    // Tracks which items have been animated
    const animatedItems = new Set();
    
    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          // If element is intersecting viewport and hasn't been animated
          if (entry.isIntersecting && entry.target.dataset.item && !animatedItems.has(entry.target.dataset.item)) {
            // Add to animated items set
            animatedItems.add(entry.target.dataset.item);
            
            // Add class to trigger animation
            entry.target.classList.add('item-visible');
            
            // Find child elements to animate with delays
            const animatableChildren = entry.target.querySelectorAll('[class*="detail-item"], [class*="form-input-item"], [class*="suggestion-card"], [class*="event-card"], [class*="recommendation"], [class*="influencer-card"], [class*="task-card"]');
            
            // Add animation classes to children with appropriate delays
            animatableChildren.forEach((child, index) => {
              setTimeout(() => {
                child.classList.add('item-visible');
              }, index * 100); // 100ms delay between each child animation
            });
          }
        });
      },
      { threshold: 0.1 } // Trigger when 10% of element is visible
    );
    
    // Select all elements to observe
    const itemsToObserve = detailsRef.querySelectorAll('.animate-on-scroll');
    itemsToObserve.forEach(item => observer.observe(item));
  }
  
  /**
   * Initializes parallax effects for header elements
   */
  function initParallaxEffects() {
    const header = document.querySelector('.campaign-header');
    if (!header) return;
    
    // Add transform style to preserve 3D
    header.style.transform = 'translateZ(0)';
    
    // Elements to parallax
    const imageContainer = header.querySelector('.image-container');
    const titleElements = header.querySelectorAll('.campaign-title, .campaign-subtitle');
    
    // Handle scroll for parallax effect
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      
      // Parallax for image container (slower movement)
      if (imageContainer) {
        imageContainer.style.transform = `translateY(${scrollPosition * 0.15}px)`;
      }
      
      // Parallax for title elements (faster movement)
      titleElements.forEach(el => {
        el.style.transform = `translateY(${scrollPosition * 0.2}px)`;
      });
    });
  }
  
  /**
   * Initializes hover effects for interactive elements
   */
  function initHoverEffects() {
    // Detail items hover effect
    const detailItems = document.querySelectorAll('.detail-item, .form-input-item, .suggestion-card, .influencer-card, .task-card');
    
    detailItems.forEach(item => {
      item.addEventListener('mouseenter', () => {
        // Add subtle movement to siblings (pushing them away slightly)
        const siblings = Array.from(item.parentElement.children).filter(el => el !== item);
        siblings.forEach(sibling => {
          sibling.style.transform = 'scale(0.98)';
          sibling.style.opacity = '0.8';
        });
      });
      
      item.addEventListener('mouseleave', () => {
        // Reset siblings
        const siblings = Array.from(item.parentElement.children);
        siblings.forEach(sibling => {
          sibling.style.transform = '';
          sibling.style.opacity = '';
        });
      });
    });
    
    // Add shine effect to buttons on hover
    const buttons = document.querySelectorAll('.edit-button, .find-button, .find-influencers-button, .connect-button, .message-button, .assign-button');
    
    buttons.forEach(button => {
      // Create shine element if it doesn't exist
      if (!button.querySelector('.button-shine')) {
        const shine = document.createElement('div');
        shine.className = 'button-shine';
        button.appendChild(shine);
        
        // Shine effect on mouse move
        button.addEventListener('mousemove', (e) => {
          const rect = button.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          
          shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)`;
        });
      }
    });
  }
  
  /**
   * Initializes micro-interactions for UI elements
   */
  function initMicroInteractions() {
    // Progress bar animation
    const progressBars = document.querySelectorAll('.progress-fill, .influencer-progress-fill, .progress-bar-detail');
    
    progressBars.forEach(bar => {
      // Get progress percentage from inline style or data attribute
      const width = bar.style.width || bar.dataset.progress || '0%';
      
      // Reset width to 0
      bar.style.width = '0%';
      
      // Animate to actual width
      setTimeout(() => {
        bar.style.width = width;
      }, 500);
    });
    
    // Summary stats counter animation
    const statsValues = document.querySelectorAll('.summary-value');
    
    statsValues.forEach(stat => {
      // Skip if it's not a number
      if (stat.classList.contains('budget-value')) return;
      
      const targetValue = parseInt(stat.textContent, 10);
      if (isNaN(targetValue)) return;
      
      // Start from 0
      stat.textContent = '0';
      
      // Animate to target value
      let currentValue = 0;
      const increment = Math.max(1, Math.floor(targetValue / 30));
      const interval = setInterval(() => {
        currentValue += increment;
        
        if (currentValue >= targetValue) {
          currentValue = targetValue;
          clearInterval(interval);
        }
        
        stat.textContent = currentValue;
      }, 40);
    });
  }
  
  /**
   * Initializes loading and transition effects
   */
  function initLoadingEffects() {
    // Enhance loading animation
    const loadingContainer = document.querySelector('.loading-container');
    if (loadingContainer) {
      // Add pulsing circles
      const pulseContainer = document.createElement('div');
      pulseContainer.className = 'loading-pulse';
      
      for (let i = 1; i <= 3; i++) {
        const circle = document.createElement('div');
        circle.className = `loading-circle loading-circle-${i}`;
        pulseContainer.appendChild(circle);
      }
      
      // Replace existing content
      loadingContainer.innerHTML = '';
      loadingContainer.appendChild(pulseContainer);
      
      // Add loading text with dots animation
      const loadingText = document.createElement('div');
      loadingText.className = 'loading-text';
      loadingText.innerHTML = 'Loading campaign <span class="loading-dot">.</span><span class="loading-dot">.</span><span class="loading-dot">.</span>';
      loadingContainer.appendChild(loadingText);
    }
    
    // Enhance save animation
    document.addEventListener('click', e => {
      if (e.target.matches('.save-button')) {
        createSaveAnimation();
      }
    });
  }
  
  /**
   * Creates an animated save success effect
   */
  function createSaveAnimation() {
    // Remove existing animation if present
    const existingAnimation = document.querySelector('.save-animation');
    if (existingAnimation) {
      existingAnimation.remove();
    }
    
    // Create animation container
    const saveAnimation = document.createElement('div');
    saveAnimation.className = 'save-animation';
    
    // Add circle
    const saveCircle = document.createElement('div');
    saveCircle.className = 'save-circle';
    
    // Add checkmark
    const saveCheckmark = document.createElement('div');
    saveCheckmark.className = 'save-checkmark';
    saveCheckmark.textContent = '✓';
    
    // Add to DOM
    saveCircle.appendChild(saveCheckmark);
    saveAnimation.appendChild(saveCircle);
    document.body.appendChild(saveAnimation);
    
    // Remove after animation completes
    setTimeout(() => {
      saveAnimation.remove();
    }, 2000);
  }
  
  /**
   * Initializes transitions for edit mode
   */
  function initEditModeTransitions() {
    // Edit button click handler
    const editButton = document.querySelector('.edit-button');
    if (editButton) {
      editButton.addEventListener('click', () => {
        // Get container
        const container = document.querySelector('.campaign-detail-container');
        
        // Add transition class
        container.classList.add('edit-mode-transition');
        
        // Scroll to top with smooth animation
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
    
    // Cancel button click handler
    const cancelButton = document.querySelector('.cancel-button');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        // Get container
        const container = document.querySelector('.campaign-detail-container');
        
        // Add transition class
        container.classList.add('view-mode-transition');
        
        // Remove classes after animation
        setTimeout(() => {
          container.classList.remove('edit-mode-transition', 'view-mode-transition');
        }, 500);
      });
    }
  }
  
  /**
   * Initializes quick action menu behavior
   */
  function initQuickActionMenu() {
    const quickActionButton = document.querySelector('.quick-action-button');
    if (!quickActionButton) return;
    
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Add staggered animation to menu items
    menuItems.forEach((item, index) => {
      item.style.transitionDelay = `${0.05 * (menuItems.length - index)}s`;
    });
    
    // Toggle menu on click (for mobile)
    quickActionButton.addEventListener('click', (e) => {
      const menu = quickActionButton.querySelector('.quick-menu');
      menu.classList.toggle('quick-menu-active');
      quickActionButton.classList.toggle('quick-button-active');
      
      // Close menu when clicking outside
      if (menu.classList.contains('quick-menu-active')) {
        const closeMenu = (event) => {
          if (!quickActionButton.contains(event.target)) {
            menu.classList.remove('quick-menu-active');
            quickActionButton.classList.remove('quick-button-active');
            document.removeEventListener('click', closeMenu);
          }
        };
        
        // Add listener with small delay
        setTimeout(() => {
          document.addEventListener('click', closeMenu);
        }, 10);
      }
      
      e.stopPropagation();
    });
    
    // Handle scroll-to-top action
    const scrollTopItem = document.querySelector('.menu-item:last-child');
    if (scrollTopItem) {
      scrollTopItem.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  }
  
  /**
   * Creates particle effects for ambient background
   */
  function createAmbientParticles() {
    const container = document.querySelector('.campaign-detail-container');
    if (!container) return;
    
    // Create particle container
    const particleContainer = document.createElement('div');
    particleContainer.className = 'ambient-particles';
    container.appendChild(particleContainer);
    
    // Create particles
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random position
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      
      // Random size (2-6px)
      const size = Math.random() * 4 + 2;
      
      // Random opacity (0.03-0.1)
      const opacity = Math.random() * 0.07 + 0.03;
      
      // Apply styles
      particle.style.left = `${posX}%`;
      particle.style.top = `${posY}%`;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      particle.style.opacity = opacity;
      
      // Add to container
      particleContainer.appendChild(particle);
      
      // Animate particle
      animateParticle(particle);
    }
  }
  
  /**
   * Animates a background particle with random movement
   * @param {HTMLElement} particle - The particle element to animate
   */
  function animateParticle(particle) {
    // Random duration (30-60s)
    const duration = Math.random() * 30 + 30;
    
    // Random direction
    const direction = Math.random() > 0.5 ? 1 : -1;
    
    // Create animation
    particle.animate(
      [
        { transform: 'translateY(0) rotate(0deg)' },
        { transform: `translateY(${direction * 100}px) rotate(${direction * 360}deg)` }
      ],
      {
        duration: duration * 1000,
        iterations: Infinity,
        direction: 'alternate',
        easing: 'ease-in-out'
      }
    );
  }
  
  /**
   * Enhances form input interactions
   */
  function enhanceFormInputs() {
    const inputs = document.querySelectorAll('.input, .textarea, .select');
    
    inputs.forEach(input => {
      // Focus effect
      input.addEventListener('focus', () => {
        input.parentElement.classList.add('input-focused');
      });
      
      input.addEventListener('blur', () => {
        input.parentElement.classList.remove('input-focused');
      });
      
      // For progress input, update visualizer
      if (input.name === 'progress') {
        const visualizer = input.parentElement.querySelector('.progress-visualizer');
        
        if (visualizer) {
          input.addEventListener('input', () => {
            const value = Math.min(100, Math.max(0, input.value));
            visualizer.style.width = `${value}%`;
          });
        }
      }
    });
  }
  
  /**
   * Adds dynamic header effect for status changes
   */
  function enhanceStatusIndicator() {
    const statusSelect = document.querySelector('select[name="status"]');
    const header = document.querySelector('.campaign-header');
    
    if (statusSelect && header) {
      statusSelect.addEventListener('change', () => {
        // Remove existing status classes
        header.classList.remove('status-active-header', 'status-paused-header', 'status-completed-header', 'status-draft-header');
        
        // Add new status class
        header.classList.add(`status-${statusSelect.value.toLowerCase()}-header`);
        
        // Add pulse animation
        header.classList.add('status-change-pulse');
        
        // Remove animation class after it completes
        setTimeout(() => {
          header.classList.remove('status-change-pulse');
        }, 1000);
      });
    }
  }
  
  // Call additional enhancements
  document.addEventListener('DOMContentLoaded', () => {
    createAmbientParticles();
    enhanceFormInputs();
    enhanceStatusIndicator();
    
    // Add data attributes for scroll animations if not present
    const elements = document.querySelectorAll('.dashboard-summary, .campaign-detail-box, .form-inputs, .campaign-description, .calendar-events, .campaign-suggestions, .advice-section, .influencers-section, .tasks-section, .action-buttons');
    
    elements.forEach((el, index) => {
      if (!el.dataset.item) {
        el.dataset.item = `section-${index}`;
      }
      
      if (!el.classList.contains('animate-on-scroll')) {
        el.classList.add('animate-on-scroll');
      }
    });
  });