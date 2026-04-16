import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'
import { formatPercent } from '../../lib/formatters.js'

const MODE_CONFIG = {
  car: { name: 'MIV (Auto)', color: '#6b7280' },
  oepnv: { name: 'ÖPNV', color: '#2563eb' },
  bike: { name: 'Fahrrad', color: '#16a34a' },
  walk: { name: 'Fuß', color: '#f59e0b' },
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { name, value } = payload[0]
  return (
    <div className="bg-white border border-slate-200 rounded px-3 py-2 shadow-sm text-sm">
      <span className="font-medium">{name}:</span> {formatPercent(value / 100)}
    </div>
  )
}

export function ModalSplitChart({ modalSplit }) {
  const data = Object.entries(MODE_CONFIG).map(([key, config]) => ({
    name: config.name,
    value: Math.round((modalSplit[key] || 0) * 1000) / 10,
    color: config.color,
  }))

  return (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-2">
        Modal Split
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            animationDuration={500}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
