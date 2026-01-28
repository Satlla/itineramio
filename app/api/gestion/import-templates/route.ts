import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import type { ColumnMapping, ImportConfig } from '@/types/import'

/**
 * GET /api/gestion/import-templates
 * List all import templates for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const templates = await prisma.importTemplate.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({
      templates: templates.map(t => ({
        id: t.id,
        name: t.name,
        mapping: {
          guestName: t.guestNameColumn,
          checkIn: t.checkInColumn,
          checkOut: t.checkOutColumn,
          amount: t.amountColumn,
          confirmationCode: t.confirmationCodeColumn ?? undefined,
          nights: t.nightsColumn ?? undefined,
          cleaningFee: t.cleaningFeeColumn ?? undefined,
          commission: t.commissionColumn ?? undefined,
          status: t.statusColumn ?? undefined,
        } as ColumnMapping,
        config: {
          dateFormat: t.dateFormat,
          numberFormat: t.numberFormat,
          amountType: t.amountType,
          platform: t.platform,
        } as ImportConfig,
        originalHeaders: t.originalHeaders,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      }))
    })
  } catch (error) {
    console.error('Error fetching import templates:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/gestion/import-templates
 * Create a new import template
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(request)
    if (authResult instanceof Response) {
      return authResult
    }
    const userId = authResult.userId

    const body = await request.json()
    const { name, mapping, config, originalHeaders } = body as {
      name: string
      mapping: ColumnMapping
      config: ImportConfig
      originalHeaders?: string[]
    }

    // Validate required fields
    if (!name || !mapping || !config) {
      return NextResponse.json(
        { error: 'Nombre, mapeo y configuración son requeridos' },
        { status: 400 }
      )
    }

    // Check for duplicate name
    const existing = await prisma.importTemplate.findFirst({
      where: {
        userId,
        name
      }
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una plantilla con ese nombre' },
        { status: 409 }
      )
    }

    // Validate mapping has required fields
    if (
      mapping.guestName === undefined ||
      mapping.checkIn === undefined ||
      mapping.checkOut === undefined ||
      mapping.amount === undefined
    ) {
      return NextResponse.json(
        { error: 'El mapeo debe incluir: huésped, entrada, salida e importe' },
        { status: 400 }
      )
    }

    // Create template
    const template = await prisma.importTemplate.create({
      data: {
        userId,
        name,
        guestNameColumn: mapping.guestName,
        checkInColumn: mapping.checkIn,
        checkOutColumn: mapping.checkOut,
        amountColumn: mapping.amount,
        confirmationCodeColumn: mapping.confirmationCode ?? null,
        nightsColumn: mapping.nights ?? null,
        cleaningFeeColumn: mapping.cleaningFee ?? null,
        commissionColumn: mapping.commission ?? null,
        statusColumn: mapping.status ?? null,
        dateFormat: config.dateFormat || 'DD/MM/YYYY',
        numberFormat: config.numberFormat || 'EU',
        amountType: config.amountType || 'NET',
        platform: config.platform || 'OTHER',
        originalHeaders: originalHeaders || null,
      }
    })

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        name: template.name,
        mapping: {
          guestName: template.guestNameColumn,
          checkIn: template.checkInColumn,
          checkOut: template.checkOutColumn,
          amount: template.amountColumn,
          confirmationCode: template.confirmationCodeColumn ?? undefined,
          nights: template.nightsColumn ?? undefined,
          cleaningFee: template.cleaningFeeColumn ?? undefined,
          commission: template.commissionColumn ?? undefined,
          status: template.statusColumn ?? undefined,
        },
        config: {
          dateFormat: template.dateFormat,
          numberFormat: template.numberFormat,
          amountType: template.amountType,
          platform: template.platform,
        },
        createdAt: template.createdAt.toISOString(),
        updatedAt: template.updatedAt.toISOString(),
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating import template:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
