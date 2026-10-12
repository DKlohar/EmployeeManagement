import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/Navbar'
import EmployeeList from './pages/EmployeeList'
import DepartmentList from './pages/DepartmentList'

function NotFound() {
  return (
    <div className="panel">
      <div className="empty-state">
        <h6>Page not found</h6>
        <p className="mb-3">The page you are looking for does not exist.</p>
        <Link to="/" className="btn btn-primary">Back to Employees</Link>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main className="container-xl py-4">
        <Routes>
          <Route path="/" element={<EmployeeList />} />
          <Route path="/departments" element={<DepartmentList />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App
