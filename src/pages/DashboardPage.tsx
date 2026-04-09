import EggAvatar, { AvatarConfig } from '../components/EggAvatar'

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
