import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NavBar from './NavBar';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import Lottie from 'react-lottie';
import { FaCheckCircle, FaPlus, FaInstagram, FaLinkedin, FaFacebook, FaTwitch, FaReddit, 
         FaPinterest, FaTiktok, FaTwitter, FaYoutube, FaSnapchatGhost, FaDiscord,
         FaChevronLeft, FaChevronRight, FaLock, FaUser, FaEnvelope, FaMapMarkerAlt, 
         FaUserFriends, FaCalendarAlt, FaVenusMars, FaBriefcase } from 'react-icons/fa';
import { SiThreads, SiQuora } from 'react-icons/si';
import { Typewriter } from 'react-simple-typewriter';
import { Parallax, ParallaxLayer } from '@react-spring/parallax';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sphere, MeshDistortMaterial, Environment, Float } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise } from '@react-three/postprocessing';
import './InfluencerSignUpForm.css';
import confettiAnimation from '../assets/animations/confetti.json';
import rocketAnimation from '../assets/animations/rocket.json';
import successAnimation from '../assets/animations/success.json';

// Animation options
const confettiOptions = {
  loop: false,
  autoplay: true, 
  animationData: confettiAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const rocketOptions = {
  loop: true,
  autoplay: true, 
  animationData: rocketAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

const successOptions = {
  loop: false,
  autoplay: true, 
  animationData: successAnimation,
  rendererSettings: {
    preserveAspectRatio: 'xMidYMid slice'
  }
};

// 3D Animated Background
const AnimatedSphere = ({ position, size, color, speed, distort }) => {
  const mesh = useRef();
  
  useFrame(({ clock }) => {
    mesh.current.position.y = Math.sin(clock.getElapsedTime() * speed) * 0.2;
    mesh.current.rotation.y = clock.getElapsedTime() * 0.1;
    mesh.current.rotation.x = clock.getElapsedTime() * 0.15;
  });
  
  return (
    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.6}>
      <Sphere ref={mesh} position={position} args={[size, 64, 64]}>
        <MeshDistortMaterial 
          color={color} 
          attach="material" 
          distort={distort} 
          speed={2} 
          roughness={0.2}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
};

const AnimatedBackground = () => {
  return (
    <Canvas className="canvas-background">
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <AnimatedSphere position={[-2, 0, 0]} size={1} color="#FF7D00" speed={1.5} distort={0.4} />
      <AnimatedSphere position={[2, -1, -5]} size={1.5} color="#001524" speed={0.8} distort={0.3} />
      <AnimatedSphere position={[0, 2, -3]} size={0.8} color="#FFECD1" speed={1.2} distort={0.5} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.5} luminanceSmoothing={0.9} height={300} />
        <ChromaticAberration offset={[0.0005, 0.0005]} />
        <Noise opacity={0.02} />
      </EffectComposer>
      <Environment preset="sunset" />
    </Canvas>
  );
};

// Magnetic Button effect
const MagneticButton = ({ children, className, onClick, disabled }) => {
  const buttonRef = useRef(null);
  const [hovering, setHovering] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 400 };
  const xSpring = useSpring(x, springConfig);
  const ySpring = useSpring(y, springConfig);
  
  const handleMouseMove = (e) => {
    if (!buttonRef.current || disabled) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    
    const distance = Math.sqrt(
      Math.pow(e.clientX - centerX, 2) + 
      Math.pow(e.clientY - centerY, 2)
    );
    
    const maxDistance = Math.max(rect.width, rect.height) * 0.5;
    const magnetStrength = Math.min(distance / maxDistance, 1);
    
    const moveX = (e.clientX - centerX) * 0.3 * magnetStrength;
    const moveY = (e.clientY - centerY) * 0.3 * magnetStrength;
    
    x.set(moveX);
    y.set(moveY);
  };
  
  const handleMouseLeave = () => {
    setHovering(false);
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.button
      ref={buttonRef}
      className={className}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovering(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: xSpring, y: ySpring }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.3, type: 'spring' }}
    >
      {children}
    </motion.button>
  );
};

