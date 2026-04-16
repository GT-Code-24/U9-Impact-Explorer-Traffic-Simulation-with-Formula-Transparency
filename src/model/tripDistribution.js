/**
 * Stufe 2: Verkehrsverteilung (Trip Distribution)
 *
 * Doubly-constrained Gravitationsmodell mit Furness-Iteration.
 *
 * Formel:
 *   T_ij = A_i × O_i × B_j × D_j × f(c_ij)
 *   f(c_ij) = c_ij^α × exp(-β × c_ij)   [Tanner-Impedanz, 1961]
 *
 * wobei c_ij = generalisierte Reisezeit (Min.) zwischen Zone i und j
 * α=0 → rein exponentiell (klassisch); α=0.5 → kombiniert (besser für Kurzstrecken)
 * Quelle: AETRANSPORT "Alternative Gravity Modelling Approaches"
 *
 * Furness-Iteration:
 *   1. T_ij = O_i × D_j × f(c_ij)
 *   2. Zeilenbalancierung: A_i = O_i / Σ_j T_ij
 *   3. Spaltenbalancierung: B_j = D_j / Σ_i T_ij
 *   4. Wiederholen bis Konvergenz (max. Zeilen-/Spaltenfehler < 1%)
 */

import { gravityParams } from '../data/calibration.js'

/**
 * Tanner-Impedanzfunktion: f(t) = t^α × exp(-β × t)
 * α=0 → klassisch exponentiell; α>0 → kombiniert (besser für kurze Stadtverkehrswege)
 */
function tannerImpedance(t, beta, alpha) {
  if (t <= 0) return 1
  return Math.pow(t, alpha) * Math.exp(-beta * t)
}

export function calculateTripDistribution(productions, attractions, travelTimeMatrix, params = {}) {
  const beta = params.beta || gravityParams.beta
  const alpha = params.alpha !== undefined ? params.alpha : gravityParams.alpha
  const maxIter = gravityParams.maxIterations
  const threshold = gravityParams.convergenceThreshold
  const n = productions.length

  // Impedanzmatrix berechnen (Tanner-Funktion)
  const impedance = []
  for (let i = 0; i < n; i++) {
    impedance[i] = []
    for (let j = 0; j < n; j++) {
      if (i === j) {
        // Binnenverkehr: kurze Wege innerhalb der Zone (ca. 5 Min.)
        impedance[i][j] = tannerImpedance(5, beta, alpha)
      } else {
        impedance[i][j] = tannerImpedance(travelTimeMatrix[i][j], beta, alpha)
      }
    }
  }

  // Initialisierung der OD-Matrix
  let odMatrix = []
  for (let i = 0; i < n; i++) {
    odMatrix[i] = []
    for (let j = 0; j < n; j++) {
      odMatrix[i][j] = productions[i] * attractions[j] * impedance[i][j]
    }
  }

  // Furness-Iteration (doubly-constrained)
  let converged = false
  let iteration = 0

  while (!converged && iteration < maxIter) {
    converged = true
    iteration++

    // Zeilenbalancierung (Production constraint)
    for (let i = 0; i < n; i++) {
      const rowSum = odMatrix[i].reduce((a, b) => a + b, 0)
      if (rowSum > 0) {
        const factor = productions[i] / rowSum
        if (Math.abs(factor - 1) > threshold) converged = false
        for (let j = 0; j < n; j++) {
          odMatrix[i][j] *= factor
        }
      }
    }

    // Spaltenbalancierung (Attraction constraint)
    for (let j = 0; j < n; j++) {
      let colSum = 0
      for (let i = 0; i < n; i++) {
        colSum += odMatrix[i][j]
      }
      if (colSum > 0) {
        const factor = attractions[j] / colSum
        if (Math.abs(factor - 1) > threshold) converged = false
        for (let i = 0; i < n; i++) {
          odMatrix[i][j] *= factor
        }
      }
    }
  }

  // Runden
  const roundedMatrix = odMatrix.map((row) => row.map((v) => Math.round(v)))

  // RMSE: Konvergenzqualität messen (Evans 1971)
  // Vergleich: Zeilensummen modelliert vs. Produktionsvorgaben
  // Niedrigerer RMSE = bessere Reproduktion der Randsummen
  let sumSqErr = 0
  for (let i = 0; i < n; i++) {
    const rowSum = roundedMatrix[i].reduce((a, b) => a + b, 0)
    sumSqErr += Math.pow(rowSum - productions[i], 2)
  }
  const rmse = Math.sqrt(sumSqErr / n)
  const rmseRelative = productions.reduce((a, b) => a + b, 0) > 0
    ? rmse / (productions.reduce((a, b) => a + b, 0) / n)
    : 0

  return {
    odMatrix: roundedMatrix,
    iterations: iteration,
    converged,
    totalTrips: roundedMatrix.flat().reduce((a, b) => a + b, 0),
    rmse: Math.round(rmse),
    rmseRelative: Math.round(rmseRelative * 1000) / 10, // in Prozent, 1 Dezimalstelle
  }
}
