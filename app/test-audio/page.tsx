'use client'

import { TextToSpeech } from '../../src/components/ui/TextToSpeech'

export default function TestAudioPage() {
  const textoEjemplo = `
    Bienvenido a tu apartamento.
    La contraseña del WiFi es Casa2024.
    El router está en el salón, detrás del sofá.
    Si tienes algún problema, contacta con el anfitrión.
  `

  const textoIngles = `
    Welcome to your apartment.
    The WiFi password is Casa2024.
    The router is in the living room, behind the sofa.
    If you have any problems, contact your host.
  `

  const textoFrances = `
    Bienvenue dans votre appartement.
    Le mot de passe WiFi est Casa2024.
    Le routeur est dans le salon, derrière le canapé.
    Si vous avez des problèmes, contactez votre hôte.
  `

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-gray-900">
          🔊 Test Audio - Text to Speech
        </h1>

        <p className="text-gray-600">
          Prueba el reproductor de audio. Pulsa Play para escuchar el texto.
        </p>

        {/* Español */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">🇪🇸 Español</h2>
          <p className="text-gray-700 whitespace-pre-line">{textoEjemplo}</p>
          <TextToSpeech text={textoEjemplo} language="es" />
        </div>

        {/* English */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">🇬🇧 English</h2>
          <p className="text-gray-700 whitespace-pre-line">{textoIngles}</p>
          <TextToSpeech text={textoIngles} language="en" />
        </div>

        {/* Français */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">🇫🇷 Français</h2>
          <p className="text-gray-700 whitespace-pre-line">{textoFrances}</p>
          <TextToSpeech text={textoFrances} language="fr" />
        </div>

        {/* Debug info */}
        <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <p><strong>Navegador:</strong> {typeof window !== 'undefined' ? navigator.userAgent.split(' ').slice(-2).join(' ') : 'SSR'}</p>
          <p><strong>Speech API:</strong> {typeof window !== 'undefined' && window.speechSynthesis ? '✅ Soportado' : '❌ No soportado'}</p>
        </div>
      </div>
    </div>
  )
}
