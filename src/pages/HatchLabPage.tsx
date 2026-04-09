import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MISSIONS } from '../data/missions'
import type { Mission } from '../data/missions'
import EggCracking from '../components/EggCracking'
import ScoreBreakdown from '../components/ScoreBreakdown'
import { hatchPrompt } from '../lib/gemini'
import type { HatchResult } from '../lib/gemini'
import { saveSession } from '../lib/sessions'
import { useAuth } from '../contexts/AuthContext'
import { ChevronLeft, Send, RotateCcw, Save } from 'lucide-react'
import EggAvatar from '../components/EggAvatar'
import type { AvatarConfig } from '../components/EggAvatar'
import VoiceInput from '../components/VoiceInput'
import CharacterSprite from '../components/CharacterSprite'
import { audio } from '../lib/audio'

type FlowState = 'selecting' | 'prompting' | 'hatching' | 'result'

const HatchLabPage: React.FC = () => {
  const [state, setState] = useState<FlowState>('selecting')
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<HatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const { user, profile } = useAuth()

  const defaultAvatarConfig: AvatarConfig = {
    shellColor: '#2A9D8F',
    outfit: 'none',
    accessory: 'none',
    expression: 'happy'
  }

  const avatarConfig = profile?.avatar_config || defaultAvatarConfig

  const handleHatch = async () => {
    if (!selectedMission || !prompt) return
    
    setState('hatching')
    setLoading(true)
    
    try {
      audio.playHatching()
      const hatchResult = await hatchPrompt(selectedMission.name, prompt)
      setResult(hatchResult)
      audio.playSuccess()
      
      // Save to Supabase automatically as per request
      if (user) {
        await saveSession(user.id, selectedMission.id, selectedMission.name, prompt, hatchResult)
      }
      
      setState('result')
    } catch (error) {
      console.error('Hatching failed:', error)
      setState('prompting') // Fallback
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-8 pb-32">
      <AnimatePresence mode="wait">
        {/* 1. Selecting State */}
        {state === 'selecting' && (
          <motion.div 
            key="selecting"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-fredoka text-gold">Hatch Lab</h2>
              <p className="text-teal font-bold uppercase tracking-widest text-xs">Pick a Mission</p>
            </div>

            <div className="grid gap-4">
              {MISSIONS.map((mission, index) => (
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={mission.id}
                  onClick={() => {
                    audio.playClick()
                    setSelectedMission(mission)
                    setState('prompting')
                  }}
                  className="card text-left flex items-center gap-4 hover:border-teal/50 hover:bg-teal/5 group"
                >
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-fredoka text-2xl group-hover:scale-110 transition-transform">
                    {index === 0 ? '🎭' : index === 1 ? '🛶' : index === 2 ? '🥘' : index === 3 ? '👒' : '🚌'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-fredoka text-lg text-white group-hover:text-gold transition-colors">{mission.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/50">{mission.difficulty}</span>
                      <span className="text-[10px] bg-teal/10 px-2 py-0.5 rounded-full text-teal/70 font-black uppercase">{mission.category}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* 2. Prompting State */}
        {state === 'prompting' && selectedMission && (
          <motion.div 
            key="prompting"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="space-y-8"
          >
            <button onClick={() => { audio.playClick(); setState('selecting'); }} className="flex items-center gap-2 text-teal font-bold text-xs uppercase tracking-widest hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" /> Change Mission
            </button>

            <div className="card space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-fredoka text-gold">{selectedMission.name}</h3>
                  <span className="text-[10px] bg-teal/20 text-teal border border-teal/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                    {selectedMission.difficulty}
                  </span>
                </div>
                <p className="text-sm text-white/70 leading-relaxed font-medium">{selectedMission.context}</p>
              </div>
              
              <div className="flex items-start gap-4 bg-navy/50 p-4 rounded-2xl border border-white/5 italic text-sm text-teal relative overflow-hidden">
                <div className="absolute inset-0 bg-teal/5 opacity-50" />
                <div className="w-12 h-12 flex-shrink-0 bg-white/5 rounded-2xl overflow-hidden flex items-center justify-center relative z-10 border border-white/5">
                   <CharacterSprite type="eggy" state="talking" size={40} />
                </div>
                <p className="relative z-10">{selectedMission.intro}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-2">What should happen?</label>
                  <span className={`text-[10px] font-bold ${prompt.length > 250 ? 'text-orange' : 'text-white/40'}`}>
                    {prompt.length}/300
                  </span>
                </div>
                <div className="relative">
                  <textarea
                    autoFocus
                    maxLength={300}
                    placeholder="Describe your creative idea for Eggy here..."
                    className="w-full h-32 bg-navy/50 border-2 border-white/10 rounded-2xl p-4 pr-14 text-lg font-nunito focus:border-teal outline-none resize-none transition-all placeholder:text-white/10"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <div className="absolute top-4 right-4">
                     <VoiceInput onTranscript={(text) => setPrompt(prev => prev + ' ' + text)} />
                  </div>
                </div>
              </div>

              <button
                disabled={!prompt.trim() || loading}
                onClick={handleHatch}
                className="w-full btn-primary py-5 rounded-2xl text-xl font-fredoka flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Send className="w-6 h-6" /> Hatch It!
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. Hatching State */}
        {state === 'hatching' && (
          <motion.div 
            key="hatching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-[50vh]"
          >
            <motion.div
              animate={{
                x: [-2, 2, -2, 2, 0],
                rotate: [-1, 1, -1, 1, 0]
              }}
              transition={{ repeat: Infinity, duration: 0.1 }}
            >
              <EggCracking />
            </motion.div>
            <p className="mt-8 font-fredoka text-xl text-teal animate-pulse">Eggy is thinking...</p>
          </motion.div>
        )}

        {/* 4. Result State */}
        {state === 'result' && result && (
          <motion.div 
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-4">
              <EggAvatar 
                config={{ ...avatarConfig, expression: result.eggy_reaction as any }} 
                xp={profile?.xp ?? 0}
                scale={0.5} 
              />
              <div className="flex-1 bg-teal/10 rounded-[2rem] p-6 border border-teal/20 relative">
                 <div className="absolute -left-2 top-8 w-4 h-4 bg-teal/10 rotate-45 border-l border-b border-teal/20" />
                 <p className="text-white leading-relaxed font-semibold italic text-lg">"{result.output_text}"</p>
              </div>
            </div>

            <div className="card space-y-8">
              <ScoreBreakdown scores={{
                clarity: result.score_clarity,
                specificity: result.score_specificity,
                creativity: result.score_creativity,
                effectiveness: result.score_effectiveness
              }} />

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl space-y-1">
                  <h5 className="text-[10px] font-bold uppercase tracking-widest text-teal">Eggy's High-Five</h5>
                  <p className="text-sm font-bold text-white/90">{result.feedback_strength}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl space-y-1">
                   <h5 className="text-[10px] font-bold uppercase tracking-widest text-orange">Eggy's Tip</h5>
                   <p className="text-sm font-bold text-white/90">{result.feedback_tip}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button 
                  onClick={() => {
                    setPrompt('')
                    setState('prompting')
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-white/5 text-white py-4 rounded-2xl font-fredoka hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" /> Try Again
                </button>
                <button 
                  onClick={() => setState('selecting')}
                  className="flex-1 flex items-center justify-center gap-2 bg-teal text-navy py-4 rounded-2xl font-fredoka shadow-lg shadow-teal/20"
                >
                  <Save className="w-5 h-5" /> Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HatchLabPage
