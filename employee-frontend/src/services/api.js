import axios from 'axios'

// API address comes from the .env file (VITE_API_URL).
// If the file is missing it falls back to port 7242.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5075/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
})

// Turns any axios error into one readable message for the user.
export const getErrorMessage = (err, fallback = 'Something went wrong') => {
  const data = err?.response?.data

  // 1) Your own ApiResponse  →  { success: false, message: "email already registered" }
  //    (the API sends this with status 400 for create / update / delete failures)
  if (data?.message) return data.message

  // 2) ASP.NET automatic validation  →  { errors: { Salary: ["..."] } }
  if (data?.errors) {
    const first = Object.values(data.errors).flat()[0]
    if (first) return first
  }

  if (err?.code === 'ECONNABORTED') return 'The request timed out. Please try again.'
  if (!err?.response) return 'Cannot reach the server. Please make sure the API is running.'
  return fallback
}

// ── Employees  (EmployeesController) ───────────
// GET /employees?pageNumber=1&pageSize=8&search=rahul
export const getEmployees = (params) => api.get('/employees', { params })
export const getEmployeeById = (encryptedId) => api.get(`/employees/${encryptedId}`)
export const createEmployee = (data) => api.post('/employees', data)
export const updateEmployee = (data) => api.put('/employees', data) // body must contain empId
// Delete uses the encryptedId that comes with every employee in the list
export const deleteEmployee = (encryptedId) => api.delete(`/employees/${encryptedId}`)

// Dropdown lists for the employee form (API returns ACTIVE items only)
export const getDepartmentOptions = () => api.get('/employees/departments')
export const getDesignationOptions = () => api.get('/employees/designations')

// ── Departments  (DepartmentsController) ───────
// GET /departments?pageNumber=1&pageSize=8&search=IT
export const getDepartments = (params) => api.get('/departments', { params })
export const getDepartmentById = (deptId) => api.get(`/departments/${deptId}`)
export const createDepartment = (data) => api.post('/departments', data)
export const updateDepartment = (data) => api.put('/departments', data)
export const deleteDepartment = (deptId) => api.delete(`/departments/${deptId}`)

export default api
