import { Resend } from 'resend'
import * as React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

import Day0Welcome from '../src/emails/templates/funnel/day0-welcome'

async function sendTest() {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.error('RESEND_API_KEY not found in environment')
    process.exit(1)
  }

  const resend = new Resend(apiKey)

  const html = renderToStaticMarkup(
    React.createElement(Day0Welcome, {
      name: 'Alejandro',
      source: 'tool_checklist-limpieza'
    })
  )

  console.log('Sending email...')

  const result = await resend.emails.send({
    from: 'Itineramio <hola@itineramio.com>',
    to: 'alejandrosatlla@gmail.com',
    subject: 'Bienvenido a Itineramio 👋',
    html: html
  })

  console.log('Result:', JSON.stringify(result, null, 2))
}

sendTest().catch(console.error)
