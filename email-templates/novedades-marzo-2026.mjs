import { put } from '@vercel/blob'
import { Resend } from 'resend'
import fs from 'fs'

const BLOB_TOKEN = 'vercel_blob_rw_6o7vW2QJFuydkNzs_s7zfWs4V2KG7RRUdjvxAS9r3khVx6O'
const resend = new Resend('re_EuT63Wc2_Np1z28sdw1EB8QqK9yy86y76')

async function uploadImage(filePath, name) {
  const file = fs.readFileSync(filePath)
  const blob = await put(`email-assets/${name}`, file, {
    access: 'public',
    token: BLOB_TOKEN,
    addRandomSuffix: false,
    allowOverwrite: true,
  })
  return blob.url
}

console.log('Subiendo capturas...')
const [urlDashboard, urlManual, urlWizard, urlChatbot, urlInteligencia, urlCrearIA, urlPlaces, urlAnadirLugar, urlChatbotGuest] = await Promise.all([
  uploadImage('/Users/alejandrosatlla/Documents/itineramio/public/landing-mockup-1.png', 'ui-dashboard.png'),
  uploadImage('/Users/alejandrosatlla/Documents/itineramio/public/landing-mockup-2.png', 'ui-manual.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 8.48.06.png', 'ui-wizard-airbnb.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 8.51.43.png', 'ui-chatbot.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 0.04.16.png', 'ui-inteligencia.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 9.45.11.png', 'ui-crear-ia.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 9.50.04.png', 'ui-places.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 9.54.54.png', 'ui-anadir-lugar.png'),
  uploadImage('/Users/alejandrosatlla/Desktop/Captura de pantalla 2026-03-26 a las 10.05.17.png', 'ui-chatbot-guest.png'),
])
console.log('✓ Todas subidas')

const html = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>Novedades Itineramio</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Helvetica,Arial,sans-serif;color:#1d1d1f;">

