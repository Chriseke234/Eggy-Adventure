import React, { useState, useEffect } from 'react'
import { Zap, Award, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import CharacterSprite from './CharacterSprite'

const SESSION_LIMIT = 45 * 60 // Default 45 mins, though teacher can override later

const EnergyShell: React.FC = () => {
  const { user } = useAuth()
  const [timeLeft, setTimeLeft] = useState(SESSION_LIMIT)
  const [totalTime, setTotalTime] = useState(SESSION_LIMIT)
  const [showAlert, setShowAlert] = useState<{ text: string, type: 'warn' | 'crit' } | null>(null)
  const [showRecap, setShowRecap] = useState(false)
  const [topHatches, setTopHatches] = useState<any[]>([])

  useEffect(() => {
    // Fetch individual student limit from screen_time_settings if it exists
    const fetchLimit = async () => {
       if (!user?.id) return
       const { data } = await supabase
         .from('screen_time_settings')
         .select('daily_limit_minutes')
         .eq('student_id', user.id)
         .single()
       if (data?.daily_limit_minutes) {
          setTotalTime(data.daily_limit_minutes * 60)
          setTimeLeft(data.daily_limit_minutes * 60)
       }
    }
    fetchLimit()
  }, [user])

  useEffect(() => {
    const savedStart = localStorage.getItem('eggy_session_start')
    if (savedStart) {
      const start = parseInt(savedStart)
      const elapsed = Math.floor((Date.now() - start) / 1000)
      setTimeLeft(Math.max(0, totalTime - elapsed))
    } else {
      const now = Date.now()
      localStorage.setItem('eggy_session_start', now.toString())
      setTotalTime(totalTime)
      setTimeLeft(totalTime)
    }
  }, [totalTime])

  useEffect(() => {
    if (timeLeft <= 0) {
      handleEnergyEmpty()
      return
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1
        
        // Alert at 50%
        if (next === Math.floor(totalTime / 2)) {
           setShowAlert({ text: "Half my energy gone! Let's make it count!", type: 'warn' })
           setTimeout(() => setShowAlert(null), 5000)
        }
        
        // Alert at 20%
        if (next === Math.floor(totalTime * 0.2)) {
           setShowAlert({ text: "Energy core critical! Almost time for a break!", type: 'crit' })
           setTimeout(() => setShowAlert(null), 5000)
        }

        return next < 0 ? 0 : next
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, totalTime])

  const handleEnergyEmpty = async () => {
    if (showRecap) return
    setShowRecap(true)
    
    // Fetch best 3 hatches today
    if (user?.id) {
       const today = new Date().toISOString().split('T')[0]
       const { data } = await supabase
         .from('sessions')
         .select('*')
         .eq('user_id', user.id)
         .gte('created_at', today)
         .order('scores->total', { ascending: false })
         .limit(3)
       if (data) setTopHatches(data)
    }
  }

  const percentage = (timeLeft / totalTime) * 100

  if (showRecap) {
    return (
      <div className="fixed inset-0 z-[100] bg-navy/98 backdrop-blur-2xl flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full space-y-8 text-center"
        >
          <div className="space-y-4">
             <div className="relative inline-block">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="absolute -inset-4 bg-teal/20 blur-xl rounded-full" />
                <CharacterSprite type="eggy" state="happy" size={150} />
             </div>
             <h1 className="text-4xl font-fredoka text-gold">Great Job Today!</h1>
             <p className="text-teal font-bold uppercase tracking-widest text-sm">Eggy is recharging for tomorrow's adventure.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {topHatches.map((h, i) => (
               <motion.div 
                 key={h.id}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="card p-4 bg-white/5 border-white/10"
               >
                  <div className="text-2xl mb-2">🏅</div>
                  <p className="text-xs font-bold text-white mb-1 line-clamp-1">{h.mission_name}</p>
                  <div className="flex items-center justify-center gap-1 text-gold font-fredoka">
                     <Star className="w-3 h-3 fill-gold" />
                     {h.scores.clarity + h.scores.specificity + h.scores.creativity + h.scores.effectiveness}
                  </div>
               </motion.div>
             ))}
             {topHatches.length === 0 && (
                <div className="col-span-3 py-10 card bg-white/5 text-gray-500 italic">No hatches today, but tomorrow is a new day!</div>
             )}
          </div>

          <div className="pt-8 space-y-4">
             <button 
               onClick={() => {
                 localStorage.removeItem('eggy_session_start')
                 window.location.reload()
               }}
               className="btn-primary py-4 px-10 flex items-center gap-3 mx-auto"
             >
                Save & Recharge Early <Award className="w-5 h-5" />
             </button>
             <p className="text-[10px] text-gray-600 uppercase font-black tracking-widest">Administrator Login Required to Resume</p>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-4">
      <AnimatePresence>
         {showAlert && (
           <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             exit={{ opacity: 0, x: 20 }}
             className={`px-4 py-2 rounded-2xl border-2 flex items-center gap-3 shadow-xl backdrop-blur-md ${
               showAlert.type === 'crit' ? 'bg-orange/20 border-orange text-orange' : 'bg-gold/20 border-gold text-gold'
             }`}
           >
              <CharacterSprite type="eggy" size={24} state="talking" />
              <span className="text-xs font-black uppercase tracking-tight leading-none">{showAlert.text}</span>
           </motion.div>
         )}
      </AnimatePresence>

      <div className="relative group cursor-pointer">
         {/* The Crystal Egg Shell */}
         <div className="relative w-14 h-18">
            <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_0_8px_rgba(42,157,143,0.3)]">
               <defs>
                  <clipPath id="eggClip">
                     <ellipse cx="50" cy="60" rx="40" ry="50" />
                  </clipPath>
               </defs>
               <ellipse cx="50" cy="60" rx="42" ry="52" fill="white" opacity="0.1" />
               <ellipse cx="50" cy="60" rx="40" ry="50" fill="none" stroke="white" strokeWidth="2" opacity="0.2" />
               
               {/* Inner Energy Liquid */}
               <g clipPath="url(#eggClip)">
                  <motion.rect 
                    initial={{ y: 0 }}
                    animate={{ y: 120 - (percentage * 1.2) }}
                    transition={{ type: 'spring', damping: 20 }}
                    width="100" 
                    height="120" 
                    fill={percentage < 20 ? '#F4A261' : '#2A9D8F'}
                    opacity="0.8"
                  />
                  {percentage < 20 && (
                     <motion.rect 
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        width="100" 
                        height="120" 
                        fill="#E76F51"
                     />
                  )}
               </g>

               {/* Cracks appear as energy drains */}
               {percentage < 50 && (
                  <path d="M30 30 L40 50 L35 70" stroke="white" strokeWidth="1" fill="none" opacity={0.5} />
               )}
               {percentage < 20 && (
                  <path d="M70 40 L60 60 L75 80" stroke="#E76F51" strokeWidth="2" fill="none" />
               )}
            </svg>
            
            <div className="absolute inset-0 flex items-center justify-center">
               <Zap className={`w-4 h-4 ${percentage < 20 ? 'text-orange animate-pulse' : 'text-white opacity-50'}`} />
            </div>
         </div>

         {/* Hover Tooltip */}
         <div className="absolute top-full mt-2 right-0 bg-navy-light px-3 py-1 rounded-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
            <span className="text-[10px] font-bold text-teal">{Math.floor(timeLeft / 60)}m left</span>
         </div>
      </div>
    </div>
  )
}

export default EnergyShell
