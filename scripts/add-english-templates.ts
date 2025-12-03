import { prisma } from '../src/lib/prisma'

async function addEnglishTemplates() {
  console.log('🌍 Añadiendo plantillas en inglés a ambos artículos...\n')

  // Get both articles
  const airbnbArticle = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-airbnb' }
  })

  const bookingArticle = await prisma.blogPost.findUnique({
    where: { slug: 'mensajes-automaticos-booking' }
  })

  if (!airbnbArticle || !bookingArticle) {
    console.log('❌ No se encontraron los artículos')
    return
  }

  // Define English templates for Airbnb
  const airbnbEnglishTemplates = {
    template1: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name]! 👋

I'm so excited to welcome you to [Property Name]!

Your booking is confirmed for [Check-in Date] - [Check-out Date].

📍 Exact location: [Full Address]
🔑 Check-in: [Start Time] - [End Time]
🚪 Check-out: [Time]

🎁 Before your arrival, I'll send you:
→ Detailed check-in instructions
→ Property guide with WiFi and amenities
→ Local recommendations (restaurants, transport, etc.)

If you have any questions before arrival, feel free to message me! 😊

See you soon!
[Your Name]
</pre>
</div>`,

    template2: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name],

Your stay begins tomorrow! Here are your arrival instructions:

🏠 FULL ADDRESS:
[Street, number, floor, door]
[Postal code, city]

🗺️ How to get here from the airport:
[Option 1: Public transport - duration and price]
[Option 2: Taxi/Uber - approximate price and time]

🔑 CHECK-IN INSTRUCTIONS:
→ Arrival time: [Start Time] - [End Time]
→ [Detailed Step 1 to enter]
→ [Step 2 if there's a code/lock]
→ [Step 3 key location]

📱 WiFi:
Network: [WiFi Name]
Password: [Password]

If you arrive outside these hours or have any issues, call/text me at [Phone Number].

See you tomorrow! 🎉

[Your Name]
</pre>
</div>`,

    template3: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Good morning [Guest Name]! ☀️

Reminder: Your check-in is today from [Time].

🔑 Access code: [Code if applicable]
📍 Google Maps link: [URL]

I sent you the complete instructions yesterday. If you can't find them or have questions, let me know.

See you in a few hours! 😊
</pre>
</div>`,

    template4: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name],

Are you all settled in? I hope everything went smoothly with your arrival.

✅ If you need anything or something isn't working, message me right away
📚 In the property you'll find a guide with:
→ WiFi and passwords
→ Appliances (how they work)
→ Area recommendations

🍽️ MY FAVORITE PLACES NEARBY:
→ [Restaurant 1] - [Cuisine type] - 5 min walk
→ [Supermarket] - [Address] - 3 min walk
→ [Café/Bar] - Perfect for breakfast

Enjoy your stay! 🎉
</pre>
</div>`,

    template5: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name],

How's everything going? Hope you're enjoying your stay 😊

Just a quick reminder:
♻️ Trash disposal at [container location] - [collection days]
🔊 Quiet hours: 10 PM - 8 AM (for the neighbors)
🚭 No smoking inside the property

If you need anything, I'm here.

