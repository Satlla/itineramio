/**
 * Zone Content Templates
 *
 * Pre-filled content for zones in ES/EN/FR
 * Users just need to replace [PLACEHOLDERS] with their data
 */

export interface ZoneContentStep {
  type: 'text' | 'image' | 'link'
  title: {
    es: string
    en: string
    fr: string
  }
  content: {
    es: string
    en: string
    fr: string
  }
}

export interface ZoneContentTemplate {
  zoneId: string
  steps: ZoneContentStep[]
}

export const zoneContentTemplates: Record<string, ZoneContentTemplate> = {
  // ============================================
  // WIFI
  // ============================================
  'wifi': {
    zoneId: 'wifi',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Conexión WiFi',
          en: 'WiFi Connection',
          fr: 'Connexion WiFi'
        },
        content: {
          es: `**Red:** [NOMBRE_DE_TU_RED]
**Contraseña:** [TU_CONTRASEÑA]

También encontrarás una tarjeta con el código QR del WiFi en la entrada del apartamento.`,
          en: `**Network:** [YOUR_NETWORK_NAME]
**Password:** [YOUR_PASSWORD]

You'll also find a WiFi QR code card at the apartment entrance.`,
          fr: `**Réseau:** [NOM_DE_VOTRE_RÉSEAU]
**Mot de passe:** [VOTRE_MOT_DE_PASSE]

Vous trouverez également une carte avec le QR code WiFi à l'entrée de l'appartement.`
        }
      },
      {
        type: 'text',
        title: {
          es: 'Si no conecta',
          en: 'If it doesn\'t connect',
          fr: 'Si ça ne fonctionne pas'
        },
        content: {
          es: `1. Verifica que escribes la contraseña exactamente (mayúsculas y minúsculas importan)
2. Si sigue sin funcionar, reinicia el router pulsando el botón de reset en la parte trasera
3. Espera 2 minutos a que se reinicie
4. Vuelve a intentar conectarte

Si el problema persiste, contáctanos.`,
          en: `1. Make sure you type the password exactly (it's case-sensitive)
2. If it still doesn't work, restart the router by pressing the reset button on the back
3. Wait 2 minutes for it to restart
4. Try connecting again

If the problem persists, contact us.`,
          fr: `1. Vérifiez que vous tapez le mot de passe exactement (sensible à la casse)
2. Si ça ne fonctionne toujours pas, redémarrez le routeur en appuyant sur le bouton reset à l'arrière
3. Attendez 2 minutes pour le redémarrage
4. Réessayez de vous connecter

Si le problème persiste, contactez-nous.`
        }
      }
    ]
  },

  // ============================================
  // CHECK-IN
  // ============================================
  'check-in': {
    zoneId: 'check-in',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Dirección',
          en: 'Address',
          fr: 'Adresse'
        },
        content: {
          es: `**Dirección completa:**
[TU_DIRECCIÓN_COMPLETA]

El edificio tiene fachada [COLOR], el portal es el número [NÚMERO].

📍 [Abrir en Google Maps](TU_ENLACE_GOOGLE_MAPS)`,
          en: `**Full address:**
[YOUR_FULL_ADDRESS]

The building has a [COLOR] facade, the entrance is number [NUMBER].

📍 [Open in Google Maps](YOUR_GOOGLE_MAPS_LINK)`,
          fr: `**Adresse complète:**
[VOTRE_ADRESSE_COMPLÈTE]

L'immeuble a une façade [COULEUR], l'entrée est le numéro [NUMÉRO].

📍 [Ouvrir dans Google Maps](VOTRE_LIEN_GOOGLE_MAPS)`
        }
      },
      {
        type: 'text',
        title: {
          es: 'Cómo entrar',
          en: 'How to enter',
          fr: 'Comment entrer'
        },
        content: {
          es: `**1. Portal**
Código: [CÓDIGO_PORTAL]
Introduce el código y pulsa el botón verde.

**2. Subir al apartamento**
Ascensor a la [IZQUIERDA/DERECHA] nada más entrar.
Planta [NÚMERO_PLANTA].
Puerta [LETRA/NÚMERO] ([IZQUIERDA/DERECHA] saliendo del ascensor).

**3. Abrir la puerta**
Tu código personal: [CÓDIGO_CERRADURA]
Introduce el código, espera al pitido, y después gira el pomo hacia abajo.`,
          en: `**1. Building entrance**
Code: [ENTRANCE_CODE]
Enter the code and press the green button.

**2. Going up to the apartment**
Elevator on the [LEFT/RIGHT] as you enter.
Floor [FLOOR_NUMBER].
Door [LETTER/NUMBER] ([LEFT/RIGHT] exiting the elevator).

**3. Opening the door**
Your personal code: [LOCK_CODE]
Enter the code, wait for the beep, then turn the handle down.`,
          fr: `**1. Entrée de l'immeuble**
Code: [CODE_ENTRÉE]
Entrez le code et appuyez sur le bouton vert.

**2. Monter à l'appartement**
Ascenseur sur la [GAUCHE/DROITE] en entrant.
Étage [NUMÉRO_ÉTAGE].
Porte [LETTRE/NUMÉRO] ([GAUCHE/DROITE] en sortant de l'ascenseur).

**3. Ouvrir la porte**
Votre code personnel: [CODE_SERRURE]
Entrez le code, attendez le bip, puis tournez la poignée vers le bas.`
        }
      },
      {
        type: 'text',
        title: {
          es: 'Vídeo de cómo abrir',
          en: 'How to open video',
          fr: 'Vidéo comment ouvrir'
        },
        content: {
          es: `Mira este vídeo corto si tienes dudas sobre cómo abrir la puerta:

[ENLACE_A_TU_VIDEO]

**Importante:** Introduce el código y espera 1-2 segundos antes de girar el pomo.`,
          en: `Watch this short video if you're unsure how to open the door:

[LINK_TO_YOUR_VIDEO]

**Important:** Enter the code and wait 1-2 seconds before turning the handle.`,
          fr: `Regardez cette courte vidéo si vous avez des doutes sur comment ouvrir la porte:

[LIEN_VERS_VOTRE_VIDÉO]

**Important:** Entrez le code et attendez 1-2 secondes avant de tourner la poignée.`
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
        title: {
          es: 'Hora de salida',
          en: 'Check-out time',
          fr: 'Heure de départ'
        },
        content: {
          es: `**Hora de salida:** Antes de las [HORA] h

Si necesitas salir más tarde, consúltanos con antelación y veremos si es posible.`,
          en: `**Check-out time:** Before [TIME]

If you need a late check-out, please ask us in advance and we'll see if it's possible.`,
          fr: `**Heure de départ:** Avant [HEURE] h

Si vous avez besoin de partir plus tard, demandez-nous à l'avance et nous verrons si c'est possible.`
        }
      },
      {
        type: 'text',
        title: {
          es: 'Antes de salir',
          en: 'Before leaving',
          fr: 'Avant de partir'
        },
        content: {
          es: `Por favor, antes de irte:

✓ Cierra todas las ventanas
✓ Apaga las luces y el aire acondicionado/calefacción
✓ Deja las llaves [DÓNDE_DEJAR_LLAVES]
✓ Asegúrate de que la puerta queda bien cerrada
✓ Baja la basura al contenedor de la calle

¡No hace falta que hagas las camas ni laves los platos!`,
          en: `Please, before you leave:

✓ Close all windows
✓ Turn off lights and AC/heating
✓ Leave the keys [WHERE_TO_LEAVE_KEYS]
✓ Make sure the door is properly closed
✓ Take the trash to the street container

No need to make the beds or wash dishes!`,
          fr: `S'il vous plaît, avant de partir:

✓ Fermez toutes les fenêtres
✓ Éteignez les lumières et la climatisation/chauffage
✓ Laissez les clés [OÙ_LAISSER_LES_CLÉS]
✓ Assurez-vous que la porte est bien fermée
✓ Descendez les poubelles au conteneur de la rue

Pas besoin de faire les lits ni de laver la vaisselle!`
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
        title: {
          es: 'Normas básicas',
          en: 'Basic rules',
          fr: 'Règles de base'
        },
        content: {
          es: `Para garantizar una estancia agradable para todos:

🚭 **No fumar** dentro del apartamento
🎉 **No fiestas** ni reuniones con ruido excesivo
🔇 **Horario de silencio** de 22:00 a 08:00
👥 **Máximo [NÚMERO] personas** pueden alojarse
🐾 **Mascotas:** [PERMITIDAS/NO PERMITIDAS]`,
          en: `To ensure a pleasant stay for everyone:

🚭 **No smoking** inside the apartment
🎉 **No parties** or gatherings with excessive noise
🔇 **Quiet hours** from 10:00 PM to 8:00 AM
👥 **Maximum [NUMBER] guests** can stay
🐾 **Pets:** [ALLOWED/NOT ALLOWED]`,
          fr: `Pour garantir un séjour agréable pour tous:

🚭 **Interdiction de fumer** à l'intérieur
🎉 **Pas de fêtes** ni de réunions bruyantes
🔇 **Heures de silence** de 22h00 à 08h00
👥 **Maximum [NOMBRE] personnes** peuvent séjourner
🐾 **Animaux:** [AUTORISÉS/NON AUTORISÉS]`
        }
      },
      {
        type: 'text',
        title: {
          es: 'Respeto a los vecinos',
          en: 'Respect for neighbors',
          fr: 'Respect des voisins'
        },
        content: {
          es: `Vivimos en una comunidad de vecinos. Por favor:

• Mantén un volumen moderado, especialmente por la noche
• Cierra la puerta sin dar portazos
• No uses tacones en el interior (tenemos zapatillas disponibles)
• Si subes con maletas, usa el ascensor con cuidado

¡Gracias por tu colaboración!`,
          en: `We live in a residential building. Please:

• Keep the volume moderate, especially at night
• Close the door without slamming
• Don't wear heels inside (we have slippers available)
• If bringing luggage, use the elevator carefully

Thank you for your cooperation!`,
          fr: `Nous vivons dans un immeuble résidentiel. S'il vous plaît:

• Maintenez un volume modéré, surtout la nuit
• Fermez la porte sans claquer
• Ne portez pas de talons à l'intérieur (nous avons des chaussons disponibles)
• Si vous montez avec des bagages, utilisez l'ascenseur avec précaution

Merci de votre coopération!`
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
        title: {
          es: 'Contacto del anfitrión',
          en: 'Host contact',
          fr: 'Contact de l\'hôte'
        },
        content: {
          es: `**Tu anfitrión:** [TU_NOMBRE]
**Teléfono/WhatsApp:** [TU_TELÉFONO]
**Email:** [TU_EMAIL]

Puedes contactarme en cualquier momento si tienes algún problema.`,
          en: `**Your host:** [YOUR_NAME]
**Phone/WhatsApp:** [YOUR_PHONE]
**Email:** [YOUR_EMAIL]

You can contact me anytime if you have any issues.`,
          fr: `**Votre hôte:** [VOTRE_NOM]
**Téléphone/WhatsApp:** [VOTRE_TÉLÉPHONE]
**Email:** [VOTRE_EMAIL]

Vous pouvez me contacter à tout moment si vous avez un problème.`
        }
      },
      {
        type: 'text',
        title: {
          es: 'Emergencias',
          en: 'Emergencies',
          fr: 'Urgences'
        },
        content: {
          es: `**Emergencias generales:** 112
**Policía Nacional:** 091
**Bomberos:** 080
**Urgencias médicas:** 061

**Hospital más cercano:**
[NOMBRE_HOSPITAL]
[DIRECCIÓN_HOSPITAL]

**Farmacia 24h más cercana:**
[NOMBRE_FARMACIA]
[DIRECCIÓN_FARMACIA]`,
          en: `**General emergencies:** 112
**National Police:** 091
**Fire department:** 080
**Medical emergencies:** 061

**Nearest hospital:**
[HOSPITAL_NAME]
[HOSPITAL_ADDRESS]

**Nearest 24h pharmacy:**
[PHARMACY_NAME]
[PHARMACY_ADDRESS]`,
          fr: `**Urgences générales:** 112
**Police Nationale:** 091
**Pompiers:** 080
**Urgences médicales:** 061

**Hôpital le plus proche:**
[NOM_HÔPITAL]
[ADRESSE_HÔPITAL]

**Pharmacie 24h la plus proche:**
[NOM_PHARMACIE]
[ADRESSE_PHARMACIE]`
        }
      }
    ]
  },

  // ============================================
  // HEATING
  // ============================================
  'heating': {
    zoneId: 'heating',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Cómo usar la calefacción',
          en: 'How to use the heating',
          fr: 'Comment utiliser le chauffage'
        },
        content: {
          es: `**Termostato ubicado en:** [UBICACIÓN]

**Para encender:**
1. Pulsa el botón de encendido
2. Selecciona la temperatura deseada (recomendamos 20-22°C)
3. Espera unos minutos a que se caliente

**Para apagar:**
Pulsa el botón de apagado o baja la temperatura a 15°C.

⚠️ Por favor, apaga la calefacción cuando salgas del apartamento.`,
          en: `**Thermostat located at:** [LOCATION]

**To turn on:**
1. Press the power button
2. Select desired temperature (we recommend 20-22°C / 68-72°F)
3. Wait a few minutes for it to warm up

**To turn off:**
Press the off button or lower the temperature to 15°C / 59°F.

⚠️ Please turn off the heating when you leave the apartment.`,
          fr: `**Thermostat situé à:** [EMPLACEMENT]

**Pour allumer:**
1. Appuyez sur le bouton d'alimentation
2. Sélectionnez la température souhaitée (nous recommandons 20-22°C)
3. Attendez quelques minutes pour qu'il chauffe

**Pour éteindre:**
Appuyez sur le bouton d'arrêt ou baissez la température à 15°C.

⚠️ Veuillez éteindre le chauffage lorsque vous quittez l'appartement.`
        }
      }
    ]
  },

  // ============================================
  // AIR CONDITIONING
  // ============================================
  'air-conditioning': {
    zoneId: 'air-conditioning',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Cómo usar el aire acondicionado',
          en: 'How to use the air conditioning',
          fr: 'Comment utiliser la climatisation'
        },
        content: {
          es: `**Mando ubicado en:** [UBICACIÓN]

**Para enfriar:**
1. Pulsa el botón de encendido en el mando
2. Selecciona el modo ❄️ (copo de nieve)
3. Ajusta la temperatura (recomendamos 24-25°C)

**Para calentar (si está disponible):**
1. Selecciona el modo ☀️ (sol)
2. Ajusta la temperatura deseada

⚠️ Por favor, apaga el aire acondicionado cuando salgas o abras las ventanas.`,
          en: `**Remote located at:** [LOCATION]

**To cool:**
1. Press the power button on the remote
2. Select ❄️ mode (snowflake)
3. Adjust temperature (we recommend 24-25°C / 75-77°F)

**To heat (if available):**
1. Select ☀️ mode (sun)
2. Adjust desired temperature

⚠️ Please turn off the AC when you leave or open windows.`,
          fr: `**Télécommande située à:** [EMPLACEMENT]

**Pour refroidir:**
1. Appuyez sur le bouton d'alimentation de la télécommande
2. Sélectionnez le mode ❄️ (flocon de neige)
3. Réglez la température (nous recommandons 24-25°C)

**Pour chauffer (si disponible):**
1. Sélectionnez le mode ☀️ (soleil)
2. Réglez la température souhaitée

⚠️ Veuillez éteindre la climatisation lorsque vous sortez ou ouvrez les fenêtres.`
        }
      }
    ]
  },

  // ============================================
  // WASHING MACHINE
  // ============================================
  'washing-machine': {
    zoneId: 'washing-machine',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Cómo usar la lavadora',
          en: 'How to use the washing machine',
          fr: 'Comment utiliser la machine à laver'
        },
        content: {
          es: `**Ubicación:** [UBICACIÓN]
**Detergente:** Encontrarás detergente en [UBICACIÓN_DETERGENTE]

**Pasos:**
1. Introduce la ropa (no la llenes demasiado)
2. Añade detergente en el cajón (compartimento II)
3. Cierra la puerta firmemente
4. Selecciona el programa:
   • Ropa normal: Programa [NÚMERO/NOMBRE]
   • Ropa delicada: Programa [NÚMERO/NOMBRE]
5. Pulsa el botón de inicio

⏱️ El programa normal dura aproximadamente [X] minutos.`,
          en: `**Location:** [LOCATION]
**Detergent:** You'll find detergent at [DETERGENT_LOCATION]

**Steps:**
1. Put in the laundry (don't overfill)
2. Add detergent in the drawer (compartment II)
3. Close the door firmly
4. Select the program:
   • Normal clothes: Program [NUMBER/NAME]
   • Delicates: Program [NUMBER/NAME]
5. Press the start button

⏱️ The normal program takes approximately [X] minutes.`,
          fr: `**Emplacement:** [EMPLACEMENT]
**Lessive:** Vous trouverez de la lessive à [EMPLACEMENT_LESSIVE]

**Étapes:**
1. Mettez le linge (ne surchargez pas)
2. Ajoutez la lessive dans le bac (compartiment II)
3. Fermez la porte fermement
4. Sélectionnez le programme:
   • Vêtements normaux: Programme [NUMÉRO/NOM]
   • Délicats: Programme [NUMÉRO/NOM]
5. Appuyez sur le bouton de démarrage

⏱️ Le programme normal dure environ [X] minutes.`
        }
      }
    ]
  },

  // ============================================
  // DISHWASHER
  // ============================================
  'dishwasher': {
    zoneId: 'dishwasher',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Cómo usar el lavavajillas',
          en: 'How to use the dishwasher',
          fr: 'Comment utiliser le lave-vaisselle'
        },
        content: {
          es: `**Ubicación:** [UBICACIÓN]
**Pastillas:** Encontrarás pastillas en [UBICACIÓN_PASTILLAS]

**Pasos:**
1. Aclara los restos grandes de comida de los platos
2. Coloca la vajilla sin que se toquen las piezas
3. Pon una pastilla en el compartimento del detergente
4. Cierra la puerta
5. Selecciona el programa ECO o Normal
6. Pulsa inicio

💡 No uses jabón de manos ni lavavajillas líquido de fregar.`,
          en: `**Location:** [LOCATION]
**Tablets:** You'll find tablets at [TABLETS_LOCATION]

**Steps:**
1. Rinse off large food residue from dishes
2. Arrange dishes without them touching each other
3. Put a tablet in the detergent compartment
4. Close the door
5. Select the ECO or Normal program
6. Press start

💡 Don't use hand soap or liquid dish soap.`,
          fr: `**Emplacement:** [EMPLACEMENT]
**Tablettes:** Vous trouverez des tablettes à [EMPLACEMENT_TABLETTES]

**Étapes:**
1. Rincez les gros résidus de nourriture des assiettes
2. Disposez la vaisselle sans qu'elle se touche
3. Mettez une tablette dans le compartiment à détergent
4. Fermez la porte
5. Sélectionnez le programme ECO ou Normal
6. Appuyez sur démarrer

💡 N'utilisez pas de savon pour les mains ni de liquide vaisselle.`
        }
      }
    ]
  },

  // ============================================
  // RECYCLING
  // ============================================
  'recycling': {
    zoneId: 'recycling',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Separación de residuos',
          en: 'Waste separation',
          fr: 'Tri des déchets'
        },
        content: {
          es: `Por favor, separa la basura:

🟡 **Contenedor amarillo:** Plásticos, latas, envases
🟢 **Contenedor verde:** Vidrio
🔵 **Contenedor azul:** Papel y cartón
⚫ **Contenedor gris/marrón:** Restos orgánicos y basura general

**Ubicación de los contenedores:**
[UBICACIÓN_CONTENEDORES]

Encontrarás bolsas para reciclar debajo del fregadero.`,
          en: `Please separate your waste:

🟡 **Yellow container:** Plastics, cans, packaging
🟢 **Green container:** Glass
🔵 **Blue container:** Paper and cardboard
⚫ **Gray/Brown container:** Organic waste and general trash

**Container location:**
[CONTAINER_LOCATION]

You'll find recycling bags under the sink.`,
          fr: `Veuillez séparer vos déchets:

🟡 **Conteneur jaune:** Plastiques, canettes, emballages
🟢 **Conteneur vert:** Verre
🔵 **Conteneur bleu:** Papier et carton
⚫ **Conteneur gris/marron:** Déchets organiques et ordures générales

**Emplacement des conteneurs:**
[EMPLACEMENT_CONTENEURS]

Vous trouverez des sacs de recyclage sous l'évier.`
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
        title: {
          es: 'Información del parking',
          en: 'Parking information',
          fr: 'Informations sur le parking'
        },
        content: {
          es: `**Ubicación:** [UBICACIÓN_PARKING]
**Número de plaza:** [NÚMERO_PLAZA]

**Cómo acceder:**
1. [INSTRUCCIONES_ACCESO]
2. Código/mando: [CÓDIGO_O_MANDO]

**Dimensiones de la plaza:**
Longitud: [X] m | Anchura: [X] m | Altura máxima: [X] m

⚠️ Por favor, aparca dentro de las líneas marcadas.`,
          en: `**Location:** [PARKING_LOCATION]
**Parking spot number:** [SPOT_NUMBER]

**How to access:**
1. [ACCESS_INSTRUCTIONS]
2. Code/remote: [CODE_OR_REMOTE]

**Spot dimensions:**
Length: [X] m | Width: [X] m | Maximum height: [X] m

⚠️ Please park within the marked lines.`,
          fr: `**Emplacement:** [EMPLACEMENT_PARKING]
**Numéro de place:** [NUMÉRO_PLACE]

**Comment accéder:**
1. [INSTRUCTIONS_ACCÈS]
2. Code/télécommande: [CODE_OU_TÉLÉCOMMANDE]

**Dimensions de la place:**
Longueur: [X] m | Largeur: [X] m | Hauteur maximale: [X] m

⚠️ Veuillez vous garer dans les lignes marquées.`
        }
      }
    ]
  },

  // ============================================
  // TV / SMART TV
  // ============================================
  'tv': {
    zoneId: 'tv',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Cómo usar la Smart TV',
          en: 'How to use the Smart TV',
          fr: 'Comment utiliser la Smart TV'
        },
        content: {
          es: `**Mandos:** Encontrarás el mando en [UBICACIÓN_MANDO]

**Para encender:**
Pulsa el botón rojo de encendido.

**Aplicaciones disponibles:**
• Netflix (usa tu cuenta personal)
• YouTube
• [OTRAS_APPS]

**Canales de TV:**
Pulsa el botón "TV" o "Source" y selecciona "TV".

💡 Si la pantalla se queda en negro, comprueba que la fuente de entrada es correcta (HDMI1, HDMI2, etc.)`,
          en: `**Remotes:** You'll find the remote at [REMOTE_LOCATION]

**To turn on:**
Press the red power button.

**Available apps:**
• Netflix (use your personal account)
• YouTube
• [OTHER_APPS]

**TV channels:**
Press the "TV" or "Source" button and select "TV".

💡 If the screen stays black, check that the input source is correct (HDMI1, HDMI2, etc.)`,
          fr: `**Télécommandes:** Vous trouverez la télécommande à [EMPLACEMENT_TÉLÉCOMMANDE]

**Pour allumer:**
Appuyez sur le bouton rouge d'alimentation.

**Applications disponibles:**
• Netflix (utilisez votre compte personnel)
• YouTube
• [AUTRES_APPS]

**Chaînes TV:**
Appuyez sur le bouton "TV" ou "Source" et sélectionnez "TV".

💡 Si l'écran reste noir, vérifiez que la source d'entrée est correcte (HDMI1, HDMI2, etc.)`
        }
      }
    ]
  },

  // ============================================
  // COFFEE MACHINE
  // ============================================
  'coffee-machine': {
    zoneId: 'coffee-machine',
    steps: [
      {
        type: 'text',
        title: {
          es: 'Cómo usar la cafetera',
          en: 'How to use the coffee machine',
          fr: 'Comment utiliser la machine à café'
        },
        content: {
          es: `**Tipo de cafetera:** [TIPO_CAFETERA]
**Ubicación:** [UBICACIÓN]

**Cápsulas/Café:**
Encontrarás [CÁPSULAS/CAFÉ] en [UBICACIÓN_CAFÉ].

**Instrucciones:**
1. Llena el depósito de agua
2. [INSTRUCCIONES_ESPECÍFICAS]
3. Coloca tu taza debajo
4. Pulsa el botón de café

☕ ¡Disfruta de tu café!`,
          en: `**Coffee machine type:** [MACHINE_TYPE]
**Location:** [LOCATION]

**Capsules/Coffee:**
You'll find [CAPSULES/COFFEE] at [COFFEE_LOCATION].

**Instructions:**
1. Fill the water tank
2. [SPECIFIC_INSTRUCTIONS]
3. Place your cup underneath
4. Press the coffee button

☕ Enjoy your coffee!`,
          fr: `**Type de machine à café:** [TYPE_MACHINE]
**Emplacement:** [EMPLACEMENT]

**Capsules/Café:**
Vous trouverez [CAPSULES/CAFÉ] à [EMPLACEMENT_CAFÉ].

**Instructions:**
1. Remplissez le réservoir d'eau
2. [INSTRUCTIONS_SPÉCIFIQUES]
3. Placez votre tasse en dessous
4. Appuyez sur le bouton café

☕ Profitez de votre café!`
        }
      }
    ]
  }
}

/**
 * Get content template for a zone
 */
export function getZoneContentTemplate(zoneId: string): ZoneContentTemplate | null {
  return zoneContentTemplates[zoneId] || null
}

/**
 * Check if a zone has a content template available
 */
export function hasContentTemplate(zoneId: string): boolean {
  return zoneId in zoneContentTemplates
}

/**
 * Get all zone IDs that have content templates
 */
export function getZonesWithTemplates(): string[] {
  return Object.keys(zoneContentTemplates)
}
