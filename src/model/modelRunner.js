/**
 * Model Runner: Orchestriert alle 4 Stufen des Verkehrsmodells
 *
 * Input: Parameter-Objekt aus den UI-Controls
 * Output: Vollständiges Ergebnis-Set für alle Visualisierungen
 *
 * Rückkopplung (Weiner 1997):
 *   Überlastete Streckenabschnitte (Stufe 4) reduzieren die ÖPNV-Utility (Stufe 3).
 *   Das Modell iteriert bis zur Konvergenz (max. MAX_FEEDBACK_ITERATIONS Schritte).
 *   Konvergenzkriterium: Änderung des ÖPNV-Anteils < 0.1% zwischen Iterationen.
 */

import { calculateTripGeneration } from './tripGeneration.js'
import { calculateTripDistribution } from './tripDistribution.js'
import { calculateModeChoice } from './modeChoice.js'
import { calculateAssignment } from './assignment.js'
import { travelTimeWithoutU9, travelTimeWithU9 } from '../data/zones.js'
import { u9Params, nkaParams, berechneBarwertFaktor } from '../data/calibration.js'

const MAX_FEEDBACK_ITERATIONS = 6
const FEEDBACK_CONVERGENCE = 0.001  // 0.1% Änderung im ÖPNV-Anteil

/**
 * Berechnet den Überlastungs-Penalty für die ÖPNV-Utility aus dem
 * Auslastungsgrad der kritischen Streckenabschnitte.
 *
 * Bei Auslastung > 90%: linear wachsender Negativnutzen (Gedränge, Verspätungen).
 * Maximal -1.0 Utility-Einheiten bei 150% Auslastung.
 * Quelle: Weiner (1997) – Kapazitätsrückkopplung im 4-Stufen-Modell
 */
function calcCrowdingPenalty(assignment) {
  const stammstrecke1 = assignment.segments.find((s) => s.id === 'stammstrecke1')
  const utilization = stammstrecke1?.utilization || 0
  if (utilization <= 0.9) return 0
  // Lineare Funktion: 0 bei 90%, -1.0 bei 150%
  return -((utilization - 0.9) / 0.6) * 1.0
}

export function runModel(params) {
  const {
    withU9 = false,
    populationGrowth = 0,
    fuelPrice = 1.80,
    oepnvMonthlyPass = 49,
    bikeInfraQuality = 6,
    tripRate = 3.0,
    beta,
  } = params

  // Reisezeitmatrix je nach Szenario
  const travelTimeOEPNV = withU9 ? travelTimeWithU9 : travelTimeWithoutU9

  // Stufe 1 & 2: Erzeugung und Verteilung (unabhängig von Rückkopplung)
  const generation = calculateTripGeneration({ populationGrowth, tripRate })
  const distribution = calculateTripDistribution(
    generation.productions,
    generation.attractions,
    travelTimeOEPNV,
    { beta }
  )

  // Stufe 3 & 4: Iterative Rückkopplung (Weiner 1997)
  let crowdingPenalty = 0
  let modeChoice, assignment
  let prevOepnvShare = null

  for (let iter = 0; iter < MAX_FEEDBACK_ITERATIONS; iter++) {
    // Stufe 3: Verkehrsmittelwahl (mit aktuellem Crowding-Penalty)
    modeChoice = calculateModeChoice(distribution.odMatrix, travelTimeOEPNV, {
      fuelPrice,
      oepnvMonthlyPass,
      bikeInfraQuality,
      u9ComfortBonus: withU9 ? u9Params.comfortBonus : 0,
      crowdingPenalty,
    })

    // Stufe 4: Umlegung
    assignment = calculateAssignment(modeChoice.modeTrips.oepnv, { withU9 })

    // Konvergenzprüfung: Hat sich der ÖPNV-Anteil stabilisiert?
    const currentOepnvShare = modeChoice.modalSplit.oepnv
    if (
      prevOepnvShare !== null &&
      Math.abs(currentOepnvShare - prevOepnvShare) < FEEDBACK_CONVERGENCE
    ) {
      break
    }
    prevOepnvShare = currentOepnvShare

    // Neuen Penalty für nächste Iteration berechnen
    crowdingPenalty = calcCrowdingPenalty(assignment)
  }

  // KPIs berechnen
  const stammstrecke1 = assignment.segments.find((s) => s.id === 'stammstrecke1')
  const u9Core = assignment.segments.find((s) => s.id === 'u9_core')

  const kpis = {
    totalTrips: generation.totalTrips,
    modalSplit: modeChoice.modalSplit,
    umweltverbund: modeChoice.umweltverbund,
    oepnvTrips: modeChoice.totalByMode.oepnv,
    ubahnTrips: assignment.totalUBahnTrips,
    stammstrecke1Load: stammstrecke1?.load || 0,
    stammstrecke1Utilization: stammstrecke1?.utilization || 0,
    stammstrecke1Relief: stammstrecke1?.relief || 0,
    u9Load: u9Core?.load || 0,
    u9Utilization: u9Core?.utilization || 0,
    crowdingPenalty,  // Debug: finaler Penalty nach Konvergenz
  }

  return {
    generation,
    distribution,
    modeChoice,
    assignment,
    kpis,
    params,
  }
}

