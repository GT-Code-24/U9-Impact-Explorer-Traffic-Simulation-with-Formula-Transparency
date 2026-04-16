import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatNumber } from '../../lib/formatters.js'

/**
 * Tornado-Diagramm für Sensitivitätsanalyse
 * Zeigt Einflussstärke jedes Parameters auf NKV
 */
export function SensitivityAnalysis({ sensitivityData }) {
  if (!sensitivityData || !sensitivityData.parameters) {
    return (
      <div className="text-center text-slate-500 py-8">
        <p>Sensitivitätsanalyse nur verfügbar mit U9-Szenario (mit NKA).</p>
      </div>
    )
  }

  const { baseNKV, parameters } = sensitivityData

  // Bereite Daten für horizontales Balken-Diagramm vor
  const tornadoData = useMemo(() => {
    return parameters.map((param) => ({
      label: param.label,
      low: param.nkvLow - baseNKV, // Delta von Basis
      high: param.nkvHigh - baseNKV,
      range: param.range,
      key: param.key,
      nkvLow: param.nkvLow,
      nkvHigh: param.nkvHigh,
      baseNKV,
    }))
  }, [parameters, baseNKV])

  // Custom Tooltip für Details
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null
    const data = payload[0].payload
    return (
      <div className="bg-white rounded border border-slate-200 p-2 shadow-lg text-xs">
        <p className="font-semibold text-slate-700">{data.label}</p>
        <p className="text-slate-500">
          NKV-Range: {data.nkvLow.toFixed(2)} bis {data.nkvHigh.toFixed(2)}
        </p>
        <p className="text-slate-400">Spannweite: {data.range.toFixed(3)}</p>
      </div>
    )
  }

  // Farben: Rot wenn NKV sinkt (links), Grün wenn NKV steigt (rechts)
  const getBarColor = (value) => {
    if (value < 0) return '#ef4444' // Rot: NKV sinkt
    return '#22c55e' // Grün: NKV steigt
  }

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Sensitivitätsanalyse – Einflussstärke auf NKV
      </h3>

      <div className="bg-slate-50 rounded p-3 mb-4">
        <p className="text-xs text-slate-600 leading-relaxed">
          Tornado-Diagramm zeigt NKV-Änderung (vs. Basis: <span className="font-semibold">{baseNKV.toFixed(2)}</span>) wenn
          jeder Parameter um ±Variation verschoben wird. Längere Balken = stärkerer Einfluss.
        </p>
      </div>

      {/* Horizontales Balken-Diagramm (Tornado) */}
      <div className="bg-white rounded-lg border border-slate-200 p-4 mb-4">
        <div className="space-y-3">
          {tornadoData.map((item, idx) => {
            const minDelta = Math.min(0, item.low, item.high)
            const maxDelta = Math.max(0, item.low, item.high)
            const totalRange = maxDelta - minDelta || 1

            const lowPercent = ((item.low - minDelta) / totalRange) * 100
            const highPercent = ((item.high - minDelta) / totalRange) * 100

            return (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-start">
                  <label className="text-xs font-medium text-slate-700">{item.label}</label>
                  <span className="text-xs text-slate-500">
                    Δ {(item.high - item.low).toFixed(3)}
                  </span>
                </div>

                <div className="relative h-6 bg-slate-100 rounded overflow-hidden">
                  {/* Baseline-Markierung (x = 0) */}
                  {minDelta < 0 && maxDelta > 0 && (
                    <div
                      className="absolute top-0 bottom-0 w-px bg-slate-400"
                      style={{ left: `${(0 - minDelta) / totalRange * 100}%` }}
                    />
                  )}

                  {/* Niedriger Balken (links von 0) */}
                  {item.low < 0 && (
                    <div
                      className="absolute top-0 bottom-0 bg-red-400"
                      style={{
                        left: `${(item.low - minDelta) / totalRange * 100}%`,
                        width: `${(0 - item.low) / totalRange * 100}%`,
                      }}
                      title={`Low: ${item.nkvLow.toFixed(2)}`}
                    />
                  )}

                  {/* Hoher Balken (rechts von 0) */}
                  {item.high > 0 && (
                    <div
                      className="absolute top-0 bottom-0 bg-green-400"
                      style={{
                        left: `${Math.max(0 - minDelta, item.low - minDelta) / totalRange * 100}%`,
                        width: `${Math.max(0, item.high) / totalRange * 100}%`,
                      }}
                      title={`High: ${item.nkvHigh.toFixed(2)}`}
                    />
                  )}

                  {/* Labels auf den Balken */}
                  <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-mono text-white pointer-events-none">
                    {item.low < 0 && <span>{item.nkvLow.toFixed(2)}</span>}
                    {item.high > 0 && <span className="text-right">{item.nkvHigh.toFixed(2)}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detaillierte Tabelle */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <h4 className="text-xs font-semibold text-slate-700 mb-2">Detaillierte Werte</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-2 py-1 text-slate-600">Parameter</th>
                <th className="text-right px-2 py-1 text-slate-600">–Variation</th>
                <th className="text-right px-2 py-1 text-slate-600">NKV Low</th>
                <th className="text-right px-2 py-1 text-slate-600">Basis NKV</th>
                <th className="text-right px-2 py-1 text-slate-600">NKV High</th>
                <th className="text-right px-2 py-1 text-slate-600">+Variation</th>
                <th className="text-right px-2 py-1 text-slate-600">Spannw.</th>
              </tr>
            </thead>
            <tbody>
              {tornadoData.map((item, idx) => {
                const param = parameters[idx]
                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-2 py-1 text-slate-700 font-medium">{item.label}</td>
                    <td className="px-2 py-1 text-right text-slate-500 text-xs">
                      {(param.baseValue - param.variation).toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-right text-red-600 font-mono">
                      {item.nkvLow.toFixed(3)}
                    </td>
                    <td className="px-2 py-1 text-right text-slate-700 font-mono font-semibold">
                      {baseNKV.toFixed(3)}
                    </td>
                    <td className="px-2 py-1 text-right text-green-600 font-mono">
                      {item.nkvHigh.toFixed(3)}
                    </td>
                    <td className="px-2 py-1 text-right text-slate-500 text-xs">
                      {(param.baseValue + param.variation).toFixed(2)}
                    </td>
                    <td className="px-2 py-1 text-right text-slate-700 font-mono font-semibold">
                      {item.range.toFixed(3)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interpretation */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900 leading-relaxed">
        <p className="font-semibold mb-1">Interpretation:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong>Längster Balken:</strong> Der Parameter mit dem stärksten Einfluss auf NKV (z.B.
            Benzinpreis).
          </li>
          <li>
            <strong>Rot (links):</strong> Parameter sinkt → NKV sinkt (ungünstig).
          </li>
          <li>
            <strong>Grün (rechts):</strong> Parameter steigt → NKV steigt (günstig).
          </li>
          <li>
            <strong>Symmetrie:</strong> Asymmetrische Balken zeigen nichtlineare Effekte im Modell
            (z.B. Sättigungseffekte bei Moduswahl).
          </li>
        </ul>
      </div>
    </div>
  )
}
