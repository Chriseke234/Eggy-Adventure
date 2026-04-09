import React from 'react'
import { useNavigate } from 'react-router-dom'
import EggyMascot from '../components/EggyMascot'

const LandingPage: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-12">
      <header className="space-y-4">
        <h1 className="text-6xl font-fredoka text-gold drop-shadow-lg leading-tight">
          Eggy <span className="text-teal">Adventures</span>
        </h1>
        <p className="text-xl text-white/80 max-w-xs mx-auto font-nunito font-semibold">
          Learn, play, and hatch amazing discoveries with your robot pal!
        </p>
      </header>

      <div className="relative">
        <div className="absolute inset-0 bg-teal/20 blur-3xl rounded-full" />
        <EggyMascot expression="happy" scale={1.2} />
      </div>

      <button
        onClick={() => navigate('/auth')}
        className="btn-primary text-2xl px-12 py-5 rounded-3xl animate-pulse shadow-orange/40 shadow-2xl"
      >
        Start Hatching!
      </button>

      <footer className="text-teal font-bold tracking-widest text-xs uppercase opacity-50">
        Mobile First • Kids Safe • Fun Learning
      </footer>
    </div>
  )
}

export default LandingPage
