import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, TrendingUp, History, Trophy, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { hatchPrompt } from '../lib/gemini'
import type { HatchResult } from '../lib/gemini'
import { saveSession } from '../lib/sessions'
import EggAvatar from '../components/EggAvatar'
import type { AvatarConfig } from '../components/EggAvatar'

interface Round {
  number: number
  prompt: string
  result: HatchResult
}

const STARTER_PROMPTS = [
  'draw a boat',
  'make a cat',
  'show a robot',
  'draw a tree'
]

const EvolutionPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [rounds, setRounds] = useState<Round[]>([])
  const [currentPrompt, setCurrentPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [starterPrompt] = useState(() => STARTER_PROMPTS[Math.floor(Math.random() * STARTER_PROMPTS.length)])

  const defaultAvatarConfig: AvatarConfig = {
    shellColor: '#2A9D8F',
    outfit: 'none',
    accessory: 'none',
    expression: 'happy'
  }

  const avatarConfig = profile?.avatar_config || defaultAvatarConfig

  const totalScore = (res: HatchResult) => 
    res.score_clarity + res.score_specificity + res.score_creativity + res.score_effectiveness

  const handleNextRound = async () => {
    if (!user || !currentPrompt) return
    
    setLoading(true)
    try {
      const roundNumber = rounds.length + 1
      const missionTitle = `Evolution: ${starterPrompt}`
      const hatchRes = await hatchPrompt(missionTitle, currentPrompt)
      
      const newRound: Round = {
        number: roundNumber,
        prompt: currentPrompt,
        result: hatchRes
      }
      
      const updatedRounds = [...rounds, newRound]
      setRounds(updatedRounds)
      
      // Save session with round_number
      await saveSession(user.id, `evolution_${starterPrompt.replace(/ /g, '_')}`, 'Evolution Challenge', currentPrompt, hatchRes, roundNumber)
      
      if (roundNumber === 5) {
        const firstScore = totalScore(updatedRounds[0].result)
        const finalScore = totalScore(hatchRes)
        
        if (finalScore >= firstScore + 30) {
           const currentBadges = profile?.badges || []
           if (!currentBadges.includes('Evolution Master')) {
             await updateProfile({
               badges: [...currentBadges, 'Evolution Master'],
               xp: (profile?.xp ?? 0) + 200
             })
           }
        }
        setShowTimeline(true)
      } else {
         setCurrentPrompt(currentPrompt) // Prep for next round improvement
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const renderGraph = () => {
    const scores = rounds.map(r => totalScore(r.result))
    if (scores.length < 2) return null

    const width = 300
    const height = 100
    const padding = 20
    const maxScore = 100
    
    const points = scores.map((s, i) => {
      const x = (i / (scores.length - 1)) * (width - 2 * padding) + padding
      const y = height - ((s / maxScore) * (height - 2 * padding) + padding)
      return `${x},${y}`
    }).join(' ')

    return (
      <div className="bg-navy/50 p-6 rounded-3xl border border-white/5 space-y-4">
        <h4 className="text-xs font-bold uppercase tracking-widest text-teal flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolution Pattern
        </h4>
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 overflow-visible">
          {/* Grid lines */}
          <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          
          {/* Path */}
          <motion.polyline
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />

          {/* Points */}
          {scores.map((s, i) => {
            const x = (i / (scores.length - 1)) * (width - 2 * padding) + padding
            const y = height - ((s / maxScore) * (height - 2 * padding) + padding)
            return (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r="4"
                className="fill-gold shadow-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + i * 0.2 }}
              />
            )
          })}

          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2A9D8F" />
              <stop offset="100%" stopColor="#E9C46A" />
            </linearGradient>
          </defs>
        </svg>
        <div className="flex justify-between text-[10px] text-gray-500 font-bold">
           <span>ROUND 1</span>
           <span>ROUND {rounds.length}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-teal font-bold flex items-center gap-2">
          ← Back
        </button>
        <div className="bg-gold/20 text-gold px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Evolution Challenge
        </div>
      </div>

      {!showTimeline ? (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-fredoka text-white">
              {rounds.length === 0 ? 'Start the Evolution!' : `Round ${rounds.length} Complete!`}
            </h2>
            <p className="text-gray-400 text-sm">
              {rounds.length === 0 
                ? `Starter: "${starterPrompt}"` 
                : `Now, make it even BETTER for Round ${rounds.length + 1}!`}
            </p>
          </div>

          <div className="relative">
             <div className="absolute -top-4 -left-2 bg-navy border border-teal text-teal text-[10px] px-2 py-0.5 rounded font-black z-10">
                PROMPT INPUT
             </div>
             <textarea
               value={rounds.length === 0 && !currentPrompt ? starterPrompt : currentPrompt}
               onChange={(e) => setCurrentPrompt(e.target.value)}
               placeholder="How can you make it more detailed?"
               className="w-full h-40 bg-navy/50 border-2 border-teal rounded-3xl p-6 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors font-medium shadow-inner"
             />
          </div>

          <div className="flex items-center justify-between">
             <div className="flex gap-1">
                {[1,2,3,4,5].map(num => (
                  <div 
                    key={num} 
                    className={`h-1.5 w-6 rounded-full transition-all ${
                      num <= rounds.length ? 'bg-gold' : num === rounds.length + 1 ? 'bg-teal animate-pulse' : 'bg-white/10'
                    }`} 
                  />
                ))}
             </div>
             <span className="text-[10px] font-black uppercase text-gray-500 tracking-widest">
                Progress: {rounds.length}/5
             </span>
          </div>

          <button
            onClick={handleNextRound}
            disabled={loading || (rounds.length === 0 && currentPrompt === starterPrompt)}
            className="btn-primary w-full flex items-center justify-center gap-3"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full" />
            ) : (
              <>
                 {rounds.length === 4 ? 'Finish Evolution' : `Lock in Round ${rounds.length + 1}`}
                 <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {rounds.length > 0 && (
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               className="card p-4 space-y-3"
             >
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-gray-500 uppercase">Last Round Score</span>
                   <span className="font-fredoka text-xl text-gold">{totalScore(rounds[rounds.length - 1].result)}</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${totalScore(rounds[rounds.length - 1].result)}%` }}
                     className="h-full bg-gold"
                   />
                </div>
             </motion.div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="text-center space-y-4">
             <div className="relative inline-block">
                <div className="flex justify-center">
                   <EggAvatar config={{ ...avatarConfig, expression: 'happy' }} xp={profile?.xp ?? 0} scale={1} />
                </div>
                <motion.div 
                  animate={{ rotate: 360 }} 
                  transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                  className="absolute -inset-4 border-2 border-dashed border-gold/30 rounded-full"
                />
             </div>
             <h2 className="text-3xl font-fredoka text-white">Full Evolution!</h2>
             {totalScore(rounds[4].result) >= totalScore(rounds[0].result) + 30 && (
                <div className="inline-flex items-center gap-2 bg-gold/10 border border-gold/20 px-4 py-2 rounded-2xl text-gold font-bold text-sm">
                   <Trophy className="w-4 h-4" />
                   Evolution Master Unlocked!
                </div>
             )}
          </div>

          {renderGraph()}

          <div className="space-y-4">
             <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <History className="w-4 h-4" />
                Evolution Timeline
             </h3>
             <div className="space-y-4">
                {rounds.map((r, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex gap-4 items-start"
                  >
                     <div className="flex flex-col items-center shrink-0">
                        <div className="w-8 h-8 rounded-full bg-navy border-2 border-teal flex items-center justify-center font-fredoka text-xs text-white">
                           {i + 1}
                        </div>
                        {i < 4 && <div className="w-0.5 h-12 bg-white/5" />}
                     </div>
                     <div className="flex-1 bg-white/5 rounded-2xl p-4 border border-white/5">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[10px] font-black text-teal uppercase">Round {i + 1}</span>
                           <span className="text-sm font-fredoka text-gold">{totalScore(r.result)} pts</span>
                        </div>
                        <p className="text-xs text-gray-400 italic line-clamp-1">"{r.prompt}"</p>
                     </div>
                  </motion.div>
                ))}
             </div>
          </div>

          <button onClick={() => navigate('/dashboard')} className="btn-primary w-full">
            Back to Dashboard
          </button>
        </motion.div>
      )}
    </div>
  )
}

export default EvolutionPage
