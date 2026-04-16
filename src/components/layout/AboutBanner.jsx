import { useState } from 'react'
import { X, ChevronDown, ChevronRight } from 'lucide-react'

export function AboutBanner() {
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg overflow-hidden">
      <div className="px-4 py-3 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
              Arbeitsprobe
            </span>
            <span className="text-xs text-slate-400">|</span>
            <span className="text-xs text-slate-600">
              Gabriel Tsonyev — Verkehrsmodellierung & Datenanalyse
            </span>
          </div>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">
            Interaktives 4-Stufen-Verkehrsmodell zur Wirkungsanalyse der U9-Entlastungsspange München.
            Eigeninitiativ entwickelt, um Methodenkompetenz in der Verkehrsplanung zu demonstrieren.
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 mt-2 transition-colors"
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )}
            Was dieses Modell zeigt
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/70 rounded p-3 border border-blue-100">
                  <div className="font-semibold text-slate-700 mb-1">Implementierte Methodik</div>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>Verkehrserzeugung (bevölkerungs-/beschäftigungsbasiert)</li>
                    <li>Gravitationsmodell mit Tanner-Impedanz & Furness-Iteration</li>
                    <li>Nested Logit Mode Choice (2 Nests, empirische ASC)</li>
                    <li>Umlegung mit Kapazitäts-Rückkopplung (Weiner 1997)</li>
                    <li>NKA nach Standardisierter Bewertung 2016+</li>
                  </ul>
                </div>
                <div className="bg-white/70 rounded p-3 border border-blue-100">
                  <div className="font-semibold text-slate-700 mb-1">Bewusste Vereinfachungen</div>
                  <ul className="space-y-0.5 list-disc list-inside">
                    <li>8 Zonen statt 500+ Verkehrszellen</li>
                    <li>All-or-Nothing statt SUE-Umlegung</li>
                    <li>Keine Wegezweck-Differenzierung</li>
                    <li>Nest-Parameter aus Literatur, nicht geschätzt</li>
                  </ul>
                  <p className="mt-2 text-slate-500 italic">
                    Ein Produktivmodell würde RP/SP-Daten, MATSim-Validierung
                    und stochastische Gleichgewichtsumlegung einsetzen.
                  </p>
                </div>
              </div>

              <div className="bg-white/70 rounded p-3 border border-blue-100">
                <div className="font-semibold text-slate-700 mb-1">Tech-Stack</div>
                <p>
                  React 19 · Vite · Tailwind CSS · Recharts · D3.js · Leaflet
                  — vollständig clientseitig, kein Backend erforderlich.
                  Modellberechnung in Echtzeit bei Parameter-Änderung.
                </p>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1 hover:bg-blue-100 rounded transition text-slate-400 hover:text-slate-600 shrink-0"
          title="Schließen"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
