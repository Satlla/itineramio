import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../src/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' }
    })

    // Add popular flag and format features
    const formattedPlans = plans.map((plan, index) => ({
      ...plan,
      features: Array.isArray(plan.features) ? plan.features : [],
      popular: index === 1, // Middle plan is popular
      priceMonthly: Number(plan.priceMonthly)
    }))

    return NextResponse.json(formattedPlans)
  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json(
      { error: 'Error al obtener los planes' },
      { status: 500 }
    )
  }
}

// POST endpoint to create/update plans (admin only)
export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      priceMonthly,
      priceYearly,
      maxProperties,
      features,
      aiMessagesIncluded
    } = await request.json()

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        description,
        priceMonthly,
        priceYearly,
        maxProperties,
        features: features || [],
        aiMessagesIncluded: aiMessagesIncluded || 0,
        isActive: true
      }
    })

    return NextResponse.json(plan)
  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json(
      { error: 'Error al crear el plan' },
      { status: 500 }
    )
  }
}