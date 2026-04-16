import { useState } from 'react'
import { ScenarioSelector } from './ScenarioSelector.jsx'
import { ParamSlider } from './ParamSlider.jsx'
import { ChevronDown, ChevronRight } from 'lucide-react'

export function Sidebar({
  params,
  scenarioId,
  onSelectScenario,
  onUpdateParam,
}) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  return (
    <aside className="w-72 shrink-0 bg-slate-50 border-r border-slate-200 p-4 overflow-y-auto space-y-6">
      <ScenarioSelector
        scenarioId={scenarioId}
        onSelect={onSelectScenario}
      />

      <div className="border-t border-slate-200 pt-4 space-y-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Parameter
        </label>

        <ParamSlider
          label="Bevölkerungswachstum"
          value={params.populationGrowth}
          min={0}
          max={20}
          step={1}
          unit="%"
          onChange={(v) => onUpdateParam('populationGrowth', v)}
        />

        <ParamSlider
          label="Benzinpreis"
          value={params.fuelPrice}
          min={1.2}
          max={3.0}
          step={0.1}
          formatValue={(v) => `${v.toFixed(2)} €/l`}
          onChange={(v) => onUpdateParam('fuelPrice', v)}
        />

        <ParamSlider
          label="ÖPNV-Monatsticket"
          value={params.oepnvMonthlyPass}
          min={29}
          max={99}
          step={1}
          formatValue={(v) => `${v} €`}
          onChange={(v) => onUpdateParam('oepnvMonthlyPass', v)}
        />

        <ParamSlider
          label="Rad-Infrastruktur"
          value={params.bikeInfraQuality}
          min={1}
          max={10}
          step={1}
          formatValue={(v) => `${v}/10`}
          onChange={(v) => onUpdateParam('bikeInfraQuality', v)}
        />

        <ParamSlider
          label="Wegerate"
          value={params.tripRate}
          min={2.0}
          max={4.0}
          step={0.1}
          formatValue={(v) => `${v.toFixed(1)} Wege/P./Tag`}
          onChange={(v) => onUpdateParam('tripRate', v)}
        />
      </div>

      <div className="border-t border-slate-200 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
        >
          {showAdvanced ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          Erweiterte Parameter
        </button>

        {showAdvanced && (
          <div className="mt-3 space-y-4">
            <ParamSlider
              label="Impedanz β"
              value={params.beta || 0.1}
              min={0.01}
              max={0.3}
              step={0.01}
              formatValue={(v) => v.toFixed(2)}
              onChange={(v) => onUpdateParam('beta', v)}
            />

            <div className="text-xs text-slate-400 leading-relaxed">
              β steuert die Entfernungsempfindlichkeit im Gravitationsmodell.
              Höhere Werte = stärkere Präferenz für Nahziele.
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
