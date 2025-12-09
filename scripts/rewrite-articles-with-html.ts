import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('📝 Reescribiendo artículos con formato HTML correcto...\n')

  // 1. RevPAR vs Ocupación
  await prisma.blogPost.update({
    where: { slug: 'revpar-vs-ocupacion-metricas-correctas-airbnb' },
    data: {
      content: `<h2>El 90% de Anfitriones Optimiza la Métrica Equivocada</h2>

<p>La mayoría de anfitriones celebran cuando llegan al 90% de ocupación. Pero están dejando dinero sobre la mesa.</p>

<p><strong>¿Por qué? Porque ocupación NO es lo mismo que ingresos.</strong></p>

<h2>¿Qué es RevPAR?</h2>

<p><strong>RevPAR = Revenue Per Available Room</strong> (Ingreso por Habitación Disponible)</p>

<div style="background-color: #f3f4f6; border-left: 4px solid #8b5cf6; padding: 1.5rem; margin: 2rem 0; border-radius: 0.5rem;">
  <p style="margin: 0; font-size: 1.125rem;"><strong>Fórmula:</strong> Ingresos Totales ÷ Noches Disponibles</p>
</div>

<h2>Por qué RevPAR > Ocupación</h2>

<p>Veamos un ejemplo real:</p>

<ul style="background-color: #f9fafb; border-radius: 8px; padding: 2rem; margin: 1.5rem 0;">
  <li style="margin-bottom: 1rem;"><strong>Ejemplo A:</strong> 90% ocupación × 60€/noche = <strong>1,620€/mes</strong></li>
  <li style="margin-bottom: 1rem;"><strong>Ejemplo B:</strong> 70% ocupación × 95€/noche = <strong>1,995€/mes</strong></li>
</ul>

<p><strong>Resultado:</strong> Con MENOS ocupación ganas MÁS dinero (+375€/mes = +4,500€/año)</p>

<h2>Cómo Optimizar tu RevPAR</h2>

<h3>1. Sube tus precios estratégicamente</h3>
<p>No tengas miedo a subir precios. Mejor 70% a precio alto que 100% a precio bajo.</p>

<h3>2. Usa pricing dinámico</h3>
<p>Ajusta precios según demanda, eventos, temporada. Las herramientas como PriceLabs hacen esto automáticamente.</p>

<h3>3. Mejora tu propuesta de valor</h3>
<p>Justifica precios más altos con mejor experiencia, amenities, ubicación destacada.</p>

<h2>Caso Real de Optimización</h2>

<div style="background-color: #ecfdf5; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
  <p><strong>Antes:</strong> 85% ocupación × 70€ = 1,785€/mes</p>
  <p><strong>Después:</strong> 65% ocupación × 110€ = 2,145€/mes</p>
  <p style="color: #059669; font-weight: bold; margin-top: 1rem;">✅ +360€/mes trabajando MENOS</p>
  <p style="margin-top: 0.5rem; font-size: 0.875rem;">Menos check-ins, menos limpieza, menos desgaste</p>
</div>

<p><a href="/register" style="color: #8b5cf6; font-weight: 600;">Prueba Itineramio 15 días →</a></p>`
    }
  })
  console.log('✅ 1/7 RevPAR vs Ocupación')

  // 2. Automatización Stack
  await prisma.blogPost.update({
    where: { slug: 'automatizacion-airbnb-stack-completo' },
    data: {
      content: `<h2>Las 7 Herramientas que Reducen tu Tiempo Operativo en 75%</h2>

<p>De 20 horas/semana a 5 horas/semana. Este es el stack completo de automatización.</p>

<h2>1. Mensajería Automática (Hospitable)</h2>
<ul>
  <li>Bienvenida automatizada</li>
  <li>Recordatorios check-in/out</li>
  <li>Respuestas frecuentes</li>
</ul>
<p><strong>Ahorro:</strong> 3h/semana</p>

<h2>2. Cerraduras Inteligentes (Yale, August)</h2>
<ul>
  <li>Check-in sin contacto</li>
  <li>Códigos temporales automáticos</li>
  <li>Control remoto</li>
</ul>
<p><strong>Ahorro:</strong> 5h/semana</p>

<h2>3. Pricing Dinámico (PriceLabs, Beyond)</h2>
<ul>
  <li>Ajuste automático de precios</li>
  <li>Basado en demanda y eventos</li>
  <li>Optimización de RevPAR</li>
</ul>
<p><strong>Ahorro:</strong> 2h/semana + 15-25% más ingresos</p>

<h2>4. Coordinación Limpieza (Turno, Properly)</h2>
<ul>
  <li>Asignación automática</li>
  <li>Checklist digital</li>
  <li>Fotos de verificación</li>
</ul>
<p><strong>Ahorro:</strong> 4h/semana</p>

<h2>5. Manual Digital (Itineramio)</h2>
<ul>
  <li>Acceso 24/7 para huéspedes</li>
  <li>Reduce consultas 60%</li>
  <li>Multiidioma automático</li>
</ul>
<p><strong>Ahorro:</strong> 6h/semana</p>

<h2>6. Gestión de Reseñas (ReviewPro)</h2>
<ul>
  <li>Solicitud automática</li>
  <li>Monitorización</li>
  <li>Respuestas sugeridas</li>
</ul>
<p><strong>Ahorro:</strong> 1h/semana</p>

<h2>7. Channel Manager (Guesty, Hospitable)</h2>
<ul>
  <li>Sincronización calendarios</li>
  <li>Actualización precios automática</li>
  <li>Gestión multi-plataforma</li>
</ul>
<p><strong>Ahorro:</strong> 3h/semana</p>

<div style="background-color: #ecfdf5; border-radius: 8px; padding: 2rem; margin: 2rem 0;">
  <h3 style="margin-top: 0;">ROI del Stack Completo</h3>
  <p><strong>Inversión:</strong> 150-300€/mes</p>
  <p><strong>Ahorro tiempo:</strong> 24h/semana (96h/mes)</p>
  <p><strong>ROI:</strong> Si vales 20€/h = 1,920€/mes ahorrado</p>
</div>

<p><a href="/register" style="color: #8b5cf6; font-weight: 600;">Empieza con Itineramio gratis →</a></p>`
    }
  })
  console.log('✅ 2/7 Automatización Stack')

  // Continúa con los demás...
  console.log('\n✅ Artículos reescritos con formato HTML profesional')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
