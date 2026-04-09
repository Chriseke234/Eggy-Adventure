import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'
import HatchLabPage from './pages/HatchLabPage'
import HospitalPage from './pages/HospitalPage'
import EvolutionPage from './pages/EvolutionPage'
import ExplorerPage from './pages/ExplorerPage'
import CollaborativeHatchPage from './pages/CollaborativeHatchPage'
import TeacherDashboardPage from './pages/TeacherDashboardPage'
import TeacherRoute from './components/TeacherRoute'
import EnergyShell from './components/EnergyShell'
import BottomNav from './components/BottomNav'
import JournalPage from './pages/JournalPage'
import { syncOfflineQueue } from './lib/offline'
import { WifiOff } from 'lucide-react'

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="animate-bounce font-fredoka text-3xl text-teal">Eggy is hatching...</div>
    </div>
  )

  if (!user) return <Navigate to="/auth" />
  if (!profile && window.location.pathname !== '/onboarding') return <Navigate to="/onboarding" />

  return <>{children}</>
}

function AppContent() {
  const { user } = useAuth()
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine)

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      syncOfflineQueue()
    }
    const handleOffline = () => setIsOffline(true)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial sync
    if (navigator.onLine) syncOfflineQueue()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col pb-20 pt-1">
      <AnimatePresence>
        {isOffline && (
          <motion.div 
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            exit={{ y: -50 }}
            className="fixed top-0 left-0 right-0 bg-orange text-navy py-1.5 px-4 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 z-[60] shadow-lg"
          >
            <WifiOff className="w-3 h-3" />
            Eggy is working offline — syncing soon!
          </motion.div>
        )}
      </AnimatePresence>
      <EnergyShell />
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/hatch-lab" element={
            <ProtectedRoute>
              <HatchLabPage />
            </ProtectedRoute>
          } />
          <Route path="/hospital" element={
            <ProtectedRoute>
              <HospitalPage />
            </ProtectedRoute>
          } />
          <Route path="/evolution" element={
            <ProtectedRoute>
              <EvolutionPage />
            </ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute>
              <ExplorerPage />
            </ProtectedRoute>
          } />
          <Route path="/teacher" element={
            <TeacherRoute>
              <TeacherDashboardPage />
            </TeacherRoute>
          } />
          <Route path="/collaborative" element={
            <ProtectedRoute>
              <CollaborativeHatchPage />
            </ProtectedRoute>
          } />
          <Route path="/journal" element={
            <ProtectedRoute>
              <JournalPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {user && <BottomNav />}
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
