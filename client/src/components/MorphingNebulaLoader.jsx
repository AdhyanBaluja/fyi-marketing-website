import React from 'react';
import styles from './MorphingNebulaLoader.module.css';

const MorphingNebulaLoader = () => {
  return (
    <div className={styles.loaderWrapper}>
      <svg className={styles.loaderSvg} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="nebulaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7D00">
              <animate attributeName="stop-color" values="#FF7D00; #ff9a40; #FF7D00" dur="3s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FF7D00">
              <animate attributeName="stop-color" values="#FF7D00; #ff9a40; #FF7D00" dur="3s" repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
        <path fill="url(#nebulaGradient)"
              d="M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10 Z">
          <animate attributeName="d" 
            values="
              M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10 Z;
              M50 15 C75 10, 95 35, 90 55 C85 75, 70 95, 50 90 C30 85, 5 70, 10 50 C15 30, 35 5, 50 15 Z;
              M50 10 C70 10, 90 30, 90 50 C90 70, 70 90, 50 90 C30 90, 10 70, 10 50 C10 30, 30 10, 50 10 Z
            "
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    </div>
  );
};

export default MorphingNebulaLoader;
