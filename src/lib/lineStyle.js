/**
 * Gemeinsame Stil-Logik für Netzbelastungs-Visualisierungen.
 * Wird von NetworkDiagram (SVG) und MapVisualization (Leaflet) importiert.
 *
 * @param {number} utilization - Auslastung als Dezimalzahl (0.0 = 0%, 1.0 = 100%, max ~1.5)
 */

/**
 * Linienbreite basierend auf absoluter Auslastung.
 * 2px bei 0%, 10px bei ≥100%.
 */
export function getLineWidth(utilization) {
  const clamped = Math.min(Math.max(utilization, 0), 1)
  return 2 + clamped * 8
}

/**
 * Linienfarbe basierend auf Auslastungsstufe.
 * Grün < 70%, Gelb 70–90%, Rot > 90%.
 */
export function getLineColor(utilization) {
  if (utilization > 0.9) return '#ef4444'
  if (utilization > 0.7) return '#eab308'
  return '#22c55e'
}
