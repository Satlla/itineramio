import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

/**
 * POST /api/gestion/reservations/import-rollback
 * Rollback an import by deleting all reservations with the given batch ID
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { importBatchId } = body

    if (!importBatchId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del batch de importación' },
        { status: 400 }
      )
    }

    // Verify the import belongs to this user
    const importRecord = await prisma.reservationImport.findFirst({
      where: {
        importBatchId,
        userId
      }
    })

    if (!importRecord) {
      return NextResponse.json(
        { error: 'Importación no encontrada' },
        { status: 404 }
      )
    }

    // Check if any reservations from this import have been invoiced or liquidated
    const reservationsWithDependencies = await prisma.reservation.findMany({
      where: {
        importBatchId,
        userId,
        OR: [
          { invoiced: true },
          { liquidationId: { not: null } }
        ]
      },
      select: {
        id: true,
        confirmationCode: true,
        invoiced: true,
        liquidationId: true
      }
    })

    if (reservationsWithDependencies.length > 0) {
      return NextResponse.json(
        {
          error: 'No se puede deshacer: algunas reservas ya han sido facturadas o liquidadas',
          reservationsWithDependencies: reservationsWithDependencies.length
        },
        { status: 400 }
      )
    }

    // Delete all reservations from this import
    const deleteResult = await prisma.reservation.deleteMany({
      where: {
        importBatchId,
        userId
      }
    })

    // Mark the import as rolled back
    await prisma.reservationImport.update({
      where: { id: importRecord.id },
      data: {
        errors: {
          ...(importRecord.errors as object || {}),
          rolledBack: true,
          rolledBackAt: new Date().toISOString(),
          deletedCount: deleteResult.count
        }
      }
    })

    return NextResponse.json({
      success: true,
      deletedCount: deleteResult.count,
      message: `Se han eliminado ${deleteResult.count} reservas de la importación`
    })

  } catch (error) {
    console.error('Error rolling back import:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/gestion/reservations/import-rollback?importBatchId=xxx
 * Preview what would be deleted if rollback is executed
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const { searchParams } = new URL(request.url)
    const importBatchId = searchParams.get('importBatchId')

    if (!importBatchId) {
      return NextResponse.json(
        { error: 'Se requiere el ID del batch de importación' },
        { status: 400 }
      )
    }

    // Get import record
    const importRecord = await prisma.reservationImport.findFirst({
      where: {
        importBatchId,
        userId
      }
    })

    if (!importRecord) {
      return NextResponse.json(
        { error: 'Importación no encontrada' },
        { status: 404 }
      )
    }

    // Get reservations that would be affected
    const reservations = await prisma.reservation.findMany({
      where: {
        importBatchId,
        userId
      },
      select: {
        id: true,
        confirmationCode: true,
        guestName: true,
        checkIn: true,
        checkOut: true,
        hostEarnings: true,
        invoiced: true,
        liquidationId: true,
        sourceListingName: true
      }
    })

    const canRollback = reservations.every(r => !r.invoiced && !r.liquidationId)

    return NextResponse.json({
      importRecord: {
        id: importRecord.id,
        fileName: importRecord.fileName,
        importDate: importRecord.importDate,
        importedCount: importRecord.importedCount,
        listingsFound: importRecord.listingsFound
      },
      reservationsCount: reservations.length,
      reservations: reservations.map(r => ({
        id: r.id,
        confirmationCode: r.confirmationCode,
        guestName: r.guestName,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
        hostEarnings: Number(r.hostEarnings),
        sourceListingName: r.sourceListingName,
        canDelete: !r.invoiced && !r.liquidationId,
        blockingReason: r.invoiced ? 'Facturada' : r.liquidationId ? 'Liquidada' : null
      })),
      canRollback
    })

  } catch (error) {
    console.error('Error previewing rollback:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
