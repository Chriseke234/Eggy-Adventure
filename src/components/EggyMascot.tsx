import React from 'react'
import { motion } from 'framer-motion'

interface EggyMascotProps {
  expression?: 'happy' | 'thinking' | 'sleeping' | 'excited'
  scale?: number
}

const EggyMascot: React.FC<EggyMascotProps> = ({ expression = 'happy', scale = 1 }) => {
  return (
    <motion.div 
      className="relative w-48 h-64 flex items-center justify-center mx-auto"
      style={{ scale }}
      animate={{
        y: [0, -10, 0],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Shadow */}
      <motion.div 
        className="absolute bottom-4 w-32 h-4 bg-navy/20 rounded-full blur-md"
        animate={{ scaleX: [1, 0.8, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Egg Body */}
      <div className="relative w-40 h-52 bg-gradient-to-br from-white to-gray-200 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] shadow-xl border-4 border-white/50 overflow-hidden">
        {/* Navy "Screen" Face Area */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-28 h-20 bg-navy rounded-2xl flex items-center justify-center gap-6 border-2 border-teal/50 shadow-inner">
          {/* Eyes */}
          <motion.div 
            className="w-4 h-6 bg-teal rounded-full shadow-[0_0_10px_#2A9D8F]"
            animate={expression === 'happy' ? {
              scaleY: [1, 0.1, 1],
            } : {}}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.div 
            className="w-4 h-6 bg-teal rounded-full shadow-[0_0_10px_#2A9D8F]"
            animate={expression === 'happy' ? {
              scaleY: [1, 0.1, 1],
            } : {}}
            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
          />
        </div>

        {/* Teal Stripes/Details */}
        <div className="absolute bottom-10 left-0 right-0 h-4 bg-teal/20" />
        <div className="absolute top-0 right-8 w-8 h-8 bg-gold/30 rounded-full blur-xl" />
      </div>

      {/* Mechanical Hub Caps / Ears */}
      <div className="absolute top-28 -left-2 w-8 h-12 bg-gray-300 rounded-l-full border-r-4 border-navy/20" />
      <div className="absolute top-28 -right-2 w-8 h-12 bg-gray-300 rounded-r-full border-l-4 border-navy/20" />
      
      {/* Small Legs */}
      <div className="absolute -bottom-2 left-12 w-4 h-6 bg-navy rounded-full" />
      <div className="absolute -bottom-2 right-12 w-4 h-6 bg-navy rounded-full" />
    </motion.div>
  )
}

export default EggyMascot