<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f5f5f7;">
<tr><td align="center" style="padding:48px 20px 80px;">
<table width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;">

  <!-- HEADER -->
  <tr><td align="center" style="padding-bottom:44px;">
    <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;"><tr>
      <td valign="middle" style="padding-right:9px;">
        <svg width="24" height="24" viewBox="0 0 42 41" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 8V5C2 3.34315 3.34315 2 5 2H9" stroke="#1d1d1f" stroke-width="3"/>
          <path d="M33.4336 2H36C37.6569 2 39 3.34315 39 5V8.16667M2 33.807V36C2 37.6569 3.34315 39 5 39H8.87611" stroke="#1d1d1f" stroke-width="3"/>
          <path d="M40 34V36C40 37.6569 38.6569 39 37 39H33" stroke="#1d1d1f" stroke-width="3"/>
          <path fill-rule="evenodd" clip-rule="evenodd" d="M7.59408 22.8502C8.12901 23.5437 10.9814 27.2414 17.4965 27.2943V30.8126C17.4965 32.1469 17.8273 33.8071 19.1616 33.8071C20.4732 33.8071 20.8268 32.1316 20.8268 30.82V27.2943C24.9777 27.1022 33.3808 24.7007 33.7863 16.6318C34.1917 8.56282 28.5253 6.54558 25.2432 6.54558C24.3835 6.52733 22.887 6.65611 21.4128 7.21625C17.9043 8.54936 17.4965 12.953 17.4965 16.7062V24.5854C16.0967 24.5086 12.9208 24.0091 11.4149 22.6258C11.3433 22.6258 11.0533 22.6369 10.6524 22.6521C9.75609 22.6861 8.3058 22.7411 7.50537 22.7411C7.51721 22.7505 7.54646 22.7885 7.59408 22.8502ZM20.8992 24.5274C24.2296 24.2585 30.6442 22.0938 30.2387 15.1315C29.9974 13.1911 28.6894 9.18351 24.8088 9.36794C21.7286 9.36794 21.0265 13.1302 20.9921 16.2102L20.8992 24.5274Z" fill="#1d1d1f"/>
          <rect x="7.42334" y="18.5146" width="2.63837" height="2.39625" fill="#1d1d1f"/>
          <rect x="10.9412" y="14.521" width="2.63837" height="2.39625" fill="#1d1d1f"/>
          <rect x="6.54395" y="10.5269" width="2.63837" height="2.39625" fill="#1d1d1f"/>
        </svg>
      </td>
      <td valign="middle" style="font-size:15px;font-weight:600;letter-spacing:-0.3px;color:#1d1d1f;">Itineramio</td>
    </tr></table>
    <p style="margin:0 0 12px;font-size:12px;font-weight:500;letter-spacing:0.1em;text-transform:uppercase;color:#8e8e93;">Marzo 2026</p>
    <h1 style="margin:0 0 16px;font-size:36px;font-weight:700;line-height:1.1;letter-spacing:-1px;color:#1d1d1f;">4 novedades que te van a<br/>ahorrar decenas de mensajes<br/>de hu&eacute;spedes.</h1>
    <p style="margin:0;font-size:16px;line-height:1.65;color:#515154;max-width:440px;margin-left:auto;margin-right:auto;">Esta quincena hemos publicado cuatro mejoras. Un chatbot que responde con v&iacute;deo, creaci&oacute;n del manual con IA, recomendaciones locales de tu ciudad y un asistente dentro del panel. Ya est&aacute;n en tu cuenta.</p>
  </td></tr>

  <tr><td style="padding-bottom:32px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background:#e5e5ea;"></td></tr></table></td></tr>

  <!-- ═══ 1: MANUAL DIGITAL ═══ -->
  <tr><td style="padding-bottom:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#8e8e93;">01 &mdash; Crea tu manual con IA</p>
        <h2 style="margin:0 0 14px;font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#1d1d1f;line-height:1.3;">Deja que la IA monte<br/>el manual por ti.</h2>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#515154;">
          Ahora solo <strong style="color:#1d1d1f;">pega el enlace de tu anuncio de Airbnb</strong> y la app importa autom&aacute;ticamente nombre, fotos y descripci&oacute;n. Despu&eacute;s s&uacute;be tus v&iacute;deos, d&iacute;le en una frase de qu&eacute; va cada uno y listo: <strong style="color:#1d1d1f;">manual completo y traducido a tres idiomas</strong>.<br/><br/>
          Lo encontrar&aacute;s en la p&aacute;gina de propiedades con el bot&oacute;n&nbsp;<strong style="color:#1d1d1f;">Crear con IA</strong>.
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 16px;" align="center">
        <img src="${urlCrearIA}" alt="Botón Crear con IA" width="200" style="display:block;width:200px;border-radius:8px;margin:0 auto;"/>
      </td></tr>
      <tr><td style="padding:0 32px 24px;">
        <img src="${urlWizard}" alt="Apartamento importado desde Airbnb" width="100%" style="display:block;width:100%;border-radius:10px;border:1px solid #e5e5ea;"/>
      </td></tr>
      <tr><td style="padding:0 32px 28px;" align="center">
        <a href="https://www.itineramio.com/properties" style="display:inline-block;background:#1d1d1f;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;">Ir a mis propiedades</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ 2: CHATBOT ═══ -->
  <tr><td style="padding-bottom:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#2563eb;">02 &mdash; El chatbot que responde con v&iacute;deo (incluso a las 11 de la noche)</p>
        <h2 style="margin:0 0 14px;font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#1d1d1f;line-height:1.3;">El hu&eacute;sped no lee&hellip;<br/>pero siempre tiene las mismas dudas.</h2>
        <p style="margin:0;font-size:15px;line-height:1.7;color:#515154;">Ahora el chatbot <strong style="color:#1d1d1f;">responde directamente con im&aacute;genes y v&iacute;deos</strong>. Si tiene una duda sobre c&oacute;mo funciona un electrodom&eacute;stico o c&oacute;mo entrar al apartamento, el v&iacute;deo aparece en el chat. Sin tener que buscar nada en el manual.</p>
      </td></tr>
      <tr><td style="padding:0 32px 28px;">
        <img src="${urlChatbot}" alt="Chatbot respondiendo al huésped" width="100%" style="display:block;width:100%;border-radius:10px;border:1px solid #e5e5ea;"/>
      </td></tr>

      <tr><td style="padding:0 32px 20px;">
        <p style="margin:0 0 20px;font-size:13px;font-weight:700;color:#1d1d1f;">C&oacute;mo activarlo en 2 minutos:</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <!-- Paso 1 + imagen -->
          <tr><td style="padding-bottom:12px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td width="30" valign="top" style="padding-right:12px;"><table cellpadding="0" cellspacing="0"><tr><td style="width:22px;height:22px;background:#e5e7eb;border-radius:11px;font-size:11px;font-weight:700;color:#374151;text-align:center;line-height:22px;" align="center">1</td></tr></table></td>
            <td style="font-size:14px;line-height:1.6;color:#515154;padding-top:2px;">Entra en la vista de hu&eacute;sped y <strong style="color:#1d1d1f;">prueba el chatbot</strong> t&uacute; mismo.</td>
          </tr></table></td></tr>
          <tr><td style="padding-bottom:20px;">
            <img src="${urlChatbotGuest}" alt="Vista huésped con chatbot" width="100%" style="display:block;width:100%;border-radius:10px;border:1px solid #e5e5ea;"/>
          </td></tr>
          <!-- Paso 2 + imagen -->
          <tr><td style="padding-bottom:12px;"><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td width="30" valign="top" style="padding-right:12px;"><table cellpadding="0" cellspacing="0"><tr><td style="width:22px;height:22px;background:#e5e7eb;border-radius:11px;font-size:11px;font-weight:700;color:#374151;text-align:center;line-height:22px;" align="center">2</td></tr></table></td>
            <td style="font-size:14px;line-height:1.6;color:#515154;padding-top:2px;">Ve a <strong style="color:#1d1d1f;">&ldquo;Inteligencia&rdquo;</strong> y responde las preguntas clave de tu apartamento. Cuanto m&aacute;s sepa, menos te interrumpir&aacute;.</td>
          </tr></table></td></tr>
          <tr><td style="padding-bottom:20px;">
            <img src="${urlInteligencia}" alt="Sección Inteligencia" width="100%" style="display:block;width:100%;border-radius:10px;border:1px solid #e5e5ea;"/>
          </td></tr>
          <!-- Paso 3 sin imagen -->
          <tr><td><table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td width="30" valign="top" style="padding-right:12px;"><table cellpadding="0" cellspacing="0"><tr><td style="width:22px;height:22px;background:#e5e7eb;border-radius:11px;font-size:11px;font-weight:700;color:#374151;text-align:center;line-height:22px;" align="center">3</td></tr></table></td>
            <td style="font-size:14px;line-height:1.6;color:#515154;padding-top:2px;">Cuando no sepa algo, <strong style="color:#1d1d1f;">te manda una notificaci&oacute;n</strong>. T&uacute; respondes una vez&hellip; &eacute;l aprende para siempre.</td>
          </tr></table></td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 28px;" align="center">
        <a href="https://www.itineramio.com/properties" style="display:inline-block;background:#1d1d1f;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;">Ver mis apartamentos</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ 3: ITINERAMIO PLACES ═══ -->
  <tr><td style="padding-bottom:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:32px 32px 24px;">
        <p style="margin:0 0 16px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#059669;">03 &mdash; Itineramio Places</p>
        <h2 style="margin:0 0 14px;font-size:22px;font-weight:700;letter-spacing:-0.3px;color:#1d1d1f;line-height:1.3;">Las mejores recomendaciones<br/>locales, en tu apartamento.</h2>
        <p style="margin:0 0 20px;font-size:15px;line-height:1.7;color:#515154;">
          Estamos creando gu&iacute;as de todas las ciudades. La m&aacute;s avanzada ahora mismo es la de Alicante. <strong style="color:#1d1d1f;">S&oacute;lo tienes que entrar en tu propiedad e importarla</strong> y te llegar&aacute;n autom&aacute;ticamente todos los lugares que merece la pena visitar: restaurantes, coffee shops, centros comerciales, museos, castillos, playas&hellip;<br/><br/>
          Y si tienes alguna recomendaci&oacute;n, cu&eacute;ntanosla para incluirla.
        </p>
      </td></tr>
      <tr><td style="padding:0 32px 16px;" align="center">
        <img src="${urlAnadirLugar}" alt="Añadir lugar" width="100%" style="display:block;width:100%;border-radius:10px;border:1px solid #e5e5ea;"/>
      </td></tr>
      <tr><td style="padding:0 32px 24px;">
        <img src="${urlPlaces}" alt="Lugares recomendados" width="100%" style="display:block;width:100%;border-radius:10px;border:1px solid #e5e5ea;"/>
      </td></tr>
      <tr><td style="padding:0 32px 20px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f0fdf4;border-radius:10px;padding:0;">
          <tr><td style="padding:20px 22px;">
            <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1d1d1f;">Adem&aacute;s: a&ntilde;ade tus propias recomendaciones privadas.</p>
            <p style="margin:0;font-size:13px;line-height:1.7;color:#515154;">Por ejemplo, si quieres que tus hu&eacute;spedes desayunen justo debajo porque hacen unos cupcakes espectaculares&hellip; simplemente a&ntilde;&aacute;delo. Solo tienes que ir a tu propiedad, pesta&ntilde;a <strong style="color:#1d1d1f;">&ldquo;A&ntilde;adir lugar&rdquo;</strong>, buscar el sitio y escribir tu recomendaci&oacute;n: qu&eacute; tomar, qu&eacute; visitar o lo que necesites contarle a tu hu&eacute;sped.</p>
          </td></tr>
        </table>
      </td></tr>
      <tr><td style="padding:0 32px 28px;" align="center">
        <a href="https://www.itineramio.com/properties" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 26px;border-radius:8px;">Explorar mis lugares</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- ═══ BONUS: ASISTENTE ═══ -->
  <tr><td style="padding-bottom:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:0.09em;text-transform:uppercase;color:#8e8e93;">Bonus &mdash; Tu asistente dentro del panel</p>
        <h2 style="margin:0 0 10px;font-size:18px;font-weight:700;letter-spacing:-0.2px;color:#1d1d1f;line-height:1.3;">¿Duda r&aacute;pida? Preg&uacute;ntale directamente.</h2>
        <p style="margin:0 0 16px;font-size:14px;line-height:1.7;color:#515154;">Conoce Itineramio y tus apartamentos. Te da instrucciones precisas. Por ejemplo:</p>
        <table width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr><td align="right" style="padding-bottom:8px;">
            <table cellpadding="0" cellspacing="0"><tr><td style="background:#f3f4f6;border-radius:12px 12px 4px 12px;padding:10px 14px;">
              <p style="margin:0;font-size:13px;color:#374151;line-height:1.5;">&ldquo;¿C&oacute;mo hago m&aacute;s inteligente el chatbot de Noruega 1A?&rdquo;</p>
            </td></tr></table>
          </td></tr>
          <tr><td align="left" style="padding-bottom:12px;">
            <table cellpadding="0" cellspacing="0"><tr><td style="background:#1d1d1f;border-radius:12px 12px 12px 4px;padding:10px 14px;">
              <p style="margin:0;font-size:13px;color:#e4e4e7;line-height:1.5;">&ldquo;Ve a Noruega 1A &rarr; Inteligencia y responde: ¿D&oacute;nde est&aacute; la plancha? ¿Hay secador? ¿C&oacute;mo funciona la caldera?&hellip;&rdquo;</p>
            </td></tr></table>
          </td></tr>
          <tr><td>
            <p style="margin:0;font-size:14px;color:#515154;">Pruébalo cuando quieras.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </td></tr>

  <!-- CIERRE -->
  <tr><td style="padding-bottom:16px;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#fff;border-radius:16px;overflow:hidden;">
      <tr><td style="padding:28px 32px;" align="center">
        <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#1d1d1f;">¿Cu&aacute;l vas a probar primero?</p>
        <p style="margin:0 0 20px;font-size:14px;color:#515154;line-height:1.6;">Cualquier duda, estamos aqu&iacute;.</p>
        <a href="https://www.itineramio.com/main" style="display:inline-block;background:#fff;color:#1d1d1f;text-decoration:none;font-size:14px;font-weight:600;padding:11px 26px;border-radius:8px;border:1.5px solid #d1d1d6;">Ir a mi panel</a>
      </td></tr>
    </table>
  </td></tr>

  <tr><td style="padding:24px 0 28px;"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="height:1px;background:#e5e5ea;"></td></tr></table></td></tr>

  <!-- FOOTER -->
  <tr><td align="center">
    <p style="margin:0 0 6px;font-size:13px;font-weight:500;color:#8e8e93;">Itineramio</p>
    <p style="margin:0;font-size:12px;color:#aeaeb2;line-height:1.8;">
      <a href="https://www.itineramio.com" style="color:#aeaeb2;text-decoration:none;">itineramio.com</a> &nbsp;&middot;&nbsp;
      <a href="mailto:hola@itineramio.com" style="color:#aeaeb2;text-decoration:none;">hola@itineramio.com</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`

const { data, error } = await resend.emails.send({
  from: 'Itineramio <hola@itineramio.com>',
  to: ['alejandrosatlla@gmail.com'],
  subject: '4 novedades que te van a ahorrar decenas de mensajes de huéspedes',
  html,
})

if (error) { console.error('Error:', error); process.exit(1) }
console.log('✓ Email enviado. ID:', data.id)
