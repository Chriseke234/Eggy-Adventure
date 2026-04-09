import React from 'react'
import { motion } from 'framer-motion'

interface ScoreBarProps {
  label: string
  score: number
  max: number
  color: string
}

const ScoreBar: React.FC<ScoreBarProps> = ({ label, score, max, color }) => (
  <div className="space-y-1">
    <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/60">
      <span>{label}</span>
      <span>{score}/{max}</span>
    </div>
    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(score / max) * 100}%` }}
        transition={{ duration: 1, delay: 0.5 }}
        className={`h-full ${color}`}
      />
    </div>
  </div>
)

interface ScoreBreakdownProps {
  scores: {
    clarity: number
    specificity: number
    creativity: number
    effectiveness: number
  }
}

const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ scores }) => {
  const total = scores.clarity + scores.specificity + scores.creativity + scores.effectiveness
  
  const getBadge = () => {
    if (total >= 90) return { text: 'Legendary', color: 'bg-gold' }
    if (total >= 70) return { text: 'Advanced', color: 'bg-teal' }
    if (total >= 40) return { text: 'Intermediate', color: 'bg-orange' }
    return { text: 'Beginner', color: 'bg-navy border border-white/20' }
  }

  const badge = getBadge()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-fredoka text-lg text-gold">Prompt Score</h4>
        <div className={`${badge.color} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`}>
          {badge.text}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
        <ScoreBar label="Clarity" score={scores.clarity} max={30} color="bg-teal" />
        <ScoreBar label="Specificity" score={scores.specificity} max={30} color="bg-orange" />
        <ScoreBar label="Creativity" score={scores.creativity} max={20} color="bg-gold" />
        <ScoreBar label="Effectiveness" score={scores.effectiveness} max={20} color="bg-white" />
      </div>
    </div>
  )
}

export default ScoreBreakdown
