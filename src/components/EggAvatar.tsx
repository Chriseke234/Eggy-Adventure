import React from 'react'
import { motion } from 'framer-motion'

export interface AvatarConfig {
  shellColor: string
  outfit: 'none' | 'agbada' | 'gele' | 'school_uniform' | 'masquerade' | 'cap_gown'
  accessory: 'none' | 'beads' | 'anklet' | 'drum' | 'crown'
  expression: 'happy' | 'determined' | 'cheeky' | 'wise'
}

interface EggAvatarProps {
  config: AvatarConfig
  xp?: number
  scale?: number
}

const EggAvatar: React.FC<EggAvatarProps> = ({ config, xp = 0, scale = 1 }) => {
  const level = xp >= 1000 ? 5 : xp >= 500 ? 4 : xp >= 250 ? 3 : xp >= 100 ? 2 : 1

  return (
    <motion.div 
      style={{ scale }}
      className="relative w-48 h-64 mx-auto flex items-center justify-center p-4"
    >
      {/* Leveling Glow/Aura */}
      {level >= 2 && (
        <motion.div 
          animate={{ 
            scale: [1, 1.1 + (level * 0.05), 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`absolute inset-0 blur-3xl rounded-full ${
            level === 5 ? 'bg-gold' : level === 4 ? 'bg-teal' : level === 3 ? 'bg-orange' : 'bg-white/10'
          }`}
        />
      )}

      <svg viewBox="0 0 200 260" className="w-full h-full drop-shadow-2xl overflow-visible">
        {/* Shadow */}
        <ellipse cx="100" cy="240" rx="60" ry="15" fill="rgba(0,0,0,0.2)" />

        {/* Base Egg Shell */}
        <path 
          d="M100,20 C140,20 180,70 180,140 C180,210 145,240 100,240 C55,240 20,210 20,140 C20,70 60,20 100,20 Z" 
          fill={config.shellColor}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="4"
        />

        {/* Outfits */}
        {config.outfit === 'agbada' && (
          <path 
            d="M30,130 L170,130 L180,220 C180,240 140,245 100,245 C60,245 20,240 20,220 L30,130 Z" 
            fill="rgba(255,255,255,0.9)" 
            stroke="gold" 
            strokeWidth="2"
          />
        )}
        {config.outfit === 'gele' && (
          <path 
            d="M50,40 C30,30 20,50 40,70 L160,70 C180,50 170,30 150,40 C130,50 70,50 50,40 Z" 
            fill="#FF69B4" 
            stroke="#C71585" 
            strokeWidth="2"
          />
        )}
        {config.outfit === 'school_uniform' && (
          <g>
            <path d="M40,140 L160,140 L170,230 L30,230 Z" fill="#FFFFFF" />
            <path d="M100,140 L120,180 L100,220 L80,180 Z" fill="#000080" /> {/* Tie */}
          </g>
        )}
        {config.outfit === 'masquerade' && (
          <path 
            d="M20,100 L180,100 L190,240 L10,240 Z" 
            fill="#8B4513" 
            stroke="#D2691E" 
            strokeWidth="4" 
            strokeDasharray="4 2"
          />
        )}
        {config.outfit === 'cap_gown' && (
          <g>
            <path d="M30,120 L170,120 L180,240 L20,240 Z" fill="#000000" />
            <rect x="60" y="30" width="80" height="20" fill="#000000" />
            <path d="M40,40 L160,40 L100,20 Z" fill="#000000" />
          </g>
        )}

        {/* Accessories */}
        {config.accessory === 'beads' && (
          <g>
            <circle cx="100" cy="150" r="45" fill="none" stroke="#FF4500" strokeWidth="8" strokeDasharray="10 5" />
          </g>
        )}
        {config.accessory === 'crown' && (
          <path d="M70,40 L85,20 L100,40 L115,20 L130,40 L130,60 L70,60 Z" fill="gold" stroke="#B8860B" />
        )}
        {config.accessory === 'drum' && (
          <g transform="translate(140, 180) scale(0.6)">
            <ellipse cx="0" cy="0" rx="30" ry="10" fill="#DEB887" />
            <path d="M-30,0 L-20,60 L20,60 L30,0 Z" fill="#8B4513" />
          </g>
        )}
        {config.accessory === 'anklet' && (
          <circle cx="60" cy="230" r="15" fill="none" stroke="#FFD700" strokeWidth="3" strokeDasharray="2 2" />
        )}

        {/* Expression (Face) */}
        <g transform="translate(100, 110)">
          {/* Eyes */}
          <circle cx="-25" cy="-10" r="8" fill="white" />
          <circle cx="25" cy="-10" r="8" fill="white" />
          <circle cx="-25" cy="-10" r="4" fill="navy" />
          <circle cx="25" cy="-10" r="4" fill="navy" />
          
          {/* Mouth */}
          {config.expression === 'happy' && (
            <path d="M-20,20 Q0,40 20,20" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
          )}
          {config.expression === 'determined' && (
            <line x1="-15" y1="30" x2="15" y2="30" stroke="white" strokeWidth="4" strokeLinecap="round" />
          )}
          {config.expression === 'cheeky' && (
            <path d="M-20,20 Q5,45 20,15" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
          )}
          {config.expression === 'wise' && (
            <path d="M-15,35 Q0,25 15,35" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />
          )}

          {/* Level indicators */}
          {level >= 3 && (
            <path d="M-40,-40 L-20,-60 L0,-40 L20,-60 L40,-40" fill="none" stroke="gold" strokeWidth="2" />
          )}
        </g>
      </svg>
      
      {/* Level Badge */}
      <div className="absolute -bottom-2 -right-2 bg-navy border-2 border-gold rounded-full w-12 h-12 flex items-center justify-center font-fredoka text-gold shadow-lg z-20">
         Lvl {level}
      </div>
    </motion.div>
  )
}

export default EggAvatar
