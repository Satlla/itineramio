const fs = require('fs')
const path = require('path')

// Leer el schema actual
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma')
let schema = fs.readFileSync(schemaPath, 'utf8')

console.log('🔧 Arreglando schema de Prisma...')

// Buscar todas las ocurrencias de "model Notification"
const notificationMatches = schema.match(/model Notification\s*{[^}]*}/g)

if (notificationMatches && notificationMatches.length > 1) {
  console.log(`❌ Encontrados ${notificationMatches.length} modelos Notification duplicados`)
  
  // Mantener solo el primer modelo Notification
  let firstFound = false
  schema = schema.replace(/model Notification\s*{[^}]*}/g, (match) => {
    if (!firstFound) {
      firstFound = true
      console.log('✅ Manteniendo primer modelo Notification')
      return match
    } else {
      console.log('🗑️ Eliminando modelo Notification duplicado')
      return ''
    }
  })
  
  // Limpiar líneas vacías extra
  schema = schema.replace(/\n\n\n+/g, '\n\n')
  
  // Escribir el schema corregido
  fs.writeFileSync(schemaPath, schema)
  console.log('✅ Schema corregido y guardado')
} else {
  console.log('✅ No se encontraron duplicados en el schema')
}

console.log('🎉 Listo! Ahora puedes hacer deploy')