/**
 * Vordefinierte Szenarien für Schnellzugriff
 */

export const scenarios = [
  {
    id: 'baseline',
    name: 'Status quo (ohne U9)',
    description: 'Heutiger Zustand 2024, kein Bevölkerungswachstum',
    params: {
      withU9: false,
      populationGrowth: 0,
      fuelPrice: 1.80,
      oepnvMonthlyPass: 49,
      bikeInfraQuality: 6,
      tripRate: 3.0,
    },
  },
  {
    id: 'withU9',
    name: 'Mit U9',
    description: 'U9 in Betrieb, heutige Rahmenbedingungen',
    params: {
      withU9: true,
      populationGrowth: 0,
      fuelPrice: 1.80,
      oepnvMonthlyPass: 49,
      bikeInfraQuality: 6,
      tripRate: 3.0,
    },
  },
  {
    id: 'growth2035',
    name: 'Mit U9 + Wachstum 2035',
    description: 'U9 in Betrieb, Bevölkerungsprognose 2035 (+12%)',
    params: {
      withU9: true,
      populationGrowth: 12,
      fuelPrice: 2.20,
      oepnvMonthlyPass: 49,
      bikeInfraQuality: 8,
      tripRate: 3.1,
    },
  },
  {
    id: 'mobilitaetswende',
    name: 'Mobilitätswende 2035',
    description: 'Ambitioniert: 80% Umweltverbund gemäß Mobilitätsstrategie',
    params: {
      withU9: true,
      populationGrowth: 12,
      fuelPrice: 2.80,
      oepnvMonthlyPass: 29,
      bikeInfraQuality: 10,
      tripRate: 3.2,
    },
  },
]

export const defaultScenarioId = 'baseline'

export function getScenarioById(id) {
  return scenarios.find((s) => s.id === id) || scenarios[0]
}
