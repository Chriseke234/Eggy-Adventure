import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { HeartPulse, ArrowRight, Sparkles } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { hatchPrompt } from '../lib/gemini'
import type { HatchResult } from '../lib/gemini'
import { saveSession } from '../lib/sessions'
import CharacterSprite from '../components/CharacterSprite'
import VoiceInput from '../components/VoiceInput'
import ScoreBreakdown from '../components/ScoreBreakdown'

interface Case {
  id: string
  prompt: string
  brokenOutput: string
  originalScore: number
  diagnosis: string
}

const CASES: Case[] = [
  { 
    id: 'food', 
    prompt: 'draw food', 
    brokenOutput: 'A blob of brown stuff', 
    originalScore: 15,
    diagnosis: 'Too Vague'
  },
  { 
    id: 'move', 
    prompt: 'make thing move', 
    brokenOutput: 'Something moved. Somewhere.', 
    originalScore: 10,
    diagnosis: 'Missing Detail'
  },
  { 
    id: 'nigeria', 
    prompt: 'Nigerian thing', 
    brokenOutput: 'A generic map outline', 
    originalScore: 12,
    diagnosis: 'Wrong Tone'
  }
]

const DIAGNOSIS_OPTIONS = ['Too Vague', 'Wrong Tone', 'Missing Detail', 'Too Short']

type Stage = 'START' | 'DIAGNOSIS' | 'TREATMENT' | 'RESULT'

