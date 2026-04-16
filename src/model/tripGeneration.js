/**
 * Stufe 1: Verkehrserzeugung (Trip Generation)
 *
 * Berechnet Quellverkehr (Production) und Zielverkehr (Attraction)
 * pro Zone basierend auf Bevölkerung und Beschäftigung.
 *
 * Formel:
 *   Production_i = Population_i × (1 + growthFactor) × tripRate
 *   Attraction_j = (Employment_j × 2.5 + Population_j × 0.5) × (1 + growthFactor)
 */

import { zones } from '../data/zones.js'

export function calculateTripGeneration(params) {
  const { populationGrowth = 0, tripRate = 3.0 } = params
  const growthFactor = populationGrowth / 100

  const productions = []
  const attractions = []

  for (const zone of zones) {
    const adjustedPop = zone.population * (1 + growthFactor)
    const adjustedEmp = zone.employment * (1 + growthFactor)

    // Quellverkehr: Bevölkerung × Wegerate
    const production = adjustedPop * tripRate

    // Zielverkehr: gewichtete Summe aus Beschäftigung (Pendler) und Bevölkerung (Versorgung)
    const attraction = adjustedEmp * 2.5 + adjustedPop * 0.5

    productions.push(Math.round(production))
    attractions.push(Math.round(attraction))
  }

  // Normierung: Gesamtproduktion = Gesamtattraktion
  const totalProd = productions.reduce((a, b) => a + b, 0)
  const totalAttr = attractions.reduce((a, b) => a + b, 0)
  const normFactor = totalProd / totalAttr

  const normalizedAttractions = attractions.map((a) =>
    Math.round(a * normFactor)
  )

  return {
    productions,
    attractions: normalizedAttractions,
    totalTrips: totalProd,
    zones: zones.map((z, i) => ({
      ...z,
      production: productions[i],
      attraction: normalizedAttractions[i],
    })),
  }
}
