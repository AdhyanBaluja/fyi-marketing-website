import React, { useEffect, useRef, useState } from 'react';
import styles from './CosmicNebulaLoader.module.css';

const CosmicNebulaLoader = () => {
  const canvasRef = useRef(null);
  const loaderWrapperRef = useRef(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingProgress(prev => {
        const newValue = prev + 0.5; // Reduced from 1 to 0.5 (half speed)
        return newValue > 100 ? 100 : newValue;
      });
    }, 100); // Increased from 50ms to 100ms (half speed)
  
    return () => clearInterval(interval);
  }, []);

  // Canvas particle system for background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    const particleCount = 100;
    
    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 100)}, ${Math.random() * 0.5 + 0.1})`,
        speedX: Math.random() * 0.5 - 0.25,
        speedY: Math.random() * 0.5 - 0.25,
        pulseSpeed: Math.random() * 0.04 + 0.02,
        pulseDirection: 1,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
    
    // Draw and animate particles
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(particle => {
        // Move particles
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Pulse particles
        particle.radius += particle.pulseSpeed * particle.pulseDirection;
        if (particle.radius > 3 || particle.radius < 0.5) {
          particle.pulseDirection *= -1;
        }
        
        // Wrap around screen
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
        
        // Draw glow
        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.radius * 3
        );
        gradient.addColorStop(0, `rgba(255, 125, 0, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, 'rgba(255, 125, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      requestAnimationFrame(animate);
    };
    
    const animationId = requestAnimationFrame(animate);
    
    // Handle window resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Add dynamic dust particles and energy burst elements
  useEffect(() => {
    const loaderWrapper = loaderWrapperRef.current;
    if (!loaderWrapper) return;

    // Add cosmic dust particles
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement('div');
      particle.classList.add(styles.dustParticle);
      particle.style.setProperty('--start-x', `${Math.random() * 100}vw`);
      particle.style.setProperty('--start-y', `${Math.random() * 100}vh`);
      particle.style.setProperty('--end-x', `${Math.random() * 100}vw`);
      particle.style.setProperty('--end-y', `${Math.random() * 100}vh`);
      particle.style.setProperty('--duration', `${Math.random() * 10 + 5}s`);
      particle.style.setProperty('--opacity', `${Math.random() * 0.5 + 0.2}`);
      particle.style.setProperty('--mid-opacity', `${Math.random() * 0.3 + 0.6}`);
      loaderWrapper.appendChild(particle);
    }

    // Add energy burst elements for 360-degree effect
    for (let i = 0; i < 36; i++) {
      const burst = document.createElement('div');
      burst.classList.add(styles.energyBurst);
      burst.style.top = '50%';
      burst.style.left = '50%';
      burst.style.transform = `rotate(${i * 10}deg)`;
      burst.style.animationDelay = `${Math.random() * 3}s`;
      loaderWrapper.appendChild(burst);
    }

    // Add energy wave element
    const wave = document.createElement('div');
    wave.classList.add(styles.energyWave);
    loaderWrapper.appendChild(wave);

    // Cleanup function
    return () => {
      const particles = loaderWrapper.querySelectorAll(`.${styles.dustParticle}`);
      const bursts = loaderWrapper.querySelectorAll(`.${styles.energyBurst}`);
      const waves = loaderWrapper.querySelectorAll(`.${styles.energyWave}`);
      
      particles.forEach(particle => particle.remove());
      bursts.forEach(burst => burst.remove());
      waves.forEach(wave => wave.remove());
    };
  }, []);

  return (
    <div className={styles.loaderWrapper} ref={loaderWrapperRef}>
      <canvas ref={canvasRef} className={styles.particleCanvas}></canvas>
      
      <div className={styles.cosmicFlares}>
        {[...Array(5)].map((_, i) => (
          <div key={i} className={`${styles.cosmicFlare} ${styles[`flare${i+1}`]}`}></div>
        ))}
      </div>
      
      <div className={styles.orbitSystem}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${styles.orbit} ${styles[`orbit${i+1}`]}`}>
            <div className={styles.satellite}></div>
          </div>
        ))}
      </div>
      
      <div className={styles.svgContainer}>
        <svg className={styles.loaderSvg} viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Enhanced multi-stop linear gradient with more colors */}
            <linearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF7D00">
                <animate attributeName="stop-color" values="#FF7D00; #ff9a40; #FF5500; #FF7D00" dur="7s" repeatCount="indefinite" />
              </stop>
              <stop offset="25%" stopColor="#ff9a40">
                <animate attributeName="stop-color" values="#ff9a40; #FF7D00; #FF5500; #ff9a40" dur="10s" repeatCount="indefinite" />
              </stop>
              <stop offset="50%" stopColor="#FF5500">
                <animate attributeName="stop-color" values="#FF5500; #FF7D00; #ff9a40; #FF5500" dur="8s" repeatCount="indefinite" />
              </stop>
              <stop offset="75%" stopColor="#ff9a40">
                <animate attributeName="stop-color" values="#ff9a40; #FF5500; #FF7D00; #ff9a40" dur="9s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#FF7D00">
                <animate attributeName="stop-color" values="#FF7D00; #FF5500; #ff9a40; #FF7D00" dur="6s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            {/* Radial gradient for more depth */}
            <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#ffcc88" />
              <stop offset="40%" stopColor="#FF7D00" />
              <stop offset="100%" stopColor="#FF5500" />
              <animate attributeName="fx" values="40%;60%;40%" dur="12s" repeatCount="indefinite" />
              <animate attributeName="fy" values="40%;60%;40%" dur="12s" repeatCount="indefinite" />
            </radialGradient>

            {/* Enhanced neon glow filter */}
            <filter id="enhancedNeonGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="blur" />
              <feComponentTransfer in="blur" result="brightenedBlur">
                <feFuncR type="linear" slope="2.5" />
                <feFuncG type="linear" slope="2.5" />
                <feFuncB type="linear" slope="2.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="brightenedBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Advanced noise filter */}
            <filter id="advancedNoise">
              <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="5" seed="3" 
                            stitchTiles="stitch" result="turbulence">
                <animate attributeName="baseFrequency" values="0.03;0.06;0.03" dur="40s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="8" xChannelSelector="R" yChannelSelector="G" />
            </filter>
            
            {/* Cosmic texture filter */}
            <filter id="cosmicTexture" x="-50%" y="-50%" width="200%" height="200%">
              <feTurbulence type="turbulence" baseFrequency="0.01" numOctaves="2" seed="1" result="turb"/>
              <feDisplacementMap in="SourceGraphic" in2="turb" scale="5" />
            </filter>
            
            {/* Energy waves filter */}
            <filter id="energyWaves">
              <feTurbulence type="fractalNoise" baseFrequency="0.01" numOctaves="1" seed="0" result="noise">
                <animate attributeName="seed" values="0;10;0" dur="15s" repeatCount="indefinite" />
              </feTurbulence>
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="10" xChannelSelector="R" yChannelSelector="G" />
            </filter>
          </defs>

          {/* Background cosmic texture */}
          <circle cx="125" cy="125" r="110" fill="none" stroke="url(#nebulaGradient)" strokeWidth="1" opacity="0.3" filter="url(#cosmicTexture)">
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="10s" repeatCount="indefinite" />
          </circle>
          
          {/* Energy field */}
          <circle cx="125" cy="125" r="100" fill="none" stroke="#FF7D00" strokeWidth="0.5" opacity="0.4">
            <animate attributeName="r" values="100;105;100" dur="8s" repeatCount="indefinite" />
            <animate attributeName="stroke-dasharray" values="5,10;10,15;5,10" dur="10s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" from="0 125 125" to="360 125 125" dur="30s" repeatCount="indefinite" />
          </circle>

          {/* MAIN MORPHING NEBULA SHAPE - MORE COMPLEX */}
          <path filter="url(#enhancedNeonGlow)" fill="url(#nebulaGradient)"
            d="M125,50 C160,50 190,80 190,125 C190,170 160,200 125,200 C90,200 60,170 60,125 C60,80 90,50 125,50">
            <animate attributeName="d" dur="10s" repeatCount="indefinite" 
              values="
                M125,50 C160,50 190,80 190,125 C190,170 160,200 125,200 C90,200 60,170 60,125 C60,80 90,50 125,50;
                M130,45 C175,60 200,90 180,125 C165,160 140,210 95,195 C60,180 40,150 50,115 C60,80 95,40 130,45;
                M115,55 C155,45 190,70 195,120 C200,170 170,210 115,205 C70,200 45,165 50,120 C55,75 85,60 115,55;
                M125,50 C160,50 190,80 190,125 C190,170 160,200 125,200 C90,200 60,170 60,125 C60,80 90,50 125,50"
            />
          </path>

          {/* Core energy - pulsating center */}
          <circle cx="125" cy="125" r="40" fill="url(#coreGradient)" opacity="0.9" filter="url(#enhancedNeonGlow)">
            <animate attributeName="r" values="40;45;40;35;40" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.9;1;0.9" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* ROTATING OUTER SWIRL PATH - ENHANCED */}
          <path fill="none" stroke="#FF7D00" strokeWidth="2" opacity="0.7" filter="url(#enhancedNeonGlow)"
            d="M125,15 C165,30 205,75 225,125 C205,175 165,220 125,235 C85,220 45,175 25,125 C45,75 85,30 125,15">
            <animate attributeName="stroke-dasharray" values="0,20,0,20,0,20,0,20;20,0,20,0,20,0,20,0" dur="10s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" from="0 125 125" to="360 125 125" dur="30s" repeatCount="indefinite" />
          </path>

          {/* Secondary swirl path going opposite direction */}
          <path fill="none" stroke="#ff9a40" strokeWidth="1.5" opacity="0.6" filter="url(#enhancedNeonGlow)"
            d="M125,30 C155,45 185,80 200,125 C185,170 155,205 125,220 C95,205 65,170 50,125 C65,80 95,45 125,30">
            <animate attributeName="stroke-dasharray" values="20,10,5;10,5,20;5,20,10;20,10,5" dur="15s" repeatCount="indefinite" />
            <animateTransform attributeName="transform" type="rotate" from="360 125 125" to="0 125 125" dur="25s" repeatCount="indefinite" />
          </path>

          {/* Energy burst rays */}
          <g opacity="0.5">
            {[...Array(12)].map((_, i) => (
              <line key={i} x1="125" y1="125" x2={125 + 85 * Math.cos(i * Math.PI / 6)} y2={125 + 85 * Math.sin(i * Math.PI / 6)} 
                    stroke="#FF7D00" strokeWidth="1">
                <animate attributeName="opacity" values={`${i % 2 === 0 ? '0.1;0.7;0.1' : '0.7;0.1;0.7'}`} dur={`${5 + i/2}s`} repeatCount="indefinite" />
              </line>
            ))}
          </g>

          {/* ORBITING PARTICLES - MORE OF THEM WITH COMPLEX PATHS */}
          {/* Main orbital particles */}
          {[...Array(5)].map((_, i) => (
            <circle key={i} cx="0" cy="0" r={2 + i * 0.5} fill={i % 2 === 0 ? "#FF7D00" : "#ff9a40"} filter="url(#enhancedNeonGlow)">
              <animateMotion 
                dur={`${4 + i}s`} 
                repeatCount="indefinite"
                path={`M125,125 m-${60 + i * 10},0 a${60 + i * 10},${60 + i * 10} 0 1,${i % 2 === 0 ? 1 : 0} ${2 * (60 + i * 10)},0 a${60 + i * 10},${60 + i * 10} 0 1,${i % 2 === 0 ? 1 : 0} -${2 * (60 + i * 10)},0`} />
              <animate attributeName="opacity" values={`${i % 2 === 0 ? '0;1;0' : '0.2;0.8;0.2'}`} dur={`${4 + i}s`} repeatCount="indefinite" />
              <animate attributeName="r" values={`${2 + i * 0.5};${3 + i * 0.5};${2 + i * 0.5}`} dur={`${2 + i}s`} repeatCount="indefinite" />
            </circle>
          ))}
          
          {/* Secondary particle clusters */}
          {[...Array(3)].map((_, i) => (
            <g key={i}>
              <circle cx="0" cy="0" r="1.5" fill="#ff9a40" opacity="0.7">
                <animateMotion 
                  dur={`${7 - i}s`}
                  repeatCount="indefinite"
                  path={`M${125 + 30 * Math.cos(i * 2 * Math.PI / 3)},${125 + 30 * Math.sin(i * 2 * Math.PI / 3)} m-10,0 a10,10 0 1,1 20,0 a10,10 0 1,1 -20,0`} />
              </circle>
              <circle cx="0" cy="0" r="1" fill="#FF7D00" opacity="0.8">
                <animateMotion 
                  dur={`${6 - i}s`}
                  repeatCount="indefinite"
                  path={`M${125 + 30 * Math.cos(i * 2 * Math.PI / 3)},${125 + 30 * Math.sin(i * 2 * Math.PI / 3)} m-7,0 a7,7 0 1,0 14,0 a7,7 0 1,0 -14,0`} />
              </circle>
            </g>
          ))}
          
          {/* Stardust particles */}
          {[...Array(8)].map((_, i) => (
            <circle key={i} cx={125 + 50 * Math.cos(i * Math.PI / 4)} cy={125 + 50 * Math.sin(i * Math.PI / 4)} r="0.8" fill="#ffffff" opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.8;0.2" dur={`${2 + i * 0.3}s`} repeatCount="indefinite" />
              <animate attributeName="r" values="0.8;1.2;0.8" dur={`${1.5 + i * 0.2}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Interactive energy tendrils */}
          {[...Array(4)].map((_, i) => (
            <path key={i} d={`M125,125 Q${125 + 40 * Math.cos(i * Math.PI / 2)},${125 + 40 * Math.sin(i * Math.PI / 2)} ${125 + 65 * Math.cos(i * Math.PI / 2)},${125 + 65 * Math.sin(i * Math.PI / 2)}`}
                  fill="none" stroke="#FF7D00" strokeWidth="1.5" opacity="0.6" filter="url(#enhancedNeonGlow)">
              <animate attributeName="d" 
                values={`
                  M125,125 Q${125 + 40 * Math.cos(i * Math.PI / 2)},${125 + 40 * Math.sin(i * Math.PI / 2)} ${125 + 65 * Math.cos(i * Math.PI / 2)},${125 + 65 * Math.sin(i * Math.PI / 2)};
                  M125,125 Q${125 + 45 * Math.cos(i * Math.PI / 2 + 0.2)},${125 + 45 * Math.sin(i * Math.PI / 2 + 0.2)} ${125 + 70 * Math.cos(i * Math.PI / 2 + 0.1)},${125 + 70 * Math.sin(i * Math.PI / 2 + 0.1)};
                  M125,125 Q${125 + 35 * Math.cos(i * Math.PI / 2 - 0.2)},${125 + 35 * Math.sin(i * Math.PI / 2 - 0.2)} ${125 + 60 * Math.cos(i * Math.PI / 2 - 0.1)},${125 + 60 * Math.sin(i * Math.PI / 2 - 0.1)};
                  M125,125 Q${125 + 40 * Math.cos(i * Math.PI / 2)},${125 + 40 * Math.sin(i * Math.PI / 2)} ${125 + 65 * Math.cos(i * Math.PI / 2)},${125 + 65 * Math.sin(i * Math.PI / 2)}
                `}
                dur={`${6 + i}s`}
                repeatCount="indefinite"
              />
            </path>
          ))}

          {/* Enhanced loading text with glow and animation */}
          <g>
            <text x="125" y="230" textAnchor="middle" fill="#FF7D00" fontSize="14" fontWeight="bold" filter="url(#enhancedNeonGlow)">
              <animate attributeName="opacity" values="0.7;1;0.7" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="filter" values="url(#enhancedNeonGlow);url(#energyWaves);url(#enhancedNeonGlow)" dur="8s" repeatCount="indefinite" />
              LOADING
            </text>
            <text x="125" y="230" textAnchor="middle" fill="#ffffff" fontSize="14" fontWeight="bold" opacity="0.8">
              <animate attributeName="opacity" values="0;0.2;0" dur="1.5s" repeatCount="indefinite" />
              LOADING
            </text>
          </g>

          {/* Animated progress dots */}
          {[...Array(3)].map((_, i) => (
            <circle key={i} cx={160 + i * 10} cy="230" r="2" fill="#FF7D00">
              <animate attributeName="opacity" values="0.2;1;0.2" dur="1.5s" begin={`${i * 0.3}s`} repeatCount="indefinite" />
            </circle>
          ))}
        </svg>
      </div>

      {/* Progress ring */}
      <div className={styles.progressRing}>
        <div 
          className={styles.progressCircle} 
          style={{
            clipPath: `polygon(50% 50%, 50% 0, ${50 + loadingProgress / 2}% 0, ${loadingProgress > 50 ? 100 : 50 + loadingProgress / 2}% ${loadingProgress > 50 ? (loadingProgress - 50) * 2 : 0}%, ${loadingProgress > 75 ? (150 - loadingProgress) * 4 : 100}% ${loadingProgress > 50 ? 100 : 0}%, ${loadingProgress > 75 ? 0 : 0}% ${loadingProgress > 75 ? 100 : 0}%, 50% 0)`
          }}
        ></div>
      </div>
      
      {/* Status text */}
      <div className={styles.statusText}>
        <div className={styles.statusLine}>INITIALIZING COSMIC GATEWAY</div>
        <div className={styles.statusPercent}>
          <span className={styles.percentValue}>{loadingProgress}</span>%
        </div>
      </div>
    </div>
  );
};

export default CosmicNebulaLoader;