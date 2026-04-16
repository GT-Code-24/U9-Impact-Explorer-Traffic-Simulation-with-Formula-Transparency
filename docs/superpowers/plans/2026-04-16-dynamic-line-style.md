# Dynamic Line Style (Netzbelastung) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Liniendicke und Farbe in NetworkDiagram (SVG) und MapVisualization (Leaflet) werden dynamisch und sichtbar durch Schieberegler-Änderungen gesteuert.

**Architecture:** Neue shared Utility `src/lib/lineStyle.js` liefert `getLineWidth(utilization)` und `getLineColor(utilization)`. NetworkDiagram ersetzt relative `load/maxLoad`-Formel durch absolute `utilization`-basierte Berechnung. MapVisualization benutzt `L.LayerGroup` statt `eachLayer`-Iteration für atomares Layer-Cleanup.

**Tech Stack:** React 19, Vite 8, Leaflet 1.9, SVG (kein D3 in diesen Komponenten), Tailwind CSS

**Spec:** `docs/superpowers/specs/2026-04-16-dynamic-line-style-design.md`

---

## Dateiübersicht

| Aktion   | Datei                                                              | Verantwortlichkeit                        |
|----------|--------------------------------------------------------------------|-------------------------------------------|
| Erstellen | `src/lib/lineStyle.js`                                            | Geteilte Stil-Logik (Breite + Farbe)      |
| Ändern   | `src/components/visualizations/NetworkDiagram.jsx`                | SVG-Darstellung, nutzt lineStyle          |
| Ändern   | `src/components/visualizations/MapVisualization.jsx`              | Leaflet-Darstellung, nutzt lineStyle + LayerGroup |
| Erstellen | `Archiv/v3.0-backup-2026-04-16/` (ZIP)                           | Sicherungskopie vor Änderungen            |

---

## Task 1: Backup erstellen

**Files:**
- Create: `Archiv/` (neuer Ordner im Projektverzeichnis)

- [ ] **Schritt 1: Archiv-Ordner anlegen und ZIP erstellen**

Führe im Projektverzeichnis `Code/intraplan-u9-explorer/` aus:

```bash
mkdir -p Archiv
zip -r "Archiv/v3.0-backup-2026-04-16.zip" \
  src/ \
  public/ \
  index.html \
  package.json \
  vite.config.js \
  --exclude "*/node_modules/*" \
  --exclude "*/.git/*"
```

Falls `zip` unter Windows nicht verfügbar:
```bash
powershell Compress-Archive -Path src,public,index.html,package.json,vite.config.js -DestinationPath "Archiv/v3.0-backup-2026-04-16.zip"
```

- [ ] **Schritt 2: Backup prüfen**

```bash
ls -la Archiv/
```

Erwartete Ausgabe: `v3.0-backup-2026-04-16.zip` vorhanden, Größe > 100 KB.

---

## Task 2: Shared Utility `lineStyle.js` erstellen

**Files:**
- Create: `src/lib/lineStyle.js`

- [ ] **Schritt 1: Datei erstellen**

Inhalt von `src/lib/lineStyle.js`:

```js
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
```

- [ ] **Schritt 2: Import manuell testen (Node-Snippet)**

```bash
node --input-type=module <<'EOF'
import { getLineWidth, getLineColor } from './src/lib/lineStyle.js'

// Erwartete Werte:
console.assert(getLineWidth(0)    === 2,  'Breite bei 0%')
console.assert(getLineWidth(0.5)  === 6,  'Breite bei 50%')
console.assert(getLineWidth(1.0)  === 10, 'Breite bei 100%')
console.assert(getLineWidth(1.5)  === 10, 'Clamp bei 150%')
console.assert(getLineColor(0.5)  === '#22c55e', 'Grün bei 50%')
console.assert(getLineColor(0.75) === '#eab308', 'Gelb bei 75%')
console.assert(getLineColor(0.95) === '#ef4444', 'Rot bei 95%')
console.log('Alle Assertions bestanden.')
EOF
```

Erwartete Ausgabe: `Alle Assertions bestanden.`

- [ ] **Schritt 3: Commit**

```bash
git add src/lib/lineStyle.js
git commit -m "feat: add shared getLineWidth/getLineColor utility"
```

---

## Task 3: NetworkDiagram.jsx aktualisieren

**Files:**
- Modify: `src/components/visualizations/NetworkDiagram.jsx`

- [ ] **Schritt 1: Import hinzufügen und lokale Funktionen entfernen**

Ersetze die ersten 27 Zeilen der Datei (Imports + lokale Stil-Funktionen):

```jsx
import { useMemo } from 'react'
import { networkPaths } from '../../data/network.js'
import { criticalSegments } from '../../data/network.js'
import { getLineWidth, getLineColor } from '../../lib/lineStyle.js'

const LINE_COLORS = {
  U1: '#3d7c2a',
  U2: '#c4122f',
  U3: '#ec6726',
  U4: '#00a984',
  U5: '#b47c00',
  U6: '#0065ae',
  U9: '#9333ea',
}
```

