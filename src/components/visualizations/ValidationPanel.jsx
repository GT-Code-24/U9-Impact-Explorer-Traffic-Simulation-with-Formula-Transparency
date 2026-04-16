/**
 * Validierungspanel: Modell vs. empirische Daten
 *
 * Zeigt die Kalibrierungsqualität des Modells gegen bekannte
 * Münchner Verkehrskennzahlen (SrV 2023, MVG-Betriebsdaten).
 */

import { formatPercent, formatNumber } from '../../lib/formatters.js'
import { targetModalSplit } from '../../data/calibration.js'
import { criticalSegments } from '../../data/network.js'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

function QualityBadge({ deviation }) {
  const abs = Math.abs(deviation)
  if (abs <= 0.02) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded px-2 py-0.5">
        <CheckCircle className="w-3 h-3" /> Sehr gut
      </span>
    )
  }
  if (abs <= 0.05) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-0.5">
        <AlertTriangle className="w-3 h-3" /> Akzeptabel
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded px-2 py-0.5">
      <AlertTriangle className="w-3 h-3" /> Abweichung
    </span>
  )
}

function ValidationRow({ label, modelValue, targetValue, unit = 'percent' }) {
  const deviation = modelValue - targetValue
  const formatFn = unit === 'percent' ? formatPercent : formatNumber

  return (
    <tr className="border-b border-slate-100 last:border-b-0">
      <td className="py-2.5 pr-4 text-sm text-slate-700 font-medium">{label}</td>
      <td className="py-2.5 px-4 text-sm text-slate-600 text-right font-mono">
        {formatFn(targetValue)}
      </td>
      <td className="py-2.5 px-4 text-sm text-right font-mono font-semibold text-slate-800">
        {formatFn(modelValue)}
      </td>
      <td className="py-2.5 px-4 text-sm text-right font-mono">
        <span className={deviation > 0 ? 'text-blue-600' : 'text-amber-600'}>
          {unit === 'percent'
            ? `${(deviation * 100).toFixed(1)} Pp.`
            : formatNumber(deviation)}
        </span>
      </td>
      <td className="py-2.5 pl-4">
        <QualityBadge deviation={unit === 'percent' ? deviation : deviation / targetValue} />
      </td>
    </tr>
  )
}

export function ValidationPanel({ result, baselineResult }) {
  const { kpis } = baselineResult
  const stammstrecke1 = criticalSegments.find((s) => s.id === 'stammstrecke1')

  // Gesamtabweichung Modal Split (RMSE)
  const modes = ['car', 'oepnv', 'bike', 'walk']
  const msDeviations = modes.map(
    (m) => Math.pow(kpis.modalSplit[m] - targetModalSplit[m], 2)
  )
  const msRMSE = Math.sqrt(msDeviations.reduce((a, b) => a + b, 0) / modes.length)

  // Furness-Konvergenz
  const distrib = baselineResult.distribution

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-1">
          Modellvalidierung: Baseline (Status quo) vs. empirische Daten
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed mb-4">
          Vergleich der Modellergebnisse im Baseline-Szenario (ohne U9, kein Wachstum)
          mit beobachteten Verkehrskennzahlen aus München.
        </p>
      </div>

      {/* Modal Split Validierung */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Modal Split — Modell vs. SrV München 2023
        </h4>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="py-2 pr-4 pl-3 text-left font-semibold">Verkehrsmittel</th>
                <th className="py-2 px-4 text-right font-semibold">SrV 2023</th>
                <th className="py-2 px-4 text-right font-semibold">Modell</th>
                <th className="py-2 px-4 text-right font-semibold">Abweichung</th>
                <th className="py-2 pl-4 pr-3 text-left font-semibold">Qualität</th>
              </tr>
            </thead>
            <tbody className="px-3">
              <ValidationRow
                label="MIV (Auto)"
                modelValue={kpis.modalSplit.car}
                targetValue={targetModalSplit.car}
              />
              <ValidationRow
                label="ÖPNV"
                modelValue={kpis.modalSplit.oepnv}
                targetValue={targetModalSplit.oepnv}
              />
              <ValidationRow
                label="Fahrrad"
                modelValue={kpis.modalSplit.bike}
                targetValue={targetModalSplit.bike}
              />
              <ValidationRow
                label="Fuß"
                modelValue={kpis.modalSplit.walk}
                targetValue={targetModalSplit.walk}
              />
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex items-center gap-4">
          <div className="text-xs text-slate-500">
            <strong>RMSE Modal Split:</strong>{' '}
            <span className="font-mono font-semibold text-slate-700">
              {(msRMSE * 100).toFixed(2)} Pp.
            </span>
          </div>
          <QualityBadge deviation={msRMSE} />
        </div>
      </div>

      {/* Netzbelastung Validierung */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Netzbelastung — Modell vs. MVG-Betriebsdaten 2024
        </h4>
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wide">
                <th className="py-2 pr-4 pl-3 text-left font-semibold">Abschnitt</th>
                <th className="py-2 px-4 text-right font-semibold">MVG 2024</th>
                <th className="py-2 px-4 text-right font-semibold">Modell</th>
                <th className="py-2 px-4 text-right font-semibold">Abweichung</th>
                <th className="py-2 pl-4 pr-3 text-left font-semibold">Qualität</th>
              </tr>
            </thead>
            <tbody>
              {baselineResult.assignment.segments
                .filter((s) => s.id !== 'u9_core')
                .map((seg) => {
                  const reference = criticalSegments.find((c) => c.id === seg.id)
                  return (
                    <ValidationRow
                      key={seg.id}
                      label={seg.name}
                      modelValue={seg.load}
                      targetValue={reference?.baseLoad || 0}
                      unit="absolute"
                    />
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Konvergenz-Metriken */}
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
          Konvergenzmetriken
        </h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs text-slate-500">Furness-Iterationen</div>
            <div className="text-lg font-semibold text-slate-800 mt-1">
              {distrib.iterations}
              <span className="text-xs text-slate-400 ml-1">/ 50 max</span>
            </div>
            <div className="text-xs mt-1">
              {distrib.converged ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Konvergiert
                </span>
              ) : (
                <span className="text-amber-600">Nicht konvergiert</span>
              )}
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs text-slate-500">RMSE Randsummen</div>
            <div className="text-lg font-semibold text-slate-800 mt-1">
              {distrib.rmseRelative}%
            </div>
            <div className="text-xs text-slate-400 mt-1">
              relativ zu Ø Produktion
            </div>
          </div>

          <div className="border border-slate-200 rounded-lg p-3">
            <div className="text-xs text-slate-500">Gesamtwege Modell</div>
            <div className="text-lg font-semibold text-slate-800 mt-1">
              {formatNumber(kpis.totalTrips)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              pro Tag (8 Zonen)
            </div>
          </div>
        </div>
      </div>

      {/* Quellen */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs text-blue-800 leading-relaxed">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <strong>Datenquellen & Methodik:</strong>
            <ul className="mt-1 space-y-0.5 list-disc list-inside">
              <li>Modal Split: SrV München 2023 (MiD-kompatibel)</li>
              <li>Netzbelastung: MVG Betriebsdaten 2024, Wikipedia U-Bahn München</li>
              <li>Logit-Parameter: Shoman & Moreno (2021), Transportation Research Record 2675(5)</li>
              <li>Gravitationsmodell: Tanner-Impedanz (1961), Furness-Iteration, RMSE nach Evans (1971)</li>
              <li>NKA: Standardisierte Bewertung 2016+ (Fortschreibung 01.07.2022), BVWP 2030</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
