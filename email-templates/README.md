# Email Templates

Plantillas de email listas para lanzar. Cada archivo es un script independiente que sube las imágenes a Vercel Blob y envía el correo via Resend.

## Cómo lanzar una campaña

```bash
# Solo a ti primero (para revisar)
node email-templates/<nombre>.mjs

# Para enviar a todos los usuarios, cambiar en el script:
# to: ['alejandrosatlla@gmail.com']  →  to: [lista de emails de la BD]
```

## Plantillas disponibles

| Archivo | Asunto | Fecha | Novedades |
|---------|--------|-------|-----------|
| `novedades-marzo-2026.mjs` | 4 novedades que te van a ahorrar decenas de mensajes de huéspedes | Marzo 2026 | Manual con IA, Chatbot con vídeo, Itineramio Places, Asistente en panel |

## Imágenes

Las imágenes se suben automáticamente a Vercel Blob en `email-assets/` con `allowOverwrite: true`.
URLs actuales disponibles en `https://6o7vw2qjfuydknzs.public.blob.vercel-storage.com/email-assets/`.
