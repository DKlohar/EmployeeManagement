const AVATAR_COLORS = [
  '#4f46e5', '#0891b2', '#059669', '#d97706',
  '#db2777', '#7c3aed', '#dc2626', '#2563eb'
]

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '?'

// Same name → same colour, every time
export const avatarColor = (name = '') => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

export const formatSalary = (value) =>
  value === null || value === undefined || value === ''
    ? '—'
    : `₹${Number(value).toLocaleString('en-IN')}`

export const formatDate = (value) => {
  if (!value) return '—'
  const d = new Date(value)
  return isNaN(d) ? '—' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