/**
 * Vereinfachte Nutzen-Kosten-Analyse (NKA) für die U9
 * Methodik: Standardisierte Bewertung von Verkehrswegeinvestitionen 2016+
 * Quelle: BMV (2016), Heimerl (1994) OR Spectrum
 *
 * Nutzenkomponenten:
 *   (1) Reisezeitgewinne: Δtt × Fahrten × WdR
 *   (2) Unfallkostenreduktion (vereinfacht über Modal-Shift-Anteil)
 *   (3) Betriebskosten-Delta (Mehrkosten neue Linie)
 *
 * Nutzen-Kosten-Verhältnis NKV = Barwert(Nutzen) / Barwert(Kosten)
 * NKV ≥ 1.0 → Investition volkswirtschaftlich gerechtfertigt
 */
export function berechneNKA(baseResult, u9Result) {
  const p = nkaParams
  const bwf = berechneBarwertFaktor(p.prognosehorizont, p.diskontierungssatz)

  // (1) Reisezeitgewinne
  // Fahrten die von U9 profitieren: ÖPNV-Fahrten im Basisfall
  const jaehrlicheFahrten = baseResult.kpis.oepnvTrips * p.tageFaktor
  const zeitersparnisStd = p.durchschnittlZeitersparnis / 60  // in Stunden
  const jaehrlicherZeitnutzen = jaehrlicheFahrten * zeitersparnisStd * p.wdrGesamt

  // (2) Zusätzlicher Nutzen: Modal-Shift von MIV zu ÖPNV
  const deltaOepnvTrips = Math.max(
    0,
    (u9Result.kpis.modalSplit.oepnv - baseResult.kpis.modalSplit.oepnv) *
      baseResult.kpis.totalTrips * p.tageFaktor
  )
  // Eingesparte externe Kosten MIV (Unfall, Lärm) ~0.05 EUR/km × 8.5km
  const externeKostenProMIVFahrt = 0.05 * 8.5
  const jaehrlicherExternnutzen = deltaOepnvTrips * externeKostenProMIVFahrt

  // (3) CO₂-Nutzen (NEU: Fortschreibung 2022 — Lebenszyklus-Treibhausgasemissionen)
  // Eingesparte CO₂-Emissionen durch Modal-Shift MIV → ÖPNV
  const co2EinsparungKgJaehrlich = deltaOepnvTrips * p.co2EinsparungKgProPKWFahrt
  const co2EinsparungTonnenJaehrlich = co2EinsparungKgJaehrlich / 1000
  const jaehrlicherCO2Nutzen = co2EinsparungTonnenJaehrlich * p.co2VermeidungskostenEurProTonne

  // Gesamtjahresnutzen (Reisezeit + Extern + CO₂)
  const jahresnutzen = jaehrlicherZeitnutzen + jaehrlicherExternnutzen + jaehrlicherCO2Nutzen

  // Barwert Nutzen
  const barwertNutzen = jahresnutzen * bwf

  // Kosten: Investition + Barwert Betriebskosten-Delta
  const barwertBetriebskosten = p.betriebskostenDeltaMrd * 1e9 * bwf
  const gesamtkosten = p.investitionskostenMrd * 1e9 + barwertBetriebskosten

  // NKV
  const nkv = barwertNutzen / gesamtkosten

  return {
    jahresnutzenMio: Math.round(jahresnutzen / 1e6),
    barwertNutzenMrd: Math.round(barwertNutzen / 1e9 * 10) / 10,
    gesamtkostenMrd: Math.round(gesamtkosten / 1e9 * 10) / 10,
    nkv: Math.round(nkv * 100) / 100,
    nkvBewertung: nkv >= 1.5 ? 'sehr gut' : nkv >= 1.0 ? 'positiv' : 'negativ',
    jaehrlicheFahrtenMio: Math.round(jaehrlicheFahrten / 1e6 * 10) / 10,
    deltaOepnvTripsMio: Math.round(deltaOepnvTrips / 1e6 * 100) / 100,
    co2EinsparungTonnenJaehrlich: Math.round(co2EinsparungTonnenJaehrlich),
    jaehrlicherCO2NutzenTsd: Math.round(jaehrlicherCO2Nutzen / 1000),
    prognosehorizont: p.prognosehorizont,
    diskontierungssatz: p.diskontierungssatz,
    preisbasis: 2012,
  }
}

/**
 * Vergleicht zwei Szenarien und berechnet Deltas
 */
export function compareScenarios(baseParams, compareParams) {
  const baseResult = runModel(baseParams)
  const compareResult = runModel(compareParams)

  const deltaModalSplit = {}
  for (const mode of ['car', 'oepnv', 'bike', 'walk']) {
    deltaModalSplit[mode] =
      compareResult.kpis.modalSplit[mode] - baseResult.kpis.modalSplit[mode]
  }

  const segmentDeltas = compareResult.assignment.segments.map((seg, i) => ({
    ...seg,
    baseLoad: baseResult.assignment.segments[i].load,
    deltaLoad: seg.load - baseResult.assignment.segments[i].load,
    deltaUtilization:
      seg.utilization - baseResult.assignment.segments[i].utilization,
  }))

  // NKA nur berechnen wenn U9-Szenario enthalten ist
  const nka = compareParams.withU9
    ? berechneNKA(baseResult, compareResult)
    : null

  return {
    base: baseResult,
    compare: compareResult,
    deltaModalSplit,
    segmentDeltas,
    deltaTrips: compareResult.kpis.totalTrips - baseResult.kpis.totalTrips,
    deltaUmweltverbund:
      compareResult.kpis.umweltverbund - baseResult.kpis.umweltverbund,
    nka,
  }
}