Die Funktionen `getStrokeWidth` und `getUtilizationColor` werden vollständig entfernt (Zeilen 16–27 der Originaldatei).

- [ ] **Schritt 2: `useMemo` für `maxLoad` entfernen**

Ersetze den `NetworkDiagram`-Komponentenrumpf: Das `maxLoad`-useMemo (Zeilen 30–32) entfernen. `segmentMap`-useMemo bleibt unverändert:

```jsx
export function NetworkDiagram({ segments, withU9 }) {
  const segmentMap = useMemo(() => {
    const map = {}
    for (const s of segments) {
      map[s.id] = s
    }
    return map
  }, [segments])

  const lineOrder = withU9
    ? ['U4', 'U5', 'U1', 'U2', 'U3', 'U6', 'U9']
    : ['U4', 'U5', 'U1', 'U2', 'U3', 'U6']
```

- [ ] **Schritt 3: Load-Layer-Rendering aktualisieren**

Ersetze den zweiten `{lineOrder.map(...)}` Block (Belastungsdarstellung, ca. Zeilen 76–116):

```jsx
          {/* Belastungsdarstellung (Dicke + Farbe nach Auslastung) */}
          {lineOrder.map((lineId) => {
            const pathData = networkPaths[lineId]
            if (!pathData) return null

            // Finde passenden kritischen Abschnitt
            let seg = null
            if (lineId === 'U3' || lineId === 'U6')
              seg = segmentMap['stammstrecke1']
            else if (lineId === 'U1' || lineId === 'U2')
              seg = segmentMap['stammstrecke2']
            else if (lineId === 'U4' || lineId === 'U5')
              seg = segmentMap['u4u5_core']
            else if (lineId === 'U9') seg = segmentMap['u9_core']

            if (!seg || seg.load === 0) return null

            const width = getLineWidth(seg.utilization)
            const color = getLineColor(seg.utilization)

            return (
              <path
                key={`load-${lineId}`}
                d={pathData.path}
                fill="none"
                stroke={color}
                strokeWidth={width}
                strokeOpacity={0.5}
                strokeLinecap="round"
              />
            )
          })}
```

- [ ] **Schritt 4: Legende auf neue Farben aktualisieren**

Ersetze den Legende-Block (ca. Zeilen 147–163):

```jsx
          {/* Legende */}
          <g transform="translate(20, 560)">
            <text fontSize={10} fontWeight="600" fill="#334155">
              Auslastung:
            </text>
            {[
              { color: '#22c55e', label: '< 70%' },
              { color: '#eab308', label: '70–90%' },
              { color: '#ef4444', label: '> 90%' },
            ].map(({ color, label }, i) => (
              <g key={i} transform={`translate(${75 + i * 80}, 0)`}>
                <rect y={-8} width={12} height={12} rx={2} fill={color} fillOpacity={0.5} />
                <text x={16} fontSize={10} fill="#475569">
                  {label}
                </text>
              </g>
            ))}
          </g>
```

- [ ] **Schritt 5: Dev-Server starten und visuell prüfen**

```bash
npm run dev
```

Öffne `http://localhost:5173`. Gehe zu Tab **"Netzbelastung"**. Bewege den **Wegerate**-Slider von 3.0 auf 4.0.

Erwartetes Verhalten:
- Liniendicke nimmt zu (dickere Overlays sichtbar)
- Farbe ändert sich wenn Auslastung 70% oder 90% überschreitet
- Bei tripRate 4.0 sollte stammstrecke1 (~75% → ~100%) von Gelb zu Rot wechseln

- [ ] **Schritt 6: Commit**

```bash
git add src/components/visualizations/NetworkDiagram.jsx
git commit -m "fix: use absolute utilization for line width in NetworkDiagram"
```

---

## Task 4: MapVisualization.jsx aktualisieren

**Files:**
- Modify: `src/components/visualizations/MapVisualization.jsx`

- [ ] **Schritt 1: Imports aktualisieren**

Ersetze die ersten 3 Zeilen der Datei:

```jsx
import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { getLineColor, getLineWidth } from '../../lib/lineStyle.js'
```

- [ ] **Schritt 2: LayerGroup-Ref hinzufügen**

Direkt nach der Komponenten-Signatur und den zwei bestehenden `useRef`-Deklarationen:

```jsx
export function MapVisualization({ segments, withU9 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const layerGroupRef = useRef(null)
```

- [ ] **Schritt 3: Map-Initialisierung mit LayerGroup**

Ersetze den Initialisierungsblock im `useEffect` (die `if (!mapInstanceRef.current)` Sektion):

```jsx
    // Initialisiere Karte beim ersten Render
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([48.1414, 11.5802], 11)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)
      mapInstanceRef.current = map
      layerGroupRef.current = L.layerGroup().addTo(map)
    }
```

- [ ] **Schritt 4: Cleanup und Layer-Rendering ersetzen**

