import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Microscope, HeartPulse, Zap, Map, BookMarked, Flame, Star, Trophy, Target } from 'lucide-react'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'
import EggAvatar from '../components/EggAvatar'
import type { AvatarConfig } from '../components/EggAvatar'
import { supabase } from '../lib/supabase'
import { MISSIONS } from '../data/missions'
import { useEffect, useState } from 'react'

const DashboardPage: React.FC = () => {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const defaultAvatarConfig: AvatarConfig = {
    shellColor: '#2A9D8F',
    outfit: 'none',
    accessory: 'none',
    expression: 'happy'
  }

  const avatarConfig = profile?.avatar_config || defaultAvatarConfig
  const [skillData, setSkillData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (profile?.id) {
       fetchSkillData()
    }
  }, [profile])

  const fetchSkillData = async () => {
     try {
        const { data: sessions } = await supabase
          .from('sessions')
          .select('mission_id, scores')
          .eq('user_id', profile?.id)
        
        if (!sessions || sessions.length === 0) {
           setSkillData([
             { subject: 'History', A: 0 },
             { subject: 'Geography', A: 0 },
             { subject: 'Art', A: 0 },
             { subject: 'Civics', A: 0 },
             { subject: 'Culture', A: 0 },
             { subject: 'Innovation', A: 0 },
           ])
           return
        }

        const totals: Record<string, { sum: number, count: number }> = {
          History: { sum: 0, count: 0 },
          Geography: { sum: 0, count: 0 },
          Art: { sum: 0, count: 0 },
          Civics: { sum: 0, count: 0 },
          Culture: { sum: 0, count: 0 },
          Innovation: { sum: 0, count: 0 },
        }

        sessions.forEach(s => {
          const mission = MISSIONS.find(m => m.id === s.mission_id)
          if (mission && totals[mission.category]) {
             const avgScore = (s.scores.clarity + s.scores.specificity + s.scores.creativity + s.scores.effectiveness) / 4
             totals[mission.category].sum += avgScore
             totals[mission.category].count += 1
          }
        })

        const formatted = Object.keys(totals).map(cat => ({
          subject: cat,
          A: totals[cat].count > 0 ? Math.round((totals[cat].sum / totals[cat].count) * 10) : 0,
          fullMark: 100
        }))

        setSkillData(formatted)
     } catch (err) {
        console.error(err)
     } finally {
        setLoading(false)
     }
  }

  const modes = [
    { id: 'lab', name: 'Hatch Lab', icon: Microscope, path: '/hatch-lab', color: 'bg-teal', textColor: 'text-white' },
    { id: 'hospital', name: 'Bad Egg Hospital', icon: HeartPulse, path: '/hospital', color: 'bg-orange', textColor: 'text-navy text-shadow-none' },
    { id: 'evolution', name: 'Evolution Challenge', icon: Zap, path: '/evolution', color: 'bg-navy', textColor: 'text-teal border border-teal/20 shadow-none' },
    { id: 'explorer', name: 'State Explorer', icon: Map, path: '/explore', color: 'bg-gold', textColor: 'text-navy' },
    { id: 'journal', name: 'Journal', icon: BookMarked, path: '/journal', color: 'bg-white/10', textColor: 'text-white' },
  ]

  const badges = profile?.badges || []

  return (
    <div className="space-y-8 pb-10">
      {/* Header Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-navy/50 px-4 py-2 rounded-2xl border border-white/5 shadow-lg">
          <div className="w-8 h-8 bg-orange/20 rounded-lg flex items-center justify-center">
            <Flame className="w-5 h-5 text-orange" />
          </div>
          <span className="font-fredoka text-xl text-orange">{profile?.streak ?? 0}</span>
        </div>

        <div className="flex-1 flex items-center gap-3 bg-navy/50 px-4 py-2 rounded-2xl border border-white/5 shadow-lg">
          <div className="w-8 h-8 bg-gold/20 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-gold" />
          </div>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gold transition-all duration-1000" 
              style={{ width: `${(profile?.xp ?? 0) % 100}%` }} 
            />
          </div>
          <span className="font-fredoka text-gold">{profile?.xp ?? 0}</span>
        </div>
      </div>

      {/* Hero Mascot Section */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
           <EggAvatar config={avatarConfig} xp={profile?.xp ?? 0} scale={1} />
        </div>
        <h2 className="text-3xl font-fredoka text-white">
          Hi, <span className="text-gold">{profile?.display_name ?? 'Adventurer'}</span>!
        </h2>
        <p className="text-teal font-bold uppercase tracking-widest text-xs">Ready for today's mission?</p>
      </div>

      {/* Mode Grid */}
      <div className="grid grid-cols-2 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => navigate(mode.path)}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl space-y-4 shadow-xl active:scale-95 transition-all text-center group ${mode.color} ${mode.textColor}`}
          >
            <div className="p-3 bg-white/20 rounded-2xl group-hover:rotate-12 transition-transform">
              <mode.icon className="w-8 h-8" />
            </div>
            <span className="font-fredoka text-lg leading-tight">{mode.name}</span>
          </button>
        ))}
      </div>

      {/* Badges Section */}
      {badges.length > 0 && (
        <div className="card space-y-4">
          <h3 className="text-xl font-fredoka text-gold flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            My Badges
          </h3>
          <div className="flex flex-wrap gap-3">
             {badges.map((badge: string) => (
               <div key={badge} className="flex flex-col items-center gap-1">
                  <div className="w-16 h-16 bg-gold/10 border-2 border-gold rounded-full flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(233,196,106,0.3)]">
                     {badge.includes('Rivers') ? '🌊' : badge.includes('Lagos') ? '🏙️' : badge.includes('Kano') ? '🏰' : badge.includes('Enugu') ? '⛏️' : badge.includes('Abuja') ? '⛪' : '🏅'}
                  </div>
                  <span className="text-[10px] font-black uppercase text-gold text-center max-w-[64px] leading-tight">
                    {badge}
                  </span>
               </div>
             ))}
          </div>
        </div>
      )}

      {/* Skill Constellations */}
      <div className="card space-y-6">
        <div className="flex items-center justify-between">
           <h3 className="text-xl font-fredoka text-gold flex items-center gap-2">
             <Target className="w-5 h-5" />
             Skill Constellations
           </h3>
           <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest bg-white/5 px-2 py-1 rounded-lg">Mastery Mode</div>
        </div>

        <div className="h-[250px] w-full flex items-center justify-center">
           {!loading && skillData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillData}>
                 <PolarGrid stroke="#ffffff10" />
                 <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                 <Radar
                   name="Score"
                   dataKey="A"
                   stroke="#E9C46A"
                   fill="#E9C46A"
                   fillOpacity={0.3}
                 />
               </RadarChart>
             </ResponsiveContainer>
           ) : (
             <div className="animate-pulse flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full border-4 border-dashed border-white/5" />
                <p className="text-xs text-gray-500 font-bold uppercase">Mapping your potential...</p>
             </div>
           )}
        </div>
        
        <p className="text-[10px] text-center text-gray-400 italic">"Your mission choices shape the stars of your knowledge." — Eggy</p>
      </div>

      {/* Daily Progress Card */}
      <div className="card space-y-4">
        <h3 className="text-xl font-fredoka text-teal">Daily Challenge</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center font-fredoka text-2xl">🥚</div>
          <div className="flex-1 space-y-1">
            <p className="font-bold text-sm">Hatch 3 New Eggs</p>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-teal w-1/3" />
            </div>
          </div>
          <span className="text-xs text-gray-400">1/3</span>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
