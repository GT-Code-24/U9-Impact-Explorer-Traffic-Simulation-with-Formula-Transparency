/**
 * Stufe 4: Umlegung (Assignment)
 *
 * Vereinfachte All-or-Nothing-Umlegung der ÖPNV-Fahrten
 * auf U-Bahn-Streckenabschnitte.
 *
 * Logik:
 *   1. ÖPNV-Fahrten × U-Bahn-Anteil = U-Bahn-Fahrten pro OD-Paar
 *   2. Für jedes OD-Paar: kürzester Weg über das U-Bahn-Netz
 *   3. Belastung auf jedem Streckenabschnitt aufsummieren
 *   4. Auslastung = Belastung / Kapazität
 */

import { criticalSegments } from '../data/network.js'
import { tripRates } from '../data/calibration.js'
import { zones } from '../data/zones.js'

/**
 * Definiert welche kritischen Streckenabschnitte von einem OD-Paar
 * belastet werden (vereinfachte Routing-Tabelle)
 */
function getRouteSegments(fromZone, toZone, withU9) {
  const segments = []

  // Stammstrecke 1 (U3/U6): Zone 5(Schwabing) ↔ Zone 4(Odeonspl.) ↔ Zone 0(Sendling)
  // Stammstrecke 2 (U1/U2): Zone 2(Hbf) ↔ Zone 0(Sendling)
  // U4/U5: Zone 1(Schwanth.) ↔ Zone 2(Hbf)
  // U6 Nord: Zone 6(Freimann) ↔ Zone 5(Schwabing)
  // U9: Zone 0(Sendling) ↔ Zone 2(Hbf) ↔ Zone 3(MVW) ↔ Zone 4(MVO) ↔ Zone 5(Schwabing)

  const f = fromZone
  const t = toZone
  if (f === t) return segments

  // Hilfsfunktion: liegt eine Zone auf dem Weg?
  const connects = (z1, z2, seg) => {
    const zs = seg.zones
    const i1 = zs.indexOf(z1)
    const i2 = zs.indexOf(z2)
    return i1 !== -1 && i2 !== -1
  }

  // U9-Korridor: wenn U9 vorhanden und beide Zonen auf U9-Route liegen
  const u9Zones = [0, 2, 3, 4, 5]
  const bothOnU9 = withU9 && u9Zones.includes(f) && u9Zones.includes(t)

  if (bothOnU9) {
    // U9 übernimmt diese Relation → belastet U9, entlastet Stammstrecken
    segments.push('u9_core')
    return segments
  }

  // Ansonsten: klassisches Routing über bestehende Linien

  // Zone 6 (Freimann) → immer über U6 Nord nach Schwabing
  if (f === 6 || t === 6) {
    segments.push('u6_nord')
    // Weiter über Stammstrecke 1 nach Süden
    const other = f === 6 ? t : f
    if ([0, 4, 3].includes(other)) {
      segments.push('stammstrecke1')
    }
    // Teilweise über U9 wenn verfügbar
    if (withU9 && [2, 3].includes(other)) {
      segments.push('u9_core')
    }
  }

  // Schwabing (5) ↔ Sendling/Odeonsplatz (0, 4)
  if ((f === 5 || t === 5) && ([0, 4].includes(f) || [0, 4].includes(t))) {
    if (withU9) {
      // Teilverkehr geht über U9
      segments.push('u9_core')
      segments.push('stammstrecke1') // Rest bleibt auf U3/U6
    } else {
      segments.push('stammstrecke1')
    }
  }

  // Hbf (2) ↔ Sendling (0)
  if ((f === 2 && t === 0) || (f === 0 && t === 2)) {
    segments.push('stammstrecke2')
  }

  // Schwanthalerhöhe (1) ↔ Hbf (2)
  if ((f === 1 && t === 2) || (f === 2 && t === 1)) {
    segments.push('u4u5_core')
  }

  // Schwanthalerhöhe (1) → Rest über U4/U5 + Umstieg
  if (f === 1 || t === 1) {
    if (!segments.includes('u4u5_core')) {
      segments.push('u4u5_core')
    }
  }

  // Rest-München (7) → verteilt sich auf alle Linien
  if (f === 7 || t === 7) {
    const other = f === 7 ? t : f
    if ([0, 4, 5].includes(other)) segments.push('stammstrecke1')
    if ([0, 2].includes(other)) segments.push('stammstrecke2')
    if (other === 1) segments.push('u4u5_core')
    if (other === 6) segments.push('u6_nord')
    if (withU9 && [3, 4].includes(other)) segments.push('u9_core')
  }

  return [...new Set(segments)] // Duplikate entfernen
}

export function calculateAssignment(oepnvTrips, params = {}) {
  const { withU9 = false } = params
  const n = zones.length
  const ubahnFactor = tripRates.oepnvToUBahnFactor

  // Belastung pro kritischem Abschnitt initialisieren
  const loads = {}
  for (const seg of criticalSegments) {
    loads[seg.id] = 0
  }

  // Alle OD-Paare durchgehen
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i === j) continue
      const trips = oepnvTrips[i][j] * ubahnFactor
      if (trips === 0) continue

      const routeSegments = getRouteSegments(i, j, withU9)

      for (const segId of routeSegments) {
        if (loads[segId] !== undefined) {
          loads[segId] += trips
        }
      }
    }
  }

  // Ergebnis mit Auslastung berechnen
  const segmentResults = criticalSegments.map((seg) => {
    const load = Math.round(loads[seg.id])
    const utilization = seg.capacity > 0 ? load / seg.capacity : 0
    const isU9 = seg.id === 'u9_core'

    // Baseline-Vergleich (nur für bestehende Linien)
    const baseLoad = isU9 ? 0 : seg.baseLoad
    const relief = baseLoad > 0 ? (baseLoad - load) / baseLoad : 0

    return {
      ...seg,
      load,
      utilization: Math.min(utilization, 1.5), // Cap bei 150% für Darstellung
      relief,
      status:
        utilization > 0.9
          ? 'overloaded'
          : utilization > 0.7
            ? 'warning'
            : 'ok',
    }
  })

  return {
    segments: segmentResults,
    totalUBahnTrips: Object.values(loads).reduce((a, b) => a + b, 0),
    loads,
  }
}
