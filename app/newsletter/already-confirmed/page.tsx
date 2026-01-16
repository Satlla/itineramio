'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'

export default function AlreadyConfirmed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          Ya estabas suscrito
        </h1>
        <p className="text-gray-600 mb-6">
          Tu email ya está confirmado y recibes nuestras alertas de normativa.
        </p>
        <Link
          href="/blog"
          className="inline-block bg-violet-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-violet-700 transition-colors"
        >
          Volver al blog
        </Link>
      </div>
    </div>
  )
}
