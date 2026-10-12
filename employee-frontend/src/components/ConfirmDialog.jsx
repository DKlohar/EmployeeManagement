import Modal from './Modal'
import { Icon } from './Icons.jsx'

// Replaces window.confirm with a proper dialog
function ConfirmDialog({ show, title, message, confirmText = 'Delete', busy = false, onConfirm, onCancel }) {
  return (
    <Modal
      show={show}
      title=""
      size="modal-sm"
      onClose={busy ? () => {} : onCancel}
      footer={
        <>
          <button className="btn btn-light border" onClick={onCancel} disabled={busy}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy && <span className="spinner-border spinner-border-sm me-2" />}
            {busy ? 'Deleting…' : confirmText}
          </button>
        </>
      }
    >
      <div className="text-center">
        <div className="confirm-icon"><Icon name="trash" size={24} /></div>
        <h6 className="fw-bold">{title}</h6>
        <p className="text-muted small mb-0">{message}</p>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
