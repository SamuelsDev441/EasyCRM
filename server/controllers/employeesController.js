import { getEmployees, getEmployeeById } from "../services/employeesService.js";

export function listEmployees(req, res) {
  const { name, role } = req.query;
  const employees = getEmployees({ name, role });
  res.json(employees);
}

export function showEmployee(req, res) {
  const { id } = req.params;
  const employee = getEmployeeById(id);
  if (!employee) return res.status(404).json({ error: "Employee not found" });
  res.json(employee);
}
