import React from 'react'
import { motion } from 'framer-motion'

export interface AvatarConfig {
  shellColor: string
  outfit: 'none' | 'agbada' | 'gele' | 'school_uniform' | 'masquerade' | 'cap_gown' | 'ankara_cape' | 'super_hero'
  accessory: 'none' | 'beads' | 'anklet' | 'drum' | 'crown' | 'cool_shades' | 'monocle' | 'space_helmet'
  expression: 'happy' | 'determined' | 'cheeky' | 'wise' | 'surprised'
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

        {/* Outfits Layer */}
        {config.outfit === 'agbada' && (
          <path d="M30,130 L170,130 L180,220 C180,240 140,245 100,245 C60,245 20,240 20,220 L30,130 Z" fill="rgba(255,255,255,0.9)" stroke="gold" strokeWidth="2" />
        )}
        {config.outfit === 'gele' && (
          <path d="M50,40 C30,30 20,50 40,70 L160,70 C180,50 170,30 150,40 C130,50 70,50 50,40 Z" fill="#FF69B4" stroke="#C71585" strokeWidth="2" />
        )}
        {config.outfit === 'ankara_cape' && (
           <path d="M20,140 Q100,100 180,140 L200,240 Q100,260 0,240 Z" fill="#E76F51" stroke="#264653" strokeWidth="3" strokeDasharray="5 2" />
        )}
        {config.outfit === 'school_uniform' && (
          <g>
            <path d="M40,140 L160,140 L170,230 L30,230 Z" fill="#FFFFFF" />
            <path d="M100,140 L120,180 L100,220 L80,180 Z" fill="#000080" />
          </g>
        )}
        {config.outfit === 'super_hero' && (
           <g>
              <path d="M40,140 L160,140 L180,240 L20,240 Z" fill="#E63946" />
              <circle cx="100" cy="190" r="25" fill="#F1FAEE" stroke="#A8DADC" strokeWidth="2" />
              <path d="M90,200 L110,180" stroke="#1D3557" strokeWidth="5" />
           </g>
        )}

        {/* Face Layer (Mouth & Eyes) */}
        <g transform="translate(100, 110)">
          {/* Eyes */}
          <circle cx="-25" cy="-10" r="8" fill="white" />
          <circle cx="25" cy="-10" r="8" fill="white" />
          <circle cx="-25" cy="-10" r="4" fill="navy" />
          <circle cx="25" cy="-10" r="4" fill="navy" />
          
          {/* Expressions */}
          {config.expression === 'happy' && <path d="M-20,20 Q0,40 20,20" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />}
          {config.expression === 'determined' && <line x1="-15" y1="30" x2="15" y2="30" stroke="white" strokeWidth="4" strokeLinecap="round" />}
          {config.expression === 'cheeky' && <path d="M-20,20 Q5,45 20,15" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />}
          {config.expression === 'wise' && <path d="M-15,35 Q0,25 15,35" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" />}
          {config.expression === 'surprised' && <circle cx="0" cy="25" r="8" fill="none" stroke="white" strokeWidth="3" />}
        </g>

        {/* Accessories Layer */}
        {config.accessory === 'cool_shades' && (
           <g transform="translate(100, 100)">
              <rect x="-45" y="-10" width="35" height="20" rx="5" fill="#111" />
              <rect x="10" y="-10" width="35" height="20" rx="5" fill="#111" />
              <line x1="-10" y1="0" x2="10" y2="0" stroke="#111" strokeWidth="4" />
           </g>
        )}
        {config.accessory === 'monocle' && (
           <g transform="translate(125, 100)">
              <circle cx="0" cy="0" r="15" fill="rgba(255,255,255,0.2)" stroke="#DAA520" strokeWidth="2" />
              <line x1="15" y1="0" x2="30" y2="-20" stroke="#DAA520" strokeWidth="1" />
           </g>
        )}
        {config.accessory === 'space_helmet' && (
           <circle cx="100" cy="100" r="70" fill="rgba(255,255,255,0.1)" stroke="white" strokeWidth="4" strokeDasharray="10 5" />
        )}
        {config.accessory === 'crown' && (
          <path d="M70,40 L85,20 L100,40 L115,20 L130,40 L130,60 L70,60 Z" fill="gold" stroke="#B8860B" />
        )}
        {config.accessory === 'beads' && (
          <circle cx="100" cy="150" r="45" fill="none" stroke="#FF4500" strokeWidth="8" strokeDasharray="10 5" />
        )}

        {/* Cracks Layer (Level Based) */}
        {level >= 3 && (
           <g transform="translate(100, 110)">
              <path d="M-40,-40 L-20,-60 L0,-40 L20,-60 L40,-40" fill="none" stroke="gold" strokeWidth="2" />
           </g>
        )}
      </svg>
      
      {/* Level Badge */}
      <div className="absolute -bottom-2 -right-2 bg-navy border-2 border-gold rounded-full w-12 h-12 flex items-center justify-center font-fredoka text-gold shadow-lg z-20">
         Lvl {level}
      </div>
    </motion.div>
  )
}

export default EggAvatar
