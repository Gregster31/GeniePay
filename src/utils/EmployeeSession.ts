import type { Employee } from '@/models/EmployeeModel';

// Session storage: Survives reloads but cleas when the tab is closed
const SESSION_EMPLOYEES_KEY = 'geniepay_employees';

// Serialize employees to sessionStorage (dates need special handling)
export const saveEmployeesToSession = (employees: Employee[]): void => {
  sessionStorage.setItem(SESSION_EMPLOYEES_KEY, JSON.stringify(employees));
};

// Deserialize from sessionStorage, restoring Date objects
export const loadEmployeesFromSession = (): Employee[] | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_EMPLOYEES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as (Omit<Employee, 'dateAdded'> & { dateAdded: string })[];
    return parsed.map(emp => ({ ...emp, dateAdded: new Date(emp.dateAdded) }));
  } catch {
    return null;
  }
};

// Clear on explicit logout
export const clearEmployeesFromSession = (): void => {
  sessionStorage.removeItem(SESSION_EMPLOYEES_KEY);
};