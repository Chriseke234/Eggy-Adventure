import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Star, Calendar, Trash2, Search, Filter } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import CharacterSprite from '../components/CharacterSprite'
import EggAvatar from '../components/EggAvatar'

interface Session {
  id: string
  mission_name: string
  prompt: string
  result: any
  created_at: string
}

const JournalPage: React.FC = () => {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (user) fetchSessions()
  }, [user])

  const fetchSessions = async () => {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
    
    if (data) setSessions(data)
    setLoading(false)
  }

  const deleteSession = async (id: string) => {
    const { error } = await supabase.from('sessions').delete().eq('id', id)
    if (!error) {
      setSessions(prev => prev.filter(s => s.id !== id))
      setSelectedSession(null)
    }
  }

  const filteredSessions = sessions.filter(s => 
    s.mission_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-32">
      <header className="flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-orange/20 rounded-2xl flex items-center justify-center p-2 border border-orange/10">
               <CharacterSprite type="journal-jollof" size={50} />
            </div>
            <div>
               <h1 className="text-3xl font-fredoka text-white">My Journal</h1>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Your Hatching Legend</p>
            </div>
         </div>
      </header>

      {/* Search & Filter */}
      <div className="relative">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
         <input 
           type="text" 
           placeholder="Search your missions..."
           className="w-full bg-navy/50 border-2 border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-gray-600 focus:border-teal outline-none transition-all"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      <div className="space-y-4">
         {loading ? (
            <div className="py-20 text-center animate-pulse text-teal font-fredoka text-xl">Loading your memories...</div>
         ) : filteredSessions.length > 0 ? (
            filteredSessions.map((session) => (
               <motion.div 
                 key={session.id}
                 layoutId={session.id}
                 onClick={() => setSelectedSession(session)}
                 className="card p-5 flex items-center gap-5 hover:border-teal/50 hover:bg-teal/5 transition-all cursor-pointer group"
               >
                  <div className="w-16 h-20 bg-navy-light rounded-2xl flex items-center justify-center border border-white/5 shadow-inner">
                     <EggAvatar config={{ shellColor: '#E9C46A', outfit: 'none', accessory: 'none', expression: 'happy' }} scale={0.4} />
                  </div>
                  <div className="flex-1 space-y-1">
                     <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white group-hover:text-gold transition-colors">{session.mission_name}</h3>
                        <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                           {new Date(session.created_at).toLocaleDateString()}
                        </span>
                     </div>
                     <p className="text-xs text-gray-400 line-clamp-1 italic">"{session.prompt}"</p>
                     <div className="flex items-center gap-3 pt-1">
                        <div className="flex items-center gap-1 text-gold font-fredoka text-sm">
                           <Star className="w-3 h-3 fill-gold" />
                           {session.result.score_clarity + session.result.score_specificity + session.result.score_creativity + session.result.score_effectiveness}
                        </div>
                        <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 uppercase font-black">Success</span>
                     </div>
                  </div>
               </motion.div>
            ))
         ) : (
            <div className="text-center py-20 card border-dashed border-white/5">
               <div className="text-4xl mb-4 opacity-20">📖</div>
               <p className="text-gray-500 font-medium">Your journal is empty. Let's hatch something!</p>
            </div>
         )}
      </div>

      {/* Session Detail Modal */}
      <AnimatePresence>
         {selectedSession && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/95 backdrop-blur-sm"
            >
               <motion.div 
                 initial={{ scale: 0.9, y: 20 }}
                 animate={{ scale: 1, y: 0 }}
                 className="card w-full max-w-lg space-y-6 max-h-[90vh] overflow-y-auto"
               >
                  <div className="flex justify-between items-start">
                     <div className="space-y-1">
                        <span className="text-[10px] font-black text-teal uppercase tracking-widest">Archived Mission</span>
                        <h2 className="text-2xl font-fredoka text-gold">{selectedSession.mission_name}</h2>
                     </div>
                     <button onClick={() => setSelectedSession(null)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                  </div>

                  <div className="space-y-4">
                     <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Original Prompt</h4>
                        <p className="bg-navy p-4 rounded-2xl italic text-sm text-gray-300 border border-white/5">"{selectedSession.prompt}"</p>
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Hatch Result</h4>
                        <div className="bg-teal/5 p-6 rounded-2xl border border-teal/20">
                           <p className="text-white font-semibold leading-relaxed mb-4">"{selectedSession.result.output_text}"</p>
                           <div className="grid grid-cols-4 gap-2">
                              {/* Summary Score pill */}
                              <div className="col-span-4 bg-navy px-4 py-2 rounded-xl flex justify-between items-center mb-2">
                                 <span className="text-[10px] font-bold text-gray-500">Legendary Score</span>
                                 <span className="text-xl font-fredoka text-gold">
                                    {selectedSession.result.score_clarity + selectedSession.result.score_specificity + selectedSession.result.score_creativity + selectedSession.result.score_effectiveness}
                                 </span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                     <button onClick={() => setSelectedSession(null)} className="btn-primary flex-1 py-4">Back to Journal</button>
                     <button 
                       onClick={() => deleteSession(selectedSession.id)}
                       className="p-4 bg-orange/10 text-orange rounded-2xl hover:bg-orange transition-all hover:text-navy"
                     >
                        <Trash2 className="w-6 h-6" />
                     </button>
                  </div>
               </motion.div>
            </motion.div>
         )}
      </AnimatePresence>
    </div>
  )
}

export default JournalPage
