import { X } from 'lucide-react'

/**
 * Modal für Formelherleitung & Rechenweg
 * Zeigt Schritt-für-Schritt, wie eine KPI berechnet wird
 */
export function FormulaModal({ formula, onClose }) {
  if (!formula) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{formula.title}</h2>
            <p className="text-sm text-blue-100 mt-1 font-mono">{formula.keyFormula}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-blue-500 hover:bg-blue-600 rounded-full p-2 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Schritt-für-Schritt */}
          {formula.steps?.map((step, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4">
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {step.title}
              </h3>

              {step.description && (
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">
                  {step.description}
                </p>
              )}

              {/* Formeln */}
              {step.equations && step.equations.length > 0 && (
                <div className="bg-slate-50 rounded p-3 mb-3 overflow-x-auto">
                  {step.equations.map((eq, eIdx) => (
                    <div
                      key={eIdx}
                      className="font-mono text-sm text-slate-800 py-1 leading-relaxed"
                    >
                      {eq}
                    </div>
                  ))}
                </div>
              )}

              {/* Erklärung */}
              {step.explanation && (
                <div className="bg-amber-50 border-l-2 border-amber-300 pl-3 py-2">
                  <p className="text-xs text-amber-900 leading-relaxed">
                    <strong>Erklärung:</strong> {step.explanation}
                  </p>
                </div>
              )}
            </div>
          ))}

          {/* Parameter-Tabelle */}
          {formula.parameters && formula.parameters.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-3">
                Verwendete Parameter
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-slate-100 border-b-2 border-slate-300">
                    <tr>
                      <th className="text-left px-3 py-2 font-semibold text-slate-700">
                        Parameter
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-700">
                        Wert
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-700">
                        Einheit
                      </th>
                      <th className="text-left px-3 py-2 font-semibold text-slate-700">
                        Quelle
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {formula.parameters.map((param, idx) => (
                      <tr
                        key={idx}
                        className={`border-b ${
                          idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                        } hover:bg-blue-50 transition`}
                      >
                        <td className="px-3 py-2 font-mono text-slate-800">
                          {param.name}
                        </td>
                        <td className="px-3 py-2 font-semibold text-slate-900">
                          {param.value}
                        </td>
                        <td className="px-3 py-2 text-slate-600">{param.unit}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">
                          {param.source}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Quellen */}
          {formula.sources && formula.sources.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Quellen</h3>
              <ul className="space-y-2">
                {formula.sources.map((source, idx) => (
                  <li key={idx} className="text-sm text-blue-900 leading-relaxed">
                    <strong>{source.author}</strong>
                    {source.title && (
                      <>
                        {' '}
                        — <em>{source.title}</em>
                      </>
                    )}
                    {source.journal && (
                      <>
                        {' '}
                        in <em>{source.journal}</em>
                      </>
                    )}
                    {source.url && (
                      <>
                        {' '}
                        <br />
                        <a
                          href={`https://${source.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-xs"
                        >
                          {source.url} ↗
                        </a>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-xs text-yellow-900">
            <strong>Hinweis:</strong> Die dargestellten Formeln sind vereinfachte Versionen des
            komplexen 4-Stufen-Modells. Produktivmodelle in der Verkehrsplanung nutzen zusätzlich
            empirische Kalibrierung, detaillierte Zeitscheiben und stochastische Umlegung.
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-100 px-6 py-4 flex justify-end gap-2 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  )
}
