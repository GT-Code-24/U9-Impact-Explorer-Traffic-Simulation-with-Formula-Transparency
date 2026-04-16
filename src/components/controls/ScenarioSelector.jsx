import { scenarios } from '../../data/scenarios.js'

export function ScenarioSelector({ scenarioId, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Szenario
      </label>
      <div className="space-y-1.5">
        {scenarios.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              scenarioId === s.id
                ? 'bg-blue-50 border-2 border-blue-500 text-blue-900 font-medium'
                : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300'
            }`}
          >
            <div className="font-medium">{s.name}</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {s.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
