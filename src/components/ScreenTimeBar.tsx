import React, { useState, useEffect } from 'react'
import { Lock } from 'lucide-react'

const SESSION_LIMIT = 3 * 60 * 60 // 3 hours in seconds

const ScreenTimeBar: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(SESSION_LIMIT)

  useEffect(() => {
    // Check for existing session start time
    const savedStart = localStorage.getItem('eggy_session_start')
    if (savedStart) {
      const start = parseInt(savedStart)
      const elapsed = Math.floor((Date.now() - start) / 1000)
      setTimeLeft(Math.max(0, SESSION_LIMIT - elapsed))
    } else {
      const now = Date.now()
      localStorage.setItem('eggy_session_start', now.toString())
      setTimeLeft(SESSION_LIMIT)
    }
  }, [])

  useEffect(() => {
    if (timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const percentage = (timeLeft / SESSION_LIMIT) * 100

  if (timeLeft === 0) {
    return (
      <div className="fixed inset-0 z-[100] bg-navy/95 backdrop-blur-xl flex flex-center items-center justify-center p-8 text-center animate-in fade-in duration-500">
        <div className="max-w-md space-y-6">
          <div className="w-24 h-24 bg-orange rounded-full flex items-center justify-center mx-auto shadow-gold/50 shadow-2xl animate-bounce">
            <Lock className="w-12 h-12 text-navy" />
          </div>
          <h1 className="text-4xl font-fredoka text-gold">Nap Time!</h1>
          <p className="text-xl text-teal">Eggy is recharging. It's time to take a break and play outside!</p>
          <div className="pt-4">
             <button 
               onClick={() => {
                 localStorage.removeItem('eggy_session_start')
                 window.location.reload()
               }}
               className="text-white/50 underline text-sm"
             >
               (Admin: Reset Session)
             </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-10 bg-navy/80 backdrop-blur-md z-40 border-b border-white/10 px-4 flex items-center gap-3">
      <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-1000 ${
            percentage < 20 ? 'bg-orange animate-pulse' : 'bg-teal'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs font-mono font-bold text-teal min-w-[60px]">
        {formatTime(timeLeft)}
      </div>
    </div>
  )
}

export default ScreenTimeBar
