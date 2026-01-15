import { Resend } from 'resend'
import ToolReviewsDay0Delivery from './src/emails/templates/tools/tool-reviews-day0-delivery'

const resend = new Resend(process.env.RESEND_API_KEY)

async function sendEmail() {
  try {
    const result = await resend.emails.send({
      from: 'Itineramio <hola@itineramio.com>',
      to: 'alejandrosatlla@gmail.com',
      subject: 'Tu Guía Rápida de Reseñas está lista 🌟',
      react: ToolReviewsDay0Delivery({
        name: 'Alex',
        email: 'alejandrosatlla@gmail.com'
      })
    })
    console.log('Email enviado:', result)
  } catch (error) {
    console.error('Error:', error)
  }
}

sendEmail()
