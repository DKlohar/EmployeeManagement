import { useCallback, useEffect, useRef, useState } from 'react'
import {
  getDepartments, createDepartment, updateDepartment, deleteDepartment, getErrorMessage
} from '../services/api'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import Toast from '../components/Toast'
import { Icon } from '../components/Icons'
import useDebounce from '../hooks/useDebounce'

const PAGE_SIZE = 8

function DepartmentList() {
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  // search + pagination (same pattern as the Employee page)
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounce(searchText.trim(), 400)
  const [query, setQuery] = useState({ page: 1, search: '' })
  const [meta, setMeta] = useState({ totalPages: 1, totalRecords: 0 })
  const requestId = useRef(0) // ignore out-of-date responses

  // add / edit modal
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState(null) // null = Add mode
  const [deptName, setDeptName] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  // delete dialog
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const notify = (message, type = 'success') => setToast({ id: Date.now(), message, type })
  const closeToast = useCallback(() => setToast(null), [])
  const closeForm = useCallback(() => setShowForm(false), [])

  const loadDepartments = useCallback(async () => {
    const id = ++requestId.current
    try {
      setLoading(true)
      setError('')
      const res = await getDepartments({ pageNumber: query.page, pageSize: PAGE_SIZE, search: query.search })
      if (id !== requestId.current) return

      if (!res.data.success) {
        setError(res.data.message)
        return
      }

      const payload = res.data.data
      if (Array.isArray(payload)) {
        // The API sent a plain list (no paging) → search on the client instead
        const q = query.search.toLowerCase()
        const rows = q ? payload.filter((d) => d.deptName.toLowerCase().includes(q)) : payload
        setDepartments(rows)
        setMeta({ totalPages: 1, totalRecords: rows.length })
      } else {
        // The API sent a paged result → { data, totalPages, totalRecords, ... }
        setDepartments(payload.data)
        setMeta({ totalPages: payload.totalPages, totalRecords: payload.totalRecords })
      }
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err, 'Could not load departments.'))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [query])

  // new search text → back to page 1
  useEffect(() => {
    setQuery((q) => (q.search === debouncedSearch ? q : { page: 1, search: debouncedSearch }))
  }, [debouncedSearch])

  useEffect(() => { loadDepartments() }, [loadDepartments])

  const goToPage = (page) => setQuery((q) => ({ ...q, page }))

  const openAdd = () => {
    setEditId(null); setDeptName(''); setIsActive(true); setFormError(''); setShowForm(true)
  }

  const openEdit = (dept) => {
    setEditId(dept.deptId)
    setDeptName(dept.deptName)
    // keep the real status when the API sends it (otherwise assume active)
    setIsActive(dept.isActive ?? true)
    setFormError('')
    setShowForm(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const name = deptName.trim()
    if (!name) { setFormError('Department name is required'); return }

    setSaving(true)
    setFormError('')
    try {
      const res = editId
        ? await updateDepartment({ deptId: editId, deptName: name, isActive })
        : await createDepartment({ deptName: name, isActive })

      if (res.data.success) {
        notify(res.data.message)
        setShowForm(false)
        loadDepartments()
      } else {
        setFormError(res.data.message)
      }
    } catch (err) {
      // e.g. 400 → "Department name already exists"
      setFormError(getErrorMessage(err, 'Could not save the department.'))
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      setDeleting(true)
      const res = await deleteDepartment(toDelete.deptId)
      if (res.data.success) {
        notify(res.data.message)
        // deleted the last row of a later page → step back one page
        if (departments.length === 1 && query.page > 1) goToPage(query.page - 1)
        else loadDepartments()
      } else {
        notify(res.data.message, 'error')
      }
    } catch (err) {
      // e.g. 400 → "Cannot delete — employees are assigned to this department"
      notify(getErrorMessage(err, 'Delete failed. Please try again.'), 'error')
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const from = meta.totalRecords === 0 ? 0 : (query.page - 1) * PAGE_SIZE + 1
  const to = Math.min(query.page * PAGE_SIZE, meta.totalRecords)

  return (
    <>
      <Toast toast={toast} onClose={closeToast} />

      <div className="page-head d-flex justify-content-between align-items-end flex-wrap gap-2 mb-3">
        <div>
          <h1>Departments</h1>
          <p>Organise your company into departments.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={openAdd}>
          <Icon name="plus" size={16} /> Add Department
        </button>
      </div>

      <div className="panel">
        {/* toolbar */}
        <div className="panel-toolbar d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="search-box">
            <span className="search-icon"><Icon name="search" size={16} /></span>
            <input
              type="text"
              className="form-control"
              placeholder="Search departments…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button className="clear-btn" onClick={() => setSearchText('')} aria-label="Clear search">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <span className="pill pill-brand">
            {meta.totalRecords} department{meta.totalRecords === 1 ? '' : 's'}
          </span>
        </div>

        {/* error banner */}
        {error && (
          <div className="alert alert-danger rounded-0 mb-0 d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center gap-2"><Icon name="alert" size={16} /> {error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={loadDepartments}>
              <Icon name="refresh" size={14} className="me-1" /> Retry
            </button>
          </div>
        )}

        {/* table */}
        <div className="table-responsive">
          <table className="table data-table align-middle">
            <thead>
              <tr>
                <th style={{ width: 90 }}>ID</th>
                <th>Department</th>
                <th style={{ width: 130 }}>Status</th>
                <th className="text-end" style={{ width: 130 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? Array.from({ length: 4 }).map((_, r) => (
                    <tr key={r}>
                      {[1, 2, 3, 4].map((c) => <td key={c}><span className="skeleton" /></td>)}
                    </tr>
                  ))
                : departments.map((d) => (
                    <tr key={d.deptId}>
                      <td className="text-muted">#{d.deptId}</td>
                      <td>
                        <div className="d-flex align-items-center gap-3">
                          <div className="avatar" style={{ background: 'var(--brand-soft)', color: 'var(--brand)', borderRadius: 12 }}>
                            <Icon name="building" size={18} />
                          </div>
                          <span className="cell-title">{d.deptName}</span>
                        </div>
                      </td>
                      <td>
                        {/* status is only shown when the API sends isActive */}
                        {typeof d.isActive === 'boolean' ? (
                          <span className={`pill ${d.isActive ? 'pill-green' : 'pill-gray'}`}>
                            {d.isActive ? 'Active' : 'Inactive'}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td className="text-end text-nowrap">
                        <button className="btn btn-sm btn-soft-edit icon-btn me-1" title="Edit" onClick={() => openEdit(d)}>
                          <Icon name="edit" size={15} />
                        </button>
                        <button className="btn btn-sm btn-soft-delete icon-btn" title="Delete" onClick={() => setToDelete(d)}>
                          <Icon name="trash" size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* empty state */}
        {!loading && !error && departments.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="building" size={28} /></div>
            {query.search ? (
              <>
                <h6>No departments match “{query.search}”</h6>
                <button className="btn btn-light border mt-2" onClick={() => setSearchText('')}>Clear search</button>
              </>
            ) : (
              <>
                <h6>No departments yet</h6>
                <p className="mb-3">Create your first department.</p>
                <button className="btn btn-primary" onClick={openAdd}>+ Add Department</button>
              </>
            )}
          </div>
        )}

        {/* footer */}
        {!loading && meta.totalRecords > 0 && (
          <div className="panel-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
            <small className="text-muted">
              Showing <strong>{from}–{to}</strong> of <strong>{meta.totalRecords}</strong>
            </small>
            <Pagination page={query.page} totalPages={meta.totalPages} onChange={goToPage} />
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      <Modal
        show={showForm}
        onClose={saving ? () => {} : closeForm}
        title={editId ? 'Edit Department' : 'Add Department'}
        size="modal-sm"
        footer={
          <>
            <button type="button" className="btn btn-light border" onClick={closeForm} disabled={saving}>Cancel</button>
            <button type="submit" form="dept-form" className="btn btn-primary px-4" disabled={saving}>
              {saving && <span className="spinner-border spinner-border-sm me-2" />}
              {saving ? 'Saving…' : editId ? 'Update' : 'Save'}
            </button>
          </>
        }
      >
        <form id="dept-form" onSubmit={handleSave} noValidate>
          {formError && (
            <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
              <Icon name="alert" size={15} /> <span>{formError}</span>
            </div>
          )}
          <label className="form-label" htmlFor="deptName">Department name *</label>
          <input
            id="deptName"
            className={`form-control ${formError && !deptName.trim() ? 'is-invalid' : ''}`}
            value={deptName}
            onChange={(e) => { setDeptName(e.target.value); setFormError('') }}
            maxLength="50"
            placeholder="e.g. Engineering"
            autoFocus
          />
          <div className="form-check form-switch mt-3">
            <input
              type="checkbox"
              role="switch"
              className="form-check-input"
              id="active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="active">Active</label>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        show={Boolean(toDelete)}
        title="Delete department?"
        message={toDelete ? `“${toDelete.deptName}” will be removed. A department that still has employees cannot be deleted.` : ''}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}

export default DepartmentList
