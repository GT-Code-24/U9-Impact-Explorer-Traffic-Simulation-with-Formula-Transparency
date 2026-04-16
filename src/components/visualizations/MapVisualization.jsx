import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/**
 * Geographische Kartendarstellung mit Leaflet
 * Zeigt U-Bahn-Netz mit Auslastungsfarben
 */

export function MapVisualization({ segments, withU9 }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)

  const stationCoords = {
    moosach: [48.2404, 11.5565],
    mueFreiheit: [48.1785, 11.5756],
    odeonsplatz: [48.1414, 11.5802],
    sendlinger: [48.1339, 11.5657],
    fuerstenried: [48.1067, 11.4957],
    feldmoching: [48.2167, 11.5401],
    hbf: [48.1405, 11.5577],
    mangfallplatz: [48.0824, 11.5713],
    messestadtOst: [48.0698, 11.6801],
    olympia: [48.1732, 11.5485],
    schwanthaler: [48.1301, 11.5331],
    westendstrasse: [48.1381, 11.5207],
    arabellapark: [48.1368, 11.6196],
    laimerPlatz: [48.1551, 11.4763],
    neuperlachSued: [48.0667, 11.5883],
    garching: [48.2677, 11.6281],
    froettmaning: [48.2564, 11.5933],
    klinikum: [48.0851, 11.4766],
    implerstrasse: [48.1252, 11.5501],
    poccistrasse: [48.1330, 11.5545],
    pinakotheken: [48.1479, 11.5689],
    elisabethplatz: [48.1609, 11.5741],
  }

  const lineConfigs = [
    {
      id: 'U1',
      coords: [stationCoords.olympia, stationCoords.hbf, stationCoords.sendlinger, stationCoords.mangfallplatz],
      segmentId: 'stammstrecke2',
      color: '#3d7c2a',
    },
    {
      id: 'U2',
      coords: [stationCoords.feldmoching, stationCoords.hbf, stationCoords.sendlinger, stationCoords.messestadtOst],
      segmentId: 'stammstrecke2',
      color: '#c4122f',
    },
    {
      id: 'U3',
      coords: [stationCoords.moosach, stationCoords.mueFreiheit, stationCoords.odeonsplatz, stationCoords.sendlinger, stationCoords.fuerstenried],
      segmentId: 'stammstrecke1',
      color: '#ec6726',
    },
    {
      id: 'U6',
      coords: [stationCoords.garching, stationCoords.froettmaning, stationCoords.mueFreiheit, stationCoords.odeonsplatz, stationCoords.sendlinger, stationCoords.klinikum],
      segmentId: 'stammstrecke1',
      color: '#0065ae',
    },
    {
      id: 'U4',
      coords: [stationCoords.westendstrasse, stationCoords.schwanthaler, stationCoords.hbf, stationCoords.arabellapark],
      segmentId: 'u4u5_core',
      color: '#00a984',
    },
    {
      id: 'U5',
      coords: [stationCoords.laimerPlatz, stationCoords.schwanthaler, stationCoords.hbf, stationCoords.neuperlachSued],
      segmentId: 'u4u5_core',
      color: '#b47c00',
    },
  ]

  if (withU9) {
    lineConfigs.push({
      id: 'U9',
      coords: [stationCoords.implerstrasse, stationCoords.poccistrasse, stationCoords.hbf, stationCoords.pinakotheken, stationCoords.elisabethplatz, stationCoords.mueFreiheit],
      segmentId: 'u9_core',
      color: '#9333ea',
    })
  }

  useEffect(() => {
    if (!mapRef.current || !segments) return

    // Initialisiere Karte beim ersten Render
    if (!mapInstanceRef.current) {
      const map = L.map(mapRef.current).setView([48.1414, 11.5802], 11)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)
      mapInstanceRef.current = map
    }

    const map = mapInstanceRef.current

    // Entferne alte Layer (außer TileLayer)
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.CircleMarker) {
        map.removeLayer(layer)
      }
    })

    // Hilfsfunktion: Farbe basierend auf Auslastung
    const getColor = (utilization) => {
      if (utilization > 0.9) return '#dc2626'
      if (utilization > 0.7) return '#eab308'
      return '#16a34a'
    }

    const getWeight = (utilization) => 2 + utilization * 4

    // Zeichne Linien
    lineConfigs.forEach((line) => {
      const seg = segments.find((s) => s.id === line.segmentId)
      if (!seg || seg.load === 0) return

      const color = getColor(seg.utilization)
      const weight = getWeight(seg.utilization)

      L.polyline(line.coords, {
        color,
        weight,
        opacity: 0.7,
        dashArray: line.id === 'U9' ? '5 5' : undefined,
      })
        .bindPopup(`<b>${line.id}: ${seg.name}</b><br/>Last: ${seg.load} Pax/Tag<br/>Auslastung: ${(seg.utilization * 100).toFixed(1)}%`)
        .addTo(map)
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
      }).addTo(map)
    })
  }, [segments, withU9])

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Geographische Netzbelastung – Münchner U-Bahn
      </h3>

      <div className="bg-slate-50 rounded p-3 mb-3">
        <p className="text-xs text-slate-600 leading-relaxed">
          Interaktive Karte der U-Bahn-Linien. Liniendicke und Farbe zeigen Auslastung. Zoom mit Mausrad, Verschieben mit
          Klick+Ziehen. Klick auf Linien zeigt Details.
        </p>
      </div>

      {/* Leaflet-Kartencontainer */}
      <div
        ref={mapRef}
        className="bg-white rounded-lg border border-slate-200 overflow-hidden mb-4"
        style={{ height: 500 }}
      />

      {/* Legende */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-white rounded border border-slate-200 p-3">
          <p className="font-semibold text-slate-700 mb-2">Auslastung</p>
          <div className="space-y-1">
            {[
              { color: '#16a34a', label: '< 70%', desc: 'OK' },
              { color: '#eab308', label: '70–90%', desc: 'Warnung' },
              { color: '#dc2626', label: '> 90%', desc: 'Überlastet' },
            ].map(({ color, label, desc }, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-2 rounded" style={{ backgroundColor: color }} />
                <span className="text-slate-600">{label} ({desc})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded border border-slate-200 p-3">
          <p className="font-semibold text-slate-700 mb-2">Linien</p>
          <div className="space-y-1">
            {[
              { id: 'U1', color: '#3d7c2a' },
              { id: 'U3/U6', color: '#0065ae' },
              { id: 'U4/U5', color: '#00a984' },
              ...(withU9 ? [{ id: 'U9', color: '#9333ea' }] : []),
            ].map(({ id, color }, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-6 h-1 rounded" style={{ backgroundColor: color }} />
                <span className="text-slate-600">{id}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
        <p>
          <strong>Hinweis:</strong> Koordinaten sind vereinfacht (nicht exakte Stationspositionen). Die Visualisierung
          zeigt Netzstruktur und relative Auslastungen der kritischen Abschnitte.
        </p>
      </div>
    </div>
  )
}
