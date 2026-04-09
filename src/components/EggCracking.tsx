import React from 'react'
import { motion } from 'framer-motion'

const EggCracking: React.FC = () => {
  return (
    <div className="relative w-48 h-64 mx-auto flex items-center justify-center">
      {/* Glow Effect */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute inset-0 bg-gold/20 blur-3xl rounded-full"
      />

      <motion.div 
        className="relative w-40 h-52"
        animate={{
          rotate: [0, -2, 2, -2, 0],
          x: [0, -2, 2, -2, 0]
        }}
        transition={{ duration: 0.5, repeat: Infinity }}
      >
        {/* Top Shell */}
        <motion.div 
          animate={{
            y: [0, -10, 0]
          }}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-0 left-0 right-0 h-[60%] bg-gradient-to-b from-white to-gray-200 rounded-[50%_50%_0_0_/_60%_60%_0_0] border-t-4 border-x-4 border-white shadow-xl z-10"
          style={{
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 80%, 85% 70%, 70% 85%, 50% 70%, 30% 85%, 15% 70%, 0% 80%)'
          }}
        />

        {/* Bottom Shell */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-gray-300 to-gray-100 rounded-[0_0_50%_50%_/_0_0_40%_40%] border-b-4 border-x-4 border-white/50 shadow-inner"
          style={{
            clipPath: 'polygon(0% 20%, 15% 30%, 30% 15%, 50% 30%, 70% 15%, 85% 30%, 100% 20%, 100% 100%, 0% 100%)'
          }}
        />

        {/* Eggy Peeking through the crack */}
        <motion.div 
          animate={{
            scale: [0.8, 1, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-navy rounded-full border-2 border-teal shadow-[0_0_15px_#2A9D8F] z-0 flex items-center justify-center gap-2"
        >
          <div className="w-3 h-3 bg-teal rounded-full animate-pulse" />
          <div className="w-3 h-3 bg-teal rounded-full animate-pulse" />
        </motion.div>
      </motion.div>

      <motion.p 
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute -bottom-8 left-0 right-0 text-center text-gold font-fredoka text-xl tracking-widest"
      >
        Hatch Lab...
      </motion.p>
    </div>
  )
}

export default EggCracking
