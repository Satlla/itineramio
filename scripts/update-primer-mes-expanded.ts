import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const newContent = `<p style="font-size: 1.125rem; color: #4b5563; line-height: 1.75;">Los primeros 30 días marcan la diferencia entre un anfitrión promedio y un Superhost. Esta guía te muestra exactamente qué hacer cada día para conseguir reviews de 5★ y establecer bases sólidas.</p>

<h2 style="color: #1f2937; margin-top: 3rem; margin-bottom: 1.5rem; font-size: 1.875rem; font-weight: 700;">Semana 1: Setup Perfecto</h2>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0; color: white;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📸 Días 1-2: Fotos Profesionales</h3>
  <p style="font-size: 1.125rem; line-height: 1.75; margin: 1rem 0;">Las fotos son tu escaparate digital. Propiedades con fotos profesionales reciben hasta <strong>3x más reservas</strong>.</p>

  <p style="font-size: 1.05rem; line-height: 1.75; margin: 1.5rem 0;">Airbnb ofrece un servicio de fotografía profesional por aproximadamente 150€, pero tiene limitaciones importantes. Descubre en nuestra <a href="/blog/fotografia-profesional-airbnb-guia-completa" style="color: #60a5fa; font-weight: 600; text-decoration: underline;">guía completa de fotografía profesional</a> los 12 tipos de fotos esenciales que necesitas y por qué el servicio de Airbnb podría no ser suficiente.</p>

  <ul style="font-size: 1.05rem; line-height: 1.75; margin: 1.5rem 0; padding-left: 1.5rem;">
    <li style="margin-bottom: 0.5rem;">Contrata fotógrafo vía Airbnb (150€) o profesional independiente</li>
    <li style="margin-bottom: 0.5rem;">Prepara: espacio despejado, mucha luz natural, limpieza impecable</li>
    <li style="margin-bottom: 0.5rem;">ROI: 2-3 semanas</li>
  </ul>
</div>

<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700;">✍️ Día 3: Descripción que Convierte</h3>

  <div style="background-color: white; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0;">
    <p style="margin: 0 0 1rem 0; font-weight: 600; color: #1f2937; text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em;">Estructura del Título Perfecto</p>
    <p style="margin: 0.5rem 0; font-size: 1.05rem;"><span style="color: #ef4444; font-weight: 600;">❌ Mal:</span> "Apartamento 2 habitaciones Centro"</p>
    <p style="margin: 0.5rem 0; font-size: 1.05rem;"><span style="color: #10b981; font-weight: 600;">✅ Bien:</span> "Ático luminoso con terraza • 2min Metro Sol"</p>
  </div>

  <p style="font-size: 1.05rem; line-height: 1.75; margin: 1.5rem 0;"><strong>En la descripción, habla de beneficios, NO características:</strong></p>
  <ul style="font-size: 1.05rem; line-height: 1.75;">
    <li>❌ "Tiene WiFi" → ✅ "Trabaja cómodamente con WiFi 300MB"</li>
    <li>❌ "2 habitaciones" → ✅ "Perfecto para familias: 2 habitaciones espaciosas"</li>
  </ul>
</div>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">💰 Día 4: Estrategia de Precios</h3>
  <p style="font-size: 1.125rem; line-height: 1.75; color: #e5e7eb;">El secreto: <strong>empezar barato para conseguir reviews rápido</strong>, luego subir precios.</p>

  <div style="background-color: white; border-radius: 12px; padding: 2rem; margin: 1.5rem 0;">
    <ol style="font-size: 1.05rem; line-height: 2; margin: 0; padding-left: 1.5rem;">
      <li style="margin-bottom: 1rem;"><strong>Investiga competencia directa</strong> (misma zona, tipo, capacidad)</li>
      <li style="margin-bottom: 1rem;"><strong>Calcula precio promedio</strong></li>
      <li style="margin-bottom: 1rem;"><strong>Pon tu precio -25%</strong> ese promedio</li>
      <li><strong>Objetivo:</strong> Primeras 5 reviews en 2-3 semanas</li>
    </ol>
  </div>

  <p style="background-color: #fef3c7; padding: 1rem; border-radius: 8px; font-style: italic; color: #92400e; margin: 1rem 0;">⚠️ Este precio bajo es TEMPORAL. Subirás a precio de mercado cuando tengas credibilidad.</p>

  <p style="font-size: 1.05rem; line-height: 1.75; color: #e5e7eb; margin: 1.5rem 0;">Pero no te obsesiones con la ocupación. La métrica que realmente importa es el RevPAR (ingresos por noche disponible). Aprende más sobre <a href="/blog/revpar-vs-ocupacion-metricas-correctas-airbnb" style="color: #60a5fa; font-weight: 600; text-decoration: underline;">cómo medir correctamente tus ingresos</a> y evita el error del 90% de anfitriones que calculan mal sus métricas.</p>
</div>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">⚡ Día 5: Sistema de Respuesta Rápida</h3>
  <p style="font-size: 1.125rem; line-height: 1.75; color: #e5e7eb;">La velocidad de respuesta impacta <strong>directamente</strong> tu posición en búsquedas.</p>

  <div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
      <p style="font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.125rem;">1. Mensajes Guardados</p>
      <p style="margin: 0; color: #4b5563;">Crea plantillas para: disponibilidad, check-in, normas, extras. <a href="/blog/mensajes-automaticos-airbnb" style="color: #6366f1; font-weight: 600; text-decoration: underline;">Descubre nuestra guía completa de mensajes automáticos</a> con plantillas listas para copiar y pegar que reducen tu tiempo de respuesta en un 80%.</p>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem;">
      <p style="font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.125rem;">2. Notificaciones Push</p>
      <p style="margin: 0; color: #4b5563;">Activa en móvil para responder desde cualquier lugar</p>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem;">
      <p style="font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.125rem;">3. Meta: &lt;15 minutos</p>
      <p style="margin: 0; color: #4b5563;">Tiempo máximo de respuesta ideal</p>
    </div>
  </div>
</div>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📱 Días 6-7: Manual de Bienvenida</h3>
  <p style="font-size: 1.125rem; line-height: 1.75; color: #e5e7eb;">Un manual completo reduce consultas en un <strong>60%</strong>.</p>

  <p style="font-weight: 600; color: white; margin: 1.5rem 0 1rem 0; font-size: 1.125rem;">Tu manual DEBE incluir:</p>

  <div>
    <div style="background-color: white; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.5rem 0;">🔐</p>
      <p style="font-weight: 600; margin: 0; color: #1f2937;">Check-in/out</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; color: #6b7280;">Instrucciones paso a paso</p>
    </div>
    <div style="background-color: white; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.5rem 0;">📶</p>
      <p style="font-weight: 600; margin: 0; color: #1f2937;">WiFi</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; color: #6b7280;">Red y contraseña. Genera tu propia <a href="/recursos/tarjeta-wifi" style="color: #6366f1; font-weight: 600; text-decoration: underline;">tarjeta WiFi profesional imprimible</a> en segundos</p>
    </div>
    <div style="background-color: white; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.5rem 0;">🏠</p>
      <p style="font-weight: 600; margin: 0; color: #1f2937;">Electrodomésticos</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; color: #6b7280;">Calefacción, AC, TV, cocina</p>
    </div>
    <div style="background-color: white; border-radius: 8px; padding: 1.25rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.5rem 0;">📍</p>
      <p style="font-weight: 600; margin: 0; color: #1f2937;">Recomendaciones de la Zona</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; color: #6b7280;">Con Itineramio, crea manuales digitales interactivos con <strong>12 zonas predefinidas</strong> (restaurantes, transporte, supermercados, qué ver, ocio nocturno, etc.) con <strong>vídeos de 60 segundos</strong> por zona y <strong>códigos QR imprimibles</strong> para que tus huéspedes accedan desde su móvil. Todo en múltiples idiomas automáticamente.</p>
    </div>
  </div>

  <div style="background-color: #6366f1; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; text-align: center;">
    <p style="margin: 0 0 1rem 0; color: white; font-size: 1.125rem;">Crea tu manual digital profesional en 5 minutos</p>
    <a href="/register" style="display: inline-block; background-color: white; color: #6366f1; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 1.05rem;">Prueba Itineramio Gratis →</a>
  </div>
</div>

<div style="background-color: #fef3c7; border-radius: 16px; padding: 2.5rem; margin: 3rem 0; border-left: 4px solid #f59e0b;">
  <h3 style="color: #92400e; margin-top: 0; font-size: 1.5rem; font-weight: 700;">🇪🇸 Si Estás en España: Registro Obligatorio en Partee</h3>
  <p style="font-size: 1.125rem; line-height: 1.75; color: #92400e; margin: 1rem 0;">Desde 2024, es <strong>obligatorio por ley</strong> registrar a todos tus huéspedes en el sistema Partee del Ministerio del Interior.</p>

  <div style="background-color: #fef2f2; border-radius: 12px; padding: 2rem; margin: 1.5rem 0; border-left: 4px solid #ef4444;">
    <p style="font-weight: 700; color: #991b1b; margin: 0 0 1rem 0; font-size: 1.125rem;">⚠️ Multas de hasta 30.000€</p>
    <p style="margin: 0; color: #991b1b; line-height: 1.75;">No registrar a tus huéspedes puede resultar en sanciones graves. El registro manual es tedioso y propenso a errores.</p>
  </div>

  <p style="font-weight: 600; color: #92400e; margin: 1.5rem 0 1rem 0; font-size: 1.125rem;">Herramientas que automatizan Partee:</p>
  <ul style="color: #92400e; line-height: 1.8; padding-left: 2rem;">
    <li style="margin-bottom: 0.75rem;"><strong>Guesty</strong> - Gestión completa de propiedades con integración Partee</li>
    <li style="margin-bottom: 0.75rem;"><strong>Hostaway</strong> - PMS con registro automático de huéspedes</li>
    <li style="margin-bottom: 0.75rem;"><strong>Avantio</strong> - Software español especializado en alquiler vacacional</li>
    <li><strong>Checkin.com</strong> - Plataforma dedicada específicamente al check-in digital y Partee</li>
  </ul>

  <p style="font-size: 1.05rem; color: #92400e; margin: 1.5rem 0 0 0; font-style: italic;">💡 Estas herramientas envían los datos automáticamente a Partee cuando el huésped completa el check-in digital, eliminando el riesgo de multas y ahorrándote horas de trabajo administrativo.</p>
</div>

<h2 style="color: #1f2937; margin-top: 4rem; margin-bottom: 1.5rem; font-size: 1.875rem; font-weight: 700;">Semana 2-3: Primeras Reservas</h2>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">🎯 Objetivo: 3-5 Reservas de 5 Estrellas</h3>

  <p style="font-size: 1.125rem; font-weight: 600; color: white; margin: 1.5rem 0 1rem 0;">Selección de Huéspedes (Crítico)</p>

  <div style="background-color: white; border-radius: 12px; padding: 2rem; margin: 1rem 0;">
    <p style="font-weight: 600; color: #1f2937; margin: 0 0 1rem 0; font-size: 1.125rem;">✅ Acepta perfiles con:</p>
    <ul style="margin: 0; padding-left: 1.5rem; line-height: 2; color: #374151;">
      <li>Foto de perfil verificada</li>
      <li>Reviews positivas de otros anfitriones</li>
      <li>Verificación de identidad completa</li>
      <li>Mensaje personalizado (no genérico)</li>
    </ul>
  </div>

  <div style="background-color: #fef2f2; border-radius: 12px; padding: 2rem; margin: 1rem 0; border: 2px solid #fecaca;">
    <p style="font-weight: 600; color: #991b1b; margin: 0 0 1rem 0; font-size: 1.125rem;">❌ Rechaza automáticamente:</p>
    <ul style="margin: 0; padding-left: 1.5rem; line-height: 2; color: #991b1b;">
      <li>Sin foto + grupo grande + 1 noche = Fiesta segura</li>
      <li>Sin reviews + cuenta nueva + petición urgente</li>
      <li>Mensajes vagos tipo "still available?"</li>
    </ul>
  </div>
</div>

<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700;">💎 Over-Delivery: Detalles que Marcan la Diferencia</h3>

  <div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #6366f1; margin-bottom: 1rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.75rem 0;">🍾</p>
      <p style="font-weight: 600; margin: 0 0 0.5rem 0; color: #1f2937;">Botella de Agua Fría</p>
      <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">En nevera al llegar. Coste: 0.30€. Impacto: Enorme</p>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #6366f1; margin-bottom: 1rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.75rem 0;">☕</p>
      <p style="font-weight: 600; margin: 0 0 0.5rem 0; color: #1f2937;">Café/Té Cortesía</p>
      <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">Cápsulas o bolsitas. Siempre mencionado en reviews</p>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #6366f1; margin-bottom: 1rem;">
      <p style="font-size: 1.5rem; margin: 0 0 0.75rem 0;">📖</p>
      <p style="font-weight: 600; margin: 0 0 0.5rem 0; color: #1f2937;">Manual Bien Visible</p>
      <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">En mesa o encimera. Con QR grande</p>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 1.5rem; border-left: 4px solid #6366f1;">
      <p style="font-size: 1.5rem; margin: 0 0 0.75rem 0;">📱</p>
      <p style="font-weight: 600; margin: 0 0 0.5rem 0; color: #1f2937;">WhatsApp Rápido</p>
      <p style="margin: 0; color: #6b7280; font-size: 0.95rem;">Responde dudas en &lt;30min durante estancia</p>
    </div>
  </div>
</div>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">⭐ After Check-out: Conseguir la Review</h3>

  <p style="font-size: 1.125rem; line-height: 1.75; color: #e5e7eb; margin: 1rem 0;">Dentro de las <strong>24 horas</strong> siguientes al checkout:</p>

  <div style="background-color: white; border-radius: 12px; padding: 2rem; margin: 1.5rem 0;">
    <p style="font-weight: 700; color: #1f2937; margin: 0 0 1rem 0; font-size: 1.125rem;">Paso 1: Deja TÚ review primero</p>
    <p style="margin: 0 0 1.5rem 0; color: #4b5563;">Los huéspedes tienen 3x más probabilidad de dejar review si tú lo haces primero.</p>

    <p style="font-weight: 700; color: #1f2937; margin: 1.5rem 0 1rem 0; font-size: 1.125rem;">Paso 2: Solicita con mensaje personalizado</p>
    <div style="background-color: #f0fdf4; border-radius: 8px; padding: 1.25rem; border-left: 4px solid #22c55e;">
      <p style="margin: 0; font-style: italic; color: #166534; line-height: 1.75;">"Hola [Nombre], ha sido un placer tenerte como huésped. Si te apetece y tu estancia ha sido positiva, nos ayudaría muchísimo que nos dejaras una review ⭐. ¡Esperamos verte pronto!"</p>
    </div>
  </div>
</div>

<h2 style="color: #1f2937; margin-top: 4rem; margin-bottom: 1.5rem; font-size: 1.875rem; font-weight: 700;">Semana 4: Optimización y Escalado</h2>

<div style="background-color: #1f2937; border-radius: 16px; padding: 2.5rem; margin: 2rem 0;">
  <h3 style="color: white; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📈 Estrategia de Subida de Precios</h3>

  <div style="background-color: white; border-radius: 12px; padding: 2rem; margin: 1.5rem 0;">
    <div style="border-left: 4px solid #6366f1; padding-left: 1.5rem; margin-bottom: 2rem;">
      <p style="font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.125rem;">Con 3+ Reviews</p>
      <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; color: #374151; line-height: 1.75;">
        <li>Sube precio <strong>+10%</strong></li>
        <li>Analiza qué destacan en reviews</li>
        <li>Potencia esos puntos fuertes</li>
      </ul>
    </div>

    <div style="border-left: 4px solid #6366f1; padding-left: 1.5rem;">
      <p style="font-weight: 700; color: #1f2937; margin: 0 0 0.5rem 0; font-size: 1.125rem;">Con 5+ Reviews</p>
      <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; color: #374151; line-height: 1.75;">
        <li>Sube otros <strong>+10%</strong> (ya estás a precio de mercado)</li>
        <li>Activa Smart Pricing (con límites min/max)</li>
        <li>Implementa automatizaciones básicas</li>
      </ul>
    </div>
  </div>
</div>

<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 3rem 0;">
  <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700; text-align: center;">📊 Métricas Objetivo - Primer Mes</h3>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
    <div style="background-color: #6366f1; border-radius: 12px; padding: 2rem; text-align: center; color: white;">
      <p style="font-size: 2.5rem; font-weight: 700; margin: 0;">100%</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; opacity: 0.9;">Tasa de Respuesta</p>
    </div>
    <div style="background-color: #6366f1; border-radius: 12px; padding: 2rem; text-align: center; color: white;">
      <p style="font-size: 2.5rem; font-weight: 700; margin: 0;">&lt;15min</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; opacity: 0.9;">Tiempo Respuesta</p>
    </div>
    <div style="background-color: #6366f1; border-radius: 12px; padding: 2rem; text-align: center; color: white;">
      <p style="font-size: 2.5rem; font-weight: 700; margin: 0;">5+</p>
      <p style="margin: 0.5rem 0 0 0; font-size: 0.95rem; opacity: 0.9;">Reviews 5★</p>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-top: 1.5rem;">
    <div style="background-color: white; border-radius: 12px; padding: 2rem; text-align: center; border: 2px solid #6366f1;">
      <p style="font-size: 2rem; font-weight: 700; margin: 0; color: #1f2937;">&gt;88%</p>
      <p style="margin: 0.5rem 0 0 0; color: #4b5563;">Tasa Aceptación</p>
    </div>
    <div style="background-color: white; border-radius: 12px; padding: 2rem; text-align: center; border: 2px solid #6366f1;">
      <p style="font-size: 2rem; font-weight: 700; margin: 0; color: #1f2937;">60-70%</p>
      <p style="margin: 0.5rem 0 0 0; color: #4b5563;">Ocupación (normal mes 1)</p>
    </div>
  </div>
</div>

<div style="background-color: #fef2f2; border: 3px solid #ef4444; border-radius: 16px; padding: 2.5rem; margin: 3rem 0;">
  <h2 style="color: #991b1b; margin-top: 0; font-size: 1.75rem; font-weight: 700; text-align: center;">🚨 Errores que DESTRUYEN tu Negocio</h2>

  <div style="background-color: white; border-radius: 12px; padding: 2rem; margin: 1.5rem 0;">
    <div style="display: block;">
      <div style="border-left: 4px solid #ef4444; padding-left: 1.25rem; margin-bottom: 1.5rem;">
        <p style="font-weight: 700; color: #991b1b; margin: 0 0 0.5rem 0; font-size: 1.125rem;">1. Cancelar una Reserva</p>
        <p style="margin: 0; color: #4b5563;">Destruye tu ranking permanentemente. Airbnb te penaliza durante meses. NUNCA canceles.</p>
      </div>
      <div style="border-left: 4px solid #ef4444; padding-left: 1.25rem; margin-bottom: 1.5rem;">
        <p style="font-weight: 700; color: #991b1b; margin: 0 0 0.5rem 0; font-size: 1.125rem;">2. Aceptar Perfil de Riesgo</p>
        <p style="margin: 0; color: #4b5563;">Sin foto + grupo grande + 1 noche = Fiesta. Una sola fiesta puede costarte 3,000-10,000€ en daños.</p>
      </div>
      <div style="border-left: 4px solid #ef4444; padding-left: 1.25rem; margin-bottom: 1.5rem;">
        <p style="font-weight: 700; color: #991b1b; margin: 0 0 0.5rem 0; font-size: 1.125rem;">3. Responder Tarde</p>
        <p style="margin: 0; color: #4b5563;">&gt;1 hora mata conversión. Los huéspedes reservan con quien responde primero, no con el mejor.</p>
      </div>
      <div style="border-left: 4px solid #ef4444; padding-left: 1.25rem;">
        <p style="font-weight: 700; color: #991b1b; margin: 0 0 0.5rem 0; font-size: 1.125rem;">4. Subir Precio sin Reviews</p>
        <p style="margin: 0; color: #4b5563;">Necesitas mínimo 5 reviews de 5★ antes de estar a precio de mercado. La credibilidad primero.</p>
      </div>
    </div>
  </div>
</div>


<div style="background-color: #f9fafb; border-radius: 16px; padding: 2.5rem; margin: 3rem 0; border: 2px solid #e5e7eb;">
  <h3 style="color: #1f2937; margin-top: 0; font-size: 1.5rem; font-weight: 700;">📚 Artículos Relacionados</h3>
  <ul style="list-style: none; padding: 0; margin: 1.5rem 0;">
    <li style="margin-bottom: 1rem;"><a href="/blog/errores-principiantes-airbnb" style="color: #6366f1; font-weight: 600;">→ 10 Errores de Principiantes</a></li>
    <li style="margin-bottom: 1rem;"><a href="/blog/manual-digital-apartamento-turistico-guia-completa" style="color: #6366f1; font-weight: 600;">→ Manual Digital Completo</a></li>
    <li style="margin-bottom: 1rem;"><a href="/blog/plantilla-check-in-remoto-airbnb" style="color: #6366f1; font-weight: 600;">→ Plantilla Check-in Remoto</a></li>
    <li style="margin-bottom: 1rem;"><a href="/blog/fotografia-profesional-airbnb-guia-completa" style="color: #6366f1; font-weight: 600;">→ Fotografía Profesional: Guía Completa</a></li>
    <li style="margin-bottom: 1rem;"><a href="/blog/mensajes-automaticos-airbnb" style="color: #6366f1; font-weight: 600;">→ Mensajes Automáticos para Airbnb</a></li>
    <li style="margin-bottom: 1rem;"><a href="/blog/revpar-vs-ocupacion-metricas-correctas-airbnb" style="color: #6366f1; font-weight: 600;">→ RevPAR vs Ocupación: Métricas Correctas</a></li>
  </ul>
</div>

<div style="background-color: #1f2937; border-radius: 16px; padding: 3rem; margin: 3rem 0; text-align: center; color: white;">
  <h3 style="margin-top: 0; font-size: 2rem; color: white; font-weight: 700;">✨ Automatiza tu Gestión Desde el Día 1</h3>
  <p style="font-size: 1.25rem; margin: 1.5rem 0; opacity: 0.95; line-height: 1.75;">Manual digital + QR code + Check-in automático + Instrucciones multiidioma</p>
  <p style="font-size: 1.125rem; margin: 1.5rem 0; opacity: 0.9;">Reduce consultas en un <strong>60%</strong> y ahorra <strong>8 horas/semana</strong></p>
  <a href="/register" style="display: inline-block; background-color: white; color: #1f2937; padding: 1.25rem 3rem; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 1.25rem; margin-top: 1rem; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">Prueba Gratis 15 Días →</a>
  <p style="font-size: 1rem; margin-top: 1.5rem; opacity: 0.8;">Sin tarjeta • Setup en 5 minutos • Cancela cuando quieras</p>
</div>`

