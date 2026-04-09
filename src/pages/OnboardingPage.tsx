import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Loader2, ArrowRight, ArrowLeft } from 'lucide-react'
import EggAvatar from '../components/EggAvatar'
import type { AvatarConfig } from '../components/EggAvatar'
import { motion, AnimatePresence } from 'framer-motion'

const SHELL_COLORS = [
  { name: 'Kalabari Red', hex: '#A52A2A' },
  { name: 'Yoruba Indigo', hex: '#4B0082' },
  { name: 'Igbo Green', hex: '#008000' },
  { name: 'Benin Bronze', hex: '#CD7F32' },
  { name: 'Hausa White', hex: '#F5F5F5' },
  { name: 'Delta Teal', hex: '#2A9D8F' },
]

const OUTFITS: { id: AvatarConfig['outfit']; name: string; emoji: string }[] = [
  { id: 'none', name: 'Original', emoji: '🥚' },
  { id: 'agbada', name: 'Agbada', emoji: '🧥' },
  { id: 'gele', name: 'Gele Wrap', emoji: '🧣' },
  { id: 'school_uniform', name: 'School Uniform', emoji: '👔' },
  { id: 'masquerade', name: 'Masquerade', emoji: '👺' },
  { id: 'cap_gown', name: 'Cap & Gown', emoji: '🎓' },
]

const ACCESSORIES: { id: AvatarConfig['accessory']; name: string; emoji: string }[] = [
  { id: 'none', name: 'None', emoji: '❌' },
  { id: 'beads', name: 'Coral Beads', emoji: '📿' },
  { id: 'anklet', name: 'Anklet', emoji: '⛓️' },
  { id: 'drum', name: 'Talking Drum', emoji: '🪘' },
  { id: 'crown', name: 'Star Crown', emoji: '👑' },
]

const EXPRESSIONS: { id: AvatarConfig['expression']; name: string; emoji: string }[] = [
  { id: 'happy', name: 'Happy', emoji: '😊' },
  { id: 'determined', name: 'Determined', emoji: '😤' },
  { id: 'cheeky', name: 'Cheeky', emoji: '😜' },
  { id: 'wise', name: 'Wise', emoji: '🦉' },
]

