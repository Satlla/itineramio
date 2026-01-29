import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const newContent = `
<style>
  .article-lead { font-size: 1.25rem; line-height: 1.8; color: #374151; margin-bottom: 2rem; }
  .section-title { font-size: 1.75rem; font-weight: 700; color: #111827; margin: 3rem 0 1.5rem 0; padding-bottom: 0.75rem; border-bottom: 2px solid #e5e7eb; }
  .subsection-title { font-size: 1.25rem; font-weight: 600; color: #374151; margin: 2rem 0 1rem 0; }
  .highlight-box { background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 12px; padding: 1.5rem 2rem; margin: 2rem 0; border-left: 4px solid #7c3aed; }
  .warning-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 1rem 1.5rem; margin: 2rem 0; }
  .tip-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 1.5rem; margin: 2rem 0; }
  .result-box { background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 12px; padding: 1.5rem; margin: 2rem 0; border-left: 4px solid #10b981; }
  .quote-box { background: #f8fafc; border-left: 4px solid #7c3aed; padding: 1.5rem 2rem; margin: 2rem 0; border-radius: 0 12px 12px 0; font-style: italic; }
  .quote-box .author { font-style: normal; font-weight: 600; color: #7c3aed; margin-top: 1rem; display: block; }
  .check-list { list-style: none; padding-left: 0; margin: 1.5rem 0; }
  .check-list li { padding: 0.5rem 0 0.5rem 2rem; position: relative; color: #374151; }
  .check-list li::before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
  .cross-list { list-style: none; padding-left: 0; margin: 1.5rem 0; }
  .cross-list li { padding: 0.5rem 0 0.5rem 2rem; position: relative; color: #374151; }
  .cross-list li::before { content: "✗"; position: absolute; left: 0; color: #ef4444; font-weight: bold; }
  .phase-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1.5rem; margin: 1.5rem 0; }
  .phase-card h4 { font-size: 1.125rem; font-weight: 600; color: #7c3aed; margin: 0 0 1rem 0; }
  .metrics-table { width: 100%; border-collapse: collapse; margin: 2rem 0; }
  .metrics-table th { background: #f3f4f6; padding: 0.75rem 1rem; text-align: left; font-weight: 600; border: 1px solid #e5e7eb; }
  .metrics-table td { padding: 0.75rem 1rem; border: 1px solid #e5e7eb; }
  .metrics-table tr:nth-child(even) { background: #f9fafb; }
  .metric-highlight { color: #10b981; font-weight: 700; }
  .cta-box { background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%); border-radius: 16px; padding: 2rem; margin: 3rem 0; text-align: center; color: white; }
  .cta-box h3 { color: white; margin: 0 0 1rem 0; font-size: 1.5rem; }
  .cta-box p { color: rgba(255,255,255,0.9); margin-bottom: 1.5rem; }
  .cta-button { display: inline-block; background: white; color: #7c3aed; font-weight: 600; padding: 0.875rem 2rem; border-radius: 8px; text-decoration: none; transition: transform 0.2s; }
  .cta-button:hover { transform: scale(1.05); }
  .time-saved { display: flex; gap: 1rem; margin: 1rem 0; flex-wrap: wrap; }
  .time-saved span { background: #f3f4f6; padding: 0.5rem 1rem; border-radius: 8px; font-size: 0.875rem; }
</style>

<p class="article-lead"><strong>Escalar un negocio de alquiler vacacional no debería significar trabajar más horas.</strong></p>

<p>Esta es la historia de David, gestor en Barcelona, que pasó de estar al límite con 8 propiedades a gestionar 15 con menos estrés y más margen, <strong>sin contratar a nadie</strong>.</p>

<div class="warning-box">
<strong>⚠️ Caso ilustrativo.</strong> Los resultados dependen del mercado, ubicación y capacidad operativa.
</div>

<h2 class="section-title">El punto de partida: cuando crecer deja de ser una buena idea</h2>

<p>En enero de 2023, David gestionaba 8 apartamentos repartidos por Barcelona. Sobre el papel, el negocio iba bien. En la práctica, estaba agotado.</p>

<ul class="cross-list">
<li>Más de <strong>60 horas semanales</strong></li>
<li>Teléfono encendido <strong>24/7</strong></li>
<li>Dos años sin vacaciones</li>
<li>Cada nuevo apartamento significaba más caos, no más libertad</li>
</ul>

<div class="quote-box">
"Cada vez que pensaba en crecer, me entraba ansiedad. Ya no daba abasto con 8."
<span class="author">— David</span>
</div>

<p>El problema no era el número de propiedades.<br><strong>Era cómo las gestionaba.</strong></p>

<h2 class="section-title">El diagnóstico: por qué no podía escalar</h2>

<h3 class="subsection-title">1. Todo dependía de él</h3>

<p>David era el sistema. Solo él sabía:</p>

<ul class="cross-list">
<li>Dónde estaban las llaves</li>
<li>Qué hacer si fallaba algo</li>
<li>A qué limpiador llamar</li>
<li>Cómo funcionaba cada check-in</li>
</ul>

<p><strong>Sin procesos documentados, delegar era imposible.</strong></p>

<h3 class="subsection-title">2. Comunicación manual constante</h3>

<p>Cada reserva implicaba escribir mensajes uno a uno:</p>

<ul class="cross-list">
<li>Confirmación</li>
<li>Instrucciones</li>
<li>Recordatorios</li>
<li>Bienvenida</li>
<li>Solicitud de reseña</li>
</ul>

<p>Con 8 propiedades, eso eran <strong>más de 200 mensajes al mes</strong> escritos a mano.</p>

<h3 class="subsection-title">3. Emergencias que no eran emergencias</h3>

<p>El 80% de las consultas eran siempre las mismas:</p>

<ul class="cross-list">
<li>"¿Cuál es el WiFi?"</li>
<li>"¿Cómo funciona la lavadora?"</li>
<li>"¿Dónde se aparca?"</li>
<li>"¿Hay un supermercado cerca?"</li>
</ul>

<p>Tiempo perdido, interrupciones constantes y desgaste mental.</p>

<h2 class="section-title">El cambio: de bombero a gestor de sistemas</h2>

<p>David no contrató a nadie.<br>Hizo algo más inteligente: <strong>construyó sistemas</strong>.</p>

<div class="phase-card">
<h4>Fase 1 — Documentar todo (semanas 1–4)</h4>
<p>Primero, sacó el conocimiento de su cabeza y lo puso por escrito.</p>
<ul class="check-list">
<li>Manual operativo por propiedad</li>
<li>Checklist de limpieza</li>
<li>Contactos clave (mantenimiento, cerrajero, limpieza)</li>
<li>Manual del huésped con todo lo esencial</li>
</ul>
<div class="time-saved">
<span>⏱️ 40 horas de trabajo una sola vez</span>
<span>📉 15+ horas ahorradas cada semana para siempre</span>
</div>
</div>

<div class="phase-card">
<h4>Fase 2 — Automatizar la comunicación (semanas 5–8)</h4>
<p>Se definieron mensajes automáticos según el momento del viaje:</p>
<table class="metrics-table">
<tr><th>Momento</th><th>Mensaje</th></tr>
<tr><td>Reserva confirmada</td><td>Bienvenida + qué esperar</td></tr>
<tr><td>3 días antes</td><td>Check-in + acceso al manual</td></tr>
<tr><td>Día de llegada</td><td>Recordatorio horario</td></tr>
<tr><td>Día 2</td><td>"¿Todo bien?"</td></tr>
<tr><td>Check-out</td><td>Agradecimiento + reseña</td></tr>
</table>
<div class="result-box">
<strong>Resultado:</strong> de 200+ mensajes manuales a <strong>menos de 20 al mes</strong>.
</div>
</div>

<div class="phase-card">
<h4>Fase 3 — Manuales digitales para huéspedes (semanas 9–12)</h4>
<p>Cada apartamento pasó a tener un manual digital accesible por QR:</p>
<ul class="check-list">
<li>WiFi y dispositivos</li>
<li>Electrodomésticos</li>
<li>Normas de la casa</li>
<li>Recomendaciones del barrio</li>
<li>Qué hacer si hay un problema</li>
</ul>
<div class="result-box">
<strong>Resultado:</strong> Las preguntas por WhatsApp cayeron un <strong>85%</strong>.
</div>
</div>

<div class="phase-card">
<h4>Fase 4 — Escalar sin fricción (meses 4–18)</h4>
<p>Con los sistemas funcionando, crecer dejó de ser estresante:</p>
<ul class="check-list">
<li>Nuevas propiedades en 48 horas</li>
<li>Limpieza delegada con estándares claros</li>
<li>David solo intervenía en lo realmente importante</li>
</ul>
</div>

<h2 class="section-title">Resultados reales tras 18 meses</h2>

<table class="metrics-table">
<tr><th>Métrica</th><th>Enero 2023</th><th>Julio 2024</th></tr>
<tr><td>Propiedades</td><td>8</td><td class="metric-highlight">15</td></tr>
<tr><td>Ingresos brutos/mes</td><td>12.000 €</td><td class="metric-highlight">28.500 €</td></tr>
<tr><td>Horas/semana</td><td>60+</td><td class="metric-highlight">35</td></tr>
<tr><td>€ por hora trabajada</td><td>~46 €</td><td class="metric-highlight">~187 €</td></tr>
<tr><td>Empleados</td><td>0</td><td>0</td></tr>
</table>

<div class="quote-box">
"El error fue pensar que escalar significaba trabajar más. Escalar es trabajar mejor."
<span class="author">— David, Barcelona</span>
</div>

<h2 class="section-title">3 lecciones para cualquier gestor</h2>

<div class="highlight-box">
<strong>1. Documenta antes de crecer</strong><br>
Si no puedes explicarlo por escrito, no puedes escalarlo.
</div>

<div class="highlight-box">
<strong>2. Automatiza lo repetitivo</strong><br>
Cada tarea manual recurrente es un cuello de botella.
</div>

<div class="highlight-box">
<strong>3. Los sistemas escalan, las personas no</strong><br>
Diseña procesos que funcionen sin ti.
</div>

<h2 class="section-title">¿Qué NO hizo David?</h2>

<ul class="cross-list">
<li>No contrató empleados</li>
<li>No invirtió miles de euros</li>
<li>No se convirtió en experto en tecnología</li>
</ul>

<p>Solo:</p>

<ul class="check-list">
<li>Documentó lo que ya hacía</li>
<li>Automatizó lo repetitivo</li>
<li>Dio la información antes de que se la pidieran</li>
</ul>

<div class="cta-box">
<h3>Empieza tú también</h3>
<p>El mismo sistema que permitió a David pasar de 8 a 15 propiedades sin quemarse está disponible en Itineramio.</p>
<a href="https://www.itineramio.com/register" class="cta-button">Pruébalo gratis 15 días →</a>
<p style="font-size: 0.875rem; margin-top: 1rem; opacity: 0.8;">Sin tarjeta · Cancela cuando quieras</p>
</div>
`

async function main() {
  const result = await prisma.blogPost.update({
    where: { slug: 'caso-david-15-propiedades' },
    data: {
      title: 'Caso David: Cómo Pasó de 8 a 15 Propiedades Sin Contratar a Nadie',
      content: newContent.trim(),
      excerpt: 'David escaló de 8 a 15 propiedades sin contratar, trabajando menos horas. Los sistemas exactos que implementó y cómo puedes replicarlos.',
      metaTitle: 'Caso David: De 8 a 15 Propiedades Sin Contratar | Caso de Estudio',
      metaDescription: 'Cómo David pasó de 8 a 15 propiedades en Barcelona sin contratar a nadie. Los sistemas de automatización y documentación que lo hicieron posible.',
      updatedAt: new Date()
    }
  })

  console.log('✅ Artículo de David actualizado')
  console.log('ID:', result.id)
  console.log('Slug:', result.slug)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
