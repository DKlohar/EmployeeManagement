import { useCallback, useEffect, useRef, useState } from 'react'
import { getEmployees, deleteEmployee, getErrorMessage } from '../services/api'
import EmployeeForm from '../components/EmployeeForm'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import Toast from '../components/Toast'
import { Icon } from '../components/Icons'
import useDebounce from '../hooks/useDebounce'
import { initials, avatarColor, formatSalary, formatDate } from '../utils/format'

const PAGE_SIZE = 8

function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, r) => (
    <tr key={r}>
      <td><div className="d-flex align-items-center gap-3">
        <span className="skeleton rounded-circle" style={{ width: 40, height: 40 }} />
        <div className="flex-grow-1"><span className="skeleton mb-2" style={{ width: '60%' }} /><span className="skeleton" style={{ width: '80%' }} /></div>
      </div></td>
      {[1, 2, 3, 4, 5, 6].map((c) => <td key={c}><span className="skeleton" /></td>)}
    </tr>
  ))
}

function EmployeeList() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  // form / delete dialogs
  const [showForm, setShowForm] = useState(false)
  const [editData, setEditData] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // search + pagination (page and search live in ONE object → one request per change)
  const [searchText, setSearchText] = useState('')
  const debouncedSearch = useDebounce(searchText.trim(), 400)
  const [query, setQuery] = useState({ page: 1, search: '' })
  const [meta, setMeta] = useState({ totalPages: 1, totalRecords: 0 })

  const requestId = useRef(0) // ignore out-of-date responses

  const notify = (message, type = 'success') => setToast({ id: Date.now(), message, type })
  const closeToast = useCallback(() => setToast(null), [])

  const loadEmployees = useCallback(async () => {
    const id = ++requestId.current
    try {
      setLoading(true)
      setError('')
      const res = await getEmployees({ pageNumber: query.page, pageSize: PAGE_SIZE, search: query.search })
      if (id !== requestId.current) return
      if (res.data.success) {
        setEmployees(res.data.data.data)
        setMeta({ totalPages: res.data.data.totalPages, totalRecords: res.data.data.totalRecords })
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      if (id === requestId.current) setError(getErrorMessage(err, 'Could not load employees.'))
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [query])

  // new search text → back to page 1
  useEffect(() => {
    setQuery((q) => (q.search === debouncedSearch ? q : { page: 1, search: debouncedSearch }))
  }, [debouncedSearch])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  const goToPage = (page) => setQuery((q) => ({ ...q, page }))

  const handleAdd = () => { setEditData(null); setShowForm(true) }
  const handleEdit = (emp) => { setEditData(emp); setShowForm(true) }
  const closeForm = useCallback(() => setShowForm(false), [])

  const handleSaved = (message, isNew) => {
    notify(message)
    if (isNew) {
      // The API lists newest employees first, so jump to page 1 (and drop any search)
      // to make sure the person just added is visible.
      setSearchText('')
      setQuery({ page: 1, search: '' })
    } else {
      loadEmployees()
    }
  }

  const confirmDelete = async () => {
    if (!toDelete) return
    try {
      setDeleting(true)
      const res = await deleteEmployee(toDelete.encryptedId)
      if (res.data.success) {
        notify(res.data.message)
        // deleted the last row of a later page → step back one page
        if (employees.length === 1 && query.page > 1) goToPage(query.page - 1)
        else loadEmployees()
      } else {
        notify(res.data.message, 'error')
      }
    } catch (err) {
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
          <h1>Employees</h1>
          <p>Manage your team members, their roles and salaries.</p>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2" onClick={handleAdd}>
          <Icon name="plus" size={16} /> Add Employee
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
              placeholder="Search by name or email…"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            {searchText && (
              <button className="clear-btn" onClick={() => setSearchText('')} aria-label="Clear search">
                <Icon name="x" size={14} />
              </button>
            )}
          </div>
          <span className="pill pill-brand">{meta.totalRecords} employee{meta.totalRecords === 1 ? '' : 's'}</span>
        </div>

        {/* error banner */}
        {error && (
          <div className="alert alert-danger rounded-0 mb-0 d-flex justify-content-between align-items-center">
            <span className="d-flex align-items-center gap-2"><Icon name="alert" size={16} /> {error}</span>
            <button className="btn btn-sm btn-outline-danger" onClick={loadEmployees}>
              <Icon name="refresh" size={14} className="me-1" /> Retry
            </button>
          </div>
        )}

        {/* table */}
        <div className="table-responsive">
          <table className="table data-table align-middle">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Salary</th>
                <th>Joined</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <SkeletonRows />
              ) : (
                employees.map((emp) => (
                  <tr key={emp.empId}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar" style={{ background: avatarColor(emp.name) }}>
                          {initials(emp.name)}
                        </div>
                        <div>
                          <div className="cell-title">{emp.name}</div>
                          <div className="cell-sub">{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{emp.phone || '—'}</td>
                    <td>{emp.department ? <span className="pill pill-brand">{emp.department}</span> : '—'}</td>
                    <td>{emp.designation || '—'}</td>
                    <td className="fw-semibold">{formatSalary(emp.salary)}</td>
                    <td className="text-muted">{formatDate(emp.joinDate)}</td>
                    <td className="text-end text-nowrap">
                      <button className="btn btn-sm btn-soft-edit icon-btn me-1" title="Edit" onClick={() => handleEdit(emp)}>
                        <Icon name="edit" size={15} />
                      </button>
                      <button className="btn btn-sm btn-soft-delete icon-btn" title="Delete" onClick={() => setToDelete(emp)}>
                        <Icon name="trash" size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* empty state */}
        {!loading && !error && employees.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><Icon name="inbox" size={28} /></div>
            {query.search ? (
              <>
                <h6>No results for “{query.search}”</h6>
                <p className="mb-3">Try a different name or email.</p>
                <button className="btn btn-light border" onClick={() => setSearchText('')}>Clear search</button>
              </>
            ) : (
              <>
                <h6>No employees yet</h6>
                <p className="mb-3">Add your first team member to get started.</p>
                <button className="btn btn-primary" onClick={handleAdd}>+ Add Employee</button>
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

      <EmployeeForm show={showForm} onClose={closeForm} onSaved={handleSaved} editData={editData} />

      <ConfirmDialog
        show={Boolean(toDelete)}
        title="Delete employee?"
        message={toDelete ? `“${toDelete.name}” will be removed permanently. This cannot be undone.` : ''}
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </>
  )
}

export default EmployeeList
