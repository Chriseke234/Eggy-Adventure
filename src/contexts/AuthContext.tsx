import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { User } from '@supabase/supabase-js'

interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
  xp: number
  streak: number
  last_active: string | null
  badges: string[] | null
  avatar_config: any | null
  role: 'student' | 'teacher'
  class_id: string | null
}

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string) => Promise<any>
  signOut: () => Promise<any>
  updateProfile: (updates: Partial<Profile>) => Promise<any>
  createClass: (name: string) => Promise<{ data: any, error: any }>
  joinClass: (code: string) => Promise<{ data: any, error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchProfile = async (userId: string) => {
    try {
      // Check localStorage first for immediate UI
      const cached = localStorage.getItem(`eggy_profile_${userId}`)
      if (cached) {
        setProfile(JSON.parse(cached))
      }

      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code === 'PGRST116') {
        setProfile(null)
      } else if (data) {
        setProfile(data)
        localStorage.setItem(`eggy_profile_${userId}`, JSON.stringify(data))
      }
    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string) => {
    return supabase.auth.signInWithOtp({ email })
  }

  const signOut = async () => {
    localStorage.removeItem(`eggy_profile_${user?.id}`)
    return supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return

    const { data, error } = await supabase
      .from('profiles')
      .upsert({ ...updates, id: user.id })
      .select()
      .single()

    if (data) {
      setProfile(data)
      localStorage.setItem(`eggy_profile_${user.id}`, JSON.stringify(data))
    }
    return { data, error }
  }

  const createClass = async (name: string) => {
    if (!user) return { data: null, error: new Error('User not found') }

    // Generate a unique 6-character code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Create the class
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .insert({ name, teacher_id: user.id, code })
      .select()
      .single()

    if (classError) return { data: null, error: classError }

    // Update teacher profile with class_id and role
    const { error: profileError } = await updateProfile({
      role: 'teacher',
      class_id: classData.id
    })

    return { data: classData, error: profileError }
  }

  const joinClass = async (code: string) => {
    if (!user) return { data: null, error: new Error('User not found') }

    // Find the class by code
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('code', code.toUpperCase())
      .single()

    if (classError) return { data: null, error: classError }

    // Update student profile with class_id and role
    const { error: profileError } = await updateProfile({
      role: 'student',
      class_id: classData.id
    })

    return { data: classData, error: profileError }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, updateProfile, createClass, joinClass }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
