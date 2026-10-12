import { useEffect } from 'react'
import { Icon } from './Icons'

// toast = { id, message, type: 'success' | 'error' } or null
function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [toast, onClose])

  if (!toast) return null

  return (
    <div className="toast-wrap">
      <div key={toast.id} className={`app-toast ${toast.type || 'success'}`} role="status">
        <span className="toast-icon">
          <Icon name={toast.type === 'error' ? 'alert' : 'check'} size={18} />
        </span>
        <span>{toast.message}</span>
        <button className="toast-close" onClick={onClose} aria-label="Dismiss">
          <Icon name="x" size={14} />
        </button>
      </div>
    </div>
  )
}

export default Toast
