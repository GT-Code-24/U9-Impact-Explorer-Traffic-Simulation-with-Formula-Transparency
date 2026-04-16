/**
 * Deutsche Zahlenformatierung und Hilfsformatter
 */

const deFormat = new Intl.NumberFormat('de-DE')
const dePercent = new Intl.NumberFormat('de-DE', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})
const deCompact = new Intl.NumberFormat('de-DE', {
  notation: 'compact',
  maximumFractionDigits: 1,
})

export function formatNumber(n) {
  return deFormat.format(Math.round(n))
}

export function formatPercent(n) {
  return dePercent.format(n)
}

export function formatCompact(n) {
  return deCompact.format(n)
}

export function formatDelta(n) {
  const sign = n > 0 ? '+' : ''
  return sign + formatNumber(n)
}

export function formatDeltaPercent(n) {
  const sign = n > 0 ? '+' : ''
  return sign + (n * 100).toFixed(1) + ' Pp.'
}

export function getStatusColor(utilization) {
  if (utilization > 0.9) return 'var(--color-ubahn-red)'
  if (utilization > 0.7) return 'var(--color-ubahn-yellow)'
  return 'var(--color-ubahn-green)'
}

export function getStatusLabel(status) {
  switch (status) {
    case 'overloaded':
      return 'Überlastet'
    case 'warning':
      return 'Auslastung hoch'
    case 'ok':
      return 'Kapazität verfügbar'
    default:
      return status
  }
}
