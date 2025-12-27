/ * Zone Content Templates - Professional pre-filled content in ES/EN/FR
 */

export interface ZoneContentStep {
  type: 'text' | 'image' | 'link'
  title: { es: string; en: string; fr: string }
  content: { es: string; en: string; fr: string }
}

export interface ZoneContentTemplate {
  zoneId: string
  steps: ZoneContentStep[]
}

export const zoneContentTemplates: Record<string, ZoneContentTemplate> = {
  // ============================================
  // CHECK-IN (Simplificado - 2 steps)
  // ============================================
  'check-in': {
    zoneId: 'check-in',
    steps: [
      {
        type: 'text',
        title: { es: 'Hora y Acceso', en: 'Time & Access', fr: 'Horaire et Accès' },
        content: {
          es: `🕒 **Entrada desde:** [15:00 h]
⏰ **Early check-in:** Escríbenos y te diremos si es posible.
🌙 **Llegadas tarde:** Sin problema, el acceso es autónomo 24h.
📲 **Importante:** Indícanos tu hora estimada por WhatsApp para tenerlo todo listo.

🎥 **Acceso autónomo:Mira este vídeo donde te mostramos cómo acceder con tu código o recoger la llave del cajetín:
👉 [ENLACE_VIDEO_ACCESO]`,
          en: `🕒 **Check-in from:** [3:00 PM]
⏰ **Early check-in:** Contact us and we'll let you know if it's possible.
🌙 **Late arrivals:** No problem, access is autonomous 24h.
📲 **Important:** Let us know your estimated arrival time via WhatsApp so we can have everything ready.

🎥 **Self check-in:Watch this video showing how to access with your code or pick up the key from the lockbox:
👉 [ACCESS_VIDEO_LINK]`,
          fr: `🕒 **Arrivée à partir de:** [15h00]
⏰ **Early check-in:** Contactez-nous et nous vous dirons si c'est possible.
🌙 **Arrivées tardives:** Pas de problème, l'accès est autonome 24h.
📲 **Important:** Indiquez-nous votre heure d'arrivée estimée par WhatsApp pour que tout soit prêt.

🎥 **Accès autonome:Regardez cette vidéo montrant comment accéder avec votre code ou récupérer la clé dans la boîte:
👉 [LIEN_VIDEO_ACCES]`
        }
      },
      {
        type: 'text',
        title: { es: '¿Cómo llegar?', en: 'How to get there?', fr: 'Comment y arriver?' },
        content: {
          es: `📍 **Dirección:[CALLE Y NÚMERO]
[CÓDIGO POSTAL, CIUDAD]

🏢 **Identifica el edificio por:• Fachada color [COLOR]
• Portal nº [X]
• [Referencia visual: ej. junto a farmacia]

🔗 **Google Maps:** [ENLACE_GOOGLE_MAPS]
🚖 **Para el taxista:** "[DIRECCIÓN SIMPLIFICADA]"

---

✅ **¡Listo!** Solo necesitas estas 2 secciones:
1. Saber **cuándo y cómo entras** con tu código o llave.
2. **Cómo encontrar el edificio** fácilmente.

📘 Todo lo demás (WiFi, electrodomésticos, normas, etc.) está explicado paso a paso en tu manual digital:
👉 [URL_MANUAL_ITINERAMIO]`,
          en: `📍 **Address:[STREET AND NUMBER]
[POSTAL CODE, CITY]

🏢 **Identify the building by:• [COLOR] facade
• Entrance no. [X]
• [Visual reference: e.g. next to pharmacy]

🔗 **Google Maps:** [GOOGLE_MAPS_LINK]
🚖 **For the taxi driver:** "[SIMPLIFIED ADDRESS]"

---

✅ **All set!** You only need these 2 sections:
1. Know **when and how to enter** with your code or key.
2. **How to find the building** easily.

📘 Everything else (WiFi, appliances, rules, etc.) is explained step by step in your digital manual:
👉 [ITINERAMIO_MANUAL_URL]`,
          fr: `📍 **Adresse:[RUE ET NUMÉRO]
[CODE POSTAL, VILLE]

🏢 **Identifiez l'immeuble par:• Façade couleur [COULEUR]
• Entrée nº [X]
• [Référence visuelle: ex. à côté de la pharmacie]

🔗 **Google Maps:** [LIEN_GOOGLE_MAPS]
🚖 **Pour le chauffeur de taxi:** "[ADRESSE SIMPLIFIÉE]"

---

✅ **C'est prêt!** Vous n'avez besoin que de ces 2 sections:
1. Savoir **quand et comment entrer** avec votre code ou clé.
2. **Comment trouver l'immeuble** facilement.

📘 Tout le reste (WiFi, appareils, règles, etc.) est expliqué étape par étape dans votre manuel digital:
👉 [URL_MANUEL_ITINERAMIO]`
        }
      }
    ]
  },

  // ============================================
  // CHECK-OUT
  // ============================================
  'check-out': {
    zoneId: 'check-out',
    steps: [
      {
        type: 'text',
        title: { es: 'Hora de salida', en: 'Check-out time', fr: 'Heure de départ' },
        content: {
          es: `**Hora de salida:** Antes de las [11:00] h

⏰ **¿Necesitas salir más tarde?Consúltanos con 24h de antelación. Según disponibilidad:
- Hasta las 13:00h: [X]€
- Hasta las 15:00h: [X]€

📦 **¿Tienes equipaje?Si tu vuelo es más tarde, puedes dejar las maletas en [UBICACIÓN] hasta las [HORA].`,
          en: `**Check-out time:** Before [11:00 AM]

⏰ **Need a late check-out?Ask us 24h in advance. Subject to availability:
- Until 1:00 PM: [X]€
- Until 3:00 PM: [X]€

📦 **Have luggage?If your flight is later, you can leave bags at [LOCATION] until [TIME].`,
          fr: `**Heure de départ:** Avant [11h00]

⏰ **Besoin de partir plus tard?Demandez-nous 24h à l'avance. Selon disponibilité:
- Jusqu'à 13h00: [X]€
- Jusqu'à 15h00: [X]€

📦 **Vous avez des bagages?Si votre vol est plus tard, vous pouvez laisser vos valises à [EMPLACEMENT] jusqu'à [HEURE].`
        }
      },
      {
        type: 'text',
        title: { es: 'Checklist antes de salir', en: 'Checklist before leaving', fr: 'Checklist avant de partir' },
        content: {
          es: `✅ **Por favor, antes de irte:
**Imprescindible:☐ Cierra todas las ventanas
☐ Apaga luces, TV y aire acondicionado/calefacción
☐ Cierra los grifos
☐ [INSTRUCCIONES LLAVES/CÓDIGO]

**Ayúdanos (no obligatorio):☐ Deja la basura en los contenedores de la calle
☐ Deja los platos sucios en el fregadero (sin lavar)
☐ Deja las toallas usadas en la bañera/ducha
☐ Retira sábanas de la cama

❌ **NO hace falta:- Hacer las camas
- Limpiar el apartamento
- Pasar la aspiradora`,
          en: `✅ **Please, before leaving:
**Essential:☐ Close all windows
☐ Turn off lights, TV and AC/heating
☐ Close taps
☐ [KEY/CODE INSTRUCTIONS]

**Help us (not mandatory):☐ Take trash to street containers
☐ Leave dirty dishes in sink (unwashed)
☐ Leave used towels in bathtub/shower
☐ Remove sheets from bed

❌ **NO need to:- Make beds
- Clean the apartment
- Vacuum`,
          fr: `✅ **S'il vous plaît, avant de partir:
**Essentiel:☐ Fermez toutes les fenêtres
☐ Éteignez lumières, TV et climatisation/chauffage
☐ Fermez les robinets
☐ [INSTRUCTIONS CLÉS/CODE]

**Aidez-nous (pas obligatoire):☐ Mettez les poubelles dans les conteneurs de la rue
☐ Laissez la vaisselle sale dans l'évier
☐ Laissez les serviettes utilisées dans la baignoire/douche
☐ Retirez les draps du lit

❌ **PAS besoin de:- Faire les lits
- Nettoyer l'appartement
- Passer l'aspirateur`
        }
      },
      {
        type: 'text',
        title: { es: 'Llaves y cierre', en: 'Keys and locking', fr: 'Clés et fermeture' },
        content: {
          es: `🔑 **¿Qué hacer con las llaves?
**Opción A - Cerradura con código:Simplemente cierra la puerta al salir. El código se desactivará automáticamente.

**Opción B - Llaves físicas:Déjalas en [UBICACIÓN: ej. caja de seguridad, encima de la mesa].
Código de la caja: [CÓDIGO]

**Opción C - Entrega en mano:Coordina con nosotros la entrega en el portal.

🚪 **Para cerrar la puerta:Tira de ella hasta escuchar el clic. Comprueba que ha quedado cerrada.

📱 **Confirma tu salida** enviándonos un WhatsApp. ¡Nos encantará saber que todo fue bien!`,
          en: `🔑 **What to do with the keys?
**Option A - Code lock:Simply close the door when leaving. The code will deactivate automatically.

**Option B - Physical keys:Leave them at [LOCATION: e.g. safe box, on the table].
Box code: [CODE]

**Option C - Hand delivery:Coordinate with us for delivery at the entrance.

🚪 **To close the door:Pull it until you hear the click. Check that it's locked.

📱 **Confirm your departure** by sending us a WhatsApp. We'd love to know everything went well!`,
          fr: `🔑 **Que faire avec les clés?
**Option A - Serrure à code:Fermez simplement la porte en partant. Le code se désactivera automatiquement.

**Option B - Clés physiques:Laissez-les à [EMPLACEMENT: ex. coffre-fort, sur la table].
Code du coffre: [CODE]

**Option C - Remise en main:Coordonnez avec nous la remise à l'entrée.

🚪 **Pour fermer la porte:Tirez-la jusqu'à entendre le clic. Vérifiez qu'elle est fermée.

📱 **Confirmez votre départ** en nous envoyant un WhatsApp!`
        }
      },
      {
        type: 'text',
        title: { es: '¡Gracias por tu estancia!', en: 'Thank you for staying!', fr: 'Merci pour votre séjour!' },
        content: {
          es: `🙏 **¡Gracias por elegirnos!
Esperamos que hayas disfrutado de tu estancia. Tu opinión es muy importante para nosotros.

⭐ **¿Nos dejas una reseña?Si tu experiencia ha sido positiva, te agradeceríamos mucho una reseña en [AIRBNB/BOOKING/GOOGLE].

🔄 **¿Vuelves pronto?Contacta directamente con nosotros para obtener un [X]% de descuento en tu próxima reserva.

📸 **Síguenos en Instagram:** @[TU_INSTAGRAM]

¡Buen viaje de vuelta! 🛫`,
          en: `🙏 **Thank you for choosing us!
We hope you enjoyed your stay. Your opinion is very important to us.

⭐ **Would you leave us a review?If your experience was positive, we'd really appreciate a review on [AIRBNB/BOOKING/GOOGLE].

🔄 **Coming back soon?Contact us directly for a [X]% discount on your next booking.

📸 **Follow us on Instagram:** @[YOUR_INSTAGRAM]

Have a safe trip back! 🛫`,
          fr: `🙏 **Merci de nous avoir choisis!
Nous espérons que vous avez apprécié votre séjour. Votre avis est très important pour nous.

⭐ **Vous nous laissez un avis?Si votre expérience a été positive, nous apprécierions un avis sur [AIRBNB/BOOKING/GOOGLE].

🔄 **Vous revenez bientôt?Contactez-nous directement pour obtenir [X]% de réduction sur votre prochaine réservation.

📸 **Suivez-nous sur Instagram:** @[VOTRE_INSTAGRAM]

Bon voyage de retour! 🛫`
        }
      }
    ]
  },

  // ============================================
  // WIFI
  // ============================================
  'wifi': {
    zoneId: 'wifi',
    steps: [
      {
        type: 'text',
        title: { es: 'Datos de conexión', en: 'Connection details', fr: 'Détails de connexion' },
        content: {
          es: `📶 **Red WiFi:** [NOMBRE_RED]
🔑 **Contraseña:** [CONTRASEÑA]

También hay una tarjeta con el código QR del WiFi en [UBICACIÓN].

**Velocidad:** [X] Mbps - suficiente para streaming en HD y videollamadas.`,
          en: `📶 **WiFi Network:** [NETWORK_NAME]
🔑 **Password:** [PASSWORD]

There's also a WiFi QR code card at [LOCATION].

**Speed:** [X] Mbps - enough for HD streaming and video calls.`,
          fr: `📶 **Réseau WiFi:** [NOM_RÉSEAU]
🔑 **Mot de passe:** [MOT_DE_PASSE]

Il y a aussi une carte QR code WiFi à [EMPLACEMENT].

**Vitesse:** [X] Mbps - suffisant pour le streaming HD et les appels vidéo.`
        }
      },
      {
        type: 'text',
        title: { es: 'Solución de problemas', en: 'Troubleshooting', fr: 'Dépannage' },
        content: {
          es: `**Si no conecta:
1. ✅ Verifica mayúsculas/minúsculas de la contraseña
2. ✅ Olvida la red y vuelve a conectar
3. ✅ Activa/desactiva el modo avión
4. ✅ Reinicia el router (botón trasero, espera 2 min)

**Router ubicado en:** [UBICACIÓN]

Si persiste el problema, contáctanos.`,
          en: `**If it doesn't connect:
1. ✅ Check password capitalization
2. ✅ Forget network and reconnect
3. ✅ Toggle airplane mode
4. ✅ Restart router (back button, wait 2 min)

**Router located at:** [LOCATION]

If the problem persists, contact us.`,
          fr: `**Si ça ne se connecte pas:
1. ✅ Vérifiez les majuscules/minuscules du mot de passe
2. ✅ Oubliez le réseau et reconnectez-vous
3. ✅ Activez/désactivez le mode avion
4. ✅ Redémarrez le routeur (bouton arrière, attendez 2 min)

**Routeur situé à:** [EMPLACEMENT]

Si le problème persiste, contactez-nous.`
        }
      }
    ]
  },

  // ============================================
  // HOUSE RULES
  // ============================================
  'house-rules': {
    zoneId: 'house-rules',
    steps: [
      {
        type: 'text',
        title: { es: 'Normas principales', en: 'Main rules', fr: 'Règles principales' },
        content: {
          es: `Para una convivencia agradable:

🚭 **No fumar** - Interior y terraza/balcón
🎉 **No fiestas** - Ni reuniones ruidosas
🔇 **Silencio** - 22:00 a 08:00
👥 **Capacidad máxima:** [X] personas
🐾 **Mascotas:** [Sí/No] [condiciones]
👶 **Niños:** Bienvenidos, hay [equipamiento disponible]`,
          en: `For pleasant coexistence:

🚭 **No smoking** - Inside and terrace/balcony
🎉 **No parties** - Or noisy gatherings
🔇 **Quiet hours** - 10 PM to 8 AM
👥 **Max capacity:** [X] people
🐾 **Pets:** [Yes/No] [conditions]
👶 **Children:** Welcome, we have [available equipment]`,
          fr: `Pour une cohabitation agréable:

🚭 **Non fumeur** - Intérieur et terrasse/balcon
🎉 **Pas de fêtes** - Ni réunions bruyantes
🔇 **Heures de silence** - 22h à 8h
👥 **Capacité max:** [X] personnes
🐾 **Animaux:** [Oui/Non] [conditions]
👶 **Enfants:** Bienvenus, nous avons [équipement disponible]`
        }
      },
      {
        type: 'text',
        title: { es: 'Respeto a los vecinos', en: 'Neighbor respect', fr: 'Respect des voisins' },
        content: {
          es: `🏢 Vivimos en comunidad de vecinos:

• Volumen moderado (especialmente de noche)
• Cierra puertas sin golpear
• Usa el ascensor con cuidado
• No uses tacones en interior (hay zapatillas)
• Habla bajo en zonas comunes

El incumplimiento repetido puede suponer la finalización de la estancia.`,
          en: `🏢 We live in a residential building:

• Keep volume moderate (especially at night)
• Close doors without slamming
• Use elevator carefully
• Don't wear heels inside (slippers available)
• Speak quietly in common areas

Repeated violations may result in stay termination.`,
          fr: `🏢 Nous vivons dans un immeuble résidentiel:

• Volume modéré (surtout la nuit)
• Fermez les portes sans claquer
• Utilisez l'ascenseur avec soin
• Pas de talons à l'intérieur (chaussons disponibles)
• Parlez doucement dans les zones communes

Les violations répétées peuvent entraîner la fin du séjour.`
        }
      },
      {
        type: 'text',
        title: { es: 'Cuidado del apartamento', en: 'Apartment care', fr: 'Soin de l\'appartement' },
        content: {
          es: `🏠 **Cuida el espacio como si fuera tuyo:
• No muevas muebles pesados
• Usa posavasos para bebidas
• No dejes ventanas abiertas si llueve
• Reporta cualquier daño inmediatamente
• No tires objetos por el WC (solo papel)

**Depósito de seguridad:Se devolverá íntegro si no hay daños ni incidencias.`,
          en: `🏠 **Take care of the space as if it were yours:
• Don't move heavy furniture
• Use coasters for drinks
• Don't leave windows open if raining
• Report any damage immediately
• Don't flush objects down toilet (only paper)

**Security deposit:Will be fully refunded if no damages or incidents.`,
          fr: `🏠 **Prenez soin de l'espace comme s'il était le vôtre:
• Ne déplacez pas les meubles lourds
• Utilisez des sous-verres
• Ne laissez pas les fenêtres ouvertes s'il pleut
• Signalez tout dommage immédiatement
• Ne jetez pas d'objets dans les WC

**Dépôt de garantie:Sera intégralement remboursé sans dommages ni incidents.`
        }
      }
    ]
  },

  // ============================================
  // EMERGENCY CONTACTS
  // ============================================
  'emergency-contacts': {
    zoneId: 'emergency-contacts',
    steps: [
      {
        type: 'text',
        title: { es: 'Tu anfitrión', en: 'Your host', fr: 'Votre hôte' },
        content: {
          es: `👤 **Anfitrión:** [NOMBRE]
📱 **WhatsApp/Tel:** [NÚMERO]
📧 **Email:** [EMAIL]

⏰ **Horario de atención:** 9:00-22:00
🆘 **Urgencias:** Disponible 24h

Respondo normalmente en menos de 30 minutos.`,
          en: `👤 **Host:** [NAME]
📱 **WhatsApp/Phone:** [NUMBER]
📧 **Email:** [EMAIL]

⏰ **Support hours:** 9 AM - 10 PM
🆘 **Emergencies:** Available 24h

I usually respond within 30 minutes.`,
          fr: `👤 **Hôte:** [NOM]
📱 **WhatsApp/Tél:** [NUMÉRO]
📧 **Email:** [EMAIL]

⏰ **Heures de support:** 9h-22h
🆘 **Urgences:** Disponible 24h

Je réponds généralement en moins de 30 minutes.`
        }
      },
      {
        type: 'text',
        title: { es: 'Emergencias', en: 'Emergencies', fr: 'Urgences' },
        content: {
          es: `🚨 **EMERGENCIAS GENERALES:** 112

📞 **Servicios específicos:• Policía Nacional: 091
• Policía Local: 092
• Bomberos: 080
• Urgencias médicas: 061

🏥 **Hospital más cercano:[NOMBRE] - [DIRECCIÓN]
📍 A [X] minutos andando/en coche

💊 **Farmacia 24h más cercana:[NOMBRE] - [DIRECCIÓN]`,
          en: `🚨 **GENERAL EMERGENCIES:** 112

📞 **Specific services:• National Police: 091
• Local Police: 092
• Fire Department: 080
• Medical Emergencies: 061

🏥 **Nearest hospital:[NAME] - [ADDRESS]
📍 [X] minutes walking/by car

💊 **Nearest 24h pharmacy:[NAME] - [ADDRESS]`,
          fr: `🚨 **URGENCES GÉNÉRALES:** 112

📞 **Services spécifiques:• Police Nationale: 091
• Police Locale: 092
• Pompiers: 080
• Urgences médicales: 061

🏥 **Hôpital le plus proche:[NOM] - [ADRESSE]
📍 À [X] minutes à pied/en voiture

💊 **Pharmacie 24h la plus proche:[NOM] - [ADRESSE]`
        }
      },
      {
        type: 'text',
        title: { es: 'Problemas en el apartamento', en: 'Apartment problems', fr: 'Problèmes dans l\'appartement' },
        content: {
          es: `🔧 **Problemas comunes y soluciones:
**💡 Se va la luz:Cuadro eléctrico en [UBICACIÓN]. Sube los interruptores que estén bajados.

**🚿 No hay agua caliente:Espera 2 min con el grifo abierto. Si no, revisa el calentador en [UBICACIÓN].

**🚽 WC atascado:Desatascador en [UBICACIÓN].

**🔑 No puedo abrir la puerta:Llámame inmediatamente: [TELÉFONO]

⚠️ **Nunca intentes reparar algo por tu cuenta. Contáctanos primero.**`,
          en: `🔧 **Common problems and solutions:
**💡 Power goes out:Electrical panel at [LOCATION]. Flip up any tripped switches.

**🚿 No hot water:Wait 2 min with tap running. If not, check water heater at [LOCATION].

**🚽 Toilet clogged:Plunger at [LOCATION].

**🔑 Can't open the door:Call me immediately: [PHONE]

⚠️ **Never try to fix something yourself. Contact us first.**`,
          fr: `🔧 **Problèmes courants et solutions:
**💡 Coupure de courant:Tableau électrique à [EMPLACEMENT]. Remontez les interrupteurs.

**🚿 Pas d'eau chaude:Attendez 2 min avec le robinet ouvert. Sinon, vérifiez le chauffe-eau à [EMPLACEMENT].

**🚽 WC bouché:Ventouse à [EMPLACEMENT].

**🔑 Je ne peux pas ouvrir la porte:Appelez-moi immédiatement: [TÉLÉPHONE]

⚠️ **N'essayez jamais de réparer quelque chose vous-même. Contactez-nous d'abord.**`
        }
      }
    ]
  },

  // ============================================
  // PARKING
  // ============================================
  'parking': {
    zoneId: 'parking',
    steps: [
      {
        type: 'text',
        title: { es: 'Tu plaza de parking', en: 'Your parking spot', fr: 'Votre place de parking' },
        content: {
          es: `🚗 **Plaza número:** [NÚMERO]
📍 **Ubicación:** [DIRECCIÓN/EDIFICIO]
🏢 **Planta:** [PLANTA]

**Dimensiones:• Largo: [X] m
• Ancho: [X] m
• Alto máximo: [X] m

⚠️ **Importante:** [Apto/No apto] para SUV o furgonetas.`,
          en: `🚗 **Spot number:** [NUMBER]
📍 **Location:** [ADDRESS/BUILDING]
🏢 **Floor:** [FLOOR]

**Dimensions:• Length: [X] m
• Width: [X] m
• Max height: [X] m

⚠️ **Important:** [Suitable/Not suitable] for SUV or vans.`,
          fr: `🚗 **Numéro de place:** [NUMÉRO]
📍 **Emplacement:** [ADRESSE/BÂTIMENT]
🏢 **Étage:** [ÉTAGE]

**Dimensions:• Longueur: [X] m
• Largeur: [X] m
• Hauteur max: [X] m

⚠️ **Important:** [Adapté/Non adapté] aux SUV ou camionnettes.`
        }
      },
      {
        type: 'text',
        title: { es: 'Cómo acceder', en: 'How to access', fr: 'Comment accéder' },
        content: {
          es: `🚙 **Entrada del parking:[DIRECCIÓN DE ENTRADA]

**Para entrar:1. [MANDO/CÓDIGO/TARJETA]: [DETALLES]
2. La puerta tarda ~[X] segundos en abrirse
3. Tu plaza está a la [IZQUIERDA/DERECHA], fila [X]

**Para salir:[INSTRUCCIONES DE SALIDA]

📍 **Google Maps entrada:** [ENLACE]`,
          en: `🚙 **Parking entrance:[ENTRANCE ADDRESS]

**To enter:1. [REMOTE/CODE/CARD]: [DETAILS]
2. Gate takes ~[X] seconds to open
3. Your spot is on the [LEFT/RIGHT], row [X]

**To exit:[EXIT INSTRUCTIONS]

📍 **Google Maps entrance:** [LINK]`,
          fr: `🚙 **Entrée du parking:[ADRESSE D'ENTRÉE]

**Pour entrer:1. [TÉLÉCOMMANDE/CODE/CARTE]: [DÉTAILS]
2. La porte met ~[X] secondes à s'ouvrir
3. Votre place est à [GAUCHE/DROITE], rangée [X]

**Pour sortir:[INSTRUCTIONS DE SORTIE]

📍 **Google Maps entrée:** [LIEN]`
        }
      }
    ]
  },

  // ============================================
  // HEATING / CLIMATIZACIÓN
  // ============================================
  'heating': {
    zoneId: 'heating',
    steps: [
      {
        type: 'text',
        title: { es: 'Aire acondicionado / Calefacción', en: 'Air conditioning / Heating', fr: 'Climatisation / Chauffage' },
        content: {
          es: `🌡️ **Termostato/Mando:** [UBICACIÓN]

**❄️ Para enfriar:1. Enciende con botón ON
2. Modo: ❄️ (COOL)
3. Temperatura recomendada: 24-25°C

**☀️ Para calentar:1. Enciende con botón ON
2. Modo: ☀️ (HEAT)
3. Temperatura recomendada: 20-22°C

⚠️ **Apágalo al salir o abrir ventanas.**`,
          en: `🌡️ **Thermostat/Remote:** [LOCATION]

**❄️ To cool:1. Turn on with ON button
2. Mode: ❄️ (COOL)
3. Recommended temp: 24-25°C / 75-77°F

**☀️ To heat:1. Turn on with ON button
2. Mode: ☀️ (HEAT)
3. Recommended temp: 20-22°C / 68-72°F

⚠️ **Turn off when leaving or opening windows.**`,
          fr: `🌡️ **Thermostat/Télécommande:** [EMPLACEMENT]

**❄️ Pour refroidir:1. Allumez avec le bouton ON
2. Mode: ❄️ (COOL)
3. Température recommandée: 24-25°C

**☀️ Pour chauffer:1. Allumez avec le bouton ON
2. Mode: ☀️ (HEAT)
3. Température recommandée: 20-22°C

⚠️ **Éteignez en partant ou en ouvrant les fenêtres.**`
        }
      },
      {
        type: 'text',
        title: { es: 'Consejos de uso', en: 'Usage tips', fr: 'Conseils d\'utilisation' },
        content: {
          es: `💡 **Para máxima eficiencia:
• Cierra ventanas y puertas cuando esté encendido
• Usa las persianas/cortinas en las horas de más calor
• No pongas temperaturas extremas (16°C o 30°C)
• Por la noche, usa el modo SLEEP si lo tiene

🔇 **¿Hace ruido?Es normal un leve zumbido. Si es excesivo, contáctanos.

🧹 **Filtros:Si notas que enfría/calienta menos de lo normal, avísanos.`,
          en: `💡 **For maximum efficiency:
• Close windows and doors when it's on
• Use blinds/curtains during hottest hours
• Don't set extreme temperatures (16°C or 30°C)
• At night, use SLEEP mode if available

🔇 **Making noise?A slight hum is normal. If excessive, contact us.

🧹 **Filters:If it's cooling/heating less than normal, let us know.`,
          fr: `💡 **Pour une efficacité maximale:
• Fermez fenêtres et portes quand c'est allumé
• Utilisez stores/rideaux aux heures chaudes
• Ne mettez pas de températures extrêmes
• La nuit, utilisez le mode SLEEP si disponible

🔇 **Fait du bruit?Un léger bourdonnement est normal. Si excessif, contactez-nous.

🧹 **Filtres:S'il refroidit/chauffe moins que d'habitude, prévenez-nous.`
        }
      }
    ]
  },

  // ============================================
  // RECYCLING / BASURA
  // ============================================
  'recycling': {
    zoneId: 'recycling',
    steps: [
      {
        type: 'text',
        title: { es: 'Separación de residuos', en: 'Waste separation', fr: 'Tri des déchets' },
        content: {
          es: `♻️ **Por favor, separa la basura:
🟡 **Amarillo:** Plásticos, latas, envases, bricks
🟢 **Verde:** Vidrio (botellas, tarros)
🔵 **Azul:** Papel y cartón
⚫ **Gris/Marrón:** Orgánico y resto

🛒 **Bolsas:** Debajo del fregadero o en [UBICACIÓN]`,
          en: `♻️ **Please separate your waste:
🟡 **Yellow:** Plastics, cans, packaging, cartons
🟢 **Green:** Glass (bottles, jars)
🔵 **Blue:** Paper and cardboard
⚫ **Gray/Brown:** Organic and general waste

🛒 **Bags:** Under the sink or at [LOCATION]`,
          fr: `♻️ **Veuillez séparer vos déchets:
🟡 **Jaune:** Plastiques, canettes, emballages
🟢 **Vert:** Verre (bouteilles, pots)
🔵 **Bleu:** Papier et carton
⚫ **Gris/Marron:** Organique et reste

🛒 **Sacs:** Sous l'évier ou à [EMPLACEMENT]`
        }
      },
      {
        type: 'text',
        title: { es: 'Dónde tirar la basura', en: 'Where to dispose', fr: 'Où jeter' },
        content: {
          es: `📍 **Contenedores más cercanos:[UBICACIÓN - ej: Esquina de calle X con calle Y]

🗓️ **Horarios de recogida:• Resto: Todos los días [HORA]
• Reciclaje: [DÍAS Y HORA]

⚠️ **Importante:• No dejes bolsas en el rellano
• Baja la basura antes del check-out
• El vidrio solo de 8:00 a 22:00 (hace ruido)`,
          en: `📍 **Nearest containers:[LOCATION - e.g.: Corner of X street and Y street]

🗓️ **Collection schedule:• General: Every day [TIME]
• Recycling: [DAYS AND TIME]

⚠️ **Important:• Don't leave bags in hallway
• Take trash out before check-out
• Glass only 8 AM - 10 PM (it's noisy)`,
          fr: `📍 **Conteneurs les plus proches:[EMPLACEMENT - ex: Coin de la rue X et rue Y]

🗓️ **Horaires de collecte:• Général: Tous les jours [HEURE]
• Recyclage: [JOURS ET HEURE]

⚠️ **Important:• Ne laissez pas de sacs dans le couloir
• Sortez les poubelles avant le check-out
• Le verre seulement de 8h à 22h (bruyant)`
        }
      }
    ]
  },

  // ============================================
  // DIRECTIONS / CÓMO LLEGAR (NEW)
  // ============================================
  'directions': {
    zoneId: 'directions',
    steps: [
      {
        type: 'text',
        title: { es: 'Desde el aeropuerto', en: 'From the airport', fr: 'Depuis l\'aéroport' },
        content: {
          es: `✈️ **Aeropuerto de [NOMBRE]
🚕 **Taxi:• Duración: ~[X] minutos
• Precio aprox: [X]€
• Dile al taxista: "[DIRECCIÓN]"

🚇 **Metro/Tren:• Línea [X] hasta [ESTACIÓN]
• Transbordo a línea [X] hasta [ESTACIÓN_FINAL]
• Duración: ~[X] minutos | Precio: [X]€

🚌 **Autobús:• Línea [X] - Parada [NOMBRE]
• Duración: ~[X] minutos | Precio: [X]€

📱 **Apps recomendadas:** Uber, Cabify, [OTRAS]`,
          en: `✈️ **[NAME] Airport
🚕 **Taxi:• Duration: ~[X] minutes
• Approx price: [X]€
• Tell driver: "[ADDRESS]"

🚇 **Metro/Train:• Line [X] to [STATION]
• Transfer to line [X] to [FINAL_STATION]
• Duration: ~[X] min | Price: [X]€

🚌 **Bus:• Line [X] - Stop [NAME]
• Duration: ~[X] min | Price: [X]€

📱 **Recommended apps:** Uber, Cabify, [OTHERS]`,
          fr: `✈️ **Aéroport de [NOM]
🚕 **Taxi:• Durée: ~[X] minutes
• Prix approx: [X]€
• Dites au chauffeur: "[ADRESSE]"

🚇 **Métro/Train:• Ligne [X] jusqu'à [STATION]
• Correspondance ligne [X] jusqu'à [STATION_FINALE]
• Durée: ~[X] min | Prix: [X]€

🚌 **Bus:• Ligne [X] - Arrêt [NOM]
• Durée: ~[X] min | Prix: [X]€

📱 **Apps recommandées:** Uber, Cabify, [AUTRES]`
        }
      },
      {
        type: 'text',
        title: { es: 'Desde la estación de tren/bus', en: 'From train/bus station', fr: 'Depuis la gare' },
        content: {
          es: `🚂 **Estación de [NOMBRE]
🚶 **Andando:** [X] minutos
📍 Ruta: [DESCRIPCIÓN BREVE]

🚇 **Metro:** Línea [X], [X] paradas hasta [ESTACIÓN]

🚕 **Taxi:** ~[X] minutos, ~[X]€

📍 **Google Maps:** [ENLACE]`,
          en: `🚂 **[NAME] Station
🚶 **Walking:** [X] minutes
📍 Route: [BRIEF DESCRIPTION]

🚇 **Metro:** Line [X], [X] stops to [STATION]

🚕 **Taxi:** ~[X] minutes, ~[X]€

📍 **Google Maps:** [LINK]`,
          fr: `🚂 **Gare de [NOM]
🚶 **À pied:** [X] minutes
📍 Route: [DESCRIPTION BRÈVE]

🚇 **Métro:** Ligne [X], [X] arrêts jusqu'à [STATION]

🚕 **Taxi:** ~[X] minutes, ~[X]€

📍 **Google Maps:** [LIEN]`
        }
      },
      {
        type: 'text',
        title: { es: 'En coche', en: 'By car', fr: 'En voiture' },
        content: {
          es: `🚗 **Dirección GPS:[DIRECCIÓN COMPLETA]

**Coordenadas:** [LATITUD], [LONGITUD]

📍 **Google Maps:** [ENLACE]
📍 **Waze:** [ENLACE]

🅿️ **Parking:** [VER SECCIÓN PARKING / NO INCLUIDO]

⚠️ **Zona de tráfico restringido:** [SÍ/NO - detalles]`,
          en: `🚗 **GPS Address:[FULL ADDRESS]

**Coordinates:** [LATITUDE], [LONGITUDE]

📍 **Google Maps:** [LINK]
📍 **Waze:** [LINK]

🅿️ **Parking:** [SEE PARKING SECTION / NOT INCLUDED]

⚠️ **Restricted traffic zone:** [YES/NO - details]`,
          fr: `🚗 **Adresse GPS:[ADRESSE COMPLÈTE]

**Coordonnées:** [LATITUDE], [LONGITUDE]

📍 **Google Maps:** [LIEN]
📍 **Waze:** [LIEN]

🅿️ **Parking:** [VOIR SECTION PARKING / NON INCLUS]

⚠️ **Zone de trafic restreint:** [OUI/NON - détails]`
        }
      }
    ]
  },

  // ============================================
  // PUBLIC TRANSPORT (NEW)
  // ============================================
  'public-transport': {
    zoneId: 'public-transport',
    steps: [
      {
        type: 'text',
        title: { es: 'Metro y cercanías', en: 'Metro and trains', fr: 'Métro et trains' },
        content: {
          es: `🚇 **Estación más cercana:** [NOMBRE]
📍 A [X] minutos andando

**Líneas disponibles:• Línea [X] - [COLOR]: hacia [DESTINOS]
• Línea [X] - [COLOR]: hacia [DESTINOS]

**Horarios:• L-J: 6:00 - 23:30
• V-S: 6:00 - 02:00
• Dom: 7:00 - 23:30

💳 **Precio billete sencillo:** [X]€
📱 **App recomendada:** [NOMBRE_APP]`,
          en: `🚇 **Nearest station:** [NAME]
📍 [X] minutes walking

**Available lines:• Line [X] - [COLOR]: towards [DESTINATIONS]
• Line [X] - [COLOR]: towards [DESTINATIONS]

**Schedule:• Mon-Thu: 6 AM - 11:30 PM
• Fri-Sat: 6 AM - 2 AM
• Sun: 7 AM - 11:30 PM

💳 **Single ticket price:** [X]€
📱 **Recommended app:** [APP_NAME]`,
          fr: `🚇 **Station la plus proche:** [NOM]
📍 À [X] minutes à pied

**Lignes disponibles:• Ligne [X] - [COULEUR]: vers [DESTINATIONS]
• Ligne [X] - [COULEUR]: vers [DESTINATIONS]

**Horaires:• Lun-Jeu: 6h - 23h30
• Ven-Sam: 6h - 2h
• Dim: 7h - 23h30

💳 **Prix billet simple:** [X]€
📱 **App recommandée:** [NOM_APP]`
        }
      },
      {
        type: 'text',
        title: { es: 'Autobús', en: 'Bus', fr: 'Bus' },
        content: {
          es: `🚌 **Paradas cercanas:
**Parada [NOMBRE]** - [X] metros
• Línea [X]: [DESTINO]
• Línea [X]: [DESTINO]

**Frecuencia:** Cada [X] minutos

**Bus nocturno:** Línea N[X] desde [UBICACIÓN]

💳 **Precio:** [X]€ (mismo billete que metro)`,
          en: `🚌 **Nearby stops:
**Stop [NAME]** - [X] meters
• Line [X]: [DESTINATION]
• Line [X]: [DESTINATION]

**Frequency:** Every [X] minutes

**Night bus:** Line N[X] from [LOCATION]

💳 **Price:** [X]€ (same ticket as metro)`,
          fr: `🚌 **Arrêts proches:
**Arrêt [NOM]** - [X] mètres
• Ligne [X]: [DESTINATION]
• Ligne [X]: [DESTINATION]

**Fréquence:** Toutes les [X] minutes

**Bus de nuit:** Ligne N[X] depuis [EMPLACEMENT]

💳 **Prix:** [X]€ (même billet que le métro)`
        }
      },
      {
        type: 'text',
        title: { es: 'Otras opciones', en: 'Other options', fr: 'Autres options' },
        content: {
          es: `🚕 **Taxi:• App: [NOMBRE_APP_LOCAL]
• Teléfono: [NÚMERO]
• Tarifa base: [X]€

🚲 **Bicicletas públicas:• Sistema: [NOMBRE]
• Estación más cercana: [UBICACIÓN]
• Precio: [X]€/viaje

🛴 **Patinetes eléctricos:• Apps disponibles: Lime, Tier, [OTRAS]
• Precio aprox: [X]€/min`,
          en: `🚕 **Taxi:• App: [LOCAL_APP_NAME]
• Phone: [NUMBER]
• Base fare: [X]€

🚲 **Public bikes:• System: [NAME]
• Nearest station: [LOCATION]
• Price: [X]€/trip

🛴 **Electric scooters:• Available apps: Lime, Tier, [OTHERS]
• Approx price: [X]€/min`,
          fr: `🚕 **Taxi:• App: [NOM_APP_LOCALE]
• Téléphone: [NUMÉRO]
• Tarif de base: [X]€

🚲 **Vélos publics:• Système: [NOM]
• Station la plus proche: [EMPLACEMENT]
• Prix: [X]€/trajet

🛴 **Trottinettes électriques:• Apps disponibles: Lime, Tier, [AUTRES]
• Prix approx: [X]€/min`
        }
      }
    ]
  },

  // ============================================
  // RECOMMENDATIONS (NEW)
  // ============================================
  'recommendations': {
    zoneId: 'recommendations',
    steps: [
      {
        type: 'text',
        title: { es: 'Restaurantes', en: 'Restaurants', fr: 'Restaurants' },
        content: {
          es: `🍽️ **Nuestras recomendaciones:
**[NOMBRE 1]** ⭐ Favorito
📍 [DIRECCIÓN] | 💰 [€/€€/€€€]
🍴 [TIPO DE COCINA]
💡 [ESPECIALIDAD O TIP]

**[NOMBRE 2]📍 [DIRECCIÓN] | 💰 [€/€€/€€€]
🍴 [TIPO DE COCINA]

**[NOMBRE 3]📍 [DIRECCIÓN] | 💰 [€/€€/€€€]
🍴 [TIPO DE COCINA]

📱 **Reservas:** TheFork, OpenTable`,
          en: `🍽️ **Our recommendations:
**[NAME 1]** ⭐ Favorite
📍 [ADDRESS] | 💰 [€/€€/€€€]
🍴 [CUISINE TYPE]
💡 [SPECIALTY OR TIP]

**[NAME 2]📍 [ADDRESS] | 💰 [€/€€/€€€]
🍴 [CUISINE TYPE]

**[NAME 3]📍 [ADDRESS] | 💰 [€/€€/€€€]
🍴 [CUISINE TYPE]

📱 **Reservations:** TheFork, OpenTable`,
          fr: `🍽️ **Nos recommandations:
**[NOM 1]** ⭐ Favori
📍 [ADRESSE] | 💰 [€/€€/€€€]
🍴 [TYPE DE CUISINE]
💡 [SPÉCIALITÉ OU CONSEIL]

**[NOM 2]📍 [ADRESSE] | 💰 [€/€€/€€€]
🍴 [TYPE DE CUISINE]

**[NOM 3]📍 [ADRESSE] | 💰 [€/€€/€€€]
🍴 [TYPE DE CUISINE]

📱 **Réservations:** TheFork, OpenTable`
        }
      },
      {
        type: 'text',
        title: { es: 'Qué ver y hacer', en: 'Things to see and do', fr: 'À voir et à faire' },
        content: {
          es: `🏛️ **Imprescindibles:
**[ATRACCIÓN 1]📍 A [X] min andando | 🎫 [PRECIO]
⏰ [HORARIO]
💡 [TIP: ej. compra entrada online]

**[ATRACCIÓN 2]📍 A [X] min en metro | 🎫 [PRECIO]

**[ATRACCIÓN 3]📍 A [X] min | 🎫 [PRECIO]

🚶 **Tours recomendados:• [NOMBRE TOUR] - [WEB/APP]`,
          en: `🏛️ **Must-sees:
**[ATTRACTION 1]📍 [X] min walking | 🎫 [PRICE]
⏰ [HOURS]
💡 [TIP: e.g. buy tickets online]

**[ATTRACTION 2]📍 [X] min by metro | 🎫 [PRICE]

**[ATTRACTION 3]📍 [X] min | 🎫 [PRICE]

🚶 **Recommended tours:• [TOUR NAME] - [WEB/APP]`,
          fr: `🏛️ **Incontournables:
**[ATTRACTION 1]📍 À [X] min à pied | 🎫 [PRIX]
⏰ [HORAIRES]
💡 [CONSEIL: ex. achetez en ligne]

**[ATTRACTION 2]📍 À [X] min en métro | 🎫 [PRIX]

**[ATTRACTION 3]📍 À [X] min | 🎫 [PRIX]

🚶 **Tours recommandés:• [NOM DU TOUR] - [WEB/APP]`
        }
      },
      {
        type: 'text',
        title: { es: 'Supermercados y tiendas', en: 'Supermarkets and shops', fr: 'Supermarchés et magasins' },
        content: {
          es: `🛒 **Supermercados cercanos:
**[NOMBRE]** - [X] metros
⏰ [HORARIO]

**[NOMBRE]** - [X] metros
⏰ [HORARIO]

🥖 **Panadería:** [NOMBRE] - [UBICACIÓN]
💊 **Farmacia:** [NOMBRE] - [UBICACIÓN]
🏧 **Cajero:** [BANCO] - [UBICACIÓN]

🛍️ **Zona comercial:** [NOMBRE] a [X] min`,
          en: `🛒 **Nearby supermarkets:
**[NAME]** - [X] meters
⏰ [HOURS]

**[NAME]** - [X] meters
⏰ [HOURS]

🥖 **Bakery:** [NAME] - [LOCATION]
💊 **Pharmacy:** [NAME] - [LOCATION]
🏧 **ATM:** [BANK] - [LOCATION]

🛍️ **Shopping area:** [NAME] [X] min away`,
          fr: `🛒 **Supermarchés à proximité:
**[NOM]** - [X] mètres
⏰ [HORAIRES]

**[NOM]** - [X] mètres
⏰ [HORAIRES]

🥖 **Boulangerie:** [NOM] - [EMPLACEMENT]
💊 **Pharmacie:** [NOM] - [EMPLACEMENT]
🏧 **Distributeur:** [BANQUE] - [EMPLACEMENT]

🛍️ **Zone commerciale:** [NOM] à [X] min`
        }
      }
    ]
  },

  // ============================================
  // APPLIANCES (TV, Coffee, Washing, Dishwasher)
  // ============================================
  'tv': {
    zoneId: 'tv',
    steps: [
      {
        type: 'text',
        title: { es: 'Smart TV', en: 'Smart TV', fr: 'Smart TV' },
        content: {
          es: `📺 **Mando:** [UBICACIÓN]

**Para encender:** Botón rojo de power

**Apps disponibles:• Netflix, YouTube, Prime Video
• [OTRAS APPS]

💡 **Usa tu cuenta personal** para acceder a tu contenido.

**Si no enciende:** Comprueba que el enchufe está conectado y prueba el botón de la TV.`,
          en: `📺 **Remote:** [LOCATION]

**To turn on:** Red power button

**Available apps:• Netflix, YouTube, Prime Video
• [OTHER APPS]

💡 **Use your personal account** to access your content.

**If it won't turn on:** Check plug is connected and try the TV button.`,
          fr: `📺 **Télécommande:** [EMPLACEMENT]

**Pour allumer:** Bouton rouge power

**Apps disponibles:• Netflix, YouTube, Prime Video
• [AUTRES APPS]

💡 **Utilisez votre compte personnel** pour accéder à votre contenu.

**Si ça ne s'allume pas:** Vérifiez que la prise est branchée.`
        }
      }
    ]
  },

  'coffee-machine': {
    zoneId: 'coffee-machine',
    steps: [
      {
        type: 'text',
        title: { es: 'Cafetera', en: 'Coffee machine', fr: 'Machine à café' },
        content: {
          es: `☕ **Tipo:** [NESPRESSO/DOLCE GUSTO/ITALIANA/FILTRO]
📍 **Ubicación:** [UBICACIÓN]

**Cápsulas/Café:** En [UBICACIÓN]

**Instrucciones:1. Llena el depósito de agua
2. [INSTRUCCIONES ESPECÍFICAS]
3. Coloca tu taza
4. Pulsa el botón

⚠️ **Vacía el depósito de cápsulas usadas cuando esté lleno.**`,
          en: `☕ **Type:** [NESPRESSO/DOLCE GUSTO/ITALIAN/FILTER]
📍 **Location:** [LOCATION]

**Capsules/Coffee:** At [LOCATION]

**Instructions:1. Fill water tank
2. [SPECIFIC INSTRUCTIONS]
3. Place your cup
4. Press button

⚠️ **Empty used capsule container when full.**`,
          fr: `☕ **Type:** [NESPRESSO/DOLCE GUSTO/ITALIENNE/FILTRE]
📍 **Emplacement:** [EMPLACEMENT]

**Capsules/Café:** À [EMPLACEMENT]

**Instructions:1. Remplissez le réservoir d'eau
2. [INSTRUCTIONS SPÉCIFIQUES]
3. Placez votre tasse
4. Appuyez sur le bouton

⚠️ **Videz le bac à capsules usagées quand il est plein.**`
        }
      }
    ]
  },

  'washing-machine': {
    zoneId: 'washing-machine',
    steps: [
      {
        type: 'text',
        title: { es: 'Lavadora', en: 'Washing machine', fr: 'Machine à laver' },
        content: {
          es: `🧺 **Ubicación:** [UBICACIÓN]
🧴 **Detergente:** [UBICACIÓN]

**Pasos:1. Carga la ropa (no llenes más del 80%)
2. Añade detergente (cajón compartimento II)
3. Cierra la puerta firmemente
4. Programa recomendado: [NÚMERO/NOMBRE]
5. Pulsa inicio

⏱️ **Duración:** ~[X] minutos
⚠️ **No dejes ropa mojada dentro** al terminar.`,
          en: `🧺 **Location:** [LOCATION]
🧴 **Detergent:** [LOCATION]

**Steps:1. Load clothes (don't fill more than 80%)
2. Add detergent (drawer compartment II)
3. Close door firmly
4. Recommended program: [NUMBER/NAME]
5. Press start

⏱️ **Duration:** ~[X] minutes
⚠️ **Don't leave wet clothes inside** when done.`,
          fr: `🧺 **Emplacement:** [EMPLACEMENT]
🧴 **Lessive:** [EMPLACEMENT]

**Étapes:1. Chargez le linge (pas plus de 80%)
2. Ajoutez la lessive (bac compartiment II)
3. Fermez la porte fermement
4. Programme recommandé: [NUMÉRO/NOM]
5. Appuyez sur démarrer

⏱️ **Durée:** ~[X] minutes
⚠️ **Ne laissez pas le linge mouillé dedans.**`
        }
      }
    ]
  },

  'dishwasher': {
    zoneId: 'dishwasher',
    steps: [
      {
        type: 'text',
        title: { es: 'Lavavajillas', en: 'Dishwasher', fr: 'Lave-vaisselle' },
        content: {
          es: `🍽️ **Ubicación:** [UBICACIÓN]
💊 **Pastillas:** [UBICACIÓN]

**Pasos:1. Aclara restos grandes de comida
2. Coloca sin que se toquen las piezas
3. Pon una pastilla en el compartimento
4. Programa: ECO o Normal
5. Cierra y pulsa inicio

⚠️ **No uses jabón de manos ni lavavajillas líquido.**`,
          en: `🍽️ **Location:** [LOCATION]
💊 **Tablets:** [LOCATION]

**Steps:1. Rinse off large food residue
2. Arrange without pieces touching
3. Put tablet in compartment
4. Program: ECO or Normal
5. Close and press start

⚠️ **Don't use hand soap or liquid dish soap.**`,
          fr: `🍽️ **Emplacement:** [EMPLACEMENT]
💊 **Tablettes:** [EMPLACEMENT]

**Étapes:1. Rincez les gros résidus
2. Disposez sans que les pièces se touchent
3. Mettez une tablette dans le compartiment
4. Programme: ECO ou Normal
5. Fermez et appuyez sur démarrer

⚠️ **N'utilisez pas de savon ni de liquide vaisselle.**`
        }
      }
    ]
  },

  'air-conditioning': {
    zoneId: 'air-conditioning',
    steps: [
      {
        type: 'text',
        title: { es: 'Aire acondicionado', en: 'Air conditioning', fr: 'Climatisation' },
        content: {
          es: `❄️ **Mando:** [UBICACIÓN]

**Para enfriar:1. Botón ON
2. Modo ❄️ (COOL)
3. Temperatura: 24-25°C

**Modos útiles:• AUTO: Ajusta solo
• SLEEP: Para dormir
• FAN: Solo ventilador

⚠️ **Apaga al salir o abrir ventanas.**`,
          en: `❄️ **Remote:** [LOCATION]

**To cool:1. ON button
2. ❄️ mode (COOL)
3. Temperature: 24-25°C / 75-77°F

**Useful modes:• AUTO: Self-adjusts
• SLEEP: For sleeping
• FAN: Fan only

⚠️ **Turn off when leaving or opening windows.**`,
          fr: `❄️ **Télécommande:** [EMPLACEMENT]

**Pour refroidir:1. Bouton ON
2. Mode ❄️ (COOL)
3. Température: 24-25°C

**Modes utiles:• AUTO: S'ajuste seul
• SLEEP: Pour dormir
• FAN: Ventilateur seul

⚠️ **Éteignez en partant ou en ouvrant les fenêtres.**`
        }
      }
    ]
  }
}

// Helper functions
export function getZoneContentTemplate(zoneId: string): ZoneContentTemplate | null {
  return zoneContentTemplates[zoneId] || null
}

export function hasContentTemplate(zoneId: string): boolean {
  return zoneId in zoneContentTemplates
}

export function getZonesWithTemplates(): string[] {
  return Object.keys(zoneContentTemplates)
}
