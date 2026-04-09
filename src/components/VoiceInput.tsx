import React, { useState, useEffect } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface VoiceInputProps {
  onTranscript: (text: string) => void
  onStateChange?: (isListening: boolean) => void
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, onStateChange }) => {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
    }
  }, [])

  const startListening = () => {
    const Recognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new Recognition()

    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      onStateChange?.(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error)
      stopListening()
    }

    recognition.onend = () => {
      stopListening()
    }

    recognition.start()
  }

  const stopListening = () => {
    setIsListening(false)
    onStateChange?.(false)
  }

  if (!isSupported) return null

  return (
    <div className="relative">
      <button
        type="button"
        onClick={isListening ? stopListening : startListening}
        className={`p-3 rounded-2xl transition-all duration-300 ${
          isListening 
            ? 'bg-orange text-white shadow-[0_0_20px_rgba(244,162,97,0.5)] animate-pulse' 
            : 'bg-white/5 text-teal hover:bg-white/10'
        }`}
        title={isListening ? "Stop Listening" : "Voice Input"}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      <AnimatePresence>
         {isListening && (
           <motion.div 
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             exit={{ opacity: 0, y: 10 }}
             className="absolute bottom-full mb-4 right-0 bg-navy-light px-4 py-2 rounded-xl border border-orange shadow-2xl flex items-center gap-2 whitespace-nowrap z-50"
           >
              <Loader2 className="w-3 h-3 text-orange animate-spin" />
              <span className="text-[10px] font-black text-orange uppercase tracking-widest">Eggy is listening...</span>
           </motion.div>
         )}
      </AnimatePresence>
    </div>
  )
}

export default VoiceInput