// API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

function InfluencerSignUpForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formProgress, setFormProgress] = useState(0);
  const parallaxRef = useRef(null);
  const [mouseCursor, setMouseCursor] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState('basic'); // basic, audience, platforms
  
  // Basic user fields required by the backend
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  // Influencer-specific fields
  const [formData, setFormData] = useState({
    name: '',
    experience: '',
    numFollowers: '',
    gender: '',
    influencerLocation: '',
    majorityAudienceLocation: '',
    audienceAgeGroup: '',
    audienceGenderDemographics: ''
  });

  // Multi-select fields
  const [selectedIndustries, setSelectedIndustries] = useState([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);
  const [platformDetails, setPlatformDetails] = useState({});
  const [showLottie, setShowLottie] = useState(false);

  // Mouse cursor effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMouseCursor({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  // Industry & Platform options
  const industryOptions = [
    'Agriculture', 'Aviation', 'Beauty', 'Biotechnology', 'Chemical',
    'Construction', 'Defense and Security', 'E-commerce', 'Education',
    'Energy', 'Event Planning', 'Fashion', 'Finance', 'Fintech', 'Fitness',
    'Food', 'Fundraising', 'Gaming', 'Healthcare', 'Hospitality Industry',
    'Insurance', 'Legal Services', 'Logistics', 'Luxury Goods', 'Marine',
    'Mining', 'Pet Care', 'Pharmaceutics', 'Photography', 'Real Estate',
    'Retail', 'Space', 'Sports', 'Technology', 'Telecommunication',
    'Travel', 'Utilities'
  ];

  const platformOptions = [
    'Instagram', 'LinkedIn', 'Facebook', 'Twitch', 'Reddit', 'Pinterest',
    'TikTok', 'X', 'Youtube', 'Threads', 'Quora', 'Discord', 'Snapchat'
  ];

  // Platform icons mapping
  const platformIcons = {
    'Instagram': <FaInstagram />,
    'LinkedIn': <FaLinkedin />,
    'Facebook': <FaFacebook />,
    'Twitch': <FaTwitch />,
    'Reddit': <FaReddit />,
    'Pinterest': <FaPinterest />,
    'TikTok': <FaTiktok />,
    'X': <FaTwitter />,
    'Youtube': <FaYoutube />,
    'Threads': <SiThreads />,
    'Quora': <SiQuora />,
    'Discord': <FaDiscord />,
    'Snapchat': <FaSnapchatGhost />
  };

  // Update form progress
  useEffect(() => {
    const totalSteps = 3;
    const progressPercentage = ((currentStep - 1) / totalSteps) * 100;
    setFormProgress(progressPercentage);
    
    // Update parallax scroll position when step changes
    if (parallaxRef.current) {
      parallaxRef.current.scrollTo(currentStep - 1);
    }
  }, [currentStep]);

  // Handle user account info
  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle influencer-specific fields
  const handleInfluencerChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Industry tag selection
  const handleIndustryTagClick = (industry) => {
    if (selectedIndustries.includes(industry)) {
      setSelectedIndustries(selectedIndustries.filter(item => item !== industry));
    } else {
      setShowLottie(true);
      setTimeout(() => setShowLottie(false), 1000);
      setSelectedIndustries([...selectedIndustries, industry]);
    }
  };

  // Remove selected industry
  const removeIndustry = (industry) => {
    setSelectedIndustries(selectedIndustries.filter(item => item !== industry));
  };

  // Platform icon selection
  const handlePlatformIconClick = (platform) => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
      
      // Remove platform details
      const newDetails = { ...platformDetails };
      delete newDetails[platform];
      setPlatformDetails(newDetails);
    } else {
      setShowLottie(true);
      setTimeout(() => setShowLottie(false), 1000);
      setSelectedPlatforms([...selectedPlatforms, platform]);
      setPlatformDetails(prev => ({
        ...prev,
        [platform]: { handle: '', price: '' }
      }));
    }
  };

  // Handle handle/price changes for each selected platform
  const handlePlatformDetailChange = (platform, field, value) => {
    setPlatformDetails((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  // Next step
  const handleNextStep = (e) => {
    e.preventDefault();
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Previous step
  const handlePrevStep = (e) => {
    e.preventDefault();
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Submit
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Combine all data
    const finalData = {
      // User account info
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      password: userData.password,

      // Influencer fields
      name: formData.name,
      experience: formData.experience,
      numFollowers: formData.numFollowers,
      influencerLocation: formData.influencerLocation,
      majorityAudienceLocation: formData.majorityAudienceLocation,
      audienceAgeGroup: formData.audienceAgeGroup,
      audienceGenderDemographics: formData.audienceGenderDemographics,
      gender: formData.gender,

      // Arrays
      industries: selectedIndustries,
      platforms: selectedPlatforms,

      // Additional platform details
      platformDetails
    };

    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/signup/influencer`,
        finalData
      );
      console.log('Influencer signup success:', res.data);
      setSubmissionSuccess(true);
      
      // Redirect after showing success animation
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (error) {
      console.error('Error signing up influencer:', error);
      setErrorMessage(
        error.response?.data?.error || 'Influencer signup failed. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  // Form step variants for animations
  const formVariants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 100, transition: { duration: 0.3 } }
  };

  return (
    <div className="influencer-page-container">
      <NavBar />
      
      {/* Custom animated cursor */}
      <motion.div 
        className="custom-cursor"
        style={{
          left: mouseCursor.x,
          top: mouseCursor.y
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.8, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* 3D background */}
      <div className="three-background">
        <AnimatedBackground />
      </div>
      
      {/* Animated layers */}
      <div className="dynamic-backdrop">
        <div className="cosmos">
          <div className="stars"></div>
          <div className="stars"></div>
          <div className="stars"></div>
          <div className="stars"></div>
          <div className="stars"></div>
        </div>

        <div className="animated-gradient-bg"></div>
        
        <div className="glowing-orbs-container">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>
      
      {/* Show confetti animation on selection */}
      {showLottie && (
        <div className="mini-confetti" style={{ left: mouseCursor.x - 50, top: mouseCursor.y - 50 }}>
          <Lottie options={confettiOptions} height={100} width={100} />
        </div>
      )}
      
      <Parallax pages={3} ref={parallaxRef} enabled={false} className="parallax-container">
        <ParallaxLayer offset={0} speed={0.5} className="parallax-content-layer">
          <div className="influencer-form-wrapper">
            {/* Animated form header */}
            <motion.div 
              className="form-header"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="title-container">
                <h1 className="title-text">
                  <span className="gradient-text">Influencer Registration</span>
                </h1>
                <div className="rocket-animation">
                  <Lottie options={rocketOptions} height={80} width={80} />
                </div>
              </div>
              
              <div className="typewriter-container">
                <Typewriter
                  words={['Join the Let\'sFI network and amplify your reach.', 'Connect with brands that match your style.', 'Grow your influence. Increase your income.']}
                  loop={true}
                  cursor
                  cursorStyle='|'
                  typeSpeed={70}
                  deleteSpeed={50}
                  delaySpeed={2000}
                />
              </div>
            </motion.div>
            
            {/* Progress bar */}
            <div className="progress-container">
              <motion.div 
                className="progress-bar" 
                initial={{ width: 0 }}
                animate={{ width: `${formProgress}%` }}
                transition={{ duration: 0.5 }}
              >
                <div className="progress-glow"></div>
              </motion.div>
              <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`} onClick={() => currentStep > 1 && setCurrentStep(1)}>
                  <div className="step-number">1</div>
                  <div className="step-label">Account</div>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`} onClick={() => currentStep > 2 && setCurrentStep(2)}>
                  <div className="step-number">2</div>
                  <div className="step-label">Profile</div>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                  <div className="step-number">3</div>
                  <div className="step-label">Platforms</div>
                </div>
              </div>
            </div>
          
            <motion.div 
              className="influencer-form-box"
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {errorMessage && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {errorMessage}
                </motion.div>
              )}

              {submissionSuccess ? (
                <motion.div 
                  className="success-message"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: "spring" }}
                >
                  <div className="success-animation">
                    <Lottie options={successOptions} height={200} width={200} />
                  </div>
                  <h3>Registration Successful!</h3>
                  <p>Welcome to the Let'sFI network!</p>
                  <p>Redirecting you to sign in...</p>
                </motion.div>
              ) : (
                <form onSubmit={currentStep === 3 ? handleSubmit : handleNextStep}>
                  <AnimatePresence mode="wait">
                    {/* Step 1: Account Information */}
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="form-step"
                      >
                        <div className="step-header">
                          <h3 className="step-title">Create Your Account</h3>
                          <p className="step-description">Begin your influencer journey with a new account</p>
                        </div>
                        
                        <div className="floating-label-group">
                          <div className="input-icon">
                            <FaUser />
                          </div>
                          <div className="floating-label-input">
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              required
                              value={userData.firstName}
                              onChange={handleUserChange}
                              placeholder=" "
                            />
                            <label htmlFor="firstName">First Name</label>
                            <div className="input-focus-line"></div>
                          </div>
                        </div>
                        
                        <div className="floating-label-group">
                          <div className="input-icon">
                            <FaUser />
                          </div>
                          <div className="floating-label-input">
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              required
                              value={userData.lastName}
                              onChange={handleUserChange}
                              placeholder=" "
                            />
                            <label htmlFor="lastName">Last Name</label>
                            <div className="input-focus-line"></div>
                          </div>
                        </div>
                        
                        <div className="floating-label-group">
                          <div className="input-icon">
                            <FaEnvelope />
                          </div>
                          <div className="floating-label-input">
                            <input
                              type="email"
                              id="email"
                              name="email"
                              required
                              value={userData.email}
                              onChange={handleUserChange}
                              placeholder=" "
                            />
                            <label htmlFor="email">Email Address</label>
                            <div className="input-focus-line"></div>
                          </div>
                        </div>
                        
                        <div className="floating-label-group">
                          <div className="input-icon">
                            <FaLock />
                          </div>
                          <div className="floating-label-input">
                            <input
                              type="password"
                              id="password"
                              name="password"
                              required
                              value={userData.password}
                              onChange={handleUserChange}
                              placeholder=" "
                            />
                            <label htmlFor="password">Password</label>
                            <div className="input-focus-line"></div>
                          </div>
                        </div>
                        
                        <div className="form-actions">
                          <MagneticButton 
                            type="submit" 
                            className="primary-btn next-btn"
                          >
                            <span>Next Step</span>
                            <FaChevronRight className="btn-icon" />
                          </MagneticButton>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 2: Profile Information */}
                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="form-step"
                      >
                        <div className="step-header">
                          <h3 className="step-title">Tell Us About Yourself</h3>
                          <p className="step-description">Help brands find you with detailed profile information</p>
                        </div>
                        
                        <div className="profile-tabs">
                          <div 
                            className={`tab ${activeTab === 'basic' ? 'active' : ''}`}
                            onClick={() => setActiveTab('basic')}
                          >
                            <span>Basic Info</span>
                          </div>
                          <div 
                            className={`tab ${activeTab === 'audience' ? 'active' : ''}`}
                            onClick={() => setActiveTab('audience')}
                          >
                            <span>Audience</span>
                          </div>
                          <div 
                            className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
                            onClick={() => setActiveTab('categories')}
                          >
                            <span>Categories</span>
                          </div>
                        </div>
                        
                        <AnimatePresence mode="wait">
                          {/* Basic Info Tab */}
                          {activeTab === 'basic' && (
                            <motion.div
                              key="basic"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="tab-content"
                            >
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaUser />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="name">Display Name</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                              
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaBriefcase />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="number"
                                    id="experience"
                                    name="experience"
                                    required
                                    min="0"
                                    value={formData.experience}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="experience">Experience (Years)</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                              
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaUserFriends />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="number"
                                    id="numFollowers"
                                    name="numFollowers"
                                    min="0"
                                    value={formData.numFollowers}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="numFollowers">Follower Count</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                              
                              <div className="select-group">
                                <div className="input-icon">
                                  <FaVenusMars />
                                </div>
                                <div className="custom-select">
                                  <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInfluencerChange}
                                  >
                                    <option value="">--Select Gender--</option>
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="other">Other / Prefer Not to Say</option>
                                  </select>
                                  <div className="select-dropdown-icon">▼</div>
                                </div>
                              </div>
                              
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaMapMarkerAlt />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="text"
                                    id="influencerLocation"
                                    name="influencerLocation"
                                    value={formData.influencerLocation}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="influencerLocation">Your Location</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Audience Tab */}
                          {activeTab === 'audience' && (
                            <motion.div
                              key="audience"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="tab-content"
                            >
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaMapMarkerAlt />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="text"
                                    id="majorityAudienceLocation"
                                    name="majorityAudienceLocation"
                                    value={formData.majorityAudienceLocation}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="majorityAudienceLocation">Audience Location</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                              
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaCalendarAlt />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="text"
                                    id="audienceAgeGroup"
                                    name="audienceAgeGroup"
                                    value={formData.audienceAgeGroup}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="audienceAgeGroup">Audience Age Range</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                              
                              <div className="floating-label-group">
                                <div className="input-icon">
                                  <FaVenusMars />
                                </div>
                                <div className="floating-label-input">
                                  <input
                                    type="text"
                                    id="audienceGenderDemographics"
                                    name="audienceGenderDemographics"
                                    value={formData.audienceGenderDemographics}
                                    onChange={handleInfluencerChange}
                                    placeholder=" "
                                  />
                                  <label htmlFor="audienceGenderDemographics">Audience Gender Split</label>
                                  <div className="input-focus-line"></div>
                                </div>
                              </div>
                              
                              <div className="audience-chart">
                                <div className="chart-title">Your Audience Demographics</div>
                                <div className="chart-visualization">
                                  {/* Interactive audience visualization */}
                                  <div className="demo-chart">
                                    <div className="chart-bar" style={{ height: '65%' }}>
                                      <span className="bar-label">18-24</span>
                                    </div>
                                    <div className="chart-bar" style={{ height: '85%' }}>
                                      <span className="bar-label">25-34</span>
                                    </div>
                                    <div className="chart-bar" style={{ height: '45%' }}>
                                      <span className="bar-label">35-44</span>
                                    </div>
                                    <div className="chart-bar" style={{ height: '30%' }}>
                                      <span className="bar-label">45+</span>
                                    </div>
                                  </div>
                                  <div className="gender-split">
                                    <div className="gender-circle female" style={{ width: '60%' }}>
                                      <span>Female</span>
                                    </div>
                                    <div className="gender-circle male" style={{ width: '40%' }}>
                                      <span>Male</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                          
                          {/* Categories Tab */}
                          {activeTab === 'categories' && (
                            <motion.div
                              key="categories"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="tab-content"
                            >
                              <div className="industry-section">
                                <h4 className="section-title">Select Your Industries</h4>
                                <p className="section-description">Choose categories that represent your content</p>
                                
                                <div className="floating-categories">
                                  <div className="categories-grid">
                                    {industryOptions.map((industry, index) => (
                                      <motion.div
                                        key={industry}
                                        className={`industry-tag ${selectedIndustries.includes(industry) ? 'selected' : ''}`}
                                        onClick={() => handleIndustryTagClick(industry)}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ 
                                          opacity: 1, 
                                          y: 0,
                                          transition: { delay: index * 0.02 }
                                        }}
                                        whileHover={{ 
                                          scale: 1.05,
                                          boxShadow: '0 0 15px rgba(255, 125, 0, 0.5)'
                                        }}
                                        whileTap={{ scale: 0.95 }}
                                      >
                                        {industry}
                                        {selectedIndustries.includes(industry) && (
                                          <motion.div 
                                            className="check-icon"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ duration: 0.2 }}
                                          >
                                            <FaCheckCircle />
                                          </motion.div>
                                        )}
                                      </motion.div>
                                    ))}
                                  </div>
                                </div>
                                
                                <motion.div 
                                  className="selected-industries"
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ 
                                    opacity: selectedIndustries.length > 0 ? 1 : 0,
                                    height: selectedIndustries.length > 0 ? 'auto' : 0
                                  }}
                                  transition={{ duration: 0.3 }}
                                >
                                  <h4>Selected Industries:</h4>
                                  <div className="selected-items">
                                    {selectedIndustries.length === 0 ? (
                                      <span className="no-selection">None selected</span>
                                    ) : (
                                      selectedIndustries.map((industry, idx) => (
                                        <motion.span 
                                          key={idx} 
                                          className="selected-tag"
                                          initial={{ opacity: 0, x: -10 }}
                                          animate={{ opacity: 1, x: 0 }}
                                          exit={{ opacity: 0, x: 10 }}
                                          transition={{ duration: 0.2 }}
                                        >
                                          {industry}
                                          <span 
                                            className="remove-tag" 
                                            onClick={() => removeIndustry(industry)}
                                          >
                                            ×
                                          </span>
                                        </motion.span>
                                      ))
                                    )}
                                  </div>
                                </motion.div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div className="form-actions">
                          <MagneticButton 
                            type="button" 
                            className="secondary-btn prev-btn"
                            onClick={handlePrevStep}
                          >
                            <FaChevronLeft className="btn-icon" />
                            <span>Back</span>
                          </MagneticButton>
                          
                          <MagneticButton 
                            type="submit" 
                            className="primary-btn next-btn"
                          >
                            <span>Next Step</span>
                            <FaChevronRight className="btn-icon" />
                          </MagneticButton>
                        </div>
                      </motion.div>
                    )}
                    
                    {/* Step 3: Platforms */}
                    {currentStep === 3 && (
                      <motion.div
                        key="step3"
                        variants={formVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="form-step"
                      >
                        <div className="step-header">
                          <h3 className="step-title">Your Social Media Presence</h3>
                          <p className="step-description">Select platforms where you create content</p>
                        </div>
                        
                        <motion.div 
                          className="platforms-section"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4 className="section-title">Select Your Platforms</h4>
                          
                          <div className="platforms-grid">
                            {platformOptions.map((platform, index) => (
                              <motion.div
                                key={platform}
                                className={`platform-card ${selectedPlatforms.includes(platform) ? 'selected' : ''}`}
                                onClick={() => handlePlatformIconClick(platform)}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ 
                                  opacity: 1, 
                                  scale: 1,
                                  transition: { delay: index * 0.05 }
                                }}
                                whileHover={{ 
                                  y: -5,
                                  boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
                                }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <div className="platform-icon-wrapper">
                                  {platformIcons[platform]}
                                  
                                  <motion.div 
                                    className="platform-glow"
                                    animate={{
                                      scale: [1, 1.2, 1],
                                      opacity: selectedPlatforms.includes(platform) ? [0.5, 0.8, 0.5] : 0
                                    }}
                                    transition={{
                                      duration: 2,
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  />
                                </div>
                                <div className="platform-name">{platform}</div>
                                
                                {selectedPlatforms.includes(platform) && (
                                  <motion.div 
                                    className="platform-selected-indicator"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                  >
                                    <FaCheckCircle />
                                  </motion.div>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                        
                        {/* Platform details */}
                        <AnimatePresence>
                          {selectedPlatforms.length > 0 && (
                            <motion.div 
                              className="platform-details-section"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ 
                                opacity: 1, 
                                height: 'auto',
                                transition: { duration: 0.5 }
                              }}
                              exit={{ opacity: 0, height: 0 }}
                            >
                              <h4 className="section-title">Platform Details</h4>
                              <p className="section-description">Add your handles and pricing information</p>
                              
                              <div className="platform-cards-container">
                                {selectedPlatforms.map((platform, index) => (
                                  <motion.div 
                                    key={platform} 
                                    className="platform-detail-card"
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ 
                                      opacity: 1, 
                                      scale: 1,
                                      y: 0,
                                      transition: { delay: index * 0.1 }
                                    }}
                                  >
                                    <div className="platform-card-header">
                                      <div className="platform-icon-large">
                                        {platformIcons[platform]}
                                      </div>
                                      <h5>{platform}</h5>
                                    </div>
                                    
                                    <div className="platform-inputs">
                                      <div className="floating-label-group">
                                        <div className="floating-label-input">
                                          <input
                                            type="text"
                                            id={`${platform}-handle`}
                                            value={platformDetails[platform]?.handle || ''}
                                            onChange={(e) =>
                                              handlePlatformDetailChange(platform, 'handle', e.target.value)
                                            }
                                            placeholder=" "
                                          />
                                          <label htmlFor={`${platform}-handle`}>Username/Handle</label>
                                          <div className="input-focus-line"></div>
                                        </div>
                                      </div>
                                      
                                      <div className="floating-label-group">
                                        <div className="floating-label-input">
                                          <input
                                            type="number"
                                            id={`${platform}-price`}
                                            value={platformDetails[platform]?.price || ''}
                                            onChange={(e) =>
                                              handlePlatformDetailChange(platform, 'price', e.target.value)
                                            }
                                            placeholder=" "
                                          />
                                          <label htmlFor={`${platform}-price`}>Price per Post ($)</label>
                                          <div className="input-focus-line"></div>
                                        </div>
                                      </div>
                                      
                                      <div className="platform-preview">
                                        {platformDetails[platform]?.handle && (
                                          <div className="handle-preview">
                                            <span className="preview-label">Preview:</span>
                                            <span className="handle-text">@{platformDetails[platform]?.handle}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                        
                        <div className="form-actions">
                          <MagneticButton 
                            type="button" 
                            className="secondary-btn prev-btn"
                            onClick={handlePrevStep}
                          >
                            <FaChevronLeft className="btn-icon" />
                            <span>Back</span>
                          </MagneticButton>
                          
                          <MagneticButton 
                            type="submit" 
                            className="primary-btn submit-btn"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <div className="loader-container">
                                <div className="spinner"></div>
                                <span>Submitting...</span>
                              </div>
                            ) : (
                              <>
                                <span>Complete Registration</span>
                                <div className="submit-glow"></div>
                              </>
                            )}
                          </MagneticButton>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </form>
              )}
            </motion.div>
          </div>
        </ParallaxLayer>
        
        <ParallaxLayer offset={1} speed={0.8} className="parallax-content-layer" />
        <ParallaxLayer offset={2} speed={1.2} className="parallax-content-layer" />
      </Parallax>
      
      {/* Floating shape elements */}
      <div className="floating-shapes">
        <motion.div 
          className="floating-shape shape1"
          animate={{
            y: [0, -15, 0],
            rotate: [0, 5, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="floating-shape shape2"
          animate={{
            y: [0, 20, 0],
            rotate: [0, -8, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        />
        <motion.div 
          className="floating-shape shape3"
          animate={{
            y: [0, -25, 0],
            rotate: [0, 12, 0],
            scale: [1, 1.08, 1]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
        />
      </div>
      
      {/* Floating influencer statistics */}
      <motion.div 
        className="stats-card"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <div className="stats-header">
          <h4>Influencer Network</h4>
          <div className="stats-icon">
            <FaUserFriends />
          </div>
        </div>
        <div className="stats-numbers">
          <div className="stat">
            <div className="stat-value">10k+</div>
            <div className="stat-label">Active Influencers</div>
          </div>
          <div className="stat">
            <div className="stat-value">$250M+</div>
            <div className="stat-label">Campaign Revenue</div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="benefits-card"
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
      >
        <div className="benefits-content">
          <h4>Member Benefits</h4>
          <ul className="benefits-list">
            <li>Early access to premium brand deals</li>
            <li>Performance analytics dashboard</li>
            <li>Content creation tools & resources</li>
          </ul>
        </div>
      </motion.div>
    </div>
  );
}

export default InfluencerSignUpForm;