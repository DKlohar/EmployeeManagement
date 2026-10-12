import { Icon } from './Icons'

// Builds [1, '…', 4, 5, 6, '…', 20] style page lists
function buildPages(page, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = new Set([1, total, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b)
  const out = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push('…')
    out.push(p)
  })
  return out
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <div className="pager d-flex align-items-center gap-1 flex-wrap">
      <button className="btn btn-page" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        <Icon name="chevronLeft" size={14} /> Prev
      </button>

      {buildPages(page, totalPages).map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="ellipsis">…</span>
        ) : (
          <button
            key={p}
            className={`btn btn-page ${p === page ? 'active' : ''}`}
            onClick={() => onChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button className="btn btn-page" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next <Icon name="chevronRight" size={14} />
      </button>
    </div>
  )
}

export default Pagination
