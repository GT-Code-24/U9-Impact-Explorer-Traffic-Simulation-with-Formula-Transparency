/**
 * Stufe 3: Verkehrsmittelwahl (Mode Choice)
 *
 * Nested Logit-Modell (NL) — ersetzt einfaches MNL
 *
 * Struktur:
 *   Nest "Motorisiert" [λ_m]       Nest "Muskelbetrieben" [λ_h]
 *     ├── Auto                        ├── Rad
 *     └── ÖPNV                        └── Fuß
 *
 * Formel:
 *   Untere Ebene (innerhalb Nest):
 *     P(m | nest) = exp(V_m / λ) / Σ_k∈nest exp(V_k / λ)
 *
 *   Logsum (Nest-Attractivität):
 *     I_nest = λ × log( Σ_k∈nest exp(V_k / λ) )
 *
 *   Obere Ebene (zwischen Nests):
 *     P(nest) = exp(I_nest) / Σ_n exp(I_n)
 *
 *   Gesamtwahrscheinlichkeit:
 *     P(m) = P(nest(m)) × P(m | nest(m))
 *
 * Quelle: Munizaga et al. (2000) "Mixed Logit vs. Nested Logit and Probit Models"
 *         Shoman & Moreno (2021) Transportation Research Record (München-Kalibrierung)
 *
 * Utility-Funktionen:
 *   V_car   = ASC_car   + β_time × tt_car   + β_cost × cost_car
 *   V_oepnv = ASC_oepnv + β_time × tt_oepnv + β_cost × cost_oepnv + β_comfort × comfort + β_crowd × crowding
 *   V_bike  = ASC_bike  + β_time × tt_bike   + β_infra × bikeInfra
 *   V_walk  = ASC_walk  + β_time × tt_walk
 *
 * Kostenberechnung:
 *   cost_car   = Entfernung × Kraftstoffverbrauch × Kraftstoffpreis + Parken
 *   cost_oepnv = Monatskarte / Fahrten pro Monat
 */

import { logitParams, defaultCosts, avgDistanceByMode } from '../data/calibration.js'
import {
  travelTimeCar,
  travelTimeBike,
  travelTimeWalk,
} from '../data/zones.js'

/**
 * Nested Logit: Nest-Parameter (λ)
 * λ=1.0 → entspricht MNL (keine Korrelation innerhalb Nest)
 * λ<1.0 → stärkere Korrelation innerhalb des Nests (realistischer)
 * Bedingung für Konsistenz mit Nutzenmaximierung: 0 < λ ≤ 1.0
 */
const LAMBDA_MOTORIZED = 0.7  // Nest: Auto + ÖPNV (ähnliche Reisegeschwindigkeit)
const LAMBDA_HUMAN     = 0.5  // Nest: Rad + Fuß (stärkere Ähnlichkeit)

export function calculateModeChoice(odMatrix, travelTimeOEPNV, params = {}) {
  const {
    fuelPrice = defaultCosts.fuelPrice,
    oepnvMonthlyPass = defaultCosts.oepnvMonthlyPass,
    bikeInfraQuality = defaultCosts.bikeInfraQuality,
    u9ComfortBonus = 0,
    crowdingPenalty = 0,   // Überlastungsabzug aus Rückkopplung (Stufe 4 → Stufe 3)
  } = params

  const n = odMatrix.length

  // Kosten pro Fahrt berechnen
  const costCarPerTrip =
    avgDistanceByMode.car * defaultCosts.fuelConsumption * fuelPrice +
    defaultCosts.parkingCostPerTrip
  const costOepnvPerTrip = oepnvMonthlyPass / defaultCosts.oepnvTripsPerMonth

  // Normierte Rad-Infrastruktur (0-1)
  const bikeInfraNorm = bikeInfraQuality / 10

  // Ergebnis-Matrizen pro Verkehrsmittel
  const modes = ['car', 'oepnv', 'bike', 'walk']
  const modeTrips = {}
  modes.forEach((m) => {
    modeTrips[m] = Array.from({ length: n }, () => new Array(n).fill(0))
  })

  let totalByMode = { car: 0, oepnv: 0, bike: 0, walk: 0 }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const trips = odMatrix[i][j]
      if (trips === 0) continue

      const ttOepnv = travelTimeOEPNV[i][j]
      const ttCar = travelTimeCar[i][j]
      const ttBike = travelTimeBike[i][j]
      const ttWalk = travelTimeWalk[i][j]

      // Nutzen (Utility) pro Modus
      const V_car =
        logitParams.ASC_car +
        logitParams.beta_time * ttCar +
        logitParams.beta_cost * costCarPerTrip

      const V_oepnv =
        logitParams.ASC_oepnv +
        logitParams.beta_time * ttOepnv +
        logitParams.beta_cost * costOepnvPerTrip +
        logitParams.beta_comfort * u9ComfortBonus +
        crowdingPenalty  // negativ wenn Stammstrecke überlastet (aus Rückkopplung)

      const V_bike =
        logitParams.ASC_bike +
        logitParams.beta_time * ttBike +
        logitParams.beta_infra * bikeInfraNorm

      const V_walk =
        logitParams.ASC_walk +
        logitParams.beta_time * ttWalk

      // ── Nested Logit (Munizaga 2000) ──────────────────────────────────
      // Untere Ebene: Utility skaliert durch Nest-Parameter λ

      // Nest 1: Motorisiert (Auto + ÖPNV)
      const e_car_m   = Math.exp(V_car   / LAMBDA_MOTORIZED)
      const e_oepnv_m = Math.exp(V_oepnv / LAMBDA_MOTORIZED)
      const sum_motor = e_car_m + e_oepnv_m
      // Logsum = erwarteter Maximalnutzen innerhalb des Nests
      const I_motor = LAMBDA_MOTORIZED * Math.log(sum_motor)

      // Nest 2: Muskelbetrieben (Rad + Fuß)
      const e_bike_h = Math.exp(V_bike / LAMBDA_HUMAN)
      const e_walk_h = Math.exp(V_walk / LAMBDA_HUMAN)
      const sum_human = e_bike_h + e_walk_h
      const I_human  = LAMBDA_HUMAN * Math.log(sum_human)

      // Obere Ebene: Wahl zwischen Nests
      const eNest_motor = Math.exp(I_motor)
      const eNest_human = Math.exp(I_human)
      const sumNest = eNest_motor + eNest_human

      const P_motor = eNest_motor / sumNest
      const P_human = eNest_human / sumNest

      // Bedingte Wahrscheinlichkeiten innerhalb der Nests
      const prob = {
        car:   P_motor * (e_car_m   / sum_motor),
        oepnv: P_motor * (e_oepnv_m / sum_motor),
        bike:  P_human * (e_bike_h  / sum_human),
        walk:  P_human * (e_walk_h  / sum_human),
      }
      // ─────────────────────────────────────────────────────────────────

      // Fahrten auf Modi aufteilen
      for (const m of modes) {
        const mTrips = Math.round(trips * prob[m])
        modeTrips[m][i][j] = mTrips
        totalByMode[m] += mTrips
      }
    }
  }

  // Modal Split berechnen
  const totalAll = Object.values(totalByMode).reduce((a, b) => a + b, 0)
  const modalSplit = {}
  for (const m of modes) {
    modalSplit[m] = totalAll > 0 ? totalByMode[m] / totalAll : 0
  }

  return {
    modeTrips,
    totalByMode,
    modalSplit,
    umweltverbund: modalSplit.oepnv + modalSplit.bike + modalSplit.walk,
  }
}
