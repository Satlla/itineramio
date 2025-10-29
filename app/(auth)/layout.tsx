'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="absolute top-0 w-full z-10 p-6">
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.div 
            className="w-8 h-8 bg-gradient-brand rounded-lg flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <span className="text-white font-bold text-sm">I</span>
          </motion.div>
        </Link>
      </nav>

      {/* Main Content */}
      <div className="flex min-h-screen">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Right Side - Visual */}
        <div className="hidden lg:flex lg:flex-1 items-center justify-center p-12 relative overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            {/* Background Elements */}
            <div className="absolute inset-0 bg-gradient-brand rounded-3xl transform rotate-3 opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-accent-400 to-brand-600 rounded-3xl transform -rotate-3 opacity-30"></div>
            
            {/* Content Card */}
            <div className="relative bg-white rounded-3xl p-8 shadow-2xl max-w-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-2">
                    Create Beautiful Manuals
                  </h2>
                  <p className="text-neutral-600">
                    Join thousands of hosts creating amazing guest experiences
                  </p>
                </div>

                {/* Mock Property Card */}
                <div className="bg-neutral-50 rounded-2xl p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center">
                      <span className="text-brand-600 font-semibold">AK</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-800">Apartment Kitchen</h3>
                      <p className="text-sm text-neutral-500">5 zones • 12 guides</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {['Coffee Machine', 'Dishwasher', 'Microwave', 'Induction'].map((item, i) => (
                      <div key={item} className="bg-white rounded-lg p-3 text-center">
                        <div className="w-8 h-8 bg-brand-500 rounded-lg mx-auto mb-2 flex items-center justify-center">
                          <div className="w-3 h-3 bg-white rounded"></div>
                        </div>
                        <p className="text-xs font-medium text-neutral-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-brand-600">98%</div>
                    <div className="text-xs text-neutral-500">Guest Satisfaction</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">30s</div>
                    <div className="text-xs text-neutral-500">Avg. Setup Time</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-brand-600">24/7</div>
                    <div className="text-xs text-neutral-500">Available</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <motion.div
              animate={{ 
                y: [-10, 10, -10],
                rotate: [0, 5, 0],
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-6 -right-6 w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center"
            >
              <div className="w-8 h-8 bg-success-500 rounded-full"></div>
            </motion.div>

            <motion.div
              animate={{ 
                y: [10, -10, 10],
                rotate: [0, -5, 0],
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-6 -left-6 w-20 h-20 bg-accent-500 rounded-2xl shadow-lg opacity-80"
            ></motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}