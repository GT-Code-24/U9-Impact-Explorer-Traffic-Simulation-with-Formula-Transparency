import { useMemo } from 'react'
import { zones } from '../../data/zones.js'
import { formatNumber } from '../../lib/formatters.js'

export function ODMatrix({ odMatrix }) {
  const maxValue = useMemo(() => {
    let max = 0
    for (let i = 0; i < odMatrix.length; i++) {
      for (let j = 0; j < odMatrix[i].length; j++) {
        if (i !== j && odMatrix[i][j] > max) max = odMatrix[i][j]
      }
    }
    return max
  }, [odMatrix])

  const cellSize = 52
  const labelWidth = 50
  const n = zones.length

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        OD-Matrix (Fahrten/Tag)
      </h3>
      <div className="overflow-x-auto">
        <svg
          width={labelWidth + n * cellSize + 10}
          height={labelWidth + n * cellSize + 10}
          className="mx-auto"
        >
          {/* Spaltenüberschriften */}
          {zones.map((z, j) => (
            <text
              key={`col-${j}`}
              x={labelWidth + j * cellSize + cellSize / 2}
              y={labelWidth - 6}
              textAnchor="middle"
              fontSize={9}
              fill="#64748b"
              fontWeight="500"
            >
              {z.shortName}
            </text>
          ))}

          {/* Zeilenüberschriften + Zellen */}
          {zones.map((zFrom, i) => (
            <g key={`row-${i}`}>
              <text
                x={labelWidth - 6}
                y={labelWidth + i * cellSize + cellSize / 2 + 3}
                textAnchor="end"
                fontSize={9}
                fill="#64748b"
                fontWeight="500"
              >
                {zFrom.shortName}
              </text>
              {zones.map((zTo, j) => {
                const value = odMatrix[i][j]
                const intensity =
                  i === j ? 0 : maxValue > 0 ? value / maxValue : 0
                const bg =
                  i === j
                    ? '#f1f5f9'
                    : `rgba(37, 99, 235, ${0.05 + intensity * 0.7})`
                const textColor = intensity > 0.5 ? 'white' : '#334155'

                return (
                  <g key={`cell-${i}-${j}`}>
                    <rect
                      x={labelWidth + j * cellSize + 1}
                      y={labelWidth + i * cellSize + 1}
                      width={cellSize - 2}
                      height={cellSize - 2}
                      fill={bg}
                      rx={2}
                    />
                    <text
                      x={labelWidth + j * cellSize + cellSize / 2}
                      y={labelWidth + i * cellSize + cellSize / 2 + 3}
                      textAnchor="middle"
                      fontSize={8}
                      fill={textColor}
                      fontFamily="monospace"
                    >
                      {i === j ? '—' : formatNumber(value)}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>
    </div>
  )
}
