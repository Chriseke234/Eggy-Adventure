import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const TeacherRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, loading } = useAuth()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="animate-bounce font-fredoka text-3xl text-teal">Checking credentials...</div>
    </div>
  )

  if (!user) return <Navigate to="/auth" />
  if (profile?.role !== 'teacher') return <Navigate to="/dashboard" />

  return <>{children}</>
}

export default TeacherRoute
