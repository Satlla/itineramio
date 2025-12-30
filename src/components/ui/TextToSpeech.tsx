'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Volume2, VolumeX } from 'lucide-react'

interface TextToSpeechProps {
  text: string
  language?: 'es' | 'en' | 'fr'
  className?: string
  compact?: boolean // For inline use
}

// Language to voice mapping
const languageVoices: Record<string, string[]> = {
  es: ['es-ES', 'es-MX', 'es'],
  en: ['en-US', 'en-GB', 'en'],
  fr: ['fr-FR', 'fr-CA', 'fr']
}

const languageLabels: Record<string, string> = {
  es: 'Escuchar',
  en: 'Listen',
  fr: 'Écouter'
}

export function TextToSpeech({ text, language = 'es', className = '', compact = false }: TextToSpeechProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isSupported, setIsSupported] = useState(true)
  const [currentLang, setCurrentLang] = useState(language)
  const [volume, setVolume] = useState(1)
  const [rate, setRate] = useState(1)
  const [showControls, setShowControls] = useState(false)
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if (typeof window !== 'undefined' && !window.speechSynthesis) {
      setIsSupported(false)
    }
  }, [])

  useEffect(() => {
    setCurrentLang(language)
  }, [language])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const findBestVoice = (lang: string): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices()
    const langCodes = languageVoices[lang] || [lang]

    // Try to find a voice for each language code
    for (const code of langCodes) {
      const voice = voices.find(v => v.lang.startsWith(code))
      if (voice) return voice
    }

    // Fallback to any voice that matches the language
    const fallback = voices.find(v => v.lang.toLowerCase().startsWith(lang))
    return fallback || null
  }

  const speak = () => {
    if (!window.speechSynthesis || !text) return

    // Cancel any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utteranceRef.current = utterance

    // Set voice based on language
    const voice = findBestVoice(currentLang)
    if (voice) {
      utterance.voice = voice
    }

    utterance.lang = languageVoices[currentLang]?.[0] || currentLang
    utterance.volume = volume
    utterance.rate = rate
    utterance.pitch = 1

    utterance.onstart = () => {
      setIsPlaying(true)
      setIsPaused(false)
    }

    utterance.onend = () => {
      setIsPlaying(false)
      setIsPaused(false)
    }

    utterance.onerror = (event) => {
      console.error('Speech error:', event)
      setIsPlaying(false)
      setIsPaused(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const pause = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }

  const resume = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
      setIsPlaying(false)
      setIsPaused(false)
    }
  }

  const togglePlayPause = () => {
    if (!isPlaying) {
      speak()
    } else if (isPaused) {
      resume()
    } else {
      pause()
    }
  }

  if (!isSupported) {
    return null // Don't show anything if not supported
  }

  // Compact version - just a button
  if (compact) {
    return (
      <button
        onClick={togglePlayPause}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full transition-all ${
          isPlaying
            ? 'bg-violet-600 text-white hover:bg-violet-700'
            : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
        } ${className}`}
        title={isPlaying ? (isPaused ? 'Reanudar' : 'Pausar') : languageLabels[currentLang]}
      >
        {isPlaying && !isPaused ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4" />
        )}
        <span className="hidden sm:inline">
          {isPlaying ? (isPaused ? 'Reanudar' : 'Pausar') : languageLabels[currentLang]}
        </span>
      </button>
    )
  }

  // Full version with controls
  return (
    <div className={`bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 ${className}`}>
      {/* Main controls row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={togglePlayPause}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-md ${
            isPlaying
              ? 'bg-violet-600 text-white hover:bg-violet-700'
              : 'bg-white text-violet-600 hover:bg-violet-50 border border-violet-200'
          }`}
        >
          {isPlaying && !isPaused ? (
            <Pause className="w-5 h-5" />
          ) : (
            <Play className="w-5 h-5 ml-0.5" />
          )}
        </button>

        {/* Stop button */}
        {isPlaying && (
          <button
            onClick={stop}
            className="w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-all"
          >
            <Square className="w-4 h-4" />
          </button>
        )}

        {/* Status text */}
        <div className="flex-1">
          <p className="text-sm font-medium text-violet-900">
            {isPlaying
              ? (isPaused ? 'En pausa' : 'Reproduciendo...')
              : '🔊 Escuchar instrucciones'
            }
          </p>
          <p className="text-xs text-violet-600">
            Voz del sistema en {currentLang === 'es' ? 'español' : currentLang === 'en' ? 'inglés' : 'francés'}
          </p>
        </div>

        {/* Language selector */}
        <div className="flex gap-1">
          {(['es', 'en', 'fr'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setCurrentLang(lang)
                if (isPlaying) {
                  stop()
                  setTimeout(() => speak(), 100)
                }
              }}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                currentLang === lang
                  ? 'bg-violet-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-violet-100 border border-gray-200'
              }`}
            >
              {lang === 'es' ? '🇪🇸' : lang === 'en' ? '🇬🇧' : '🇫🇷'}
            </button>
          ))}
        </div>

        {/* Settings toggle */}
        <button
          onClick={() => setShowControls(!showControls)}
          className="w-10 h-10 rounded-full bg-white text-gray-600 hover:bg-gray-100 border border-gray-200 flex items-center justify-center transition-all"
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* Advanced controls */}
      {showControls && (
        <div className="mt-4 pt-4 border-t border-violet-200 space-y-3">
          {/* Volume */}
          <div className="flex items-center gap-3">
            <VolumeX className="w-4 h-4 text-gray-400" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
            <Volume2 className="w-4 h-4 text-violet-600" />
            <span className="text-xs text-gray-600 w-12">{Math.round(volume * 100)}%</span>
          </div>

          {/* Speed */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-400">🐢</span>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
            />
            <span className="text-xs text-gray-400">🐇</span>
            <span className="text-xs text-gray-600 w-12">{rate}x</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple inline button version
export function TextToSpeechButton({ text, language = 'es' }: { text: string; language?: 'es' | 'en' | 'fr' }) {
  return <TextToSpeech text={text} language={language} compact />
}
