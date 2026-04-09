import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await signIn(email)
    
    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      setSent(true)
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in zoom-in duration-300">
        <div className="w-20 h-20 bg-teal/20 rounded-full flex items-center justify-center border-4 border-teal animate-pulse">
          <CheckCircle2 className="w-10 h-10 text-teal" />
        </div>
        <div className="space-y-4 text-center">
          <h2 className="text-3xl font-fredoka text-gold">Check your mail!</h2>
          <p className="text-gray-400 max-w-xs mx-auto">
            We sent a magic link to <span className="text-white font-bold">{email}</span>. Click it to start your adventure!
          </p>
        </div>
        <button 
          onClick={() => setSent(false)}
          className="text-teal font-bold hover:underline"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-12">
      <header className="space-y-4 text-center">
        <h2 className="text-4xl font-fredoka text-gold">Ready to Hatch?</h2>
        <p className="text-gray-400">Enter your email and we'll send a magic link.</p>
      </header>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-teal ml-4">
            Parent/Guardian Email
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              required
              placeholder="hello@example.com"
              className="w-full bg-navy border-2 border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-teal outline-none transition-all text-lg font-nunito"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-orange text-sm text-center font-bold px-4">{error}</p>
        )}

        <button
          disabled={loading}
          type="submit"
          className="w-full btn-primary py-5 rounded-2xl flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              Send Magic Link
            </>
          )}
        </button>
      </form>

      <div className="card p-4 text-center flex items-center gap-3">
        <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-navy font-bold text-xs">!</div>
        <p className="text-xs text-gray-400 font-medium">No password needed! Just click the link in your email.</p>
      </div>
    </div>
  )
}

export default AuthPage
