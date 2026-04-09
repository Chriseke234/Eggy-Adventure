import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { 
  Zap, 
  Users, 
  Sparkles, 
  Play,
  Loader2
} from 'lucide-react'
import EggAvatar from '../components/EggAvatar'
import { hatchPrompt } from '../lib/gemini'
import type { HatchResult } from '../lib/gemini'

const CollaborativeHatchPage: React.FC = () => {
  const { user, profile } = useAuth()
  const [roomCode, setRoomCode] = useState('')
  const [inputCode, setInputCode] = useState('')
  const [participants, setParticipants] = useState<any[]>([])
  const [status, setStatus] = useState<'idle' | 'waiting' | 'hatching' | 'result'>('idle')
  const [prompt, setPrompt] = useState('')
  const [result, setResult] = useState<HatchResult | null>(null)
  const [loading, setLoading] = useState(false)

  const isHost = profile?.role === 'teacher'

  useEffect(() => {
    if (roomCode) {
      const channel = supabase.channel(`room:${roomCode}`, {
        config: {
          presence: { key: user?.id },
        },
      })

      channel
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState()
          setParticipants(Object.values(state).flat())
        })
        .on('broadcast', { event: 'start-hatch' }, ({ payload }) => {
          setPrompt(payload.prompt)
          setStatus('hatching')
        })
        .on('broadcast', { event: 'show-result' }, ({ payload }) => {
          setResult(payload.result)
          setStatus('result')
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              user_id: user?.id,
              name: profile?.display_name,
              avatar: profile?.avatar_config
            })
          }
        })

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [roomCode, user, profile])

  const createRoom = () => {
    const code = Math.random().toString(36).substring(2, 7).toUpperCase()
    setRoomCode(code)
    setStatus('waiting')
  }

  const joinRoom = () => {
    if (inputCode.length === 5) {
      setRoomCode(inputCode.toUpperCase())
      setStatus('waiting')
    }
  }

  const startHatch = async () => {
    if (!prompt) return
    setLoading(true)
    
    // Broadcast status change to everyone
    const channel = supabase.channel(`room:${roomCode}`)
    await channel.send({
      type: 'broadcast',
      event: 'start-hatch',
      payload: { prompt }
    })

    try {
      const hatchRes = await hatchPrompt('Collaborative Mission', prompt)
      setResult(hatchRes)
      
      // Broadcast result to everyone
      await channel.send({
        type: 'broadcast',
        event: 'show-result',
        payload: { result: hatchRes }
      })
      setStatus('result')
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {status === 'idle' && (
        <div className="flex flex-col items-center justify-center py-20 space-y-12">
           <div className="text-center space-y-4">
              <div className="w-24 h-24 bg-gold/20 rounded-[40px] flex items-center justify-center text-5xl mx-auto animate-pulse">⚡</div>
              <h1 className="text-4xl font-fredoka text-white">Multi-Hatch Adventure</h1>
              <p className="text-gray-400 max-w-sm">Gather your friends or class to hatch one legendary egg together!</p>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">
              {isHost && (
                <button onClick={createRoom} className="card p-10 flex flex-col items-center gap-4 hover:border-gold transition-all group border-2 border-dashed border-white/10">
                   <Play className="w-12 h-12 text-gold group-hover:scale-110 transition-transform" />
                   <div className="text-center">
                      <h3 className="text-xl font-fredoka text-white">Start New Room</h3>
                      <p className="text-xs text-gray-500">You will be the host explorer</p>
                   </div>
                </button>
              )}
              <div className="card p-10 flex flex-col items-center gap-6 border-2 border-dashed border-white/10">
                 <Users className="w-12 h-12 text-teal" />
                 <div className="space-y-4 w-full">
                    <input 
                      type="text" 
                      placeholder="ENTER CODE" 
                      maxLength={5}
                      className="w-full bg-navy text-center font-fredoka text-2xl py-3 rounded-2xl border-2 border-white/5 focus:border-teal outline-none uppercase tracking-widest"
                      value={inputCode}
                      onChange={(e) => setInputCode(e.target.value)}
                    />
                    <button onClick={joinRoom} disabled={inputCode.length < 5} className="btn-primary w-full py-4 text-sm disabled:opacity-50">Join Adventure</button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {status === 'waiting' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
           <div className="lg:col-span-2 space-y-6">
              <div className="card p-8 bg-gradient-to-br from-navy-light to-navy border-white/5 text-center space-y-6">
                 <p className="text-xs font-black text-teal uppercase tracking-widest">Waiting for Explorers</p>
                 <h2 className="text-7xl font-fredoka text-white tracking-widest">{roomCode}</h2>
                 <p className="text-sm text-gray-400">Share this code with your fellow students</p>
                 
                 {isHost && (
                    <div className="pt-8 space-y-4 border-t border-white/5">
                       <textarea 
                         placeholder="The Host sets the mission prompt..."
                         className="w-full bg-navy/50 border-2 border-teal rounded-2xl p-4 text-white focus:outline-none"
                         value={prompt}
                         onChange={(e) => setPrompt(e.target.value)}
                       />
                       <button onClick={startHatch} disabled={loading || !prompt || participants.length < 1} className="btn-primary w-full py-5 flex items-center justify-center gap-3">
                          {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Ignite Multi-Hatch <Zap className="w-5 h-5" /></>}
                       </button>
                    </div>
                 )}
              </div>
           </div>

           <div className="card p-6 space-y-4">
              <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                 <Users className="w-4 h-4" />
                 Joined ({participants.length})
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                 {participants.map((p, i) => (
                   <motion.div 
                     key={p.user_id} 
                     initial={{ opacity: 0, x: -20 }} 
                     animate={{ opacity: 1, x: 0 }}
                     className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5"
                   >
                      <div className="w-10 h-10 bg-navy rounded-xl border border-teal/30 p-1">
                         {p.avatar ? <EggAvatar config={p.avatar} scale={0.25} /> : '🥚'}
                      </div>
                      <div className="flex-1">
                         <p className="text-sm font-bold text-white">{p.name || 'Anonymous'}</p>
                         <p className="text-[10px] text-teal font-black uppercase tracking-widest">{p.user_id === user?.id ? 'You' : 'Explorer'}</p>
                      </div>
                      {i === 0 && <Award className="w-4 h-4 text-gold" />}
                   </motion.div>
                 ))}
              </div>
           </div>
        </div>
      )}

      {(status === 'hatching' || status === 'result') && (
        <div className="max-w-2xl mx-auto space-y-8 text-center py-10">
           {!result ? (
              <div className="space-y-8">
                 <div className="relative inline-block">
                    <motion.div 
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                       <div className="w-48 h-64 bg-gradient-to-t from-gold to-teal rounded-full blur-3xl opacity-20 absolute -inset-4" />
                       <EggAvatar config={{ shellColor: '#E9C46A', expression: 'cheeky', outfit: 'masquerade', accessory: 'crown' }} scale={2} />
                    </motion.div>
                 </div>
                 <h2 className="text-3xl font-fredoka text-white animate-pulse">Hatching Our Egg...</h2>
                 <div className="bg-navy-light p-6 rounded-3xl border border-teal/30 italic text-gray-300">
                    "{prompt}"
                 </div>
              </div>
           ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                 <div className="flex justify-center">
                    <div className="relative">
                       <Sparkles className="w-16 h-16 text-gold absolute -top-8 -right-8 animate-bounce" />
                       <EggAvatar config={{ ...participants[0]?.avatar, expression: 'happy' }} scale={1.5} />
                    </div>
                 </div>
                 <h2 className="text-4xl font-fredoka text-gold">Successful Collaborative Hatch!</h2>
                 <div className="card p-8 space-y-6">
                    <p className="text-gray-300 italic">"{result.output_text}"</p>
                    <div className="grid grid-cols-4 gap-4">
                       <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase font-black">Clarity</p>
                          <p className="font-fredoka text-xl text-teal">{result.score_clarity}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase font-black">Detail</p>
                          <p className="font-fredoka text-xl text-teal">{result.score_specificity}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase font-black">Magic</p>
                          <p className="font-fredoka text-xl text-teal">{result.score_creativity}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] text-gray-500 uppercase font-black">Impact</p>
                          <p className="font-fredoka text-xl text-teal">{result.score_effectiveness}</p>
                       </div>
                    </div>
                 </div>
                 {isHost && (
                   <button onClick={() => { setStatus('idle'); setRoomCode(''); setResult(null); }} className="btn-primary py-4 px-10">Start Next Mission</button>
                 )}
              </motion.div>
           )}
        </div>
      )}
    </div>
  )
}

// Simple Helper Component
const Award: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
)

export default CollaborativeHatchPage
