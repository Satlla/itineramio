import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Plantillas de Mensajes Automáticos para Airbnb | Itineramio',
  robots: 'noindex, nofollow'
}

export default function PlantillasMensajesPDF() {
  return (
    <div className="bg-white min-h-screen">
      {/* Print styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          @page { margin: 1.5cm; }
        }
        @media screen {
          .container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        }
      `}} />

      {/* Header - No print */}
      <div className="no-print bg-gradient-to-r from-rose-500 to-orange-500 text-white py-6 px-4 text-center">
        <h1 className="text-2xl font-bold mb-2">Plantillas de Mensajes Automáticos</h1>
        <p className="text-white/90">Guarda como PDF: Cmd/Ctrl + P → Guardar como PDF</p>
      </div>

      <div className="container">
        {/* Cover */}
        <div className="text-center py-12 border-b-2 border-gray-200 mb-8">
          <div className="text-6xl mb-4">📩</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Plantillas de Mensajes Automáticos
          </h1>
          <p className="text-xl text-gray-600 mb-4">para Airbnb y Booking</p>
          <p className="text-gray-500">
            Guía completa para configurar tus mensajes y reducir un 80% las preguntas repetitivas
          </p>
          <div className="mt-8 inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-4 py-2 rounded-full text-sm font-medium">
            <span>Por</span>
            <span className="font-bold">Itineramio</span>
          </div>
        </div>

        {/* Índice */}
        <div className="mb-12 bg-gray-50 rounded-xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">📋 Contenido</h2>
          <ol className="space-y-2 text-gray-700">
            <li>1. Mensaje de Bienvenida (tras confirmar reserva)</li>
            <li>2. Mensaje Pre-llegada (24h antes)</li>
            <li>3. Mensaje Día Siguiente (feedback + recomendaciones)</li>
            <li>4. Mensaje Pre-salida (día antes del check-out)</li>
            <li>5. Mensaje Solicitud de Reseña (opcional)</li>
            <li>6. Respuestas Rápidas Frecuentes</li>
            <li>7. Cómo Configurar en Airbnb y Booking</li>
            <li>8. Programa SuperGuest (fidelización)</li>
          </ol>
        </div>

        {/* ============ MENSAJE 1: BIENVENIDA ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-xl">1</div>
            <h2 className="text-2xl font-bold text-gray-900">Mensaje de Bienvenida</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Cuándo enviarlo:</strong> Inmediatamente después de confirmar la reserva
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">PLANTILLA</p>
            <div className="text-gray-800 space-y-4 leading-relaxed">
              <p>¡Hola <span className="bg-yellow-100 px-1">[Nombre del huésped]</span>! 👋</p>

              <p>¡Gracias por elegir <span className="bg-yellow-100 px-1">[Nombre del alojamiento]</span>! Estamos encantados de recibirte.</p>

              <p><strong>📍 Datos del alojamiento:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Dirección: <span className="bg-yellow-100 px-1">[Dirección completa]</span></li>
                <li>Google Maps: <span className="bg-yellow-100 px-1">[Enlace a Google Maps]</span></li>
                <li>Coordenadas GPS: <span className="bg-yellow-100 px-1">[Latitud, Longitud]</span></li>
              </ul>

              <p><strong>🏢 Cómo reconocer el edificio:</strong><br/>
              <span className="bg-yellow-100 px-1">[Descripción de la fachada: color, características distintivas, portero, etc.]</span></p>

              <p><strong>📖 Tu guía digital del alojamiento:</strong><br/>
              Hemos preparado una guía completa con todo lo que necesitas saber sobre tu estancia:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>WiFi y conexión</li>
                <li>Cómo llegar (desde aeropuerto, tren, bus)</li>
                <li>Dónde aparcar</li>
                <li>Instrucciones de check-in</li>
                <li>Funcionamiento de electrodomésticos</li>
                <li>Y mucho más...</li>
              </ul>
              <p>👉 <strong>Accede aquí:</strong> <span className="bg-yellow-100 px-1">[Enlace a tu guía en Itineramio]</span></p>

              <p><strong>🔑 Proceso de check-in:</strong><br/>
              <span className="bg-yellow-100 px-1">[Elige una opción:]</span></p>

              <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
                <p className="font-medium text-gray-700 mb-2">Opción A - Recepción en persona:</p>
                <p className="text-gray-600 text-sm">Te recibiremos personalmente el día de tu llegada. Por favor, confírmanos tu hora estimada de llegada para coordinarnos.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
                <p className="font-medium text-gray-700 mb-2">Opción B - Entrada autónoma:</p>
                <p className="text-gray-600 text-sm">La entrada es autónoma mediante <span className="bg-yellow-100 px-1">[caja de llaves / cerradura inteligente / código]</span>. El día de tu llegada te enviaremos las instrucciones detalladas y el código de acceso. Importante: necesitarás conexión a internet para <span className="bg-yellow-100 px-1">[descargar la app / recibir el código]</span>.</p>
              </div>

              <p><strong>⏰ Horarios:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Check-in: a partir de las <span className="bg-yellow-100 px-1">[hora]</span></li>
                <li>Check-out: antes de las <span className="bg-yellow-100 px-1">[hora]</span></li>
              </ul>

              <p><strong>🕐 Sobre la entrada temprana (Early check-in):</strong><br/>
              <span className="bg-yellow-100 px-1">[Elige una opción:]</span></p>

              <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
                <p className="font-medium text-gray-700 mb-2">Si ofreces early check-in:</p>
                <p className="text-gray-600 text-sm">Ofrecemos entrada temprana sujeta a disponibilidad por <span className="bg-yellow-100 px-1">[X€]</span>. El día previo a tu llegada te confirmaremos si es posible.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-4 my-2">
                <p className="font-medium text-gray-700 mb-2">Si NO ofreces early check-in:</p>
                <p className="text-gray-600 text-sm">Lamentablemente no ofrecemos entrada temprana, pero haremos todo lo posible por tener el apartamento listo lo antes posible. Si llegas antes, podemos guardar tu equipaje o te recomendamos la consigna <span className="bg-yellow-100 px-1">[Nombre de consigna]</span> que está cerca: <span className="bg-yellow-100 px-1">[enlace]</span></p>
              </div>

              <p>Si tienes cualquier pregunta, no dudes en escribirnos. ¡Estamos aquí para ayudarte!</p>

              <p>Un saludo,<br/>
              <span className="bg-yellow-100 px-1">[Tu nombre]</span></p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Consejo:</strong> Este mensaje establece expectativas claras desde el principio.
              Cuanta más información des ahora, menos preguntas recibirás después.
            </p>
          </div>
        </div>

        {/* Page break */}
        <div className="page-break"></div>

        {/* ============ MENSAJE 2: PRE-LLEGADA ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-xl">2</div>
            <h2 className="text-2xl font-bold text-gray-900">Mensaje Pre-llegada (24h antes)</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Cuándo enviarlo:</strong> 24 horas antes del check-in (programa en Airbnb)
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">PLANTILLA</p>
            <div className="text-gray-800 space-y-4 leading-relaxed">
              <p>¡Hola <span className="bg-yellow-100 px-1">[Nombre del huésped]</span>! 🎉</p>

              <p>¡Mañana es el gran día! Estamos muy contentos de recibirte en <span className="bg-yellow-100 px-1">[Nombre del alojamiento]</span>.</p>

              <p><strong>📋 Recordatorio importante:</strong></p>
              <p><span className="bg-yellow-100 px-1">[Incluye aquí lo específico de tu alojamiento, por ejemplo:]</span></p>
              <ul className="list-disc list-inside ml-4 space-y-1 text-gray-600">
                <li>No ofrecemos servicio de limpieza diaria (es un apartamento, no un hotel)</li>
                <li>La entrada es autónoma, necesitarás la app <span className="bg-yellow-100 px-1">[nombre]</span> instalada</li>
                <li>Si llegas de noche, ten en cuenta las normas de ruido de la comunidad</li>
                <li><span className="bg-yellow-100 px-1">[Otros recordatorios específicos]</span></li>
              </ul>

              <p><strong>🔑 Tu acceso:</strong><br/>
              <span className="bg-yellow-100 px-1">[Instrucciones de acceso / código / ubicación de llaves]</span></p>

              <p><strong>📖 ¿Has revisado la guía digital?</strong><br/>
              Por favor, échale un vistazo antes de llegar para saber cómo funciona todo:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a tu guía en Itineramio]</span></p>

              <p><strong>✅ Por favor, confirma que:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Has revisado la guía del alojamiento</li>
                <li>Conoces las normas de la comunidad</li>
                <li>Tienes claro el proceso de check-in</li>
              </ul>

              <p>Respóndenos con un "¡Todo listo!" para saber que has recibido este mensaje.</p>

              <p>Si tienes cualquier duda de última hora, escríbenos.</p>

              <p>¡Buen viaje y hasta mañana!<br/>
              <span className="bg-yellow-100 px-1">[Tu nombre]</span></p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>⚠️ Importante:</strong> Pedir confirmación por escrito te protege ante posibles reclamaciones.
              Si el huésped confirma que ha leído las normas, no podrá decir después que "no lo sabía".
            </p>
          </div>
        </div>

        {/* ============ MENSAJE 3: DÍA SIGUIENTE ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">3</div>
            <h2 className="text-2xl font-bold text-gray-900">Mensaje Día Siguiente (Feedback + Recomendaciones)</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Cuándo enviarlo:</strong> 24 horas después del check-in
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">PLANTILLA</p>
            <div className="text-gray-800 space-y-4 leading-relaxed">
              <p>¡Hola <span className="bg-yellow-100 px-1">[Nombre del huésped]</span>! 😊</p>

              <p>Esperamos que hayas descansado bien en tu primera noche en <span className="bg-yellow-100 px-1">[Nombre del alojamiento]</span>.</p>

              <p>Queríamos preguntarte:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>¿Está todo bien? ¿Has encontrado todo lo que necesitabas?</li>
                <li>¿Hay algo que podamos mejorar o ayudarte con algo?</li>
              </ul>

              <p>Tu opinión nos ayuda a mejorar. Si tienes 1 minuto, nos encantaría que respondieras estás 5 preguntas rápidas:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a Google Form]</span></p>

              <p>Si hay cualquier incidencia, por pequeña que sea, por favor avísanos ahora para poder solucionarla durante tu estancia.</p>

              <p><strong>🍽️ Recomendaciones locales:</strong><br/>
              Por cierto, hemos preparado una sección especial con nuestras recomendaciones de la zona:</p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Los mejores restaurantes</li>
                <li>Dónde tomar algo</li>
                <li>Productos típicos y souvenirs</li>
                <li>Supermercados cercanos</li>
                <li>Lugares de interés</li>
              </ul>
              <p>👉 <span className="bg-yellow-100 px-1">[Enlace a zona Recomendaciones de tu manual]</span></p>

              <p>¡Que disfrutes tu día!<br/>
              <span className="bg-yellow-100 px-1">[Tu nombre]</span></p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-800 mb-3">
              <strong>📝 Preguntas sugeridas para tu Google Form:</strong>
            </p>
            <ol className="list-decimal list-inside text-sm text-green-700 space-y-1">
              <li>¿El apartamento estaba limpio a tu llegada? (1-5 estrellas)</li>
              <li>¿El alojamiento coincide con las fotos y descripción? (Sí/No)</li>
              <li>¿Has podido encontrar todo lo que necesitabas? (Sí/No)</li>
              <li>¿Cómo valorarías la comunicación hasta ahora? (1-5 estrellas)</li>
              <li>¿Hay algo que quieras comentarnos? (Texto libre)</li>
            </ol>
          </div>

          <div className="bg-violet-50 border border-violet-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-violet-800">
              <strong>🍽️ Tu zona de Recomendaciones debe incluir:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-violet-700 mt-2 space-y-1">
              <li>3-5 restaurantes favoritos (con enlaces a Google Maps)</li>
              <li>Bares o cafeterías con encanto</li>
              <li>Tiendas de productos locales</li>
              <li>Supermercados más cercanos (horarios)</li>
              <li>Atracciones turísticas imprescindibles</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Consejo:</strong> Este mensaje es CLAVE. Te da tiempo de reaccionar ante cualquier problema
              antes de que el huésped se vaya enfadado y te deje una mala reseña. Además, las recomendaciones
              demuestran que te importa su experiencia.
            </p>
          </div>
        </div>

        {/* ============ MENSAJE 4: PRE-SALIDA ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-xl">4</div>
            <h2 className="text-2xl font-bold text-gray-900">Mensaje Pre-salida (Día antes del check-out)</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Cuándo enviarlo:</strong> 24 horas antes del check-out
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">PLANTILLA</p>
            <div className="text-gray-800 space-y-4 leading-relaxed">
              <p>¡Hola <span className="bg-yellow-100 px-1">[Nombre del huésped]</span>! 👋</p>

              <p>Esperamos que hayas disfrutado de tu estancia en <span className="bg-yellow-100 px-1">[Nombre del alojamiento]</span>. Ha sido un placer tenerte como huésped.</p>

              <p>Mañana es tu último día. Queremos recordarte algunos detalles importantes:</p>

              <p><strong>🕐 Hora de salida:</strong> Por favor, recuerda que el check-out es antes de las <span className="bg-yellow-100 px-1">[hora de salida]</span>.</p>

              <p><strong>✅ Antes de irte, por favor:</strong></p>
              <ul className="list-disc list-inside ml-4 space-y-1">
                <li>Cierra sesión en Netflix, Spotify u otras apps que hayas usado</li>
                <li>Apaga luces, aire acondicionado/calefacción</li>
                <li>Cierra bien las ventanas</li>
                <li>Deja las llaves <span className="bg-yellow-100 px-1">[ubicación: en la mesa / caja de seguridad / nos las entregas en persona]</span></li>
              </ul>

              <p><strong>🔑 Proceso de check-out:</strong><br/>
              <span className="bg-yellow-100 px-1">[Elige una opción:]</span></p>

              <div className="bg-white border border-gray-200 rounded-lg p-3 my-2 text-sm">
                <p><strong>Opción A:</strong> Pasaré personalmente a despedirme a las <span className="bg-yellow-100 px-1">[hora]</span></p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-3 my-2 text-sm">
                <p><strong>Opción B:</strong> La salida es autónoma. Simplemente deja las llaves <span className="bg-yellow-100 px-1">[ubicación]</span> y cierra la puerta al salir.</p>
              </div>

              <p>En nuestra guía digital tienes todas las instrucciones de check-out y cómo llegar al aeropuerto, estación de tren o autobuses:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a zona Check-out de tu manual]</span></p>

              <p><strong>💬 Tu feedback es muy importante:</strong><br/>
              Si algo no ha sido perfecto, por favor cuéntanoslo. Nuestra intención es mejorar día a día y tu opinión nos ayuda muchísimo.</p>

              <p>¡Gracias por elegirnos y buen viaje de vuelta!<br/>
              <span className="bg-yellow-100 px-1">[Tu nombre]</span></p>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              <strong>🚗 Tu zona de Check-out debe incluir:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-orange-700 mt-2 space-y-1">
              <li>Instrucciones paso a paso del check-out</li>
              <li>Dónde dejar las llaves (con foto)</li>
              <li>Cómo llegar al aeropuerto (taxi, metro, bus)</li>
              <li>Cómo llegar a estación de tren/autobuses</li>
              <li>Consigna de equipaje si salen tarde</li>
            </ul>
          </div>
        </div>

        {/* ============ MENSAJE 5: SOLICITUD DE RESEÑA ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">5</div>
            <h2 className="text-2xl font-bold text-gray-900">Mensaje Solicitud de Reseña (Opcional)</h2>
          </div>
          <p className="text-gray-600 mb-4">
            <strong>Cuándo enviarlo:</strong> 1-2 días después del check-out
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide mb-3 font-medium">PLANTILLA</p>
            <div className="text-gray-800 space-y-4 leading-relaxed">
              <p>¡Hola <span className="bg-yellow-100 px-1">[Nombre del huésped]</span>! 😊</p>

              <p>Esperamos que hayas llegado bien a casa y que guardes un buen recuerdo de tu estancia en <span className="bg-yellow-100 px-1">[ciudad]</span>.</p>

              <p>Ha sido un placer tenerte en <span className="bg-yellow-100 px-1">[Nombre del alojamiento]</span>.</p>

              <p>Si la experiencia ha sido positiva, nos ayudaría muchísimo que compartieras tu opinión en una reseña. Como pequeños anfitriones, cada valoración cuenta mucho para nosotros. ⭐</p>

              <p><strong>🎁 Un regalo para tu próxima visita:</strong><br/>
              Como agradecimiento por ser un huésped ejemplar, queremos ofrecerte un <span className="bg-yellow-100 px-1">[X%]</span> de descuento en tu próxima reserva con nosotros.</p>

              <p>Pronto te enviaremos tu tarjeta de <strong>SuperGuest</strong> con tu código de descuento exclusivo. 🏆</p>

              <p>¡Gracias de nuevo y esperamos verte pronto!<br/>
              <span className="bg-yellow-100 px-1">[Tu nombre]</span></p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-red-800">
              <strong>⚠️ IMPORTANTE - Políticas de Airbnb:</strong>
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
              <li>NUNCA ofrezcas descuentos A CAMBIO de una reseña positiva</li>
              <li>NUNCA pidas explícitamente "5 estrellas"</li>
              <li>El descuento es por ser "buen huésped", no por la reseña</li>
              <li>No condiciones el descuento a que dejen reseña</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>📋 Recurso adicional:</strong> En nuestro hub de recursos tienes la plantilla
              "Significado de las Estrellas" para imprimir y dejar en el alojamiento. Muchos huéspedes
              no saben que 4 estrellas NO te beneficia como anfitrión.
              <br/><br/>
              👉 <strong>itineramio.com/recursos/plantilla-reviews</strong>
            </p>
          </div>
        </div>

        {/* Page break */}
        <div className="page-break"></div>

        {/* ============ RESPUESTAS RÁPIDAS ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">6</div>
            <h2 className="text-2xl font-bold text-gray-900">Respuestas Rápidas Frecuentes</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Configura estás respuestas guardadas en Airbnb para responder en segundos.
          </p>

          {/* Early check-in SI */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⏰</span>
              <h3 className="font-bold text-gray-900">Early Check-in (SI lo ofreces)</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
              <p>¡Genial! Me alegra mucho poder ofrecerte una entrada temprana. 😊</p>
              <p className="mt-2">El early check-in tiene un coste de <span className="bg-yellow-100 px-1">[X€]</span> y está sujeto a disponibilidad según la hora de salida del huésped anterior.</p>
              <p className="mt-2">El día previo a tu llegada te confirmaremos si podemos ofrecértelo y te enviaremos el enlace de pago / lo puedes pagar en efectivo a tu llegada.</p>
              <p className="mt-2">¿Te apunto para el early check-in?</p>
            </div>
          </div>

          {/* Early check-in NO */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">⏰</span>
              <h3 className="font-bold text-gray-900">Early Check-in (NO lo ofreces)</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
              <p>¡Gracias por preguntar! Lamentamos informarte que no estamos ofreciendo early check-in en este momento.</p>
              <p className="mt-2">Sin embargo, tan pronto como tengamos el apartamento listo te avisaremos para que puedas hacer check-in lo antes posible.</p>
              <p className="mt-2">Si llegas antes y necesitas dejar tus maletas, podemos guardarlas nosotros o hay una consigna cerca: <span className="bg-yellow-100 px-1">[enlace consigna]</span></p>
            </div>
          </div>

          {/* Parking */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🅿️</span>
              <h3 className="font-bold text-gray-900">Pregunta sobre parking</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
              <p>¡Buena pregunta! <span className="bg-yellow-100 px-1">[Elige según tu situación:]</span></p>
              <p className="mt-2"><strong>Opción A:</strong> Tenemos plaza de garaje en nuestra urbanización. Son plazas descubiertas y el día de tu llegada te facilitaremos el mando para entrar.</p>
              <p className="mt-2"><strong>Opción B:</strong> No tenemos parking privado, pero hay un parking público muy cerca <span className="bg-yellow-100 px-1">[nombre y precio aprox.]</span></p>
              <p className="mt-2">En nuestra guía del alojamiento tienes toda la información con fotos de la entrada, dirección exacta y número de plaza:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a zona Parking de tu manual]</span></p>
            </div>
          </div>

          {/* WiFi */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">📶</span>
              <h3 className="font-bold text-gray-900">Pregunta sobre WiFi</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
              <p>¡Por supuesto! El WiFi está incluido.</p>
              <p className="mt-2">Encontrarás el nombre de la red y la contraseña en nuestra guía digital:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a zona WiFi de tu manual]</span></p>
              <p className="mt-2">También hay una tarjeta con los datos junto al router en el apartamento.</p>
            </div>
          </div>

          {/* Cómo llegar */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🚗</span>
              <h3 className="font-bold text-gray-900">Cómo llegar</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
              <p>En nuestra guía digital tienes instrucciones detalladas de cómo llegar desde:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Aeropuerto</li>
                <li>Estación de tren</li>
                <li>Estación de autobuses</li>
                <li>En coche (con zona de parking)</li>
              </ul>
              <p className="mt-2">Está disponible en español, inglés y francés:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a zona Cómo Llegar de tu manual]</span></p>
            </div>
          </div>

          {/* Electrodomésticos */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">🔌</span>
              <h3 className="font-bold text-gray-900">Cómo funciona [electrodoméstico]</h3>
            </div>
            <div className="bg-white border border-gray-100 rounded-lg p-4 text-gray-700 text-sm leading-relaxed">
              <p>En nuestra guía digital tienes vídeos e instrucciones de cómo funcionan todos los electrodomésticos del apartamento.</p>
              <p className="mt-2">Aquí tienes el enlace directo:<br/>
              👉 <span className="bg-yellow-100 px-1">[Enlace a la zona específica]</span></p>
              <p className="mt-2">Si después de ver las instrucciones sigues teniendo dudas, escríbenos y te ayudamos.</p>
            </div>
          </div>
        </div>

        {/* Page break */}
        <div className="page-break"></div>

        {/* ============ CÓMO CONFIGURAR ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-xl">7</div>
            <h2 className="text-2xl font-bold text-gray-900">Cómo Configurar los Mensajes</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Airbnb */}
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏠</span>
                <h3 className="text-lg font-bold text-gray-900">En Airbnb</h3>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Mensajes programados:</p>
                  <p>Menú → Anuncios → Tu anuncio → Mensajes programados</p>
                  <p className="text-gray-500 mt-1">Configura cuándo se envían automáticamente (tras reserva, 24h antes, etc.)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Respuestas guardadas:</p>
                  <p>Bandeja de entrada → Icono de rayo ⚡ → Gestionar respuestas</p>
                  <p className="text-gray-500 mt-1">Para responder preguntas frecuentes con un clic</p>
                </div>
                <div className="pt-3 border-t border-rose-200">
                  <p className="font-medium text-rose-700">📖 Tutorial completo:</p>
                  <p className="text-rose-600">itineramio.com/blog/mensajes-automáticos-airbnb</p>
                </div>
              </div>
            </div>

            {/* Booking */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🅱️</span>
                <h3 className="text-lg font-bold text-gray-900">En Booking</h3>
              </div>
              <div className="space-y-4 text-sm text-gray-700">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Mensajes automáticos:</p>
                  <p>Extranet → Buzón → Plantillas de mensajes</p>
                  <p className="text-gray-500 mt-1">Configura mensajes para diferentes momentos de la reserva</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Respuestas rápidas:</p>
                  <p>Buzón → Al responder → Icono de plantilla</p>
                  <p className="text-gray-500 mt-1">Guarda tus respuestas más usadas</p>
                </div>
                <div className="pt-3 border-t border-blue-200">
                  <p className="font-medium text-blue-700">📖 Tutorial completo:</p>
                  <p className="text-blue-600">itineramio.com/blog/mensajes-automáticos-booking</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Guía en Itineramio */}
        <div className="mb-12 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">📱</div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                ¿Qué incluir en tu guía digital de Itineramio?
              </h3>
              <p className="text-gray-600 mb-4">
                Para que los mensajes funcionen, tu guía debe tener estás secciones:
              </p>
              <div className="grid sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>WiFi</strong> - Red y contraseña</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Cómo llegar</strong> - En 3 idiomas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Parking</strong> - Fotos y ubicación</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Check-in</strong> - Instrucciones paso a paso</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Electrodomésticos</strong> - Con vídeos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Normas</strong> - De la comunidad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Basura</strong> - Dónde y cómo reciclar</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  <span><strong>Consigna</strong> - Si no ofreces early check-in</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page break */}
        <div className="page-break"></div>

        {/* ============ PROGRAMA SUPERGUEST ============ */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-xl text-white">8</div>
            <h2 className="text-2xl font-bold text-gray-900">Programa SuperGuest (Fidelización)</h2>
          </div>
          <p className="text-gray-600 mb-6">
            Una estrategia de gamificación para conseguir mejores reseñas y reservas directas sin pedir nada explícitamente.
          </p>

          {/* Qué es */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span>🏆</span> ¿Qué es el Programa SuperGuest?
            </h3>
            <p className="text-gray-700 mb-4">
              Es un sistema de fidelización donde reconoces a los huéspedes que han sido ejemplares durante su estancia.
              Les entregas una "tarjeta de SuperGuest" con un descuento exclusivo para su próxima visita.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="font-medium text-amber-800 mb-2">Beneficios para ti:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Huéspedes más cuidadosos con el alojamiento</li>
                  <li>• Mejores reseñas (sin pedirlas)</li>
                  <li>• Fomenta reservas directas</li>
                  <li>• Crea lealtad y boca a boca</li>
                </ul>
              </div>
              <div className="bg-white rounded-lg p-4 border border-amber-100">
                <p className="font-medium text-amber-800 mb-2">Beneficios para el huésped:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Descuento exclusivo en próxima reserva</li>
                  <li>• Sensación de reconocimiento</li>
                  <li>• Trato preferente</li>
                  <li>• Acceso a ofertas especiales</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cómo funciona */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>⚙️</span> Cómo Funciona
            </h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium text-gray-900">El huésped completa su estancia sin incidencias</p>
                  <p className="text-sm text-gray-600">Cuidó el alojamiento, siguió las normas, comunicación fluida</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium text-gray-900">Le envías el mensaje de solicitud de reseña (Mensaje 5)</p>
                  <p className="text-sm text-gray-600">Mencionas que recibirá su tarjeta de SuperGuest</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium text-gray-900">Generas su tarjeta personalizada</p>
                  <p className="text-sm text-gray-600">Con su nombre y un código de descuento único</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium text-gray-900">Se la envías por WhatsApp o Airbnb</p>
                  <p className="text-sm text-gray-600">El huésped se siente valorado y tiene un incentivo para volver</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ejemplo de tarjeta */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span>🎨</span> Ejemplo de Tarjeta SuperGuest
            </h3>
            <div className="bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 rounded-2xl p-1 max-w-md mx-auto">
              <div className="bg-white rounded-xl p-6 text-center">
                <div className="text-3xl mb-2">🏆</div>
                <h4 className="text-xl font-bold text-gray-900 mb-1">SuperGuest</h4>
                <p className="text-sm text-gray-500 mb-4">Certificado de Huésped Ejemplar</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-600 text-sm">Felicidades</p>
                  <p className="text-2xl font-bold text-gray-900">María García</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <p className="text-amber-700 text-sm">Tu descuento exclusivo</p>
                  <p className="text-4xl font-black text-amber-600">15%</p>
                  <p className="text-amber-700 text-sm">en tu próxima reserva</p>
                </div>
                <div className="text-sm text-gray-500">
                  <p>Código: <span className="font-mono font-bold">SUPER-MARIA15</span></p>
                  <p className="mt-1">Válido contactando directamente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Generador */}
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl">🛠️</div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Genera tu Tarjeta SuperGuest</h3>
                <p className="text-gray-600 mb-3">
                  Hemos creado una herramienta gratuita para que puedas generar tarjetas personalizadas
                  para tus huéspedes en segundos.
                </p>
                <div className="bg-white border border-rose-200 rounded-lg p-4">
                  <p className="font-medium text-rose-700 mb-1">Accede al generador:</p>
                  <p className="text-rose-600 font-bold">itineramio.com/recursos/superguest-generator</p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Solo tienes que introducir el nombre del huésped y el porcentaje de descuento.
                  La tarjeta se genera automáticamente lista para enviar por WhatsApp o Airbnb.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Final */}
        <div className="text-center py-8 border-t border-gray-200">
          <p className="text-gray-500 mb-4">
            Creado por <strong>Itineramio</strong> - Manuales digitales para alojamientos turísticos
          </p>
          <p className="text-gray-400 text-sm">
            ¿Aún no tienes tu guía digital?<br/>
            Prueba gratis en itineramio.com
          </p>
        </div>
      </div>
    </div>
  )
}