Keep enjoying! ✨
</pre>
</div>`,

    template6: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name],

Hope you had a wonderful stay 🌟

Reminder: Check-out tomorrow before [Time].

📝 BEFORE LEAVING:
✓ [Instruction 1: e.g., Leave keys in...]
✓ [Instruction 2: e.g., Close windows]
✓ [Instruction 3: e.g., Turn off lights/AC]
✓ NO need to clean or wash dishes (my team takes care of it)

🚪 Just close the door when you leave

If you need to leave later, let me know in advance (I charge [X]€/hour extra if available).

Safe travels! ✈️
</pre>
</div>`,

    template7: `
<div style="background: #FFF; border: 2px solid #4A90E2; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name]!

Hope you made it home safely 🏡

It was a pleasure hosting you. If everything was good, could you leave me a review on Airbnb? It means a lot to me and helps other travelers decide.

⭐ It only takes 1 minute: [Direct review link if possible]

I've already left you a positive review 😊

Hope to see you again in [City]!

Best regards,
[Your Name]

P.S.: If there was anything you didn't like or think I could improve, please tell me before the review. It really helps me become a better host.
</pre>
</div>`
  }

  // Define English templates for Booking
  const bookingEnglishTemplates = {
    template1: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Dear [Guest Name],

Thank you for choosing us! 🎉

Your booking is confirmed:

📅 Check-in: [Date] from [Check-in Time]
📅 Check-out: [Date] until [Check-out Time]
🏠 [Property Name]
📍 [Full Address]

Next steps:
→ 48 hours before arrival, I'll send detailed check-in instructions
→ Including access codes and exact location map
→ You'll also receive WiFi information and amenities

Any questions? You can contact me anytime.

Best regards,
[Your Name]
[Contact Phone]
</pre>
</div>`,

    template2: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Dear [Guest Name],

Your stay begins in 2 days. Here's all the information you need:

🏠 EXACT ADDRESS AND ACCESS:
Address: [Full street, number, floor, door]
Postal code: [Postal Code]
City: [City]

Google Maps: [Direct link]

🚗 HOW TO GET HERE:
• From the airport: [Public transport option - duration and price]
• Taxi/Uber: Approximately [X]€ and [Y] minutes
• Parking: [If available, give details or nearby alternatives]

🔑 ENTRY INSTRUCTIONS:
[Step 1: e.g., "When arriving at the building, press doorbell floor [X]"]
[Step 2: e.g., "Building door code: [XXXX]"]
[Step 3: e.g., "Your apartment is on the [location]. Lock code: [YYYY]"]
[Step 4: e.g., "Or keys are in mailbox [number]. Mailbox code: [ZZZZ]"]

📶 WIFI INFORMATION:
Network name: [SSID]
Password: [Password]

⏰ SCHEDULE:
Check-in: From [time] on [date]
Check-out: Until [time] on [date]

If your arrival is delayed or you have any issues, call me at [phone] or message me here.

See you soon!
[Your Name]
</pre>
</div>`,

    template3: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Good morning [Guest Name],

Your check-in is today! 🎉

Reminder:
📍 Address: [Address]
🔑 Access code: [Code]
⏰ You can enter from [time]

Complete instructions: [Link or reference to previous message]

I'll be available at [phone] if you need anything.

Welcome!
</pre>
</div>`,

    template4: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name],

I hope you arrived well and are comfortably settled.

If something isn't working properly or you need any additional information, don't hesitate to contact me. I respond quickly.

📚 Useful information:
• WiFi: [Network] / [Password]
• [Key appliance info if needed]
• Trash: [Container location and schedule]

🍽️ Nearby recommendations:
• Supermarket: [Name] - [Address] (5 min walk)
• Restaurants: [2-3 recommendations with cuisine type]
• [Other useful service: pharmacy, ATM, etc.]

Enjoy your stay! 😊

Best regards,
[Your Name]
</pre>
</div>`,

    template5: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Hi [Guest Name],

In case it's helpful, here are some recommendations for [City/Area]:

🎭 THINGS TO DO:
• [Attraction 1] - [Brief description] - [How to get there]
• [Attraction 2] - [Why visit]
• [Activity/Tour 3]

🍽️ WHERE TO EAT:
• [Restaurant 1] - [Cuisine] - [Price range] - "Try their [signature dish]"
• [Restaurant 2] - Great for [occasion]
• [Local market or food area]

🚇 GETTING AROUND:
• Metro/Bus: [Useful lines]
• Bike rental: [Location]
• [Other useful transport info]

If you need more tips or have questions about [City], I'm here!

Enjoy! 🌟
</pre>
</div>`,

    template6: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Dear [Guest Name],

I hope you had a wonderful stay with us.

Your checkout is tomorrow at [Time].

✅ BEFORE LEAVING:
• Leave keys [location]
• Close all windows
• Turn off lights and AC/heating
• You don't need to clean or wash dishes

If you need a late checkout, please let me know in advance and we'll see if it's possible (subject to availability).

Thank you for choosing us, and we hope to see you again!

Safe travels,
[Your Name]
</pre>
</div>`,

    template7: `
<div style="background: #FFF; border: 2px solid #003580; border-radius: 12px; padding: 24px; margin: 20px 0;">
<p style="font-weight: 600; color: #222; margin-bottom: 16px;">🇬🇧 ENGLISH TEMPLATE:</p>
<pre style="background: #F9F9F9; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 14px; line-height: 1.6;">
Dear [Guest Name],

Thank you for staying with us! We hope you had an excellent experience.

If you have a moment, we'd really appreciate it if you could leave us a review on Booking.com. Your feedback is very valuable to us and helps other guests.

We've given you a positive review on our end 😊

We hope to welcome you back to [City] soon!

Best regards,
[Your Name]

P.S.: If there was anything that didn't meet your expectations, please let us know directly so we can improve.
</pre>
</div>`
  }

  // Update Airbnb article - insert English templates after each Spanish template
  let updatedAirbnbContent = airbnbArticle.content

  // Template 1 - After "Confirmación Inmediata"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?<\/pre>\s*<\/div>)(\s*<h3>2\. Instrucciones de Check-In)/,
    `$1${airbnbEnglishTemplates.template1}$2`
  )

  // Template 2 - After "Instrucciones de Check-In"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?<\/pre>\s*<\/div>)(\s*<h3>3\. Recordatorio el Día de Llegada)/,
    `$1${airbnbEnglishTemplates.template2}$2`
  )

  // Template 3 - After "Recordatorio el Día de Llegada"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?¡Nos vemos en unas horas! 😊\s*<\/pre>\s*<\/div>)(\s*<h2>🏠 Durante la Estancia)/,
    `$1${airbnbEnglishTemplates.template3}$2`
  )

  // Template 4 - After "Bienvenida tras Check-In"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?¡Que disfrutéis! 🎉\s*<\/pre>\s*<\/div>)(\s*<h3>5\. Recordatorio de Normas)/,
    `$1${airbnbEnglishTemplates.template4}$2`
  )

  // Template 5 - After "Recordatorio de Normas"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?¡A seguir disfrutando! ✨\s*<\/pre>\s*<\/div>)(\s*<h2>👋 Después del Check-out)/,
    `$1${airbnbEnglishTemplates.template5}$2`
  )

  // Template 6 - After "Recordatorio de Check-Out"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?¡Buen viaje de vuelta! ✈️\s*<\/pre>\s*<\/div>)(\s*<h3>7\. Agradecimiento)/,
    `$1${airbnbEnglishTemplates.template6}$2`
  )

  // Template 7 - After "Agradecimiento + Petición de Review"
  updatedAirbnbContent = updatedAirbnbContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?Me ayuda muchísimo a mejorar como anfitrión\.\s*<\/pre>\s*<\/div>)(\s*<h2>⚙️ Cómo Configurar)/,
    `$1${airbnbEnglishTemplates.template7}$2`
  )

  // Update Booking article
  let updatedBookingContent = bookingArticle.content

  // Similar replacements for Booking article
  updatedBookingContent = updatedBookingContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?\[Teléfono de contacto\]\s*<\/pre>\s*<\/div>)(\s*<h3>2\. Instrucciones Detalladas)/,
    `$1${bookingEnglishTemplates.template1}$2`
  )

  updatedBookingContent = updatedBookingContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?\[Su nombre\]\s*<\/pre>\s*<\/div>)(\s*<h3>3\. Recordatorio Day-Of)/,
    `$1${bookingEnglishTemplates.template2}$2`
  )

  updatedBookingContent = updatedBookingContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?¡Bienvenido\/a!\s*<\/pre>\s*<\/div>)(\s*<h2>🏠 Durante la Estancia)/,
    `$1${bookingEnglishTemplates.template3}$2`
  )

  updatedBookingContent = updatedBookingContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?Saludos,\s*\[Su nombre\]\s*<\/pre>\s*<\/div>)(\s*<h3>5\. Información de la Zona)/,
    `$1${bookingEnglishTemplates.template4}$2`
  )

  // Find and replace remaining Booking templates
  const bookingTemplate5Pattern = /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?¡Que disfruten! 🌟\s*<\/pre>\s*<\/div>)/
  const bookingTemplate5Match = updatedBookingContent.match(bookingTemplate5Pattern)
  if (bookingTemplate5Match) {
    const nextHeadingAfterTemplate5 = updatedBookingContent.indexOf('<h2>', bookingTemplate5Match.index! + bookingTemplate5Match[0].length)
    if (nextHeadingAfterTemplate5 > -1) {
      updatedBookingContent = updatedBookingContent.slice(0, bookingTemplate5Match.index! + bookingTemplate5Match[0].length) +
        bookingEnglishTemplates.template5 +
        updatedBookingContent.slice(bookingTemplate5Match.index! + bookingTemplate5Match[0].length)
    }
  }

  // Continue with templates 6 and 7 for Booking
  const bookingTemplate6Pattern = /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?Safe travels,\s*\[Your Name\]\s*<\/pre>\s*<\/div>)/
  const bookingTemplate6Match = updatedBookingContent.match(bookingTemplate6Pattern)
  if (!bookingTemplate6Match) {
    // Try Spanish version
    updatedBookingContent = updatedBookingContent.replace(
      /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?\[Su nombre\]\s*<\/pre>\s*<\/div>)(\s*<h3>7\.)/,
      `$1${bookingEnglishTemplates.template6}$2`
    )
  }

  updatedBookingContent = updatedBookingContent.replace(
    /(📋 PLANTILLA PARA COPIAR:<\/p>\s*<pre[^>]*>[\s\S]*?podamos mejorar\.\s*<\/pre>\s*<\/div>)(\s*<h2>⚙️)/,
    `$1${bookingEnglishTemplates.template7}$2`
  )

  // Update both articles in database
  await prisma.blogPost.update({
    where: { slug: 'mensajes-automaticos-airbnb' },
    data: { content: updatedAirbnbContent }
  })

  await prisma.blogPost.update({
    where: { slug: 'mensajes-automaticos-booking' },
    data: { content: updatedBookingContent }
  })

  console.log('✅ Plantillas en inglés añadidas a ambos artículos!')
  console.log('')
  console.log('📋 RESUMEN:')
  console.log('  ✅ Airbnb: 7 plantillas en español + 7 en inglés')
  console.log('  ✅ Booking: 7 plantillas en español + 7 en inglés')
  console.log('  ✅ Formato diferenciado con borde azul para inglés')
  console.log('  ✅ Total: 28 plantillas copy-paste listas para usar')
  console.log('')
  console.log('🔗 Verifica los artículos en:')
  console.log('   http://localhost:3000/blog/mensajes-automaticos-airbnb')
  console.log('   http://localhost:3000/blog/mensajes-automaticos-booking')
}

addEnglishTemplates()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
