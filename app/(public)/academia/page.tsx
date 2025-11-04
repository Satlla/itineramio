'use client';

import { motion } from 'framer-motion';
import {
  GraduationCap,
  Trophy,
  Clock,
  Star,
  Rocket,
  Mail,
  Sparkles
} from 'lucide-react';
import { useState } from 'react';

const features = [
  {
    icon: GraduationCap,
    title: 'Cursos Completos',
    description: 'Contenido estructurado desde principiante hasta experto'
  },
  {
    icon: Trophy,
    title: 'Certificados',
    description: 'Obtén certificaciones reconocidas al completar los cursos'
  },
  {
    icon: Clock,
    title: 'A tu Ritmo',
    description: 'Aprende cuando quieras, donde quieras'
  },
  {
    icon: Star,
    title: 'Contenido Premium',
    description: 'Estrategias y técnicas de hosts profesionales'
  }
];

export default function AcademiaComingSoon() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'academia-coming-soon',
          tags: ['academia-interest']
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setMessage('¡Perfecto! Te avisaremos cuando lancemos la Academia');
        setEmail('');
      } else {
        setMessage(data.error || 'Hubo un error. Intenta de nuevo.');
      }
    } catch (error) {
      setMessage('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 flex items-center justify-center p-4 py-20">
      <div className="max-w-5xl w-full">
        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 overflow-hidden"
        >
          {/* Gradient Header */}
          <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 px-8 py-16 text-center overflow-hidden">
            <div className="absolute inset-0 bg-grid-white/5" />
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-6">
                <Sparkles className="w-4 h-4 text-white" />
                <span className="text-sm font-medium text-white">Próximamente</span>
              </div>

              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                Academia Itineramio
              </h1>
              <p className="text-xl md:text-2xl text-violet-100 max-w-2xl mx-auto">
                La plataforma de formación más completa para hosts profesionales
              </p>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              animate={{
                y: [0, -20, 0],
                rotate: [0, 5, 0]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute top-10 right-10 opacity-20"
            >
              <GraduationCap className="w-32 h-32 text-white" />
            </motion.div>
            <motion.div
              animate={{
                y: [0, 20, 0],
                rotate: [0, -5, 0]
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute bottom-10 left-10 opacity-20"
            >
              <Trophy className="w-24 h-24 text-white" />
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            {/* Features Grid */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="inline-flex p-4 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl mb-3 shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Email Form */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="max-w-2xl mx-auto"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Sé el primero en saberlo
                </h2>
                <p className="text-lg text-slate-600">
                  Déjanos tu email y te avisaremos cuando lancemos la Academia
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      disabled={loading || success}
                      className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all text-slate-900 placeholder-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Enviando...
                      </>
                    ) : success ? (
                      <>
                        <Sparkles className="w-5 h-5" />
                        ¡Listo!
                      </>
                    ) : (
                      <>
                        <Mail className="w-5 h-5" />
                        Notificarme
                      </>
                    )}
                  </button>
                </div>

                {message && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl ${
                      success
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-red-50 border border-red-200 text-red-800'
                    }`}
                  >
                    {message}
                  </motion.div>
                )}
              </form>

              <p className="text-sm text-slate-500 text-center mt-6">
                No spam. Solo te contactaremos cuando la Academia esté lista.
              </p>
            </motion.div>

            {/* Bottom CTA */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center mt-12 pt-8 border-t border-slate-200"
            >
              <div className="inline-flex items-center gap-2 text-violet-600">
                <Rocket className="w-5 h-5" />
                <span className="font-medium">
                  Estamos trabajando para traerte la mejor experiencia de aprendizaje
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
