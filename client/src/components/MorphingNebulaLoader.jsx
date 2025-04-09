import React from 'react';
import styles from './MorphingNebulaLoader.module.css';

const MorphingNebulaLoader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <svg className={styles.loaderSvg} viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Animated Gradient */}
          <linearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7D00">
              <animate attributeName="stop-color"
                       values="#FF7D00; #ff9a40; #FF7D00"
                       dur="6s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FF7D00">
              <animate attributeName="stop-color"
                       values="#FF7D00; #ff9a40; #FF7D00"
                       dur="6s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
          {/* Glow Filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === Main Morphing Nebula Shape === */}
        <path 
          filter="url(#glow)"
          fill="url(#nebulaGradient)"
          d="M100,40 C130,40 160,70 160,100 C160,130 130,160 100,160 C70,160 40,130 40,100 C40,70 70,40 100,40"
        >
          <animate 
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M100,40 C130,40 160,70 160,100 C160,130 130,160 100,160 C70,160 40,130 40,100 C40,70 70,40 100,40;
              M110,35 C135,45 165,75 155,100 C145,125 115,155 90,150 C65,145 40,120 45,95 C50,70 70,30 110,35;
              M100,40 C130,40 160,70 160,100 C160,130 130,160 100,160 C70,160 40,130 40,100 C40,70 70,40 100,40
            "
          />
        </path>

        {/* === Rotating Outer Swirl === */}
        <path 
          d="
            M100,10
            C140,25 175,65 190,100 
            C175,135 140,175 100,190
            C60,175 25,135 10,100
            C25,65 60,25 100,10
          "
          fill="none"
          stroke="#FF7D00"
          strokeWidth="2"
          opacity="0.6"
          filter="url(#glow)"
        >
          <animateTransform 
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 100 100"
            to="360 100 100"
            dur="8s"
            repeatCount="indefinite"
          />
        </path>

        {/* === Orbiting Particles === */}
        <circle cx="10" cy="10" r="3" fill="#FF7D00" filter="url(#glow)">
          <animateMotion 
            dur="5s" 
            repeatCount="indefinite" 
            path="M100,100 m-60,0 a60,60 0 1,1 120,0 a60,60 0 1,1 -120,0" 
          />
          <animate attributeName="opacity" values="0;1;0" dur="5s" repeatCount="indefinite" />
        </circle>
        <circle cx="10" cy="10" r="2" fill="#ff9a40" filter="url(#glow)">
          <animateMotion 
            dur="4s" 
            repeatCount="indefinite" 
            path="M100,100 m-40,0 a40,40 0 1,1 80,0 a40,40 0 1,1 -80,0" 
          />
          <animate attributeName="opacity" values="0;0.8;0" dur="4s" repeatCount="indefinite" />
        </circle>
        <circle cx="10" cy="10" r="2.5" fill="#FF7D00" filter="url(#glow)">
          <animateMotion 
            dur="6s" 
            repeatCount="indefinite" 
            path="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" 
          />
          <animate attributeName="opacity" values="0;0.9;0" dur="6s" repeatCount="indefinite" />
        </circle>

        {/* === Optional: Animated Loading Text === */}
        <text x="100" y="180" textAnchor="middle" fill="#FF7D00" fontSize="12" fontWeight="bold" filter="url(#glow)">
          <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
          Loading...
        </text>
      </svg>
    </div>
  );
};

export default MorphingNebulaLoader;
