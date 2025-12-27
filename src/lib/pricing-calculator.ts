/**
 * UNIFIED PRICING CALCULATOR
 * Uses src/config/plans.ts as single source of truth
 * Eliminates all legacy references to prohibited plan codes
 */

import { PLANS_ARRAY as PLANS, pricePerProperty, getPlan, type PlanCode } from '../config/plans'
import { planForPropertyCount } from './select-plan'

export interface PricingResult {
  subtotal: number
  discount: number
  total: number
  tier: string
  pricePerProperty: number
  breakdown: PricingBreakdown[]
  effectivePropertyCount: number // Billable properties (total - 1 free)
}

export interface PricingBreakdown {
  properties: number
  pricePerProperty: number
  tierName: string
  subtotal: number
}

export interface PricingTier {
  minProperties: number
  maxProperties: number | null
  pricePerProperty: number
  discountPercentage: number
  name: string
}

export class PricingCalculator {
  static calculatePrice(totalProperties: number): PricingResult {
    // Calculate effective billable properties
    const effectivePropertyCount = Math.max(totalProperties - 1, 0)
    
    // If only one property, everything is free
    if (totalProperties <= 1) {
      return {
        subtotal: 0,
        discount: 0,
        total: 0,
        tier: 'Basic',
        pricePerProperty: 0,
        breakdown: [],
        effectivePropertyCount: 0
      }
    }

    // Get the plan for this property count
    const planCode = planForPropertyCount(totalProperties)
    const plan = getPlan(planCode)
    const total = plan.priceMonthly
    const pricePerPropertyValue = pricePerProperty(planCode)

    return {
      subtotal: total,
      discount: 0, // No volume discounts in fixed plan model
      total,
      tier: plan.name,
      pricePerProperty: pricePerPropertyValue,
      breakdown: [{
        properties: totalProperties,
        pricePerProperty: pricePerPropertyValue,
        tierName: plan.name,
        subtotal: total
      }],
      effectivePropertyCount
    }
  }

  static getTierByPropertyCount(totalProperties: number): PricingTier {
    const planCode = planForPropertyCount(totalProperties)
    const plan = getPlan(planCode)

    return {
      minProperties: 1, // All plans start from 1
      maxProperties: plan.maxProperties,
      pricePerProperty: pricePerProperty(planCode),
      discountPercentage: 0,
      name: plan.name
    }
  }

  static getPricingTiers(): PricingTier[] {
    return PLANS.map(plan => ({
      minProperties: 1, // All plans start from 1
      maxProperties: plan.maxProperties,
      pricePerProperty: pricePerProperty(plan.code),
      discountPercentage: 0,
      name: plan.name
    }))
  }

  // Convert to format compatible with existing plan system
  static convertToLegacyPlanFormat(totalProperties: number): {
    plan: string
    price: number
    maxProperties: number
  } {
    const planCode = planForPropertyCount(totalProperties)
    const plan = getPlan(planCode)
    
    return {
      plan: plan.code,
      price: plan.priceMonthly,
      maxProperties: plan.maxProperties
    }
  }
}