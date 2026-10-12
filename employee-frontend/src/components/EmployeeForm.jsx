import { useCallback, useEffect, useState } from 'react'
import Modal from './Modal'
import { Icon } from './Icons.jsx'
import {
  getDepartmentOptions, getDesignationOptions, createEmployee, updateEmployee, getErrorMessage
} from '../services/api'

const EMPTY = { name: '', email: '', phone: '', deptId: '', desgId: '', salary: '' }
const MAX_SALARY = 1000000 // same as [Range(0, 1000000)] in your DTOs

function EmployeeForm({ show, onClose, onSaved, editData }) {
  // editData = null → Add mode | editData = employee object → Edit mode
  const isEdit = Boolean(editData)

  const [form, setForm] = useState(EMPTY)
  const [fieldErrors, setFieldErrors] = useState({})
  const [departments, setDepartments] = useState([])
  const [designations, setDesignations] = useState([])
  const [loadingLists, setLoadingLists] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadDropdowns = useCallback(async () => {
    try {
      setLoadingLists(true)
      const [deptRes, desgRes] = await Promise.all([getDepartmentOptions(), getDesignationOptions()])
      if (deptRes.data.success) setDepartments(deptRes.data.data)
      if (desgRes.data.success) setDesignations(desgRes.data.data)
    } catch (err) {
      setError(getErrorMessage(err, 'Could not load departments and designations.'))
    } finally {
      setLoadingLists(false)
    }
  }, [])

  // When the modal opens: fill (or clear) the form, and load the dropdowns once
  useEffect(() => {
    if (!show) return
    setError('')
    setFieldErrors({})
    setForm(
      editData
        ? {
            name: editData.name || '',
            email: editData.email || '',
            phone: editData.phone || '',
            deptId: editData.deptId || '',
            desgId: editData.desgId || '',
            salary: editData.salary ?? ''
          }
        : EMPTY
    )
    if (departments.length === 0 || designations.length === 0) loadDropdowns()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, editData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((fe) => ({ ...fe, [name]: '' }))
  }

  // Same rules as the API DTOs, so users see the problem before the request is sent
  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.email.trim()) errs.email = 'Email is required'
    else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address'
    if (form.phone && !/^[0-9+\-\s]{7,15}$/.test(form.phone.trim())) errs.phone = 'Enter a valid phone number'
    if (form.salary !== '' && (Number(form.salary) < 0 || Number(form.salary) > MAX_SALARY))
      errs.salary = 'Salary must be between 0 and 10,00,000'
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setFieldErrors(errs)
    if (Object.keys(errs).length) return

    setSaving(true)
    setError('')

    // Shape that EmployeeCreateDto / EmployeeUpdateDto expects
    // (empty text → null, dropdown / salary text → numbers)
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      deptId: form.deptId ? Number(form.deptId) : null,
      desgId: form.desgId ? Number(form.desgId) : null,
      salary: form.salary !== '' ? Number(form.salary) : null
    }

    try {
      const res = isEdit
        ? await updateEmployee({ ...payload, empId: editData.empId }) // PUT
        : await createEmployee(payload)                                // POST

      if (res.data.success) {
        onSaved(res.data.message, !isEdit) // 2nd value tells the list "this was a new employee"
        onClose()
      } else {
        setError(res.data.message)
      }
    } catch (err) {
      // API answers 400 with { message: "This email is already registered" } → shown here
      setError(getErrorMessage(err, 'Could not save the employee. Please try again.'))
    } finally {
      setSaving(false)
    }
  }

  const invalid = (field) => (fieldErrors[field] ? 'is-invalid' : '')

  // The dropdowns only contain ACTIVE items. If this employee's department / designation
  // has since been deactivated, keep it visible as an extra option instead of showing blank.
  const missingDept =
    isEdit && editData.deptId && departments.length > 0 &&
    !departments.some((d) => d.deptId === editData.deptId)
  const missingDesg =
    isEdit && editData.desgId && designations.length > 0 &&
    !designations.some((g) => g.desgId === editData.desgId)

  return (
    <Modal
      show={show}
      onClose={saving ? () => {} : onClose}
      title={isEdit ? 'Edit Employee' : 'Add New Employee'}
      size="modal-lg"
      footer={
        <>
          <button type="button" className="btn btn-light border" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="employee-form" className="btn btn-primary px-4" disabled={saving}>
            {saving && <span className="spinner-border spinner-border-sm me-2" />}
            {saving ? 'Saving…' : isEdit ? 'Update Employee' : 'Save Employee'}
          </button>
        </>
      }
    >
      {error && (
        <div className="alert alert-danger py-2 d-flex align-items-center gap-2">
          <Icon name="alert" size={16} /> <span>{error}</span>
        </div>
      )}

      <form id="employee-form" onSubmit={handleSubmit} noValidate>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label" htmlFor="name">Full name *</label>
            <input id="name" name="name" className={`form-control ${invalid('name')}`}
              value={form.name} onChange={handleChange} maxLength="100" placeholder="e.g. Rahul Sharma" autoFocus />
            <div className="invalid-feedback">{fieldErrors.name}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="email">Email *</label>
            <input id="email" name="email" type="email" className={`form-control ${invalid('email')}`}
              value={form.email} onChange={handleChange} maxLength="100" placeholder="name@company.com" />
            <div className="invalid-feedback">{fieldErrors.email}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input id="phone" name="phone" className={`form-control ${invalid('phone')}`}
              value={form.phone} onChange={handleChange} maxLength="15" placeholder="e.g. 9876543210" />
            <div className="invalid-feedback">{fieldErrors.phone}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="salary">Salary (₹)</label>
            <input id="salary" name="salary" type="number" min="0" max={MAX_SALARY}
              className={`form-control ${invalid('salary')}`}
              value={form.salary} onChange={handleChange} placeholder="e.g. 45000" />
            <div className="invalid-feedback">{fieldErrors.salary}</div>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="deptId">Department</label>
            <select id="deptId" name="deptId" className="form-select"
              value={form.deptId} onChange={handleChange} disabled={loadingLists}>
              <option value="">{loadingLists ? 'Loading…' : '— Select department —'}</option>
              {departments.map((d) => (
                <option key={d.deptId} value={d.deptId}>{d.deptName}</option>
              ))}
              {missingDept && (
                <option value={editData.deptId}>{editData.department} (inactive)</option>
              )}
            </select>
          </div>

          <div className="col-md-6">
            <label className="form-label" htmlFor="desgId">Designation</label>
            <select id="desgId" name="desgId" className="form-select"
              value={form.desgId} onChange={handleChange} disabled={loadingLists}>
              <option value="">{loadingLists ? 'Loading…' : '— Select designation —'}</option>
              {designations.map((g) => (
                <option key={g.desgId} value={g.desgId}>{g.title}</option>
              ))}
              {missingDesg && (
                <option value={editData.desgId}>{editData.designation} (inactive)</option>
              )}
            </select>
          </div>
        </div>

        {!loadingLists && (departments.length === 0 || designations.length === 0) && (
          <button type="button" className="btn btn-sm btn-outline-primary mt-3" onClick={loadDropdowns}>
            <Icon name="refresh" size={14} className="me-1" /> Reload dropdowns
          </button>
        )}
      </form>
    </Modal>
  )
}

export default EmployeeForm