const HospitalPage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth()
  const navigate = useNavigate()
  
  const [stage, setStage] = useState<Stage>('START')
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [userDiagnosis, setUserDiagnosis] = useState<string | null>(null)
  const [newPrompt, setNewPrompt] = useState('')
  const [result, setResult] = useState<HatchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [healedCount, setHealedCount] = useState(0) // Local state, should ideally be from profile



  const totalScore = (res: HatchResult) => 
    res.score_clarity + res.score_specificity + res.score_creativity + res.score_effectiveness

  const handleFix = async () => {
    if (!selectedCase || !user || !newPrompt) return
    
    setLoading(true)
    try {
      const missionTitle = `Fixing Case: ${selectedCase.prompt}`
      const hatchRes = await hatchPrompt(missionTitle, newPrompt)
      setResult(hatchRes)
      
      const newScore = totalScore(hatchRes)
      const improvement = newScore - selectedCase.originalScore
      
      // Save session
      await saveSession(user.id, `hospital_${selectedCase.id}`, 'Bad Egg Hospital', newPrompt, hatchRes)
      
      if (improvement >= 20) {
        const newHealedCount = healedCount + 1
        setHealedCount(newHealedCount)
        
        // Handle Badge Unlock
        if (newHealedCount === 3) {
          const currentBadges = profile?.badges || []
          if (!currentBadges.includes('Doctor Badge')) {
            await updateProfile({
              badges: [...currentBadges, 'Doctor Badge'],
              xp: (profile?.xp ?? 0) + 100
            })
          }
        } else {
            await updateProfile({
                xp: (profile?.xp ?? 0) + 50
            })
        }
      }
      
      setStage('RESULT')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setStage('START')
    setSelectedCase(null)
    setUserDiagnosis(null)
    setNewPrompt('')
    setResult(null)
  }

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate('/dashboard')} className="text-teal font-bold flex items-center gap-2">
          ← Back
        </button>
        <div className="bg-orange/20 text-orange px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
          <HeartPulse className="w-4 h-4" />
          Bad Egg Hospital
        </div>
      </div>

      <AnimatePresence mode="wait">
        {stage === 'START' && (
          <motion.div 
            key="start"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6 text-center"
          >
             <div className="relative inline-block">
                <div className="flex justify-center">
                   <CharacterSprite type="fix-it-favour" state="idle" size={150} />
                </div>
               <div className="absolute -top-2 -right-4 bg-white text-navy px-3 py-1 rounded-xl font-bold text-xs shadow-lg rotate-12">
                  Emergency!
               </div>
            </div>
           
            <div className="space-y-2">
              <h2 className="text-2xl font-fredoka text-white">Oops! These eggs are cracked.</h2>
              <p className="text-gray-400 text-sm">Poor prompts caused these silly results. Can you help heal them?</p>
            </div>

            <div className="grid gap-4">
              {CASES.map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCase(c); setStage('DIAGNOSIS'); }}
                  className="card flex items-center justify-between hover:bg-white/5 transition-colors group"
                >
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-fredoka text-2xl border-2 border-dashed border-white/20">🥚</div>
                    <div>
                      <p className="font-bold text-orange">"{c.prompt}"</p>
                      <p className="text-xs text-gray-500 line-clamp-1">{c.brokenOutput}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-teal group-hover:translate-x-1 transition-transform" />
                </button>
              ))}
            </div>
            
            {healedCount > 0 && (
              <div className="p-4 bg-teal/10 rounded-2xl border border-teal/20 text-teal text-sm font-bold">
                You've healed {healedCount} {healedCount === 1 ? 'egg' : 'eggs'}! {3 - healedCount > 0 ? `${3 - healedCount} more for the Doctor Badge!` : 'Doctor Badge Unlocked!'}
              </div>
            )}
          </motion.div>
        )}

        {stage === 'DIAGNOSIS' && selectedCase && (
          <motion.div 
            key="diagnosis"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="space-y-6"
          >
            <div className="card space-y-4 border-orange/30">
              <div className="flex gap-4">
                <div className="w-16 h-20 bg-white/5 rounded-2xl border-2 border-dashed border-orange/50 flex items-center justify-center text-3xl shrink-0">🥚</div>
                <div className="space-y-2">
                  <div className="bg-orange/10 text-orange px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit">Weak Prompt</div>
                  <p className="font-fredoka text-lg text-white">"{selectedCase.prompt}"</p>
                  <div className="bg-navy/50 p-3 rounded-xl border border-white/5 italic text-sm text-gray-400">
                    AI Output: {selectedCase.brokenOutput}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-fredoka text-xl text-center text-teal">What went wrong?</h3>
              <div className="grid grid-cols-2 gap-3">
                {DIAGNOSIS_OPTIONS.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setUserDiagnosis(opt)}
                    className={`p-4 rounded-2xl font-bold text-sm transition-all border-2 ${
                      userDiagnosis === opt 
                        ? 'bg-teal border-white shadow-lg' 
                        : 'bg-white/5 border-transparent hover:border-white/20'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <button
              disabled={!userDiagnosis}
              onClick={() => setStage('TREATMENT')}
              className="btn-primary w-full disabled:opacity-50"
            >
              Next Step
            </button>
          </motion.div>
        )}

        {stage === 'TREATMENT' && selectedCase && (
          <motion.div 
            key="treatment"
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-fredoka text-white">Fix the Prompt!</h2>
              <p className="text-gray-400 text-sm">Doctor's Orders: Make it vivid and detailed.</p>
            </div>

            <div className="relative">
              <textarea
                value={newPrompt}
                onChange={(e) => setNewPrompt(e.target.value)}
                placeholder="Type a better prompt here..."
                className="w-full h-40 bg-navy/50 border-2 border-teal rounded-3xl p-6 pr-14 text-white placeholder:text-gray-600 focus:outline-none focus:border-gold transition-colors font-medium shadow-inner"
              />
              <div className="absolute top-4 right-4">
                 <VoiceInput onTranscript={(text) => setNewPrompt(prev => prev + ' ' + text)} />
              </div>
            </div>

            <button
              onClick={handleFix}
              disabled={loading || newPrompt.length < 5}
              className="btn-primary w-full flex items-center justify-center gap-3 relative overflow-hidden"
            >
              {loading && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full" />}
              {loading ? 'Healing...' : 'Hatch Fixed Egg!'}
            </button>
          </motion.div>
        )}

        {stage === 'RESULT' && result && selectedCase && (
          <motion.div 
            key="result"
            className="space-y-6"
          >
            {totalScore(result) >= selectedCase.originalScore + 20 ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-center space-y-4"
              >
                <div className="flex justify-center">
                  <div className="relative">
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="absolute inset-0 bg-gold rounded-full blur-2xl"
                    />
                    <Sparkles className="w-16 h-16 text-gold relative z-10" />
                  </div>
                </div>
                <h2 className="text-3xl font-fredoka text-gold italic">Fix-It Favour!</h2>
                <p className="text-teal font-bold uppercase tracking-widest text-xs">A Miracle Cure!</p>
              </motion.div>
            ) : (
              <div className="text-center space-y-2">
                 <h2 className="text-2xl font-fredoka text-white">Feeling Better!</h2>
                 <p className="text-gray-400 text-sm">You've improved the egg, but keep practicing!</p>
              </div>
            )}

            <div className="card space-y-6">
              <div className="flex gap-4">
                 <div className="w-16 h-20 bg-gradient-to-br from-teal to-gold rounded-2xl flex items-center justify-center text-3xl shadow-lg shrink-0">🥚</div>
                 <div className="space-y-2">
                   <div className="bg-teal/20 text-teal px-2 py-0.5 rounded text-[10px] font-bold uppercase w-fit">Healed Output</div>
                   <p className="text-sm italic text-gray-200 line-clamp-3">"{result.output_text}"</p>
                 </div>
              </div>

              <div className="border-t border-white/5 pt-6">
                <div className="flex justify-between items-end mb-4">
                   <span className="text-xs text-gray-500 uppercase font-black">Score Boost</span>
                   <div className="flex items-center gap-2">
                      <span className="text-gray-500 line-through text-sm">{selectedCase.originalScore}</span>
                      <span className="text-2xl font-fredoka text-gold">{totalScore(result)}</span>
                   </div>
                </div>
                <ScoreBreakdown scores={{
                  clarity: result.score_clarity,
                  specificity: result.score_specificity,
                  creativity: result.score_creativity,
                  effectiveness: result.score_effectiveness
                }} />
              </div>
            </div>

            <button onClick={reset} className="btn-secondary w-full">
              Heal Another Egg
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HospitalPage
