import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Map as MapIcon, Lock, CheckCircle2, Star, ChevronRight, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { MISSIONS, Mission } from '../data/missions'
import CharacterSprite, { CharacterType } from '../components/CharacterSprite'

interface StateNode {
  name: string
  x: number // 0-100
  y: number // 0-100
  unlockXP: number
}

const NIGERIA_STATES: StateNode[] = [
  { name: 'Rivers', x: 50, y: 85, unlockXP: 0 },
  { name: 'Lagos', x: 15, y: 75, unlockXP: 100 },
  { name: 'Kano', x: 55, y: 15, unlockXP: 200 },
  { name: 'Enugu', x: 65, y: 70, unlockXP: 300 },
  { name: 'Abuja', x: 50, y: 45, unlockXP: 400 },
  { name: 'Kaduna', x: 52, y: 30, unlockXP: 500 },
  { name: 'Oyo', x: 25, y: 65, unlockXP: 600 },
  { name: 'Delta', x: 40, y: 80, unlockXP: 700 },
]

const ExplorerPage: React.FC = () => {
  const { profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [selectedState, setSelectedState] = useState<StateNode | null>(null)

  const userXP = profile?.xp ?? 0
  const badges = profile?.badges || []

  const isUnlocked = (node: StateNode) => userXP >= node.unlockXP
  const isCompleted = (nodeName: string) => badges.includes(`${nodeName} Explorer`)

  const stateMissions = selectedState ? MISSIONS.filter(m => m.state === selectedState.name) : []

  return (
    <div className="max-w-md mx-auto space-y-8 pb-10 px-4">
      <header className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-teal font-bold flex items-center gap-2">
          ← Back
        </button>
        <div className="bg-gold/20 text-gold px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <MapIcon className="w-4 h-4" />
          State Explorer
        </div>
      </header>

      <div className="text-center space-y-2">
         <h2 className="text-3xl font-fredoka text-white">Nigeria Map</h2>
         <p className="text-gray-400 text-sm">Tap an unlocked state to see its missions!</p>
      </div>

      {/* Stylized Node Map */}
      <div className="relative aspect-square bg-navy/30 rounded-[3rem] border-4 border-white/5 shadow-2xl overflow-hidden p-8">
        {/* River lines (decorative) */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
          <path d="M50,45 Q55,70 50,85" stroke="white" strokeWidth="2" fill="none" />
          <path d="M50,45 Q20,60 15,75" stroke="white" strokeWidth="2" fill="none" />
        </svg>

        {NIGERIA_STATES.map((node) => {
          const unlocked = isUnlocked(node)
          const completed = isCompleted(node.name)
          
          return (
            <motion.button
              key={node.name}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={unlocked ? { scale: 1.1 } : {}}
              onClick={() => unlocked && setSelectedState(node)}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group"
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className={`
                relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                ${unlocked ? 'bg-orange shadow-[0_0_20px_rgba(244,162,97,0.4)] cursor-pointer' : 'bg-navy/80 border-2 border-white/10 grayscale'}
                ${completed ? 'bg-teal shadow-[0_0_20px_rgba(42,157,143,0.4)]' : ''}
              `}>
                {unlocked ? (
                   completed ? <CheckCircle2 className="w-6 h-6 text-white" /> : <Star className="w-6 h-6 text-white animate-pulse" />
                ) : (
                   <Lock className="w-5 h-5 text-white/30" />
                )}
                
                {/* Tooltip on hover */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white text-navy px-2 py-0.5 rounded text-[10px] font-black whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                   {unlocked ? node.name : `Needs ${node.unlockXP} XP`}
                </div>
              </div>
            </motion.button>
          )
        })}
      </div>

      <div className="card space-y-4">
        <h3 className="font-fredoka text-xl text-teal">XP Milestone</h3>
        <div className="relative h-4 bg-white/5 rounded-full overflow-hidden">
           <div 
             className="h-full bg-gold transition-all duration-1000" 
             style={{ width: `${Math.min((userXP / 800) * 100, 100)}%` }} 
           />
        </div>
        <div className="flex justify-between text-[10px] font-black uppercase text-gray-500">
           <span>0 XP</span>
           <span>Current: {userXP} XP</span>
           <span>800+ XP</span>
        </div>
      </div>

      {/* Missions Modal / Panel */}
      <AnimatePresence>
        {selectedState && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center px-4 pb-10 bg-navy/80 backdrop-blur-md"
          >
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 200 }}
              className="card w-full max-w-sm space-y-6 shadow-2xl border-white/10"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center p-2 border border-white/5">
                    <CharacterSprite 
                      type={
                        selectedState.name === 'Rivers' ? 'mama-kalabari' : 
                        selectedState.name === 'Lagos' ? 'danfo-dash' :
                        selectedState.name === 'Abuja' ? 'zuma-guardian' : 'eggy'
                      } 
                      size={60} 
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-2xl font-fredoka text-gold">{selectedState.name} Missions</h4>
                    <p className="text-xs text-gray-400">Discover the magic of {selectedState.name} State</p>
                  </div>
                </div>
                <button onClick={() => setSelectedState(null)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-3">
                 {stateMissions.length > 0 ? stateMissions.map(m => (
                   <button 
                     key={m.id}
                     onClick={() => navigate('/hatch-lab', { state: { missionId: m.id } })}
                     className="w-full text-left p-4 bg-white/5 rounded-2xl border border-transparent hover:border-teal/50 hover:bg-teal/5 flex items-center justify-between group"
                   >
                      <div className="space-y-1">
                         <p className="font-bold text-sm">{m.name}</p>
                         <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-gray-400">{m.difficulty}</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-teal group-hover:translate-x-1 transition-transform" />
                   </button>
                 )) : (
                   <div className="text-center py-8 space-y-2">
                      <p className="text-gray-500 text-sm">More missions coming soon!</p>
                   </div>
                 )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ExplorerPage
