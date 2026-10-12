import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Icon } from './Icons'

function Navbar() {
  // React state instead of Bootstrap JS, so the mobile menu works without extra scripts
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <nav className="navbar navbar-expand-lg navbar-dark app-navbar sticky-top">
      <div className="container-xl">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/" onClick={close}>
          <span className="brand-badge"><Icon name="users" size={18} /></span>
          EmployeeHub
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${open ? 'show' : ''}`}>
          <ul className="navbar-nav ms-auto gap-lg-1 pt-2 pt-lg-0">
            <li className="nav-item">
              <NavLink end className="nav-link d-flex align-items-center gap-2" to="/" onClick={close}>
                <Icon name="users" size={16} /> Employees
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link d-flex align-items-center gap-2" to="/departments" onClick={close}>
                <Icon name="building" size={16} /> Departments
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
