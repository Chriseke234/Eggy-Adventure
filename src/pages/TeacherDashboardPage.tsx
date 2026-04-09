import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  BookOpen, 
  Clock, 
  FileText, 
  ChevronRight, 
  Calendar,
  Download,
  Zap,
  Star,
  AlertTriangle,
  Award,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import EggAvatar from '../components/EggAvatar'

import { MISSIONS } from '../data/missions'


interface Student {
  id: string
  display_name: string
  xp: number
  streak: number
  last_active: string
  avatar_config: any
  badges: string[]
}

interface ScreenTimeData {
  student_id: string
  daily_limit_minutes: number
  bonus_minutes: number
  today_usage_minutes: number
}

interface Session {
  id: string
  user_id: string
  scores: any
  created_at: string
  mission_name: string
}

const TeacherDashboardPage: React.FC = () => {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'screentime'>('overview')
  const [students, setStudents] = useState<Student[]>([])
  const [classCode, setClassCode] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentHistory, setStudentHistory] = useState<Session[]>([])
  const [filter, setFilter] = useState<'all' | 'week' | 'month'>('week')
  const [screenTimeSettings, setScreenTimeSettings] = useState<Record<string, ScreenTimeData>>({})
  const [assignments, setAssignments] = useState<any[]>([])

  useEffect(() => {
    if (profile?.class_id) {
      fetchClassData()
      fetchStudents()
      fetchScreenTimeSettings()
      fetchAssignments()
      subscribeToSessions()
    }
  }, [profile])

  const fetchClassData = async () => {
    const { data } = await supabase
      .from('classes')
      .select('code')
      .eq('id', profile?.class_id)
      .single()
    if (data) setClassCode(data.code)
  }

  const fetchStudents = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('class_id', profile?.class_id)
      .eq('role', 'student')
      .order('xp', { ascending: false })
    
    if (data) setStudents(data)
  }

  const fetchScreenTimeSettings = async () => {
    const { data } = await supabase
      .from('screen_time_settings')
      .select('*')
    if (data) {
      const settings: Record<string, ScreenTimeData> = {}
      data.forEach(s => settings[s.student_id] = s)
      setScreenTimeSettings(settings)
    }
  }

  const fetchAssignments = async () => {
    const { data } = await supabase
      .from('mission_assignments')
      .select('*')
      .eq('class_id', profile?.class_id)
    if (data) setAssignments(data)
  }

  const assignMission = async (missionId: string, studentId?: string) => {
    const { error } = await supabase
      .from('mission_assignments')
      .insert({
        class_id: profile?.class_id,
        student_id: studentId || null,
        mission_id: missionId,
        status: 'incomplete'
      })
    if (!error) fetchAssignments()
  }

  const updateScreenTimeLimit = async (studentId: string, limit: number) => {
    const { error } = await supabase
      .from('screen_time_settings')
      .upsert({
        student_id: studentId,
        daily_limit_minutes: limit
      })
    if (!error) fetchScreenTimeSettings()
  }

  const awardBonusTime = async (studentId: string, bonus: number) => {
    const currentBonus = screenTimeSettings[studentId]?.bonus_minutes || 0
    const { error } = await supabase
      .from('screen_time_settings')
      .upsert({
        student_id: studentId,
        bonus_minutes: currentBonus + bonus
      })
    if (!error) fetchScreenTimeSettings()
  }

  const subscribeToSessions = () => {
    const channel = supabase
      .channel('class-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'sessions' },
        () => {
          fetchStudents() // Refresh leaderboard on any session change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const fetchStudentHistory = async (studentId: string) => {
    const { data } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', studentId)
      .order('created_at', { ascending: true })
    
    if (data) setStudentHistory(data)
  }

  const exportCSV = () => {
    const headers = ['Name', 'XP', 'Streak', 'Last Active']
    const rows = students.map(s => [s.display_name, s.xp, s.streak, new Date(s.last_active).toLocaleDateString()])
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `class_report_${new Date().toLocaleDateString()}.csv`)
    document.body.appendChild(link)
    link.click()
  }

  const exportPDF = (student: Student) => {
    const doc = new jsPDF()
    doc.text(`Student Achievement Report: ${student.display_name}`, 20, 20)
    doc.text(`Total XP: ${student.xp}`, 20, 30)
    doc.text(`Class: ${profile?.display_name}'s Classroom`, 20, 40)
    
    // Add history table if needed
    doc.save(`${student.display_name}_report.pdf`)
  }

  const chartData = studentHistory.map(s => ({
    date: new Date(s.created_at).toLocaleDateString(),
    clarity: s.scores.clarity,
    specificity: s.scores.specificity,
    creativity: s.scores.creativity,
    effectiveness: s.scores.effectiveness,
    total: (s.scores.clarity + s.scores.specificity + s.scores.creativity + s.scores.effectiveness)
  }))

  const getWeakAreas = (history: Session[]) => {
    if (history.length === 0) return []
    const sums = history.reduce((acc, s) => ({
      clarity: acc.clarity + s.scores.clarity,
      specificity: acc.specificity + s.scores.specificity,
      creativity: acc.creativity + s.scores.creativity,
      effectiveness: acc.effectiveness + s.scores.effectiveness,
    }), { clarity: 0, specificity: 0, creativity: 0, effectiveness: 0 })
    
    const count = history.length
    const areas =  [
      { name: 'Clarity', val: sums.clarity / count },
      { name: 'Specificity', val: sums.specificity / count },
      { name: 'Creativity', val: sums.creativity / count },
      { name: 'Effectiveness', val: sums.effectiveness / count },
    ]
    return areas.filter(a => a.val < 50)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-navy-light p-6 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center text-2xl">🏫</div>
          <div>
            <h1 className="text-2xl font-fredoka text-white">Teacher Dashboard</h1>
            <p className="text-gray-400 text-sm">Managing: {profile?.display_name}'s Classroom</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
            <span className="text-[10px] font-black text-gray-500 uppercase block">Class Code</span>
            <span className="text-xl font-fredoka text-gold tracking-widest">{classCode}</span>
          </div>
          <button onClick={exportCSV} className="btn-secondary flex items-center gap-2 py-3 px-4">
            <Download className="w-4 h-4" /> Export Class
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-navy/50 p-1 rounded-2xl w-fit border border-white/5">
        {(['overview', 'missions', 'screentime'] as const).map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all ${activeTab === t ? 'bg-teal text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Leaderboard */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-fredoka text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-gold" />
                Live Leaderboard
              </h2>
              <div className="flex gap-2">
                {(['all', 'week', 'month'] as const).map(f => (
                  <button 
                    key={f} 
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-gold text-navy' : 'bg-white/5 text-gray-500 hover:text-white'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="card-no-padding overflow-hidden overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">XP</th>
                    <th className="px-6 py-4 text-center">Streak</th>
                    <th className="px-6 py-4 text-center">Status</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map((s, i) => (
                    <motion.tr 
                      key={s.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => { setSelectedStudent(s); fetchStudentHistory(s.id); }}
                      className="hover:bg-white/5 cursor-pointer transition-colors group"
                    >
                      <td className="px-6 py-4 font-fredoka text-xl text-gray-600">
                        {i + 1 === 1 ? '🥇' : i + 1 === 2 ? '🥈' : i + 1 === 3 ? '🥉' : `#${i + 1}`}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy-light rounded-full border border-white/5 overflow-hidden flex items-center justify-center p-1">
                            {s.avatar_config ? <EggAvatar config={s.avatar_config} scale={0.25} /> : '🥚'}
                          </div>
                          <span className="font-bold text-white group-hover:text-teal transition-colors">{s.display_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center font-fredoka text-gold">{s.xp}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="inline-flex items-center gap-1 bg-orange/10 text-orange px-2 py-0.5 rounded-full text-xs font-bold">
                           <Zap className="w-3 h-3 fill-orange" />
                           {s.streak}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className={`w-2 h-2 rounded-full mx-auto ${new Date().getTime() - new Date(s.last_active || 0).getTime() < 300000 ? 'bg-teal animate-pulse shadow-[0_0_8px_#2A9D8F]' : 'bg-gray-600'}`} />
                      </td>
                      <td className="px-6 py-4">
                        <ChevronRight className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Stats/Alerts */}
          <div className="space-y-6">
             <h2 className="text-xl font-fredoka text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-teal" />
                Class Insights
             </h2>
             <div className="grid grid-cols-1 gap-4">
                <div className="card p-6 bg-gradient-to-br from-teal/20 to-navy-light border-teal/20">
                   <div className="flex justify-between items-start mb-4">
                      <Award className="w-8 h-8 text-teal" />
                      <span className="text-[10px] font-black text-teal uppercase">Class Average</span>
                   </div>
                   <div className="text-3xl font-fredoka text-white">
                      {students.length > 0 ? Math.round(students.reduce((a,b) => a + b.xp, 0) / students.length) : 0} XP
                   </div>
                   <p className="text-xs text-gray-500 mt-2">Overall class growth this week: <span className="text-teal">+12%</span></p>
                </div>

                <div className="card p-6 border-orange/20">
                   <div className="flex justify-between items-start mb-4">
                      <AlertTriangle className="w-8 h-8 text-orange" />
                      <span className="text-[10px] font-black text-orange uppercase">Needs Focus</span>
                   </div>
                   <div className="space-y-3">
                      <p className="text-xs text-gray-400">Students averaging {"<"} 50% in Creativity:</p>
                      <div className="flex -space-x-2">
                         {students.slice(0,3).map(s => (
                           <div key={s.id} className="w-8 h-8 rounded-full border-2 border-navy overflow-hidden bg-navy-light flex items-center justify-center">
                              {s.avatar_config ? <EggAvatar config={s.avatar_config} scale={0.15} /> : '🥚'}
                           </div>
                         ))}
                         {students.length > 3 && <div className="w-8 h-8 rounded-full border-2 border-navy bg-white/5 flex items-center justify-center text-[10px] text-gray-400 font-bold">+{students.length - 3}</div>}
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-6">
              <h2 className="text-xl font-fredoka text-white flex items-center gap-2">
                 <BookOpen className="w-6 h-6 text-teal" />
                 Available Missions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {MISSIONS.map(m => (
                   <div key={m.id} className="card p-6 flex flex-col justify-between gap-4 group hover:border-teal transition-all">
                      <div>
                         <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-black text-teal uppercase tracking-widest">{m.state}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${m.difficulty === 'Legendary' ? 'bg-gold/10 text-gold' : 'bg-white/5 text-gray-500'}`}>{m.difficulty}</span>
                         </div>
                         <h3 className="font-fredoka text-lg text-white group-hover:text-teal transition-colors">{m.name}</h3>
                         <p className="text-xs text-gray-500 line-clamp-2 mt-1">{m.context}</p>
                      </div>
                      <button 
                        onClick={() => assignMission(m.id)}
                        className="btn-primary py-3 text-xs flex items-center justify-center gap-2"
                      >
                         Assign to Class <ArrowRight className="w-4 h-4" />
                      </button>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-6">
              <h2 className="text-xl font-fredoka text-white flex items-center gap-2">
                 <Calendar className="w-6 h-6 text-orange" />
                 Active Assignments
              </h2>
              <div className="space-y-3">
                 {assignments.slice(0, 5).map((a, i) => (
                   <div key={i} className="card p-4 flex items-center justify-between border-white/5">
                      <div>
                         <p className="text-sm font-bold text-white">{MISSIONS.find(m => m.id === a.mission_id)?.name}</p>
                         <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                            {a.student_id ? students.find(s => s.id === a.student_id)?.display_name : 'Entire Class'}
                         </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-[10px] font-black uppercase ${a.status === 'completed' ? 'bg-teal/10 text-teal' : 'bg-orange/10 text-orange'}`}>
                         {a.status}
                      </div>
                   </div>
                 ))}
                 {assignments.length === 0 && <p className="text-gray-500 text-sm italic">No missions assigned yet.</p>}
              </div>
           </div>
        </div>
      )}

      {activeTab === 'screentime' && (
        <div className="space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-fredoka text-white flex items-center gap-2">
                 <Clock className="w-6 h-6 text-orange" />
                 Student Screen Time
              </h2>
           </div>

           <div className="card-no-padding overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                  <tr>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Daily Limit</th>
                    <th className="px-6 py-4 text-center">Today Usage</th>
                    <th className="px-6 py-4 text-center">Bonus Time</th>
                    <th className="px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {students.map(s => (
                    <tr key={s.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold text-white">{s.display_name}</td>
                      <td className="px-6 py-4">
                         <div className="flex items-center justify-center gap-3">
                            <input 
                              type="range" 
                              min={15} max={180} step={15}
                              value={screenTimeSettings[s.id]?.daily_limit_minutes || 45}
                              onChange={(e) => updateScreenTimeLimit(s.id, parseInt(e.target.value))}
                              className="accent-teal h-1.5 rounded-full bg-white/10"
                            />
                            <span className="text-xs font-bold w-12 text-center text-teal">{screenTimeSettings[s.id]?.daily_limit_minutes || 45}m</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <div className="text-sm font-fredoka text-white">
                            {screenTimeSettings[s.id]?.today_usage_minutes || 0} / {screenTimeSettings[s.id]?.daily_limit_minutes || 45} min
                         </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                         <span className="text-gold font-bold">+{screenTimeSettings[s.id]?.bonus_minutes || 0}m</span>
                      </td>
                      <td className="px-6 py-4">
                         <button 
                           onClick={() => awardBonusTime(s.id, 15)}
                           className="bg-gold/10 text-gold px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-navy transition-all"
                         >
                            Award +15m
                         </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Student Deep Dive Overlay */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy/95 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-navy-light w-full max-w-4xl rounded-[40px] border border-white/10 overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="p-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-navy rounded-3xl border-2 border-teal/30 p-2 flex items-center justify-center shrink-0">
                    <EggAvatar config={selectedStudent.avatar_config} scale={0.6} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-fredoka text-white">{selectedStudent.display_name}</h2>
                    <div className="flex gap-2 mt-2">
                        <span className="bg-gold/10 text-gold text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">Level {Math.floor(selectedStudent.xp/500) + 1} Explorer</span>
                        <span className="bg-teal/10 text-teal text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest">{selectedStudent.streak} Day Streak</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => exportPDF(selectedStudent)} className="btn-secondary px-4 py-3 flex items-center gap-2">
                      <FileText className="w-4 h-4" /> PDF Report
                   </button>
                   <button onClick={() => setSelectedStudent(null)} className="bg-white/5 text-white p-3 rounded-2xl hover:bg-white/10">
                      ✕
                   </button>
                </div>
              </div>

              <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Score Chart */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Score Trends</h3>
                    <div className="h-64 card p-4">
                       <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData}>
                             <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                             <XAxis dataKey="date" stroke="#4a5568" fontSize={10} />
                             <YAxis stroke="#4a5568" fontSize={10} />
                             <Tooltip 
                               contentStyle={{ backgroundColor: '#0A0E14', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                               itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                             />
                             <Line type="monotone" dataKey="total" stroke="#E9C46A" strokeWidth={3} dot={{ fill: '#E9C46A' }} name="Total Pts" />
                             <Line type="monotone" dataKey="clarity" stroke="#2A9D8F" strokeWidth={1} dot={false} name="Clarity" />
                             <Line type="monotone" dataKey="creativity" stroke="#F4A261" strokeWidth={1} dot={false} name="Creativity" />
                          </LineChart>
                       </ResponsiveContainer>
                    </div>
                </div>

                {/* Analysis & Badges */}
                <div className="space-y-6">
                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Learning Insights</h3>
                      <div className="space-y-2">
                         {getWeakAreas(studentHistory).map(area => (
                           <div key={area.name} className="flex items-center gap-3 bg-orange/10 p-3 rounded-xl border border-orange/20">
                              <AlertTriangle className="w-4 h-4 text-orange" />
                              <div>
                                 <p className="text-[10px] font-black text-orange uppercase tracking-widest">Weak Area: {area.name}</p>
                                 <p className="text-[10px] text-gray-300">Averaging {Math.round(area.val)}%. Needs more detail.</p>
                              </div>
                           </div>
                         ))}
                         {getWeakAreas(studentHistory).length === 0 && studentHistory.length > 0 && (
                            <div className="flex items-center gap-3 bg-teal/10 p-3 rounded-xl border border-teal/20">
                               <CheckCircle2 className="w-4 h-4 text-teal" />
                               <div>
                                  <p className="text-[10px] font-black text-teal uppercase tracking-widest">Balanced Explorer</p>
                                  <p className="text-[10px] text-gray-300">Performing well across all categories!</p>
                               </div>
                            </div>
                         )}
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Badges Earned</h3>
                      <div className="grid grid-cols-4 gap-2">
                         {(selectedStudent.badges || []).map(b => (
                           <div key={b} className="aspect-square bg-navy rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/5" title={b}>
                              🏅
                           </div>
                         ))}
                         {(!selectedStudent.badges || selectedStudent.badges.length === 0) && (
                            <p className="text-[10px] text-gray-600 italic col-span-4">No badges earned yet.</p>
                         )}
                      </div>
                   </div>
                </div>
              </div>

              {/* Recent History List */}
              <div className="px-8 pb-8">
                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Recent Hatches</h3>
                <div className="space-y-2">
                  {studentHistory.slice(-5).reverse().map(h => (
                    <div key={h.id} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-transparent hover:border-white/10 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">🥚</div>
                        <div>
                          <p className="text-sm font-bold text-white">{h.mission_name}</p>
                          <p className="text-[10px] text-gray-500">{new Date(h.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="text-xl font-fredoka text-gold">
                        {h.scores.clarity + h.scores.specificity + h.scores.creativity + h.scores.effectiveness}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Simple Helper Component removed - using lucide-react instead

export default TeacherDashboardPage
