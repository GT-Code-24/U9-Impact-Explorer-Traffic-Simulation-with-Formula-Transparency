import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import { formatNumber } from '../../lib/formatters.js'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded px-3 py-2 shadow-sm text-sm">
      <div className="font-medium mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex justify-between gap-4">
          <span style={{ color: p.color }}>{p.name}</span>
          <span className="font-mono">{formatNumber(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function LoadComparison({ segments, baselineSegments }) {
  const data = segments
    .filter((s) => s.id !== 'u9_core' || s.load > 0)
    .map((seg) => {
      const baseline = baselineSegments?.find((b) => b.id === seg.id)
      return {
        name: seg.name.replace(/\s*\(.*\)/, ''),
        Aktuell: seg.load,
        Baseline: baseline?.load || seg.baseLoad,
        Kapazität: seg.capacity,
        utilization: seg.utilization,
      }
    })

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Streckenbelastung (Fahrgäste/Tag)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical" margin={{ left: 10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            type="number"
            tickFormatter={(v) => `${Math.round(v / 1000)}k`}
            tick={{ fontSize: 11 }}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fontSize: 11 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar
            dataKey="Baseline"
            fill="#94a3b8"
            name="Ohne U9"
            radius={[0, 2, 2, 0]}
            barSize={14}
          />
          <Bar
            dataKey="Aktuell"
            fill="#2563eb"
            name="Aktuelles Szenario"
            radius={[0, 2, 2, 0]}
            barSize={14}
          />
          <ReferenceLine
            x={0}
            stroke="#e2e8f0"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
