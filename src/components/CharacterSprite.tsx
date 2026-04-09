import React from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export type CharacterType = 
  | 'eggy' 
  | 'sparkle' 
  | 'fix-it-favour' 
  | 'mama-kalabari' 
  | 'danfo-dash' 
  | 'bad-egg-bandit' 
  | 'journal-jollof' 
  | 'zuma-guardian'

export type CharacterState = 'idle' | 'happy' | 'talking' | 'sad' | 'special'

interface CharacterSpriteProps {
  type: CharacterType
  state?: CharacterState
  size?: number | string
  className?: string
  onClick?: () => void
}

const CharacterSprite: React.FC<CharacterSpriteProps> = ({ 
  type, 
  state = 'idle', 
  size = 120, 
  className,
  onClick 
}) => {
  const getAnimations = () => {
    switch (state) {
      case 'happy':
        return {
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
          transition: { duration: 0.5, repeat: Infinity }
        }
      case 'talking':
        return {
          scaleX: [1, 1.05, 1],
          transition: { duration: 0.2, repeat: Infinity }
        }
      case 'sad':
        return {
          y: [0, 5, 0],
          rotate: [-2, 2, -2],
          opacity: 0.8,
          transition: { duration: 2, repeat: Infinity }
        }
      case 'special':
        return {
          rotate: [0, 360],
          scale: [1, 1.2, 1],
          transition: { duration: 3, repeat: Infinity }
        }
      case 'idle':
      default:
        return {
          y: [0, -5, 0],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
    }
  }

  const renderSVG = () => {
    switch (type) {
      case 'sparkle':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]">
            <motion.path 
              d="M50 0 L60 40 L100 50 L60 60 L50 100 L40 60 L0 50 L40 40 Z" 
              fill="#E9C46A"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </svg>
        )
      case 'danfo-dash':
        return (
          <svg viewBox="0 0 120 100" className="w-full h-full">
             <rect x="10" y="30" width="100" height="60" rx="10" fill="#E9C46A" />
             <rect x="20" y="40" width="30" height="20" rx="4" fill="#87CEEB" />
             <rect x="70" y="40" width="30" height="20" rx="4" fill="#87CEEB" />
             <rect x="10" y="60" width="100" height="10" fill="black" />
             <circle cx="30" cy="90" r="10" fill="#333" />
             <circle cx="90" cy="90" r="10" fill="#333" />
          </svg>
        )
      case 'mama-kalabari':
        return (
           <svg viewBox="0 0 100 100" className="w-full h-full">
              <ellipse cx="50" cy="40" rx="30" ry="35" fill="#F4A261" />
              <path d="M20 40 Q50 10 80 40" stroke="#8B0000" strokeWidth="8" fill="none" />
              <circle cx="40" cy="35" r="4" fill="black" />
              <circle cx="60" cy="35" r="4" fill="black" />
              <path d="M45 50 Q50 55 55 50" stroke="black" fill="none" />
              <circle cx="50" cy="65" r="5" fill="#FFD700" />
              <circle cx="40" cy="68" r="4" fill="#FFD700" />
              <circle cx="60" cy="68" r="4" fill="#FFD700" />
           </svg>
        )
      case 'journal-jollof':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
             <ellipse cx="50" cy="50" rx="35" ry="40" fill="#E76F51" />
             <path d="M30 30 Q50 10 70 30" fill="white" />
             <circle cx="40" cy="45" r="3" fill="black" />
             <circle cx="60" cy="45" r="3" fill="black" />
             <path d="M40 60 Q50 70 60 60" stroke="white" strokeWidth="2" fill="none" />
          </svg>
        )
      case 'fix-it-favour':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
             <ellipse cx="50" cy="50" rx="35" ry="40" fill="#E9C46A" />
             <rect x="35" y="10" width="30" height="10" fill="#2A9D8F" />
             <rect x="45" y="5" width="10" height="20" fill="#2A9D8F" />
             <circle cx="40" cy="45" r="3" fill="black" />
             <circle cx="60" cy="45" r="3" fill="black" />
             <path d="M45 30 L55 30 M50 25 L50 35" stroke="white" strokeWidth="2" />
          </svg>
        )
      case 'bad-egg-bandit':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
             <ellipse cx="50" cy="50" rx="35" ry="40" fill="#264653" />
             <path d="M20 30 L80 50" stroke="black" strokeWidth="15" opacity="0.8" />
             <circle cx="40" cy="45" r="4" fill="#E76F51" />
             <circle cx="60" cy="45" r="4" fill="#E76F51" />
             <path d="M40 70 Q50 60 60 70" stroke="white" strokeWidth="3" fill="none" />
          </svg>
        )
       case 'zuma-guardian':
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full">
             <path d="M10 90 L50 10 L90 90 Z" fill="#4A4A4A" />
             <circle cx="45" cy="40" r="3" fill="#00FF00" />
             <circle cx="55" cy="40" r="3" fill="#00FF00" />
             <path d="M40 60 Q50 65 60 60" stroke="#00FF00" strokeWidth="1" fill="none" />
          </svg>
        )
      case 'eggy':
      default:
        return (
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <defs>
              <linearGradient id="eggGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E9C46A" />
              </linearGradient>
            </defs>
            <ellipse cx="50" cy="60" rx="40" ry="50" fill="url(#eggGrad)" />
            <circle cx="35" cy="50" r="4" fill="#264653" />
            <circle cx="65" cy="50" r="4" fill="#264653" />
            <path d="M40 75 Q50 85 60 75" fill="none" stroke="#264653" strokeWidth="3" strokeLinecap="round" />
            <ellipse cx="30" cy="50" rx="8" ry="4" fill="#F4A261" opacity="0.3" />
            <ellipse cx="70" cy="50" rx="8" ry="4" fill="#F4A261" opacity="0.3" />
          </svg>
        )
    }
  }

  return (
    <motion.div
      animate={getAnimations()}
      style={{ width: size, height: typeof size === 'number' ? size * 1.2 : size }}
      className={clsx("relative inline-block cursor-pointer", className)}
      onClick={onClick}
    >
      {renderSVG()}
    </motion.div>
  )
}

export default CharacterSprite
