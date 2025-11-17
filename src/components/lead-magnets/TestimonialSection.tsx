import { Quote } from 'lucide-react'

interface Testimonial {
  quote: string
  author: string
  role: string
  property: string
}

export default function TestimonialSection({
  testimonial,
}: {
  testimonial: Testimonial
}) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white shadow-xl">
      <div className="max-w-4xl mx-auto">
        {/* Quote Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <Quote className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Testimonial Text */}
        <blockquote className="text-center">
          <p className="text-xl md:text-2xl font-light leading-relaxed mb-6 text-white/95">
            "{testimonial.quote}"
          </p>

          {/* Author Info */}
          <footer className="border-t border-white/20 pt-6">
            <div className="text-center">
              <div className="font-bold text-lg">{testimonial.author}</div>
              <div className="text-white/80 text-sm mt-1">
                {testimonial.role}
              </div>
              <div className="text-white/60 text-sm mt-1">
                {testimonial.property}
              </div>
            </div>
          </footer>
        </blockquote>
      </div>
    </div>
  )
}
