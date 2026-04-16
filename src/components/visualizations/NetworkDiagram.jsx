import { useMemo } from 'react'
import { networkPaths } from '../../data/network.js'
import { criticalSegments } from '../../data/network.js'
import { formatNumber } from '../../lib/formatters.js'

const LINE_COLORS = {
  U1: '#3d7c2a',
  U2: '#c4122f',
  U3: '#ec6726',
  U4: '#00a984',
  U5: '#b47c00',
  U6: '#0065ae',
  U9: '#9333ea',
}

function getStrokeWidth(load, maxLoad) {
  const minWidth = 2
  const maxWidth = 14
  if (load === 0) return minWidth
  return minWidth + (load / maxLoad) * (maxWidth - minWidth)
}

function getUtilizationColor(utilization) {
  if (utilization > 0.9) return '#dc2626'
  if (utilization > 0.7) return '#eab308'
  return '#16a34a'
}

export function NetworkDiagram({ segments, withU9 }) {
  const maxLoad = useMemo(() => {
    return Math.max(...segments.map((s) => s.load), 1)
  }, [segments])

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

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Schematische Netzbelastung
      </h3>
      <div className="bg-white rounded-lg border border-slate-200 p-2">
        <svg viewBox="0 0 600 620" className="w-full" style={{ maxHeight: 420 }}>
          {/* Hintergrund */}
          <rect width="600" height="620" fill="#fafbfc" rx="8" />

          {/* U-Bahn-Linien (Hintergrund dünn, immer sichtbar) */}
          {lineOrder.map((lineId) => {
            const pathData = networkPaths[lineId]
            if (!pathData) return null
            const isU9 = lineId === 'U9'

            return (
              <path
                key={`bg-${lineId}`}
                d={pathData.path}
                fill="none"
                stroke={LINE_COLORS[lineId]}
                strokeWidth={2}
                strokeOpacity={isU9 ? 0.3 : 0.15}
                strokeDasharray={isU9 ? '6 4' : undefined}
              />
            )
          })}

          {/* Belastungsdarstellung (dicker, je nach Last) */}
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

            // Bei geteilten Linien (U3/U6, U1/U2, U4/U5) Last halbieren
            const shared =
              lineId === 'U3' ||
              lineId === 'U6' ||
              lineId === 'U1' ||
              lineId === 'U2' ||
              lineId === 'U4' ||
              lineId === 'U5'
            const displayLoad = shared ? seg.load / 2 : seg.load

            const width = getStrokeWidth(displayLoad, maxLoad)
            const color = getUtilizationColor(seg.utilization)

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

          {/* Stationen */}
          {lineOrder.map((lineId) => {
            const pathData = networkPaths[lineId]
            if (!pathData) return null

            return pathData.stations.map((station, si) => (
              <g key={`station-${lineId}-${si}`}>
                <circle
                  cx={station.x}
                  cy={station.y}
                  r={4}
                  fill="white"
                  stroke={LINE_COLORS[lineId]}
                  strokeWidth={2}
                />
                <text
                  x={station.x + 8}
                  y={station.y + 3}
                  fontSize={9}
                  fill="#475569"
                  fontFamily="system-ui"
                >
                  {station.name}
                </text>
              </g>
            ))
          })}

          {/* Legende */}
          <g transform="translate(20, 560)">
            <text fontSize={10} fontWeight="600" fill="#334155">
              Auslastung:
            </text>
            {[
              { color: '#16a34a', label: '< 70%' },
              { color: '#eab308', label: '70–90%' },
              { color: '#dc2626', label: '> 90%' },
            ].map(({ color, label }, i) => (
              <g key={i} transform={`translate(${75 + i * 80}, 0)`}>
                <rect y={-8} width={12} height={12} rx={2} fill={color} fillOpacity={0.5} />
                <text x={16} fontSize={10} fill="#475569">
                  {label}
                </text>
              </g>
            ))}
          </g>

          {/* Liniennamen-Legende */}
          <g transform="translate(20, 585)">
            {lineOrder.map((lineId, i) => (
              <g key={lineId} transform={`translate(${i * 55}, 0)`}>
                <rect
                  y={-9}
                  width={30}
                  height={14}
                  rx={3}
                  fill={LINE_COLORS[lineId]}
                />
                <text
                  x={15}
                  fontSize={9}
                  fontWeight="600"
                  fill="white"
                  textAnchor="middle"
                >
                  {lineId}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
    </div>
  )
}
