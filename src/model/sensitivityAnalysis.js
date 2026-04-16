/**
 * Sensitivitätsanalyse: Tornado-Diagramm
 *
 * Berechnet die Einflussstärke jedes Parameters auf die NKA/KPIs.
 * Variiert jeden Parameter ±10% und misst Änderung in NKV.
 *
 * Quelle: Standard Sensitivity Analysis für Transport Models
 */

import { runModel, berechneNKA } from './modelRunner.js'

/**
 * Führt eine Sensitivitätsanalyse durch
 * Gibt Tornado-Daten zurück: [{param, low, high, range}]
 */
export function runSensitivityAnalysis(baseParams) {
  const {
    withU9 = false,
    populationGrowth = 0,
    fuelPrice = 1.80,
    oepnvMonthlyPass = 49,
    bikeInfraQuality = 6,
    tripRate = 3.0,
    beta = 0.1,
  } = baseParams

  // Basis-Szenario (ohne U9, zur Referenz)
  const baseParamsNoU9 = { ...baseParams, withU9: false }
  const baseResult = runModel(baseParamsNoU9)

  // Mit-U9-Szenario für NKA
  const baseParamsWithU9 = { ...baseParams, withU9: true }
  const baseResultU9 = runModel(baseParamsWithU9)
  const baseNKA = berechneNKA(baseResult, baseResultU9)
  const baseNKV = baseNKA?.nkv || 0

  // Zu testierende Parameter mit ±10% Variation
  const parameters = [
    {
      key: 'populationGrowth',
      label: 'Bevölkerungswachstum',
      baseValue: populationGrowth,
      variation: 2, // ±2 Prozentpunkte (0→2%, 10%→12%)
    },
    {
      key: 'fuelPrice',
      label: 'Benzinpreis',
      baseValue: fuelPrice,
      variation: fuelPrice * 0.1, // ±10%
    },
    {
      key: 'oepnvMonthlyPass',
      label: 'ÖPNV-Monatsticket',
      baseValue: oepnvMonthlyPass,
      variation: oepnvMonthlyPass * 0.1, // ±10%
    },
    {
      key: 'bikeInfraQuality',
      label: 'Rad-Infrastruktur',
      baseValue: bikeInfraQuality,
      variation: 1, // ±1 Punkt (1-10 Skala)
    },
    {
      key: 'tripRate',
      label: 'Wegerate',
      baseValue: tripRate,
      variation: tripRate * 0.1, // ±10%
    },
    {
      key: 'beta',
      label: 'Impedanzparameter β',
      baseValue: beta,
      variation: beta * 0.1, // ±10%
    },
  ]

  const results = []

  for (const param of parameters) {
    // Low-Szenario: Parameter −variation
    const paramsLow = { ...baseParams, [param.key]: param.baseValue - param.variation }
    const resultLow = runModel(paramsLow)
    const resultLowU9 = runModel({ ...paramsLow, withU9: true })
    const nkaLow = berechneNKA(resultLow, resultLowU9)
    const nkvLow = nkaLow?.nkv || 0

    // High-Szenario: Parameter +variation
    const paramsHigh = { ...baseParams, [param.key]: param.baseValue + param.variation }
    const resultHigh = runModel(paramsHigh)
    const resultHighU9 = runModel({ ...paramsHigh, withU9: true })
    const nkaHigh = berechneNKA(resultHigh, resultHighU9)
    const nkvHigh = nkaHigh?.nkv || 0

    const range = nkvHigh - nkvLow

    results.push({
      key: param.key,
      label: param.label,
      baseValue: param.baseValue,
      variation: param.variation,
      nkvLow,
      nkvHigh,
      baseNKV,
      deltaLow: nkvLow - baseNKV,
      deltaHigh: nkvHigh - baseNKV,
      range, // Spannweite für Tornado-Sortierung
    })
  }

  // Sortiere nach Einflussstärke (absteigend)
  results.sort((a, b) => Math.abs(b.range) - Math.abs(a.range))

  return {
    baseNKV,
    parameters: results,
  }
}

/**
 * Alternative KPI-Metriken für Sensitivität (falls NKV nicht verfügbar)
 * z.B. Umweltverbund, ÖPNV-Anteil, etc.
 */
export function runSensitivityAnalysisKPI(baseParams, kpiMetric = 'umweltverbund') {
  const parameters = [
    {
      key: 'populationGrowth',
      label: 'Bevölkerungswachstum',
      baseValue: baseParams.populationGrowth,
      variation: 2,
    },
    {
      key: 'fuelPrice',
      label: 'Benzinpreis',
      baseValue: baseParams.fuelPrice,
      variation: baseParams.fuelPrice * 0.1,
    },
    {
      key: 'oepnvMonthlyPass',
      label: 'ÖPNV-Monatsticket',
      baseValue: baseParams.oepnvMonthlyPass,
      variation: baseParams.oepnvMonthlyPass * 0.1,
    },
    {
      key: 'bikeInfraQuality',
      label: 'Rad-Infrastruktur',
      baseValue: baseParams.bikeInfraQuality,
      variation: 1,
    },
    {
      key: 'tripRate',
      label: 'Wegerate',
      baseValue: baseParams.tripRate,
      variation: baseParams.tripRate * 0.1,
    },
  ]

  const getKPIValue = (result) => {
    switch (kpiMetric) {
      case 'umweltverbund':
        return result.kpis.umweltverbund
      case 'oepnvShare':
        return result.kpis.modalSplit.oepnv
      case 'u9Load':
        return result.kpis.u9Load
      default:
        return result.kpis.umweltverbund
    }
  }

  const baseResult = runModel(baseParams)
  const baseValue = getKPIValue(baseResult)

  const results = []

  for (const param of parameters) {
    const paramsLow = { ...baseParams, [param.key]: param.baseValue - param.variation }
    const resultLow = runModel(paramsLow)
    const kpiLow = getKPIValue(resultLow)

    const paramsHigh = { ...baseParams, [param.key]: param.baseValue + param.variation }
    const resultHigh = runModel(paramsHigh)
    const kpiHigh = getKPIValue(resultHigh)

    results.push({
      key: param.key,
      label: param.label,
      baseValue: param.baseValue,
      variation: param.variation,
      kpiLow,
      kpiHigh,
      baseKPI: baseValue,
      deltaLow: kpiLow - baseValue,
      deltaHigh: kpiHigh - baseValue,
      range: kpiHigh - kpiLow,
    })
  }

  results.sort((a, b) => Math.abs(b.range) - Math.abs(a.range))

  return {
    baseKPI: baseValue,
    kpiMetric,
    parameters: results,
  }
}
