// For now, fake database
const employees = [
  { id: 1, name: "Samuel Okole", role: "Admin" },
  { id: 2, name: "John Smith", role: "Sales" },
  { id: 3, name: "Alice Johnson", role: "HR" }
];

// Service functions
export function getEmployees(filter = {}) {
  let results = employees;

  if (filter.name) {
    const nameLower = filter.name.toLowerCase();
    results = results.filter(e => e.name.toLowerCase().includes(nameLower));
  }

  if (filter.role) {
    results = results.filter(e => e.role === filter.role);
  }

  return results;
}

export function getEmployeeById(id) {
  return employees.find(e => e.id === Number(id));
}
