# Design: Dynamische Liniendicke & Farbskalierung (Netzbelastung)

**Datum:** 2026-04-16  
**Status:** Genehmigt  
**Projekt:** intraplan-u9-explorer

---

## Problem

Die Visualisierung der Netzbelastung (NetworkDiagram + MapVisualization) bewirbt dynamische Liniendicke und Farbskalierung basierend auf Auslastung, aber die Darstellung ändert sich nicht sichtbar wenn Schieberegler bewegt werden.

**Root Cause:**

1. `NetworkDiagram.jsx` berechnet Liniendicke mit `load / maxLoad` (relativ). Wenn alle Segmentlasten proportional steigen (z.B. `tripRate`-Slider), bleibt `load/maxLoad` konstant → keine sichtbare Änderung.
2. `MapVisualization.jsx` nutzt `eachLayer()` mit gleichzeitigem `removeLayer()` während der Iteration. Leaflet kann dabei Layer überspringen → stale Layer bleiben sichtbar.
3. Farb-Hex-Codes weichen vom Spec ab (`#16a34a`/`#dc2626` statt `#22c55e`/`#ef4444`).
4. Max-Dicke in NetworkDiagram: 14px statt spezifizierter 10px.

---

## Design

### 1. Neue Shared Utility: `src/lib/lineStyle.js`

Exportiert zwei Funktionen, die von beiden Visualisierungskomponenten importiert werden:

```js
// stroke-width: 2px bei 0% Auslastung, 10px bei ≥100%
export function getLineWidth(utilization) {
  const clamped = Math.min(Math.max(utilization, 0), 1)
  return 2 + clamped * 8
}

// Farbe nach Auslastungsstufe
export function getLineColor(utilization) {
  if (utilization > 0.9) return '#ef4444'  // Rot   >90%
  if (utilization > 0.7) return '#eab308'  // Gelb  70–90%
  return '#22c55e'                          // Grün  <70%
}
```

**Korrekte Basis:** `seg.utilization = seg.load / seg.capacity` (absolut, nicht relativ zu anderen Segmenten).

### 2. NetworkDiagram.jsx

- `getStrokeWidth()` und `getUtilizationColor()` entfernen
- `maxLoad` useMemo entfernen
- `displayLoad`-Halbierungslogik entfernen
- Load-Layer nutzt `getLineWidth(seg.utilization)` und `getLineColor(seg.utilization)`
- Legende aktualisiert auf neue Hex-Farben
- Bedingung `seg.load === 0` bleibt erhalten

### 3. MapVisualization.jsx

- `layerGroupRef = useRef(null)` hinzufügen
- Bei Map-Initialisierung: `L.layerGroup().addTo(map)` → in `layerGroupRef.current` speichern
- Alle Polylines und CircleMarker in `layerGroupRef.current` statt direkt in `map`
- Cleanup: `layerGroupRef.current.clearLayers()` statt `eachLayer`-Iteration
- Lokale `getColor()` und `getWeight()` durch `getLineColor()` und `getLineWidth()` aus `lineStyle.js` ersetzen
- Legende aktualisiert auf neue Hex-Farben

### 4. Backup & Deployment

- `Archiv/`-Ordner im Projektverzeichnis anlegen
- ZIP-Kopie des aktuellen Stands als `v3.0-backup-YYYY-MM-DD.zip`
- `npm run build`
- Git-Commit: `feat: add dynamic line thickness and color scaling based on network load`
- Git-Push → triggert automatisches Deployment

---

## Datenfluss nach Fix

```
Slider bewegt
  → updateParam('tripRate', 4.0)
  → params (neues Objekt)
  → useMemo: runModel(params) → neues result
  → result.assignment.segments (neues Array)
  → NetworkDiagram: seg.utilization steigt → getLineWidth() → dickere Linie ✓
  → MapVisualization: useEffect([segments]) → clearLayers() → neue Linien ✓
```

---

## Nicht im Scope

- Änderungen an Modelllogik (assignment.js, modeChoice.js etc.)
- Neue Visualisierungstypen
- Änderungen an anderen Tabs (Modal Split, OD-Matrix etc.)
