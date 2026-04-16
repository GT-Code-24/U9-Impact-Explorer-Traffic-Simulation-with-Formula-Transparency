import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const steps = [
  {
    title: '1. Verkehrserzeugung',
    formula: 'P_i = Bevölkerung_i × (1 + Wachstum) × Wegerate',
    description:
      'Berechnet die Anzahl der Wege, die in jeder Zone entstehen (Quellverkehr) und ankommen (Zielverkehr). Die Quellverkehrserzeugung hängt von der Bevölkerung ab, der Zielverkehr zusätzlich von der Beschäftigung.',
    params: 'Bevölkerungswachstum, Wegerate',
    simplification:
      'Vereinfacht auf 8 Zonen statt der üblichen 500+ Verkehrszellen. Keine Differenzierung nach Wegezweck (Arbeit, Einkauf, Freizeit).',
  },
  {
    title: '2. Verkehrsverteilung (Gravitationsmodell)',
    formula: 'T_ij = A_i × O_i × B_j × D_j × f(c_ij)   mit  f(c_ij) = c_ij^α × exp(−β × c_ij)',
    description:
      'Doubly-constrained Gravitationsmodell mit Furness-Iteration. Die Widerstandsfunktion folgt dem Tanner-Ansatz (1961): kombinierte Potenz- und Exponentialfunktion. Besser geeignet für urbane Kurzstrecken als die rein exponentielle Funktion. Konvergenzqualität wird als RMSE der Randsummen ausgewiesen.',
    params: 'Impedanzparameter β, Tanner-Exponent α',
    simplification:
      '8 Zonen statt 500+ Verkehrszellen. Keine Wegezweck-Differenzierung. Furness-Iteration statt entropiebasierter Kalibrierung.',
    source: 'Tanner (1961); Evans (1971) — RMSE-Konvergenzmetrik',
  },
  {
    title: '3. Verkehrsmittelwahl (Nested Logit)',
    formula: 'P(m) = P(Nest) × P(m | Nest)   mit  I_Nest = λ × log Σ_{k∈Nest} exp(V_k / λ)',
    description:
      'Nested Logit-Modell mit zwei Nests: „Motorisiert" (Auto + ÖPNV, λ=0,7) und „Muskelbetrieben" (Rad + Fuß, λ=0,5). Überwíndet die IIA-Annahme des einfachen MNL — ÖPNV und Auto konkurrieren primär miteinander, nicht mit dem Fahrrad. Rückkopplung: Überlastete Stammstrecken (Stufe 4) reduzieren die ÖPNV-Utility in der nächsten Iteration. ASC-Parameter orientieren sich an empirischen RP-Daten aus München (Shoman & Moreno 2021).',
    params: 'Benzinpreis, ÖPNV-Ticketpreis, Rad-Infrastruktur',
    simplification:
      'Nest-Parameter λ nicht statistisch geschätzt, sondern aus Literatur übernommen. Keine Berücksichtigung von Heterogenität (Einkommen, Alter). Mixed Logit wäre noch realitätsnäher.',
    source: 'Munizaga et al. (2000); Shoman & Moreno (2021, München)',
  },
  {
    title: '4. Umlegung (mit Kapazitäts-Rückkopplung)',
    formula: 'Belastung_s = Σ_{i,j} T_ij^ÖPNV × f_UBahn × δ_s(i,j)',
    description:
      'All-or-Nothing-Umlegung auf 5 kritische U-Bahn-Abschnitte. Das Modell iteriert zwischen Stufe 3 und Stufe 4: Überlastung (Auslastung > 90 %) erzeugt einen Crowding-Penalty in der ÖPNV-Utility, bis Konvergenz (< 0,1 % Änderung im Modal Split) erreicht ist.',
    params: 'U9 aktiviert (verändert Routing)',
    simplification:
      'All-or-Nothing statt stochastischer Gleichgewichtsumlegung (SUE). Vereinfachtes Routing ohne detaillierte Umsteigemodellierung.',
    source: 'Weiner (1997) — Kapazitätsrückkopplung im 4-Stufen-Modell',
  },
]

function StepAccordion({ step }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        {open ? (
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
        )}
        <span className="text-sm font-semibold text-slate-700">
          {step.title}
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          <div className="bg-slate-50 rounded px-3 py-2 font-mono text-xs text-slate-700 overflow-x-auto">
            {step.formula}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            {step.description}
          </p>
          <div className="text-xs text-slate-500">
            <strong>Gesteuert durch:</strong> {step.params}
          </div>
          <div className="text-xs text-amber-700 bg-amber-50 rounded px-3 py-2">
            <strong>Vereinfachungen:</strong> {step.simplification}
          </div>
          {step.source && (
            <div className="text-xs text-blue-700 bg-blue-50 rounded px-3 py-2">
              <strong>Literatur:</strong> {step.source}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function MethodologyPanel() {
  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">
        Methodik: 4-Stufen-Verkehrsmodell
      </h3>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <StepAccordion key={i} step={step} />
        ))}
      </div>
      <div className="mt-4 text-xs text-slate-400 leading-relaxed">
        Dieses Modell demonstriert die Methodik mit Nested Logit, Tanner-Impedanz und
        Kapazitäts-Rückkopplung. Ein Produktivmodell würde zusätzlich empirisch erhobene
        Parameter (RP/SP-Studie), 500+ Verkehrszellen, stochastische Gleichgewichtsumlegung
        und MATSim-Validierung einsetzen.
      </div>
    </div>
  )
}