const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [shellColor, setShellColor] = useState(SHELL_COLORS[0].hex)
  const [outfit, setOutfit] = useState<AvatarConfig['outfit']>('none')
  const [accessory, setAccessory] = useState<AvatarConfig['accessory']>('none')
  const [expression, setExpression] = useState<AvatarConfig['expression']>('happy')
  
  const [role, setRole] = useState<'student' | 'teacher' | null>(null)
  const [className, setClassName] = useState('')
  const [classCode, setClassCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { updateProfile, createClass, joinClass } = useAuth()
  const navigate = useNavigate()

  const avatarConfig: AvatarConfig = {
    shellColor,
    outfit,
    accessory,
    expression
  }

  const handleComplete = async () => {
    if (!name) return

    setLoading(true)
    setError(null)
    const { error: profileError } = await updateProfile({
      display_name: name,
      avatar_config: avatarConfig,
      xp: 0,
      streak: 0,
      last_active: new Date().toISOString()
    })

    if (!profileError) {
      navigate('/dashboard')
    } else {
      setError(profileError.message)
      setLoading(false)
    }
  }

  const handleTeacherSetup = async () => {
    if (!className) return
    setLoading(true)
    setError(null)
    const { data, error: classError } = await createClass(className)
    if (data) {
      setGeneratedCode(data.code)
      setStep(100) // Success step
    } else {
      setError(classError.message)
    }
    setLoading(false)
  }

  const handleStudentJoin = async () => {
    if (!classCode) return
    setLoading(true)
    setError(null)
    const { error: joinError } = await joinClass(classCode)
    if (!joinError) {
      setStep(1) // Proceed to avatar flow
    } else {
      setError('Invalid Class Code. Ask your teacher!')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto min-h-[80vh] flex flex-col pt-8 pb-12 px-4">
      <div className="flex-1 flex flex-col space-y-8">
        <header className="text-center space-y-2">
          <div className="flex justify-center gap-1 mb-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-12 rounded-full ${s === step ? 'bg-gold' : s < step ? 'bg-teal' : 'bg-white/10'}`} />
            ))}
          </div>
          <h2 className="text-3xl font-fredoka text-white">
            {role === null ? "Welcome to Eggy!" : 
             role === 'teacher' ? (step === 100 ? "Class Ready!" : "Teacher Setup") :
             step === 0 ? "Join Your Class" :
             step === 1 ? "What's your name?" : 
             step === 2 ? "Who are you?" : "Show your style!"}
          </h2>
          <p className="text-gray-400 text-sm">
            {role === null ? "Are you an explorer or a guide?" :
             role === 'teacher' ? (step === 100 ? "Share this code with your students." : "Create your digital classroom.") :
             step === 0 ? "Enter the secret code from your teacher." :
             step === 1 ? "Every adventurer needs a legendary name." : 
             step === 2 ? "Pick your shell color and expression." : "Nigerian outfits are the best! Pick one."}
          </p>
        </header>

        <div className="flex-1">
          <AnimatePresence mode="wait">
            {role === null && (
              <motion.div 
                key="role-select" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                <button 
                  onClick={() => { setRole('student'); setStep(0); }}
                  className="w-full card p-8 flex flex-col items-center gap-4 hover:border-teal transition-all group"
                >
                   <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">🎓</div>
                   <div className="text-center">
                      <h3 className="text-xl font-fredoka text-white">I am a Student</h3>
                      <p className="text-sm text-gray-500">I want to hatch eggs and go on adventures!</p>
                   </div>
                </button>
                <button 
                  onClick={() => { setRole('teacher'); setStep(1); }}
                  className="w-full card p-8 flex flex-col items-center gap-4 hover:border-gold transition-all group"
                >
                   <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">👨‍🏫</div>
                   <div className="text-center">
                      <h3 className="text-xl font-fredoka text-white">I am a Teacher</h3>
                      <p className="text-sm text-gray-500">I want to manage my class and track progress.</p>
                   </div>
                </button>
              </motion.div>
            )}

            {role === 'teacher' && step === 1 && (
              <motion.div 
                key="teacher-step1" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="py-8 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Classroom Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="e.g. Primary 4 Gold"
                    className="w-full bg-navy/50 border-4 border-white/5 rounded-3xl py-6 px-8 text-2xl font-fredoka text-center focus:border-gold outline-none transition-all"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                  />
                  {error && <p className="text-orange text-xs text-center font-bold">{error}</p>}
                </div>
                <button 
                  disabled={!className || loading}
                  onClick={handleTeacherSetup}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-5"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Create Classroom <ArrowRight className="w-5 h-5" /></>}
                </button>
                <button onClick={() => setRole(null)} className="w-full text-gray-500 text-sm font-bold">Change Role</button>
              </motion.div>
            )}

            {role === 'teacher' && step === 100 && (
              <motion.div 
                key="teacher-success" 
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                className="space-y-8 text-center"
              >
                <div className="py-12 bg-gold/10 rounded-3xl border-2 border-dashed border-gold/30 space-y-4">
                  <p className="text-xs font-black text-gold uppercase tracking-[0.2em]">Your Secret Code</p>
                  <h3 className="text-6xl font-fredoka text-white tracking-widest">{generatedCode}</h3>
                </div>
                <div className="p-4 bg-navy/50 rounded-2xl border border-white/5 text-sm text-gray-400">
                  Students will enter this code to join your classroom. Write it down!
                </div>
                <button onClick={() => navigate('/teacher')} className="btn-primary w-full py-5">
                   Go to Teacher Dashboard
                </button>
              </motion.div>
            )}

            {role === 'student' && step === 0 && (
              <motion.div 
                key="student-join" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="py-8 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Enter Class Code</label>
                  <input
                    autoFocus
                    type="text"
                    maxLength={6}
                    placeholder="XXXXXX"
                    className="w-full bg-navy/50 border-4 border-white/5 rounded-3xl py-6 px-8 text-4xl font-fredoka text-center focus:border-teal outline-none transition-all uppercase tracking-widest"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                  />
                  {error && <p className="text-orange text-xs text-center font-bold">{error}</p>}
                </div>
                <button 
                  disabled={classCode.length < 6 || loading}
                  onClick={handleStudentJoin}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-5"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <>Join Class <ArrowRight className="w-5 h-5" /></>}
                </button>
                <button onClick={() => setRole(null)} className="w-full text-gray-500 text-sm font-bold">Change Role</button>
              </motion.div>
            )}

            {role === 'student' && step === 1 && (
              <motion.div 
                key="student-name" 
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="py-8 space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Your Explorer Name</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="Enter Your Name"
                    className="w-full bg-navy/50 border-4 border-white/5 rounded-3xl py-6 px-8 text-2xl font-fredoka text-center focus:border-gold outline-none transition-all"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <button 
                  disabled={!name}
                  onClick={() => setStep(2)}
                  className="btn-primary w-full flex items-center justify-center gap-2 py-5"
                >
                  Next: Customize Eggy <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-center py-4 bg-navy/30 rounded-3xl border border-white/5">
                  <EggAvatar config={avatarConfig} scale={0.8} />
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Shell Color</label>
                    <div className="grid grid-cols-6 gap-2">
                      {SHELL_COLORS.map(c => (
                        <button
                          key={c.hex}
                          onClick={() => setShellColor(c.hex)}
                          className={`h-10 rounded-xl border-2 transition-all ${shellColor === c.hex ? 'border-white scale-110' : 'border-transparent'}`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Expression</label>
                    <div className="grid grid-cols-2 gap-2">
                       {EXPRESSIONS.map(e => (
                         <button
                           key={e.id}
                           onClick={() => setExpression(e.id)}
                           className={`p-3 rounded-2xl border-2 text-left flex items-center gap-3 transition-all ${expression === e.id ? 'bg-teal border-white' : 'bg-white/5 border-transparent'}`}
                         >
                            <span className="text-xl">{e.emoji}</span>
                            <span className="text-xs font-bold">{e.name}</span>
                         </button>
                       ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="flex-1 bg-white/5 py-4 rounded-2xl flex items-center justify-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="flex-[2] btn-primary py-4 rounded-2xl flex items-center justify-center gap-2">
                    Next <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex justify-center py-4 bg-navy/30 rounded-3xl border border-white/5">
                  <EggAvatar config={avatarConfig} scale={0.8} />
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Outfit</label>
                    <div className="grid grid-cols-3 gap-2">
                      {OUTFITS.map(o => (
                        <button
                          key={o.id}
                          onClick={() => setOutfit(o.id)}
                          className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${outfit === o.id ? 'bg-teal border-white' : 'bg-white/5 border-transparent'}`}
                        >
                           <span className="text-xl">{o.emoji}</span>
                           <span className="text-[10px] font-bold text-center">{o.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-teal ml-2">Accessory</label>
                    <div className="grid grid-cols-3 gap-2">
                      {ACCESSORIES.map(a => (
                        <button
                          key={a.id}
                          onClick={() => setAccessory(a.id)}
                          className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all ${accessory === a.id ? 'bg-teal border-white' : 'bg-white/5 border-transparent'}`}
                        >
                           <span className="text-xl">{a.emoji}</span>
                           <span className="text-[10px] font-bold text-center">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="flex-1 bg-white/5 py-4 rounded-2xl flex items-center justify-center gap-2">
                    <ArrowLeft className="w-5 h-5" /> Back
                  </button>
                  <button 
                    disabled={loading}
                    onClick={handleComplete} 
                    className="flex-[2] btn-primary py-4 rounded-2xl flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Start Adventure!"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default OnboardingPage