Hinweis: `lineConfigs` und `stationCoords` bleiben unverändert im Komponenten-Body (vor dem `useEffect`) definiert. Nur der Inhalt des `useEffect`-Callbacks wird ersetzt.

Ersetze den gesamten Block von `const map = mapInstanceRef.current` bis zum Ende des `useEffect`-Callbacks (alles nach der Initialisierung):

```jsx
    const map = mapInstanceRef.current

    // Atomar alle dynamischen Layer entfernen (LayerGroup statt eachLayer-Iteration)
    layerGroupRef.current.clearLayers()

    // Zeichne Linien
    lineConfigs.forEach((line) => {
      const seg = segments.find((s) => s.id === line.segmentId)
      if (!seg || seg.load === 0) return

      const color = getLineColor(seg.utilization)
      const weight = getLineWidth(seg.utilization)

      L.polyline(line.coords, {
        color,
        weight,
        opacity: 0.7,
        dashArray: line.id === 'U9' ? '5 5' : undefined,
      })
        .bindPopup(`<b>${line.id}: ${seg.name}</b><br/>Last: ${seg.load} Pax/Tag<br/>Auslastung: ${(seg.utilization * 100).toFixed(1)}%`)
        .addTo(layerGroupRef.current)
    })

    // Zeichne Stationen
    Object.entries(stationCoords).forEach(([, coords]) => {
      L.circleMarker(coords, {
        radius: 4,
        fillColor: 'white',
        color: '#475569',
        weight: 1.5,
        opacity: 0.8,
        fillOpacity: 1,
      }).addTo(layerGroupRef.current)
    })
  }, [segments, withU9])
```

- [ ] **Schritt 5: Legende auf neue Farben aktualisieren**

Ersetze den Auslastungs-Legenden-Block im JSX (die drei `color`-Einträge):

```jsx
            {[
              { color: '#22c55e', label: '< 70%', desc: 'OK' },
              { color: '#eab308', label: '70–90%', desc: 'Warnung' },
              { color: '#ef4444', label: '> 90%', desc: 'Überlastet' },
            ].map(({ color, label, desc }, i) => (
```

- [ ] **Schritt 6: Lokale `getColor` und `getWeight` Funktionen entfernen**

Entferne die zwei lokal definierten Hilfsfunktionen aus dem `useEffect`-Body (Zeilen 110–116 des Originals):

```js
// Diese Zeilen entfernen:
    const getColor = (utilization) => { ... }
    const getWeight = (utilization) => 2 + utilization * 4
```

- [ ] **Schritt 7: Visuell prüfen (Map-Tab)**

Dev-Server läuft noch auf `http://localhost:5173`. Gehe zu Tab **"Geographische Karte"**. Bewege den **Wegerate**-Slider von 3.0 auf 4.0.

Erwartetes Verhalten:
- Leaflet-Linien werden dicker und ändern Farbe (identisch mit NetworkDiagram-Verhalten)
- Kein Layer-Duplikat sichtbar (LayerGroup cleared sauber)
- Popup bei Klick auf Linie zeigt korrekte Auslastungs-% an

- [ ] **Schritt 8: Commit**

```bash
git add src/components/visualizations/MapVisualization.jsx
git commit -m "fix: use LayerGroup and shared lineStyle in MapVisualization"
```

---

## Task 5: Build & Deployment

**Files:**
- Modify: `dist/` (generiert von Vite)

- [ ] **Schritt 1: Produktions-Build erstellen**

```bash
npm run build
```

Erwartete Ausgabe (ähnlich):
```
vite v8.x.x building for production...
✓ N modules transformed.
dist/index.html                   X.XX kB
dist/assets/index-[hash].js       XXX.XX kB │ gzip: XX.XX kB
dist/assets/index-[hash].css      XX.XX kB  │ gzip: X.XX kB
✓ built in Xs
```

Kein `ERROR` in der Ausgabe.

- [ ] **Schritt 2: Build lokal prüfen**

```bash
npm run preview
```

Öffne `http://localhost:4173`. Beide Tabs (Netzbelastung + Geographische Karte) testen: Slider bewegen → Linien reagieren sichtbar. Dev-Server stoppen mit `Ctrl+C`.

- [ ] **Schritt 3: Alle Änderungen committen und pushen**

```bash
git status
git add dist/
git commit -m "feat: add dynamic line thickness and color scaling based on network load"
git push
```

Erwartete Ausgabe nach Push: Kein `rejected`. Deployment wird getriggert.

---

## Verifikations-Checkliste (nach Deployment)

- [ ] Tab "Netzbelastung": Linien ändern Dicke + Farbe bei Slider-Änderung
- [ ] Tab "Geographische Karte": Linien ändern Dicke + Farbe bei Slider-Änderung
- [ ] Beide Tabs: Grün `#22c55e` bei < 70%, Gelb `#eab308` bei 70–90%, Rot `#ef4444` bei > 90%
- [ ] Kein JavaScript-Fehler in der Browser-Konsole
- [ ] `Archiv/v3.0-backup-2026-04-16.zip` vorhanden