async function main() {
  try {
    console.log('🔍 Buscando artículo "primer-mes-anfitrion-airbnb"...')

    const post = await prisma.blogPost.update({
      where: { slug: 'primer-mes-anfitrion-airbnb' },
      data: {
        content: newContent,
        updatedAt: new Date()
      }
    })

    console.log('✅ Artículo actualizado con éxito')
    console.log('')
    console.log('📊 RESUMEN DE CAMBIOS:')
    console.log('')
    console.log('🎨 CSS FIXES:')
    console.log('  ✓ Corregidos "color: color: #$2;" → "color: #4b5563;"')
    console.log('  ✓ Corregidos "background-color: background-color: #$2;" → "background-color: #1f2937;"')
    console.log('  ✓ Corregidos "background-color: background-color: background-color: #$2;" → "background-color: #f9fafb;"')
    console.log('  ✓ Corregidos "style=#fef3c7;" → "style=background-color: #fef3c7;"')
    console.log('  ✓ Corregidos "style=#1f2937;" → "style=color: white;" (para headings en fondos oscuros)')
    console.log('  ✓ Estandarizados todos los colores CSS con valores específicos')
    console.log('')
    console.log('🔗 INTERNAL LINKS AGREGADOS:')
    console.log('  ✓ /blog/fotografia-profesional-airbnb-guia-completa (Días 1-2)')
    console.log('  ✓ /blog/mensajes-automaticos-airbnb (Día 5)')
    console.log('  ✓ /blog/revpar-vs-ocupacion-metricas-correctas-airbnb (Día 4)')
    console.log('  ✓ /recursos/tarjeta-wifi (Manual de Bienvenida)')
    console.log('')
    console.log('📝 CONTENIDO NUEVO AGREGADO:')
    console.log('  ✓ Sección "Si Estás en España: Registro Obligatorio en Partee"')
    console.log('    - Explicación de la obligación legal desde 2024')
    console.log('    - Advertencia de multas hasta 30,000€')
    console.log('    - Herramientas recomendadas: Guesty, Hostaway, Avantio, Checkin.com')
    console.log('')
    console.log('  ✓ Ampliación sección Manual de Bienvenida con features de Itineramio:')
    console.log('    - 12 zonas predefinidas')
    console.log('    - Vídeos de 60 segundos por zona')
    console.log('    - Códigos QR imprimibles')
    console.log('    - Generador de tarjeta WiFi (/recursos/tarjeta-wifi)')
    console.log('')
    console.log('📏 Estadísticas:')
    console.log(`  • Nuevo contenido: ${newContent.length.toLocaleString()} caracteres`)
    console.log(`  • ID del artículo: ${post.id}`)
    console.log('')
    console.log('🔗 URL del artículo:')
    console.log('  https://itineramio.com/blog/primer-mes-anfitrion-airbnb')
    console.log('')
    console.log('✨ Actualización completada exitosamente')
  } catch (error) {
    console.error('❌ Error al actualizar el artículo:', error)
    throw error
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
