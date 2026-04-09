import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, Compass, BookOpen, User, Users, Zap, ShoppingBag } from 'lucide-react'
import { clsx } from 'clsx'
import { useAuth } from '../contexts/AuthContext'

const BottomNav: React.FC = () => {
  const { profile } = useAuth()
  
  const studentItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: BookOpen, label: 'Journal', path: '/journal' },
  ]

  const teacherItems = [
    { icon: Home, label: 'Dashboard', path: '/teacher' },
    { icon: Users, label: 'Class', path: '/teacher?tab=overview' },
    { icon: Zap, label: 'Multi-Hatch', path: '/collaborative' },
    { icon: User, label: 'Profile', path: '/profile' },
  ]

  const items = profile?.role === 'teacher' ? teacherItems : studentItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-navy/90 backdrop-blur-lg border-t border-white/10 px-4 flex items-center justify-around z-40">
      {items.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => clsx(
            "flex flex-col items-center gap-1 transition-all duration-300",
            isActive ? "text-orange scale-110" : "text-teal hover:text-white"
          )}
        >
          <item.icon className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}

export default BottomNav
