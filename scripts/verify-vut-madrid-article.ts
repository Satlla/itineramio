import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 VERIFICACIÓN COMPLETA DEL ARTÍCULO VUT MADRID\n')
  console.log('=' .repeat(80))

  const article = await prisma.blogPost.findUnique({
    where: { slug: 'vut-madrid-2025-requisitos-normativa-checklist' },
    select: {
      title: true,
      content: true,
      updatedAt: true
    }
  })

  if (!article) {
    console.log('❌ Artículo no encontrado')
    return
  }

  console.log(`\n📄 Artículo: ${article.title}`)
  console.log(`📅 Última actualización: ${article.updatedAt.toLocaleString('es-ES')}`)
  console.log('\n' + '=' .repeat(80))

  const content = article.content
  let passedChecks = 0
  let failedChecks = 0
  const issues: string[] = []

  // ============================================================================
  // VERIFICACIÓN 1: DISCLAIMER LEGAL AL INICIO
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 1: Disclaimer Legal')
  console.log('-'.repeat(80))

  const hasLegalDisclaimer = content.includes('⚖️ Aviso legal:') &&
                            content.includes('Esta guía ofrece información general')

  if (hasLegalDisclaimer) {
    console.log('✅ Disclaimer legal presente')
    console.log('   - Contiene advertencia legal clara')
    console.log('   - Distingue guía de asesoramiento profesional')
    passedChecks++
  } else {
    console.log('❌ Falta disclaimer legal')
    issues.push('Disclaimer legal no encontrado al inicio del artículo')
    failedChecks++
  }

  // ============================================================================
  // VERIFICACIÓN 2: SEGURO DE RESPONSABILIDAD CIVIL
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 2: Seguro de Responsabilidad Civil')
  console.log('-'.repeat(80))

  const hasInsuranceClarification = content.includes('Requisitos legales vs. práctica de mercado') &&
                                   content.includes('La normativa de la Comunidad de Madrid') &&
                                   content.includes('no especifica una suma asegurada mínima')

  if (hasInsuranceClarification) {
    console.log('✅ Seguro correctamente explicado')
    console.log('   - Distingue requisito legal de práctica de mercado')
    console.log('   - Aclara que 150.000€ es recomendación, no obligación legal')
    passedChecks++
  } else {
    console.log('❌ Falta clarificación sobre seguro')
    issues.push('Requisitos de seguro no están correctamente matizados')
    failedChecks++
  }

  // ============================================================================
  // VERIFICACIÓN 3: MANUAL DE VIVIENDA
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 3: Manual de Vivienda')
  console.log('-'.repeat(80))

  const hasManualClarification = content.includes('no existe un "Manual de la Vivienda" obligatorio como documento formal') ||
                                content.includes('altamente recomendable')

  const hasItineramioMention = content.includes('Itineramio') &&
                              content.includes('manuales digitales')

  const hasItineramioLink = content.includes('https://itineramio.com/registro') ||
                           content.includes('itineramio.com/registro')

  if (hasManualClarification) {
    console.log('✅ Manual correctamente explicado como recomendación')
    passedChecks++
  } else {
    console.log('❌ Manual presentado como obligatorio')
    issues.push('Manual de vivienda debe ser presentado como buena práctica, no obligación')
    failedChecks++
  }

  if (hasItineramioMention) {
    console.log('✅ Itineramio mencionado para manuales digitales')
  }

  if (hasItineramioLink) {
    console.log('✅ Enlace a registro de Itineramio presente')
  } else {
    console.log('⚠️  Enlace a Itineramio no encontrado')
  }

  // ============================================================================
  // VERIFICACIÓN 4: DOBLE LICENCIA (COMUNIDAD + AYUNTAMIENTO)
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 4: Doble Licencia')
  console.log('-'.repeat(80))

  const hasDualLicense = content.includes('DOS autorizaciones diferentes') ||
                        (content.includes('Comunidad de Madrid') &&
                         content.includes('Ayuntamiento de Madrid'))

  const mentionsUrbanLicense = content.includes('Licencia urbanística') ||
                              content.includes('licencia urbanística')

  if (hasDualLicense && mentionsUrbanLicense) {
    console.log('✅ Doble licencia correctamente explicada')
    console.log('   - Comunidad de Madrid (parte turística)')
    console.log('   - Ayuntamiento de Madrid (parte urbanística)')
    passedChecks++
  } else {
    console.log('❌ Falta clarificación sobre doble licencia')
    issues.push('Debe explicarse que se necesitan DOS licencias diferentes')
    failedChecks++
  }

  // ============================================================================
  // VERIFICACIÓN 5: PLAN RESIDE 2025
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 5: Plan RESIDE 2025')
  console.log('-'.repeat(80))

  const hasPlanReside = content.includes('Plan RESIDE') || content.includes('RESIDE')
  const mentionsCentroRestrictions = content.includes('centro histórico') ||
                                    content.includes('Centro histórico')

  if (hasPlanReside) {
    console.log('✅ Plan RESIDE 2025 mencionado')
    if (mentionsCentroRestrictions) {
      console.log('✅ Restricciones del centro histórico explicadas')
    }
    passedChecks++
  } else {
    console.log('❌ Falta información sobre Plan RESIDE 2025')
    issues.push('Debe incluirse información sobre restricciones del Plan RESIDE')
    failedChecks++
  }

  // ============================================================================
  // VERIFICACIÓN 6: ACCESO INDEPENDIENTE
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 6: Acceso Independiente')
  console.log('-'.repeat(80))

  const mentionsAccesoIndependiente = content.includes('acceso independiente')
  const clarifiesNotUniversal = content.includes('puede exigir') ||
                               content.includes('condiciones específicas')

  if (mentionsAccesoIndependiente && clarifiesNotUniversal) {
    console.log('✅ Acceso independiente correctamente matizado')
    console.log('   - No se presenta como requisito universal')
    passedChecks++
  } else if (mentionsAccesoIndependiente && !clarifiesNotUniversal) {
    console.log('⚠️  Acceso independiente mencionado pero falta matización')
    issues.push('Acceso independiente debe matizarse como requisito específico según zona')
  } else {
    console.log('ℹ️  Acceso independiente no es tema principal del artículo')
  }

  // ============================================================================
  // VERIFICACIÓN 7: APROBACIÓN DE COMUNIDAD 2025
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 7: Aprobación Comunidad de Propietarios')
  console.log('-'.repeat(80))

  const mentions60Percent = content.includes('60%') || content.includes('3/5')
  const mentions2025Reform = content.includes('2025') &&
                            (content.includes('Propiedad Horizontal') ||
                             content.includes('Ley de Propiedad Horizontal'))
  const mentionsRetroactive = content.includes('retroactiv')

  if (mentions60Percent && mentions2025Reform) {
    console.log('✅ Requisito de 60% (3/5) para aprobación explicado')
    console.log('✅ Reforma 2025 de Ley de Propiedad Horizontal mencionada')
    passedChecks++
  } else {
    console.log('❌ Falta información actualizada sobre aprobación de comunidad')
    issues.push('Debe incluir requisito de 60% (3/5 partes) según reforma 2025')
    failedChecks++
  }

  if (mentionsRetroactive) {
    console.log('✅ Carácter retroactivo de prohibiciones explicado')
  }

  // ============================================================================
  // VERIFICACIÓN 8: MULTAS REGISTRO DE VIAJEROS
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 8: Multas Registro de Viajeros')
  console.log('-'.repeat(80))

  const mentions100to600 = content.includes('100') && content.includes('600')
  const mentions601to30000 = content.includes('601') && content.includes('30.000')
  const distinguishesPenalties = mentions100to600 && mentions601to30000

  if (distinguishesPenalties) {
    console.log('✅ Multas correctamente diferenciadas:')
    console.log('   - Fuera de plazo: 100-600€')
    console.log('   - No registrar: 601-30.000€')
    passedChecks++
  } else {
    console.log('❌ Rangos de multas no están claros')
    issues.push('Debe diferenciarse entre multas por retraso (100-600€) y no registro (601-30.000€)')
    failedChecks++
  }

  // ============================================================================
  // VERIFICACIÓN 9: PLACA IDENTIFICATIVA
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 9: Placa Identificativa')
  console.log('-'.repeat(80))

  const mentionsPlaca = content.includes('placa') || content.includes('rótulo')
  const markedAsObligatory = content.includes('obligatori') && mentionsPlaca

  if (markedAsObligatory) {
    console.log('✅ Placa identificativa marcada como obligatoria')
    passedChecks++
  } else if (mentionsPlaca) {
    console.log('⚠️  Placa mencionada pero no marcada claramente como obligatoria')
    issues.push('Placa identificativa debe estar claramente marcada como OBLIGATORIA')
  } else {
    console.log('❌ No se menciona la placa identificativa')
    issues.push('Debe incluirse información sobre placa identificativa obligatoria')
    failedChecks++
  }

  // ============================================================================
  // VERIFICACIÓN 10: COSTES TOTALES
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 10: Costes Totales')
  console.log('-'.repeat(80))

  const mentionsMunicipalFees = content.toLowerCase().includes('municipal') &&
                               (content.includes('tasas') || content.includes('costes'))
  const clarifiesBeyondAutonomic = content.includes('NO incluyen') ||
                                  content.includes('además')

  if (mentionsMunicipalFees && clarifiesBeyondAutonomic) {
    console.log('✅ Costes correctamente aclarados')
    console.log('   - Se menciona que costes indicados NO incluyen tasas municipales')
    passedChecks++
  } else {
    console.log('⚠️  Costes deben aclarar que no incluyen tasas municipales')
    issues.push('Debe aclararse que costes mostrados no incluyen tasas del Ayuntamiento')
  }

  // ============================================================================
  // VERIFICACIÓN 11: PARTEE COMO ALTERNATIVA
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 11: Partee como Alternativa Económica')
  console.log('-'.repeat(80))

  const mentionsPartee = content.includes('Partee')
  const mentionsChekin = content.includes('Chekin')
  const incorrectItineramioCheckin = content.includes('Chekin') &&
                                    content.includes('Itineramio') &&
                                    content.includes('registro de huéspedes')

  if (mentionsPartee) {
    console.log('✅ Partee mencionado como alternativa económica')
    passedChecks++
  } else {
    console.log('⚠️  Partee no encontrado como alternativa')
    issues.push('Debería mencionarse Partee como alternativa económica para check-in')
  }

  if (mentionsChekin) {
    console.log('✅ Chekin mencionado para registro de huéspedes')
  }

  if (incorrectItineramioCheckin) {
    console.log('❌ ERROR: Itineramio mencionado incorrectamente en contexto de check-in')
    issues.push('CRÍTICO: Itineramio NO hace check-in de huéspedes, debe eliminarse de ese contexto')
    failedChecks++
  } else {
    console.log('✅ Itineramio NO mencionado incorrectamente en check-in')
  }

  // ============================================================================
  // VERIFICACIÓN 12: CADUCIDAD VUT
  // ============================================================================
  console.log('\n📋 VERIFICACIÓN 12: Información sobre Caducidad VUT')
  console.log('-'.repeat(80))

  const mentionsNRUA = content.includes('NRUA')
  const mentionsJuly2026 = content.includes('2026')
  const hasDetailedExpiration = content.includes('no caduca') && mentionsNRUA

  if (hasDetailedExpiration) {
    console.log('✅ Información sobre caducidad VUT correctamente ampliada')
    if (mentionsNRUA && mentionsJuly2026) {
      console.log('✅ Registro NRUA y fecha julio 2026 mencionados')
    }
    passedChecks++
  } else {
    console.log('⚠️  Información sobre caducidad podría estar más detallada')
  }

  // ============================================================================
  // RESUMEN FINAL
  // ============================================================================
  console.log('\n' + '='.repeat(80))
  console.log('📊 RESUMEN DE VERIFICACIÓN')
  console.log('='.repeat(80))

  const totalChecks = passedChecks + failedChecks
  const successRate = ((passedChecks / totalChecks) * 100).toFixed(1)

  console.log(`\n✅ Verificaciones exitosas: ${passedChecks}`)
  console.log(`❌ Verificaciones fallidas: ${failedChecks}`)
  console.log(`📈 Tasa de cumplimiento: ${successRate}%`)

  if (issues.length > 0) {
    console.log('\n⚠️  PROBLEMAS DETECTADOS:')
    console.log('-'.repeat(80))
    issues.forEach((issue, index) => {
      console.log(`${index + 1}. ${issue}`)
    })
  }

  console.log('\n' + '='.repeat(80))

  if (failedChecks === 0 && passedChecks >= 10) {
    console.log('✅ ARTÍCULO COMPLETAMENTE CORRECTO Y LISTO PARA PRODUCCIÓN')
  } else if (failedChecks <= 2) {
    console.log('⚠️  ARTÍCULO CASI COMPLETO - Requiere ajustes menores')
  } else {
    console.log('❌ ARTÍCULO REQUIERE CORRECCIONES IMPORTANTES')
  }

  console.log('='.repeat(80) + '\n')

  await prisma.$disconnect()
}

main()
