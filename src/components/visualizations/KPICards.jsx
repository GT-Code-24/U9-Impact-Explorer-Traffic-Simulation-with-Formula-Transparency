import { useState } from 'react'
import { formatNumber, formatPercent, formatDeltaPercent } from '../../lib/formatters.js'
import { ArrowDown, ArrowUp, Minus, Calculator } from 'lucide-react'
import { FormulaModal } from '../FormulaModal.jsx'
import { formulas } from '../../lib/formulas.js'

function DeltaIndicator({ value }) {
  if (Math.abs(value) < 0.001) {
    return (
      <span className="text-xs text-slate-400 flex items-center gap-0.5">
        <Minus className="w-3 h-3" /> unverändert
      </span>
    )
  }
  const isPositive = value > 0
  return (
    <span
      className={`text-xs flex items-center gap-0.5 ${
        isPositive ? 'text-green-600' : 'text-red-500'
      }`}
    >
      {isPositive ? (
        <ArrowUp className="w-3 h-3" />
      ) : (
        <ArrowDown className="w-3 h-3" />
      )}
      {formatDeltaPercent(Math.abs(value))}
    </span>
  )
}

function KPICard({ title, value, subtitle, delta, colorClass = 'text-slate-800', formulaKey }) {
  const [showFormula, setShowFormula] = useState(false)
  const formula = formulaKey ? formulas[formulaKey] : null

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 p-3 hover:border-blue-300 transition">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="text-xs text-slate-500 uppercase tracking-wide font-medium flex-1">
            {title}
          </div>
          {formula && (
            <button
              onClick={() => setShowFormula(true)}
              className="p-1 hover:bg-blue-100 rounded transition text-slate-400 hover:text-blue-600"
              title="Rechenweg anzeigen"
            >
              <Calculator className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className={`text-2xl font-semibold mt-1 ${colorClass}`}>
          {value}
        </div>
        {subtitle && (
          <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>
        )}
        {delta !== undefined && (
          <div className="mt-1">
            <DeltaIndicator value={delta} />
          </div>
        )}
      </div>

      {showFormula && (
        <FormulaModal
          formula={formula}
          onClose={() => setShowFormula(false)}
        />
      )}
    </>
  )
}

export function KPICards({ result, comparison }) {
  const { kpis } = result

  return (
    <div className="grid grid-cols-2 gap-3">
      <KPICard
        title="Gesamtwege/Tag"
        value={formatNumber(kpis.totalTrips)}
        subtitle="alle Verkehrsmittel"
      />
      <KPICard
        title="ÖPNV-Anteil"
        value={formatPercent(kpis.modalSplit.oepnv)}
        subtitle="Modal Split"
        delta={comparison?.deltaModalSplit?.oepnv}
        colorClass="text-blue-600"
        formulaKey="modalSplitOepnv"
      />
      <KPICard
        title="Umweltverbund"
        value={formatPercent(kpis.umweltverbund)}
        subtitle="ÖPNV + Rad + Fuß"
        delta={comparison?.deltaUmweltverbund}
        colorClass="text-green-600"
        formulaKey="umweltverbund"
      />
      <KPICard
        title="MIV-Anteil"
        value={formatPercent(kpis.modalSplit.car)}
        subtitle="Autoverkehr"
        delta={
          comparison
            ? comparison.deltaModalSplit.car
            : undefined
        }
        colorClass="text-slate-600"
      />
      {result.params.withU9 && (
        <>
          <KPICard
            title="U9 Fahrgäste"
            value={formatNumber(kpis.u9Load)}
            subtitle="Kernabschnitt/Tag"
            colorClass="text-purple-600"
            formulaKey="u9Fahrgaeste"
          />
          <KPICard
            title="Entlastung Stammstr. 1"
            value={
              kpis.stammstrecke1Relief > 0
                ? formatPercent(kpis.stammstrecke1Relief)
                : '—'
            }
            subtitle="U3/U6 Korridor"
            colorClass="text-green-600"
            formulaKey="stammstrecke1Relief"
          />
        </>
      )}
      {comparison?.nka && (
        <>
          <div className="col-span-2 mt-1 border-t border-slate-100 pt-2">
            <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">
              Nutzen-Kosten-Analyse (Standardisierte Bewertung 2016+)
            </div>
          </div>
          <KPICard
            title="NKV"
            value={comparison.nka.nkv.toFixed(2)}
            subtitle={`${comparison.nka.nkvBewertung} · ${comparison.nka.prognosehorizont} Jahre`}
            colorClass={
              comparison.nka.nkv >= 1.5
                ? 'text-green-600'
                : comparison.nka.nkv >= 1.0
                  ? 'text-amber-600'
                  : 'text-red-500'
            }
            formulaKey="nkv"
          />
          <KPICard
            title="Jahresnutzen"
            value={`${comparison.nka.jahresnutzenMio} Mio €`}
            subtitle="Reisezeit + Modal Shift"
            colorClass="text-blue-600"
          />
          <KPICard
            title="Barwert Nutzen"
            value={`${comparison.nka.barwertNutzenMrd} Mrd €`}
            subtitle={`Diskont. ${(comparison.nka.diskontierungssatz * 100).toFixed(0)}%`}
            colorClass="text-blue-600"
          />
          <KPICard
            title="Gesamtkosten"
            value={`${comparison.nka.gesamtkostenMrd} Mrd €`}
            subtitle="Invest + Barw. Betrieb"
            colorClass="text-slate-600"
          />
        </>
      )}
    </div>
  )
}
