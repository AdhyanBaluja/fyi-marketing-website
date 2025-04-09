import React from 'react';
import styles from './MorphingNebulaLoader.module.css';

const MorphingNebulaLoader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <svg className={styles.loaderSvg} viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Animated multi-stop linear gradient */}
          <linearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7D00">
              <animate attributeName="stop-color" values="#FF7D00; #ff9a40; #FF7D00" dur="7s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#ff9a40">
              <animate attributeName="stop-color" values="#ff9a40; #FF7D00; #ff9a40" dur="7s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FF7D00">
              <animate attributeName="stop-color" values="#FF7D00; #ff9a40; #FF7D00" dur="7s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Glow filter for a neon effect */}
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Noise filter via turbulence (optional for extra texture) */}
          <filter id="turbulenceNoise">
            <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" result="noise"/>
            <feColorMatrix in="noise" type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0.05 0" />
          </filter>
        </defs>

        {/* === MAIN MORPHING NEBULA SHAPE === */}
        <path filter="url(#neonGlow)" fill="url(#nebulaGradient)"
          d="M125,50 C160,50 190,80 190,125 C190,170 160,200 125,200 C90,200 60,170 60,125 C60,80 90,50 125,50"
        >
          <animate attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M125,50 C160,50 190,80 190,125 C190,170 160,200 125,200 C90,200 60,170 60,125 C60,80 90,50 125,50;
              M130,45 C165,55 195,90 180,125 C165,160 130,200 95,195 C60,190 40,150 50,115 C60,80 95,40 130,45;
              M125,50 C160,50 190,80 190,125 C190,170 160,200 125,200 C90,200 60,170 60,125 C60,80 90,50 125,50
            "
          />
        </path>

        {/* === ROTATING OUTER SWIRL PATH === */}
        <path fill="none" stroke="#FF7D00" strokeWidth="2" opacity="0.6"
          d="
            M125,15
            C165,30 205,75 225,125
            C205,175 165,220 125,235
            C85,220 45,175 25,125
            C45,75 85,30 125,15
          "
          filter="url(#neonGlow)"
        >
          <animateTransform attributeName="transform" type="rotate"
            from="0 125 125" to="360 125 125" dur="10s" repeatCount="indefinite" />
        </path>

        {/* === ORBITING PARTICLES === */}
        <circle cx="0" cy="0" r="3" fill="#FF7D00" filter="url(#neonGlow)">
          <animateMotion dur="5s" repeatCount="indefinite"
            path="M125,125 m-70,0 a70,70 0 1,1 140,0 a70,70 0 1,1 -140,0" />
          <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="2" fill="#ff9a40" filter="url(#neonGlow)">
          <animateMotion dur="4s" repeatCount="indefinite"
            path="M125,125 m-50,0 a50,50 0 1,1 100,0 a50,50 0 1,1 -100,0" />
          <animate attributeName="opacity" values="0;0.8;0" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="2.5" fill="#FF7D00" filter="url(#neonGlow)">
          <animateMotion dur="6s" repeatCount="indefinite"
            path="M125,125 m-90,0 a90,90 0 1,1 180,0 a90,90 0 1,1 -180,0" />
          <animate attributeName="opacity" values="0;0.9;0" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* === ADDITIONAL INTERACTIVE PARTICLES (Optional) === */}
        <circle cx="0" cy="0" r="1.5" fill="#ff9a40" filter="url(#neonGlow)">
          <animateMotion dur="3.5s" repeatCount="indefinite"
            path="M125,125 m-30,0 a30,30 0 1,1 60,0 a30,30 0 1,1 -60,0" />
          <animate attributeName="opacity" values="0;1;0" dur="3.5s" repeatCount="indefinite" />
        </circle>

        {/* === ANIMATED LOADING TEXT === */}
        <text x="125" y="230" textAnchor="middle" fill="#FF7D00" fontSize="14" fontWeight="bold"
          filter="url(#neonGlow)">
          <animate attributeName="opacity" values="0.6;1;0.6" dur="3s" repeatCount="indefinite" />
          Loading...
        </text>
      </svg>
    </div>
  );
};

export default MorphingNebulaLoader;
