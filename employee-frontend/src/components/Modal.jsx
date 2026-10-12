import { useEffect } from 'react'
import { Icon } from './Icons'

// Reusable modal: closes on Esc / backdrop click, locks page scroll while open
function Modal({ show, title, onClose, size = '', children, footer }) {
  useEffect(() => {
    if (!show) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [show, onClose])

  if (!show) return null

  return (
    <div
      className="modal show d-block app-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal-dialog modal-dialog-centered ${size}`}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn btn-sm icon-btn" onClick={onClose} aria-label="Close">
              <Icon name="x" size={18} />
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer && <div className="modal-footer">{footer}</div>}
        </div>
      </div>
    </div>
  )
}

export default Modal
